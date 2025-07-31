import dotenv from 'dotenv';
dotenv.config();

/**
 * ลบ Project ที่ซ้ำกัน เก็บไว้แค่ Project ล่าสุด
 */
async function cleanupDuplicateProjects() {
  console.log('🧹 ทำความสะอาด Projects ที่ซ้ำกัน');
  console.log('=====================================');

  try {
    // 1. ค้นหา Projects ที่ชื่อคล้ายกัน
    const duplicateProjects = await findDuplicateProjects();
    
    if (duplicateProjects.length <= 1) {
      console.log('✅ ไม่พบ Project ซ้ำกัน');
      return;
    }

    console.log(`📋 พบ ${duplicateProjects.length} Projects ที่ซ้ำกัน:`);
    duplicateProjects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name} (สร้างเมื่อ: ${new Date(project.created_time).toLocaleString('th-TH')})`);
      console.log(`   ID: ${project.id}`);
    });

    // 2. เรียงตามวันที่สร้าง (ล่าสุดก่อน)
    duplicateProjects.sort((a, b) => new Date(b.created_time) - new Date(a.created_time));
    
    const latestProject = duplicateProjects[0];
    const projectsToDelete = duplicateProjects.slice(1);

    console.log(`\n✅ เก็บ Project ล่าสุด: "${latestProject.name}"`);
    console.log(`   สร้างเมื่อ: ${new Date(latestProject.created_time).toLocaleString('th-TH')}`);
    console.log(`   ID: ${latestProject.id}`);

    if (projectsToDelete.length > 0) {
      console.log(`\n🗑️ จะลบ ${projectsToDelete.length} Projects เก่า:`);
      
      for (let i = 0; i < projectsToDelete.length; i++) {
        const project = projectsToDelete[i];
        console.log(`\n${i + 1}. กำลังลบ: "${project.name}"`);
        
        try {
          // ลบ Tasks ที่เชื่อมโยงกับ Project นี้ก่อน
          await deleteProjectTasks(project.id);
          
          // จากนั้นลบ Project
          await deleteProject(project.id);
          
          console.log(`   ✅ ลบสำเร็จ`);
          
          // หน่วงเวลาเล็กน้อย
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.log(`   ❌ ไม่สามารถลบได้: ${error.message}`);
        }
      }
    }

    console.log('\n🎯 ทำความสะอาดเสร็จสิ้น!');
    console.log(`📊 Project ที่เหลือ: 1 Project`);
    console.log(`🔗 Project ID: ${latestProject.id}`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

/**
 * ค้นหา Projects ที่ซ้ำกัน
 */
async function findDuplicateProjects() {
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_PROJECTS_DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: {
          property: "Name",
          title: {
            contains: "MCP Server v3.0"
          }
        },
        sorts: [
          {
            property: "Start Date",
            direction: "descending"
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`ไม่สามารถค้นหา Projects ได้: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results.map(project => ({
      id: project.id,
      name: project.properties.Name?.title?.[0]?.text?.content || 'ไม่มีชื่อ',
      created_time: project.created_time,
      status: project.properties.Status?.select?.name || 'Unknown'
    }));

  } catch (error) {
    console.error('❌ Error finding projects:', error.message);
    return [];
  }
}

/**
 * ลบ Tasks ที่เชื่อมโยงกับ Project
 */
async function deleteProjectTasks(projectId) {
  try {
    // ค้นหา Tasks ที่เชื่อมโยงกับ Project นี้
    const response = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_TASKS_DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: {
          property: "Project",
          relation: {
            contains: projectId
          }
        }
      })
    });

    if (!response.ok) return;

    const data = await response.json();
    const tasks = data.results;

    if (tasks.length > 0) {
      console.log(`   📝 พบ ${tasks.length} Tasks ที่เชื่อมโยง - กำลังลบ...`);
      
      for (const task of tasks) {
        try {
          await fetch(`https://api.notion.com/v1/pages/${task.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
              'Notion-Version': '2022-06-28',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              archived: true
            })
          });
        } catch (error) {
          console.log(`   ⚠️ ไม่สามารถลบ Task ${task.id}: ${error.message}`);
        }
      }
      console.log(`   ✅ ลบ Tasks เสร็จสิ้น`);
    }

  } catch (error) {
    console.error('❌ Error deleting tasks:', error.message);
  }
}

/**
 * ลบ Project
 */
async function deleteProject(projectId) {
  try {
    const response = await fetch(`https://api.notion.com/v1/pages/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        archived: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

  } catch (error) {
    throw new Error(`ไม่สามารถลบ Project ได้: ${error.message}`);
  }
}

/**
 * แสดงสถานะ Projects หลังทำความสะอาด
 */
async function showRemainingProjects() {
  try {
    console.log('\n📊 Projects ที่เหลืออยู่:');
    console.log('========================');
    
    const response = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_PROJECTS_DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: {
          property: "Name",
          title: {
            contains: "MCP Server v3.0"
          }
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.results.length > 0) {
        data.results.forEach((project, index) => {
          const name = project.properties.Name?.title?.[0]?.text?.content || 'ไม่มีชื่อ';
          const status = project.properties.Status?.select?.name || 'Unknown';
          const created = new Date(project.created_time).toLocaleString('th-TH');
          
          console.log(`${index + 1}. ${name}`);
          console.log(`   สถานะ: ${status}`);
          console.log(`   สร้างเมื่อ: ${created}`);
          console.log(`   ID: ${project.id}`);
        });
      } else {
        console.log('ไม่พบ Project ที่ตรงเงื่อนไข');
      }
    }
  } catch (error) {
    console.error('❌ Error showing projects:', error.message);
  }
}

// รันการทำความสะอาด
cleanupDuplicateProjects()
  .then(() => showRemainingProjects())
  .catch(console.error);
