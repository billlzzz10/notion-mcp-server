# Notion MCP Server Development Guidelines
---

## 📝 ตัวอย่างการสร้างฐานข้อมูลใน Notion ทีละขั้นตอน (ภาษาไทย)

### 1. วิธีสร้างฐานข้อมูลใหม่ใน Notion

1. เปิด Notion และไปยังหน้าที่ต้องการสร้างฐานข้อมูล
2. กดปุ่ม "+" หรือพิมพ์ "/database" แล้วเลือก "Table - Full page" หรือ "Table - Inline"
3. ตั้งชื่อฐานข้อมูล เช่น "Ashval Characters", "Ashval Scenes", "Ashval Locations"
4. เพิ่ม properties ตามตัวอย่างด้านล่าง

### 2. ตัวอย่าง Properties สำหรับฐานข้อมูลหลัก

#### ฐานข้อมูล Characters
| Property Name         | Type         | Description (คำอธิบาย)           |
|----------------------|--------------|-----------------------------------|
| Name                 | Title        | ชื่อของตัวละคร                   |
| Description          | Text         | รายละเอียด/ประวัติตัวละคร        |
| Race                 | Select       | เผ่าพันธุ์ (Human, Elf, Demon ฯลฯ)|
| Faction              | Multi-select | กลุ่ม/ฝ่ายที่สังกัด               |
| Status               | Select       | สถานะ (Alive, Dead, Missing ฯลฯ) |
| Scenes               | Relation     | เชื่อมโยงกับ Scenes Database      |

#### ฐานข้อมูล Scenes
| Property Name         | Type         | Description (คำอธิบาย)           |
|----------------------|--------------|-----------------------------------|
| Title                | Title        | ชื่อฉาก                           |
| Summary              | Text         | สรุปเนื้อหา/เหตุการณ์            |
| Location             | Relation     | เชื่อมโยงกับ Locations Database   |
| Characters in Scene  | Relation     | เชื่อมโยงกับ Characters Database  |
| Tags                 | Multi-select | ป้ายกำกับ (Action, Drama ฯลฯ)    |

#### ฐานข้อมูล Locations
| Property Name         | Type         | Description (คำอธิบาย)           |
|----------------------|--------------|-----------------------------------|
| Name                 | Title        | ชื่อสถานที่                       |
| Description          | Text         | รายละเอียดสถานที่                 |
| Region               | Select       | ภูมิภาค/โซน                       |
| Scenes               | Relation     | เชื่อมโยงกับ Scenes Database      |

### 3. วิธีสร้าง Property แบบ Relation
1. กด "+" เพื่อเพิ่ม Property ใหม่
2. เลือกประเภทเป็น "Relation"
3. เลือกฐานข้อมูลปลายทางที่ต้องการเชื่อมโยง เช่น Characters ↔ Scenes
4. สามารถตั้งชื่อ property ได้ตามต้องการ เช่น "Characters in Scene"

### 4. วิธีนำ Database ID มาใช้ใน .env
1. เปิดฐานข้อมูลที่สร้างใน Notion
2. ดูที่ URL เช่น `https://www.notion.so/yourworkspace/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...`
3. คัดลอกส่วนที่เป็น Database ID (ชุดตัวอักษรหลัง workspace/)
4. นำไปใส่ในไฟล์ `.env` เช่น
   ```env
   NOTION_CHARACTERS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NOTION_SCENES_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NOTION_LOCATIONS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

## 🏗️ Architecture Overview

This is a **Model Context Protocol (MCP) server** for Notion integration, built with TypeScript and specialized for world-building automation. The project has two distinct architectural layers:

### Core MCP Layer (Standard Notion Operations)
- **Location**: `src/tools/{blocks,pages,database,comments,users}.ts`
- **Pattern**: Unified operation dispatchers using discriminated unions
- **Schema**: Zod-based validation in `src/schema/` with `preprocessJson` for string→object parsing
- **Example**: `notion_pages` tool handles `create_page|archive_page|restore_page|search_pages|update_page_properties`

### Ashval World-Building Layer (Custom Domain Tools)
- **Location**: `src/tools/{versionControl,timelineAnalyzer,conflictGenerator,...}.ts` (10 specialized tools)
- **Purpose**: Creative writing automation for dark fantasy world "Ashval"
- **Integration**: Direct Notion database queries with environment-based configuration

## 🛠️ Development Patterns

### Tool Registration Pattern
```typescript
// All tools registered in src/tools/index.ts using this pattern:
server.tool(
  "tool_name",
  "Description", 
  SCHEMA_OBJECT,
  handlerFunction
);
```

### Schema Design Pattern
- **Discriminated Unions**: All operation schemas use `z.discriminatedUnion("action", [...])` for type safety
- **Preprocessing**: Use `z.preprocess(preprocessJson, schema)` for JSON string handling
- **Environment Integration**: `getRootPageId()` provides dynamic defaults from `.env`

### Error Handling Pattern
```typescript
// Standard pattern in all tools:
try {
  const response = await notion.api.method(params);
  return { content: [{ type: "text", text: "Success message" }] };
} catch (error) {
  return handleNotionError(error);
}
```

## 📁 Key Architectural Decisions

### Dual Configuration Strategy
- **Core Tools**: Use hardcoded schemas and generic Notion operations
- **Ashval Tools**: Use environment variables for database IDs (`NOTION_CHARACTERS_DB_ID`, etc.)
- **Reasoning**: Allows same codebase to serve generic MCP use cases and specialized world-building

### Schema-First Development
- **All operations** defined as Zod schemas before implementation
- **Input validation** happens at schema level, not in handlers
- **Rich descriptions** in schemas serve as built-in documentation for AI agents

### Batch Operations Support  
- Standard CRUD operations + batch variants (`batch_append_block_children`, `batch_update_blocks`)
- Mixed operations schema for complex workflows

## 🔧 Development Workflows

### Building & Testing
```bash
npm run build          # TypeScript compilation + executable permissions
npm run watch          # Development mode with auto-rebuild
npm run inspector      # MCP inspector tool for testing
```

### Environment Setup (Critical)
```bash
# Required for core functionality:
NOTION_TOKEN=secret_xxx
NOTION_PAGE_ID=page_id

# Required for Ashval tools (12 database IDs):
NOTION_CHARACTERS_DB_ID=db_id
NOTION_SCENES_DB_ID=db_id
# ... (see .env.example for complete list)
```

### Adding New Ashval Tools
1. Create handler in `src/tools/newTool.ts` 
2. Export tool schema and handler
3. Register in `src/tools/index.ts` with `ashval_` prefix
4. Add required environment variables to `.env.example`

## 🎯 Domain-Specific Conventions

### Ashval World-Building Context
- **Dark Fantasy Setting**: All content generation should match somber, mystical tone
- **Database Relationships**: Characters↔Scenes↔Locations with complex property types
- **AI Integration**: Tools generate prompts for external AI services (Gemini, Midjourney)
- **Version Control**: Automatic change tracking with `AI Generated` flag for automation

### Notion API Specifics
- **Property Access**: Always use optional chaining: `props.Title?.title?.[0]?.text?.content || ""`
- **Relations**: Handle as arrays: `props["Characters in Scene"]?.relation || []`
- **Type Safety**: Cast Notion responses as `any` due to dynamic property structure

### Content Generation Patterns
- **Context Gathering**: Always fetch related data before generating content
- **Batch Processing**: Use pagination for large datasets
- **Auto-Save**: Generated content automatically saved to appropriate databases

## 🚨 Critical Integration Points

### Codacy Rules (Preserved)
- **After ANY file edit**: Run `codacy_cli_analyze` with file path
- **After dependency changes**: Run `codacy_cli_analyze` with trivy tool
- **Error handling**: Fix security issues before proceeding

### MCP Protocol Compliance
- All tools return `CallToolResult` with `content` array
- Use `text` type for results, `error` type for failures
- Server runs on stdio transport for MCP client integration

## 💡 Optimization Notes

- **Environment Validation**: Fail fast if required tokens/IDs missing
- **Schema Reuse**: Common patterns extracted to shared schemas (`RICH_TEXT_ITEM_REQUEST_SCHEMA`)
- **Performance**: Direct database queries vs. API traversal for complex relationships