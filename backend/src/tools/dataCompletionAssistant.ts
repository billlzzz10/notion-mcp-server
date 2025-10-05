import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { notion } from "../services/notion.js";

export const dataCompletionAssistantTool: Tool = {
  name: "assist_data_completion",
  description: "ช่วยเติมข้อมูลที่ขาดหายไปในฐานข้อมูลด้วย AI และสร้างข้อเสนอแนะ",
  inputSchema: {
    type: "object",
    properties: {
      targetDatabase: {
        type: "string",
        enum: [
          "characters", "scenes", "locations", "worlds", "power_systems", 
          "arcanas", "missions", "ai_prompts", "story_timeline", 
          "story_arcs", "world_rules"
        ],
        description: "ฐานข้อมูลที่ต้องการช่วยเติมข้อมูล"
      },
      assistanceType: {
        type: "string",
        enum: ["suggest_missing_data", "generate_templates", "create_sample_data", "fill_specific_field", "bulk_complete"],
        description: "ประเภทการช่วยเหลือ",
        default: "suggest_missing_data"
      },
      specificField: {
        type: "string",
        description: "ฟิลด์เฉพาะที่ต้องการช่วยเติม (สำหรับ fill_specific_field)"
      },
      recordLimit: {
        type: "number",
        description: "จำนวนเรกคอร์ดที่ต้องการประมวลผล",
        default: 10,
        minimum: 1,
        maximum: 50
      },
      generateSamples: {
        type: "boolean",
        description: "สร้างข้อมูลตัวอย่าง",
        default: true
      },
      useAshvalContext: {
        type: "boolean",
        description: "ใช้บริบทของโลก Ashval ในการสร้างข้อมูล",
        default: true
      }
    },
    required: ["targetDatabase"]
  }
};

export async function handleDataCompletionAssistance(args: any) {
  try {
    const dbConfig = getDatabaseConfig(args.targetDatabase);
    if (!dbConfig) {
      throw new Error(`ไม่พบการกำหนดค่าสำหรับฐานข้อมูล: ${args.targetDatabase}`);
    }

    let result = "";

    switch (args.assistanceType) {
      case "suggest_missing_data":
        result = await suggestMissingData(dbConfig, args);
        break;
      case "generate_templates":
        result = await generateTemplates(dbConfig, args);
        break;
      case "create_sample_data":
        result = await createSampleData(dbConfig, args);
        break;
      case "fill_specific_field":
        result = await fillSpecificField(dbConfig, args);
        break;
      case "bulk_complete":
        result = await bulkComplete(dbConfig, args);
        break;
    }

    return {
      content: [
        {
          type: "text",
          text: result
        }
      ]
    };

  } catch (error) {
    throw new Error(`ไม่สามารถช่วยเติมข้อมูลได้: ${error}`);
  }
}

function getDatabaseConfig(dbName: string): any {
  const configs: { [key: string]: any } = {
    characters: {
      name: "characters",
      displayName: "ตัวละคร",
      envVar: "NOTION_CHARACTERS_DB_ID",
      fields: {
        "Name": { type: "title", required: true, examples: ["Kael Shadowmend", "Luna Brightwing", "Thorne Ironheart"] },
        "Role": { type: "select", required: true, options: ["Protagonist", "Antagonist", "Supporting", "Minor"] },
        "Arc Status": { type: "select", required: false, options: ["Not Started", "Developing", "Complete"] },
        "Screen Time": { type: "select", required: false, options: ["Major", "Medium", "Minor"] },
        "Goal": { type: "rich_text", required: true, examples: ["หาความจริงเกี่ยวกับการหายไปของพ่อ", "ปกป้องอาณาจักรจากอันตราย"] },
        "Personality": { type: "rich_text", required: true, examples: ["กล้าหาญแต่ใจร้อน มักตัดสินใจเร็วเกินไป", "เงียบขรึม ชอบคิดวิเคราะห์"] }
      }
    },
    scenes: {
      name: "scenes",
      displayName: "ฉาง",
      envVar: "NOTION_SCENES_DB_ID",
      fields: {
        "Title": { type: "title", required: true, examples: ["การเผชิญหน้าครั้งแรก", "ค้นหาความจริง", "การต่อสู้ครั้งสุดท้าย"] },
        "Chapter": { type: "number", required: true, examples: [1, 2, 3] },
        "Order": { type: "number", required: true, examples: [1, 2, 3] },
        "Summary": { type: "rich_text", required: true, examples: ["Kael ได้พบกับ Luna ครั้งแรกในป่าลึก"] },
        "Purpose": { type: "rich_text", required: false, examples: ["แนะนำตัวละครหลัก", "สร้างความตึงเครียด"] },
        "Conflict": { type: "rich_text", required: false, examples: ["ความไม่ไว้วางใจระหว่างตัวละคร"] },
        "Tone": { type: "select", required: false, options: ["มืดมัว", "น่ากลัว", "หวังใจ", "เศร้า", "สงบ"] },
        "Emotional Arc": { type: "select", required: false, options: ["Rising", "Climax", "Falling", "Resolution"] },
        "Pacing": { type: "select", required: false, options: ["Very Slow", "Slow", "Medium", "Fast", "Very Fast"] }
      }
    },
    locations: {
      name: "locations",
      displayName: "สถานที่",
      envVar: "NOTION_LOCATIONS_DB_ID",
      fields: {
        "Name": { type: "title", required: true, examples: ["ป่าเงาดำ", "นครแสงเงิน", "ปราสาทลอยฟ้า"] },
        "Description": { type: "rich_text", required: true, examples: ["ป่าโบราณที่เต็มไปด้วยมนต์ดำ"] },
        "Type": { type: "select", required: false, options: ["City", "Forest", "Castle", "Dungeon", "Sacred Site"] }
      }
    },
    power_systems: {
      name: "power_systems",
      displayName: "ระบบพลัง",
      envVar: "NOTION_POWER_SYSTEMS_DB_ID",
      fields: {
        "Name": { type: "title", required: true, examples: ["Etheria Magic", "Umbra Arts", "Elemental Control"] },
        "Type": { type: "select", required: true, options: ["Etheria", "Umbra", "Hybrid"] },
        "Description": { type: "rich_text", required: true, examples: ["พลังแห่งแสงและการรักษา"] }
      }
    }
  };

  return configs[dbName] || null;
}

async function suggestMissingData(dbConfig: any, args: any): Promise<string> {
  const dbId = process.env[dbConfig.envVar];
  if (!dbId) {
    return `❌ ไม่พบ ID ฐานข้อมูล ${dbConfig.displayName} ใน environment variables`;
  }

  try {
    const response = await (async function fetchDataSourceQuery(databaseId: string, pageSize: number) {
      const dbResponse = await notion.databases.retrieve({ database_id: databaseId });
      const dataSource = dbResponse.data_sources?.[0];
      if (!dataSource) {
        throw new Error(`No data source found for database ID: ${databaseId}`);
      }
      return await notion.request({
        path: `data_sources/${dataSource.id}/query`,
        method: 'post',
        body: { page_size: pageSize }
      }) as any;
    })(dbId, args.recordLimit);

    let result = `🔍 **การวิเคราะห์ข้อมูลที่ขาดหายไปในฐานข้อมูล ${dbConfig.displayName}**\n\n`;

    if (response.results.length === 0) {
      result += `📝 **ฐานข้อมูลว่างเปล่า!**\n`;
      result += generateSampleDataSuggestions(dbConfig, args);
      return result;
    }

    const missingDataAnalysis = analyzeMissingData(response.results, dbConfig);
    
    result += `📊 **สถิติข้อมูลที่ขาดหายไป:**\n`;
    Object.entries(missingDataAnalysis.fieldStats).forEach(([field, stats]: [string, any]) => {
      const percentage = ((stats.missing / response.results.length) * 100).toFixed(1);
      const icon = stats.missing > 0 ? "🔴" : "✅";
      result += `  ${icon} ${field}: ${stats.missing}/${response.results.length} ขาดหายไป (${percentage}%)\n`;
    });

    result += `\n🎯 **เรกคอร์ดที่ต้องการความสนใจ:**\n`;
    missingDataAnalysis.incompleteRecords.slice(0, 5).forEach((record: any, index: number) => {
      const title = getRecordTitle(record);
      result += `\n${index + 1}. **${title}**\n`;
      record.missingFields.forEach((field: string) => {
        const suggestion = generateFieldSuggestion(field, dbConfig, args.useAshvalContext);
        result += `   • ${field}: ${suggestion}\n`;
      });
    });

    if (args.generateSamples) {
      result += generateCompletionSuggestions(dbConfig, missingDataAnalysis, args);
    }

    return result;

  } catch (error) {
    return `❌ เกิดข้อผิดพลาดในการวิเคราะห์: ${error}`;
  }
}

async function generateTemplates(dbConfig: any, args: any): Promise<string> {
  let result = `📋 **Templates สำหรับฐานข้อมูล ${dbConfig.displayName}**\n\n`;

  result += `🔧 **Template พื้นฐาน:**\n`;
  Object.entries(dbConfig.fields).forEach(([fieldName, fieldConfig]: [string, any]) => {
    result += `\n**${fieldName}** (${fieldConfig.type}):\n`;
    
    if (fieldConfig.required) {
      result += `  ⚠️ *ฟิลด์จำเป็น*\n`;
    }

    if (fieldConfig.options) {
      result += `  📝 ตัวเลือก: ${fieldConfig.options.join(", ")}\n`;
    }

    if (fieldConfig.examples) {
      result += `  💡 ตัวอย่าง: ${fieldConfig.examples.join(", ")}\n`;
    }

    result += generateFieldTemplate(fieldName, fieldConfig, args.useAshvalContext);
  });

  result += `\n\n📝 **คู่มือการเติมข้อมูล:**\n`;
  result += generateCompletionGuide(dbConfig, args.useAshvalContext);

  return result;
}

async function createSampleData(dbConfig: any, args: any): Promise<string> {
  let result = `🎲 **ข้อมูลตัวอย่างสำหรับฐานข้อมูล ${dbConfig.displayName}**\n\n`;

  const sampleCount = Math.min(args.recordLimit, 5);
  
  for (let i = 1; i <= sampleCount; i++) {
    result += `📄 **ตัวอย่างที่ ${i}:**\n`;
    
    Object.entries(dbConfig.fields).forEach(([fieldName, fieldConfig]: [string, any]) => {
      const sampleValue = generateSampleValue(fieldName, fieldConfig, i, args.useAshvalContext);
      result += `  • ${fieldName}: ${sampleValue}\n`;
    });
    
    result += `\n`;
  }

  result += `💡 **วิธีใช้:**\n`;
  result += `1. คัดลอกข้อมูลตัวอย่างที่ต้องการ\n`;
  result += `2. แก้ไขให้เหมาะสมกับเรื่องของคุณ\n`;
  result += `3. เพิ่มรายละเอียดเพิ่มเติมตามต้องการ\n`;

  return result;
}

async function fillSpecificField(dbConfig: any, args: any): Promise<string> {
  if (!args.specificField) {
    return `❌ กรุณาระบุฟิลด์ที่ต้องการเติมข้อมูล`;
  }

  const fieldConfig = dbConfig.fields[args.specificField];
  if (!fieldConfig) {
    return `❌ ไม่พบฟิลด์ "${args.specificField}" ในฐานข้อมูล ${dbConfig.displayName}`;
  }

  const dbId = process.env[dbConfig.envVar];
  if (!dbId) {
    return `❌ ไม่พบ ID ฐานข้อมูล ${dbConfig.displayName}`;
  }

  try {
    const response = await (async function fetchDataSourceQuery(databaseId: string, pageSize: number) {
      const dbResponse = await notion.databases.retrieve({ database_id: databaseId });
      const dataSource = dbResponse.data_sources?.[0];
      if (!dataSource) {
        throw new Error(`No data source found for database ID: ${databaseId}`);
      }
      return await notion.request({
        path: `data_sources/${dataSource.id}/query`,
        method: 'post',
        body: { page_size: pageSize }
      }) as any;
    })(dbId, args.recordLimit);

    let result = `🎯 **การเติมข้อมูลฟิลด์ "${args.specificField}" ในฐานข้อมูล ${dbConfig.displayName}**\n\n`;

    const recordsNeedingField = response.results.filter(record => {
      if ('properties' in record) {
        return isFieldEmpty(record.properties[args.specificField], fieldConfig.type);
      }
      return false;
    });

    if (recordsNeedingField.length === 0) {
      result += `✅ ฟิลด์ "${args.specificField}" มีข้อมูลครบทุกเรกคอร์ดแล้ว\n`;
      return result;
    }

    result += `📊 **สถิติ:** ${recordsNeedingField.length}/${response.results.length} เรกคอร์ดต้องการเติมฟิลด์นี้\n\n`;

    result += `💡 **คำแนะนำการเติมข้อมูล:**\n`;
    recordsNeedingField.slice(0, 10).forEach((record: any, index: number) => {
      const title = getRecordTitle(record);
      const suggestion = generateContextualSuggestion(args.specificField, fieldConfig, record, args.useAshvalContext);
      result += `\n${index + 1}. **${title}**\n`;
      result += `   💭 แนะนำ: ${suggestion}\n`;
    });

    return result;

  } catch (error) {
    return `❌ เกิดข้อผิดพลาด: ${error}`;
  }
}

async function bulkComplete(dbConfig: any, args: any): Promise<string> {
  let result = `🚀 **การเติมข้อมูลแบบ Bulk สำหรับฐานข้อมูล ${dbConfig.displayName}**\n\n`;

  const dbId = process.env[dbConfig.envVar];
  if (!dbId) {
    return `❌ ไม่พบ ID ฐานข้อมูล ${dbConfig.displayName}`;
  }

  try {
    const dbResponse = await notion.databases.retrieve({ database_id: dbId });
    const dataSource = dbResponse.data_sources?.[0];
    if (!dataSource) {
      throw new Error(`No data source found for database ID: ${dbId}`);
    }
    const response = await notion.request({
        path: `data_sources/${dataSource.id}/query`,
        method: 'post',
        body: { page_size: args.recordLimit }
    }) as any;

    if (response.results.length === 0) {
      result += generateSampleDataSuggestions(dbConfig, args);
      return result;
    }

    const analysisResult = analyzeMissingData(response.results, dbConfig);
    
    result += `📊 **วิเคราะห์ข้อมูลที่ขาดหายไป:**\n`;
    result += `  • เรกคอร์ดทั้งหมด: ${response.results.length}\n`;
    result += `  • เรกคอร์ดที่ไม่สมบูรณ์: ${analysisResult.incompleteRecords.length}\n`;
    result += `  • ฟิลด์ที่ขาดบ่อยที่สุด: ${analysisResult.mostMissingField}\n\n`;

    result += `🎯 **แผนการเติมข้อมูลทีละขั้นตอน:**\n\n`;

    // เรียงลำดับฟิลด์ตามความสำคัญ
    const fieldPriority = Object.entries(analysisResult.fieldStats)
      .sort(([,a], [,b]) => (b as any).missing - (a as any).missing)
      .slice(0, 5);

    fieldPriority.forEach(([fieldName, stats]: [string, any], index: number) => {
      if (stats.missing > 0) {
        result += `**ขั้นตอนที่ ${index + 1}: เติมฟิลด์ "${fieldName}"**\n`;
        result += `  📊 ขาดหายไป: ${stats.missing} เรกคอร์ด\n`;
        result += `  💡 วิธีการ: ${generateBulkSuggestion(fieldName, dbConfig.fields[fieldName], args.useAshvalContext)}\n\n`;
      }
    });

    result += `🔧 **เครื่องมือที่แนะนำ:**\n`;
    result += `  • ใช้ AI Prompt Generator สำหรับสร้างข้อมูลอัตโนมัติ\n`;
    result += `  • สร้าง Templates สำหรับฟิลด์ที่ซ้ำกัน\n`;
    result += `  • ใช้ Bulk Edit ใน Notion สำหรับข้อมูลที่คล้ายกัน\n`;

    return result;

  } catch (error) {
    return `❌ เกิดข้อผิดพลาด: ${error}`;
  }
}

function analyzeMissingData(records: any[], dbConfig: any): any {
  const fieldStats: { [field: string]: { missing: number, total: number } } = {};
  const incompleteRecords: any[] = [];

  // เริ่มต้นสถิติ
  Object.keys(dbConfig.fields).forEach(field => {
    fieldStats[field] = { missing: 0, total: records.length };
  });

  records.forEach(record => {
    const missingFields: string[] = [];

    if ('properties' in record) {
      Object.entries(dbConfig.fields).forEach(([fieldName, fieldConfig]: [string, any]) => {
        if (isFieldEmpty(record.properties[fieldName], fieldConfig.type)) {
          fieldStats[fieldName].missing++;
          missingFields.push(fieldName);
        }
      });
    }

    if (missingFields.length > 0) {
      incompleteRecords.push({
        record,
        missingFields,
        missingCount: missingFields.length
      });
    }
  });

  // หาฟิลด์ที่ขาดหายไปมากที่สุด
  const mostMissingField = Object.entries(fieldStats)
    .sort(([,a], [,b]) => b.missing - a.missing)[0]?.[0] || "ไม่มี";

  return {
    fieldStats,
    incompleteRecords: incompleteRecords.sort((a, b) => b.missingCount - a.missingCount),
    mostMissingField
  };
}

function isFieldEmpty(property: any, fieldType: string): boolean {
  if (!property) return true;

  switch (fieldType) {
    case "title":
      return !property.title || property.title.length === 0 || !property.title[0]?.text?.content;
    case "rich_text":
      return !property.rich_text || property.rich_text.length === 0 || !property.rich_text[0]?.text?.content;
    case "select":
      return !property.select || !property.select.name;
    case "number":
      return property.number === null || property.number === undefined;
    default:
      return true;
  }
}

function getRecordTitle(record: any): string {
  // ลองหา title field
  if ('properties' in record) {
    for (const [key, prop] of Object.entries(record.properties)) {
      if ((prop as any).type === "title" && (prop as any).title?.[0]?.text?.content) {
        return (prop as any).title[0].text.content;
      }
    }
  }
  return "ไม่มีชื่อ";
}

function generateFieldSuggestion(fieldName: string, dbConfig: any, useAshvalContext: boolean): string {
  const fieldConfig = dbConfig.fields[fieldName];
  
  if (fieldConfig.examples) {
    return `เช่น "${fieldConfig.examples[0]}"`;
  }

  if (useAshvalContext) {
    return generateAshvalContextSuggestion(fieldName, dbConfig.name);
  }

  return `กรุณาเติมข้อมูล${fieldConfig.required ? " (จำเป็น)" : ""}`;
}

function generateAshvalContextSuggestion(fieldName: string, dbType: string): string {
  const ashvalSuggestions: { [key: string]: { [field: string]: string } } = {
    characters: {
      "Goal": "ค้นหาความจริงเกี่ยวกับ Etheria/Umbra magic",
      "Personality": "ผู้ใช้ Etheria ที่มีใจเมตตา หรือ ผู้ใช้ Umbra ที่ลึกลับ",
      "Role": "นักผจญภัยในโลก Ashval"
    },
    scenes: {
      "Summary": "การเผชิญหน้าระหว่างผู้ใช้ Etheria และ Umbra",
      "Purpose": "แสดงความขัดแย้งระหว่างแสงและเงา",
      "Conflict": "การต่อสู้เพื่อสมดุลของโลก Ashval"
    },
    locations: {
      "Description": "สถานที่ศักดิ์สิทธิ์ที่เต็มไปด้วยพลัง Etheria หรือ Umbra",
      "Type": "Sacred Site ที่เชื่อมต่อกับระบบมายากล"
    }
  };

  return ashvalSuggestions[dbType]?.[fieldName] || "เติมข้อมูลที่เหมาะสมกับโลก Ashval";
}

function generateSampleValue(fieldName: string, fieldConfig: any, index: number, useAshvalContext: boolean): string {
  if (fieldConfig.examples && fieldConfig.examples[index - 1]) {
    return fieldConfig.examples[index - 1];
  }

  if (fieldConfig.options) {
    return fieldConfig.options[0];
  }

  if (fieldConfig.type === "number") {
    return `${index}`;
  }

  if (useAshvalContext) {
    return generateAshvalContextSuggestion(fieldName, "general");
  }

  return `ข้อมูลตัวอย่าง${index}`;
}

function generateFieldTemplate(fieldName: string, fieldConfig: any, useAshvalContext: boolean): string {
  let template = "";

  switch (fieldConfig.type) {
    case "title":
      template = `  📝 รูปแบบ: [ชื่อที่ชัดเจนและจดจำง่าย]\n`;
      break;
    case "rich_text":
      template = `  📝 รูปแบบ: [คำอธิบายละเอียด 2-3 ประโยค]\n`;
      break;
    case "select":
      template = `  📝 รูปแบบ: เลือกจากตัวเลือกที่กำหนด\n`;
      break;
    case "number":
      template = `  📝 รูปแบบ: [ตัวเลข]\n`;
      break;
  }

  if (useAshvalContext) {
    template += `  🌟 เคล็ดลับ Ashval: ${generateAshvalTip(fieldName)}\n`;
  }

  return template;
}

function generateAshvalTip(fieldName: string): string {
  const tips: { [key: string]: string } = {
    "Name": "ใช้ชื่อที่สื่อถึงพลัง Etheria (แสง) หรือ Umbra (เงา)",
    "Goal": "เชื่อมโยงกับการค้นหาสมดุลระหว่างแสงและเงา",
    "Personality": "สะท้อนอิทธิพลของ Etheria/Umbra ในตัวละคร",
    "Summary": "รวมองค์ประกอบของระบบมายากลในฉาง",
    "Description": "อธิบายว่าสถานที่เชื่อมต่อกับโลก Ashval อย่างไร"
  };

  return tips[fieldName] || "เชื่อมโยงกับธีมหลักของโลก Ashval";
}

function generateCompletionGuide(dbConfig: any, useAshvalContext: boolean): string {
  let guide = "";

  guide += `1. **เริ่มจากฟิลด์จำเป็น**: `;
  const requiredFields = Object.entries(dbConfig.fields)
    .filter(([_, config]: [string, any]) => config.required)
    .map(([name, _]) => name);
  guide += requiredFields.join(", ") + "\n";

  guide += `2. **เพิ่มรายละเอียด**: เติมฟิลด์อื่นๆ เพื่อความสมบูรณ์\n`;

  if (useAshvalContext) {
    guide += `3. **ใช้บริบท Ashval**: เชื่อมโยงข้อมูลกับระบบ Etheria/Umbra\n`;
    guide += `4. **ตรวจสอบความสอดคล้อง**: ให้ข้อมูลสอดคล้องกับโลกของ Ashval\n`;
  }

  return guide;
}

function generateContextualSuggestion(fieldName: string, fieldConfig: any, record: any, useAshvalContext: boolean): string {
  const recordTitle = getRecordTitle(record);
  
  if (useAshvalContext) {
    return `เติม${fieldName}ที่เหมาะสมกับ "${recordTitle}" ในบริบทของโลก Ashval`;
  }

  if (fieldConfig.examples) {
    return `ลองใช้รูปแบบเช่น "${fieldConfig.examples[0]}"`;
  }

  return `เติมข้อมูล${fieldName}ที่เหมาะสมกับ "${recordTitle}"`;
}

function generateBulkSuggestion(fieldName: string, fieldConfig: any, useAshvalContext: boolean): string {
  if (fieldConfig.options) {
    return `เลือกจากตัวเลือก: ${fieldConfig.options.join(", ")}`;
  }

  if (useAshvalContext) {
    return `สร้างข้อมูลที่สอดคล้องกับธีม Ashval`;
  }

  return `เติมข้อมูลแบบ batch โดยใช้รูปแบบที่สอดคล้องกัน`;
}

function generateSampleDataSuggestions(dbConfig: any, args: any): string {
  let result = `💡 **ข้อเสนะแนะสำหรับฐานข้อมูลว่าง:**\n\n`;

  result += `📝 **สร้างข้อมูลตัวอย่าง:**\n`;
  result += `1. ใช้เครื่องมือ "create_sample_data" เพื่อสร้างข้อมูลตัวอย่าง\n`;
  result += `2. เริ่มจากเพิ่ม 3-5 เรกคอร์ดพื้นฐาน\n`;
  result += `3. ใช้ AI Prompt Generator สำหรับสร้างเนื้อหา\n\n`;

  if (args.useAshvalContext) {
    result += `🌟 **แนะนำเนื้อหาสำหรับโลก Ashval:**\n`;
    result += generateAshvalStarterContent(dbConfig.name);
  }

  return result;
}

function generateAshvalStarterContent(dbType: string): string {
  const starterContent: { [key: string]: string } = {
    characters: `• สร้างตัวละครหลัก 1 คน (ผู้ใช้ Etheria)
• สร้างตัวร้าย 1 คน (ผู้ใช้ Umbra)  
• สร้างตัวช่วย 2-3 คน
• เพิ่มตัวละครสำคัญในแต่ละฝ่าย`,
    
    scenes: `• สร้างฉากเปิดเรื่อง (แนะนำโลก Ashval)
• สร้างฉากเผชิญหน้าแรก (Etheria vs Umbra)
• สร้างฉากค้นพบความจริง
• สร้างฉากต่อสู้ครั้งสุดท้าย`,
    
    locations: `• สร้างสถานที่ศักดิ์สิทธิ์ Etheria
• สร้างดินแดนมืดของ Umbra
• สร้างเมืองกลางที่เป็นกลาง
• สร้างสถานที่โบราณลึกลับ`
  };

  return starterContent[dbType] || "เริ่มสร้างข้อมูลพื้นฐานสำหรับโลก Ashval";
}

function generateCompletionSuggestions(dbConfig: any, analysisResult: any, args: any): string {
  let suggestions = `\n\n💡 **คำแนะนำการเติมข้อมูล:**\n\n`;

  // หาฟิลด์ที่ขาดบ่อยที่สุด
  const topMissingFields = Object.entries(analysisResult.fieldStats)
    .sort(([,a], [,b]) => (b as any).missing - (a as any).missing)
    .slice(0, 3);

  suggestions += `🎯 **ลำดับความสำคัญ:**\n`;
  topMissingFields.forEach(([field, stats]: [string, any], index: number) => {
    if (stats.missing > 0) {
      suggestions += `${index + 1}. เติมฟิลด์ "${field}" (ขาดหายไป ${stats.missing} เรกคอร์ด)\n`;
    }
  });

  if (args.useAshvalContext) {
    suggestions += `\n🌟 **เคล็ดลับ Ashval:**\n`;
    suggestions += `• ใช้ธีมแสง-เงา ในการสร้างข้อมูล\n`;
    suggestions += `• เชื่อมโยงกับระบบ Etheria/Umbra\n`;
    suggestions += `• รักษาความสอดคล้องของโลก\n`;
  }

  return suggestions;
}
