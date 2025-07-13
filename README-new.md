# 🏰 Ashval Chat - Notion MCP Server with Personal AI Assistant

*Experience the power of Notion integrated with AI through the Model Context Protocol (MCP)*

[![Version](https://img.shields.io/badge/version-3.0-blue.svg)](https://github.com/awkoy/notion-mcp-server)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-18%2B-brightgreen.svg)](https://nodejs.org/)

*Last updated: 2025-01-12*

---

## ✨ Features ใหม่ล่าสุด v3.0

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

## 📁 โครงสร้างโปรเจกต์

```text
notion-mcp-server/
├── 📂 src/                    # MCP Server source code
│   ├── 📂 tools/             # เครื่องมือ MCP ทั้งหมด (17 ตัว)
│   ├── 📂 server/            # MCP server configuration
│   ├── 📂 services/          # Notion API services
│   ├── 📂 schema/            # Schema definitions
│   └── 📂 types/             # TypeScript type definitions
├── 📂 server/                # HTTP Server & MCP Gateway
│   ├── app.js               # Express server entry point
│   └── 📂 mcp-gateway/       # Gateway for HTTP API access
├── 📂 web-chat/              # Web Chat Interface
│   ├── index.html           # Chat interface
│   ├── index.tsx            # React components
│   └── package.json         # Frontend dependencies
├── 📂 docs/                  # Documentation
│   ├── copilot-integration-guide.md
│   ├── external-integration-guide.md
│   └── projects-database-guide.md
├── 📂 demo/                  # Integration examples
└── 📂 scripts/               # Utility scripts
```

---

## 🚀 Quick Start

### การติดตั้ง

```bash
# Clone repository
git clone https://github.com/awkoy/notion-mcp-server.git
cd notion-mcp-server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

### 1️⃣ ติดตั้งโปรเจกต์

```bash
npm install
echo "NOTION_TOKEN=your_token_here" > .env
echo "NOTION_CHARACTERS_DB_ID=your_db_id" >> .env
echo "NOTION_SCENES_DB_ID=your_db_id" >> .env
echo "NOTION_LOCATIONS_DB_ID=your_db_id" >> .env
```

### 2️⃣ เริ่มต้นใช้งาน

```bash
# Start MCP Server
npm start

# Start Web Chat Interface
cd web-chat && npm run dev

# Start MCP Gateway (API)
npm run start-gateway
```

---

## 🗃️ โครงสร้างฐานข้อมูล Notion

### 1. ฐานข้อมูลตัวละคร (Characters)

- Name (Title)
- Role (Select): Protagonist, Antagonist, Supporting, Minor
- Arc Status (Select): Not Started, Developing, Complete
- Description (Rich Text)
- Abilities (Rich Text)

### 2. ฐานข้อมูลฉาก (Scenes)

- Title (Title)
- Summary (Rich Text)
- Characters (Relation to Characters)
- Location (Relation to Locations)
- Conflict (Rich Text)
- Tone (Select): มืดมัว, น่ากลัว, หวังใจ, ฯลฯ
- Status (Select): Draft, In Progress, Complete

### 3. ฐานข้อมูลสถานที่ (Locations)

- Name (Title)
- Description (Rich Text)
- Type (Select)
- World (Relation to Worlds)

### 4. ฐานข้อมูลโลก (Worlds)

- Name (Title)
- Description (Rich Text)
- Rules (Rich Text)

### 5. ฐานข้อมูลระบบพลัง (Power Systems)

- Name (Title)
- Description (Rich Text)
- Mechanics (Rich Text)

### 6. ฐานข้อมูล Arcana (Arcanas)

- Name (Title)
- Type (Select)
- Description (Rich Text)
- Effects (Rich Text)

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

## 🔧 เครื่องมือ MCP ทั้งหมด

### 📊 Database Tools

- `queryDatabase` - ค้นหาข้อมูลในฐานข้อมูล
- `createDatabase` - สร้างฐานข้อมูลใหม่
- `updateDatabase` - อัพเดตฐานข้อมูล

### 📄 Page Tools

- `createPage` - สร้างหน้าใหม่
- `updatePage` - อัพเดตหน้า
- `updatePageProperties` - อัพเดต properties
- `searchPage` - ค้นหาหน้า

### 🧱 Block Tools

- `appendBlockChildren` - เพิ่ม block ใหม่
- `updateBlock` - อัพเดต block
- `deleteBlock` - ลบ block
- `retrieveBlock` - ดึงข้อมูล block

### 🤖 AI-Powered Tools

- `characterDialogueGenerator` - สร้างบทสนทนาตัวละคร
- `storyArcAnalyzer` - วิเคราะห์โครงเรื่อง
- `consistencyChecker` - ตรวจสอบความสอดคล้อง
- `worldRulesQuery` - ค้นหากฎของโลก
- `conflictGenerator` - สร้างความขัดแย้ง

---

## 🔗 การใช้งาน

### กับ Claude Desktop

```json
{
  "mcpServers": {
    "notion-ashval": {
      "command": "node",
      "args": ["z:/02_DEV/notion-mcp-server/build/index.js"],
      "env": {
        "NOTION_TOKEN": "your_notion_token"
      }
    }
  }
}
```

### กับ GitHub Copilot

ดูคู่มือใน `docs/copilot-integration-guide.md`

### Web Chat Interface

เปิดไฟล์ `web-chat/index.html` ในเบราว์เซอร์

---

## 📚 Documentation

- [Copilot Integration Guide](docs/copilot-integration-guide.md)
- [External Integration Guide](docs/external-integration-guide.md)
- [Projects Database Guide](docs/projects-database-guide.md)
- [Data Completion Assistant](docs/data-completion-assistant-guide.md)
- [Bot Integration Guide](docs/bot-integration-guide.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Notion API](https://developers.notion.com/)
- [Anthropic Claude](https://www.anthropic.com/)
- [Google Gemini](https://deepmind.google/technologies/gemini/)

---

**Made with ❤️ for the Ashval universe and creative storytelling**
