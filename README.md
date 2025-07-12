
# 🦄 Notion MCP Server (Ashval World Building)

เซิร์ฟเวอร์ Node.js สำหรับเชื่อมต่อ Notion API และสร้างระบบ world-building อัตโนมัติสำหรับโลกแฟนตาซี "Ashval"

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