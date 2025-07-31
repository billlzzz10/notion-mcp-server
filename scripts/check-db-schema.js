// Check Projects Database Schema
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabaseSchema() {
  console.log('🔍 ตรวจสอบ Database Schema...');
  
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const projectsDbId = process.env.NOTION_PROJECTS_DB_ID;
  
  try {
    const database = await notion.databases.retrieve({ database_id: projectsDbId });
    
    console.log('\n📊 Database Properties:');
    console.log('='.repeat(50));
    
    const properties = database.properties;
    
    Object.entries(properties).forEach(([key, property]) => {
      console.log(`🔸 ${key}:`);
      console.log(`   Type: ${property.type}`);
      
      if (property.type === 'select' && property.select?.options) {
        console.log(`   Options: ${property.select.options.map(opt => opt.name).join(', ')}`);
      }
      
      if (property.type === 'multi_select' && property.multi_select?.options) {
        console.log(`   Options: ${property.multi_select.options.map(opt => opt.name).join(', ')}`);
      }
      
      console.log('');
    });
    
    // แสดงตัวอย่าง page ที่มีอยู่
    const pages = await notion.databases.query({
      database_id: projectsDbId,
      page_size: 1
    });
    
    if (pages.results.length > 0) {
      console.log('\n📄 ตัวอย่าง Page Properties:');
      console.log('='.repeat(50));
      
      const page = pages.results[0];
      Object.entries(page.properties).forEach(([key, value]) => {
        console.log(`🔸 ${key}: ${JSON.stringify(value, null, 2)}`);
      });
    }
    
    // สร้าง YouTube Analyzer properties ที่ถูกต้อง
    console.log('\n💡 แนะนำ Properties สำหรับ YouTube Analyzer:');
    console.log('='.repeat(50));
    
    const requiredProperties = {
      'Name': 'title',
      'Type': 'select', 
      'Status': 'select'
    };
    
    const missingProperties = [];
    
    Object.entries(requiredProperties).forEach(([propName, propType]) => {
      if (properties[propName]) {
        console.log(`✅ ${propName} (${properties[propName].type}) - พร้อมใช้`);
      } else {
        console.log(`❌ ${propName} - ไม่พบ`);
        missingProperties.push(propName);
      }
    });
    
    if (missingProperties.length > 0) {
      console.log(`\n⚠️ Properties ที่ขาดหายไป: ${missingProperties.join(', ')}`);
    } else {
      console.log('\n🎉 Database มี properties ที่จำเป็นครบถ้วน!');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkDatabaseSchema().catch(console.error);
