# Render.com Deployment Guide

Deploy UnicornX server ให้รันได้ 24/7 บน Render.com

## 🎨 Render.com Setup

### 1. สร้างบัญชี Render

```url
https://render.com/
```

### 2. เชื่อมต่อ GitHub Repository

1. เข้า Render Dashboard
2. คลิก "New +" → "Web Service"
3. เชื่อมต่อ GitHub repository

### 3. สร้าง render.yaml

```yaml
services:
  - type: web
    name: unicornx-server
    env: node
    buildCommand: npm ci
    startCommand: cd unicorn-x && node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
    healthCheckPath: /api/health
    autoDeploy: false
    regions:
      - oregon
```

### 4. Environment Variables ใน Render

```bash
# Notion Configuration
NOTION_API_KEY=your_notion_token
NOTION_PROJECTS_DB_ID=your_db_id
NOTION_TASKS_DB_ID=your_db_id

# Google Drive (Optional)
GDRIVE_CREDENTIALS={"type":"service_account",...}
GDRIVE_FOLDER_ID=your_folder_id

# Server Configuration
PORT=10000
NODE_ENV=production
```

### 5. Package.json Scripts

```json
{
  "scripts": {
    "start": "cd unicorn-x && node server.js",
    "build": "npm ci",
    "dev": "cd unicorn-x && node server.js"
  }
}
```

## ✅ ผลลัพธ์

- **URL**: `https://unicornx-server.onrender.com`
- **Health Check**: `https://unicornx-server.onrender.com/api/health`
- **Free Plan**: 750 hours/month
- **Auto SSL**: รองรับ HTTPS อัตโนมัติ
- **Auto Deploy**: Deploy อัตโนมัติเมื่อ push code
