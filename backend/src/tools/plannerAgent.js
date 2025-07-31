import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();

/**
 * Planner Agent - แยกงานใหญ่เป็นงานย่อยและสร้างแผนการทำงาน
 */
class PlannerAgent {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
    this.notionHeaders = {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    };
  }

  /**
   * วิเคราะห์งานหลักและแยกเป็นงานย่อย
   */
  async analyzeAndBreakdownTask(taskId) {
    console.log(`🤖 Planner Agent: วิเคราะห์งาน ${taskId}`);
    
    try {
      // 1. ดึงข้อมูลงานหลักจาก Notion
      const taskData = await this.getTaskFromNotion(taskId);
      if (!taskData) {
        throw new Error('ไม่พบข้อมูลงาน');
      }

      console.log(`📋 งานหลัก: ${taskData.name}`);
      console.log(`📝 รายละเอียด: ${taskData.description}`);

      // 2. ใช้ AI วิเคราะห์และแยกงาน
      const breakdown = await this.aiBreakdownTask(taskData);
      
      // 3. สร้าง Sub-tasks ใน Notion
      const createdSubtasks = await this.createSubtasks(taskId, breakdown.subtasks);
      
      // 4. อัพเดทงานหลักให้เชื่อมโยงกับ Sub-tasks
      await this.updateMainTaskWithSubtasks(taskId, createdSubtasks);

      return {
        mainTask: taskData,
        breakdown: breakdown,
        subtasks: createdSubtasks,
        summary: `สร้าง ${createdSubtasks.length} งานย่อยสำเร็จ`
      };

    } catch (error) {
      console.error('❌ Planner Agent Error:', error.message);
      throw error;
    }
  }

  /**
   * ดึงข้อมูลงานจาก Notion
   */
  async getTaskFromNotion(taskId) {
    try {
      const response = await fetch(`https://api.notion.com/v1/pages/${taskId}`, {
        headers: this.notionHeaders
      });

      if (!response.ok) {
        throw new Error(`ไม่สามารถดึงข้อมูลงานได้: ${response.statusText}`);
      }

      const page = await response.json();
      
      return {
        id: page.id,
        name: page.properties.Name?.title?.[0]?.text?.content || 'ไม่มีชื่อ',
        description: page.properties.Description?.rich_text?.[0]?.text?.content || 
                    page.properties.รายละเอียดงาน?.rich_text?.[0]?.text?.content || 'ไม่มีรายละเอียด',
        priority: page.properties.Priority?.select?.name || 'P3',
        type: page.properties.Type?.select?.name || 'management',
        dueDate: page.properties['Due Date']?.date?.start || null,
        project: page.properties.Project?.relation?.[0]?.id || null
      };
    } catch (error) {
      console.error('❌ Error fetching task:', error.message);
      return null;
    }
  }

  /**
   * ใช้ AI แยกงานเป็นขั้นตอนย่อย
   */
  async aiBreakdownTask(taskData) {
    const prompt = `
คุณเป็น AI Planner Agent ที่เชี่ยวชาญในการแยกงานซับซ้อนเป็นงานย่อยที่จัดการได้

งานหลัก: "${taskData.name}"
รายละเอียด: "${taskData.description}"
ความสำคัญ: ${taskData.priority}
ประเภท: ${taskData.type}
กำหนดส่ง: ${taskData.dueDate || 'ไม่ระบุ'}

โปรดแยกงานนี้เป็นงานย่อย 3-7 ขั้นตอน โดยคำนึงถึง:
1. ลำดับการทำงานที่เหมาะสม
2. การประมาณเวลาที่ใช้
3. ความพึ่งพิงระหว่างงาน
4. ความเสี่ยงที่อาจเกิดขึ้น

ตอบกลับในรูปแบบ JSON:
{
  "analysis": "การวิเคราะห์งานหลัก",
  "estimatedTotalDays": จำนวนวันที่คาดว่าจะใช้,
  "riskLevel": "Low/Medium/High",
  "subtasks": [
    {
      "name": "ชื่องานย่อย",
      "description": "รายละเอียดงานย่อย", 
      "estimatedDays": จำนวนวันที่คาดว่าจะใช้,
      "priority": "P1 🔥/P2/P3/P4",
      "dependencies": ["ชื่องานที่ต้องทำก่อน"], 
      "risks": "ความเสี่ยงที่อาจเกิด"
    }
  ],
  "recommendations": ["คำแนะนำการทำงาน"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // ดึง JSON จากการตอบกลับของ AI
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI ไม่ส่งคืนข้อมูลในรูปแบบ JSON ที่ถูกต้อง');
      }

      const breakdown = JSON.parse(jsonMatch[0]);
      console.log(`🧠 AI Analysis: ${breakdown.analysis}`);
      console.log(`⏱️ ประมาณเวลาทั้งหมด: ${breakdown.estimatedTotalDays} วัน`);
      console.log(`⚠️ ระดับความเสี่ยง: ${breakdown.riskLevel}`);
      
      return breakdown;
    } catch (error) {
      console.error('❌ AI Breakdown Error:', error.message);
      // Fallback: สร้างงานย่อยพื้นฐาน
      return this.createFallbackBreakdown(taskData);
    }
  }

  /**
   * สร้างงานย่อยใน Notion
   */
  async createSubtasks(mainTaskId, subtasks) {
    console.log(`📝 สร้าง ${subtasks.length} งานย่อย...`);
    const createdTasks = [];

    for (let i = 0; i < subtasks.length; i++) {
      const subtask = subtasks[i];
      console.log(`${i + 1}. สร้าง: ${subtask.name}`);

      try {
        const response = await fetch(`https://api.notion.com/v1/pages`, {
          method: 'POST',
          headers: this.notionHeaders,
          body: JSON.stringify({
            parent: {
              database_id: process.env.NOTION_TASKS_DB_ID
            },
            properties: {
              "Name": {
                title: [{ text: { content: subtask.name } }]
              },
              "Description": {
                rich_text: [{ text: { content: subtask.description } }]
              },
              "Priority": {
                select: { name: subtask.priority }
              },
              "Type": {
                select: { name: "management" }
              },
              "Status": {
                status: { name: "ยังไม่เริ่ม" }
              },
              "Due Date": {
                date: subtask.dueDate ? { start: subtask.dueDate } : null
              },
              "ความเห็นการติดตาม": {
                rich_text: [{ text: { content: `ความเสี่ยง: ${subtask.risks}\nประมาณเวลา: ${subtask.estimatedDays} วัน` } }]
              }
            }
          })
        });

        if (response.ok) {
          const created = await response.json();
          createdTasks.push({
            id: created.id,
            name: subtask.name,
            estimatedDays: subtask.estimatedDays
          });
          console.log(`   ✅ สร้างสำเร็จ - ID: ${created.id}`);
        } else {
          console.log(`   ❌ ไม่สามารถสร้างได้: ${response.statusText}`);
        }

        // หน่วงเวลาเล็กน้อย
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.error(`   ❌ Error creating subtask: ${error.message}`);
      }
    }

    return createdTasks;
  }

  /**
   * อัพเดทงานหลักให้เชื่อมโยงกับงานย่อย
   */
  async updateMainTaskWithSubtasks(mainTaskId, subtasks) {
    try {
      const subtaskIds = subtasks.map(task => ({ id: task.id }));
      const summary = `แบ่งเป็น ${subtasks.length} งานย่อย:\n${subtasks.map(t => `• ${t.name} (${t.estimatedDays} วัน)`).join('\n')}`;

      const response = await fetch(`https://api.notion.com/v1/pages/${mainTaskId}`, {
        method: 'PATCH',
        headers: this.notionHeaders,
        body: JSON.stringify({
          properties: {
            "Sub-tasks": {
              relation: subtaskIds
            },
            "ความเห็นการติดตาม": {
              rich_text: [{ text: { content: summary } }]
            },
            "Status": {
              status: { name: "วางแผน" }
            }
          }
        })
      });

      if (response.ok) {
        console.log('✅ อัพเดทงานหลักสำเร็จ');
      }
    } catch (error) {
      console.error('❌ Error updating main task:', error.message);
    }
  }

  /**
   * สร้างงานย่อยพื้นฐานในกรณี AI ล้มเหลว
   */
  createFallbackBreakdown(taskData) {
    return {
      analysis: "การแยกงานอัตโนมัติ (Fallback)",
      estimatedTotalDays: 7,
      riskLevel: "Medium",
      subtasks: [
        {
          name: `📋 วางแผน: ${taskData.name}`,
          description: "วางแผนและเตรียมการทำงาน",
          estimatedDays: 1,
          priority: "P2",
          dependencies: [],
          risks: "อาจขาดข้อมูลที่จำเป็น"
        },
        {
          name: `🔨 พัฒนา: ${taskData.name}`,
          description: "ดำเนินการพัฒนาตามแผน",
          estimatedDays: 4,
          priority: "P1 🔥",
          dependencies: ["วางแผน"],
          risks: "ปัญหาทางเทคนิค"
        },
        {
          name: `✅ ทดสอบ: ${taskData.name}`,
          description: "ทดสอบและแก้ไขปัญหา",
          estimatedDays: 2,
          priority: "P2",
          dependencies: ["พัฒนา"],
          risks: "พบข้อบกพร่อง"
        }
      ],
      recommendations: ["ติดตามความคืบหน้าอย่างใกล้ชิด", "เตรียมแผนสำรองไว้"]
    };
  }
}

export default PlannerAgent;
