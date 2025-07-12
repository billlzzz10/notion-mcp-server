# Error Handling and Debugging Patterns

เมื่อจัดการ errors และ debugging ใน Notion MCP Server:

## Standard Error Handler Usage
```typescript
import { handleNotionError } from "../utils/error.js";

// ใช้ใน catch blocks ของ MCP tools
try {
  // Notion API operations...
} catch (error) {
  return handleNotionError(error);
}
```

## Validation Error Patterns
```typescript
// Zod validation errors
try {
  const validated = schema.parse(args);
} catch (error) {
  if (error instanceof z.ZodError) {
    return {
      content: [
        {
          type: "text", 
          text: `❌ ข้อมูลไม่ถูกต้อง: ${error.errors.map(e => e.message).join(', ')}`
        }
      ]
    };
  }
  throw error;
}
```

## Environment Variable Validation
```typescript
// Check required environment variables
function validateEnvironment(requiredVars: string[]) {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`❌ ตัวแปรสภาพแวดล้อมที่จำเป็น: ${missing.join(', ')}`);
  }
}

// Usage in tool handlers
const requiredEnvVars = ['NOTION_TOKEN', 'NOTION_CHARACTERS_DB_ID'];
validateEnvironment(requiredEnvVars);
```

## Notion API Error Categories
```typescript
// Handle specific Notion errors
function handleSpecificNotionError(error: any) {
  switch (error.code) {
    case 'object_not_found':
      return `🔍 ไม่พบข้อมูล: ${error.message}`;
    case 'unauthorized':
      return `🔐 ไม่มีสิทธิ์เข้าถึง: ตรวจสอบ Integration Token`;
    case 'validation_error':
      return `⚠️ ข้อมูลไม่ถูกต้อง: ${error.message}`;
    case 'rate_limited':
      return `⏰ เรียก API บ่อยเกินไป กรุณารอสักครู่`;
    default:
      return `❌ ข้อผิดพลาด: ${error.message}`;
  }
}
```

## Debugging Patterns
```typescript
// Add debugging information to responses
function createDebugResponse(data: any, operation: string) {
  return {
    content: [
      {
        type: "text",
        text: `✅ ${operation} สำเร็จ\n\n` +
              `📊 **ข้อมูล:**\n${JSON.stringify(data, null, 2)}\n\n` +
              `⏰ **เวลา:** ${new Date().toISOString()}`
      }
    ]
  };
}
```

## Async Error Handling
```typescript
// Promise.allSettled for batch operations
async function processBatchOperations(operations: Promise<any>[]) {
  const results = await Promise.allSettled(operations);
  
  const successes = results.filter(r => r.status === 'fulfilled');
  const failures = results.filter(r => r.status === 'rejected');
  
  if (failures.length > 0) {
    console.warn(`⚠️ ${failures.length} operations failed:`, failures);
  }
  
  return {
    successful: successes.length,
    failed: failures.length,
    data: successes.map(r => r.value)
  };
}
```