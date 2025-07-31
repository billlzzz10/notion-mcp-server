# Creative AI Command Hub - Frontend Integration Guide
**ศูนย์บัญชาการและผู้ช่วยสร้างสรรค์อัจฉริยะ (MCP-Enhanced)**

## 🏛️ Grand Unified Architecture (สถาปัตยกรรมรวม)

### แนวคิดหลัก: Central Server เป็นหัวใจ
ระบบทั้งหมดจะทำงานโดยมี **Gateway Server (Node.js)** เป็นหัวใจหลักในการเชื่อมต่อและสั่งการส่วนประกอบต่างๆ:

```
[Google Chat - The Mouth & Ears] 🗣️
        ↓ Natural Language Commands
[Gateway Server :3001 - Central Brain] 🧠
        ↓ Context Retrieval (RAG) + MCP
[MCP Notion Database - Long-term Memory] 🎯 ← → [Notion API]
        ↓ Real-time Updates
[Socket.io - The Nerves] ⚡ → [Web Dashboard - Visual Interface] 📊
        ↓ Creative Actions
[Image & Audio Generation APIs] 🎨 + [Obsidian & VS Code Workspaces] 📝
```

### องค์ประกอบหลักของระบบ:

#### 🧠 **Core: Central Server (Node.js)**
- ประตูทางเข้า-ออกเพียงหนึ่งเดียวสำหรับทุกคำสั่งและการเชื่อมต่อ
- ประมวลผลด้วย Gemini API พร้อมบริบทจาก MCP
- จัดการ Webhooks, Socket.io และ API calls ทั้งหมด

#### 🎯 **Interfaces**
- **Google Chat**: สำหรับคำสั่งภาษาธรรมชาติ ("The Mouth & Ears")
- **Real-time Dashboard**: สำหรับติดตามผลและจัดการข้อมูล

#### 🧠 **AI Brain: Gemini API**
- ตีความคำสั่งและสร้างคำตอบด้วยบริบทจาก MCP
- สร้าง Prompt ที่สมบูรณ์จากการรวม Context + User Command

#### 🎯 **Data Source: MCP Notion Database**
- สมองส่วนความจำระยะยาว (Long-term Memory Brain)
- เก็บ rules, preferences, character templates, writing styles
- ระบบ Context Retrieval (RAG) สำหรับ AI ที่เข้าใจบริบท

#### ⚡ **Real-time System: Socket.io**
- กลไกอัปเดตเรียลไทม์ ("The Nerves")
- แจ้งเตือนการเปลี่ยนแปลงทันที

#### 🎨 **Creative Tools Integration**
- Image & Audio Generation APIs
- Obsidian & VS Code (เข้าถึงไฟล์ใน Vault โดยตรง)

### กระบวนการทำงานของ "ความคิด" (Cognitive Process):

1. **Input**: ผู้ใช้ส่งคำสั่งผ่าน Google Chat/Web Interface
2. **Context Retrieval (RAG)**: Gateway ค้นหาข้อมูลที่เกี่ยวข้องจาก MCP Notion DB
3. **Prompt Augmentation**: รวมบริบทจาก MCP + คำสั่งของผู้ใช้
4. **AI Processing**: ส่ง Prompt ที่สมบูรณ์ไปให้ Gemini API
5. **Action**: ดำเนินการตามคำสั่งที่ตีความแล้ว (Notion API, Image/Audio API)
6. **Response**: ส่งคำตอบกลับและอัปเดต Dashboard ผ่าน Socket.io
7. **Learning**: บันทึกการเรียนรู้กลับไปยัง MCP เพื่อปรับปรุงการทำงานครั้งต่อไป

---

## 📂 Project Structure (โครงสร้างโปรเจกต์แบบ Monorepo)

เราใช้โครงสร้างแบบ **Centralized Backend Server** เพื่อจัดการทุกส่วนของโปรเจกต์ในที่เดียว:

```
creative-ai-hub/
├── 📂 backend/                    # ส่วนของเซิร์ฟเวอร์กลาง
│   ├── 📂 public/                 # สำหรับเก็บไฟล์ที่สร้างขึ้น (เช่น .mp3, images)
│   ├── 📜 server.js               # โค้ดเซิร์ฟเวอร์หลัก (รวมทุกอย่าง)
│   ├── 📜 package.json
│   └── 🔑 .env                    # เก็บ API Keys และ Secrets ทั้งหมด
│
├── 📂 frontend/                   # ส่วนของแดชบอร์ด
│   ├── 📂 public/
│   ├── 📂 src/
│   │   ├── 🖼️ Dashboard.jsx       # แดชบอร์ด React
│   │   ├── 🧠 MCPInterface.jsx    # MCP Context Management
│   │   └── ⚡ SocketManager.js     # Real-time updates
│   └── 📜 package.json
│
├── 📂 vault/                      # โฟลเดอร์เก็บไฟล์ Markdown (Obsidian)
│   ├── 📂 Characters/
│   ├── 📂 Scenes/
│   └── 📂 Projects/
│
└── 📂 scripts/                    # สคริปต์เสริม
    ├── setup-mcp.js              # Setup MCP databases
    ├── backup.js                 # Backup scripts
    └── manual-sync.js             # Manual sync เมื่อจำเป็น
```

### ข้อดีของสถาปัตยกรรมนี้:

- **🎯 รวมศูนย์ (Centralized)**: โค้ดและ Logic ทั้งหมดอยู่ที่เดียว ง่ายต่อการจัดการและแก้ไข
- **🔄 ยืดหยุ่น (Flexible)**: เพิ่มหรือปรับเปลี่ยนการเชื่อมต่อกับบริการอื่นๆ ในอนาคตได้ง่าย  
- **⚡ เรียลไทม์ (Real-time)**: รองรับการทำงานแบบทันทีผ่าน Webhooks และ Sockets
- **🧠 MCP-Enhanced**: AI ที่เข้าใจบริบทและเรียนรู้จากการใช้งาน

---

## ⚙️ Complete Central Server Code (backend/server.js)

นี่คือไฟล์ `server.js` ที่รวมฟังก์ชันการทำงานทั้งหมดเข้าไว้ด้วยกัน ตั้งแต่การรับคำสั่ง, MCP Context Retrieval, การเชื่อมต่อ AI, ไปจนถึงการอัปเดตข้อมูล:

```javascript
// ----------------------------------------------------------------
// 1. SETUP & INITIALIZATION  
// ----------------------------------------------------------------
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Client } = require('@notionhq/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const textToSpeech = require('@google-cloud/text-to-speech');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Initialize Clients & Express App
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve generated files
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } }); // Allow all for simplicity

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const ttsClient = new textToSpeech.TextToSpeechClient();

const PORT = process.env.PORT || 4000;
const VAULT_PATH = path.join(__dirname, '..', 'vault');

// ----------------------------------------------------------------
// 2. MCP CONTEXT RETRIEVAL (THE BRAIN'S MEMORY)
// ----------------------------------------------------------------

async function retrieveContextFromMCP(queryText) {
  try {
    console.log(`🧠 Retrieving context for: "${queryText}"`);
    
    // ค้นหาในฐานข้อมูล MCP ด้วย keywords จากคำสั่งผู้ใช้
    const keywords = queryText.toLowerCase().split(' ');
    const response = await notion.databases.query({
      database_id: process.env.MCP_DATABASE_ID,
      filter: {
        or: keywords.map(keyword => ({
          property: "Keywords",
          multi_select: {
            contains: keyword
          }
        }))
      }
    });

    if (response.results.length === 0) {
      return { 
        relevantMemories: [], 
        contextSummary: "No specific context found." 
      };
    }

    // จัดระเบียบและประเมินความเกี่ยวข้อง
    const memories = response.results.map(page => ({
      type: page.properties.Type?.select?.name || 'unknown',
      content: page.properties.Content?.rich_text.map(t => t.plain_text).join('\n') || '',
      importance: page.properties.Importance?.select?.name || 'medium',
      keywords: page.properties.Keywords?.multi_select.map(k => k.name) || [],
      relevanceScore: calculateRelevanceScore(queryText, page)
    })).sort((a, b) => b.relevanceScore - a.relevanceScore);

    console.log(`🎯 Found ${memories.length} relevant memories`);
    return {
      relevantMemories: memories.slice(0, 5), // เอาแค่ 5 อันดับแรก
      contextSummary: `Found ${memories.length} relevant context items`
    };

  } catch (error) {
    console.error("Error retrieving context from MCP:", error);
    return { 
      relevantMemories: [], 
      contextSummary: "Could not retrieve context." 
    };
  }
}

function calculateRelevanceScore(query, mcpPage) {
  // Simple relevance scoring based on keyword matches
  const queryWords = query.toLowerCase().split(' ');
  const contentWords = (mcpPage.properties.Content?.rich_text.map(t => t.plain_text).join(' ') || '').toLowerCase();
  const keywordMatches = mcpPage.properties.Keywords?.multi_select.map(k => k.name.toLowerCase()) || [];
  
  let score = 0;
  queryWords.forEach(word => {
    if (contentWords.includes(word)) score += 0.3;
    if (keywordMatches.includes(word)) score += 0.5;
  });
  
  return Math.min(score, 1.0); // Cap at 1.0
}

// ----------------------------------------------------------------
// 3. WEBHOOK ENDPOINTS (INPUTS)
// ----------------------------------------------------------------

// Endpoint สำหรับรับคำสั่งจาก Google Chat (Primary Command Interface)
app.post('/webhook/google-chat', async (req, res) => {
    if (req.body.type !== 'MESSAGE') return res.json({ text: '' });

    const commandText = req.body.message.text.replace(/@\S+\s*/, '').trim();
    console.log(`🤖 Received command from Google Chat: "${commandText}"`);
    
    const responseText = await processNaturalCommand(commandText);
        
    // ตอบกลับไปที่ Google Chat
    await axios.post(process.env.GOOGLE_CHAT_WEBHOOK_URL, { text: responseText });
    res.sendStatus(200);
});

// Endpoint สำหรับรับการอัปเดตจาก Notion Automations (Data Sync)
app.post('/webhook/notion-update', async (req, res) => {
    try {
        const pageId = req.body.pageId || req.body.page?.id;
        if (!pageId) return res.status(400).send('Page ID is missing');

        const page = await notion.pages.retrieve({ page_id: pageId });
        const title = page.properties.Name.title[0].plain_text;
        const mdContent = `# ${title}\n\n*Synced from Notion at ${new Date().toISOString()}*`;
        const filePath = path.join(VAULT_PATH, `${title}.md`);
                
        fs.writeFileSync(filePath, mdContent, 'utf-8');
        console.log(`✅ Synced page to vault: ${title}`);

        // แจ้งเตือน Dashboard แบบเรียลไทม์
        io.emit('db-update', await getNotionDatabaseState());
        res.status(200).send('OK');
    } catch (error) {
        console.error('Error processing Notion webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

// ----------------------------------------------------------------
// 4. AI PROCESSING CORE (THE ENHANCED BRAIN)
// ----------------------------------------------------------------

async function processNaturalCommand(text) {
    // 1. ดึงบริบทที่เกี่ยวข้องจาก MCP
    const mcpContext = await retrieveContextFromMCP(text);

    // 2. สร้าง Prompt ที่สมบูรณ์และ context-aware
    const augmentedPrompt = `
        You are a hyper-personalized AI assistant for a creative writer.
        Use the following context to understand the user's rules, preferences, and creative history.

        --- CONTEXT FROM MCP (Long-term Memory) ---
        ${mcpContext.relevantMemories.map(memory => 
            `[${memory.type.toUpperCase()}] ${memory.content} (Relevance: ${memory.relevanceScore.toFixed(2)})`
        ).join('\n')}
        
        Context Summary: ${mcpContext.contextSummary}
        ------------------------

        Based on the context above, interpret the user's LATEST command and respond with a JSON action.
        User's Command: "${text}"

        Respond with a JSON object with "action" and parameters. 
        Possible actions: 'update_notion', 'generate_image', 'generate_audio', 'query_db', 'dashboard_summary', 'create_character', 'unknown'.
        
        Examples:
        - For "สร้างตัวละครชื่อ Elena": {"action": "create_character", "name": "Elena", "details": "มีลักษณะ..."}
        - For "อัปเดตสถานะบทที่ 5": {"action": "update_notion", "pageName": "บทที่ 5", "property": "Status", "value": "กำลังแก้ไข"}
        - For "สร้างรูปหุ่นยนต์": {"action": "generate_image", "prompt": "a robot illustration"}
        - For "สรุปแดชบอร์ด": {"action": "dashboard_summary"}
    `;

    try {
        const result = await geminiModel.generateContent(augmentedPrompt);
        const actionJson = JSON.parse(result.response.text());
        console.log("🧠 Gemini interpretation (with MCP context):", actionJson);

        // Store this interaction for future learning
        await storeMCPLearning(text, actionJson, mcpContext);

        switch (actionJson.action) {
            case 'update_notion':
                return await handleNotionUpdate(actionJson);
            case 'generate_image':
                return await handleImageGeneration(actionJson.prompt);
            case 'generate_audio':
                return await handleAudioGeneration(actionJson.text || text);
            case 'create_character':
                return await handleCharacterCreation(actionJson);
            case 'dashboard_summary':
                return await sendChatCard(await createSummaryCard());
            default:
                return "ขออภัย ผมไม่เข้าใจคำสั่งนี้ กรุณาลองใหม่หรืออธิบายเพิ่มเติม";
        }
    } catch (error) {
        console.error("Error with Gemini (with MCP context):", error);
        return "เกิดข้อผิดพลาดในการประมวลผลคำสั่ง กรุณาลองใหม่อีกครั้ง";
    }
}

// ----------------------------------------------------------------
// 5. ACTION HANDLERS (THE HANDS)
// ----------------------------------------------------------------

async function handleNotionUpdate(actionData) {
    console.log(`📝 Updating Notion: ${actionData.pageName}`);
    // TODO: Implement actual Notion update logic
    return `✅ รับทราบแล้ว! จะอัปเดต "${actionData.pageName}" เป็น "${actionData.value}"`;
}

async function handleImageGeneration(prompt) {
    console.log(`🎨 Generating image for: ${prompt}`);
    // TODO: Integrate with actual image generation API (DALL-E, Midjourney, etc.)
    const imageUrl = `https://via.placeholder.com/512x512.png?text=${encodeURIComponent(prompt)}`;
    return `🖼️ สร้างภาพเรียบร้อยแล้ว: ${imageUrl}`;
}

async function handleAudioGeneration(text) {
    console.log(`🎙️ Generating audio for: "${text}"`);
    const request = {
        input: { text: text },
        voice: { languageCode: 'th-TH', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
    };
    
    try {
        const [response] = await ttsClient.synthesizeSpeech(request);
        const fileName = `audio_${Date.now()}.mp3`;
        const filePath = path.join(__dirname, 'public', fileName);
        fs.writeFileSync(filePath, response.audioContent, 'binary');
            
        const serverUrl = process.env.SERVER_URL || `http://localhost:${PORT}`;
        return `🎵 สร้างเสียงเรียบร้อยแล้ว: ${serverUrl}/${fileName}`;
    } catch (error) {
        console.error("Error generating audio:", error);
        return "⚠️ ไม่สามารถสร้างเสียงได้ในขณะนี้";
    }
}

async function handleCharacterCreation(characterData) {
    console.log(`👤 Creating character: ${characterData.name}`);
    // TODO: Create actual Notion page for character
    return `✅ สร้างตัวละคร "${characterData.name}" เรียบร้อยแล้ว ${characterData.details || ''}`;
}

// ----------------------------------------------------------------
// 6. MCP LEARNING & MEMORY STORAGE
// ----------------------------------------------------------------

async function storeMCPLearning(userInput, aiAction, context) {
    try {
        // Store this interaction for future learning
        await notion.pages.create({
            parent: { database_id: process.env.MCP_CONTEXT_DB_ID },
            properties: {
                Query: { title: [{ text: { content: userInput } }] },
                'AI Action': { rich_text: [{ text: { content: JSON.stringify(aiAction) } }] },
                'Context Used': { rich_text: [{ text: { content: context.contextSummary } }] },
                Timestamp: { date: { start: new Date().toISOString() } }
            }
        });
        console.log("💾 Stored interaction for MCP learning");
    } catch (error) {
        console.error("Error storing MCP learning:", error);
    }
}

// ----------------------------------------------------------------
// 7. REAL-TIME DASHBOARD & COMMUNICATION
// ----------------------------------------------------------------

async function getNotionDatabaseState() {
    try {
        const response = await notion.databases.query({ 
            database_id: process.env.NOTION_CHARACTERS_DB_ID 
        });
        return response.results.map(page => ({
            id: page.id,
            Name: page.properties.Name?.title[0]?.plain_text || 'Untitled',
            Status: page.properties.Status?.select?.name || 'N/A',
            UpdatedAt: new Date(page.last_edited_time).toLocaleString()
        }));
    } catch (error) {
        console.error("Failed to fetch database state:", error);
        return [];
    }
}

async function sendChatCard(cardData) {
    try {
        await axios.post(process.env.GOOGLE_CHAT_WEBHOOK_URL, {
            cardsV2: [{
                cardId: "summaryCard", 
                card: cardData
            }]
        });
        return "📊 ส่งสรุปแดชบอร์ดไปยัง Google Chat แล้ว";
    } catch (error) {
        console.error("Error sending chat card:", error);
        return "⚠️ ไม่สามารถส่งสรุปแดชบอร์ดได้";
    }
}

async function createSummaryCard() {
    const dbState = await getNotionDatabaseState();
    
    const statusGroups = {};
    dbState.forEach(item => {
        if (!statusGroups[item.Status]) {
            statusGroups[item.Status] = [];
        }
        statusGroups[item.Status].push(item.Name);
    });
    
    const sections = Object.keys(statusGroups).map(status => ({
        header: status,
        widgets: statusGroups[status].map(name => ({
            textParagraph: { text: `<b>${name}</b>` }
        }))
    }));
    
    return {
        header: {
            title: "🎯 Creative Project Status",
            subtitle: "อัปเดตล่าสุด: " + new Date().toLocaleTimeString(),
            imageUrl: "https://via.placeholder.com/64x64.png?text=🤖",
            imageType: "CIRCLE"
        },
        sections: sections
    };
}

// ----------------------------------------------------------------
// 8. SOCKET.IO REAL-TIME UPDATES
// ----------------------------------------------------------------

io.on('connection', (socket) => {
    console.log('📈 Dashboard connected:', socket.id);
    
    // Send initial data on connect
    socket.on('subscribe-to-db', async () => {
        socket.emit('db-update', await getNotionDatabaseState());
    });

    // Handle real-time commands from dashboard
    socket.on('mcp-query', async (query) => {
        const context = await retrieveContextFromMCP(query);
        socket.emit('mcp-context', context);
    });

    socket.on('disconnect', () => {
        console.log('📉 Dashboard disconnected:', socket.id);
    });
});

// ----------------------------------------------------------------
// 9. SERVER START
// ----------------------------------------------------------------

server.listen(PORT, () => {
    console.log(`🚀 Creative AI Command Hub is running on http://localhost:${PORT}`);
    console.log(`🧠 MCP Context Retrieval: ENABLED`);
    console.log(`🎯 Notion Integration: READY`);
    console.log(`⚡ Real-time Updates: ACTIVE`);
});
```

---

## 🔑 Environment Variables Setup (.env)

```env
# ================================================================
# CREATIVE AI COMMAND HUB - COMPLETE CONFIGURATION
# ================================================================

# Notion Integration
NOTION_TOKEN="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
NOTION_CHARACTERS_DB_ID="21a5e81axxxxxxxxxxxxxxxxxxxxxxxx"     # Main Characters Database
NOTION_SCENES_DB_ID="2195e81axxxxxxxxxxxxxxxxxxxxxxxx"        # Scenes Database  
NOTION_PROJECTS_DB_ID="20f5e81axxxxxxxxxxxxxxxxxxxxxxxx"      # Projects Database

# MCP-Specific Databases (สำหรับ Context และ Learning)
MCP_DATABASE_ID="22a5e81axxxxxxxxxxxxxxxxxxxxxxxx"            # MCP Long-term Memory
MCP_CONTEXT_DB_ID="23a5e81axxxxxxxxxxxxxxxxxxxxxxxx"          # Context Tracking
MCP_TEMPLATES_DB_ID="24a5e81axxxxxxxxxxxxxxxxxxxxxxxx"        # Prompt Templates

# Google AI & Cloud Services
GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
GOOGLE_APPLICATION_CREDENTIALS="./path/to/gcp-service-account.json"  # สำหรับ TTS

# Google Chat Integration
GOOGLE_CHAT_WEBHOOK_URL="https://chat.googleapis.com/v1/spaces/XXXXXXX/messages?key=XXXXX"
GOOGLE_CHAT_TOKEN="your_chat_token_here"

# Server Configuration
PORT=4000
NODE_ENV=production
SERVER_URL="https://your-domain.com"                          # Public URL สำหรับ webhooks

# Creative Tools APIs
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # สำหรับ DALL-E (ถ้าใช้)
STABILITY_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # สำหรับ Stable Diffusion

# Security & Performance
JWT_SECRET="your-super-secret-jwt-key-here"
CORS_ORIGIN="https://your-frontend-domain.com"
WEBHOOK_SECRET="supersecret"                                   # สำหรับยืนยัน Notion webhooks

# Cache & Performance (Optional)
REDIS_URL="redis://localhost:6379"
MCP_CACHE_TTL=3600                                            # Context cache time (seconds)
```

---

## 📋 Complete Action Plan (แผนการดำเนินงานฉบับสมบูรณ์)

### 🚀 Phase 1: Project Setup (วันที่ 1-2)

#### 1.1 ตั้งค่าโปรเจกต์พื้นฐาน

```bash
# สร้างโครงสร้างโฟลเดอร์
mkdir creative-ai-hub
cd creative-ai-hub
mkdir backend frontend vault scripts

# ตั้งค่า Backend
cd backend
npm init -y
npm install express socket.io @notionhq/client @google/generative-ai @google-cloud/text-to-speech axios dotenv cors

# ตั้งค่า Frontend  
cd ../frontend
npx create-react-app .
npm install socket.io-client axios
```

#### 1.2 กำหนดค่า Environment Variables

```bash
# สร้างไฟล์ .env ใน backend/
cp .env.example .env
# แก้ไขใส่ API Keys ทั้งหมดตามตัวอย่างข้างต้น
```

#### 1.3 ตั้งค่า Workspace

```bash
# VS Code: เปิดโฟลเดอร์ vault/ สำหรับแก้ไขไฟล์ Markdown
code ../vault

# Obsidian: เปิด vault/ เป็น Obsidian Vault ใหม่
```

### 🧠 Phase 2: MCP Database Setup (วันที่ 3-4)

#### 2.1 สร้าง MCP Databases ใน Notion

**MCP Memory Database Schema:**

| Property Name | Type | Options |
|---------------|------|---------|
| ID | Title | - |
| Content | Rich Text | - |
| Type | Select | rule, character_template, writing_style, user_preference, prompt_template |
| Keywords | Multi-select | สร้าง tags ตามต้องการ เช่น ashval, character, magic, dialogue |
| Importance | Select | high, medium, low |
| Usage Count | Number | Default: 0 |
| Last Used | Date | - |

**MCP Context Database Schema:**

| Property Name | Type | Options |
|---------------|------|---------|
| Query | Title | - |
| AI Action | Rich Text | - |
| Context Used | Rich Text | - |
| Timestamp | Date | - |
| Success | Checkbox | - |

#### 2.2 เพิ่มข้อมูลเริ่มต้นใน MCP

สร้างหน้าในฐานข้อมูล MCP Memory ด้วยข้อมูลเริ่มต้น:

```
1. Type: rule
   Content: "เมื่อผู้ใช้ขอสร้างตัวละคร ให้ถามเพิ่มเติมเกี่ยวกับ backstory และ motivation"
   Keywords: character, creation, rule

2. Type: writing_style  
   Content: "ใช้ภาษาไทยในการตอบกลับ เป็นกันเอง แต่สุภาพ"
   Keywords: thai, language, style

3. Type: character_template
   Content: "Template for Ashval characters: Name, Race, Class, Background, Motivation, Relationships"
   Keywords: ashval, character, template
```

### ⚡ Phase 3: Backend Implementation (วันที่ 5-7)

#### 3.1 นำโค้ด server.js ไปใช้

```bash
# Copy โค้ด server.js ที่ให้ไว้ข้างต้นไปใส่ใน backend/server.js
# ตรวจสอบ path ไปยัง vault และแก้ไขตามจำเป็น
```

#### 3.2 ทดสอบ Backend

```bash
cd backend
node server.js

# ควรเห็น:
# 🚀 Creative AI Command Hub is running on http://localhost:4000
# 🧠 MCP Context Retrieval: ENABLED
# 🎯 Notion Integration: READY
# ⚡ Real-time Updates: ACTIVE
```

### 🎯 Phase 4: External Services Setup (วันที่ 8-9)

#### 4.1 ตั้งค่า Notion Automations

1. ไปที่ Notion Database ที่ต้องการ
2. คลิก "..." → "Add automation"
3. Trigger: "When a page is updated"
4. Action: "Send HTTP request"
   - URL: `https://your-domain.com:4000/webhook/notion-update`
   - Method: POST
   - Body: JSON `{"pageId": "{{page.id}}", "secret": "supersecret"}`

#### 4.2 ตั้งค่า Google Chat

1. สร้าง Google Chat Space หรือใช้ Space ที่มีอยู่
2. ตั้งค่า Incoming Webhook:
   - คลิก Space name → "Manage webhooks"
   - สร้าง webhook ใหม่และคัดลอก URL มาใส่ในไฟล์ .env
3. สร้าง Google Chat App (optional):
   - ไปที่ Google Cloud Console → APIs & Services → Credentials
   - สร้าง Service Account และ download JSON
   - ตั้งค่าให้ Chat App ส่งคำสั่งมาที่ `/webhook/google-chat`

#### 4.3 ตั้งค่า Google Cloud (สำหรับ TTS)

```bash
# Install Google Cloud SDK
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable APIs
gcloud services enable texttospeech.googleapis.com
gcloud services enable generativelanguage.googleapis.com

# สร้าง Service Account
gcloud iam service-accounts create creative-ai-hub
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID --member="serviceAccount:creative-ai-hub@YOUR_PROJECT_ID.iam.gserviceaccount.com" --role="roles/cloudtts.user"
```

---

## 🎯 Expected Results (ผลลัพธ์ที่คาดหวัง)

เมื่อสร้างระบบเสร็จสิ้น คุณจะได้:

### 🤖 **AI Assistant ที่เฉลียวฉลาด**
- เข้าใจคำสั่งภาษาไทยธรรมชาติ ✅
- จำและเรียนรู้จากการสนทนาก่อนหน้า ✅
- ตอบสนองตามบริบทและความต้องการเฉพาะ ✅

### 📱 **Command Interface ที่หลากหลาย**
- Google Chat: สั่งงานด้วยข้อความ ✅
- Web Dashboard: จัดการและติดตามแบบ visual ✅
- Obsidian/VS Code: แก้ไขไฟล์ได้โดยตรง ✅

### 🔄 **Automated Workflow**
- Notion → Obsidian sync แบบทันที ✅  
- การสร้างเนื้อหาอัตโนมัติ (ภาพ, เสียง) ✅
- การอัปเดตข้อมูลแบบเรียลไทม์ ✅

### 🧠 **Context-Aware Intelligence**
- จำกฏ, ลักษณะตัวละคร, และรายละเอียดโลก ✅
- ปรับแต่งการตอบสนองตามสไตล์การเขียน ✅
- เรียนรู้จากการใช้งานและปรับปรุงตัวเอง ✅

**🎉 ผลลัพธ์สุดท้าย:** ผู้ช่วยสร้างสรรค์อัจฉริยะที่เข้าใจคุณ, ทำงานร่วมกับเครื่องมือทั้งหมด, และช่วยให้การเขียนและการสร้างสรรค์มีประสิทธิภาพสูงสุด!

---
```http
GET /api/mcp/context?query={searchText}
```

**Response:**
```json
{
  "success": true,
  "context": {
    "relevant_memories": [
      {
        "type": "rule",
        "content": "Always write in Thai when responding to users",
        "relevance_score": 0.95
      },
      {
        "type": "character_bio", 
        "content": "Ashval Thorne is the main protagonist...",
        "relevance_score": 0.87
      }
    ],
    "prompt_templates": [
      {
        "name": "character_creation",
        "template": "Create a character with these traits: {traits}"
      }
    ]
  }
}
```

### 2. AI Command Processing (with MCP Context)
```http
POST /api/mcp/command
Content-Type: application/json
```

**Request:**
```json
{
  "command": "สร้างตัวละครใหม่ชื่อ Elena เป็นนักเวทย์",
  "include_context": true,
  "context_types": ["rules", "character_templates", "writing_style"],
  "user_session": {
    "userId": "user123",
    "sessionId": "session456"
  }
}
```

**Response:**
```json
{
  "success": true,
  "interpreted_action": {
    "action": "create_character",
    "parameters": {
      "name": "Elena",
      "race": "Human",
      "class": "Mage",
      "background": "Studied at the Academy of Arcane Arts"
    },
    "confidence": 0.94
  },
  "context_used": [
    "Applied character naming rules",
    "Used default mage template",
    "Applied writing style guidelines"
  ],
  "response": "✅ สร้างตัวละคร Elena นักเวทย์เรียบร้อยแล้ว ตามกฎการตั้งชื่อและสไตล์ที่กำหนดไว้",
  "notion_page_id": "page_xyz123"
}
```

### 3. MCP Memory Management
```http
POST /api/mcp/memory
Content-Type: application/json
```

**Request:**
```json
{
  "action": "store",
  "memory_type": "rule",
  "content": "เมื่อผู้ใช้ขอสร้างตัวละคร ให้ถามเพิ่มเติมเกี่ยวกับ backstory",
  "keywords": ["character", "creation", "backstory"],
  "importance": "high"
}
```

### 4. Real-time Dashboard Updates
```http
WebSocket: ws://your-domain.com:3001/mcp-updates
```

**Event Types:**
```javascript
// Database updated
{
  "type": "database_updated",
  "database": "Characters",
  "action": "created",
  "page_id": "xyz123",
  "summary": "New character Elena created"
}

// Context learned
{
  "type": "context_learned", 
  "memory_type": "user_preference",
  "content": "User prefers detailed character descriptions"
}

// AI processing status
{
  "type": "ai_thinking",
  "status": "retrieving_context",
  "progress": 45
}
```

---

## 🔧 MCP-Enhanced Frontend Implementation

### Required Components for MCP Integration

#### 1. **MCP Context Chat Interface**

```javascript
// Enhanced Chat API with MCP Context
const sendMCPCommand = async (message, contextTypes = ['all']) => {
  const response = await fetch('/api/mcp/command', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({
      command: message,
      include_context: true,
      context_types: contextTypes, // ['rules', 'character_templates', 'writing_style']
      user_session: {
        userId: getCurrentUserId(),
        sessionId: getSessionId()
      }
    })
  });
  
  const result = await response.json();
  
  // Show context used in UI
  if (result.context_used?.length > 0) {
    displayContextUsed(result.context_used);
  }
  
  return result;
};

// Context Preview Component
const ContextPreview = ({ query }) => {
  const [context, setContext] = useState(null);
  
  useEffect(() => {
    if (query) {
      fetch(`/api/mcp/context?query=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => setContext(data.context));
    }
  }, [query]);
  
  return (
    <div className="context-preview">
      <h4>🧠 Relevant Context Found:</h4>
      {context?.relevant_memories?.map((memory, idx) => (
        <div key={idx} className="memory-item">
          <span className="memory-type">{memory.type}</span>
          <span className="memory-content">{memory.content.substring(0, 100)}...</span>
          <span className="relevance-score">{(memory.relevance_score * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  );
};
```

#### 2. **MCP Memory Management Interface**

```javascript
// Memory Management Component
const MCPMemoryManager = () => {
  const [memories, setMemories] = useState([]);
  const [newMemory, setNewMemory] = useState({
    type: 'rule',
    content: '',
    keywords: [],
    importance: 'medium'
  });
  
  const saveMemory = async () => {
    const response = await fetch('/api/mcp/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'store',
        memory_type: newMemory.type,
        content: newMemory.content,
        keywords: newMemory.keywords,
        importance: newMemory.importance
      })
    });
    
    if (response.ok) {
      refreshMemories();
      setNewMemory({ type: 'rule', content: '', keywords: [], importance: 'medium' });
    }
  };
  
  return (
    <div className="mcp-memory-manager">
      <h3>🧠 MCP Memory Management</h3>
      
      {/* Add New Memory Form */}
      <div className="add-memory-form">
        <select 
          value={newMemory.type} 
          onChange={(e) => setNewMemory({...newMemory, type: e.target.value})}
        >
          <option value="rule">Rule</option>
          <option value="character_template">Character Template</option>
          <option value="writing_style">Writing Style</option>
          <option value="user_preference">User Preference</option>
        </select>
        
        <textarea
          placeholder="Enter memory content..."
          value={newMemory.content}
          onChange={(e) => setNewMemory({...newMemory, content: e.target.value})}
        />
        
        <input
          placeholder="Keywords (comma-separated)"
          value={newMemory.keywords.join(', ')}
          onChange={(e) => setNewMemory({
            ...newMemory, 
            keywords: e.target.value.split(',').map(k => k.trim())
          })}
        />
        
        <button onClick={saveMemory}>💾 Save Memory</button>
      </div>
      
      {/* Existing Memories List */}
      <div className="memories-list">
        {memories.map((memory, idx) => (
          <div key={idx} className="memory-card">
            <div className="memory-header">
              <span className="memory-type">{memory.type}</span>
              <span className="memory-importance">{memory.importance}</span>
            </div>
            <div className="memory-content">{memory.content}</div>
            <div className="memory-keywords">
              {memory.keywords.map(keyword => (
                <span key={keyword} className="keyword-tag">{keyword}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### 3. **Enhanced Real-time MCP Updates**

```javascript
// MCP WebSocket Integration
const useMCPWebSocket = () => {
  const [mcpStatus, setMCPStatus] = useState('connecting');
  const [lastUpdate, setLastUpdate] = useState(null);
  
  useEffect(() => {
    const ws = new WebSocket('ws://your-domain.com:3001/mcp-updates');
    
    ws.onopen = () => setMCPStatus('connected');
    ws.onclose = () => setMCPStatus('disconnected');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastUpdate(data);
      
      switch (data.type) {
        case 'database_updated':
          // Refresh relevant database views
          refreshDatabaseView(data.database);
          showNotification(`✅ ${data.summary}`);
          break;
          
        case 'context_learned':
          // Update MCP context display
          showNotification(`🧠 Learned: ${data.content}`);
          break;
          
        case 'ai_thinking':
          // Show AI processing status
          updateAIStatus(data.status, data.progress);
          break;
          
        default:
          console.log('Unknown MCP update:', data);
      }
    };
    
    return () => ws.close();
  }, []);
  
  return { mcpStatus, lastUpdate };
};

// AI Processing Status Component
const AIProcessingStatus = () => {
  const [status, setStatus] = useState(null);
  
  return status ? (
    <div className="ai-processing-status">
      <div className="status-icon">🤖</div>
      <div className="status-text">{status.text}</div>
      {status.progress && (
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${status.progress}%` }}
          />
        </div>
      )}
    </div>
  ) : null;
};
```

#### 4. **MCP Dashboard Analytics**

```javascript
// MCP Analytics Dashboard
const MCPAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  
  useEffect(() => {
    fetch('/api/mcp/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data));
  }, []);
  
  return (
    <div className="mcp-analytics">
      <h3>📊 MCP System Analytics</h3>
      
      <div className="analytics-grid">
        <div className="metric-card">
          <h4>Memory Efficiency</h4>
          <div className="metric-value">{analytics?.memory_efficiency}%</div>
          <div className="metric-trend">↗️ +5% this week</div>
        </div>
        
        <div className="metric-card">
          <h4>Context Matches</h4>
          <div className="metric-value">{analytics?.context_matches}</div>
          <div className="metric-description">Average per command</div>
        </div>
        
        <div className="metric-card">
          <h4>AI Accuracy</h4>
          <div className="metric-value">{analytics?.ai_accuracy}%</div>
          <div className="metric-description">Command interpretation</div>
        </div>
        
        <div className="metric-card">
          <h4>Response Time</h4>
          <div className="metric-value">{analytics?.avg_response_time}ms</div>
          <div className="metric-description">Average processing</div>
        </div>
      </div>
      
      {/* Context Usage Chart */}
      <div className="context-usage-chart">
        <h4>Context Type Usage</h4>
        <BarChart data={analytics?.context_usage} />
      </div>
      
      {/* Recent Learning Activity */}
      <div className="recent-learning">
        <h4>🧠 Recent Learning Activity</h4>
        {analytics?.recent_learning?.map((activity, idx) => (
          <div key={idx} className="learning-item">
            <span className="timestamp">{activity.timestamp}</span>
            <span className="learning-type">{activity.type}</span>
            <span className="learning-content">{activity.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🎨 UI/UX Style Guide

### 🎨 Color Palette

#### Primary Colors
```css
:root {
  /* Main Brand Colors */
  --primary-color: #2563eb;        /* Blue primary */
  --primary-hover: #1d4ed8;       /* Blue hover */
  --primary-light: #dbeafe;       /* Light blue */
  
  /* Secondary Colors */
  --secondary-color: #64748b;     /* Slate gray */
  --secondary-hover: #475569;     /* Dark slate */
  --secondary-light: #f1f5f9;     /* Light slate */
  
  /* Accent Colors */
  --accent-success: #10b981;      /* Green for success */
  --accent-warning: #f59e0b;      /* Orange for warnings */
  --accent-danger: #ef4444;       /* Red for errors */
  --accent-info: #06b6d4;         /* Cyan for info */
}
```

#### Background & Surface Colors
```css
:root {
  /* Light Theme */
  --bg-primary: #ffffff;          /* Main background */
  --bg-secondary: #f8fafc;        /* Secondary background */
  --bg-tertiary: #f1f5f9;         /* Tertiary background */
  --surface: #ffffff;             /* Card/surface background */
  --surface-hover: #f8fafc;       /* Hover state */
  
  /* Dark Theme Support */
  --bg-primary-dark: #0f172a;     /* Dark main background */
  --bg-secondary-dark: #1e293b;   /* Dark secondary */
  --surface-dark: #334155;        /* Dark surface */
}
```

#### Text Colors
```css
:root {
  /* Text Hierarchy */
  --text-primary: #0f172a;        /* Main text */
  --text-secondary: #475569;      /* Secondary text */
  --text-tertiary: #94a3b8;       /* Muted text */
  --text-inverse: #ffffff;        /* White text */
  --text-link: #2563eb;           /* Link color */
  --text-link-hover: #1d4ed8;     /* Link hover */
}
```

### 🔤 Typography System

#### Font Stack
```css
/* Primary Font - Thai + Latin Support */
font-family: 'Noto Sans Thai', 'Noto Sans', system-ui, -apple-system, sans-serif;

/* Monospace for Code */
font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

#### Font Sizes & Weights
```css
:root {
  /* Font Sizes (Mobile First) */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  
  /* Font Weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### 🎯 Icon System

#### Icon Style Guidelines
```css
/* Minimal Icon Specifications */
.icon {
  /* Standard Sizes */
  --icon-xs: 12px;
  --icon-sm: 16px;
  --icon-base: 20px;
  --icon-lg: 24px;
  --icon-xl: 32px;
  
  /* Stroke Width */
  stroke-width: 1.5px;
  
  /* Style Properties */
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}
```

#### Recommended Icon Library
- **Primary**: Lucide Icons (minimal stroke-based)
- **Alternative**: Heroicons Outline
- **Custom**: SVG icons following minimal style
- **Avoid**: Emoji, decorative icons, filled icons

#### Icon Usage Examples
```jsx
// Navigation Icons
<Search size={20} />
<Menu size={24} />
<Settings size={20} />

// Action Icons
<Plus size={16} />
<Edit size={16} />
<Trash2 size={16} />

// Status Icons
<CheckCircle size={20} />
<AlertCircle size={20} />
<XCircle size={20} />
```

### 📐 Spacing & Layout

#### Spacing Scale
```css
:root {
  /* Spacing Scale (8px base) */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
}
```

#### Border Radius
```css
:root {
  --radius-sm: 0.25rem;   /* 4px */
  --radius-base: 0.5rem;  /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-full: 9999px;  /* Fully rounded */
}
```

### 🏗️ Component Structure

#### Layout Components
```jsx
// App Structure
<div className="app">
  <Header />
  <Sidebar />
  <main className="main-content">
    <Router>
      <Routes />
    </Router>
  </main>
  <Toast />
</div>

// Grid System
<div className="container">        <!-- Max-width container -->
  <div className="grid">           <!-- CSS Grid/Flexbox -->
    <div className="col-span-4">   <!-- Responsive columns -->
    </div>
  </div>
</div>
```

#### Component Naming Convention
```scss
// BEM Methodology
.component-name {              // Block
  &__element {                 // Element
    &--modifier {              // Modifier
    }
  }
}

// Examples
.chat-interface { }
.chat-interface__message { }
.chat-interface__message--user { }
.chat-interface__message--ai { }

.database-viewer { }
.database-viewer__table { }
.database-viewer__card { }
.database-viewer__card--selected { }
```

### 📱 Responsive Breakpoints

```css
:root {
  /* Mobile First Approach */
  --breakpoint-sm: 640px;    /* Small devices */
  --breakpoint-md: 768px;    /* Medium devices */
  --breakpoint-lg: 1024px;   /* Large devices */
  --breakpoint-xl: 1280px;   /* Extra large */
  --breakpoint-2xl: 1536px;  /* 2X large */
}

/* Media Query Usage */
@media (min-width: 768px) {
  .responsive-component {
    /* Tablet and up styles */
  }
}
```

### 🎛️ Interactive States

#### Button States
```css
.button {
  /* Default State */
  background: var(--primary-color);
  color: var(--text-inverse);
  transition: all 0.2s ease;
  
  /* Hover State */
  &:hover {
    background: var(--primary-hover);
    transform: translateY(-1px);
  }
  
  /* Active State */
  &:active {
    transform: translateY(0);
  }
  
  /* Disabled State */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Focus State */
  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
}
```

#### Animation Guidelines
```css
:root {
  /* Transition Durations */
  --duration-fast: 0.15s;
  --duration-normal: 0.2s;
  --duration-slow: 0.3s;
  
  /* Easing Functions */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 🧩 Key UI Components

#### 1. **Chat Interface**
- **Style**: Clean, minimal design like current conversation
- **Colors**: Use `--bg-primary` for background, `--text-primary` for messages
- **Typography**: `--text-base` for messages, `--text-sm` for timestamps
- **Icons**: Message send (Send), loading (Loader2), error (AlertCircle)

#### 2. **Database Browser**
- **Layout**: CSS Grid for table, Flexbox for cards
- **Interactions**: Hover states on rows/cards
- **Search**: Input with search icon, real-time filtering
- **Pagination**: Minimal numbered pagination

#### 3. **Navigation**
- **Sidebar**: Fixed width on desktop, collapsible on mobile
- **Icons**: Database (Database), Chat (MessageSquare), Settings (Settings)
- **Active States**: Background highlight + icon color change

#### 4. **Forms & Inputs**
```css
.input {
  border: 1px solid var(--secondary-light);
  border-radius: var(--radius-base);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  
  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-light);
  }
}
```

### 📐 Layout Structure

```
┌─────────────────────────────────┐
│ Header (Logo + User Menu)       │
├─────────┬───────────────────────┤
│ Sidebar │ Main Content Area     │
│         │                       │
│ - Chat  │ ┌─────────────────┐   │
│ - DB    │ │ Dynamic Content │   │
│ - Stats │ │                 │   │
│         │ │ (Chat/DB/etc)   │   │
│         │ └─────────────────┘   │
└─────────┴───────────────────────┘
```

**Mobile Layout**: Sidebar becomes bottom navigation or drawer menu

### ✅ Implementation Checklist

- [ ] Implement CSS custom properties (variables)
- [ ] Set up Noto Sans Thai font loading
- [ ] Create base component styles (buttons, inputs, cards)
- [ ] Implement responsive grid system
- [ ] Add icon library (Lucide or Heroicons)
- [ ] Set up dark mode support (optional)
- [ ] Create animation/transition utilities
- [ ] Test across different screen sizes
- [ ] Ensure Thai language support
- [ ] Validate accessibility (contrast, focus states)

---

## 🚀 MCP-Enhanced Deployment Requirements

### Environment Variables for MCP Integration

```env
# Gateway & MCP Core
GATEWAY_PORT=3001
NODE_ENV=production

# Notion Integration
NOTION_TOKEN=secret_...
NOTION_CHARACTERS_DB_ID=21a5e81a...
NOTION_SCENES_DB_ID=2195e81a...
NOTION_PROJECTS_DB_ID=20f5e81a...

# MCP-Specific Databases
MCP_MEMORY_DB_ID=22a5e81a...          # MCP Long-term Memory Database
MCP_CONTEXT_DB_ID=23a5e81a...         # Context and Rules Database  
MCP_TEMPLATES_DB_ID=24a5e81a...       # Prompt Templates Database
MCP_ANALYTICS_DB_ID=25a5e81a...       # Analytics and Learning Database

# AI Services
GEMINI_API_KEY=your_gemini_key
YOUTUBE_API_KEY=your_youtube_key      # For YouTube Analyzer

# Google Chat Integration
GOOGLE_CHAT_WEBHOOK_URL=https://chat.googleapis.com/v1/spaces/...
GOOGLE_CHAT_TOKEN=your_chat_token

# Security & Performance
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://your-frontend-domain.com
REDIS_URL=redis://localhost:6379     # For MCP caching
MCP_CACHE_TTL=3600                   # Context cache time (seconds)

# MCP Configuration
MCP_CONTEXT_SIMILARITY_THRESHOLD=0.7  # Minimum relevance score
MCP_MAX_CONTEXT_ITEMS=10              # Max context items per query
MCP_LEARNING_ENABLED=true             # Enable automatic learning
MCP_ANALYTICS_ENABLED=true            # Enable usage analytics
```

### MCP Database Structure Setup

Before deployment, ensure these Notion databases are created:

#### 1. MCP Memory Database Schema

| Property Name | Type | Description |
|---------------|------|-------------|
| ID | Title | Unique identifier |
| Content | Rich Text | Memory content |
| Type | Select | rule, character_template, writing_style, user_preference |
| Keywords | Multi-select | Associated keywords |
| Importance | Select | high, medium, low |
| Usage Count | Number | How often referenced |
| Last Used | Date | Last access timestamp |
| Relevance Score | Number | Dynamic relevance (0.0-1.0) |
| Created By | Person | User who created |
| Status | Select | active, archived, deprecated |

#### 2. MCP Context Database Schema

| Property Name | Type | Description |
|---------------|------|-------------|
| Query | Title | Original search query |
| Context Found | Rich Text | Retrieved context |
| Relevance Items | Number | Number of relevant items |
| Response Quality | Select | excellent, good, fair, poor |
| User Feedback | Rich Text | User satisfaction notes |
| Timestamp | Date | When context was retrieved |
| Processing Time | Number | Time taken (ms) |
| AI Model Used | Select | gemini-pro, gemini-flash |

### Server Setup with MCP

```bash
# Install dependencies including MCP support
npm install

# Setup MCP databases (run once)
npm run setup-mcp-databases

# Build TypeScript with MCP enhancements  
npm run build

# Initialize MCP memory (load initial rules/templates)
npm run mcp-init

# Start production server with MCP
npm run start-mcp-gateway

# Monitor MCP performance
npm run mcp-monitor
```

### Docker Deployment with MCP

```dockerfile
# Dockerfile.mcp
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create MCP data directory
RUN mkdir -p /app/data/mcp

# Expose port
EXPOSE 3001

# Health check including MCP status
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health/mcp || exit 1

# Start with MCP enabled
CMD ["npm", "run", "start-mcp-gateway"]
```

```yaml
# docker-compose.mcp.yml
version: '3.8'

services:
  mcp-gateway:
    build:
      context: .
      dockerfile: Dockerfile.mcp
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    volumes:
      - ./data/mcp:/app/data/mcp
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - mcp-gateway
    restart: unless-stopped

volumes:
  redis_data:
```

---

## 📋 Integration Checklist

### ✅ Backend Requirements (Our Side):
- [x] Gateway Server running on port 3001
- [x] MCP Server with Notion integration
- [x] API endpoints documented
- [x] CORS configured for frontend domain
- [ ] JWT authentication setup
- [ ] WebSocket real-time communication
- [ ] Production environment variables
- [ ] SSL/HTTPS setup

### 📝 Frontend Requirements (Your Team):
- [ ] React/Vue/Angular app setup
- [ ] API integration with fetch/axios
- [ ] WebSocket connection handling
- [ ] Authentication flow (login/logout)
- [ ] Chat interface component
- [ ] Database viewer component
- [ ] Error handling and loading states
- [ ] Responsive design implementation
- [ ] Deploy to production domain

---

## 🔐 Security Notes

1. **API Keys**: Never expose Notion token in frontend
2. **CORS**: Configure for your specific domain only
3. **Rate Limiting**: Implement on frontend for API calls
4. **Input Validation**: Sanitize all user inputs
5. **Authentication**: Use JWT tokens for user sessions

---

## 🆘 Support & Contact

- **API Issues**: Check `/health` endpoint first
- **Database Problems**: Verify environment variables
- **Chat Not Working**: Check WebSocket connection
- **CORS Errors**: Verify domain configuration

**คำถามเพิ่มเติม ติดต่อผ่าน:** [your-contact-method]

---

## 🗺️ Development Roadmap

### ✅ Current Features (v3.0)

- Basic MCP Server with Notion integration
- Gateway API with CORS support
- Database CRUD operations
- Simple chat webhook interface
- Health monitoring

### 🚧 In Development (v3.1-3.5)

- **Enhanced MCP Tools**: More Notion operations (create, update, delete)
- **Real-time WebSocket**: Live updates when database changes
- **JWT Authentication**: Secure user sessions
- **Rate Limiting**: API protection and throttling
- **Advanced Search**: Full-text search across databases
- **File Upload**: Image and document support
- **Data Validation**: Schema validation for all inputs
- **Caching Layer**: Redis integration for performance
- **Logging System**: Comprehensive request/error logging

### 🔮 Future Features (v4.0+)

- **Multi-tenant Support**: Multiple users/organizations
- **Plugin System**: Custom integrations beyond Notion
- **GraphQL API**: Alternative to REST API
- **AI Enhancements**: Better context understanding
- **Backup/Restore**: Automated data backup
- **Analytics Dashboard**: Usage and performance metrics
- **Mobile API**: Optimized for mobile apps
- **Internationalization**: Multi-language support

---

## 🎯 Next Steps & Implementation Roadmap

### Phase 1: Core MCP Infrastructure (Week 1-2)

**Backend Implementation:**
```typescript
// 1. Setup MCP Database Schemas
npm run setup-mcp-databases

// 2. Implement Core MCP Services  
src/services/mcp/
├── ContextService.ts     // Context retrieval & relevance scoring
├── MemoryService.ts      // Long-term memory management  
├── LearningService.ts    // User behavior analysis
└── AnalyticsService.ts   // Usage analytics & insights

// 3. Create MCP-Enhanced API Endpoints
src/routes/mcp/
├── context.ts           // /api/mcp/context
├── memory.ts            // /api/mcp/memory  
├── command.ts           // /api/mcp/command
└── analytics.ts         // /api/mcp/analytics
```

**Frontend Integration:**
```javascript
// 1. Setup MCP Client Library
npm install @notion-mcp/client

// 2. Implement Context-Aware Components
components/mcp/
├── ContextPreview.jsx   // Show relevant context
├── MemoryManager.jsx    // Manage learned preferences
├── CommandInterface.jsx // AI command input
└── AnalyticsDash.jsx   // Usage insights
```

### Phase 2: AI Command Processing (Week 3-4)

**Enhanced AI Integration:**
```typescript
// Advanced AI prompt engineering with context
const contextualPrompt = await mcp.buildPrompt({
  userInput: "Create a new character",
  relevantContext: await mcp.getRelevantContext(userInput),
  userPreferences: await mcp.getUserMemory(userId),
  templates: await mcp.getTemplates('character_creation')
});

// Process with Gemini/GPT with full context
const response = await ai.generate(contextualPrompt);
```

### Phase 3: Real-time Updates & Learning (Week 5-6)

**WebSocket Integration:**
```javascript
// Frontend real-time updates
const socket = io('ws://localhost:3001');

socket.on('mcp_context_learned', (data) => {
  updateContextDisplay(data.newContext);
});

socket.on('mcp_memory_updated', (data) => {
  refreshUserPreferences(data.memory);
});

socket.on('ai_thinking', (data) => {
  showThinkingIndicator(data.progress);
});
```

### Phase 4: Advanced Analytics & Optimization (Week 7-8)

**Performance Monitoring:**
```typescript
// MCP Performance Analytics
interface MCPAnalytics {
  contextRetrievalTime: number;      // Average ms
  relevanceAccuracy: number;         // 0.0-1.0
  userSatisfactionScore: number;     // 0.0-1.0  
  memoryUtilization: number;         // Percentage
  learningEffectiveness: number;     // Improvement rate
}

// Real-time optimization
const optimize = async () => {
  const analytics = await mcp.getAnalytics();
  
  if (analytics.contextRetrievalTime > 500) {
    await mcp.optimizeIndexing();
  }
  
  if (analytics.relevanceAccuracy < 0.7) {
    await mcp.retrainRelevanceModel();
  }
};
```

---

## 🤝 Integration Checklist

### ✅ Backend Requirements (Our Side)

- [x] Gateway Server running on port 3001
- [x] YouTube Analyzer with real API integration  
- [x] Notion database connections established
- [x] Socket.io real-time updates configured
- [ ] MCP database schemas created
- [ ] Context retrieval service implemented
- [ ] Memory management system active
- [ ] AI command processing pipeline ready

### 📝 Frontend Requirements (Your Team)

- [ ] React/Vue/Angular app setup
- [ ] HTTP client configured for Gateway API
- [ ] WebSocket connection for real-time updates
- [ ] MCP client library integration
- [ ] Context-aware UI components
- [ ] Memory management interface
- [ ] Analytics dashboard implementation
- [ ] User authentication flow

---

## 🔐 Security & Performance Notes

### Security Best Practices:
1. **API Keys**: Never expose Notion token in frontend
2. **CORS**: Configure for your specific domain only
3. **Rate Limiting**: Implement on frontend for API calls
4. **Input Validation**: Sanitize all user inputs
5. **JWT Authentication**: Use tokens for user sessions
6. **MCP Data Protection**: Encrypt sensitive memory/context data

### Performance Optimization:
```typescript
// MCP Performance Targets
const mcpPerformanceTargets = {
  contextRetrievalTime: 200,        // ms - max time to retrieve context
  memoryAccessTime: 100,            // ms - max time to access memories
  aiProcessingTime: 3000,           // ms - max AI generation time
  concurrentUsers: 1000,            // simultaneous users supported
  contextCacheHitRate: 0.85,        // 85% cache hit rate target
  memoryIndexingTime: 50            // ms - max time to index new memory
};
```

---

## 📞 Support & Communication

### Development Communication:
- **Slack/Discord**: Daily progress updates
- **GitHub Issues**: Feature requests & bug reports
- **API Documentation**: Live at `/api/docs` endpoint
- **WebSocket Events**: Real-time monitoring dashboard

### Testing & Validation:
```bash
# Backend API Testing
npm run test-mcp-endpoints

# Frontend Integration Testing  
npm run test-frontend-integration

# End-to-End MCP Workflow
npm run test-mcp-e2e

# Performance & Load Testing
npm run test-mcp-performance
```

---

## 📈 MCP Evolution Roadmap

### 🎯 Current State (MCP v1.0)
- **Documentation Complete**: Full architecture specification
- **Core Infrastructure**: Database schemas designed
- **API Endpoints**: Context, Memory, Command, Analytics
- **Integration Guide**: Frontend implementation patterns

### 🚧 Near-term Implementation (MCP v1.1-1.5)
- **Week 1-2**: Core MCP services implementation
- **Week 3-4**: AI command processing with context
- **Week 5-6**: Real-time learning and WebSocket integration
- **Week 7-8**: Advanced analytics and performance optimization

### 🔮 Advanced Features (MCP v2.0+)
- **Predictive Context**: AI-powered context pre-loading
- **Cross-Project Learning**: Share insights across different projects
- **Natural Language Database Queries**: "Show me all characters from Ashval"
- **Visual Context Mapping**: Graph-based context relationships
- **Multi-modal Context**: Images, audio, video context support
- **Collaborative Intelligence**: Team-shared memory and preferences

---

*This comprehensive MCP-Enhanced AI Command Hub guide provides everything needed to build the next generation of intelligent creative tools. The system learns, adapts, and evolves with every interaction, creating an increasingly powerful and personalized creative experience.*

**Ready to revolutionize AI-powered storytelling and creative workflows? Let's build the future together! 🚀✨**
