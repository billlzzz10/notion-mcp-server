import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();

/**
 * Smart Data Enhancement Agent - ปรับปรุงข้อมูลโครงการอย่างชาญฉลาด
 * โดยใช้ข้อมูลที่มีอยู่แล้วเป็นหลัก และให้ผู้ใช้กรอกเฉพาะส่วนที่จำเป็น
 */
class SmartDataEnhancementAgent {
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
   * วิเคราะห์และปรับปรุงข้อมูลโครงการ
   */
  async enhanceProjectData() {
    console.log('🤖 Smart Data Enhancement Agent: เริ่มปรับปรุงข้อมูลโครงการ');
    console.log('=================================================================');

    try {
      // 1. ดึงข้อมูล Projects ทั้งหมด
      const projects = await this.getAllProjects();
      console.log(`📊 พบ ${projects.length} Projects`);

      // 2. วิเคราะห์และแนะนำการปรับปรุงแต่ละโครงการ
      const enhancements = [];
      for (const project of projects) {
        console.log(`\n🔍 วิเคราะห์ Project: "${project.name}"`);
        const enhancement = await this.analyzeProjectForEnhancement(project);
        if (enhancement.needsUpdate) {
          enhancements.push(enhancement);
        }
      }

      // 3. แสดงผลลัพธ์และข้อเสนอแนะ
      this.displayEnhancements(enhancements);

      // 4. ให้ผู้ใช้เลือกว่าจะอัปเดตโครงการไหน
      if (enhancements.length > 0) {
        console.log('\n💡 คำแนะนำ: ใช้คำสั่งด้านล่างเพื่ออัปเดตโครงการที่ต้องการ');
        console.log('   node update-project.js <project-id>');
      }

      return enhancements;

    } catch (error) {
      console.error('❌ Smart Enhancement Error:', error.message);
      throw error;
    }
  }

  /**
   * วิเคราะห์โครงการเพื่อหาจุดปรับปรุง
   */
  async analyzeProjectForEnhancement(project) {
    const prompt = `
คุณเป็น Project Enhancement Expert ที่ช่วยปรับปรุงข้อมูลโครงการให้สมบูรณ์และมีประโยชน์

ข้อมูลโครงการปัจจุบัน:
- ชื่อ: "${project.name}"
- สถานะ: ${project.status}
- ความสำคัญ: ${project.priority}
- ประเภท: ${project.type}
- กำหนดส่ง: ${project.dueDate || 'ไม่ระบุ'}
- ความคืบหน้า: ${project.progress}%
- รายละเอียด: "${project.description}"
- แท็ก: ${project.tags.join(', ') || 'ไม่มี'}
- สร้างเมื่อ: ${new Date(project.created_time).toLocaleDateString('th-TH')}
- แก้ไขล่าสุด: ${new Date(project.last_edited_time).toLocaleDateString('th-TH')}

บริบทของผู้ใช้:
- เป็นนักพัฒนาคนเดียว (ไม่ต้องระบุผู้รับผิดชอบ)
- ใช้โอเพนซอร์ส ค่าใช้จ่าย AI รายเดือนเฉลี่ยไม่กี่บาท (ไม่ต้องระบุงบประมาณ)
- มีเอกสารเชื่อมโยงอยู่แล้วแต่ยังไม่ได้นำมาใช้ (ไม่ต้องเสนอเอกสารเพิ่ม)

โปรดวิเคราะห์และเสนอการปรับปรุงในรูปแบบ JSON:
{
  "needsUpdate": true/false,
  "suggestedName": "ชื่อใหม่ที่เฉพาะเจาะจง (หากจำเป็น)",
  "suggestedDescription": "รายละเอียดที่ควรเพิ่ม (หากขาด)",
  "suggestedDueDate": "วันที่แนะนำ YYYY-MM-DD (หากไม่มี)",
  "suggestedNote": "หมายเหตุเกี่ยวกับเหตุผลหยุด/ยกเลิก (หากจำเป็น)",
  "reasoning": "เหตุผลการเปลี่ยนแปลง",
  "priority": "High/Medium/Low ความสำคัญของการอัปเดต",
  "improvements": [
    {
      "field": "ชื่อฟิลด์",
      "current": "ค่าปัจจุบัน",
      "suggested": "ค่าที่แนะนำ",
      "reason": "เหตุผล"
    }
  ]
}

กรณีพิเศษ:
- หากโครงการมีชื่อคลุมเครือ เช่น "การจัดการ" ให้เสนอชื่อที่เฉพาะเจาะจง
- หากโครงการสถานะ "หยุด" หรือ "ยกเลิก" แต่ไม่มีเหตุผล ให้เสนอหมายเหตุ
- หากไม่มีกำหนดส่งและโครงการยังดำเนินการ ให้เสนอวันที่สมเหตุสมผล
- หากรายละเอียดว่างเปล่า ให้เสนอรายละเอียดที่เหมาะสมจากชื่อโครงการ`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.createFallbackEnhancement(project);
      }

      const enhancement = JSON.parse(jsonMatch[0]);
      enhancement.projectId = project.id;
      enhancement.projectName = project.name;
      enhancement.currentData = project;
      
      return enhancement;
    } catch (error) {
      console.error(`❌ Error analyzing project ${project.name}:`, error.message);
      return this.createFallbackEnhancement(project);
    }
  }

  /**
   * ดึงข้อมูล Projects ทั้งหมด
   */
  async getAllProjects() {
    try {
      const response = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_PROJECTS_DB_ID}/query`, {
        method: 'POST',
        headers: this.notionHeaders,
        body: JSON.stringify({
          page_size: 100
        })
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data.results.map(project => ({
        id: project.id,
        name: project.properties.Name?.title?.[0]?.text?.content || 'ไม่มีชื่อ',
        status: project.properties.Status?.select?.name || 'ไม่ระบุ',
        priority: project.properties.Priority?.select?.name || 'ไม่ระบุ',
        type: project.properties.Type?.select?.name || 'ไม่ระบุ',
        dueDate: project.properties['วันส่งมอบ']?.date?.start || null,
        startDate: project.properties['Start Date']?.created_time || null,
        progress: project.properties.Progress?.rollup?.number || 0,
        description: project.properties.Text?.rich_text?.[0]?.text?.content || '',
        tags: project.properties.Tag?.multi_select?.map(tag => tag.name) || [],
        note: project.properties.Note?.rich_text?.[0]?.text?.content || '',
        created_time: project.created_time,
        last_edited_time: project.last_edited_time
      }));
    } catch (error) {
      console.error('❌ Error fetching projects:', error.message);
      return [];
    }
  }

  /**
   * แสดงผลการเสนอแนะ
   */
  displayEnhancements(enhancements) {
    if (enhancements.length === 0) {
      console.log('\n✅ ข้อมูลโครงการทั้งหมดสมบูรณ์แล้ว ไม่จำเป็นต้องปรับปรุง');
      return;
    }

    console.log('\n🎯 การปรับปรุงที่แนะนำ');
    console.log('=========================');

    // จัดกลุ่มตามความสำคัญ
    const highPriority = enhancements.filter(e => e.priority === 'High');
    const mediumPriority = enhancements.filter(e => e.priority === 'Medium');
    const lowPriority = enhancements.filter(e => e.priority === 'Low');

    if (highPriority.length > 0) {
      console.log('\n🚨 ความสำคัญสูง (แนะนำให้แก้ไขก่อน):');
      highPriority.forEach(this.displaySingleEnhancement.bind(this));
    }

    if (mediumPriority.length > 0) {
      console.log('\n⚠️ ความสำคัญปานกลาง:');
      mediumPriority.forEach(this.displaySingleEnhancement.bind(this));
    }

    if (lowPriority.length > 0) {
      console.log('\n💡 ความสำคัญต่ำ (ปรับปรุงเมื่อมีเวลา):');
      lowPriority.forEach(this.displaySingleEnhancement.bind(this));
    }

    console.log(`\n📊 สรุป: พบ ${enhancements.length} โครงการที่ควรปรับปรุง`);
    console.log(`   🚨 สำคัญ: ${highPriority.length} | ⚠️ ปานกลาง: ${mediumPriority.length} | 💡 ต่ำ: ${lowPriority.length}`);
  }

  /**
   * แสดงการปรับปรุงแต่ละโครงการ
   */
  displaySingleEnhancement(enhancement) {
    console.log(`\n📁 Project: ${enhancement.projectName}`);
    console.log(`   ID: ${enhancement.projectId}`);
    console.log(`   เหตุผล: ${enhancement.reasoning}`);
    
    enhancement.improvements.forEach(improvement => {
      console.log(`   
   🔧 ${improvement.field}:`);
      console.log(`      ปัจจุบัน: "${improvement.current}"`);
      console.log(`      แนะนำ: "${improvement.suggested}"`);
      console.log(`      เหตุผล: ${improvement.reason}`);
    });
  }

  /**
   * สร้างการปรับปรุงพื้นฐานในกรณี AI ล้มเหลว
   */
  createFallbackEnhancement(project) {
    const improvements = [];
    let needsUpdate = false;

    // ตรวจสอบชื่อโครงการ
    if (project.name.length < 5 || ['การจัดการ', 'webpage', 'Novel'].includes(project.name)) {
      improvements.push({
        field: "Name",
        current: project.name,
        suggested: `${project.name} - [เพิ่มรายละเอียดเฉพาะ]`,
        reason: "ชื่อโครงการไม่เฉพาะเจาะจง"
      });
      needsUpdate = true;
    }

    // ตรวจสอบรายละเอียด
    if (!project.description || project.description.length < 10) {
      improvements.push({
        field: "Description",
        current: project.description || "ว่างเปล่า",
        suggested: "[รอการเติมรายละเอียดโดย AI ของ Notion]",
        reason: "ไม่มีรายละเอียดโครงการ"
      });
      needsUpdate = true;
    }

    // ตรวจสอบกำหนดส่ง
    if (!project.dueDate && !['ยกเลิก', 'หยุด', 'เสร็จสิ้น'].includes(project.status)) {
      improvements.push({
        field: "Due Date",
        current: "ไม่ระบุ",
        suggested: "[ให้ Forecast Agent แนะนำ]",
        reason: "โครงการที่ยังดำเนินการควรมีกำหนดส่ง"
      });
      needsUpdate = true;
    }

    return {
      projectId: project.id,
      projectName: project.name,
      needsUpdate,
      reasoning: "การตรวจสอบพื้นฐาน",
      priority: "Medium",
      improvements,
      currentData: project
    };
  }

  /**
   * อัปเดตโครงการตาม ID
   */
  async updateProject(projectId, updates) {
    console.log(`🔄 กำลังอัปเดต Project ID: ${projectId}`);
    
    try {
      const updateData = {
        properties: {}
      };

      // เตรียมข้อมูลสำหรับอัปเดต
      if (updates.name) {
        updateData.properties.Name = {
          title: [{ text: { content: updates.name } }]
        };
      }

      if (updates.description) {
        updateData.properties.Text = {
          rich_text: [{ text: { content: updates.description } }]
        };
      }

      if (updates.dueDate) {
        updateData.properties['วันส่งมอบ'] = {
          date: { start: updates.dueDate }
        };
      }

      if (updates.note) {
        updateData.properties.Note = {
          rich_text: [{ text: { content: updates.note } }]
        };
      }

      const response = await fetch(`https://api.notion.com/v1/pages/${projectId}`, {
        method: 'PATCH',
        headers: this.notionHeaders,
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        console.log('✅ อัปเดตเสร็จสิ้น');
        return true;
      } else {
        console.error('❌ ไม่สามารถอัปเดตได้:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการอัปเดต:', error.message);
      return false;
    }
  }
}

export default SmartDataEnhancementAgent;
