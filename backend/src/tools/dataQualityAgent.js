import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();

/**
 * Data Quality Agent - ตรวจสอบความสมเหตุสมผลของข้อมูล Project และ Tasks
 */
class DataQualityAgent {
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
   * ตรวจสอบความสมเหตุสมผลของ Projects และ Tasks ทั้งหมด
   */
  async analyzeDataQuality() {
    console.log('🔍 Data Quality Agent: ตรวจสอบความสมเหตุสมผลของข้อมูล');
    console.log('=====================================================');

    try {
      // 1. ดึงข้อมูล Projects ทั้งหมด
      const projects = await this.getAllProjects();
      console.log(`📊 พบ ${projects.length} Projects`);

      // 2. ดึงข้อมูล Tasks ทั้งหมด
      const tasks = await this.getAllTasks();
      console.log(`📋 พบ ${tasks.length} Tasks`);

      // 3. วิเคราะห์แต่ละ Project
      const projectAnalysis = [];
      for (const project of projects) {
        console.log(`\n🔎 วิเคราะห์ Project: "${project.name}"`);
        const analysis = await this.analyzeProject(project);
        projectAnalysis.push(analysis);
      }

      // 4. วิเคราะห์ Tasks ที่เชื่อมโยงกับ Projects
      const taskAnalysis = [];
      for (const project of projects) {
        const projectTasks = tasks.filter(task => 
          task.project && task.project.includes(project.id)
        );
        
        if (projectTasks.length > 0) {
          console.log(`\n📝 วิเคราะห์ ${projectTasks.length} Tasks ของ Project: "${project.name}"`);
          const analysis = await this.analyzeTasks(projectTasks, project);
          taskAnalysis.push(analysis);
        }
      }

      // 5. สรุปผลและให้คำแนะนำ
      const summary = await this.generateQualitySummary(projectAnalysis, taskAnalysis);
      
      // 6. แสดงผลลัพธ์
      this.displayResults(projectAnalysis, taskAnalysis, summary);

      return {
        projects: projectAnalysis,
        tasks: taskAnalysis,
        summary
      };

    } catch (error) {
      console.error('❌ Data Quality Agent Error:', error.message);
      throw error;
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
        created_time: project.created_time,
        last_edited_time: project.last_edited_time
      }));
    } catch (error) {
      console.error('❌ Error fetching projects:', error.message);
      return [];
    }
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
        last_edited_time: task.last_edited_time
      }));
    } catch (error) {
      console.error('❌ Error fetching tasks:', error.message);
      return [];
    }
  }

  /**
   * วิเคราะห์ Project แต่ละตัว
   */
  async analyzeProject(project) {
    const prompt = `
คุณเป็น Data Quality Expert ที่เชี่ยวชาญในการตรวจสอบความสมเหตุสมผลของข้อมูลโครงการ

ข้อมูล Project:
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

โปรดวิเคราะห์ความสมเหตุสมผลและส่งกลับในรูปแบบ JSON:
{
  "qualityScore": คะแนนคุณภาพข้อมูล (0-100),
  "issues": [
    {
      "field": "ชื่อฟิลด์ที่มีปัญหา",
      "issue": "ปัญหาที่พบ",
      "severity": "High/Medium/Low",
      "suggestion": "คำแนะนำการแก้ไข"
    }
  ],
  "positives": ["จุดเด่นของข้อมูล"],
  "recommendations": ["คำแนะนำการปรับปรุง"],
  "dataConsistency": "High/Medium/Low",
  "completeness": "High/Medium/Low"
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.createFallbackAnalysis(project);
      }

      const analysis = JSON.parse(jsonMatch[0]);
      analysis.projectId = project.id;
      analysis.projectName = project.name;
      
      return analysis;
    } catch (error) {
      console.error(`❌ Error analyzing project ${project.name}:`, error.message);
      return this.createFallbackAnalysis(project);
    }
  }

  /**
   * วิเคราะห์ Tasks ของ Project
   */
  async analyzeTasks(tasks, project) {
    const tasksData = tasks.map(task => `
- ${task.name} | สถานะ: ${task.status} | ความสำคัญ: ${task.priority} | กำหนดส่ง: ${task.dueDate || 'ไม่ระบุ'} | ค้าง: ${task.isOverdue ? 'ใช่' : 'ไม่'}`).join('\n');

    const prompt = `
คุณเป็น Data Quality Expert ที่ตรวจสอบความสมเหตุสมผลของข้อมูลงาน

Project: "${project.name}" (สถานะ: ${project.status}, กำหนดส่ง: ${project.dueDate || 'ไม่ระบุ'})

Tasks (${tasks.length} งาน):
${tasksData}

โปรดวิเคราะห์ความสมเหตุสมผลของ Tasks และส่งกลับในรูปแบบ JSON:
{
  "overallQuality": คะแนนคุณภาพโดยรวม (0-100),
  "taskIssues": [
    {
      "taskName": "ชื่องาน",
      "issues": ["ปัญหาที่พบ"],
      "severity": "High/Medium/Low"
    }
  ],
  "patternIssues": ["ปัญหาจากรูปแบบการทำงาน"],
  "timelineConsistency": "High/Medium/Low",
  "priorityAlignment": "High/Medium/Low",
  "statusLogic": "High/Medium/Low",
  "recommendations": ["คำแนะนำการปรับปรุง"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.createFallbackTaskAnalysis(tasks, project);
      }

      const analysis = JSON.parse(jsonMatch[0]);
      analysis.projectId = project.id;
      analysis.projectName = project.name;
      analysis.taskCount = tasks.length;
      
      return analysis;
    } catch (error) {
      console.error(`❌ Error analyzing tasks for ${project.name}:`, error.message);
      return this.createFallbackTaskAnalysis(tasks, project);
    }
  }

  /**
   * สร้างสรุปคุณภาพข้อมูลโดยรวม
   */
  async generateQualitySummary(projectAnalysis, taskAnalysis) {
    const avgProjectQuality = projectAnalysis.reduce((sum, p) => sum + p.qualityScore, 0) / projectAnalysis.length;
    const avgTaskQuality = taskAnalysis.reduce((sum, t) => sum + t.overallQuality, 0) / (taskAnalysis.length || 1);
    
    const totalIssues = [
      ...projectAnalysis.flatMap(p => p.issues),
      ...taskAnalysis.flatMap(t => t.taskIssues || [])
    ];

    const highSeverityIssues = totalIssues.filter(issue => issue.severity === 'High').length;
    const mediumSeverityIssues = totalIssues.filter(issue => issue.severity === 'Medium').length;

    return {
      overallScore: Math.round((avgProjectQuality + avgTaskQuality) / 2),
      projectQuality: Math.round(avgProjectQuality),
      taskQuality: Math.round(avgTaskQuality),
      totalIssues: totalIssues.length,
      highSeverityIssues,
      mediumSeverityIssues,
      status: this.getQualityStatus(Math.round((avgProjectQuality + avgTaskQuality) / 2))
    };
  }

  /**
   * แสดงผลลัพธ์
   */
  displayResults(projectAnalysis, taskAnalysis, summary) {
    console.log('\n🎯 สรุปผลการตรวจสอบคุณภาพข้อมูล');
    console.log('===================================');
    
    console.log(`📊 คะแนนรวม: ${summary.overallScore}/100 (${summary.status})`);
    console.log(`📁 คุณภาพ Projects: ${summary.projectQuality}/100`);
    console.log(`📋 คุณภาพ Tasks: ${summary.taskQuality}/100`);
    console.log(`⚠️ ปัญหาทั้งหมด: ${summary.totalIssues} (ร้อนแรง: ${summary.highSeverityIssues}, ปานกลาง: ${summary.mediumSeverityIssues})`);

    // แสดงปัญหาสำคัญ
    console.log('\n🚨 ปัญหาที่ต้องแก้ไขด่วน:');
    projectAnalysis.forEach(project => {
      const highIssues = project.issues.filter(issue => issue.severity === 'High');
      if (highIssues.length > 0) {
        console.log(`\n📁 Project: ${project.projectName}`);
        highIssues.forEach(issue => {
          console.log(`   ❌ ${issue.field}: ${issue.issue}`);
          console.log(`      💡 แก้ไข: ${issue.suggestion}`);
        });
      }
    });

    taskAnalysis.forEach(taskGroup => {
      const issues = taskGroup.taskIssues?.filter(issue => issue.severity === 'High') || [];
      if (issues.length > 0) {
        console.log(`\n📋 Tasks ใน Project: ${taskGroup.projectName}`);
        issues.forEach(issue => {
          console.log(`   ❌ ${issue.taskName}: ${issue.issues.join(', ')}`);
        });
      }
    });

    // แสดงคำแนะนำ
    console.log('\n💡 คำแนะนำการปรับปรุง:');
    projectAnalysis.forEach(project => {
      if (project.recommendations.length > 0) {
        console.log(`\n📁 ${project.projectName}:`);
        project.recommendations.forEach(rec => console.log(`   • ${rec}`));
      }
    });
  }

  /**
   * กำหนดสถานะคุณภาพ
   */
  getQualityStatus(score) {
    if (score >= 80) return 'ดีเยี่ยม';
    if (score >= 60) return 'ดี';
    if (score >= 40) return 'ปานกลาง';
    return 'ต้องปรับปรุง';
  }

  /**
   * สร้างการวิเคราะห์พื้นฐานในกรณี AI ล้มเหลว
   */
  createFallbackAnalysis(project) {
    const issues = [];
    
    if (!project.dueDate) {
      issues.push({
        field: "วันส่งมอบ",
        issue: "ไม่มีกำหนดส่งงาน",
        severity: "Medium",
        suggestion: "ระบุวันกำหนดส่งให้ชัดเจน"
      });
    }
    
    if (!project.description || project.description.length < 10) {
      issues.push({
        field: "รายละเอียด",
        issue: "รายละเอียดโครงการไม่เพียงพอ",
        severity: "Medium",
        suggestion: "เพิ่มรายละเอียดที่ชัดเจนมากขึ้น"
      });
    }

    return {
      projectId: project.id,
      projectName: project.name,
      qualityScore: 70,
      issues,
      positives: ["ข้อมูลพื้นฐานครบถ้วน"],
      recommendations: ["เพิ่มรายละเอียดและกำหนดเวลา"],
      dataConsistency: "Medium",
      completeness: "Medium"
    };
  }

  createFallbackTaskAnalysis(tasks, project) {
    return {
      projectId: project.id,
      projectName: project.name,
      taskCount: tasks.length,
      overallQuality: 65,
      taskIssues: [],
      patternIssues: ["ข้อมูลไม่เพียงพอสำหรับการวิเคราะห์"],
      timelineConsistency: "Medium",
      priorityAlignment: "Medium",
      statusLogic: "Medium",
      recommendations: ["ตรวจสอบข้อมูลและปรับปรุงให้สมบูรณ์"]
    };
  }
}

export default DataQualityAgent;
