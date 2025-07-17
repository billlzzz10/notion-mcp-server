# 🦄 UnicornX - AI-Powered Notion Assistant

## Quick Start

### 1. Install Dependencies
```bash
cd unicorn-x
npm install
```

### 2. Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
notepad .env  # or use your preferred editor
```

**Required API Keys:**
- `NOTION_TOKEN`: Get from [Notion Integrations](https://www.notion.so/my-integrations)
- `GOOGLE_AI_API_KEY`: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open UnicornX Interface
Navigate to: http://localhost:3000/user-interface.html

## ✨ Features

🤖 **Natural Language Processing**
- พิมพ์คำสั่งเป็นภาษาไทยหรืออังกฤษ
- AI ทำความเข้าใจและดำเนินการอัตโนมัติ

📊 **Intelligent Dashboards**  
- สร้าง dashboard จากข้อมูล Notion
- วิเคราะห์และแสดงผลแบบ real-time
- ส่งออกเป็น charts และ visualizations

🔄 **Real-time Updates**
- WebSocket สำหรับการอัปเดตแบบ real-time
- ติดตามความคืบหน้าการทำงาน
- แจ้งเตือนเมื่อเสร็จสิ้น
- 🔒 **Security First**: Rate limiting, CORS, and Helmet protection
- 📊 **Monitoring**: Built-in health checks and metrics
- 🚀 **TypeScript**: Full type safety and modern development

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 8+
- Google Cloud SDK (optional, for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/unicorn-x.git
cd unicorn-x
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

4. Start development server:
```bash
npm run dev
```

5. Visit `http://localhost:3000` to see UnicornX in action!

## 📚 API Documentation

### Core Endpoints

- `GET /` - Welcome page and platform overview
- `GET /health` - Health check with uptime and status
- `GET /api/status` - Detailed service status
- `GET /api/metrics` - System metrics and performance data

### AI Agent API

- `POST /api/ai/chat` - AI chat and conversation
- `POST /api/ai/generate-code` - AI-powered code generation
- `POST /api/ai/analyze` - Data analysis with AI

### Notion Integration API

- `POST /api/notion/sync` - Sync data with Notion
- `GET /api/notion/characters` - Fetch characters from Notion
- `GET /api/notion/scenes` - Fetch scenes from Notion
- `POST /api/notion/characters` - Create new character

### UnicornX Core API

- `POST /api/unicorn/process` - Process UnicornX requests

## 🛠️ Development

### Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run type-check   # TypeScript type checking
npm run lint         # ESLint code linting
npm run test         # Run tests with Vitest
npm run test:ui      # Run tests with UI
```

### Deployment

#### Local Docker
```bash
docker build -t unicorn-x .
docker run -p 3000:3000 unicorn-x
```

#### Google Cloud Run
```bash
npm run deploy:dev   # Deploy to development
npm run deploy:prod  # Deploy to production
```

## 🏗️ Architecture

```
UnicornX Platform
├── 🎯 Core Services
│   ├── UnicornXService      # Main orchestration
│   ├── AIAgentService       # Google GenAI integration
│   └── NotionIntegrationService # Notion API wrapper
├── 🛣️ API Layer
│   ├── Express Router       # REST API endpoints
│   ├── Socket.IO            # Real-time communication
│   └── Middleware           # Security & logging
├── 🗃️ Data Layer
│   ├── Notion Databases     # External data source
│   ├── Redis Cache          # Optional caching
│   └── PostgreSQL           # Optional primary database
└── ☁️ Infrastructure
    ├── Google Cloud Run     # Container hosting
    ├── Google AI Platform   # AI/ML services
    └── Cloud Monitoring     # Observability
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_AI_API_KEY` | Google AI API key | ✅ |
| `NOTION_TOKEN` | Notion integration token | ✅ |
| `PORT` | Server port (default: 3000) | ❌ |
| `NODE_ENV` | Environment (development/production) | ❌ |
| `ALLOWED_ORIGINS` | CORS allowed origins | ❌ |

### Notion Database Setup

1. Create databases in Notion:
   - Characters Database
   - Scenes Database  
   - Locations Database

2. Get database IDs from URLs
3. Add to environment variables
4. Configure integration permissions

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:ui       # Interactive test UI
npm run test:coverage # Coverage report
```

## 📊 Monitoring

UnicornX includes built-in monitoring:

- Health checks at `/health`
- Metrics at `/api/metrics`
- Request logging with Winston
- Rate limiting protection
- Error tracking and reporting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google AI Platform for GenAI capabilities
- Notion for database integration
- The TypeScript and Node.js communities

---

**🦄 Made with ❤️ by the UnicornX Team**
