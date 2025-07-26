const express = require('express');
const path = require('path');
const { Client } = require('@notionhq/client');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3000;

// Initialize Notion client
const notion = process.env.NOTION_API_KEY ? new Client({
  auth: process.env.NOTION_API_KEY,
}) : null;

// Database IDs - ฐานข้อมูลทั้งหมด 14 ตาราง
const DATABASES = {
  // Core Ashval Databases (ฐานข้อมูลหลัก 8 ตาราง)
  CHARACTERS: process.env.NOTION_CHARACTERS_DB_ID,
  SCENES: process.env.NOTION_SCENES_DB_ID,
  LOCATIONS: process.env.NOTION_LOCATIONS_DB_ID,
  WORLDS: process.env.NOTION_WORLDS_DB_ID,
  POWER_SYSTEMS: process.env.NOTION_POWER_SYSTEMS_DB_ID,
  ARCANAS: process.env.NOTION_ARCANAS_DB_ID,
  MISSIONS: process.env.NOTION_MISSIONS_DB_ID,
  AI_PROMPTS: process.env.NOTION_AI_PROMPTS_DB_ID,
  
  // Enhanced Ashval Databases (ฐานข้อมูลเพิ่มเติม 6 ตาราง)
  VERSION_HISTORY: process.env.NOTION_VERSION_HISTORY_DB_ID,
  STORY_TIMELINE: process.env.NOTION_STORY_TIMELINE_DB_ID,
  STORY_ARCS: process.env.NOTION_STORY_ARCS_DB_ID,
  WORLD_RULES: process.env.NOTION_WORLD_RULES_DB_ID,
  PROJECTS: process.env.NOTION_PROJECTS_DB_ID,
  YOUTUBE_ANALYSIS: process.env.NOTION_YOUTUBE_ANALYSIS_DB_ID
};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    notion_connected: !!notion,
    databases_configured: Object.values(DATABASES).filter(Boolean).length
  });
});

// Get all pages count from Notion
app.get('/api/pages', async (req, res) => {
  if (!notion) {
    return res.json({
      error: 'Notion not configured',
      pages: [],
      totalPages: 0,
      message: 'ตั้งค่า NOTION_API_KEY ใน .env'
    });
  }

  try {
    let allPages = [];
    let totalPages = 0;
    let databaseStats = {};
    
    // รายชื่อฐานข้อมูลทั้งหมด
    const databaseNames = {
      [DATABASES.CHARACTERS]: 'Characters (ตัวละคร)',
      [DATABASES.SCENES]: 'Scenes (ฉาก)',
      [DATABASES.LOCATIONS]: 'Locations (สถานที่)',
      [DATABASES.WORLDS]: 'Worlds (โลก)',
      [DATABASES.POWER_SYSTEMS]: 'Power Systems (ระบบพลัง)',
      [DATABASES.ARCANAS]: 'Arcanas (อาร์คานา)',
      [DATABASES.MISSIONS]: 'Missions (ภารกิจ)',
      [DATABASES.AI_PROMPTS]: 'AI Prompts (คำสั่ง AI)',
      [DATABASES.VERSION_HISTORY]: 'Version History (ประวัติเวอร์ชัน)',
      [DATABASES.STORY_TIMELINE]: 'Story Timeline (ไทม์ไลน์เรื่อง)',
      [DATABASES.STORY_ARCS]: 'Story Arcs (เหตุการณ์เรื่อง)',
      [DATABASES.WORLD_RULES]: 'World Rules (กฎของโลก)',
      [DATABASES.PROJECTS]: 'Projects (โปรเจกต์)',
      [DATABASES.YOUTUBE_ANALYSIS]: 'YouTube Analysis (วิเคราะห์ YouTube)'
    };
    
    // นับจำนวนหน้าจากทุกฐานข้อมูล
    const databaseIds = Object.values(DATABASES).filter(Boolean);
    
    for (const databaseId of databaseIds) {
      try {
        const response = await notion.databases.query({
          database_id: databaseId,
        });
        
        const pages = response.results.map(page => ({
          id: page.id,
          title: page.properties.Name?.title?.[0]?.plain_text || 
                 page.properties.Title?.title?.[0]?.plain_text || 
                 'ไม่มีชื่อ',
          database: databaseId,
          databaseName: databaseNames[databaseId] || 'Unknown Database',
          created: page.created_time,
          updated: page.last_edited_time,
          url: page.url
        }));
        
        allPages = allPages.concat(pages);
        totalPages += pages.length;
        
        // สถิติแต่ละฐานข้อมูล
        databaseStats[databaseId] = {
          name: databaseNames[databaseId] || 'Unknown Database',
          count: pages.length,
          lastUpdated: pages.length > 0 ? Math.max(...pages.map(p => new Date(p.updated))) : null
        };
        
      } catch (dbError) {
        console.error(`Error fetching pages from database ${databaseId}:`, dbError);
        databaseStats[databaseId] = {
          name: databaseNames[databaseId] || 'Unknown Database',
          count: 0,
          error: dbError.message,
          lastUpdated: null
        };
      }
    }
    
    // เรียงลำดับตามวันที่อัพเดต
    allPages.sort((a, b) => new Date(b.updated) - new Date(a.updated));
    
    res.json({
      pages: allPages,
      totalPages: totalPages,
      databases: databaseIds.length,
      databaseStats: databaseStats,
      workspaceStats: {
        totalDatabases: Object.keys(DATABASES).length,
        configuredDatabases: databaseIds.length,
        missingDatabases: Object.keys(DATABASES).length - databaseIds.length,
        totalPages: totalPages
      },
      message: `🎯 พบหน้าทั้งหมด ${totalPages} หน้า จาก ${databaseIds.length}/${Object.keys(DATABASES).length} ฐานข้อมูล`
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({
      error: 'Failed to fetch pages',
      message: error.message
    });
  }
});

// Get all projects from Notion
app.get('/api/projects', async (req, res) => {
  if (!notion || !DATABASES.PROJECTS) {
    return res.json({
      error: 'Notion not configured',
      projects: [],
      message: 'ตั้งค่า NOTION_API_KEY และ NOTION_PROJECTS_DB_ID ใน .env'
    });
  }

  try {
    const response = await notion.databases.query({
      database_id: DATABASES.PROJECTS,
    });

    const projects = response.results.map(page => ({
      id: page.id,
      title: page.properties.Name?.title?.[0]?.plain_text || 'ไม่มีชื่อ',
      status: page.properties.Status?.select?.name || 'ไม่ระบุ',
      created: page.created_time,
      updated: page.last_edited_time
    }));

    res.json({
      projects,
      total: projects.length,
      message: `พบโปรเจค ${projects.length} รายการ`
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      error: 'Failed to fetch projects',
      message: error.message
    });
  }
});

// Get all tasks from Notion
app.get('/api/tasks', async (req, res) => {
  if (!notion || !DATABASES.TASKS) {
    return res.json({
      error: 'Notion not configured',
      tasks: [],
      message: 'ตั้งค่า NOTION_API_KEY และ NOTION_TASKS_DB_ID ใน .env'
    });
  }

  try {
    const response = await notion.databases.query({
      database_id: DATABASES.TASKS,
    });

    const tasks = response.results.map(page => ({
      id: page.id,
      title: page.properties.Name?.title?.[0]?.plain_text || 'ไม่มีชื่อ',
      status: page.properties.Status?.select?.name || 'ไม่ระบุ',
      priority: page.properties.Priority?.select?.name || 'ปกติ',
      created: page.created_time,
      updated: page.last_edited_time
    }));

    res.json({
      tasks,
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'Done').length,
      message: `พบงาน ${tasks.length} รายการ`
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      error: 'Failed to fetch tasks',
      message: error.message
    });
  }
});

// Create new project
app.post('/api/projects', async (req, res) => {
  if (!notion || !DATABASES.PROJECTS) {
    return res.json({
      error: 'Notion not configured',
      message: 'ตั้งค่า NOTION_API_KEY และ NOTION_PROJECTS_DB_ID ใน .env'
    });
  }

  const { name, status = 'Planning' } = req.body;
  
  if (!name) {
    return res.status(400).json({
      error: 'Project name is required',
      message: 'กรุณาระบุชื่อโปรเจค'
    });
  }

  try {
    const response = await notion.pages.create({
      parent: {
        database_id: DATABASES.PROJECTS,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
        Status: {
          select: {
            name: status,
          },
        },
      },
    });

    res.json({
      success: true,
      project: {
        id: response.id,
        name: name,
        status: status,
        created: response.created_time
      },
      message: `สร้างโปรเจค "${name}" สำเร็จ`
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      error: 'Failed to create project',
      message: error.message
    });
  }
});

// Create new task
app.post('/api/tasks', async (req, res) => {
  if (!notion || !DATABASES.TASKS) {
    return res.json({
      error: 'Notion not configured',
      message: 'ตั้งค่า NOTION_API_KEY และ NOTION_TASKS_DB_ID ใน .env'
    });
  }

  const { name, status = 'To Do', priority = 'Medium' } = req.body;
  
  if (!name) {
    return res.status(400).json({
      error: 'Task name is required',
      message: 'กรุณาระบุชื่องาน'
    });
  }

  try {
    const response = await notion.pages.create({
      parent: {
        database_id: DATABASES.TASKS,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
        Status: {
          select: {
            name: status,
          },
        },
        Priority: {
          select: {
            name: priority,
          },
        },
      },
    });

    res.json({
      success: true,
      task: {
        id: response.id,
        name: name,
        status: status,
        priority: priority,
        created: response.created_time
      },
      message: `สร้างงาน "${name}" สำเร็จ`
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      error: 'Failed to create task',
      message: error.message
    });
  }
});

// Command processor with real actions
app.post('/api/command', async (req, res) => {
  const { command } = req.body;
  
  if (!command) {
    return res.status(400).json({
      error: 'Command is required',
      message: 'กรุณาระบุคำสั่ง'
    });
  }

  console.log(`📨 Processing command: ${command}`);
  
  try {
    let response = '';
    let data = null;
    
    // แสดงจำนวนหน้าทั้งหมด
    if (command.includes('หน้า') || command.includes('page')) {
      if (command.includes('นับ') || command.includes('จำนวน') || command.includes('ทั้งหมด')) {
        const pagesResponse = await fetch(`http://localhost:${PORT}/api/pages`);
        const pagesData = await pagesResponse.json();
        
        if (pagesData.totalPages > 0) {
          response = `📄 จำนวนหน้าใน Notion ทั้งหมด: ${pagesData.totalPages} หน้า\n\n`;
          response += `📊 แยกตามฐานข้อมูล:\n`;
          
          // แสดงจำนวนแต่ละฐานข้อมูล
          for (const [dbId, count] of Object.entries(pagesData.byDatabase)) {
            const dbName = Object.keys(DATABASES).find(key => DATABASES[key] === dbId) || 'Unknown';
            response += `• ${dbName}: ${count} หน้า\n`;
          }
          
          response += `\n🗂️ ฐานข้อมูลทั้งหมด: ${pagesData.databases} ฐาน\n`;
          response += `📅 อัพเดตล่าสุด: ${pagesData.pages.length > 0 ? new Date(pagesData.pages[0].updated).toLocaleString('th-TH') : 'ไม่ทราบ'}`;
          
          // แสดงหน้าที่อัพเดตล่าสุด 5 หน้า
          if (pagesData.pages.length > 0) {
            response += `\n\n📋 หน้าที่อัพเดตล่าสุด:\n`;
            pagesData.pages.slice(0, 5).forEach((page, index) => {
              response += `${index + 1}. ${page.title}\n`;
              response += `   📅 ${new Date(page.updated).toLocaleString('th-TH')}\n`;
            });
          }
        } else {
          response = '📄 ไม่พบหน้าใน Notion\n\n💡 ตรวจสอบการตั้งค่า API Key และ Database ID';
        }
      } else {
        response = '💡 คำสั่งที่เกี่ยวกับหน้า:\n• นับจำนวนหน้า\n• จำนวนหน้าทั้งหมด\n• ดูหน้าทั้งหมด';
      }
    }
    
    // แสดงรายการโปรเจค
    if (command.includes('โปรเจค') || command.includes('project')) {
      if (command.includes('แสดง') || command.includes('ดู') || command.includes('รายการ')) {
        const projectsResponse = await fetch(`http://localhost:${PORT}/api/projects`);
        const projectsData = await projectsResponse.json();
        
        if (projectsData.projects && projectsData.projects.length > 0) {
          response = `📋 รายการโปรเจคทั้งหมด (${projectsData.projects.length} รายการ):\n\n`;
          projectsData.projects.forEach((project, index) => {
            response += `${index + 1}. ${project.title}\n`;
            response += `   สถานะ: ${project.status}\n`;
            response += `   สร้างเมื่อ: ${new Date(project.created).toLocaleString('th-TH')}\n\n`;
          });
        } else {
          response = '📋 ไม่พบโปรเจคในระบบ\n\n💡 ลองสร้างโปรเจคใหม่ด้วยคำสั่ง: "สร้างโปรเจค [ชื่อโปรเจค]"';
        }
      } else if (command.includes('สร้าง')) {
        const projectName = command.replace(/สร้างโปรเจค?/gi, '').trim();
        if (projectName) {
          const createResponse = await fetch(`http://localhost:${PORT}/api/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: projectName, status: 'Planning' })
          });
          const createData = await createResponse.json();
          
          if (createData.success) {
            response = `✅ สร้างโปรเจค "${projectName}" สำเร็จ!\n\n`;
            response += `📊 รายละเอียด:\n`;
            response += `• ชื่อ: ${createData.project.name}\n`;
            response += `• สถานะ: ${createData.project.status}\n`;
            response += `• สร้างเมื่อ: ${new Date(createData.project.created).toLocaleString('th-TH')}\n\n`;
            response += `🔗 ID: ${createData.project.id}`;
          } else {
            response = `❌ ไม่สามารถสร้างโปรเจค "${projectName}" ได้\n\nเหตุผล: ${createData.message}`;
          }
        } else {
          response = '❌ กรุณาระบุชื่อโปรเจค\n\nตัวอย่าง: "สร้างโปรเจค Ashval Novel"';
        }
      }
    }
    
    // แสดงรายการงาน
    else if (command.includes('งาน') || command.includes('task')) {
      if (command.includes('แสดง') || command.includes('ดู') || command.includes('รายการ')) {
        const tasksResponse = await fetch(`http://localhost:${PORT}/api/tasks`);
        const tasksData = await tasksResponse.json();
        
        if (tasksData.tasks && tasksData.tasks.length > 0) {
          response = `📋 รายการงานทั้งหมด (${tasksData.tasks.length} รายการ):\n\n`;
          
          const todoTasks = tasksData.tasks.filter(t => t.status === 'To Do');
          const inProgressTasks = tasksData.tasks.filter(t => t.status === 'In Progress');
          const doneTasks = tasksData.tasks.filter(t => t.status === 'Done');
          
          if (todoTasks.length > 0) {
            response += `📝 งานที่ยังไม่เริ่ม (${todoTasks.length}):\n`;
            todoTasks.forEach((task, index) => {
              response += `${index + 1}. ${task.title} [${task.priority}]\n`;
            });
            response += '\n';
          }
          
          if (inProgressTasks.length > 0) {
            response += `🔄 งานที่กำลังทำ (${inProgressTasks.length}):\n`;
            inProgressTasks.forEach((task, index) => {
              response += `${index + 1}. ${task.title} [${task.priority}]\n`;
            });
            response += '\n';
          }
          
          if (doneTasks.length > 0) {
            response += `✅ งานที่เสร็จแล้ว (${doneTasks.length}):\n`;
            doneTasks.forEach((task, index) => {
              response += `${index + 1}. ${task.title}\n`;
            });
            response += '\n';
          }
          
          response += `📊 สรุป: เสร็จ ${doneTasks.length}/${tasksData.tasks.length} งาน`;
        } else {
          response = '📋 ไม่พบงานในระบบ\n\n💡 ลองสร้างงานใหม่ด้วยคำสั่ง: "สร้างงาน [ชื่องาน]"';
        }
      } else if (command.includes('สร้าง')) {
        const taskName = command.replace(/สร้างงาน?/gi, '').trim();
        if (taskName) {
          const createResponse = await fetch(`http://localhost:${PORT}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: taskName, status: 'To Do', priority: 'Medium' })
          });
          const createData = await createResponse.json();
          
          if (createData.success) {
            response = `✅ สร้างงาน "${taskName}" สำเร็จ!\n\n`;
            response += `📊 รายละเอียด:\n`;
            response += `• ชื่อ: ${createData.task.name}\n`;
            response += `• สถานะ: ${createData.task.status}\n`;
            response += `• ความสำคัญ: ${createData.task.priority}\n`;
            response += `• สร้างเมื่อ: ${new Date(createData.task.created).toLocaleString('th-TH')}\n\n`;
            response += `🔗 ID: ${createData.task.id}`;
          } else {
            response = `❌ ไม่สามารถสร้างงาน "${taskName}" ได้\n\nเหตุผล: ${createData.message}`;
          }
        } else {
          response = '❌ กรุณาระบุชื่องาน\n\nตัวอย่าง: "สร้างงาน เขียน Chapter 1"';
        }
      }
    }
    
    // คำสั่งอื่นๆ
    else if (command.includes('สวัสดี') || command.includes('hello')) {
      response = `🦄 สวัสดีครับ! ยินดีต้อนรับสู่ UnicornX Dashboard\n\n`;
      response += `🎯 คำสั่งที่ใช้ได้:\n`;
      response += `• แสดงรายการโปรเจค\n`;
      response += `• สร้างโปรเจค [ชื่อ]\n`;
      response += `• แสดงรายการงาน\n`;
      response += `• สร้างงาน [ชื่อ]\n\n`;
      response += `📊 สถานะ: ${notion ? 'เชื่อมต่อ Notion แล้ว' : 'ยังไม่เชื่อมต่อ Notion'}`;
    }
    
    else {
      response = `🤔 ไม่เข้าใจคำสั่ง "${command}"\n\n`;
      response += `💡 คำสั่งที่ใช้ได้:\n`;
      response += `• แสดงรายการโปรเจค\n`;
      response += `• สร้างโปรเจค [ชื่อ]\n`;
      response += `• แสดงรายการงาน\n`;
      response += `• สร้างงาน [ชื่อ]\n`;
      response += `• สวัสดี\n\n`;
      response += `ตัวอย่าง: "สร้างโปรเจค Ashval Novel"`;
    }
    
    res.json({
      command: command,
      response: response,
      data: data,
      timestamp: new Date().toISOString(),
      processed: true
    });
    
  } catch (error) {
    console.error('❌ Command Error:', error);
    res.status(500).json({
      command: command,
      response: `❌ เกิดข้อผิดพลาด: ${error.message}`,
      timestamp: new Date().toISOString(),
      processed: false,
      error: true
    });
  }
});

// Main dashboard page
const dashboardLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.get('/', dashboardLimiter, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🦄 UnicornX Dashboard running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Notion Status: ${notion ? 'Connected' : 'Setup .env file'}`);
  console.log(`📋 Databases: ${Object.values(DATABASES).filter(Boolean).length}/5 configured`);
});

module.exports = app;
