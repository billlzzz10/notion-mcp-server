import dotenv from 'dotenv';
dotenv.config();

/**
 * Subtasks Management Agent
 * จัดการงานย่อยและเชื่อมโยงกับงานหลัก
 */
class SubtasksAgent {
  constructor() {
    this.notionHeaders = {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    };
    this.subtasksDbId = process.env.NOTION_SUBTASKS_DB_ID;
    this.tasksDbId = process.env.NOTION_TASKS_DB_ID;
  }

  /**
   * สร้างงานย่อยใหม่
   */
  async createSubtask(data) {
    try {
      const properties = {
        'Name': {
          title: [{ text: { content: data.name || 'งานย่อยใหม่' } }]
        },
        'Status': {
          status: { name: data.status || 'Not started' }
        }
      };

      // เชื่อมโยงกับงานหลักถ้ามี
      if (data.parentTaskId) {
        properties['🗓️ Task'] = {
          relation: [{ id: data.parentTaskId }]
        };
      }

      // เพิ่มรายละเอียด
      if (data.description) {
        properties['รายละเอียดงาน'] = {
          rich_text: [{ text: { content: data.description } }]
        };
      }

      // เพิ่มความสำคัญ
      if (data.priority) {
        properties['Priority'] = {
          select: { name: data.priority }
        };
      }

      // เพิ่มกำหนดเวลา
      if (data.deadline) {
        properties['Deadline'] = {
          date: { start: data.deadline }
        };
      }

      const response = await fetch(`https://api.notion.com/v1/pages`, {
        method: 'POST',
        headers: this.notionHeaders,
        body: JSON.stringify({
          parent: { database_id: this.subtasksDbId },
          properties
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ สร้างงานย่อย "${data.name}" สำเร็จ`);
        return result;
      } else {
        console.log(`❌ ไม่สามารถสร้างงานย่อยได้: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.log('❌ เกิดข้อผิดพลาดในการสร้างงานย่อย:', error.message);
      return null;
    }
  }

  /**
   * ดึงงานย่อยของงานหลัก
   */
  async getSubtasksByParentTask(parentTaskId) {
    try {
      const response = await fetch(`https://api.notion.com/v1/databases/${this.subtasksDbId}/query`, {
        method: 'POST',
        headers: this.notionHeaders,
        body: JSON.stringify({
          filter: {
            property: '🗓️ Task',
            relation: {
              contains: parentTaskId
            }
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.results.map(subtask => ({
          id: subtask.id,
          name: subtask.properties.Name?.title?.[0]?.text?.content || 'ไม่มีชื่อ',
          status: subtask.properties.Status?.status?.name || 'ไม่ระบุ',
          priority: subtask.properties.Priority?.select?.name || 'ไม่ระบุ',
          deadline: subtask.properties.Deadline?.date?.start || null,
          description: subtask.properties['รายละเอียดงาน']?.rich_text?.[0]?.text?.content || ''
        }));
      } else {
        console.log(`❌ ไม่สามารถดึงงานย่อยได้: ${response.status}`);
        return [];
      }
    } catch (error) {
      console.log('❌ เกิดข้อผิดพลาดในการดึงงานย่อย:', error.message);
      return [];
    }
  }

  /**
   * อัปเดตสถานะงานย่อย
   */
  async updateSubtaskStatus(subtaskId, status) {
    try {
      const response = await fetch(`https://api.notion.com/v1/pages/${subtaskId}`, {
        method: 'PATCH',
        headers: this.notionHeaders,
        body: JSON.stringify({
          properties: {
            'Status': {
              status: { name: status }
            }
          }
        })
      });

      if (response.ok) {
        console.log(`✅ อัปเดตสถานะงานย่อยเป็น "${status}" สำเร็จ`);
        return true;
      } else {
        console.log(`❌ ไม่สามารถอัปเดตสถานะงานย่อยได้: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log('❌ เกิดข้อผิดพลาดในการอัปเดตงานย่อย:', error.message);
      return false;
    }
  }

  /**
   * สร้างงานย่อยหลายอันพร้อมกัน
   */
  async createMultipleSubtasks(parentTaskId, subtasksList) {
    const results = [];
    
    console.log(`🔄 กำลังสร้าง ${subtasksList.length} งานย่อย...`);
    
    for (const subtaskData of subtasksList) {
      const subtask = await this.createSubtask({
        ...subtaskData,
        parentTaskId
      });
      
      if (subtask) {
        results.push(subtask);
      }
      
      // รอเล็กน้อยเพื่อไม่ให้ API rate limit
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log(`✅ สร้างงานย่อยสำเร็จ ${results.length}/${subtasksList.length} งาน`);
    return results;
  }

  /**
   * วิเคราะห์ความคืบหน้าของงานย่อย
   */
  async analyzeSubtaskProgress(parentTaskId) {
    const subtasks = await this.getSubtasksByParentTask(parentTaskId);
    
    if (subtasks.length === 0) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        overdue: 0,
        progressPercentage: 0
      };
    }

    const today = new Date().toISOString().split('T')[0];
    
    const analysis = {
      total: subtasks.length,
      completed: subtasks.filter(s => s.status === 'Done').length,
      inProgress: subtasks.filter(s => s.status === 'In progress').length,
      notStarted: subtasks.filter(s => s.status === 'Not started').length,
      overdue: subtasks.filter(s => s.deadline && s.deadline < today && s.status !== 'Done').length
    };

    analysis.progressPercentage = Math.round((analysis.completed / analysis.total) * 100);

    return analysis;
  }
}

/**
 * Reports Management Agent
 * จัดการรีพอร์ตและการวิเคราะห์ข้อมูล
 */
class ReportsAgent {
  constructor() {
    this.notionHeaders = {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    };
    this.reportsDbId = process.env.NOTION_REPORTS_DB_ID;
    this.projectsDbId = process.env.NOTION_PROJECTS_DB_ID;
    this.tasksDbId = process.env.NOTION_TASKS_DB_ID;
  }

  /**
   * สร้างรีพอร์ตใหม่
   */
  async createReport(data) {
    try {
      const properties = {
        'Content': {
          title: [{ text: { content: data.title || 'รีพอร์ตใหม่' } }]
        },
        'Type': {
          select: { name: data.type || 'Progress Report' }
        }
      };

      // เชื่อมโยงกับโครงการ
      if (data.projectIds && data.projectIds.length > 0) {
        properties['Projects'] = {
          relation: data.projectIds.map(id => ({ id }))
        };
      }

      // เพิ่มรายละเอียด
      if (data.details) {
        properties['รายละเอียด'] = {
          rich_text: [{ text: { content: data.details } }]
        };
      }

      // เพิ่มผู้รับผิดชอบ
      if (data.assigneeId) {
        properties['ผู้รับผิดชอบ'] = {
          people: [{ id: data.assigneeId }]
        };
      }

      const response = await fetch(`https://api.notion.com/v1/pages`, {
        method: 'POST',
        headers: this.notionHeaders,
        body: JSON.stringify({
          parent: { database_id: this.reportsDbId },
          properties
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ สร้างรีพอร์ต "${data.title}" สำเร็จ`);
        
        // ส่งข้อมูลไป Make.com webhook หากมี
        if (process.env.MAKE_WEBHOOK_URL) {
          await this.sendWebhookNotification('report_created', {
            reportId: result.id,
            title: data.title,
            type: data.type
          });
        }
        
        return result;
      } else {
        console.log(`❌ ไม่สามารถสร้างรีพอร์ตได้: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.log('❌ เกิดข้อผิดพลาดในการสร้างรีพอร์ต:', error.message);
      return null;
    }
  }

  /**
   * สร้างรีพอร์ตความคืบหน้าโครงการอัตโนมัติ
   */
  async generateProjectProgressReport(projectId) {
    try {
      // ดึงข้อมูลโครงการ
      const projectResponse = await fetch(`https://api.notion.com/v1/pages/${projectId}`, {
        headers: this.notionHeaders
      });

      if (!projectResponse.ok) {
        throw new Error('ไม่พบโครงการ');
      }

      const project = await projectResponse.json();
      const projectName = project.properties.Name?.title?.[0]?.text?.content || 'โครงการที่ไม่มีชื่อ';

      // ดึงงานทั้งหมดของโครงการ
      const tasksResponse = await fetch(`https://api.notion.com/v1/databases/${this.tasksDbId}/query`, {
        method: 'POST',
        headers: this.notionHeaders,
        body: JSON.stringify({
          filter: {
            property: 'Project',
            relation: {
              contains: projectId
            }
          }
        })
      });

      let taskAnalysis = {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        overdue: 0
      };

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        const today = new Date().toISOString().split('T')[0];
        
        taskAnalysis.total = tasksData.results.length;
        
        tasksData.results.forEach(task => {
          const status = task.properties.Status?.status?.name || 'Not started';
          const dueDate = task.properties['Due Date']?.date?.start || null;
          
          if (status === 'Done') {
            taskAnalysis.completed++;
          } else if (status === 'In progress') {
            taskAnalysis.inProgress++;
          } else {
            taskAnalysis.notStarted++;
          }
          
          if (dueDate && dueDate < today && status !== 'Done') {
            taskAnalysis.overdue++;
          }
        });
      }

      const progressPercentage = taskAnalysis.total > 0 
        ? Math.round((taskAnalysis.completed / taskAnalysis.total) * 100) 
        : 0;

      // สร้างเนื้อหารีพอร์ต
      const reportContent = `# รีพอร์ตความคืบหน้า: ${projectName}

## 📊 สรุปภาพรวม
- ความคืบหน้าโดยรวม: ${progressPercentage}%
- งานทั้งหมด: ${taskAnalysis.total} งาน
- งานเสร็จแล้ว: ${taskAnalysis.completed} งาน
- งานกำลังดำเนินการ: ${taskAnalysis.inProgress} งาน
- งานที่ยังไม่เริ่ม: ${taskAnalysis.notStarted} งาน
- งานที่ล่าช้า: ${taskAnalysis.overdue} งาน

## 🎯 สถานะโครงการ
${progressPercentage >= 90 ? '🟢 โครงการใกล้เสร็จสิ้น' : 
  progressPercentage >= 70 ? '🟡 โครงการดำเนินไปได้ดี' :
  progressPercentage >= 50 ? '🟠 โครงการมีความคืบหน้าปานกลาง' :
  '🔴 โครงการต้องการความสนใจ'}

## ⚠️ ประเด็นที่ต้องติดตาม
${taskAnalysis.overdue > 0 ? `- มีงานล่าช้า ${taskAnalysis.overdue} งาน ต้องเร่งดำเนินการ` : '- ไม่มีงานล่าช้า'}
${taskAnalysis.notStarted > taskAnalysis.inProgress ? '- งานที่ยังไม่เริ่มมากกว่างานที่กำลังดำเนินการ' : ''}

วันที่สร้างรีพอร์ต: ${new Date().toLocaleDateString('th-TH')}`;

      // สร้างรีพอร์ตใน Notion
      const report = await this.createReport({
        title: `รีพอร์ตความคืบหน้า: ${projectName} (${new Date().toLocaleDateString('th-TH')})`,
        type: 'Progress Report',
        details: reportContent,
        projectIds: [projectId]
      });

      return {
        report,
        analysis: taskAnalysis,
        progressPercentage
      };

    } catch (error) {
      console.log('❌ เกิดข้อผิดพลาดในการสร้างรีพอร์ต:', error.message);
      return null;
    }
  }

  /**
   * ส่งการแจ้งเตือนผ่าน Webhook
   */
  async sendWebhookNotification(eventType, data) {
    if (!process.env.MAKE_WEBHOOK_URL) return;

    try {
      await fetch(process.env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventType,
          timestamp: new Date().toISOString(),
          data
        })
      });
    } catch (error) {
      console.log('⚠️ ไม่สามารถส่ง webhook notification ได้:', error.message);
    }
  }
}

export { SubtasksAgent, ReportsAgent };
