#!/usr/bin/env node

/**
 * Enhanced Technology Demo Script
 * สาธิตการใช้งานเทคโนโลยีใหม่ใน Notion MCP Server
 */

import { vectorSearchService } from '../backend/src/services/vectorSearchService.js';

const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

function print(text, color = 'reset') {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

async function demoVectorSearch() {
  print('\n🧠 Vector Search Demo', 'blue');
  print('='.repeat(50), 'blue');

  try {
    // Initialize vector service
    print('\n🔧 Initializing Vector Search Service...', 'yellow');
    await vectorSearchService.initialize();
    
    // Health check
    print('\n🏥 Health Check...', 'yellow');
    const health = await vectorSearchService.healthCheck();
    print(`Status: ${health.status}`, health.status === 'healthy' ? 'green' : 'red');
    print(`Collections: ${health.collections.join(', ')}`, 'green');

    // Demo semantic search
    print('\n🔍 Demo Semantic Search...', 'yellow');
    const searchQueries = [
      'ตัวละครที่มีพลังมืด',
      'ฉากการต่อสู้ที่เข้มข้น',
      'สถานที่ลึกลับน่ากลัว'
    ];

    for (const query of searchQueries) {
      print(`\nค้นหา: "${query}"`, 'blue');
      try {
        const results = await vectorSearchService.semanticSearch(query, ['characters', 'scenes', 'locations'], 3);
        
        if (results.length === 0) {
          print('  ไม่พบผลลัพธ์ - อาจจะยังไม่มีข้อมูลใน vector database', 'yellow');
        } else {
          results.forEach((result, index) => {
            const similarity = Math.round(result.similarity * 100);
            print(`  ${index + 1}. ${result.metadata.name || result.metadata.title || 'ไม่มีชื่อ'} (${similarity}%)`, 'green');
          });
        }
      } catch (error) {
        print(`  ❌ ข้อผิดพลาด: ${error.message}`, 'red');
      }
    }

    print('\n✅ Vector Search Demo สำเร็จ!', 'green');

  } catch (error) {
    print(`\n❌ ข้อผิดพลาดในการ demo: ${error.message}`, 'red');
    print('💡 แนะนำ: ตรวจสอบการตั้งค่า CHROMADB_URL ใน .env', 'yellow');
  }
}

async function demoContentIndexing() {
  print('\n📚 Content Indexing Demo', 'blue');
  print('='.repeat(50), 'blue');

  try {
    // Example character data
    const exampleCharacter = {
      id: 'demo-character-001',
      properties: {
        Name: {
          title: [{ text: { content: 'เซลาร์ นักสู้แห่งแสงสว่าง' } }]
        },
        Description: {
          rich_text: [{ text: { content: 'นักสู้ผู้กล้าที่ใช้พลังแสงสว่างในการต่อสู้กับความชั่วร้าย มีดาบศักดิ์สิทธิ์ที่สามารถกำจัดปีศาจได้' } }]
        },
        Personality: {
          rich_text: [{ text: { content: 'กล้าหาญ ยุติธรรม มีความเมตตา แต่เข้มงวดกับความผิด' } }]
        },
        Role: {
          select: { name: 'ฮีโร่' }
        }
      }
    };

    print('\n📝 กำลัง index ตัวอย่างตัวละคร...', 'yellow');
    await vectorSearchService.indexCharacter(exampleCharacter);
    print('✅ Index ตัวละครสำเร็จ!', 'green');

    // Example scene data
    const exampleScene = {
      id: 'demo-scene-001',
      properties: {
        Title: {
          title: [{ text: { content: 'การต่อสู้ครั้งสุดท้ายที่ปราสาทมืด' } }]
        },
        Description: {
          rich_text: [{ text: { content: 'ฉากสุดท้ายที่เซลาร์ต้องเผชิหน้ากับจ้าวปีศาจในปราสาทที่มืดมิด แสงจากดาบศักดิ์สิทธิ์เป็นเพียงแสงเดียวที่ส่องสว่างในความมืดมิด' } }]
        },
        Characters: {
          multi_select: [
            { name: 'เซลาร์' },
            { name: 'จ้าวปีศาจ' }
          ]
        },
        Location: {
          select: { name: 'ปราสาทมืด' }
        },
        Mood: {
          select: { name: 'เข้มข้น' }
        }
      }
    };

    print('\n🎬 กำลัง index ตัวอย่างฉาก...', 'yellow');
    await vectorSearchService.indexScene(exampleScene);
    print('✅ Index ฉากสำเร็จ!', 'green');

    // Test search with new content
    print('\n🔍 ทดสอบค้นหาข้อมูลที่เพิ่งเพิ่ม...', 'yellow');
    const searchResults = await vectorSearchService.semanticSearch('นักสู้ใช้ดาบ', ['characters', 'scenes'], 5);
    
    if (searchResults.length > 0) {
      print(`พบผลลัพธ์ ${searchResults.length} รายการ:`, 'green');
      searchResults.forEach((result, index) => {
        const similarity = Math.round(result.similarity * 100);
        print(`  ${index + 1}. ${result.metadata.name || result.metadata.title} (${similarity}%)`, 'green');
      });
    }

    print('\n✅ Content Indexing Demo สำเร็จ!', 'green');

  } catch (error) {
    print(`\n❌ ข้อผิดพลาดในการ demo indexing: ${error.message}`, 'red');
  }
}

async function showUsageInstructions() {
  print('\n📖 Usage Instructions', 'blue');
  print('='.repeat(50), 'blue');

  print('\n🚀 วิธีเริ่มใช้เทคโนโลยีใหม่:', 'yellow');
  print('1. ติดตั้ง dependencies:', 'reset');
  print('   ./scripts/install-enhancements.sh', 'green');
  
  print('\n2. ตั้งค่า environment variables ใน .env:', 'reset');
  print('   CHROMADB_URL=http://localhost:8000', 'green');
  print('   PINECONE_API_KEY=your_pinecone_key', 'green');
  print('   REDIS_URL=redis://localhost:6379', 'green');

  print('\n3. เริ่มใช้ MCP tools ใหม่:', 'reset');
  print('   - semantic_search: ค้นหาแบบ AI', 'green');
  print('   - find_similar_content: หาเนื้อหาคล้ายกัน', 'green');
  print('   - get_content_recommendations: คำแนะนำเนื้อหา', 'green');
  print('   - detect_plot_holes: ตรวจหาช่องโหว่ในเรื่อง', 'green');

  print('\n4. เรียนรู้เพิ่มเติม:', 'reset');
  print('   📚 docs/TECHNOLOGY-ENHANCEMENT-PROPOSAL.md', 'green');
  print('   📚 docs/MCP-USAGE-GUIDE.md', 'green');

  print('\n💡 Tips:', 'yellow');
  print('- รัน health check ก่อนใช้งาน: vectorSearchService.healthCheck()', 'reset');
  print('- Index เนื้อหาเดิมก่อน: vectorSearchService.indexAllContent()', 'reset');
  print('- ใช้ MCP Inspector เพื่อทดสอบ tools ใหม่', 'reset');
}

async function main() {
  print('\n🚀 Enhanced Technology Demo for Notion MCP Server', 'blue');
  print('สาธิตเทคโนโลยีใหม่ที่เพิ่มเข้ามาในระบบ', 'blue');
  print('='.repeat(60), 'blue');

  try {
    await demoVectorSearch();
    await demoContentIndexing();
    await showUsageInstructions();

    print('\n🎉 Demo สำเร็จ! ระบบพร้อมใช้งานเทคโนโลยีใหม่', 'green');
    print('💬 สำหรับคำถามหรือข้อเสนอแนะ: เปิด GitHub Issue', 'blue');

  } catch (error) {
    print(`\n💥 ข้อผิดพลาดใน demo: ${error.message}`, 'red');
    print('\n🔧 วิธีแก้ไข:', 'yellow');
    print('1. ตรวจสอบ .env configuration', 'reset');
    print('2. รัน: npm run build', 'reset');
    print('3. เริ่ม ChromaDB: docker run -p 8000:8000 chromadb/chroma', 'reset');
    print('4. ลองรันอีกครั้ง', 'reset');
  }
}

// เริ่มการ demo
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}