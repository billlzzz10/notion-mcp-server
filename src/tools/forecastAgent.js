import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();

/**
 * Forecast Agent - คาดการณ์แนวโน้มการทำงานและประเมินความเสี่ยง
 */
class ForecastAgent {
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
   * คาดการณ์แนวโน้มของ Project และ Tasks
   */
  async forecastProject(projectId) {
    console.log(`🔮 Forecast Agent: วิเคราะห์แนวโน้ม Project ${projectId}`);
    
    try {
      // 1. ดึงข้อมูล Project และ Tasks
      const projectData = await this.getProjectData(projectId);
      const tasksData = await this.getProjectTasks(projectId);
      
      if (!projectData || !tasksData.length) {
        throw new Error('ไม่พบข้อมูล Project หรือ Tasks');
      }

      console.log(`📊 Project: ${projectData.name}`);
      console.log(`📋 Tasks ทั้งหมด: ${tasksData.length} งาน`);

      // 2. วิเคราะห์สถานะปัจจุบัน
      const currentStatus = this.analyzeCurrentStatus(tasksData);
      
      // 3. ใช้ AI คาดการณ์แนวโน้ม
      const forecast = await this.aiForecastAnalysis(projectData, tasksData, currentStatus);
      
      // 4. สร้าง Risk Assessment
      const riskAssessment = await this.assessRisks(tasksData, forecast);
      
      // 5. สร้างคำแนะนำ
      const recommendations = await this.generateRecommendations(forecast, riskAssessment);

      const result = {
        project: projectData,
        currentStatus,
        forecast,
        riskAssessment,
        recommendations,
        analysisDate: new Date().toISOString()
      };

      // 6. บันทึกผลการวิเคราะห์
      await this.saveForecastResults(projectId, result);

      return result;

    } catch (error) {
      console.error('❌ Forecast Agent Error:', error.message);
      throw error;
    }
  }

  /**
   * ดึงข้อมูล Project
   */
  async getProjectData(projectId) {
    try {
      const response = await fetch(`https://api.notion.com/v1/pages/${projectId}`, {
        headers: this.notionHeaders
      });

      if (!response.ok) return null;

      const page = await response.json();
      return {
        id: page.id,
        name: page.properties.Name?.title?.[0]?.text?.content || 'ไม่มีชื่อ',
        description: page.properties.Text?.rich_text?.[0]?.text?.content || '',
        status: page.properties.Status?.select?.name || 'Unknown',
        priority: page.properties.Priority?.select?.name || 'Medium',
        dueDate: page.properties['วันส่งมอบ']?.date?.start || null,
        startDate: page.properties['Start Date']?.created_time || null
      };
    } catch (error) {
      console.error('❌ Error fetching project:', error.message);
      return null;
    }
  }

  /**
   * ดึงข้อมูล Tasks ของ Project
   */
  async getProjectTasks(projectId) {
    try {
      const response = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_TASKS_DB_ID}/query`, {
        method: 'POST',
        headers: this.notionHeaders,
        body: JSON.stringify({
          filter: {
            property: "Project",
            relation: {
              contains: projectId
            }
          }
        })
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data.results.map(task => ({
        id: task.id,
        name: task.properties.Name?.title?.[0]?.text?.content || 'ไม่มีชื่อ',
        status: task.properties.Status?.status?.name || 'ยังไม่เริ่ม',
        priority: task.properties.Priority?.select?.name || 'P3',
        dueDate: task.properties['Due Date']?.date?.start || null,
        createdAt: task.created_time,
        lastModified: task.last_edited_time,
        progress: task.properties.Progress?.formula?.number || 0,
        isOverdue: task.properties['Is Overdue']?.formula?.boolean || false
      }));
    } catch (error) {
      console.error('❌ Error fetching tasks:', error.message);
      return [];
    }
  }

  /**
   * วิเคราะห์สถานะปัจจุบัน
   */
  analyzeCurrentStatus(tasks) {
    const total = tasks.length;
    const statusCounts = {};
    const priorityCounts = {};
    let overdueTasks = 0;
    let totalProgress = 0;

    tasks.forEach(task => {
      // นับ Status
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
      
      // นับ Priority
      priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;
      
      // นับงานค้าง
      if (task.isOverdue) overdueTasks++;
      
      // รวม Progress
      totalProgress += task.progress || 0;
    });

    const avgProgress = total > 0 ? totalProgress / total : 0;

    return {
      totalTasks: total,
      statusBreakdown: statusCounts,
      priorityBreakdown: priorityCounts,
      overdueTasks,
      avgProgress: Math.round(avgProgress * 100) / 100,
      completionRate: statusCounts['เสร็จสิ้น'] ? (statusCounts['เสร็จสิ้น'] / total * 100).toFixed(1) : 0
    };
  }

  /**
   * ใช้ AI คาดการณ์แนวโน้ม
   */
  async aiForecastAnalysis(project, tasks, currentStatus) {
    const prompt = `
คุณเป็น AI Forecast Agent ที่เชี่ยวชาญในการคาดการณ์แนวโน้มการทำงาน

ข้อมูล Project:
- ชื่อ: ${project.name}
- สถานะ: ${project.status}
- กำหนดส่ง: ${project.dueDate || 'ไม่ระบุ'}
- เริ่มงาน: ${project.startDate || 'ไม่ระบุ'}

สถานะปัจจุบัน:
- งานทั้งหมด: ${currentStatus.totalTasks}
- ความคืบหน้าเฉลี่ย: ${currentStatus.avgProgress}%
- งานที่เสร็จแล้ว: ${currentStatus.completionRate}%
- งานค้าง: ${currentStatus.overdueTasks}
- สถานะงาน: ${JSON.stringify(currentStatus.statusBreakdown)}

โปรดวิเคราะห์และคาดการณ์แนวโน้มในรูปแบบ JSON:
{
  "projectHealthScore": คะแนนสุขภาพโครงการ (0-100),
  "onTimeDeliveryProbability": ความน่าจะเป็นที่ส่งงานตรงเวลา (0-100),
  "estimatedCompletionDate": "วันที่คาดว่าจะเสร็จ (YYYY-MM-DD)",
  "bottlenecks": ["ปัญหาที่คาดว่าจะเกิด"],
  "trendAnalysis": {
    "velocity": "ความเร็วในการทำงาน (High/Medium/Low)",
    "momentum": "แรงผลักดัน (Increasing/Stable/Declining)",
    "riskTrend": "แนวโน้มความเสี่ยง (Improving/Stable/Worsening)"
  },
  "predictions": {
    "nextWeekProgress": "ความคืบหน้าที่คาดการณ์สัปดาหห์หน้า (%)",
    "criticalTasks": ["งานที่ต้องให้ความสำคัญ"],
    "resourceNeeds": ["ทรัพยากรที่อาจต้องเพิ่ม"]
  }
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI ไม่ส่งคืนข้อมูลในรูปแบบ JSON ที่ถูกต้อง');
      }

      const forecast = JSON.parse(jsonMatch[0]);
      console.log(`📈 Health Score: ${forecast.projectHealthScore}/100`);
      console.log(`⏰ ความน่าจะเป็นส่งตรงเวลา: ${forecast.onTimeDeliveryProbability}%`);
      
      return forecast;
    } catch (error) {
      console.error('❌ AI Forecast Error:', error.message);
      return this.createFallbackForecast(currentStatus);
    }
  }

  /**
   * ประเมินความเสี่ยง
   */
  async assessRisks(tasks, forecast) {
    const risks = [];
    
    // ประเมินความเสี่ยงจากงานค้าง
    const overdueTasks = tasks.filter(t => t.isOverdue);
    if (overdueTasks.length > 0) {
      risks.push({
        type: "Schedule Risk",
        level: overdueTasks.length > 3 ? "High" : "Medium",
        description: `มีงานค้าง ${overdueTasks.length} งาน`,
        impact: "อาจส่งผลต่อกำหนดการโดยรวม",
        mitigation: "ปรับลำดับความสำคัญและเพิ่มทรัพยากร"
      });
    }

    // ประเมินความเสี่ยงจาก Health Score
    if (forecast.projectHealthScore < 70) {
      risks.push({
        type: "Project Health Risk",
        level: forecast.projectHealthScore < 50 ? "High" : "Medium",
        description: `คะแนนสุขภาพโครงการต่ำ (${forecast.projectHealthScore}/100)`,
        impact: "อาจส่งผลต่อคุณภาพและกำหนดเวลา",
        mitigation: "ทบทวนแผนงานและเพิ่มการติดตาม"
      });
    }

    return risks;
  }

  /**
   * สร้างคำแนะนำ
   */
  async generateRecommendations(forecast, risks) {
    const recommendations = [];

    // คำแนะนำจาก Health Score
    if (forecast.projectHealthScore >= 80) {
      recommendations.push("✅ โครงการอยู่ในสภาพดี ดำเนินการต่อตามแผน");
    } else if (forecast.projectHealthScore >= 60) {
      recommendations.push("⚠️ ควรเพิ่มการติดตามและปรับแผนเล็กน้อย");
    } else {
      recommendations.push("🚨 ต้องการการแทรกแซงอย่างเร่งด่วน");
    }

    // คำแนะนำจากความเสี่ยง
    if (risks.length > 0) {
      recommendations.push(`🛡️ จัดการความเสี่ยง ${risks.length} ประเด็น`);
      risks.forEach(risk => {
        recommendations.push(`- ${risk.mitigation}`);
      });
    }

    // คำแนะนำจาก Velocity
    if (forecast.trendAnalysis?.momentum === 'Declining') {
      recommendations.push("📈 เพิ่มแรงจูงใจและทบทวนอุปสรรค");
    }

    return recommendations;
  }

  /**
   * บันทึกผลการวิเคราะห์
   */
  async saveForecastResults(projectId, results) {
    try {
      const summary = `🔮 Forecast Analysis (${new Date().toLocaleDateString('th-TH')})

📊 Health Score: ${results.forecast.projectHealthScore}/100
⏰ ส่งตรงเวลา: ${results.forecast.onTimeDeliveryProbability}%
📅 คาดเสร็จ: ${results.forecast.estimatedCompletionDate}

📈 แนวโน้ม:
- ความเร็ว: ${results.forecast.trendAnalysis?.velocity}
- แรงผลักดัน: ${results.forecast.trendAnalysis?.momentum}
- ความเสี่ยง: ${results.forecast.trendAnalysis?.riskTrend}

⚠️ ความเสี่ยง: ${results.riskAssessment.length} ประเด็น
💡 คำแนะนำ: ${results.recommendations.length} ข้อ`;

      const response = await fetch(`https://api.notion.com/v1/pages/${projectId}`, {
        method: 'PATCH',
        headers: this.notionHeaders,
        body: JSON.stringify({
          properties: {
            "Tasks Summary": {
              rich_text: [{ text: { content: summary } }]
            }
          }
        })
      });

      if (response.ok) {
        console.log('✅ บันทึกผลการวิเคราะห์สำเร็จ');
      }
    } catch (error) {
      console.error('❌ Error saving forecast:', error.message);
    }
  }

  /**
   * สร้างการคาดการณ์พื้นฐานในกรณี AI ล้มเหลว
   */
  createFallbackForecast(currentStatus) {
    const healthScore = Math.max(10, Math.min(90, currentStatus.avgProgress * 0.8 + (100 - currentStatus.overdueTasks * 10)));
    
    return {
      projectHealthScore: Math.round(healthScore),
      onTimeDeliveryProbability: Math.max(20, Math.min(90, healthScore - 10)),
      estimatedCompletionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bottlenecks: ["ข้อมูลไม่เพียงพอสำหรับการวิเคราะห์"],
      trendAnalysis: {
        velocity: "Medium",
        momentum: "Stable", 
        riskTrend: currentStatus.overdueTasks > 2 ? "Worsening" : "Stable"
      },
      predictions: {
        nextWeekProgress: `${Math.round(currentStatus.avgProgress + 10)}%`,
        criticalTasks: ["งานที่ค้างกำหนด"],
        resourceNeeds: ["การติดตามเพิ่มเติม"]
      }
    };
  }
}

export default ForecastAgent;
