# Testing and Validation Patterns

เมื่อทดสอบและตรวจสอบการทำงานของ MCP tools:

## MCP Inspector Usage
```bash
# เริ่ม MCP Inspector สำหรับทดสอบ tools
npm run inspector

# หรือเรียกผ่าน npx
npx @modelcontextprotocol/inspector build/index.js
```

## Manual Testing Patterns
```typescript
// สร้าง test data สำหรับทดสอบ
const testCharacterData = {
  action: "create_character",
  name: "ตัวละครทดสอบ",
  role: "Supporting",
  goal: "เป้าหมายทดสอบ",
  personality: "บุคลิกทดสอบ"
};

// ทดสอบการเรียก tool
const result = await handleCharacterManagement(testCharacterData);
console.log("ผลการทดสอบ:", result);
```

## Environment Validation Testing
```typescript
// ทดสอบการตั้งค่า environment
function testEnvironmentSetup() {
  const requiredVars = [
    'NOTION_TOKEN',
    'NOTION_CHARACTERS_DB_ID',
    'NOTION_SCENES_DB_ID',
    'NOTION_LOCATIONS_DB_ID'
  ];
  
  console.log("🔍 ตรวจสอบ Environment Variables:");
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`  ${varName}: ${value ? '✅ ตั้งค่าแล้ว' : '❌ ยังไม่ตั้งค่า'}`);
  });
}
```

## Schema Validation Testing
```typescript
// ทดสอบ Zod schemas
function testSchemaValidation() {
  const validInput = {
    action: "analyze_timeline",
    chapterRange: { start: 1, end: 10 }
  };
  
  const invalidInput = {
    action: "invalid_action",
    // missing required fields
  };
  
  try {
    timelineAnalyzerSchema.parse(validInput);
    console.log("✅ Valid input test passed");
  } catch (error) {
    console.error("❌ Valid input test failed:", error);
  }
  
  try {
    timelineAnalyzerSchema.parse(invalidInput);
    console.error("❌ Invalid input test should have failed");
  } catch (error) {
    console.log("✅ Invalid input test passed (correctly rejected)");
  }
}
```

## API Response Validation
```typescript
// ตรวจสอบรูปแบบ response
function validateMCPResponse(response: any) {
  const requiredStructure = {
    content: [
      {
        type: "text",
        text: "string"
      }
    ]
  };
  
  if (!response.content || !Array.isArray(response.content)) {
    throw new Error("Response ต้องมี content array");
  }
  
  response.content.forEach((item: any, index: number) => {
    if (!item.type || !item.text) {
      throw new Error(`Content item ${index} ต้องมี type และ text`);
    }
  });
  
  return true;
}
```

## Database Connection Testing
```typescript
// ทดสอบการเชื่อมต่อ Notion
async function testNotionConnection() {
  try {
    const response = await notion.users.me();
    console.log("✅ Notion connection successful:", response.name);
    return true;
  } catch (error) {
    console.error("❌ Notion connection failed:", error);
    return false;
  }
}

// ทดสอบการเข้าถึง database
async function testDatabaseAccess(dbId: string, dbName: string) {
  try {
    const response = await notion.databases.retrieve({
      database_id: dbId
    });
    console.log(`✅ ${dbName} database accessible:`, response.title[0]?.text?.content);
    return true;
  } catch (error) {
    console.error(`❌ ${dbName} database not accessible:`, error);
    return false;
  }
}
```

## Integration Testing
```typescript
// ทดสอบ workflow แบบครบวงจร
async function testFullWorkflow() {
  console.log("🧪 เริ่มทดสอบ Full Workflow...");
  
  // 1. ทดสอบการสร้างตัวละคร
  const characterResult = await handleCharacterManagement({
    action: "create_character",
    name: "ตัวละครทดสอบ",
    role: "Supporting"
  });
  
  // 2. ทดสอบการสร้างฉาก
  const sceneResult = await handleSceneManagement({
    action: "create_scene",
    title: "ฉากทดสอบ",
    chapter: 999,
    summary: "สรุปทดสอบ"
  });
  
  // 3. ทดสอบการวิเคราะห์
  const analysisResult = await handleStoryStructureAnalysis({
    analysisType: "pacing_analysis",
    chapterRange: { start: 1, end: 3 }
  });
  
  console.log("🎉 Full Workflow Test Complete");
  return { characterResult, sceneResult, analysisResult };
}
```

## Performance Testing
```typescript
// ทดสอบประสิทธิภาพ
async function performanceTest() {
  const startTime = Date.now();
  
  // ทดสอบการโหลดข้อมูลจำนวนมาก
  const largeDataTest = await notion.databases.query({
    database_id: process.env.NOTION_SCENES_DB_ID!,
    page_size: 100
  });
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`⏱️ Performance Test: ${duration}ms for ${largeDataTest.results.length} items`);
  
  if (duration > 5000) {
    console.warn("⚠️ Performance warning: Operation took longer than 5 seconds");
  }
}
```