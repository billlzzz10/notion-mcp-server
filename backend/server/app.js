import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import gateway from './mcp-gateway/request-gateway.js';
import agentRoutes from './mcp-gateway/agent-endpoints.js';
import writerRoutes from './mcp-gateway/writer-endpoints.js';
import webhookHandler from './mcp-gateway/webhook-handler.js';

dotenv.config();

const app = express();
const port = process.env.PORT ? +process.env.PORT : 8080;

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiting for agent endpoints
const agentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs for AI operations
  message: {
    error: 'Too many AI requests',
    retryAfter: '15 minutes'
  }
});

// Middleware สำหรับ JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// CORS support
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Routes with versioning and rate limiting
app.use('/api/v1', limiter, gateway);
app.use('/api/v1/agent', agentLimiter, agentRoutes);
app.use('/api/v1/writer', limiter, writerRoutes);
app.use('/api/v1/agent', webhookHandler); // Webhook routes (less restrictive)

// Default routes (backwards compatibility)
app.use('/api', limiter, gateway);
app.use('/api/agent', agentLimiter, agentRoutes);
app.use('/api/writer', limiter, writerRoutes);
app.use('/api/agent', webhookHandler); // Legacy webhook routes

// Root route for Railway debugging
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Notion MCP Server Railway Deployment',
    version: '3.0.1',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: port
  });
});

// Enhanced health check endpoint
app.get('/health', (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '3.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
    },
    services: {
      gateway: 'running',
      agent: 'running',
      database: process.env.NOTION_TOKEN ? 'connected' : 'not_configured'
    },
    endpoints: {
      api_v1: '/api/v1/*',
      agent_v1: '/api/v1/agent/*',
      writer_v1: '/api/v1/writer/*',
      webhook_make: '/api/v1/agent/webhook/make',
      webhook_test: '/api/v1/agent/webhook/test',
      webhook_status: '/api/v1/agent/webhook/status',
      legacy_api: '/api/*',
      legacy_agent: '/api/agent/*',
      legacy_writer: '/api/writer/*'
    }
  };
  
  res.json(healthData);
});

// Global error handler
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR:`, err.message);
  console.error('Stack:', err.stack);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      timestamp,
      path: req.path,
      method: req.method
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      available_endpoints: [
        'GET /health',
        'GET /api/v1/databases',
        'POST /api/v1/agent/webhook/make',
        'POST /api/v1/agent/webhook/test',
        'GET /api/v1/agent/webhook/status',
        'GET /api/v1/agent/system-stats',
        'POST /api/v1/writer/projects',
        'GET /api/v1/writer/projects',
        'POST /api/v1/writer/projects/:projectId/notes',
        'GET /api/v1/writer/projects/:projectId/notes',
        'GET /api/v1/writer/projects/:projectId/stats'
      ]
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 MCP Gateway listening on port ${port}`);
  console.log(`🔗 Make.com Webhook: http://localhost:${port}/api/v1/agent/webhook/make`);
  console.log(`🧪 Test Webhook: http://localhost:${port}/api/v1/agent/webhook/test`);
  console.log(`📊 Webhook Status: http://localhost:${port}/api/v1/agent/webhook/status`);
  console.log(`💚 Health Check: http://localhost:${port}/health`);
});
