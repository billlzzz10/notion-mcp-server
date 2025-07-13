# 🤖 GitHub Copilot Integration Guide

## Overview
Ashval MCP Server ได้รับการออกแบบให้ทำงานร่วมกับ **GitHub Copilot** และ **Web Chat Interface** เพื่อให้ผู้ใช้สามารถจัดการโลก Ashval ผ่านการสนทนาและเครื่องมือ AI ได้อย่างมีประสิทธิภาพ

## ✨ Features

### 🌐 Web Chat Interface
- **React + TypeScript** - สร้างด้วย modern web technologies
- **Real-time Chat** - สนทนากับ Gemini AI เกี่ยวกับโลก Ashval
- **Database Integration** - เชื่อมต่อกับ Notion databases โดยตรง
- **Schema Auto-Detection** - ตรวจจับโครงสร้างฐานข้อมูลอัตโนมัติ
- **File Upload Support** - รองรับไฟล์หลายประเภท (รูปภาพ, PDF, text)

### 🧠 AI-Powered Features
- **Smart Project Creation** - สร้างโปรเจกต์ผ่านการสนทนา
- **Task Management** - จัดการงานด้วย natural language
- **Prompt Versioning** - บันทึกและติดตาม AI prompts
- **Response Evaluation** - ประเมินคุณภาพการตอบกลับ AI

### 🔧 MCP Gateway Integration
- **Schema Validation** - ตรวจสอบความถูกต้องของฐานข้อมูล
- **Auto-Refresh** - อัพเดต schema เมื่อมีการเปลี่ยนแปลง
- **Error Handling** - จัดการข้อผิดพลาดอย่างมีประสิทธิภาพ
- **Webhook Ready** - พร้อมรับ webhooks จาก Notion

## 🚀 Setup Instructions

### 1. Prerequisites
```bash
# ติดตั้ง dependencies
npm install
```

### 2. Environment Variables
สร้างไฟล์ `.env` ที่ root และ `web-chat/.env`:

#### Root `.env`:
```env
# Notion Configuration
NOTION_TOKEN=your_notion_token
NOTION_PROJECTS_DB_ID=your_projects_db_id
NOTION_TASKS_DB_ID=your_tasks_db_id
NOTION_AI_PROMPTS_DB_ID=your_ai_prompts_db_id
NOTION_CHARACTERS_DB_ID=your_characters_db_id
NOTION_SCENES_DB_ID=your_scenes_db_id
NOTION_LOCATIONS_DB_ID=your_locations_db_id

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Gateway Configuration
GATEWAY_PORT=3001
```

#### Web Chat `.env`:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GATEWAY_URL=http://localhost:3001
```

### 3. การรัน Services

#### รัน MCP Gateway:
```bash
npm run start-gateway
```

#### รัน Web Chat:
```bash
npm run start-web-chat
```

#### รัน MCP Server (สำหรับ Copilot):
```bash
npm run build
npm start
```

## 💻 Web Chat Usage

### การเข้าถึง
1. เปิดเบราว์เซอร์ไปที่: `http://localhost:8080`
2. กดปุ่ม Settings ⚙️ ด้านบนขวา
3. ใส่ Gemini API Key และ Notion Database IDs
4. บันทึกการตั้งค่า

### คำสั่งหลัก

#### การตรวจสอบ Schema:
```
ตรวจสอบ schema ของ projects database
```

#### การสร้างโปรเจกต์:
```
สร้างโปรเจกต์ใหม่ชื่อ "Character Development" สถานะ "In Progress" ความสำคัญ "High"
```

#### การสร้างงาน:
```
สร้างงานใหม่ชื่อ "Write character backstory" ในโปรเจกต์ "Character Development"
```

#### การบันทึก Prompt:
```
บันทึก prompt: "สร้างตัวละครที่มีพลังควบคุมเวลา" พร้อมผลลัพธ์
```

### การอัพโลดไฟล์
- ลากไฟล์ลงในช่องแชท หรือ
- กดปุ่ม 📎 เพื่อเลือกไฟล์
- รองรับ: รูปภาพ, PDF, text files, markdown

## 🤖 GitHub Copilot Integration

### การใช้งานผ่าน VS Code
1. ติดตั้ง GitHub Copilot extension
2. เปิดโปรเจกต์ notion-mcp-server
3. ใช้ Copilot Chat สำหรับ:
   - วิเคราะห์โครงสร้างฐานข้อมูล
   - สร้างเนื้อหาสำหรับโลก Ashval
   - แก้ไขและปรับปรุงโค้ด

### ตัวอย่างการใช้งาน:
```
@workspace ช่วยวิเคราะห์โครงสร้างฐานข้อมูล Characters และแนะนำการปรับปรุง
```

```
@workspace สร้างฟังก์ชันใหม่สำหรับการสร้างตัวละครแบบ batch
```

## 🔄 MCP Gateway API

### Schema Endpoints
```bash
# ตรวจสอบ schema
GET /api/schema/{databaseId}

# รีเฟรช schema
POST /api/schema/{databaseId}/refresh
```

### Data Management
```bash
# สร้างโปรเจกต์
POST /api/project
Content-Type: application/json
{
  "title": "ชื่อโปรเจกต์",
  "status": "In Progress",
  "priority": "High"
}

# สร้างงาน
POST /api/task
Content-Type: application/json
{
  "projectId": "page_id",
  "name": "ชื่องาน",
  "status": "Todo"
}
```

### AI Features
```bash
# บันทึก prompt
POST /api/prompt
Content-Type: application/json
{
  "prompt": "คำสั่ง AI",
  "response": "ผลลัพธ์",
  "version": 1
}

# ประเมินผล AI
POST /api/ai-eval
Content-Type: application/json
{
  "oldResponse": "คำตอบเก่า",
  "newResponse": "คำตอบใหม่"
}
```

## 🎯 Advanced Features

### Auto Schema Detection
ระบบจะตรวจจับโครงสร้างฐานข้อมูลอัตโนมัติและปรับเครื่องมือให้เข้ากัน:

```typescript
// ตัวอย่างการทำงาน
const schema = await detectDatabaseSchema(databaseId);
const properties = createDynamicProperties(schema, userInput);
```

### Smart Error Handling
เมื่อมีการเปลี่ยนแปลงโครงสร้างฐานข้อมูล:
```json
{
  "success": false,
  "error": "Database schema ไม่ตรงกับที่คาดหวัง",
  "availableFields": ["Name", "สถานะ", "ความสำคัญ"],
  "suggestion": "ลองรีเฟรช schema หรือตรวจสอบชื่อคอลัมน์"
}
```

### Webhook Integration
พร้อมรับ webhooks จาก Notion:
```typescript
// ตัวอย่าง webhook handler
app.post('/webhook/notion', (req, res) => {
  const { page_id, event_type } = req.body;
  
  if (event_type === 'page.updated') {
    // อัพเดต schema cache
    refreshSchema(page_id);
  }
  
  res.status(200).send('OK');
});
```

## 🛠️ Development & Testing

### การพัฒนา
```bash
# Development mode
npm run watch           # TypeScript watch mode
npm run start-web       # Web chat development
npm run dev-bot         # Bot development

# การทดสอบ
npm test               # รันทุกการทดสอบ
npm run check-schema   # ทดสอบ schema detection
```

### Debug Mode
```bash
# เปิด debug logs
DEBUG=ashval:* npm start

# ทดสอบ MCP tools
node -e "
const { spawn } = require('child_process');
const mcp = spawn('node', ['build/index.js']);
// ทดสอบการเรียกใช้งาน tools
"
```

## 🔒 Security & Best Practices

### API Key Security
- ใช้ environment variables เท่านั้น
- ไม่เปิดเผย keys ใน client-side code
- ใช้ HTTPS สำหรับ production

### Schema Validation
- ตรวจสอบ input ก่อนส่งไปยัง Notion
- validate database permissions
- handle rate limiting

### Error Logging
```typescript
// ตัวอย่าง error handling
try {
  const result = await notionClient.databases.create(data);
} catch (error) {
  console.error('Notion API Error:', {
    message: error.message,
    code: error.code,
    timestamp: new Date().toISOString()
  });
  throw new Error('ไม่สามารถสร้างฐานข้อมูลได้');
}
```

## 📊 Monitoring & Analytics

### Performance Metrics
- Response time ของ API calls
- Schema cache hit rate
- AI prompt success rate
- Database operation frequency

### Health Checks
```bash
# ตรวจสอบสถานะ services
curl http://localhost:3001/health     # Gateway health
curl http://localhost:8080/health     # Web chat health
```

## 🔄 Updates & Maintenance

### การอัพเดต
```bash
# อัพเดต dependencies
npm update

# ตรวจสอบ security
npm audit
npm audit fix

# อัพเดต schema cache
curl -X POST http://localhost:3001/api/schema/refresh-all
```

### Backup Strategies
- สำรองข้อมูล environment variables
- Export Notion databases เป็นระยะ
- Version control สำหรับการตั้งค่า

## 🎯 Future Enhancements

### Planned Features
- 🔄 **Real-time Collaboration** - แชทหลายคนพร้อมกัน
- 🎨 **Custom Themes** - ธีมสำหรับโลก Ashval
- 📱 **Mobile App** - แอปมือถือ
- 🔌 **Plugin System** - ระบบ plugins สำหรับขยายฟีเจอร์

### Integration Roadmap
1. **Claude AI Integration** - เพิ่ม Claude สำหรับการวิเคราะห์
2. **Discord/Slack Bots** - ขยายไปยัง platforms อื่น
3. **Voice Commands** - รองรับคำสั่งเสียง
4. **AR/VR Visualization** - แสดงโลก Ashval แบบ 3D

## 📞 Support & Troubleshooting

### Common Issues

#### Web Chat ไม่เชื่อมต่อ:
```bash
# ตรวจสอบ gateway
curl http://localhost:3001/api/health

# ตรวจสอบ environment variables
echo $VITE_GEMINI_API_KEY
```

#### Schema Detection ไม่ทำงาน:
```bash
# ทดสอบ Notion connection
curl -H "Authorization: Bearer $NOTION_TOKEN" \
     -H "Notion-Version: 2022-06-28" \
     https://api.notion.com/v1/users/me
```

#### Copilot ไม่ตอบสนอง:
- ตรวจสอบ GitHub Copilot subscription
- รีสตาร์ท VS Code
- ตรวจสอบ network connection

---

🌟 **Ashval MCP with GitHub Copilot** - The future of AI-powered world-building! 🌟
