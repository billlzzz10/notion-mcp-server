# MCP Tool Development Pattern for Notion Server

เมื่อสร้าง MCP tool ใหม่สำหรับ Notion MCP Server ให้ปฏิบัติตาม pattern นี้:

## Tool Structure Pattern

```typescript
// 1. Import dependencies
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { notion } from "../services/notion.js";
import { handleNotionError } from "../utils/error.js";

// 2. Create Zod schema with discriminated union
export const toolNameSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("action_name"),
    parameter1: z.string().describe("คำอธิบายภาษาไทย"),
    parameter2: z.number().optional().describe("พารามิเตอร์เสริม")
  }),
  z.object({
    action: z.literal("another_action"),
    // additional parameters...
  })
]);

// 3. Create tool definition
export const toolNameTool: Tool = {
  name: "tool_name",
  description: "คำอธิบายเครื่องมือภาษาไทย - ระบุวัตถุประสงค์และการใช้งาน",
  inputSchema: zodToJsonSchema(toolNameSchema)
};

// 4. Create handler function
export async function handleToolName(args: any) {
  try {
    const validated = toolNameSchema.parse(args);
    
    switch (validated.action) {
      case "action_name":
        return await handleActionName(validated);
      case "another_action":
        return await handleAnotherAction(validated);
      default:
        throw new Error("ไม่รองรับ action นี้");
    }
  } catch (error) {
    return handleNotionError(error);
  }
}

// 5. Individual action handlers
async function handleActionName(args: any) {
  // Notion API calls here
  const response = await notion.databases.query({
    database_id: process.env.NOTION_TARGET_DB_ID,
    // query parameters...
  });
  
  return {
    content: [
      {
        type: "text",
        text: "✅ การดำเนินการสำเร็จ: " + JSON.stringify(response, null, 2)
      }
    ]
  };
}
```

## Critical Patterns:

### Error Handling
- ใช้ `handleNotionError(error)` สำหรับ Notion API errors
- ใช้ Zod schema validation ก่อนประมวลผล
- ส่งผลลัพธ์เป็น `CallToolResult` format

### Environment Variables
- สำหรับ Ashval tools: ใช้ `process.env.NOTION_[DATABASE_NAME]_DB_ID`
- ตรวจสอบ environment variables ก่อนใช้งาน
- เพิ่ม variables ใหม่ใน `.env.example`

### Notion API Property Access
```typescript
// Safe property access pattern
const props = page.properties;
const title = props.Title?.title?.[0]?.text?.content || "";
const select = props.Status?.select?.name || "";
const relation = props["Related Items"]?.relation || [];
const number = props.Count?.number || 0;
const richText = props.Description?.rich_text?.[0]?.text?.content || "";
```

### Tool Registration
```typescript
// In src/tools/index.ts
import { toolNameTool, handleToolName } from "./toolName.js";

// Add to exports
export { toolNameTool, handleToolName };

// Register in server setup
server.tool(toolNameTool, handleToolName);
```