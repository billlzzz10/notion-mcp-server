/**
 * UnicornX - AI-Powered Notion Assistant
 * Simple working version without complex dependencies
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Simple logger
const logger = {
  info: (msg: string, meta?: any) => console.log(`[INFO] ${msg}`, meta || ''),
  error: (msg: string, meta?: any) => console.error(`[ERROR] ${msg}`, meta || ''),
  warn: (msg: string, meta?: any) => console.warn(`[WARN] ${msg}`, meta || '')
};

// Initialize Express app
const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes

/**
 * Health check endpoint
 */
app.get('/api/health', (req: any, res: any) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    message: '🦄 UnicornX is running!'
  });
});

/**
 * Process natural language command (simplified)
 */
app.post('/api/commands/process', async (req: any, res: any) => {
  try {
    const { input, context, userId } = req.body;

    if (!input || typeof input !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Command input is required and must be a string'
      });
    }

    logger.info('Processing command', { input, userId });

    // Simple mock response for now
    const result = {
      intent: {
        action: 'create_dashboard',
        confidence: 0.9,
        parameters: { input }
      },
      plan: {
        steps: ['Analyzing request', 'Preparing response', 'Executing action'],
        estimatedTime: 5
      },
      status: 'success',
      message: `Processed: "${input}"`
    };

    res.json({
      success: true,
      result
    });

  } catch (error: any) {
    logger.error('Error processing command', error.message);
    
    res.status(500).json({
      error: 'Processing failed',
      message: error.message || 'Unknown error occurred'
    });
  }
});

/**
 * Create dashboard endpoint (simplified)
 */
app.post('/api/dashboards/create', async (req: any, res: any) => {
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
      pageId: 'mock-page-' + Date.now(),
      url: `https://notion.so/dashboard-${config.title.toLowerCase().replace(/\s+/g, '-')}`,
      title: config.title,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      result
    });

  } catch (error: any) {
    logger.error('Error creating dashboard', error.message);
    
    res.status(500).json({
      error: 'Dashboard creation failed',
      message: error.message || 'Unknown error occurred'
    });
  }
});

/**
 * Welcome endpoint
 */
app.get('/', (req: any, res: any) => {
  res.json({
    message: '🦄 Welcome to UnicornX!',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      processCommand: 'POST /api/commands/process',
      createDashboard: 'POST /api/dashboards/create'
    }
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

export default app;
// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting middleware
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rateLimiter.consume(req.ip as string);
    next();
  } catch (rateLimiterRes: any) {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.round(rateLimiterRes.msBeforeNext / 1000)
    });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Initialize services
const aiGateway = new AIGatewayBridge({
  apiKey: process.env.API_KEY || 'demo-key',
  notionToken: process.env.NOTION_TOKEN || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN
});

const notionAI = new NotionAITools(process.env.NOTION_TOKEN || '');

// API Routes

/**
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      ai_gateway: 'operational',
      notion_api: 'operational',
      websocket: io.engine.clientsCount > 0 ? 'connected' : 'waiting'
    }
  });
});

/**
 * Process natural language command
 */
app.post('/api/commands/process', async (req: Request, res: Response) => {
  try {
    const { input, context, userId } = req.body;

    if (!input || typeof input !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Command input is required and must be a string'
      });
    }

    logger.info('Processing command', { input, userId, ip: req.ip });

    const result = await aiGateway.processNaturalLanguageCommand({
      input: input.trim(),
      context: context || {},
      userId: userId || req.ip,
      timestamp: new Date()
    });

    logger.info('Command processed successfully', { userId, intent: result.intent.action });

    res.json({
      success: true,
      result
    });

  } catch (error: any) {
    logger.error('Error processing command', { error: error.message, stack: error.stack });
    
    res.status(500).json({
      error: 'Processing failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * Execute action based on intent and plan
 */
app.post('/api/commands/execute', async (req: Request, res: Response) => {
  try {
    const { intent, plan, userId } = req.body;

    if (!intent || !plan) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Both intent and plan are required'
      });
    }

    logger.info('Executing action', { action: intent.action, userId, ip: req.ip });

    // ส่งสัญญาณผ่าน WebSocket ว่าเริ่มดำเนินการ
    const socketRoom = userId || req.ip;
    io.to(socketRoom).emit('execution_started', { intent, plan });

    const result = await aiGateway.executeAction(intent, plan);

    logger.info('Action executed', { 
      action: intent.action, 
      status: result.status, 
      userId 
    });

    // ส่งผลลัพธ์ผ่าน WebSocket
    io.to(socketRoom).emit('execution_completed', result);

    res.json({
      success: true,
      result
    });

  } catch (error: any) {
    logger.error('Error executing action', { error: error.message, stack: error.stack });
    
    const socketRoom = req.body.userId || req.ip;
    io.to(socketRoom).emit('execution_error', {
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.status(500).json({
      error: 'Execution failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * Create dashboard directly
 */
app.post('/api/dashboards/create', async (req: Request, res: Response) => {
  try {
    const config = req.body;

    if (!config.title || !config.databases) {
      return res.status(400).json({
        error: 'Invalid configuration',
        message: 'Title and databases are required'
      });
    }

    logger.info('Creating dashboard', { title: config.title, userId: req.ip });

    const result = await notionAI.createIntelligentDashboard(config);

    logger.info('Dashboard creation result', { 
      title: config.title, 
      status: result.status,
      pageId: result.pageId 
    });

    res.json({
      success: result.status === 'success',
      result
    });

  } catch (error: any) {
    logger.error('Error creating dashboard', { error: error.message, stack: error.stack });
    
    res.status(500).json({
      error: 'Dashboard creation failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * Get cache statistics
 */
app.get('/api/cache/stats', (req: Request, res: Response) => {
  try {
    const stats = notionAI.getCacheStats();
    res.json({
      success: true,
      stats
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to get cache stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Clear cache
 */
app.post('/api/cache/clear', (req: Request, res: Response) => {
  try {
    notionAI.clearCache();
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * WebSocket connection handling
 */
io.on('connection', (socket: any) => {
  logger.info('Client connected', { socketId: socket.id });

  socket.on('join_room', (userId: string) => {
    socket.join(userId);
    logger.info('Client joined room', { socketId: socket.id, userId });
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });

  // ส่งสถานะการเชื่อมต่อ
  socket.emit('connection_status', {
    connected: true,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', { 
    error: error.message, 
    stack: error.stack,
    url: req.url,
    method: req.method
  });

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, () => {
  logger.info('🦄 UnicornX server started', {
    port: PORT,
    host: HOST,
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
  
  console.log(`
🦄 UnicornX - AI-Powered Notion Assistant
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Server: http://${HOST}:${PORT}
📱 Web UI: http://${HOST}:${PORT}/user-interface.html
🔧 Health: http://${HOST}:${PORT}/api/health
📊 WebSocket: wss://${HOST}:${PORT}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Ready to process natural language commands!
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

export default app;
