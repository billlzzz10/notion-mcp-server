# 🤖 Ashval Chat Bot Integration Guide

## Overview
Ashval Chat Bot เป็นระบบ AI ที่ผสมผสาน **Gemini AI** และ **Telegram Bot** เพื่อให้คุณสามารถจัดการโลก Ashval ผ่านการสนทนาและคำสั่ง chat ได้

## ✨ Features

### 🧠 AI-Powered Chat
- สนทนาธรรมดากับ Gemini AI เกี่ยวกับโลก Ashval
- ระบบจดจำบทสนทนา (10 ข้อความล่าสุด)
- การตอบคำถามเกี่ยวกับ world-building และ story development

### 📊 Data Management Commands
- `/projects` - จัดการโปรเจกต์
- `/characters` - จัดการตัวละคร
- `/scenes` - จัดการฉาก
- `/locations` - จัดการสถานที่
- `/stats` - ดูสถิติทั้งหมด
- `/search <คำค้นหา>` - ค้นหาข้อมูล

### 💡 AI Analysis Tools
- `/prompt <prompt>` - วิเคราะห์ AI prompts
- การแนะนำปรับปรุง prompts
- ให้คะแนนประสิทธิภาพ prompts

### 🔔 Notifications & Alerts
- แจ้งเตือนการเปลี่ยนแปลงข้อมูล
- สถานะโปรเจกต์ที่เกินกำหนด
- ข้อเสนะแนะการพัฒนาตัวละครหรือเรื่องราว

## 🚀 Setup Instructions

### 1. Prerequisites
```bash
# ติดตั้ง dependencies
npm install @google/generative-ai node-telegram-bot-api @types/node-telegram-bot-api
```

### 2. Environment Variables
สร้างไฟล์ `.env` และเพิ่ม:
```env
# Notion Configuration
NOTION_TOKEN=your_notion_token
NOTION_PROJECTS_DB_ID=your_projects_db_id
NOTION_CHARACTERS_DB_ID=your_characters_db_id
NOTION_SCENES_DB_ID=your_scenes_db_id
NOTION_LOCATIONS_DB_ID=your_locations_db_id

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### 3. การขอ API Keys

#### Gemini AI API Key
1. ไปที่ [Google AI Studio](https://makersuite.google.com/app/apikey)
2. สร้าง API key ใหม่
3. คัดลอกและใส่ใน `GEMINI_API_KEY`

#### Telegram Bot Token
1. หา [@BotFather](https://t.me/botfather) ใน Telegram
2. ส่งคำสั่ง `/newbot`
3. ตั้งชื่อ bot และ username
4. คัดลอก token ที่ได้รับและใส่ใน `TELEGRAM_BOT_TOKEN`

### 4. การรัน Bot
```bash
# Build และรัน bot
npm run build
npm run start-bot

# หรือรันในโหมด development
npm run dev-bot
```

## 📱 Usage Examples

### Basic Chat
```
User: สวัสดีครับ ช่วยแนะนำการพัฒนาตัวละครหน่อย
Bot: 🏰 สวัสดีค่ะ! ยินดีช่วยเหลือ สำหรับการพัฒนาตัวละครในโลก Ashval คุณสามารถ...
```

### Data Management
```
User: /projects list
Bot: 📊 Projects Overview
1. **Etheria Kingdom Development**
   📊 Status: In progress
   🔥 Priority: High

2. **Character Backstory Writing**
   📊 Status: Not started
   🔥 Priority: Medium
```

### AI Prompt Analysis
```
User: /prompt สร้างตัวละครที่มีพลังควบคุมเวลา
Bot: 🧠 AI Prompt Analysis
📊 Effectiveness Score: 7/10
🏷️ Prompt Type: Character Creation
💡 Improvement Suggestions:
1. เพิ่มข้อจำกัดของพลัง
2. ระบุความสัมพันธ์กับโลก Ashval
3. เพิ่มความขัดแย้งภายใน
```

### Search & Stats
```
User: /search Lyralei
Bot: 🔍 Search Results for "Lyralei"
1. **Lyralei - Wind Archer**
2. **Lyralei's Training Scene**
3. **Sylvanas vs Lyralei Combat**

User: /stats
Bot: 📈 Ashval World Statistics
📊 Projects Overview:
• Total: 12
• Completed: 3
• In Progress: 7
• Overdue: 2

🗃️ Database Summary:
• Characters: 45 entries
• Scenes: 128 entries
• Locations: 32 entries
```

## 🔧 Advanced Features

### Inline Keyboards
Bot ใช้ inline keyboards สำหรับการนำทางที่ง่าย:
- ✅ **Create Project** - สร้างโปรเจกต์ใหม่
- 📈 **Project Stats** - ดูสstatistics แบบละเอียด
- 🔄 **Refresh Stats** - อัปเดตข้อมูลล่าสุด

### Callback Queries
รองรับการโต้ตอบแบบ real-time ผ่าน callback queries:
```javascript
// ตัวอย่าง callback data
'create_project' -> เปิดฟอร์มสร้างโปรเจกต์
'project_stats' -> แสดงสถิติแบบละเอียด
'refresh_stats' -> รีเฟรชข้อมูลทั้งหมด
```

## 🔒 Security Considerations

### API Key Security
- เก็บ API keys ใน environment variables เท่านั้น
- ไม่เปิดเผย tokens ใน code repository
- ใช้ `.env` file และเพิ่มในไฟล์ `.gitignore`

### Telegram Bot Security
- ตั้งค่า webhook URL ให้ปลอดภัย (HTTPS)
- จำกัดสิทธิ์การเข้าถึง bot (ถ้าจำเป็น)
- ติดตาม logs สำหรับการใช้งานผิดปกติ

## 🚨 Troubleshooting

### Common Issues

#### Bot ไม่ตอบกลับ
```bash
# ตรวจสอบ bot token
echo $TELEGRAM_BOT_TOKEN

# ตรวจสอบ network connectivity
curl -X GET "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"
```

#### Gemini AI ไม่ทำงาน
```bash
# ตรวจสอบ API key
echo $GEMINI_API_KEY

# ทดสอบ API call
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$GEMINI_API_KEY"
```

#### MCP Tools ไม่ทำงาน
```bash
# ตรวจสอบ MCP server
node build/index.js --tool queryProjects --args '{"databaseId":"test"}'

# ตรวจสอบ Notion connection
curl -X GET "https://api.notion.com/v1/users/me" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2022-06-28"
```

## 📊 Monitoring & Logs

### Log Levels
- `INFO`: ข้อมูลทั่วไป
- `WARN`: คำเตือน
- `ERROR`: ข้อผิดพลาด
- `DEBUG`: ข้อมูลสำหรับ debugging

### การตรวจสอบสุขภาพ
```bash
# ตรวจสอบสถานะ bot
npm run status

# ดู logs แบบ real-time
tail -f logs/bot.log
```

## 🔄 Updates & Maintenance

### การอัปเดต Dependencies
```bash
# อัปเดต packages
npm update

# ตรวจสอบ security vulnerabilities
npm audit

# แก้ไข vulnerabilities
npm audit fix
```

### การ Backup ข้อมูล
- สำรองข้อมูล conversation history (ถ้าจำเป็น)
- สำรองการตั้งค่า environment variables
- สำรองข้อมูล Notion databases เป็นระยะ

## 🎯 Future Enhancements

### Planned Features
- 🖼️ **Image Generation Integration** - รองรับการสร้างภาพ AI
- 🌐 **Multi-language Support** - รองรับหลายภาษา
- 📈 **Advanced Analytics** - การวิเคราะห์ข้อมูลแบบละเอียด
- 🔔 **Scheduled Notifications** - การแจ้งเตือนตามเวลา
- 🤖 **Voice Commands** - รองรับคำสั่งเสียง

### Integration Roadmap
1. **Claude AI Integration** - เพิ่ม Claude สำหรับการวิเคราะห์ขั้นสูง
2. **Discord Bot** - ขยายไปยัง Discord platform
3. **WhatsApp Integration** - รองรับ WhatsApp Business API
4. **Slack Integration** - สำหรับทีมงาน

## 📞 Support

หากมีปัญหาหรือคำถาม:
1. ตรวจสอบ troubleshooting guide ข้างต้น
2. ดู logs เพื่อหาสาเหตุ
3. ตรวจสอบ environment variables
4. ลองรีสตาร์ท bot

---

🌟 **Ashval Chat Bot** - Bringing AI-powered world-building to your fingertips! 🌟
