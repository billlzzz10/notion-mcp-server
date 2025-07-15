import dotenv from 'dotenv';
import express from 'express';
import gateway from './mcp-gateway/request-gateway.js';
import agentRoutes from './mcp-gateway/agent-endpoints.js';

dotenv.config();

const app = express();
const port = process.env.GATEWAY_PORT || 3001;

// Middleware สำหรับ JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Routes
app.use('/api', gateway);
app.use('/api/agent', agentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      gateway: 'running',
      agent: 'running'
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 MCP Gateway listening on port ${port}`);
  console.log(`🔗 Webhook URL: http://localhost:${port}/api/agent/webhook/make`);
  console.log(`📊 System Stats: http://localhost:${port}/api/agent/system-stats`);
  console.log(`💚 Health Check: http://localhost:${port}/health`);
});
