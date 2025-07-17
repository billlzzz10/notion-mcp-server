import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_TOKEN });

const YOUTUBE_DB_ID = '2325e81a91ff80c9a0dbc323e1683f5f';

async function checkYouTubeDbSchema() {
  try {
    console.log('🔍 กำลังเช็คโครงสร้างฐานข้อมูล YouTube Analysis...');
    console.log(`📊 Database ID: ${YOUTUBE_DB_ID}\n`);

    // Get database schema
    const database = await notion.databases.retrieve({
      database_id: YOUTUBE_DB_ID
    });

    console.log(`📋 ชื่อฐานข้อมูล: ${database.title[0]?.text?.content || 'ไม่มีชื่อ'}\n`);
    
    console.log('🏗️  Properties ที่มีอยู่:');
    console.log('=' .repeat(50));

    const properties = database.properties;
    
    for (const [propName, propConfig] of Object.entries(properties)) {
      console.log(`📌 ${propName}`);
      console.log(`   ประเภท: ${propConfig.type}`);
      
      // Show additional details based on property type
      switch (propConfig.type) {
        case 'select':
          if (propConfig.select?.options?.length > 0) {
            console.log(`   ตัวเลือก: ${propConfig.select.options.map(opt => opt.name).join(', ')}`);
          }
          break;
        case 'multi_select':
          if (propConfig.multi_select?.options?.length > 0) {
            console.log(`   ตัวเลือก: ${propConfig.multi_select.options.map(opt => opt.name).join(', ')}`);
          }
          break;
        case 'relation':
          console.log(`   เชื่อมโยงกับ: ${propConfig.relation?.database_id}`);
          break;
        case 'formula':
          console.log(`   สูตร: ${propConfig.formula?.expression}`);
          break;
      }
      console.log('');
    }

    // Get a few sample pages to see the data structure
    console.log('📄 ตัวอย่างข้อมูลที่มีอยู่ (5 รายการแรก):');
    console.log('=' .repeat(50));

    const pages = await notion.databases.query({
      database_id: YOUTUBE_DB_ID,
      page_size: 5
    });

    if (pages.results.length === 0) {
      console.log('❌ ไม่มีข้อมูลในฐานข้อมูล');
    } else {
      pages.results.forEach((page, index) => {
        console.log(`\n📋 รายการที่ ${index + 1}:`);
        
        // Show title
        const titleProp = Object.entries(page.properties).find(([name, prop]) => prop.type === 'title');
        if (titleProp) {
          const titleText = titleProp[1].title?.[0]?.text?.content || 'ไม่มีชื่อ';
          console.log(`   ชื่อ: ${titleText}`);
        }

        // Show YouTube URL if exists
        for (const [propName, propValue] of Object.entries(page.properties)) {
          if (propName.toLowerCase().includes('url') || propName.toLowerCase().includes('link')) {
            if (propValue.type === 'url' && propValue.url) {
              console.log(`   ${propName}: ${propValue.url}`);
            } else if (propValue.type === 'rich_text' && propValue.rich_text?.[0]?.text?.content) {
              const text = propValue.rich_text[0].text.content;
              if (text.includes('youtube.com') || text.includes('youtu.be')) {
                console.log(`   ${propName}: ${text}`);
              }
            }
          }
        }
      });
    }

    console.log('\n✅ เช็คโครงสร้างฐานข้อมูลเสร็จสิ้น');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    if (error.code === 'object_not_found') {
      console.error('🔍 ตรวจสอบ Database ID หรือสิทธิ์การเข้าถึง');
    }
  }
}

// Run the check
checkYouTubeDbSchema();
