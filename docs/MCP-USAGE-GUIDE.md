# MCP Usage Guide | คู่มือการใช้งาน MCP

## English Version

### 🚀 Getting Started with MCP

The Model Context Protocol (MCP) server provides seamless integration between AI assistants and Notion databases. This guide covers installation, configuration, and usage.

#### Prerequisites
- Node.js 18+ installed
- Notion workspace with integration token
- Notion databases for Characters, Scenes, Locations, etc.

#### Installation

```bash
# Clone the repository
git clone https://github.com/billlzzz10/notion-mcp-server.git
cd notion-mcp-server

# Install dependencies
npm install

# Setup environment
cp .env.example .env
```

#### Configuration

The new architecture uses `config.json` for rules and `settings.json` for secrets.

1.  **`settings.json`**: Create this file in the root directory and add your API keys.
    ```json
    {
      "providers": {
        "openai": { "api_key": "sk-xxx" },
        "anthropic": { "api_key": "..." },
        "google": { "api_key": "..." }
      }
    }
    ```
2.  **`config.json`**: This file controls the Router's behavior. You can define rules to route specific tasks to different models.
3.  **`.env` file**: This file is still used for Notion and server settings.
    ```env
    # Notion Configuration
    NOTION_TOKEN=your_notion_integration_token
    NOTION_CHARACTERS_DB_ID=your_characters_database_id
    ```

#### Available MCP Tools

##### Core Notion Tools
- `notion_pages` - Page management (create, update, search, archive)
- `notion_blocks` - Block operations (view, edit, delete, append)
- `notion_database` - Database operations (create, query, update)
- `notion_comments` - Comment management (view, add)
- `notion_users` - User management (list, info)

##### Ashval World Building Tools
- `ashval_version_control` - Version tracking for data consistency
- `ashval_timeline_analyzer` - Analyze story timelines for consistency
- `ashval_conflict_generator` - Generate conflicts for story development
- `ashval_story_arc_analyzer` - Analyze story arc structure
- `ashval_smart_filter` - Create smart filters and views for databases
- `ashval_image_generator` - Generate prompts for AI image generation
- `ashval_consistency_checker` - Check data consistency across databases
- `ashval_world_rules_query` - Query and verify world rules
- `ashval_advanced_prompt_generator` - Create advanced prompts for content generation
- `ashval_story_structure_analyzer` - Analyze story structure and pacing
- `ashval_character_dialogue_generator` - Generate character dialogue
- `ashval_auto_tag_system` - Suggest tags for content automatically
- `ashval_mind_map_generator` - Create a mind map from an image or text

#### Usage Examples

##### Using MCP Inspector
```bash
npx @modelcontextprotocol/inspector backend/build/index.js \
  -e NOTION_TOKEN=your_token \
  -e NOTION_CHARACTERS_DB_ID=your_db_id
```

##### Direct Tool Usage
```typescript
// Create a character
await callTool('notion_pages', {
  operation: 'create',
  parent: { database_id: process.env.NOTION_CHARACTERS_DB_ID },
  properties: {
    Name: { title: [{ text: { content: 'Character Name' } }] },
    Role: { select: { name: 'Protagonist' } }
  }
});
```

---

## ภาษาไทย

### 🚀 เริ่มต้นใช้งาน MCP

เซิร์ฟเวอร์ Model Context Protocol (MCP) ช่วยเชื่อมต่อ AI assistant กับฐานข้อมูล Notion อย่างราบรื่น คู่มือนี้ครอบคลุมการติดตั้ง กำหนดค่า และการใช้งาน

#### ข้อกำหนดเบื้องต้น
- Node.js เวอร์ชัน 18 ขึ้นไป
- Notion workspace พร้อม integration token
- ฐานข้อมูล Notion สำหรับ Characters, Scenes, Locations เป็นต้น

#### การติดตั้ง

```bash
# Clone repository
git clone https://github.com/billlzzz10/notion-mcp-server.git
cd notion-mcp-server

# ติดตั้ง dependencies
npm install

# ตั้งค่า environment
cp .env.example .env
```

#### การกำหนดค่า

สถาปัตยกรรมใหม่จะใช้ไฟล์ `config.json` สำหรับกฎ และ `settings.json` สำหรับข้อมูลลับ

1.  **`settings.json`**: สร้างไฟล์นี้ที่ root directory และเพิ่ม API keys ของคุณ
    ```json
    {
      "providers": {
        "openai": { "api_key": "sk-xxx" },
        "anthropic": { "api_key": "..." },
        "google": { "api_key": "..." }
      }
    }
    ```
2.  **`config.json`**: ไฟล์นี้ใช้ควบคุมการทำงานของ Router คุณสามารถตั้งกฎเพื่อส่ง task บางประเภทไปยังโมเดลที่ต่างกันได้
3.  **ไฟล์ `.env`**: ไฟล์นี้ยังคงใช้สำหรับการตั้งค่า Notion และ Server
    ```env
    # การกำหนดค่า Notion
    NOTION_TOKEN=your_notion_integration_token
    NOTION_CHARACTERS_DB_ID=your_characters_database_id
    ```

#### เครื่องมือ MCP ที่พร้อมใช้งาน

##### เครื่องมือพื้นฐาน Notion
- `notion_pages` - จัดการหน้า (สร้าง, อัปเดต, ค้นหา, เก็บถาวร)
- `notion_blocks` - จัดการบล็อก (ดู, แก้ไข, ลบ, เพิ่ม)
- `notion_database` - จัดการฐานข้อมูล (สร้าง, สืบค้น, อัปเดต)
- `notion_comments` - จัดการความคิดเห็น (ดู, เพิ่ม)
- `notion_users` - จัดการผู้ใช้ (ดูรายการ, ข้อมูล)

##### เครื่องมือสร้างโลก Ashval
- `ashval_version_control` - ติดตามและจัดการเวอร์ชันของข้อมูล
- `ashval_timeline_analyzer` - วิเคราะห์ไทม์ไลน์เรื่องราวเพื่อความสอดคล้อง
- `ashval_conflict_generator` - สร้างความขัดแย้งสำหรับพัฒนาเรื่องราว
- `ashval_story_arc_analyzer` - วิเคราะห์โครงสร้างเรื่องราว
- `ashval_smart_filter` - สร้าง view และ filter อัจฉริยะ
- `ashval_image_generator` - สร้าง prompt สำหรับ AI สร้างภาพ
- `ashval_consistency_checker` - ตรวจสอบความสอดคล้องของข้อมูลทั่วฐานข้อมูล
- `ashval_world_rules_query` - ค้นหาและตรวจสอบกฎของโลก
- `ashval_advanced_prompt_generator` - สร้าง AI prompt ขั้นสูง
- `ashval_story_structure_analyzer` - วิเคราะห์โครงสร้างและ pacing ของเรื่อง
- `ashval_character_dialogue_generator` - สร้างบทสนทนาของตัวละคร
- `ashval_auto_tag_system` - แนะนำแท็กสำหรับเนื้อหาโดยอัตโนมัติ
- `ashval_mind_map_generator` - สร้าง mind map จากรูปภาพหรือข้อความ

#### ตัวอย่างการใช้งาน

##### ใช้งาน MCP Inspector
```bash
npx @modelcontextprotocol/inspector backend/build/index.js \
  -e NOTION_TOKEN=your_token \
  -e NOTION_CHARACTERS_DB_ID=your_db_id
```

##### การใช้เครื่องมือโดยตรง
```typescript
// สร้างตัวละคร
await callTool('notion_pages', {
  operation: 'create',
  parent: { database_id: process.env.NOTION_CHARACTERS_DB_ID },
  properties: {
    Name: { title: [{ text: { content: 'ชื่อตัวละคร' } }] },
    Role: { select: { name: 'ตัวเอก' } }
  }
});
```

### 🔧 การแก้ไขปัญหาทั่วไป

#### ปัญหาการเชื่อมต่อ Notion
1. ตรวจสอบ `NOTION_TOKEN` ในไฟล์ `.env`
2. ตรวจสอบสิทธิ์ของ Integration ใน Notion
3. ตรวจสอบ Database ID ให้ถูกต้อง

#### ปัญหาประสิทธิภาพ
- ใช้ batch operations สำหรับการประมวลผลจำนวนมาก
- เปิดใช้งาน cache สำหรับข้อมูลที่เข้าถึงบ่อย
- ตรวจสอบการใช้ AI tokens

### 📊 การติดตาม Performance

```bash
# ตรวจสอบสถานะระบบ
curl http://localhost:3001/health

# ตรวจสอบ metrics
curl http://localhost:3001/api/v1/metrics
```

### 🔐 ความปลอดภัย

- ใช้ Rate limiting สำหรับ API endpoints
- เก็บ API keys ใน environment variables
- ใช้ HTTPS สำหรับ production deployment
- ตรวจสอบ dependencies อย่างสม่ำเสมอ

### 📞 การสนับสนุน

- GitHub Issues: [https://github.com/billlzzz10/notion-mcp-server/issues](https://github.com/billlzzz10/notion-mcp-server/issues)
- Documentation: [https://billlzzz10.github.io/notion-mcp-server](https://billlzzz10.github.io/notion-mcp-server)
- Email: support@notion-mcp-server.com