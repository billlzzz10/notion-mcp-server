# Project Structure and Feature Mapping

This document outlines the core folders and files, grouped by feature, and indicates where each resides in the repository.

## 1. Backend: Notion MCP Server

| Path                                | Description                              |
|-------------------------------------|------------------------------------------|
| backend/src/index.ts                | MCP server entry point                   |
| backend/src/server/                 | MCP configuration and setup              |
| backend/src/tools/                  | AI agent tools (e.g., planner, analyzer) |
| backend/src/services/               | Notion API integration services          |
| backend/src/schema/                 | JSON/TypeScript schemas                  |
| backend/src/config/                 | Configuration files (env, constants)     |
| backend/server/app.js               | Express gateway (entry for HTTP)         |
| backend/server/mcp-gateway/         | Gateway implementations and handlers     |

## 2. Frontend (Legacy)

| Path                                  | Description                                |
|---------------------------------------|--------------------------------------------|
| frontend/legacy/demo.html             | Legacy demo entry page                     |
| frontend/legacy/components/ui/        | Reusable UI components (button, card, etc) |
| frontend/legacy/lib/utils.ts          | Legacy utility functions                   |
| frontend/legacy/pages/                | Legacy route pages                         |
| frontend/legacy/src/                  | Legacy React/TS code (App.tsx, services)   |
| frontend/legacy/styles/               | CSS or style files                         |
| frontend/legacy/next.config.js        | Legacy Next.js config (if used)            |
| frontend/legacy/package.legacy.json   | Legacy dependencies (renamed)              |
| frontend/legacy/tsconfig.legacy.json  | Legacy TypeScript config (renamed)         |

## 3. Frontend (Modern: UnicornXOSW2.1.0)

| Path                                                | Description                                       |
|-----------------------------------------------------|---------------------------------------------------|
| frontend/modern/lz-labs-main/src/index.tsx          | React application entry point                     |
| frontend/modern/lz-labs-main/src/App.tsx            | Main React component                              |
| frontend/modern/lz-labs-main/src/contexts/ProjectContext.tsx | React context for project state           |
| frontend/modern/lz-labs-main/src/components/        | Reusable UI components (buttons, modals, panels)  |
| frontend/modern/lz-labs-main/src/pages/             | Page-level components                            |
| frontend/modern/lz-labs-main/src/services/          | Client API service calls                          |
| frontend/modern/lz-labs-main/src/utils/             | Utility functions                                 |
| frontend/modern/lz-labs-main/public/                | Static assets (favicon, images)                   |
| frontend/modern/package.modern.json                 | Modern dependencies (renamed)                     |
| frontend/modern/tsconfig.modern.json                | Modern TypeScript config (renamed)                |

## 4. Common Utilities

| Path                | Description                                                |
|---------------------|------------------------------------------------------------|
| scripts/            | Automation scripts (data sync, cleanup, migrations)        |
| docs/               | Documentation guides, integration guides, roadmaps         |
| templates/          | Markdown templates for Characters/Scenes                   |
| .devcontainer/      | VS Code Dev Container configuration                        |
| Dockerfile          | Docker build for backend service                           |
| .env.example        | Environment variable template                              |

## 5. Next Steps
- **API Contract**: Define and implement endpoints in `backend/src/services/` for frontend integration.
- **Path Fixes**: Ensure import paths in `frontend/legacy/` and `frontend/modern/` match above structure.
- **Documentation**: Link or update `README.md` to include this structure guide.

---
