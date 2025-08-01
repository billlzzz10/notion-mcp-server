# 📖 Auto-Generated API Documentation

Generated: 1/8/2568 14:24:08

## ⚡ Available Scripts

- **dev**: `npm-run-all --parallel start-gateway start-web`
- **dev-mcp-only**: `npm-run-all --parallel start-gateway start-mcp`
- **build**: `cd backend && npm run build`
- **prepare**: `cd backend && npm run build`
- **start**: `cd backend && node build/index.js`
- **start-gateway**: `node backend/server/app.js`
- **start-mcp**: `cd backend && node build/index.js`
- **start-web**: `cd frontend/modern/lz-labs-main/web-chat && npm run dev`
- **start-web-chat**: `cd frontend/modern/lz-labs-main/web-chat && npm run dev`
- **build-web-chat**: `cd frontend/modern/lz-labs-main/web-chat && npm run build`
- **serve-web**: `cd frontend/modern/lz-labs-main/web-chat && npm run preview`
- **start-bot**: `cd backend && node build/bot/index.js`
- **demo**: `node demo/integration-demo.js`
- **test**: `echo "No tests available" && exit 0`
- **security-scan**: `cd backend && npm audit --audit-level moderate`
- **health-check**: `curl -f http://localhost:3001/health || echo "Health check failed"`
- **validate**: `npm run build && npm run test && npm run security-scan`
- **setup**: `npm run install-all && npm run build`
- **install-all**: `npm install && cd backend && npm install && cd ../frontend/modern/lz-labs-main/web-chat && npm install`
- **clean**: `rm -rf backend/build && rm -rf frontend/modern/lz-labs-main/web-chat/dist`
- **deploy-mcp**: `./deploy-mcp.sh docker`
- **deploy-mcp-direct**: `./deploy-mcp.sh direct`
- **stop-mcp**: `./deploy-mcp.sh stop`
- **status-mcp**: `./deploy-mcp.sh status`
- **restart-mcp**: `./deploy-mcp.sh restart`

