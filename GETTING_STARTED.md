# 🔧 คู่มือการเริ่มต้นใช้งาน Notion MCP Server

## 🚀 ขั้นตอนการติดตั้งและใช้งาน

### 1. การติดตั้งเบื้องต้น
```bash
# Clone repository
git clone https://github.com/awkoy/notion-mcp-server.git
cd notion-mcp-server

# ติดตั้ง dependencies
npm install

# Build โปรเจกต์
npm run build

# ติดตั้ง dependencies สำหรับ web-chat
cd web-chat && npm install && cd ..
```

### 2. การตั้งค่า Environment
```bash
# คัดลอกไฟล์ตัวอย่าง
cp .env.example .env
```

แก้ไขไฟล์ `.env`:
```env
# Notion Configuration
NOTION_TOKEN=your_notion_integration_token
NOTION_CHARACTERS_DB_ID=your_characters_database_id
NOTION_SCENES_DB_ID=your_scenes_database_id
NOTION_LOCATIONS_DB_ID=your_locations_database_id
NOTION_WORLDS_DB_ID=your_worlds_database_id

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
GATEWAY_PORT=3001
WEB_PORT=3002

# Optional: Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Optional: Make.com Webhook
MAKE_WEBHOOK_URL=your_make_webhook_url
```

### 3. เริ่มต้นใช้งาน

#### 3.1 เริ่ม MCP Server
```bash
npm start
```

#### 3.2 เริ่ม Gateway API Server
```bash
npm run start-gateway
```

#### 3.3 เริ่ม Web Chat Interface
```bash
cd web-chat && npm run dev
```

### 4. ตรวจสอบการทำงาน
```bash
# ตรวจสอบ API Gateway
curl http://localhost:3001/health

# ตรวจสอบ Web Chat
curl http://localhost:3002
```

## 🌐 จุดเข้าถึงระบบ

| Service | URL | Description |
|---------|-----|-------------|
| **API Gateway** | http://localhost:3001/api/v1 | REST API สำหรับเชื่อมต่อระบบภายนอก |
| **Web Chat** | http://localhost:3002 | หน้าเว็บสำหรับ chat กับ AI |
| **Health Check** | http://localhost:3001/health | ตรวจสอบสถานะระบบ |
| **Webhook (Make.com)** | http://localhost:3001/api/v1/agent/webhook/make | รับข้อมูลจาก Make.com |

## 📊 ตัวอย่างผลลัพธ์

### Health Check Response
```json
{
  "status": "ok",
  "timestamp": "2025-07-18T14:28:07.086Z",
  "version": "3.0.1",
  "environment": "development",
  "uptime": 19.563965825,
  "memory": {
    "used": "9MB",
    "total": "10MB"
  },
  "services": {
    "gateway": "running",
    "agent": "running",
    "database": "not_configured"
  },
  "endpoints": {
    "api_v1": "/api/v1/*",
    "agent_v1": "/api/v1/agent/*",
    "webhook_make": "/api/v1/agent/webhook/make",
    "webhook_test": "/api/v1/agent/webhook/test",
    "webhook_status": "/api/v1/agent/webhook/status",
    "legacy_api": "/api/*",
    "legacy_agent": "/api/agent/*"
  }
}
```

## 🔧 การแก้ไขปัญหาที่พบบ่อย

### 1. Build Error
```bash
# ลบ node_modules และติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 2. Port Already in Use
```bash
# หาและปิด process ที่ใช้ port
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

### 3. Notion Database Not Configured
- ตรวจสอบ `NOTION_TOKEN` ใน `.env`
- ตรวจสอบ Database IDs ใน `.env`
- ตรวจสอบว่า Notion Integration มีสิทธิ์เข้าถึง databases

## 🎯 ขั้นตอนต่อไป

หลังจากติดตั้งสำเร็จแล้ว สามารถไปศึกษาเพิ่มเติมได้ที่:

1. **ASHVAL_GUIDE.md** - คู่มือการใช้งาน Ashval World Building System
2. **docs/FRONTEND-API-GUIDE.md** - คู่มือการใช้งาน API สำหรับ developers
3. **docs/bot-integration-guide.md** - คู่มือการตั้งค่า Telegram Bot
4. **docs/make-com-integration-guide.md** - คู่มือการเชื่อมต่อ Make.com