# Railway.app Deployment Guide
# Deploy UnicornX server ให้รันได้ 24/7

## 🚄 Railway.app Setup

### 1. สร้างบัญชี Railway
```
https://railway.app/
```

### 2. สร้าง Dockerfile สำหรับ UnicornX
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY unicorn-x/package*.json ./
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY unicorn-x/ ./unicorn-x/
COPY scripts/ ./scripts/

# Set working directory to unicorn-x
WORKDIR /app/unicorn-x

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start server
CMD ["node", "server.js"]
```

### 3. สร้าง railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "dockerfile",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "cd unicorn-x && node server.js",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "always"
  }
}
```

### 4. Environment Variables ใน Railway
```bash
# Notion Configuration
NOTION_API_KEY=your_notion_token
NOTION_PROJECTS_DB_ID=your_db_id
NOTION_TASKS_DB_ID=your_db_id

# Google Drive (Optional)
GDRIVE_CREDENTIALS={"type":"service_account",...}
GDRIVE_FOLDER_ID=your_folder_id

# Server Configuration
PORT=3000
NODE_ENV=production
```

### 5. Deploy Commands
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

### ✅ ผลลัพธ์:
- **URL**: `https://your-app-name.railway.app`
- **Health Check**: `https://your-app-name.railway.app/api/health`
- **Free Plan**: 500 hours/month + $5 credit
- **Auto SSL**: รองรับ HTTPS อัตโนมัติ
