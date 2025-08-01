# 🚀 Quick Setup Guide - Notion MCP Server

## ✅ Project Status: **WORKING** ✅

ทุกส่วนของโปรเจคทำงานได้แล้ว! ทำตามขั้นตอนด้านล่างเพื่อเริ่มใช้งาน

## 📋 Prerequisites

- Node.js 18+ 
- npm (มากับ Node.js)

## 🛠️ Installation & Setup

### 1. Clone และ Setup
```bash
git clone https://github.com/billlzzz10/notion-mcp-server.git
cd notion-mcp-server

# ติดตั้ง dependencies ทั้งหมด
npm run install-all
```

### 2. Configuration
```bash
# คัดลอกไฟล์ environment
cp .env.example .env

# แก้ไขไฟล์ .env ใส่ Notion Token ของคุณ (หรือใช้ demo values)
# NOTION_TOKEN=your_actual_notion_token_here
# NOTION_PAGE_ID=your_page_id_here
# หมายเหตุ: โปรเจคสามารถทำงานได้ด้วย demo values สำหรับการทดสอบ
```

### 3. Build Project
```bash
npm run build
```

### 4. Test Everything Works
```bash
node test-project.js
```

## 🚀 Start Services

### เริ่มทุกอย่างพร้อมกัน:
```bash
npm run dev
```

### หรือเริ่มแยกกัน:

#### 1. Start API Gateway (Port 3001)
```bash
npm run start-gateway
```

#### 2. Start Web Interface (Port 3002)
```bash
npm run start-web
```

#### 3. Start MCP Server
```bash
npm start
```

## 🌐 Access Points

- **🌐 Web Chat Interface**: http://localhost:3002
- **📊 API Health Check**: http://localhost:3001/health
- **🔌 API Endpoints**: http://localhost:3001/api/v1/*
- **🤖 Webhook**: http://localhost:3001/api/v1/agent/webhook/make

## ✅ Verification

เมื่อทุกอย่างทำงาน คุณควรเห็น:

1. **Gateway**: `🚀 MCP Gateway listening on port 3001`
2. **Web Interface**: `VITE ready in XXX ms ➜ Local: http://localhost:3002/`
3. **MCP Server**: `notion-mcp-server v1.0.1 running on stdio`

## 🎯 Features Available

- ✅ **Web Chat Interface** - พูดคุยกับ AI และจัดการ Notion
- ✅ **Database Dashboard** - ดูข้อมูล Notion Database
- ✅ **API Gateway** - RESTful API สำหรับ integrations
- ✅ **MCP Server** - Model Context Protocol server
- ✅ **Health Monitoring** - ตรวจสอบสถานะระบบ

## 🛠️ Troubleshooting

### ปัญหาที่อาจเจอ:

1. **Port already in use**
   ```bash
   # เปลี่ยน port ในไฟล์ .env
   PORT=3003
   GATEWAY_PORT=3004
   ```

2. **Notion API errors**
   - ตรวจสอบ NOTION_TOKEN ในไฟล์ .env
   - ตรวจสอบ Database permissions ใน Notion

3. **Build errors**
   ```bash
   # ลบ node_modules และติดตั้งใหม่
   rm -rf node_modules backend/node_modules frontend/modern/lz-labs-main/web-chat/node_modules
   npm run install-all
   npm run build
   ```

## 📞 Support

หากมีปัญหา:
1. รัน `node test-project.js` เพื่อดูสถานะ
2. ตรวจสอบ logs ในแต่ละ terminal
3. ตรวจสอบไฟล์ .env configuration

---
**✨ โปรเจคพร้อมใช้งานแล้ว! Happy coding! 🚀**