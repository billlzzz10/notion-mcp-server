# 🏰 คำอธิบายรีโพสิทอรี่ Notion MCP Server

## 📖 ภาพรวมของโปรเจกต์

**Notion MCP Server** เป็นระบบ Model Context Protocol (MCP) ขั้นสูงที่ออกแบบมาเพื่อเชื่อมต่อ AI และ Notion API เข้าด้วยกัน โดยมีจุดเด่นคือ **Ashval World Building System** ซึ่งเป็นระบบจัดการการสร้างโลกแฟนตาซีที่ซับซ้อนสำหรับนักเขียนและ Creative AI

## 🎯 จุดประสงค์หลัก

1. **การจัดการฐานข้อมูล Notion อย่างชาญฉลาด** - ให้ AI สามารถเข้าถึงและจัดการข้อมูลใน Notion ได้อย่างมีประสิทธิภาพ
2. **ระบบสร้างโลกแฟนตาซี** - เครื่องมือครบครันสำหรับการสร้างและจัดการโลกแฟนตาซี "Ashval"
3. **Gateway API** - ให้บริการ HTTP API สำหรับการเชื่อมต่อกับระบบภายนอก
4. **Web Interface** - หน้าต่างสำหรับการใช้งานแบบกราฟิก
5. **AI Integration** - การผสานรวมกับ AI services หลากหลาย

## 🏗️ สถาปัตยกรรมของระบบ

### 1. **MCP Server Core** (`src/` directory)
- **Entry Point**: `index.ts` - จุดเริ่มต้นของ MCP Server
- **Tools**: เครื่องมือ MCP ทั้งหมด 17 ตัว แบ่งเป็น:
  - **Notion Base Tools (5 ตัว)**: การจัดการ pages, blocks, databases, comments, users
  - **Ashval World Building Tools (12 ตัว)**: เครื่องมือสำหรับสร้างโลกแฟนตาซี
- **Services**: บริการสำหรับเชื่อมต่อ Notion API
- **Schema**: กำหนดรูปแบบข้อมูลสำหรับ MCP tools

### 2. **Enhanced Gateway** (`server/` directory)
- **API Gateway**: `app.js` - Express server ที่ให้บริการ HTTP API
- **Rate Limiting**: จำกัดจำนวน requests เพื่อป้องกัน abuse
- **Versioning**: รองรับ API version (/api/v1/)
- **Webhook Support**: รองรับ webhook จาก Make.com และระบบอื่นๆ
- **Error Handling**: ระบบจัดการข้อผิดพลาดแบบครบถ้วน

### 3. **Web Chat Interface** (`web-chat/` directory)
- **React Application**: หน้าเว็บสำหรับใช้งาน chat กับ AI
- **Dashboard**: แสดงข้อมูลจาก Notion databases
- **File Upload**: รองรับการอัปโหลดไฟล์ (ถึง 10MB)
- **Mobile Responsive**: ใช้งานได้บนมือถือ

### 4. **AI Agents System**
- **6 AI Agents**: ทำงานได้แล้ว 90%
  - Data Quality Agent
  - Forecast Agent
  - Planner Agent
  - Decision Engine
  - Reports Agent
  - Workspace Manager

## 🛠️ เครื่องมือหลัก (MCP Tools)

### 🔧 Notion Base Tools (5 ตัว)
1. **notion_pages** - จัดการหน้าเว็บ (สร้าง, แก้ไข, ค้นหา, เก็บถาวร)
2. **notion_blocks** - จัดการบล็อก (ดูข้อมูล, อัปเดต, ลบ, เพิ่ม)
3. **notion_database** - จัดการฐานข้อมูล (สร้าง, query, อัปเดต)
4. **notion_comments** - จัดการความคิดเห็น (ดู, เพิ่ม)
5. **notion_users** - จัดการผู้ใช้ (แสดงรายชื่อ, ข้อมูล)

### 🏰 Ashval World Building Tools (12 ตัว)
1. **ashval_version_control** - ติดตามการเปลี่ยนแปลงข้อมูล
2. **ashval_timeline_analyzer** - วิเคราะห์ timeline และความขัดแย้งทางเวลา
3. **ashval_conflict_generator** - สร้างความขัดแย้งในเรื่อง
4. **ashval_story_arc_analyzer** - วิเคราะห์ story arcs
5. **ashval_smart_filter** - สร้าง views และ filters อัจฉริยะ
6. **ashval_image_generator** - สร้างคำสั่งสำหรับ AI image generation
7. **ashval_consistency_checker** - ตรวจสอบความสอดคล้อง
8. **ashval_world_rules_query** - ค้นหาและตรวจสอบกฎของโลก
9. **ashval_advanced_prompt_generator** - สร้าง AI prompts ขั้นสูง
10. **ashval_story_structure_analyzer** - วิเคราะห์โครงสร้างเรื่อง
11. **ashval_database_analyzer** - วิเคราะห์สถานะฐานข้อมูล
12. **ashval_data_completion_assistant** - ช่วยเติมข้อมูลที่ขาดหาย

## 🗃️ ฐานข้อมูล Notion ที่รองรับ

### ฐานข้อมูลหลัก (8 ตัว)
1. **Characters** - ตัวละครในเรื่อง
2. **Scenes** - ฉากและเหตุการณ์
3. **Locations** - สถานที่
4. **Worlds** - โลกและมิติ
5. **Power Systems** - ระบบพลัง
6. **Arcanas** - ระบบอาร์คานา
7. **Missions** - ภารกิจ
8. **AI Prompts** - คำสั่ง AI

### ฐานข้อมูลเสริม (4 ตัว)
9. **Version History** - ประวัติการเปลี่ยนแปลง
10. **Story Timeline** - เหตุการณ์ตามเวลา
11. **Story Arcs** - โครงเรื่องย่อย
12. **World Rules** - กฎของโลก

## 🔌 การเชื่อมต่อกับระบบภายนอก

### ✅ ระบบที่พร้อมใช้งาน
- **Notion API** (10 Databases)
- **Gemini AI** (Smart Model Selection)
- **Telegram Bot** 
- **Make.com Webhook**
- **Web Chat Interface** (port 3002)
- **MCP Gateway** (port 3001)

### ⚠️ ระบบที่ต้องทดสอบ
- **YouTube Analyzer** (ยังไม่ได้ทดสอบ)
- **TTS Integration** (อยู่ระหว่างพัฒนา)

## 🚀 ประสิทธิภาพของระบบ

### 📊 การปรับปรุงประสิทธิภาพ
- **300-500% เร็วขึ้น** จากการใช้ Smart Cache และ Batch Operations
- **ประหยัด 60-80%** ค่าใช้จ่าย API
- **Token Optimization** ลดการใช้ AI tokens 40-60%
- **Response Time** ลดลงจาก 5-10 วินาที เหลือ 1-2 วินาที

### 🔧 เทคนิคการปรับปรุง
1. **Smart Cache** - เก็บข้อมูลที่ใช้บ่อยไว้ในหน่วยความจำ
2. **Batch Operations** - ประมวลผลหลายรายการพร้อมกัน
3. **Data Filtering** - กรองข้อมูลอย่างชาญฉลาด
4. **Concurrent Processing** - ประมวลผลแบบขนาน

## 📱 การใช้งาน

### 1. **การติดตั้ง**
```bash
git clone https://github.com/awkoy/notion-mcp-server.git
cd notion-mcp-server
npm install
npm run build
```

### 2. **การตั้งค่า Environment**
```env
NOTION_TOKEN=your_notion_integration_token
GEMINI_API_KEY=your_gemini_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### 3. **การเริ่มต้นใช้งาน**
```bash
# เริ่ม MCP Server
npm start

# เริ่ม Gateway API
npm run start-gateway

# เริ่ม Web Chat
cd web-chat && npm run dev
```

### 4. **จุดเข้าถึง**
- **API Gateway**: http://localhost:3001/api/v1
- **Web Chat**: http://localhost:3002
- **Health Check**: http://localhost:3001/health

## 🎯 กรณีการใช้งาน

### 1. **สำหรับนักเขียน**
- จัดการตัวละคร เหตุการณ์ และโลกแฟนตาซี
- ตรวจสอบความสอดคล้องของเนื้อหา
- สร้างเนื้อหาด้วย AI
- วิเคราะห์โครงสร้างเรื่อง

### 2. **สำหรับ AI Developers**
- ใช้ MCP tools เพื่อเชื่อมต่อกับ Notion
- สร้าง AI agents ที่ทำงานกับฐานข้อมูล
- ระบบ webhook automation

### 3. **สำหรับ Content Creators**
- สร้างเนื้อหาและจัดการโครงการ
- ใช้ AI ช่วยเขียนและปรับปรุง
- ติดตามความคืบหน้าของงาน

## 🔐 ความปลอดภัย

### 🛡️ ระบบรักษาความปลอดภัย
- **Rate Limiting**: จำกัดจำนวน requests
- **CORS Protection**: ป้องกันการเข้าถึงจากโดเมนที่ไม่ได้รับอนุญาต
- **Request Logging**: บันทึกการเข้าถึง API
- **Error Handling**: จัดการข้อผิดพลาดอย่างปลอดภัย

## 📈 สถานะโปรเจกต์

### ✅ Phase 2 เสร็จสิ้น (90%)
- Enhanced Gateway v3.1 พร้อมใช้งาน
- 6 AI Agents ทำงานได้แล้ว
- Web Chat Interface v2.1 สมบูรณ์
- ระบบ Performance optimization

### 🎯 Phase 3 กำลังพัฒนา (10%)
- Advanced monitoring และ analytics
- Marketplace integration
- Workflow designer
- Multi-tenant support

## 🤝 การมีส่วนร่วม

### 📚 เอกสารประกอบ
- `ASHVAL_GUIDE.md` - คู่มือการใช้งาน Ashval World Building
- `docs/` - เอกสารสำหรับ developers
- `ROADMAP-UPDATED.md` - แผนพัฒนาโปรเจกต์

### 🔧 การพัฒนา
- **License**: MIT License
- **Contributing**: ยินดีรับ Pull Requests
- **Issues**: รายงาน bugs ผ่าน GitHub Issues

## 🌟 จุดเด่นของระบบ

1. **ครบครัน**: มีเครื่องมือครบครันสำหรับการจัดการ Notion
2. **ประสิทธิภาพสูง**: เร็วกว่าระบบทั่วไป 300-500%
3. **ใช้งานง่าย**: มี Web Interface และ API ที่เข้าใจง่าย
4. **ยืดหยุ่น**: รองรับการปรับแต่งและเชื่อมต่อระบบอื่น
5. **AI-Powered**: ใช้ AI ช่วยในการวิเคราะห์และสร้างเนื้อหา

---

**สรุป**: Notion MCP Server เป็นระบบที่ออกแบบมาเพื่อเชื่อมต่อ AI, Notion และระบบอื่นๆ เข้าด้วยกัน โดยมีจุดเด่นคือ Ashval World Building System ที่ช่วยให้นักเขียนและ content creators สามารถสร้างและจัดการโลกแฟนตาซีได้อย่างมีประสิทธิภาพ พร้อมด้วยเครื่องมือ AI ที่ทันสมัย