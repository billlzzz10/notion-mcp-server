# 🏰 Ashval Chat - Notion MCP Server with Pe```text
notion-mcp-server/
├── 📂 src/                    # MCP Server source code
│   ├── 📂 tools/             # เครื่องมือ MCP ทั้งหมด (17 ตัว)
│   ├── 📂 server/            # MCP server configuration
│   ├── 📂 services/          # Notion API servicesUX

[![Build Status](https://github.com/billlzzz10/notion-mcp-server/workflows/CI/badge.svg)](https://github.com/billlzzz10/notion-mcp-server/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Notion API](https://img.shields.io/badge/Notion-000000?style=flat&logo=notion&logoColor=white)](https://developers.notion.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)

**🆕 Modern Web Chat Interface with Auto-Detection Schema System & MCP Gateway**  
เซิร์ฟเวอร์ Node.js สำหรับเชื่อมต่อ Notion API พร้อมระบบ world-building อัตโนมัติสำหรับโลกแฟนตาซี "Ashval" พร้อม Web Chat Interface และ MCP Gateway

---

## 🚀 เริ่มต้นใช้งาน

### 🌟 **Ashval Chat v3.0 - Complete Integration Edition** (แนะนำ)

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. ตั้งค่า environment variables
cp .env.example .env
# แก้ไข .env ใส่ API keys และ Database IDs

# 3. Build MCP Server
npm run build

# 4. เริ่มใช้งาน (เลือกได้หลายวิธี)

# Web Chat Interface
npm run start-web-chat      # → http://localhost:8080

# MCP Gateway 
npm run start-gateway       # → http://localhost:3001

# MCP Server (สำหรับ AI agents)
npm start                   # → stdio MCP protocol
```

---

## 📁 โครงสร้างโปรเจกต์

```
notion-mcp-server/
├── � src/                    # MCP Server source code
│   ├── 📂 tools/             # เครื่องมือ MCP ทั้งหมด (17 ตัว)
│   ├── 📂 server/            # MCP server configuration
│   ├── � services/          # Notion API services
│   └── index.ts              # MCP entry point
├── 📂 server/                # Gateway & API server
│   ├── � mcp-gateway/       # API gateway สำหรับ HTTP requests
│   └── app.js                # Express server
├── 📂 web-chat/              # Web interface
│   ├── index.tsx             # React web chat app
│   ├── index.html            # หน้าเว็บหลัก
│   └── package.json          # Web dependencies
├── 📂 docs/                  # คู่มือและเอกสาร
│   ├── copilot-integration-guide.md
│   ├── bot-integration-guide.md
│   └── no-api-integration-guide.md
├── 📂 demo/                  # ตัวอย่างการใช้งาน
├── 📂 scripts/               # สคริปต์อรรถประโยชน์
├── .env.example              # ตัวอย่างการตั้งค่า
├── ASHVAL_GUIDE.md           # คู่มือโลก Ashval
└── COMPLETION_SUMMARY.md     # สรุปความสำเร็จ
```

---

## 📊 สถานะเครื่องมือ MCP

### ✅ Notion Base Tools (5/5 เครื่องมือ)

- ✅ **notion_pages** - จัดการหน้า (สร้าง, อัปเดต, ค้นหา, เก็บถาวร)
- ✅ **notion_blocks** - จัดการบล็อค (ดู, แก้ไข, ลบ, เพิ่ม)
- ✅ **notion_database** - จัดการฐานข้อมูล (สร้าง, ค้นหา, อัปเดต)
- ✅ **notion_comments** - จัดการความคิดเห็น (ดู, เพิ่ม)
- ✅ **notion_users** - จัดการผู้ใช้ (ดูรายชื่อ, ข้อมูล)

### ✅ Ashval World Building Tools (12/12 เครื่องมือ)

- ✅ **ashval_version_control** - ติดตามและจัดการเวอร์ชันของข้อมูล
- ✅ **ashval_timeline_analyzer** - วิเคราะห์ timeline และตรวจหาความขัดแย้งทางเวลา
- ✅ **ashval_conflict_generator** - สร้างความขัดแย้งระหว่างตัวละครและสถานการณ์
- ✅ **ashval_story_arc_analyzer** - วิเคราะห์ story arcs และความเชื่อมโยง
- ✅ **ashval_smart_filter** - สร้าง views และ filters อัจฉริยะสำหรับฐานข้อมูล
- ✅ **ashval_image_generator** - สร้างคำสั่งสำหรับ AI image generation
- ✅ **ashval_consistency_checker** - ตรวจสอบความสอดคล้องของข้อมูลในโลก Ashval
- ✅ **ashval_world_rules_query** - ค้นหาและตรวจสอบกฎของโลก Ashval
- ✅ **ashval_advanced_prompt_generator** - สร้าง AI prompts ขั้นสูงสำหรับการเขียนเรื่อง
- ✅ **ashval_story_structure_analyzer** - วิเคราะห์โครงสร้างเรื่องและ pacing

### 🟢 สถานะรวม: พร้อมใช้งาน (17/17 เครื่องมือ)

*Last updated: 2025-07-13*

---

## 🌟 คุณสมบัติเด่น

- รองรับการสร้าง/วิเคราะห์โครงสร้างเรื่อง, ตัวละคร, ฉาก, Arcana, Timeline, Conflict ฯลฯ
- ใช้งานผ่าน Model Context Protocol (MCP) สำหรับ AI agents
- ขยายฟีเจอร์ง่ายด้วยระบบ Tool Registration
- เชื่อมต่อฐานข้อมูล Notion หลายตาราง (ดูรายละเอียดด้านล่าง)

---

## 🚀 วิธีติดตั้งและใช้งาน

### 1️⃣ ติดตั้งโปรเจกต์
```bash
git clone https://github.com/billlzzz10/notion-mcp-server.git
cd notion-mcp-server
npm install
```

### 2️⃣ สร้างฐานข้อมูลใน Notion

คุณต้องสร้างฐานข้อมูลใน Notion ให้ครบถ้วนตามรายการด้านล่าง (ดูตัวอย่าง properties ในไฟล์ `.env.example`)

#### 🗄️ รายการฐานข้อมูลที่ต้องมี (ภาษาไทย)

**1. ฐานข้อมูลตัวละคร (Characters)**
  - Name (Title)
  - Role (Select): Protagonist, Antagonist, Supporting, Minor
  - Arc Status (Select): Not Started, Developing, Complete
  - Screen Time (Select): Major, Medium, Minor
  - Goal (Rich Text)
  - Personality (Rich Text)

**2. ฐานข้อมูลฉาก (Scenes)**
  - Title (Title)
  - Chapter (Number)
  - Order (Number)
  - Summary (Rich Text)
  - Purpose (Rich Text)
  - Conflict (Rich Text)
  - Tone (Select): มืดมัว, น่ากลัว, หวังใจ, ฯลฯ
  - Emotional Arc (Select)
  - Pacing (Select)
  - Characters in Scene (Relation)

**3. ฐานข้อมูลสถานที่ (Locations)**
  - Name (Title)
  - Description (Rich Text)
  - Type (Select)

**4. ฐานข้อมูลโลก (Worlds)**
  - Name (Title)
  - Description (Rich Text)

**5. ฐานข้อมูลระบบพลัง (Power Systems)**
  - Name (Title)
  - Type (Select): Etheria, Umbra
  - Description (Rich Text)

**6. ฐานข้อมูล Arcana (Arcanas)**
  - Name (Title)
  - Description (Rich Text)

**7. ฐานข้อมูลภารกิจ (Missions)**
  - Name (Title)
  - Status (Select)
  - Description (Rich Text)

**8. ฐานข้อมูล AI Prompts (AI Prompts)**
  - Prompt (Rich Text)
  - Type (Select)

**9. ฐานข้อมูลประวัติการเปลี่ยนแปลง (Version History)**
  - Title (Title)
  - Entity Type (Select)
  - Change Type (Select)
  - New Value (Rich Text)
  - Reason (Rich Text)
  - AI Generated (Checkbox)

**10. ฐานข้อมูลเส้นเวลาเรื่อง (Story Timeline)**
  - Title (Title)
  - Description (Rich Text)

**11. ฐานข้อมูล Story Arcs (Story Arcs)**
  - Arc Name (Title)
  - Arc Type (Select)
  - Theme (Select)
  - Central Conflict (Rich Text)

**12. ฐานข้อมูลกฎของโลก (World Rules)**
  - Rule (Title)
  - Description (Rich Text)

---

### 3️⃣ ตั้งค่า Environment Variables

คัดลอกไฟล์ `.env.example` เป็น `.env` แล้วกรอกข้อมูลจริง:

```env
NOTION_TOKEN=your_notion_integration_token
NOTION_PAGE_ID=your_root_page_id
NOTION_CHARACTERS_DB_ID=your_characters_database_id
NOTION_SCENES_DB_ID=your_scenes_database_id
NOTION_LOCATIONS_DB_ID=your_locations_database_id
NOTION_WORLDS_DB_ID=your_worlds_database_id
NOTION_POWER_SYSTEMS_DB_ID=your_power_systems_database_id
NOTION_ARCANAS_DB_ID=your_arcanas_database_id
NOTION_MISSIONS_DB_ID=your_missions_database_id
NOTION_AI_PROMPTS_DB_ID=your_ai_prompts_database_id
NOTION_VERSION_HISTORY_DB_ID=your_version_history_database_id
NOTION_STORY_TIMELINE_DB_ID=your_story_timeline_database_id
NOTION_STORY_ARCS_DB_ID=your_story_arcs_database_id
NOTION_WORLD_RULES_DB_ID=your_world_rules_database_id
```

**วิธีหา Database ID:**
1. เปิดฐานข้อมูลใน Notion
2. ดู URL เช่น `https://notion.so/workspace/12345678123456781234567812345678?v=...`
3. ใช้เลข 32 หลักหลัง workspace เป็น Database ID

**วิธีหา Integration Token:**
1. ไปที่ [Notion Developers](https://developers.notion.com/)
2. สร้าง Integration ใหม่และคัดลอก Token

---

### 4️⃣ รันเซิร์ฟเวอร์

```bash
npm run build
npm start
```

หรือสำหรับโหมดพัฒนา:
```bash
npm run watch
```

### 5️⃣ ตั้งค่า Auto-update (ทางเลือก)

สำหรับการอัปเดตสถานะ README อัตโนมัติ:

```bash
# ตั้งค่า git hooks เพื่ออัปเดต README ก่อน commit
npm run setup-hooks

# หรือทำการอัปเดตด้วยตนเอง
npm run status
```

---

## 🗂️ โครงสร้างโปรเจกต์

```plaintext
notion-mcp-server/
├── src/
│   ├── tools/                # MCP tools ทั้งหมด (Notion + Ashval)
│   ├── schema/               # Zod schemas สำหรับ validation
│   ├── services/             # Notion API integration
│   ├── utils/                # ฟังก์ชันช่วยเหลือ
│   ├── config/               # ค่าคงที่และ config
│   └── index.ts              # Entry point
├── .env                      # ตัวแปรสภาพแวดล้อม
├── .env.example              # ตัวอย่างไฟล์ env
├── package.json              # ข้อมูลแพ็คเกจและสคริปต์
├── README.md                 # เอกสารโปรเจกต์
└── .github/
    └── copilot-instructions.md # กฎสำหรับ AI agent
```

---

## 🛠️ ฟีเจอร์หลักของ MCP Tools

- วิเคราะห์โครงสร้างเรื่อง, pacing, character arcs, conflicts, timeline ฯลฯ
- สร้าง/แก้ไข/ลบข้อมูลใน Notion ผ่าน API
- รองรับ batch operations และการเชื่อมโยงข้อมูลข้ามฐานข้อมูล
- สร้าง AI prompts สำหรับ world-building
- บันทึกประวัติการเปลี่ยนแปลงอัตโนมัติ

---

## ✨ **Features ใหม่ล่าสุด v3.0:**

### 🌐 Web Chat Interface
- **Auto-Schema Detection** - ตรวจจับโครงสร้างฐานข้อมูลอัตโนมัติ
- **Dynamic Properties** - ปรับเครื่องมือตาม schema ที่ตรวจพบ
- **File Upload Support** - รองรับไฟล์หลายประเภท (รูปภาพ, PDF, text)
- **Real-time Chat** - สนทนากับ Gemini AI แบบ real-time
- **Responsive Design** - รองรับทุกอุปกรณ์

### 🔧 MCP Gateway
- **HTTP API Endpoints** - เรียกใช้ MCP tools ผ่าน REST API
- **Schema Cache** - เก็บ schema ใน memory เพื่อประสิทธิภาพ
- **Error Handling** - จัดการข้อผิดพลาดอย่างชาญฉลาด
- **Webhook Ready** - พร้อมรับ webhooks จาก Notion

### 🤖 GitHub Copilot Integration
- **VS Code Extension Ready** - ใช้งานผ่าน GitHub Copilot
- **Natural Language** - สั่งงานด้วยภาษาธรรมดา
- **Code Generation** - สร้างโค้ดด้วย AI
- **Documentation** - คู่มือครบถ้วนใน `docs/`

---

## 🛠️ การทดสอบเครื่องมือ

```bash
# ทดสอบการเชื่อมต่อและ schema
node test-tools.js

# ทดสอบการสร้างงานใหม่
node create-test-task.js

# ทดสอบ MCP Gateway
npm run start-gateway
curl http://localhost:3001/api/schema/YOUR_DB_ID
```

---

## 🩺 การแก้ไขปัญหา

- ตรวจสอบ token และ database ID ใน `.env` ว่าถูกต้อง
- เช็คสถานะบริการภายนอก (Notion API, Line API)
- ดู log ข้อผิดพลาดในคอนโซล

---

## 🤝 การร่วมพัฒนา

- Pull requests และ issue ใหม่ๆ ยินดีต้อนรับ!
- โปรดอ่านและปฏิบัติตามแนวทาง contribution ของโปรเจกต์

---

## 📄 License

MIT
 
 