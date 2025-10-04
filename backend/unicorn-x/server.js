/**
 * UnicornX - AI-Powered Notion Assistant
 * Working JavaScript version
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@notionhq/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple logger
const logger = {
  info: (msg, meta = '') => console.log(`[INFO] ${msg}`, typeof meta === 'object' ? JSON.stringify(meta) : meta),
  error: (msg, meta = '') => console.error(`[ERROR] ${msg}`, typeof meta === 'object' ? JSON.stringify(meta) : meta),
  warn: (msg, meta = '') => console.warn(`[WARN] ${msg}`, typeof meta === 'object' ? JSON.stringify(meta) : meta)
};

// Initialize Express app
const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    message: '🦄 UnicornX is running!'
  });
});

/**
 * Process natural language command
 */
app.post('/api/commands/process', async (req, res) => {
  try {
    const { input, context, userId } = req.body;

    if (!input || typeof input !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Command input is required and must be a string'
      });
    }

    logger.info('Processing command', { input, userId });

    // Simple processing logic
    let action = 'unknown';
    let confidence = 0.5;
    
    if (input.includes('dashboard') || input.includes('แดชบอร์ด')) {
      action = 'create_dashboard';
      confidence = 0.9;
    } else if (input.includes('report') || input.includes('รายงาน')) {
      action = 'generate_report';
      confidence = 0.8;
    } else if (input.includes('notification') || input.includes('แจ้งเตือน')) {
      action = 'setup_notification';
      confidence = 0.85;
    }

    const result = {
      intent: {
        action,
        confidence,
        parameters: { input, originalText: input }
      },
      plan: {
        steps: [
          'วิเคราะห์คำสั่ง',
          'เตรียมข้อมูล',
          'ดำเนินการ'
        ],
        estimatedTime: 5
      },
      status: 'success',
      message: `ประมวลผลสำเร็จ: "${input}"`
    };

    res.json({
      success: true,
      result
    });

  } catch (error) {
    logger.error('Error processing command', error.message);
    
    res.status(500).json({
      error: 'Processing failed',
      message: error.message || 'Unknown error occurred'
    });
  }
});

/**
 * Create dashboard endpoint
 */
app.post('/api/dashboards/create', async (req, res) => {
  try {
    const config = req.body;

    if (!config.title) {
      return res.status(400).json({
        error: 'Invalid configuration',
        message: 'Title is required'
      });
    }

    logger.info('Creating dashboard', { title: config.title });

    // Mock dashboard creation
    const result = {
      status: 'success',
      pageId: 'page-' + Date.now(),
      url: `https://notion.so/dashboard-${config.title.toLowerCase().replace(/\s+/g, '-')}`,
      title: config.title,
      timestamp: new Date().toISOString(),
      message: `สร้าง dashboard "${config.title}" เสร็จสิ้น`
    };

    res.json({
      success: true,
      result
    });

  } catch (error) {
    logger.error('Error creating dashboard', error.message);
    
    res.status(500).json({
      error: 'Dashboard creation failed',
      message: error.message || 'Unknown error occurred'
    });
  }
});

/**
 * Test endpoint for UI
 */
app.post('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
    receivedData: req.body
  });
});

/**
 * Welcome endpoint
 */
app.get('/', (req, res) => {
  res.json({
    message: '🦄 Welcome to UnicornX!',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /api/health',
      processCommand: 'POST /api/commands/process',
      createDashboard: 'POST /api/dashboards/create',
      test: 'POST /api/test'
    },
    webUI: '/user-interface.html'
  });
});

// Notion API
const DATABASES = {
  projects: process.env.NOTION_PROJECTS_DB_ID,
  tasks: process.env.NOTION_TASKS_DB_ID,
  characters: process.env.NOTION_CHARACTERS_DB_ID,
  scenes: process.env.NOTION_SCENES_DB_ID,
  locations: process.env.NOTION_LOCATIONS_DB_ID,
  items: process.env.NOTION_ITEMS_DB_ID,
  organizations: process.env.NOTION_ORGANIZATIONS_DB_ID,
  events: process.env.NOTION_EVENTS_DB_ID,
  relationships: process.env.NOTION_RELATIONSHIPS_DB_ID,
  ai_prompts: process.env.NOTION_AI_PROMPTS_DB_ID
};

// ฟังก์ชันนับหน้าทั้งเวิร์คสเปซ
async function countAllPages(notion) {
  try {
    const results = {};
    let totalPages = 0;
    let totalDatabases = 0;
    let recentPages = [];

    // นับหน้าจากทุกฐานข้อมูล
    for (const [name, dbId] of Object.entries(DATABASES)) {
      if (dbId) {
        try {
          // First, get the data source ID
          const dbResponse = await notion.databases.retrieve({ database_id: dbId });
          const dataSource = dbResponse.data_sources?.[0];

          if (!dataSource) {
            console.error(`No data source found for ${name}`);
            results[name] = 0;
            continue;
          }

          const response = await notion.dataSources.query({
            data_source_id: dataSource.id,
            page_size: 100
          });
          
          const count = response.results.length;
          results[name] = count;
          totalPages += count;
          totalDatabases++;

          // เก็บหน้าที่อัพเดตล่าสุด
          response.results.forEach(page => {
            recentPages.push({
              title: page.properties.Name?.title?.[0]?.plain_text || 'Untitled',
              database: name,
              last_edited: page.last_edited_time
            });
          });

        } catch (error) {
          console.error(`Error counting ${name}:`, error.message);
          results[name] = 0;
        }
      }
    }

    // เรียงลำดับหน้าที่อัพเดตล่าสุด
    recentPages.sort((a, b) => new Date(b.last_edited) - new Date(a.last_edited));

    // นับหน้าทั้งหมดในเวิร์คสเปซ (ทุกหน้าไม่ใช่แค่ในฐานข้อมูล)
    const workspacePages = await notion.search({
      filter: {
        property: 'object',
        value: 'page'
      }
    });

    return {
      databasePages: {
        total: totalPages,
        databaseCount: totalDatabases
      },
      workspacePages: {
        total: workspacePages.results.length,
        results: workspacePages.results.map(page => ({
          title: page.properties?.title?.title?.[0]?.plain_text || 'Untitled',
          last_edited: page.last_edited_time,
          url: page.url
        }))
      },
      recentPages: recentPages.slice(0, 10),
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error counting pages:', error);
    return {
      error: error.message,
      databasePages: { total: 0, databaseCount: 0 },
      workspacePages: { total: 0 }
    };
  }
}

// เพิ่ม API endpoint
app.get('/api/pages/count', async (req, res) => {
  try {
    if (!process.env.NOTION_TOKEN) {
      return res.status(400).json({
        error: 'Notion API token not configured',
        message: 'Please set NOTION_TOKEN in environment variables'
      });
    }

    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    const count = await countAllPages(notion);

    res.json({
      success: true,
      data: count
    });

  } catch (error) {
    console.error('Error in /api/pages/count:', error);
    res.status(500).json({
      error: 'Failed to count pages',
      message: error.message
    });
  }
});

/**
 * อัพเดต command handler
 */
app.post('/api/command', async (req, res) => {
  try {
    const { command } = req.body;
    const lowerCommand = command.toLowerCase().trim();

    if (lowerCommand.includes('นับ') && lowerCommand.includes('หน้า')) {
      const notion = new Client({ auth: process.env.NOTION_TOKEN });
      const count = await countAllPages(notion);
      
      let response = `📊 **สถิติหน้าใน Notion Workspace**\n\n`;
      
      if (count.error) {
        response += `❌ เกิดข้อผิดพลาด: ${count.error}`;
      } else {
        response += `🌐 **ทั้งเวิร์คสเปซ:** ${count.workspacePages.total} หน้า\n`;
        response += `📋 **ในฐานข้อมูล:** ${count.databasePages.total} หน้า\n`;
        response += `🗂️ **ฐานข้อมูล:** ${count.databasePages.databaseCount} ฐาน\n\n`;
        
        response += `📊 **แยกตามฐานข้อมูล:**\n`;
        Object.entries(count.databasePages.byDatabase).forEach(([name, count]) => {
          const emoji = getDbEmoji(name);
          response += `${emoji} ${name.toUpperCase()}: ${count} หน้า\n`;
        });
        
        response += `\n📅 **หน้าที่อัพเดตล่าสุด:**\n`;
        count.recentPages.slice(0, 5).forEach((page, idx) => {
          const date = new Date(page.last_edited).toLocaleDateString('th-TH');
          response += `${idx + 1}. ${page.title} (${page.database}) - ${date}\n`;
        });
      }

      return res.json({
        success: true,
        message: response,
        data: count
      });
    }

    // ส่วนที่เหลือของ command handler...
  } catch (error) {
    console.error('Error processing command:', error);
    res.status(500).json({
      error: 'Command processing failed',
      message: error.message
    });
  }
});

function getDbEmoji(name) {
  const emojis = {
    projects: '📁',
    tasks: '✅',
    characters: '👥',
    scenes: '🎬',
    locations: '🗺️',
    items: '💎',
    organizations: '🏢',
    events: '📅',
    relationships: '🤝',
    ai_prompts: '🤖'
  };
  return emojis[name] || '📄';
}

// Error handling
app.use((error, req, res, next) => {
  logger.error('Unhandled error', {
    error: error.message,
    url: req.url,
    method: req.method
  });

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info('🦄 UnicornX server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
  
  console.log(`
🦄 UnicornX - AI-Powered Notion Assistant
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Server: http://localhost:${PORT}
📱 Web UI: http://localhost:${PORT}/user-interface.html
🔧 Health: http://localhost:${PORT}/api/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Ready to process natural language commands!

ทดสอบการทำงาน:
curl http://localhost:${PORT}/api/health
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Start server (ES module style)
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    logger.info(`🦄 UnicornX Server is running on http://localhost:${PORT}`);
    logger.info(`📊 Dashboard: http://localhost:${PORT}/api/dashboard`);
    logger.info(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
    type: 'page'
  