# 🌐 คู่มือการเชื่อมต่อภายนอกสำหรับ Notion MCP Server

## 📋 ภาพรวม

หลังจากที่คุณได้สร้างระบบ MCP Server สำหรับ Ashval world-building แล้ว ตอนนี้มีหลายวิธีในการเชื่อมต่อและใช้งานร่วมกับบริการภายนอก:

## 🔗 ตัวเลือกการเชื่อมต่อ

### 1. 🤖 **AI Chat Platforms**

#### **Claude Desktop (Anthropic)**
- **ข้อดี**: รองรับ MCP protocol โดยตรง, การทำงานแบบ local
- **วิธีตั้งค่า**:
  ```json
  // claude_desktop_config.json
  {
    "mcpServers": {
      "ashval-notion": {
        "command": "node",
        "args": ["z:/02_DEV/notion-mcp-server/build/index.js"],
        "env": {
          "NOTION_TOKEN": "your_token_here"
        }
      }
    }
  }
  ```

#### **ChatGPT/OpenAI API**
- **ข้อดี**: Popular, มี ecosystem กว้าง
- **ต้องสร้าง**: API wrapper เพื่อแปลง MCP calls เป็น OpenAI function calls

#### **Local LLMs (Ollama, LM Studio)**
- **ข้อดี**: ความเป็นส่วนตัว, ไม่เสียค่าใช้จ่าย
- **ต้องสร้าง**: Integration layer สำหรับ function calling

### 2. 🌍 **Web Applications**

#### **Next.js Web App**
```bash
# สร้าง web interface
npx create-next-app@latest ashval-dashboard
cd ashval-dashboard

# ติดตั้ง dependencies
npm install @mcp/client-nodejs notion-client
```

**ตัวอย่าง API route:**
```typescript
// pages/api/ashval/[...action].ts
import { MCPClient } from '@mcp/client-nodejs';

export default async function handler(req, res) {
  const client = new MCPClient({
    serverPath: 'path/to/your/mcp-server'
  });
  
  const result = await client.callTool(req.body.tool, req.body.args);
  res.json(result);
}
```

#### **Streamlit Dashboard (Python)**
```python
# streamlit_app.py
import streamlit as st
import subprocess
import json

def call_mcp_tool(tool_name, args):
    result = subprocess.run([
        'node', 'build/index.js', 
        'call-tool', tool_name, 
        json.dumps(args)
    ], capture_output=True, text=True)
    return json.loads(result.stdout)

st.title("🏛️ Ashval World Dashboard")
tool = st.selectbox("เลือกเครื่องมือ", [
    "ashval_database_analyzer",
    "ashval_data_completion_assistant", 
    "ashval_story_structure_analyzer"
])
```

### 3. 📱 **Mobile Apps**

#### **React Native App**
```bash
npx react-native init AshvalMobile
cd AshvalMobile
npm install @react-native-async-storage/async-storage
```

#### **Flutter App**
```dart
// lib/services/mcp_service.dart
class MCPService {
  static Future<Map<String, dynamic>> callTool(
    String toolName, 
    Map<String, dynamic> args
  ) async {
    final response = await http.post(
      Uri.parse('http://your-server/api/mcp'),
      body: json.encode({
        'tool': toolName,
        'args': args
      })
    );
    return json.decode(response.body);
  }
}
```

### 4. 🔌 **API Gateway & Webhooks**

#### **Express.js API Server**
```typescript
// server.ts
import express from 'express';
import { spawn } from 'child_process';

const app = express();

app.post('/api/ashval/:tool', async (req, res) => {
  const { tool } = req.params;
  const args = req.body;
  
  // เรียก MCP server
  const result = await callMCPTool(tool, args);
  res.json(result);
});

app.listen(3000);
```

#### **Webhook Integration**
```typescript
// webhook-handler.ts
export async function handleNotionWebhook(payload: any) {
  if (payload.type === 'page_updated') {
    // Auto-analyze เมื่อมีการอัพเดตข้อมูล
    await callMCPTool('ashval_database_analyzer', {
      targetDatabase: 'scenes',
      analysisType: 'overview'
    });
  }
}
```

### 5. 🚀 **Cloud Deployment**

#### **Docker Container**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY build/ ./build/
COPY .env ./

EXPOSE 3000
CMD ["node", "build/index.js"]
```

#### **Vercel Deployment**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "build/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/build/index.js"
    }
  ]
}
```

#### **Railway/Heroku**
```json
// package.json
{
  "scripts": {
    "start": "node build/index.js",
    "deploy": "npm run build && git push heroku main"
  }
}
```

## 🎯 **แนะนำสำหรับ Ashval Project**

### เริ่มต้นแบบ Simple
1. **Claude Desktop Integration** - ใช้งานทันที, เหมาะสำหรับการเขียน
2. **Local Web Dashboard** - สร้าง Next.js app สำหรับ visualization
3. **Notion Automation** - ตั้ง webhooks เพื่อ auto-analysis

### ขั้นสูง
1. **Mobile Companion App** - สำหรับจดบันทึกไอเดียขณะเดินทาง
2. **AI Writing Assistant** - Integration กับ OpenAI/Claude API
3. **Public API** - เปิดให้คนอื่นใช้งานเครื่องมือของคุณ

## 🛠️ **ขั้นตอนการ Setup แต่ละประเภท**

### 🏃‍♂️ Quick Start: Claude Desktop

1. **ติดตั้ง Claude Desktop**
2. **แก้ไขไฟล์ config**:
   ```bash
   # Windows
   %APPDATA%/Claude/claude_desktop_config.json
   
   # macOS  
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

3. **เพิ่ม configuration**:
   ```json
   {
     "mcpServers": {
       "ashval": {
         "command": "node",
         "args": ["z:/02_DEV/notion-mcp-server/build/index.js"],
         "env": {
           "NOTION_TOKEN": "secret_xyz...",
           "NOTION_CHARACTERS_DB_ID": "20f5e81a91ff813990f6ece5f2f3d1c6"
         }
       }
     }
   }
   ```

4. **รีสตาร์ท Claude Desktop**

### 🌐 Advanced: Web Dashboard

1. **สร้าง Next.js project**:
   ```bash
   npx create-next-app@latest ashval-dashboard --typescript --tailwind
   cd ashval-dashboard
   npm install axios socket.io-client chart.js
   ```

2. **สร้าง API integration**:
   ```typescript
   // lib/mcp-client.ts
   export class AshvalMCPClient {
     async analyzeDatabase(database: string) {
       const response = await axios.post('/api/mcp', {
         tool: 'ashval_database_analyzer',
         args: { targetDatabase: database }
       });
       return response.data;
     }
     
     async getDataSuggestions(database: string) {
       const response = await axios.post('/api/mcp', {
         tool: 'ashval_data_completion_assistant', 
         args: { targetDatabase: database }
       });
       return response.data;
     }
   }
   ```

3. **สร้าง Dashboard Components**:
   ```tsx
   // components/DatabaseOverview.tsx
   export function DatabaseOverview() {
     const [data, setData] = useState(null);
     
     useEffect(() => {
       const client = new AshvalMCPClient();
       client.analyzeDatabase('characters').then(setData);
     }, []);
     
     return (
       <div className="grid grid-cols-3 gap-4">
         <DatabaseCard title="Characters" data={data?.characters} />
         <DatabaseCard title="Scenes" data={data?.scenes} />
         <DatabaseCard title="Locations" data={data?.locations} />
       </div>
     );
   }
   ```

## 🔐 **Security Considerations**

### Environment Variables
```bash
# .env.production
NOTION_TOKEN=secret_xxx
API_KEY=your_api_key
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT=100  # requests per minute
```

### Authentication
```typescript
// middleware/auth.ts
export function authenticate(req: Request) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !validateToken(token)) {
    throw new Error('Unauthorized');
  }
}
```

## 📊 **Monitoring & Analytics**

### Logging
```typescript
// utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[${new Date().toISOString()}] INFO: ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error);
  }
};
```

### Metrics
```typescript
// utils/metrics.ts
export class MetricsCollector {
  static trackToolUsage(toolName: string, duration: number) {
    // ส่งไปยัง analytics service
  }
  
  static trackError(error: Error, context: any) {
    // ส่งไปยัง error tracking service
  }
}
```

## 🎉 **Next Steps**

1. **เลือกแพลตฟอร์มแรก** ที่ต้องการเชื่อมต่อ
2. **ทดสอบ integration** กับข้อมูลจริง
3. **สร้าง user interface** ที่เหมาะสม
4. **เพิ่ม security** และ monitoring
5. **Deploy to production** เมื่อพร้อม

มีคำถามเรื่องการ integrate แบบไหนที่สนใจเป็นพิเศษไหมครับ? 🚀
