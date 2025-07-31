import dotenv from 'dotenv';
dotenv.config();

async function checkStatusOptions() {
  console.log('🔍 ตรวจสอบ Status Options ในฐานข้อมูล Tasks');
  console.log('==============================================');
  
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_TASKS_DB_ID}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28'
      }
    });
    
    if (response.ok) {
      const database = await response.json();
      
      // หา Status property
      const statusProperty = database.properties.Status;
      if (statusProperty && statusProperty.type === 'status') {
        console.log('📊 Status Options ที่มีอยู่:');
        if (statusProperty.status && statusProperty.status.options) {
          statusProperty.status.options.forEach((option, index) => {
            console.log(`   ${index + 1}. "${option.name}" (${option.color})`);
          });
        }
      }
      
      // หา Priority options
      const priorityProperty = database.properties.Priority;
      if (priorityProperty && priorityProperty.type === 'select') {
        console.log('\n🎯 Priority Options ที่มีอยู่:');
        if (priorityProperty.select && priorityProperty.select.options) {
          priorityProperty.select.options.forEach((option, index) => {
            console.log(`   ${index + 1}. "${option.name}" (${option.color})`);
          });
        }
      }
      
      // หา Type options
      const typeProperty = database.properties.Type;
      if (typeProperty && typeProperty.type === 'select') {
        console.log('\n🏷️ Type Options ที่มีอยู่:');
        if (typeProperty.select && typeProperty.select.options) {
          typeProperty.select.options.forEach((option, index) => {
            console.log(`   ${index + 1}. "${option.name}" (${option.color})`);
          });
        }
      }
      
    } else {
      console.log('❌ ไม่สามารถเข้าถึงฐานข้อมูล Tasks ได้');
    }
    
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

checkStatusOptions().catch(console.error);
