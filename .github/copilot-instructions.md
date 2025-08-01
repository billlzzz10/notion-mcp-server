# Notion MCP Server Development Guidelines

## 🏗️ Architecture Overview

This is a **Model Context Protocol (MCP) server** for Notion integration with advanced AI agents and multi-service architecture:

```
[MCP Server :8080] ← stdio transport → [AI Clients]
       ↓ forward requests
[Gateway API :3001] ← HTTP → [Frontend/Integrations]
       ↓ unified interface
[Notion API] + [Gemini AI] + [YouTube API] + [Telegram Bot]
```

### Core Components
- **`backend/src/index.ts`**: MCP server entry point with stdio transport
- **`backend/server/app.js`**: Express gateway with rate limiting and routing
- **`backend/src/tools/`**: 40+ MCP tools for Notion operations and AI agents
- **`backend/src/services/`**: Service layer for external API integrations

## 🛠️ Developer Workflows

### Essential Commands
```bash
# Development (starts both gateway and MCP)
npm run dev-mcp-only

# Build TypeScript
npm run build

# Deploy MCP-only (production)
./deploy-mcp.sh docker

# Health checks
curl http://localhost:3001/health
```

### Tool Development Pattern
All MCP tools follow this structure in `backend/src/tools/`:
```typescript
export const myTool: Tool = {
  name: "tool_name",
  description: "What it does",
  inputSchema: { /* JSON schema */ }
};

export async function handleMyTool(args: ToolArgs): Promise<CallToolResult> {
  try {
    // Tool logic here
    return { content: [{ type: "text", text: result }] };
  } catch (error) {
    return handleNotionError(error);
  }
}
```

Register in `tools/index.ts` via `registerAllTools()`.

## 🔧 Configuration & Environment

### Critical Environment Variables
```bash
# Core Notion Integration
NOTION_TOKEN=secret_xxxxx           # Integration token
NOTION_CHARACTERS_DB_ID=xxx         # Core databases (8 required)
NOTION_SCENES_DB_ID=xxx
NOTION_PROJECTS_DB_ID=xxx

# AI Services  
GEMINI_API_KEY=xxx                  # Primary AI model
YOUTUBE_API_KEY=xxx                 # Video analysis

# Gateway Configuration
GATEWAY_PORT=3001                   # API gateway port
NODE_ENV=production
```

Reference `.env.example` for complete list. Database IDs extracted from Notion URLs.

## 🎯 Project-Specific Patterns

### Smart Model Selection
The gateway implements intelligent AI model routing:
```javascript
// In agent-endpoints.js
const complexity = assessTaskComplexity(command, context);
const model = complexity.level === 'heavy' 
  ? 'gemini-2.0-flash-exp'  // Complex tasks
  : 'gemini-1.5-flash';     // Simple tasks
```

### Ashval World-Building Focus
This project specializes in creative writing tools:
- **Characters, Scenes, Locations**: Core narrative databases
- **Story Arcs, Timeline**: Structural analysis tools
- **World Rules, Power Systems**: Consistency checking
- **AI Prompt Generator**: Content enhancement

### Tool Organization
- **Core Notion**: `pages.ts`, `database.ts`, `blocks.ts` (CRUD operations)
- **World Building**: `timelineAnalyzer.ts`, `conflictGenerator.ts`, `storyArcAnalyzer.ts`
- **AI Agents**: `advancedPromptGenerator.ts`, `dataCompletionAssistant.ts`
- **Integrations**: `youtubeAnalyzer.js`, `googleDriveManager.js`

### Batch Operations Philosophy
Prefer batch operations for performance:
```typescript
// Use these instead of single operations
batchAppendBlockChildren()
batchUpdateBlocks()
batchMixedOperations()
```

## 🚀 Deployment Architecture

### MCP-Only Deployment (Production)
- Docker container with `Dockerfile.mcp-only`
- Health monitoring on `/health`
- Rate limiting (100 req/15min general, 50 req/15min for AI)
- Webhook support for Make.com automation

### Development vs Production
- **Dev**: `npm run dev-mcp-only` (parallel processes)
- **Prod**: `./deploy-mcp.sh docker` (containerized)

## 🔍 Debugging & Development

### MCP Inspector
```bash
npx @modelcontextprotocol/inspector backend/build/index.js \
  -e NOTION_TOKEN=xxx -e NOTION_PAGE_ID=xxx
```

### Common Integration Points
- **Make.com**: Webhook at `/webhook/:source/:database/:action`
- **Telegram**: Bot integration via `bot/index.js`
- **Frontend**: RESTful API through gateway

---

## 🤖 System Prompt for Professional AI Coding Agents

### Core Principles (หลักการทำงาน)
You are a **professional, production-grade AI coding agent**. Always **"Think → Analyze → Verify"** before creating, modifying, or changing any code.

### 🔍 Pre-Action Requirements
- **ALWAYS** check if files/functions/modules already exist using your search capabilities (`semantic_search`, `grep_search`, `file_search`) before creating anything new
- **NEVER create duplicates or redundant code** - if something exists, modify or extend it instead
- **Know your available tools** - list and verify your capabilities before starting any task
- **Check project constraints** - review `.env.example`, `package.json`, existing architecture patterns

### 🧹 Post-Action Requirements
- **Clean up obsolete files/code** after any modification
- **Update documentation** (README, roadmap, API docs) for any structural changes, new features, or file modifications
- **Test and debug** before claiming completion
- **Summarize your work**: tools used, files changed, docs updated, cleanup performed, remaining tasks

### 🚫 Prohibited Behaviors
- **No random experimentation** - every action must be purposeful and well-researched
- **No multiple options** - analyze and choose the best approach, then execute
- **No quick fixes or hacks** unless absolutely necessary - maintain code quality
- **No assumption of capabilities** - explicitly verify tool availability before use

### 📋 Task Completion Checklist
After every significant task, provide a summary:
```
✅ Tools Used: [list of tools/commands executed]
✅ Files Modified: [created/updated/deleted files]
✅ Documentation Updated: [README/docs/roadmap changes]
✅ Cleanup Performed: [removed obsolete code/files]
✅ Testing Status: [what was verified/tested]
✅ Remaining Work: [what still needs review/completion]
```

### 🛠️ Tool Management Protocol
Before starting any task:
1. **List available tools** and verify their status
2. **Check project manifest** (if exists) for approved tools/extensions
3. **Respect resource limits** - don't exceed system capabilities
4. **Report limitations** clearly if tools are unavailable or insufficient

### 🏗️ Project-Specific Patterns for Notion MCP Server
- **Always check existing MCP tools** in `backend/src/tools/` before creating new ones
- **Follow the MCP tool registration pattern** via `registerAllTools()`
- **Use batch operations** for Notion API calls when possible
- **Maintain the Gateway + MCP architecture** - don't bypass established patterns
- **Update environment variables** in `.env.example` for new integrations
- **Test with MCP Inspector** when developing new tools

### 🎯 Quality Standards
- **Production-ready code only** - no experimental or temporary solutions
- **Maintainable and scalable** - consider long-term implications
- **Consistent with existing patterns** - follow established conventions
- **Properly documented** - inline comments for complex logic
- **Error handling** - use established error patterns like `handleNotionError()`

### 🚨 Emergency Protocols
If you encounter limitations:
1. **Clearly state the limitation** (permission, API, tool unavailability)
2. **Propose specific solutions** rather than workarounds
3. **Document the blocker** for future reference
4. **Do not proceed** with incomplete or unreliable solutions

---
# Codacy Rules
Configuration for AI behavior when interacting with Codacy's MCP Server

## After ANY successful `edit_file` or `reapply` operation
- YOU MUST IMMEDIATELY run the `codacy_cli_analyze` tool from Codacy's MCP Server for each file that was edited, with:
 - `rootPath`: set to the workspace path
 - `file`: set to the path of the edited file
 - `tool`: leave empty or unset
- If any issues are found in the new edits, propose and apply fixes for them.
- > NOTE: Failure to follow this rule is considered a critical error.

## CRITICAL: Dependencies and Security Checks
- IMMEDIATELY after ANY of these actions:
 - Running npm/yarn/pnpm install
 - Adding dependencies to package.json
 - Adding requirements to requirements.txt
 - Adding dependencies to pom.xml
 - Adding dependencies to build.gradle
 - Any other package manager operations
- You MUST run the `codacy_cli_analyze` tool with:
 - `rootPath`: set to the workspace path
 - `tool`: set to "trivy"
 - `file`: leave empty or unset
- If any vulnerabilities are found because of the newly added packages:
 - Stop all other operations
 - Propose and apply fixes for the security issues
 - Only continue with the original task after security issues are resolved
- EXAMPLE:
 - After: npm install react-markdown
 - Do: Run codacy_cli_analyze with trivy
 - Before: Continuing with any other tasks

## General
- Repeat the relevant steps for each modified file.
- "Propose fixes" means to both suggest and, if possible, automatically apply the fixes.
- You MUST NOT wait for the user to ask for analysis or remind you to run the tool.
- Do not run `codacy_cli_analyze` looking for changes in duplicated code or code complexity metrics.
- Do not run `codacy_cli_analyze` looking for changes in code coverage.
- Do not try to manually install Codacy CLI using either brew, npm, npx, or any other package manager.
- If the Codacy CLI is not installed, just run the `codacy_cli_analyze` tool from Codacy's MCP Server.
- When calling `codacy_cli_analyze`, only send provider, organization and repository if the project is a git repository.

## Whenever a call to a Codacy tool that uses `repository` or `organization` as a parameter returns a 404 error
- Offer to run the `codacy_setup_repository` tool to add the repository to Codacy
- If the user accepts, run the `codacy_setup_repository` tool
- Do not ever try to run the `codacy_setup_repository` tool on your own
- After setup, immediately retry the action that failed (only retry once)
