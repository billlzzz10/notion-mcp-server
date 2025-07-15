import SmartDataEnhancementAgent from './src/tools/smartDataEnhancementAgent.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Auto Update Agent - ระบบอัปเดตข้อมูลโครงการอัตโนมัติ
 * จุดประสงค์หลัก: ช่วยลดงานการอัปเดตข้อมูลให้ทำอัตโนมัติ
 * รวมถึง Forecast Agent สำหรับวิเคราะห์กำหนดส่งและจับคู่งาน
 */
class AutoUpdateAgent {
  constructor() {
    this.enhancementAgent = new SmartDataEnhancementAgent();
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
    this.notionHeaders = {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    };
  }

  /**
   * อัปเดตโครงการอัตโนมัติตามความสำคัญ
   */
  async autoUpdateProjects() {
    console.log('🤖 Auto Update Agent: เริ่มอัปเดตอัตโนมัติ');
    console.log('===============================================');
    
    try {
      // 1. วิเคราะห์โครงการทั้งหมด
      const enhancements = await this.enhancementAgent.enhanceProjectData();
      
      if (enhancements.length === 0) {
        console.log('✅ ไม่มีโครงการที่ต้องอัปเดต');
        return;
      }

      // 2. ดึงข้อมูล Tasks ทั้งหมดเพื่อจับคู่กับโปรเจค
      console.log('\n🔗 ดึงข้อมูล Tasks เพื่อจับคู่กับโปรเจค...');
      const allTasks = await this.getAllTasks();
      console.log(`📋 พบ ${allTasks.length} Tasks`);

      // 3. วิเคราะห์ด้วย Forecast Agent
      console.log('\n🔮 Forecast Agent: วิเคราะห์กำหนดส่งและจับคู่งาน...');
      const forecastAnalysis = await this.analyzeForecastForProjects(enhancements, allTasks);

      // 4. จัดกลุ่มและเรียงลำดับความสำคัญ
      const prioritized = this.prioritizeUpdates(enhancements);
      
      // 5. อัปเดตโครงการพิเศษก่อน (webpage + Dashboard Template)
      await this.handleSpecialProjects(prioritized, forecastAnalysis);
      
      // 6. อัปเดตโครงการอื่นๆ ตามลำดับ
      await this.updateRegularProjects(prioritized, forecastAnalysis);
      
      console.log('\n🎉 อัปเดตอัตโนมัติเสร็จสิ้น!');
      
    } catch (error) {
      console.error('❌ Auto Update Error:', error.message);
    }
  }

  /**
   * จัดลำดับความสำคัญของการอัปเดต
   */
  prioritizeUpdates(enhancements) {
    const special = []; // webpage, Dashboard Template
    const active = []; // โครงการที่กำลังทำ
    const paused = []; // โครงการที่หยุด
    const planning = []; // โครงการที่วางแผน

    enhancements.forEach(enhancement => {
      const name = enhancement.projectName.toLowerCase();
      const status = enhancement.currentData.status;

      // โครงการพิเศษ
      if (name.includes('webpage') || name.includes('dashboard template')) {
        special.push(enhancement);
      }
      // โครงการตามสถานะ
      else if (status === 'กำลังดำเนินการ' || status === 'In Progress') {
        active.push(enhancement);
      }
      else if (status === 'หยุด' || status === 'ยกเลิก') {
        paused.push(enhancement);
      }
      else {
        planning.push(enhancement);
      }
    });

    return { special, active, planning, paused };
  }

  /**
   * จัดการโครงการพิเศษ (webpage + Dashboard Template)
   */
  async handleSpecialProjects(prioritized, forecastAnalysis) {
    if (prioritized.special.length === 0) return;

    console.log('\n🎯 อัปเดตโครงการพิเศษ');
    console.log('========================');

    for (const enhancement of prioritized.special) {
      const name = enhancement.projectName.toLowerCase();
      const forecast = forecastAnalysis[enhancement.projectId]?.forecast;
      
      if (name.includes('webpage')) {
        await this.updateWebpageProject(enhancement, forecast);
      }
      else if (name.includes('dashboard template')) {
        await this.updateDashboardProject(enhancement, forecast);
      }
    }
  }

  /**
   * อัปเดตโครงการ webpage เป็นแลนดิ้งเพจ + E-book Marketing
   */
  async updateWebpageProject(enhancement, forecast) {
    console.log('🌐 อัปเดต Webpage Project เป็น Landing Page + E-book Marketing');
    
    // สร้างหมายเหตุจาก Forecast Analysis
    let noteContent = '';
    if (forecast) {
      noteContent = `
🔮 Forecast Analysis:
- กำหนดส่งที่แนะนำ: ${forecast.suggestedDueDate || 'ไม่ระบุ'}
- ความเสี่ยง: ${forecast.riskLevel}
- ความเป็นไปได้: ${forecast.feasibility}
- เหตุผล: ${forecast.reasoning}

⚠️ หมายเหตุ AI: ${forecast.note || 'ไม่มี'}

📋 รวมเข้ากับ MCP Project เพื่อสร้าง Marketing Automation System ที่สมบูรณ์`;
    } else {
      noteContent = '⚠️ ไม่สามารถวิเคราะห์ Forecast ได้ - ข้อมูลไม่เพียงพอ\n📋 รวมเข้ากับ MCP Project เพื่อสร้าง Marketing Automation System ที่สมบูรณ์';
    }

    const updates = {
      name: "Landing Page + E-book Marketing System",
      description: `พัฒนาแลนดิ้งเพจสำหรับโปรโมต MCP Server พร้อมระบบ E-book Marketing อัตโนมัติ
      
📈 วัตถุประสงค์:
- สร้างแลนดิ้งเพจที่ดึงดูดผู้ใช้ใหม่
- ใช้ E-book ฟรีเป็นตัวดึงดูด Lead
- เก็บข้อมูล Contact ของผู้สนใจ
- ทำ SEO เพื่อเพิ่มการมองเห็น

🛠️ ฟีเจอร์หลัก:
- Landing Page ที่สวยงามและ Responsive
- E-book Download Form พร้อม Lead Capture
- Email Marketing Integration (อนาคต)
- Analytics Dashboard (รวมกับ MCP)
- SEO Optimization Tools

🎯 เป้าหมาย: สร้างระบบ Marketing Funnel อัตโนมัติที่ทำงานแทนคุณ 24/7

⏰ สถานะ: รอการพัฒนา (จะทำหลังจาก MCP Core เสร็จ)`,
      
      dueDate: forecast?.suggestedDueDate || "2026-03-31",
      note: noteContent
    };

    const success = await this.enhancementAgent.updateProject(enhancement.projectId, updates);
    if (success) {
      console.log('  ✅ อัปเดต Webpage Project เสร็จสิ้น');
    } else {
      console.log('  ❌ ไม่สามารถอัปเดต Webpage Project ได้');
    }
  }

  /**
   * อัปเดตโครงการ Dashboard Template รวมเข้ากับ MCP
   */
  async updateDashboardProject(enhancement, forecast) {
    console.log('📊 อัปเดต Dashboard Template รวมเข้ากับ MCP');
    
    // สร้างหมายเหตุจาก Forecast Analysis
    let noteContent = '';
    if (forecast) {
      noteContent = `
🔮 Forecast Analysis:
- กำหนดส่งที่แนะนำ: ${forecast.suggestedDueDate || 'ไม่ระบุ'}
- ความเสี่ยง: ${forecast.riskLevel}
- ความเป็นไปได้: ${forecast.feasibility}
- เหตุผล: ${forecast.reasoning}

⚠️ หมายเหตุ AI: ${forecast.note || 'ไม่มี'}

📋 รวมเข้ากับ MCP Project เป็น AI Dashboard Generator - ช่วยสร้าง Template อัตโนมัติสำหรับทุกโครงการ`;
    } else {
      noteContent = '⚠️ ไม่สามารถวิเคราะห์ Forecast ได้ - ข้อมูลไม่เพียงพอ\n📋 รวมเข้ากับ MCP Project เป็น AI Dashboard Generator';
    }
    
    const updates = {
      name: "MCP Dashboard Templates & Project Layouts",
      description: `พัฒนาระบบสร้าง Dashboard Template อัตโนมัติสำหรับโครงการต่างๆ ภายใน MCP Server
      
🎨 วัตถุประสงค์:
- AI สร้างแบบร่าง Dashboard ตามประเภทโครงการ
- Template ที่สวยงามและใช้งานง่าย
- ปรับแต่งได้ตามความต้องการเฉพาะ
- ลดเวลาการออกแบบ Layout

🤖 ฟีเจอร์ AI:
- วิเคราะห์ประเภทโครงการแล้วเสนอ Template ที่เหมาะสม
- สร้าง Widget และ Component อัตโนมัติ
- จัด Layout ให้สวยงามและไม่เกะกะ
- เสนอ Color Scheme และ Typography

📈 ประโยชน์:
- ประหยัดเวลาออกแบบ 80%
- Dashboard ที่สวยงามและใช้งานง่าย
- Template หลากหลายสำหรับโครงการแต่ละประเภท
- AI ช่วยปรับปรุงให้เหมาะสมตลอดเวลา

🔧 รวมเข้ากับ: Notion MCP Server v3.0 AI Agent Framework
⏰ สถานะ: รวมเข้าเป็นส่วนหนึ่งของ MCP Core`,
      
      dueDate: forecast?.suggestedDueDate || "2025-12-31",
      note: noteContent
    };

    const success = await this.enhancementAgent.updateProject(enhancement.projectId, updates);
    if (success) {
      console.log('  ✅ อัปเดต Dashboard Template เสร็จสิ้น');
    } else {
      console.log('  ❌ ไม่สามารถอัปเดต Dashboard Template ได้');
    }
  }

  /**
   * อัปเดตโครงการทั่วไปตามลำดับความสำคัญ
   */
  async updateRegularProjects(prioritized, forecastAnalysis) {
    console.log('\n🔄 อัปเดตโครงการทั่วไป');
    console.log('=======================');

    // อัปเดตโครงการที่กำลังทำก่อน
    await this.updateProjectGroup(prioritized.active, 'โครงการที่กำลังดำเนินการ', forecastAnalysis);
    
    // อัปเดตโครงการที่วางแผน
    await this.updateProjectGroup(prioritized.planning, 'โครงการที่วางแผน', forecastAnalysis);
    
    // อัปเดตโครงการที่หยุด/ยกเลิก (ใส่เหตุผล)
    await this.updateProjectGroup(prioritized.paused, 'โครงการที่หยุด/ยกเลิก', forecastAnalysis);
  }

  /**
   * อัปเดตกลุ่มโครงการ
   */
  async updateProjectGroup(projects, groupName, forecastAnalysis) {
    if (projects.length === 0) return;

    console.log(`\n📁 ${groupName} (${projects.length} โครงการ)`);
    
    for (const enhancement of projects) {
      const projectId = enhancement.projectId;
      const analysis = forecastAnalysis[projectId];
      
      const updates = this.prepareBasicUpdates(enhancement, analysis);
      
      console.log(`   🔄 ${enhancement.projectName}...`);
      
      // แสดงข้อมูล Tasks ที่เชื่อมโยง
      if (analysis?.relatedTasks?.length > 0) {
        console.log(`   📋 พบ ${analysis.relatedTasks.length} งานที่เชื่อมโยง`);
        
        // แสดงงานที่ขาดข้อมูล
        if (analysis.taskAnalysis?.emptyFieldCount > 0) {
          console.log(`   ⚠️  มี ${analysis.taskAnalysis.emptyFieldCount} งานขาดข้อมูล`);
        }
      }
      
      const success = await this.enhancementAgent.updateProject(enhancement.projectId, updates);
      
      if (success) {
        console.log(`   ✅ อัปเดตเสร็จสิ้น`);
      } else {
        console.log(`   ❌ ไม่สามารถอัปเดตได้`);
      }
      
      // รอเล็กน้อยเพื่อไม่ให้ API rate limit
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  /**
   * เตรียมข้อมูลอัปเดตพื้นฐาน
   */
  prepareBasicUpdates(enhancement, analysis) {
    const updates = {};
    
    // อัปเดตเฉพาะสิ่งที่จำเป็นจริงๆ
    enhancement.improvements.forEach(improvement => {
      switch (improvement.field) {
        case 'ชื่อ':
        case 'Name':
          if (improvement.suggested && improvement.suggested !== improvement.current) {
            updates.name = improvement.suggested;
          }
          break;
          
        case 'รายละเอียด':
        case 'Description':
          if (improvement.suggested && improvement.suggested !== improvement.current) {
            updates.description = improvement.suggested;
          }
          break;
          
        case 'กำหนดส่ง':
        case 'Due Date':
          if (improvement.suggested && improvement.suggested !== 'ไม่ระบุ') {
            updates.dueDate = improvement.suggested;
          }
          break;
          
        case 'หมายเหตุ':
        case 'Note':
          if (improvement.suggested && improvement.suggested !== improvement.current) {
            updates.note = improvement.suggested;
          }
          break;
      }
    });
    
    // เพิ่มข้อมูล Forecast Analysis
    if (analysis) {
      let forecastNotes = [];
      
      // เพิ่มหมายเหตุจากการวิเคราะห์
      if (analysis.timelineAnalysis) {
        forecastNotes.push(`📊 การวิเคราะห์กำหนดเวลา: ${analysis.timelineAnalysis}`);
      }
      
      if (analysis.relatedTasks?.length > 0) {
        forecastNotes.push(`📋 เชื่อมโยงกับ ${analysis.relatedTasks.length} งาน`);
        
        if (analysis.taskAnalysis?.emptyFieldCount > 0) {
          forecastNotes.push(`⚠️ มี ${analysis.taskAnalysis.emptyFieldCount} งานขาดข้อมูล`);
        }
      }
      
      if (analysis.forecastNotes) {
        forecastNotes.push(`🔮 คาดการณ์: ${analysis.forecastNotes}`);
      }
      
      // รวมหมายเหตุ Forecast กับหมายเหตุเดิม
      if (forecastNotes.length > 0) {
        const existingNote = updates.note || '';
        const combinedNote = existingNote 
          ? `${existingNote}\n\n${forecastNotes.join('\n')}`
          : forecastNotes.join('\n');
        updates.note = combinedNote;
      }
    }
    
    return updates;
  }

  /**
   * ดึงข้อมูล Tasks ทั้งหมด
   */
  async getAllTasks() {
    try {
      const response = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_TASKS_DB_ID}/query`, {
        method: 'POST',
        headers: this.notionHeaders,
        body: JSON.stringify({
          page_size: 100
        })
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data.results.map(task => ({
        id: task.id,
        name: task.properties.Name?.title?.[0]?.text?.content || 'ไม่มีชื่อ',
        status: task.properties.Status?.status?.name || 'ไม่ระบุ',
        priority: task.properties.Priority?.select?.name || 'ไม่ระบุ',
        type: task.properties.Type?.select?.name || 'ไม่ระบุ',
        dueDate: task.properties['Due Date']?.date?.start || null,
        deadline: task.properties.Deadline?.date?.start || null,
        owner: task.properties.Owner?.people?.[0]?.name || 'ไม่มีผู้รับผิดชอบ',
        project: task.properties.Project?.relation?.map(rel => rel.id) || [],
        description: task.properties.Description?.rich_text?.[0]?.text?.content || 
                    task.properties.รายละเอียดงาน?.rich_text?.[0]?.text?.content || '',
        isOverdue: task.properties['Is Overdue']?.formula?.boolean || false,
        progress: task.properties.Progress?.formula?.number || 0,
        created_time: task.created_time,
        last_edited_time: task.last_edited_time,
        // ตรวจสอบคอลั่มที่ว่าง
        emptyFields: []
      }));
    } catch (error) {
      console.error('❌ Error fetching tasks:', error.message);
      return [];
    }
  }

  /**
   * วิเคราะห์ด้วย Forecast Agent สำหรับกำหนดส่งและการจับคู่งาน
   */
  async analyzeForecastForProjects(enhancements, allTasks) {
    const analysis = {};
    
    for (const enhancement of enhancements) {
      const projectId = enhancement.projectId;
      const projectName = enhancement.projectName;
      
      // หางานที่เชื่อมโยงกับโปรเจคนี้
      const relatedTasks = allTasks.filter(task => 
        task.project && task.project.includes(projectId)
      );
      
      console.log(`  📊 ${projectName}: พบ ${relatedTasks.length} งานที่เชื่อมโยง`);
      
      // วิเคราะห์ด้วย AI
      const forecast = await this.forecastProjectTimeline(enhancement, relatedTasks);
      
      analysis[projectId] = {
        relatedTasks,
        forecast,
        taskAnalysis: this.analyzeTaskCompleteness(relatedTasks)
      };
    }
    
    return analysis;
  }

  /**
   * วิเคราะห์กำหนดส่งด้วย Forecast Agent
   */
  async forecastProjectTimeline(enhancement, relatedTasks) {
    const currentData = enhancement.currentData;
    const tasksData = relatedTasks.map(task => `
- ${task.name} | สถานะ: ${task.status} | ความคืบหน้า: ${task.progress}% | กำหนดส่ง: ${task.dueDate || 'ไม่ระบุ'}`).join('\n');

    const prompt = `
คุณเป็น Forecast Expert ที่เชี่ยวชาญในการวิเคราะห์และคาดการณ์กำหนดส่งโปรเจค

ข้อมูลโครงการ:
- ชื่อ: "${currentData.name}"
- สถานะ: ${currentData.status}
- ความคืบหน้า: ${currentData.progress}%
- กำหนดส่งปัจจุบัน: ${currentData.dueDate || 'ไม่ระบุ'}
- สร้างเมื่อ: ${new Date(currentData.created_time).toLocaleDateString('th-TH')}

งานที่เชื่อมโยง (${relatedTasks.length} งาน):
${tasksData || 'ไม่มีงานที่เชื่อมโยง'}

บริบท:
- นักพัฒนาคนเดียว (เวลาจำกัด)
- ใช้เทคโนโลยี Open Source (ลดความซับซ้อน)
- มี AI ช่วย (เพิ่มประสิทธิภาพ)

โปรดวิเคราะห์และส่งกลับในรูปแบบ JSON:
{
  "suggestedDueDate": "YYYY-MM-DD หรือ null ถ้าไม่ควรมี",
  "reasoning": "เหตุผลการคาดการณ์",
  "riskLevel": "Low/Medium/High",
  "estimatedDuration": "ระยะเวลาที่ต้องการ (วัน)",
  "recommendations": ["คำแนะนำ"],
  "feasibility": "High/Medium/Low ความเป็นไปได้ที่จะเสร็จตามกำหนด",
  "note": "หมายเหตุเพิ่มเติม (ถ้า AI ไม่สามารถคาดการณ์ได้แม่นยำ)"
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.createFallbackForecast(currentData, relatedTasks);
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error(`❌ Error forecasting ${currentData.name}:`, error.message);
      return this.createFallbackForecast(currentData, relatedTasks);
    }
  }

  /**
   * วิเคราะห์ความสมบูรณ์ของ Tasks
   */
  analyzeTaskCompleteness(tasks) {
    const analysis = {
      totalTasks: tasks.length,
      emptyFieldCount: 0,
      emptyFields: [],
      recommendations: []
    };

    tasks.forEach(task => {
      const emptyFields = [];
      
      // ตรวจสอบฟิลด์ที่สำคัญ
      if (!task.description || task.description.trim() === '') {
        emptyFields.push('รายละเอียดงาน');
      }
      if (!task.dueDate && !task.deadline) {
        emptyFields.push('กำหนดส่ง');
      }
      if (task.priority === 'ไม่ระบุ') {
        emptyFields.push('ความสำคัญ');
      }
      if (task.type === 'ไม่ระบุ') {
        emptyFields.push('ประเภทงาน');
      }
      
      if (emptyFields.length > 0) {
        analysis.emptyFieldCount++;
        analysis.emptyFields.push({
          taskName: task.name,
          taskId: task.id,
          missingFields: emptyFields
        });
      }
    });

    // สร้างคำแนะนำ
    if (analysis.emptyFieldCount > 0) {
      analysis.recommendations.push(`มี ${analysis.emptyFieldCount}/${tasks.length} งานที่ขาดข้อมูลสำคัญ`);
      analysis.recommendations.push('ควรเติมข้อมูลให้ครบถ้วนเพื่อการติดตามที่แม่นยำ');
    }

    return analysis;
  }

  /**
   * สร้าง Forecast พื้นฐานในกรณี AI ล้มเหลว
   */
  createFallbackForecast(projectData, relatedTasks) {
    const hasActiveTasks = relatedTasks.some(task => 
      !['เสร็จสิ้น', 'ยกเลิก'].includes(task.status)
    );

    const isActiveProject = !['หยุด', 'ยกเลิก', 'เสร็จสิ้น'].includes(projectData.status);

    if (!isActiveProject) {
      return {
        suggestedDueDate: null,
        reasoning: "โครงการไม่ได้ดำเนินการอยู่",
        riskLevel: "Low",
        estimatedDuration: "0",
        recommendations: ["ทบทวนสถานะโครงการ"],
        feasibility: "N/A",
        note: "AI ไม่สามารถคาดการณ์กำหนดส่งได้เนื่องจากโครงการหยุดดำเนินการ"
      };
    }

    // คำนวณกำหนดส่งพื้นฐาน (3 เดือนจากวันนี้)
    const today = new Date();
    const suggestedDate = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000));

    return {
      suggestedDueDate: suggestedDate.toISOString().split('T')[0],
      reasoning: "ประมาณการพื้นฐาน 3 เดือนสำหรับโครงการขนาดกลาง",
      riskLevel: "Medium",
      estimatedDuration: "90",
      recommendations: [
        "ควรแบ่งงานเป็น milestone เล็กๆ",
        "ติดตามความคืบหน้าเป็นประจำ"
      ],
      feasibility: "Medium",
      note: "AI ให้การประมาณการพื้นฐานเนื่องจากข้อมูลไม่เพียงพอสำหรับการวิเคราะห์ที่แม่นยำ"
    };
  }
}

async function runAutoUpdate() {
  console.log('🚀 เริ่มต้นระบบอัปเดตอัตโนมัติ');
  console.log('================================');
  
  try {
    const autoUpdater = new AutoUpdateAgent();
    await autoUpdater.autoUpdateProjects();
    
    console.log('\n✨ ระบบอัปเดตอัตโนมัติทำงานเสร็จสิ้น');
    console.log('ช่วยประหยัดเวลาในการอัปเดตข้อมูลโครงการ!');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

// รันระบบอัปเดตอัตโนมัติ
runAutoUpdate();
