import { Client } from '@notionhq/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class NotionPagesFetcher {
  constructor() {
    this.pageIds = [
      '2315e81a91ff80f79535dc7569e52385', // Page 1
      '2325e81a91ff80e2a4f0f3332f7491fa'  // Page 2
    ];
  }

  async fetchPageContent(pageId) {
    try {
      console.log(`📄 กำลังดึงข้อมูล Page: ${pageId}`);
      console.log(`🔗 URL: https://www.notion.so/${pageId}`);
      
      // Get page metadata
      console.log(`   ⏳ กำลังดึง metadata...`);
      const page = await notion.pages.retrieve({ page_id: pageId });
      console.log(`   ✅ ดึง metadata สำเร็จ`);
      
      // Get page blocks (content)
      console.log(`   ⏳ กำลังดึง blocks...`);
      const blocks = await notion.blocks.children.list({
        block_id: pageId,
        page_size: 100
      });
      console.log(`   ✅ ดึง ${blocks.results.length} blocks สำเร็จ`);
      
      const result = {
        id: pageId,
        title: this.extractTitle(page),
        properties: page.properties,
        blocks: blocks.results,
        content: this.extractTextContent(blocks.results),
        metadata: {
          created_time: page.created_time,
          last_edited_time: page.last_edited_time,
          created_by: page.created_by,
          last_edited_by: page.last_edited_by
        }
      };
      
      console.log(`   📝 Title: ${result.title}`);
      console.log(`   📊 Content Length: ${result.content.length} characters`);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Error fetching page ${pageId}:`, error.message);
      console.error(`   🔍 Error Code: ${error.code}`);
      console.error(`   📋 Full Error:`, error);
      
      return {
        id: pageId,
        title: `Error: ${error.message}`,
        error: true,
        content: '',
        errorDetails: error.message,
        errorCode: error.code
      };
    }
  }

  extractTitle(page) {
    // Extract title from different property types
    if (page.properties) {
      for (const [key, property] of Object.entries(page.properties)) {
        if (property.type === 'title' && property.title.length > 0) {
          return property.title[0].plain_text;
        }
      }
    }
    return 'Untitled Page';
  }

  extractTextContent(blocks) {
    let content = '';
    
    blocks.forEach(block => {
      switch (block.type) {
        case 'paragraph':
          if (block.paragraph.rich_text.length > 0) {
            content += block.paragraph.rich_text.map(text => text.plain_text).join('') + '\n';
          }
          break;
        case 'heading_1':
          if (block.heading_1.rich_text.length > 0) {
            content += '# ' + block.heading_1.rich_text.map(text => text.plain_text).join('') + '\n';
          }
          break;
        case 'heading_2':
          if (block.heading_2.rich_text.length > 0) {
            content += '## ' + block.heading_2.rich_text.map(text => text.plain_text).join('') + '\n';
          }
          break;
        case 'heading_3':
          if (block.heading_3.rich_text.length > 0) {
            content += '### ' + block.heading_3.rich_text.map(text => text.plain_text).join('') + '\n';
          }
          break;
        case 'bulleted_list_item':
          if (block.bulleted_list_item.rich_text.length > 0) {
            content += '• ' + block.bulleted_list_item.rich_text.map(text => text.plain_text).join('') + '\n';
          }
          break;
        case 'numbered_list_item':
          if (block.numbered_list_item.rich_text.length > 0) {
            content += '1. ' + block.numbered_list_item.rich_text.map(text => text.plain_text).join('') + '\n';
          }
          break;
        case 'code':
          if (block.code.rich_text.length > 0) {
            content += '```\n' + block.code.rich_text.map(text => text.plain_text).join('') + '\n```\n';
          }
          break;
        case 'quote':
          if (block.quote.rich_text.length > 0) {
            content += '> ' + block.quote.rich_text.map(text => text.plain_text).join('') + '\n';
          }
          break;
        case 'table':
          content += '[TABLE]\n';
          break;
        case 'database':
          content += '[DATABASE]\n';
          break;
        case 'child_database':
          content += '[CHILD_DATABASE]\n';
          break;
        case 'divider':
          content += '---\n';
          break;
        case 'callout':
          if (block.callout && block.callout.rich_text.length > 0) {
            content += '📋 ' + block.callout.rich_text.map(text => text.plain_text).join('') + '\n';
          }
          break;
      }
    });
    
    return content;
  }

  async analyzeSystemCapabilities(pagesData) {
    console.log('🤖 เริ่มวิเคราะห์ความสามารถระบบด้วย AI...');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const systemInfo = {
      currentTools: [
        'auto-update-projects.js',
        'check-data-quality.js', 
        'check-db-structure.js',
        'check-status-options.js',
        'cleanup-duplicates.js',
        'create-project-roadmap.js',
        'subtasks-reports-agent.js',
        'youtubeAnalyzer.js',
        'ashval-bot.js (Telegram)',
        'mobile-ready.html (Web Interface)'
      ],
      databases: {
        characters: process.env.NOTION_CHARACTERS_DB_ID,
        scenes: process.env.NOTION_SCENES_DB_ID,
        chapters: process.env.NOTION_CHAPTERS_DB_ID,
        locations: process.env.NOTION_LOCATIONS_DB_ID,
        projects: process.env.NOTION_PROJECTS_DB_ID,
        tasks: process.env.NOTION_TASKS_DB_ID,
        subtasks: process.env.NOTION_SUBTASKS_DB_ID,
        reports: process.env.NOTION_REPORTS_DB_ID,
        ai_prompts: process.env.NOTION_AI_PROMPTS_DB_ID
      },
      integrations: {
        telegram: process.env.TELEGRAM_BOT_TOKEN ? 'enabled' : 'disabled',
        gemini: process.env.GEMINI_API_KEY ? 'enabled' : 'disabled',
        makecom: process.env.MAKE_WEBHOOK_URL ? 'enabled' : 'disabled'
      }
    };

    const prompt = `
    วิเคราะห์ข้อมูลจาก Notion Pages และเปรียบเทียบกับความสามารถระบบปัจจุบัน:

    === ข้อมูลจาก Notion Pages ===
    ${pagesData.map(page => `
    หน้า: ${page.title}
    สถานะ: ${page.error ? 'Error - ' + page.errorDetails : 'Success'}
    เนื้อหา: ${page.content.substring(0, 1000)}...
    `).join('\n')}

    === ความสามารถระบบปัจจุบัน ===
    ${JSON.stringify(systemInfo, null, 2)}

    === คำถามที่ต้องวิเคราะห์ ===
    1. ระบบเรามีเครื่องมือใดแล้วบ้างที่ตรงกับความต้องการใน Notion Pages?
    2. มีเครื่องมือใดที่ยังไม่ได้ใช้หรือทดสอบจริง?
    3. ข้อมูลใน Notion Pages ชี้ให้เห็นถึงความต้องการใดที่ระบบยังไม่มี?
    4. แนะนำลำดับความสำคัญของงานที่ควรทำต่อไป
    5. ฟีเจอร์ใดที่ควรทดสอบในทันที (เช่น YouTube Analyzer, TTS, Colab integration)

    โปรดตอบเป็นภาษาไทยในรูปแบบรายงานที่ชัดเจน พร้อมข้อเสนอแนะที่ปฏิบัติได้จริง
    `;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('❌ AI Analysis Error:', error);
      return 'ไม่สามารถวิเคราะห์ด้วย AI ได้ในขณะนี้';
    }
  }

  async generateReport(pagesData, aiAnalysis) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPages: pagesData.length,
        successfulFetches: pagesData.filter(p => !p.error).length,
        errors: pagesData.filter(p => p.error).length
      },
      pages: pagesData,
      aiAnalysis: aiAnalysis,
      systemStatus: {
        databases: Object.keys({
          characters: process.env.NOTION_CHARACTERS_DB_ID,
          scenes: process.env.NOTION_SCENES_DB_ID,
          chapters: process.env.NOTION_CHAPTERS_DB_ID,
          locations: process.env.NOTION_LOCATIONS_DB_ID,
          projects: process.env.NOTION_PROJECTS_DB_ID,
          tasks: process.env.NOTION_TASKS_DB_ID,
          subtasks: process.env.NOTION_SUBTASKS_DB_ID,
          reports: process.env.NOTION_REPORTS_DB_ID,
          ai_prompts: process.env.NOTION_AI_PROMPTS_DB_ID
        }).length,
        tools: [
          'auto-update-projects.js',
          'check-data-quality.js', 
          'check-db-structure.js',
          'check-status-options.js',
          'cleanup-duplicates.js',
          'create-project-roadmap.js',
          'subtasks-reports-agent.js',
          'youtubeAnalyzer.js',
          'ashval-bot.js',
          'mobile-ready.html'
        ]
      }
    };

    // Save report to file
    await fs.writeFile(
      'notion-pages-analysis-report.json',
      JSON.stringify(report, null, 2),
      'utf8'
    );

    // Create markdown summary
    const markdownReport = `# 📊 รายงานการวิเคราะห์ Notion Pages

## 📈 สรุปผลลัพธ์
- **จำนวนหน้าที่วิเคราะห์**: ${report.summary.totalPages}
- **ดึงข้อมูลสำเร็จ**: ${report.summary.successfulFetches}
- **ข้อผิดพลาด**: ${report.summary.errors}
- **วันที่วิเคราะห์**: ${new Date().toLocaleString('th-TH')}

## 📄 รายละเอียดหน้าที่วิเคราะห์

${pagesData.map((page, index) => `
### ${index + 1}. ${page.title}
${page.error ? `❌ **Error**: ${page.errorDetails}

**Page ID**: ${page.id}
**สาเหตุ**: อาจเป็นเพราะ Page ID ไม่ถูกต้องหรือไม่มีสิทธิ์เข้าถึง
` : `
✅ **สถานะ**: ดึงข้อมูลสำเร็จ
**หัวข้อ**: ${page.title}
**อัปเดตล่าสุด**: ${page.metadata?.last_edited_time ? new Date(page.metadata.last_edited_time).toLocaleString('th-TH') : 'ไม่ทราบ'}

**เนื้อหาตัวอย่าง**:
\`\`\`
${page.content.substring(0, 500)}${page.content.length > 500 ? '...' : ''}
\`\`\`

**จำนวน Blocks**: ${page.blocks ? page.blocks.length : 0}
**ขนาดเนื้อหา**: ${page.content.length} ตัวอักษร
`}
`).join('\n')}

## 🤖 การวิเคราะห์ด้วย AI

${aiAnalysis}

## 🛠️ สถานะระบบปัจจุบัน

### 💾 ฐานข้อมูลที่มี (${report.systemStatus.databases} ฐาน)
- **Characters**: ${process.env.NOTION_CHARACTERS_DB_ID}
- **Scenes**: ${process.env.NOTION_SCENES_DB_ID}  
- **Chapters**: ${process.env.NOTION_CHAPTERS_DB_ID}
- **Locations**: ${process.env.NOTION_LOCATIONS_DB_ID}
- **Projects**: ${process.env.NOTION_PROJECTS_DB_ID}
- **Tasks**: ${process.env.NOTION_TASKS_DB_ID}
- **Subtasks**: ${process.env.NOTION_SUBTASKS_DB_ID}
- **Reports**: ${process.env.NOTION_REPORTS_DB_ID}
- **AI Prompts**: ${process.env.NOTION_AI_PROMPTS_DB_ID}

### 🔧 เครื่องมือที่มี (${report.systemStatus.tools.length} เครื่องมือ)
${report.systemStatus.tools.map(tool => `- ✅ ${tool}`).join('\n')}

### 🔌 การเชื่อมต่อ
- **Telegram Bot**: ${process.env.TELEGRAM_BOT_TOKEN ? '✅ เชื่อมต่อแล้ว' : '❌ ยังไม่เชื่อมต่อ'}
- **Gemini AI**: ${process.env.GEMINI_API_KEY ? '✅ เชื่อมต่อแล้ว' : '❌ ยังไม่เชื่อมต่อ'}
- **Make.com**: ${process.env.MAKE_WEBHOOK_URL ? '✅ เชื่อมต่อแล้ว' : '❌ ยังไม่เชื่อมต่อ'}

---
*รายงานนี้สร้างโดยระบบ Notion MCP Server อัตโนมัติ*
*เวลาที่สร้าง: ${new Date().toLocaleString('th-TH')}*
`;

    await fs.writeFile(
      'notion-pages-analysis-report.md',
      markdownReport,
      'utf8'
    );

    return report;
  }

  async run() {
    console.log('🚀 เริ่มการดึงข้อมูลและวิเคราะห์ Notion Pages...');
    console.log(`🔑 ใช้ Notion Token: ${process.env.NOTION_TOKEN ? '✅ พร้อม' : '❌ ไม่พบ'}`);
    console.log(`🤖 ใช้ Gemini API: ${process.env.GEMINI_API_KEY ? '✅ พร้อม' : '❌ ไม่พบ'}`);
    console.log('');
    
    // Fetch all pages
    const pagesData = [];
    for (const pageId of this.pageIds) {
      const pageData = await this.fetchPageContent(pageId);
      pagesData.push(pageData);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n📊 === ผลการดึงข้อมูล ===');
    pagesData.forEach((page, index) => {
      if (page.error) {
        console.log(`${index + 1}. ❌ ${page.title}`);
        console.log(`   📝 ${page.errorDetails}`);
      } else {
        console.log(`${index + 1}. ✅ ${page.title} (${page.content.length} characters)`);
        console.log(`   📝 Blocks: ${page.blocks.length}, Updated: ${page.metadata?.last_edited_time ? new Date(page.metadata.last_edited_time).toLocaleDateString('th-TH') : 'Unknown'}`);
      }
    });

    // AI Analysis
    const aiAnalysis = await this.analyzeSystemCapabilities(pagesData);

    // Generate comprehensive report
    const report = await this.generateReport(pagesData, aiAnalysis);

    console.log('\n📋 === รายงานการวิเคราะห์เสร็จสิ้น ===');
    console.log('📄 ไฟล์รายงาน: notion-pages-analysis-report.md');
    console.log('📊 ข้อมูล JSON: notion-pages-analysis-report.json');
    
    console.log('\n🎯 === สรุปการวิเคราะห์ ===');
    console.log(aiAnalysis);

    return report;
  }
}

// Export and run
export default NotionPagesFetcher;

if (import.meta.url === `file://${process.argv[1]}`) {
  const fetcher = new NotionPagesFetcher();
  fetcher.run().catch(console.error);
}
