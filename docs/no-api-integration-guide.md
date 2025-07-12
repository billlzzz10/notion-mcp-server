# 🌐 คู่มือการเชื่อมต่อภายนอก - Notion MCP Server

ตัวเลือกการเชื่อมต่อสำหรับผู้ที่ไม่มี Claude API

## 🎯 ตัวเลือกการเชื่อมต่อ

### 1. 🔗 **Claude Desktop (ฟรี - แนะนำ)**
ใช้ Claude Desktop แบบฟรีผ่าน MCP protocol

#### ขั้นตอนการติดตั้ง:
1. **ดาวน์โหลด Claude Desktop**
   ```
   https://claude.ai/download
   ```

2. **ติดตั้งและเปิด Claude Desktop**

3. **เพิ่มการกำหนดค่า MCP**
   - เปิดไฟล์ config: `%APPDATA%\Claude\claude_desktop_config.json`
   - เพิ่มการกำหนดค่า:

```json
{
  "mcpServers": {
    "notion-ashval": {
      "command": "node",
      "args": ["z:\\02_DEV\\notion-mcp-server\\build\\index.js"],
      "env": {
        "NOTION_TOKEN": "your_notion_token",
        "NOTION_CHARACTERS_DB_ID": "your_characters_db_id",
        "NOTION_SCENES_DB_ID": "your_scenes_db_id",
        "NOTION_LOCATIONS_DB_ID": "your_locations_db_id",
        "NOTION_WORLDS_DB_ID": "your_worlds_db_id",
        "NOTION_POWER_SYSTEMS_DB_ID": "your_power_systems_db_id",
        "NOTION_ARCANAS_DB_ID": "your_arcanas_db_id",
        "NOTION_MISSIONS_DB_ID": "your_missions_db_id",
        "NOTION_AI_PROMPTS_DB_ID": "20f5e81a91ff813990f6ece5f2f3d1c6",
        "NOTION_VERSION_HISTORY_DB_ID": "your_version_history_db_id",
        "NOTION_STORY_TIMELINE_DB_ID": "your_story_timeline_db_id",
        "NOTION_STORY_ARCS_DB_ID": "your_story_arcs_db_id",
        "NOTION_WORLD_RULES_DB_ID": "your_world_rules_db_id"
      }
    }
  }
}
```

4. **รีสตาร์ท Claude Desktop**

### 2. 🌐 **Web Interface (แนะนำสำหรับผู้ใช้ทั่วไป)**
สร้าง web interface สำหรับใช้งานง่าย

### 3. 🖥️ **VS Code Extension**
สร้าง VS Code extension สำหรับใช้งานเครื่องมือ

### 4. 📱 **Desktop App ด้วย Electron**
สร้าง desktop application

### 5. 🔧 **Command Line Interface (CLI)**
สร้าง CLI tool สำหรับใช้งานใน terminal

## 🚀 การเริ่มต้นใช้งาน

### ขั้นตอนที่ 1: Build MCP Server
```bash
cd z:\02_DEV\notion-mcp-server
npm run build
```

### ขั้นตอนที่ 2: เลือกวิธีการเชื่อมต่อ

**สำหรับผู้ใช้ทั่วไป (แนะนำ):**
- 🌐 **Web Interface** - ใช้งานผ่านเบราว์เซอร์
- 🔗 **Claude Desktop** - ใช้งานผ่าน Claude แบบฟรี

**สำหรับนักพัฒนา:**
- 🖥️ **VS Code Extension** - ใช้งานใน VS Code
- 📱 **Electron App** - Desktop application
- 🔧 **CLI Tool** - ใช้งานใน terminal

### ขั้นตอนที่ 3: ทดสอบการเชื่อมต่อ
```bash
# ทดสอบ MCP server
node build/index.js
```

## 💡 คำแนะนำ

### เลือกตามความต้องการ:
- **ใช้งานง่าย** → Web Interface
- **ใช้ร่วมกับ AI** → Claude Desktop  
- **พัฒนาต่อ** → VS Code Extension
- **ใช้งานออฟไลน์** → Electron App
- **อัตโนมัติ** → CLI Tool

### การบำรุงรักษา:
- อัพเดต MCP server เมื่อมีฟีเจอร์ใหม่
- สำรองข้อมูล Notion เป็นประจำ
- ตรวจสอบ environment variables

ต้องการให้ผมช่วยสร้างตัวเลือกไหนเป็นพิเศษครับ? 🤔
