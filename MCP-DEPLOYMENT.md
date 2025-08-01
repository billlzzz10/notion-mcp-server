# 🚀 MCP-Only Deployment Guide

## Overview

This guide covers deploying the Notion MCP Server system **without the frontend web interface**. The MCP-only deployment includes:

- **MCP Server**: Core Model Context Protocol server with writing app tools
- **API Gateway**: REST API endpoints for all functionality
- **Writer App Integration**: Full writing application functionality via API
- **Health Monitoring**: Comprehensive health checks and monitoring

## Features Included

### ✅ Core MCP Functionality
- Model Context Protocol server with stdio transport
- All existing Notion integration tools
- Advanced Ashval world-building tools
- Batch operations and performance optimization

### ✅ Writer App Integration
- **Project Management**: Create and manage writing projects
- **Notes System**: Full note creation, editing, categorization
- **Plot Points**: Story structure and timeline management  
- **World Building**: Locations, characters, lore management
- **Dictionary**: Term definitions and glossary
- **Tasks**: Writing task and deadline management
- **AI Writing Assistant**: Content generation and assistance

### ✅ API Gateway
- RESTful API endpoints for all functionality
- Rate limiting and security
- Health monitoring and status
- Webhook support for integrations

## Quick Start

### Option 1: Docker Deployment (Recommended)

```bash
# Deploy using Docker
npm run deploy-mcp

# Check status
npm run status-mcp

# Stop services
npm run stop-mcp
```

### Option 2: Direct Deployment

```bash
# Install dependencies
npm run install-all

# Deploy directly on host
npm run deploy-mcp-direct

# Check status
npm run status-mcp
```

## Manual Deployment

### Prerequisites
- Node.js 18+ 
- npm
- Docker (optional)

### Step-by-Step Setup

1. **Clone and Setup**
   ```bash
   git clone https://github.com/billlzzz10/notion-mcp-server.git
   cd notion-mcp-server
   npm run install-all
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Deploy MCP System**
   ```bash
   # Docker deployment
   ./deploy-mcp.sh docker
   
   # OR direct deployment  
   ./deploy-mcp.sh direct
   ```

4. **Verify Deployment**
   ```bash
   # Check health
   curl http://localhost:3001/health
   
   # Test writer API
   curl http://localhost:3001/api/v1/writer/projects
   ```

## API Endpoints

### Health & Status
- `GET /health` - System health check
- `GET /api/v1/agent/system-stats` - Detailed system statistics

### Writer App API

#### Project Management
- `POST /api/v1/writer/projects` - Create project
- `GET /api/v1/writer/projects` - List projects
- `GET /api/v1/writer/projects/:id/stats` - Project statistics

#### Notes Management
- `POST /api/v1/writer/projects/:projectId/notes` - Create note
- `GET /api/v1/writer/projects/:projectId/notes` - List notes
- `PUT /api/v1/writer/notes/:noteId` - Update note
- `DELETE /api/v1/writer/notes/:noteId` - Delete note

#### Plot Points
- `POST /api/v1/writer/projects/:projectId/plot-points` - Create plot point
- `GET /api/v1/writer/projects/:projectId/plot-points` - List plot points

#### World Elements
- `POST /api/v1/writer/projects/:projectId/world-elements` - Create world element
- `GET /api/v1/writer/projects/:projectId/world-elements` - List world elements

#### Dictionary
- `POST /api/v1/writer/projects/:projectId/dictionary` - Create entry
- `GET /api/v1/writer/projects/:projectId/dictionary` - List entries

#### Tasks
- `POST /api/v1/writer/projects/:projectId/tasks` - Create task
- `GET /api/v1/writer/projects/:projectId/tasks` - List tasks
- `PATCH /api/v1/writer/tasks/:taskId/toggle` - Toggle task completion

#### AI Writing Assistant
- `POST /api/v1/writer/projects/:projectId/generate` - Generate content

### Notion Integration API
- `GET /api/v1/databases` - List databases
- `POST /api/v1/pages` - Create page
- `POST /api/v1/blocks` - Block operations
- And all existing MCP tools...

## Configuration

### Environment Variables

```bash
# Gateway Configuration
GATEWAY_PORT=3001
MCP_PORT=8080
NODE_ENV=production

# Notion Integration (Optional for demo mode)
NOTION_TOKEN=your_notion_token
NOTION_DATABASE_ID=your_database_id
NOTION_CHARACTERS_DB_ID=your_characters_db
NOTION_SCENES_DB_ID=your_scenes_db
NOTION_LOCATIONS_DB_ID=your_locations_db

# AI Integration (Optional)
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
```

### Docker Compose

Use the provided `docker-compose.mcp-only.yml`:

```bash
# Start with docker-compose
docker-compose -f docker-compose.mcp-only.yml up -d

# Stop
docker-compose -f docker-compose.mcp-only.yml down
```

## Monitoring & Management

### Health Checks
```bash
# Basic health check
curl http://localhost:3001/health

# Detailed status
./deploy-mcp.sh status
```

### Logs
```bash
# Docker logs
docker logs notion-mcp-server-mcp

# Direct deployment logs
tail -f ./logs/gateway.log
tail -f ./logs/mcp.log
```

### Performance Monitoring
- Memory usage tracking
- Request rate limiting
- Response time monitoring
- Error tracking

## Integration Examples

### Creating a Writing Project
```bash
curl -X POST http://localhost:3001/api/v1/writer/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"My Novel","icon":"book"}'
```

### Adding Notes
```bash
curl -X POST http://localhost:3001/api/v1/writer/projects/PROJECT_ID/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Character: Alice",
    "content":"Main protagonist of the story...",
    "category":"character",
    "tags":["protagonist","magic-user"]
  }'
```

### Generating AI Content
```bash
curl -X POST http://localhost:3001/api/v1/writer/projects/PROJECT_ID/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt":"Create a detailed description of a magical forest",
    "personality":"descriptive",
    "outputType":"worldbuilding"
  }'
```

## Production Deployment

### Railway Deployment
Use the provided `railway.mcp-only.json` configuration:

```bash
# Deploy to Railway
railway up --config railway.mcp-only.json
```

### System Service (Linux)
```bash
# Create systemd service
CREATE_SERVICE=true ./deploy-mcp.sh direct

# Manage service
sudo systemctl start notion-mcp-server
sudo systemctl enable notion-mcp-server
sudo systemctl status notion-mcp-server
```

### Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Security

### Rate Limiting
- API Gateway: 100 requests/15min per IP
- Agent endpoints: 50 requests/15min per IP
- Writer endpoints: 100 requests/15min per IP

### CORS Configuration
- Configurable CORS headers
- Origin validation
- Method restrictions

### Authentication (Optional)
Add authentication middleware as needed:

```javascript
// Custom authentication middleware
app.use('/api/v1/writer', authenticateUser);
```

## Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Change ports
GATEWAY_PORT=3002 MCP_PORT=8081 ./deploy-mcp.sh
```

**Health check failures:**
```bash
# Check logs
./deploy-mcp.sh status
docker logs notion-mcp-server-mcp
```

**Memory issues:**
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" ./deploy-mcp.sh
```

### Performance Tuning

**Optimize for production:**
```bash
# Set production environment
NODE_ENV=production

# Enable clustering
CLUSTER_WORKERS=4

# Configure memory limits
NODE_OPTIONS="--max-old-space-size=2048"
```

## Support

- **Documentation**: See main README.md and QUICK-START.md
- **Issues**: GitHub Issues
- **API Reference**: Available at `/api/v1/docs` (when enabled)

---

## Example API Usage

### Complete Writer Workflow

```bash
# 1. Create project
PROJECT_ID=$(curl -s -X POST http://localhost:3001/api/v1/writer/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"My Fantasy Novel"}' | jq -r '.project.id')

# 2. Add character note
curl -X POST http://localhost:3001/api/v1/writer/projects/$PROJECT_ID/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Elara the Mage","category":"character","content":"A powerful sorceress..."}'

# 3. Create plot point
curl -X POST http://localhost:3001/api/v1/writer/projects/$PROJECT_ID/plot-points \
  -H "Content-Type: application/json" \
  -d '{"title":"The Great Discovery","description":"Elara finds the ancient tome","type":"inciting-incident"}'

# 4. Add world element
curl -X POST http://localhost:3001/api/v1/writer/projects/$PROJECT_ID/world-elements \
  -H "Content-Type: application/json" \
  -d '{"name":"Mystic Forest","category":"location","description":"Ancient magical woodland"}'

# 5. Get project stats
curl http://localhost:3001/api/v1/writer/projects/$PROJECT_ID/stats
```

This completes the MCP-only deployment setup with full writer app integration!