import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { notion } from "../services/notion.js";

export const worldRulesQueryTool: Tool = {
  name: "query_world_rules",
  description: "ค้นหาและตรวจสอบกฎของโลก Ashval เพื่อให้ AI สร้างเนื้อหาที่สอดคล้อง",
  inputSchema: {
    type: "object",
    properties: {
      queryType: {
        type: "string",
        enum: ["by_category", "by_keyword", "related_to_scene", "all_rules", "validate_content"],
        description: "ประเภทการค้นหา"
      },
      category: {
        type: "string",
        enum: ["Magic System", "Physics", "Society", "Economics", "Geography", "History"],
        description: "หมวดหมู่กฎ (สำหรับ by_category)"
      },
      keyword: {
        type: "string",
        description: "คำค้น (สำหรับ by_keyword)"
      },
      sceneContent: {
        type: "string",
        description: "เนื้อหาฉากที่ต้องการตรวจสอบ (สำหรับ related_to_scene และ validate_content)"
      },
      priorityLevel: {
        type: "string",
        enum: ["Core", "Important", "Optional", "Flexible"],
        description: "ระดับความสำคัญของกฎ"
      },
      includeExamples: {
        type: "boolean",
        description: "รวมตัวอย่างการใช้งาน",
        default: true
      }
    },
    required: ["queryType"]
  }
};

export async function handleWorldRulesQuery(args: any) {
  const worldRulesDb = process.env.NOTION_WORLD_RULES_DB_ID;
  
  if (!worldRulesDb) {
    throw new Error("ไม่พบ NOTION_WORLD_RULES_DB_ID");
  }

  try {
    let queryResult = "";

    switch (args.queryType) {
      case "by_category":
        queryResult = await queryRulesByCategory(worldRulesDb, args.category, args.priorityLevel);
        break;
      case "by_keyword":
        queryResult = await queryRulesByKeyword(worldRulesDb, args.keyword, args.priorityLevel);
        break;
      case "related_to_scene":
        queryResult = await findRelatedRules(worldRulesDb, args.sceneContent);
        break;
      case "all_rules":
        queryResult = await getAllRules(worldRulesDb, args.priorityLevel);
        break;
      case "validate_content":
        queryResult = await validateContentAgainstRules(worldRulesDb, args.sceneContent);
        break;
    }

    return {
      content: [
        {
          type: "text",
          text: `🌍 **World Rules Query Results:**\n\n${queryResult}`
        }
      ]
    };

  } catch (error) {
    throw new Error(`ไม่สามารถค้นหากฎของโลกได้: ${error}`);
  }
}

async function queryRulesByCategory(worldRulesDb: string, category?: string, priority?: string) {
  let filter: any = {};
  
  if (category && priority) {
    filter = {
      and: [
        {
          property: "Category",
          select: {
            equals: category
          }
        },
        {
          property: "Priority",
          select: {
            equals: priority
          }
        }
      ]
    };
  } else if (category) {
    filter = {
      property: "Category",
      select: {
        equals: category
      }
    };
  } else if (priority) {
    filter = {
      property: "Priority",
      select: {
        equals: priority
      }
    };
  }

  const response = await notion.databases.query({
    database_id: worldRulesDb,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    sorts: [
      {
        property: "Priority",
        direction: "ascending"
      }
    ]
  });

  let result = `📋 **กฎของโลก${category ? ` - หมวด: ${category}` : ""}:**\n\n`;

  if (response.results.length === 0) {
    result += "ไม่พบกฎที่ตรงตามเงื่อนไข";
    return result;
  }

  response.results.forEach((rule: any, index) => {
    const properties = rule.properties;
    const ruleName = properties["Rule Name"]?.title?.[0]?.text?.content || "ไม่มีชื่อ";
    const ruleCategory = properties.Category?.select?.name || "ไม่ระบุ";
    const priority = properties.Priority?.select?.name || "ไม่ระบุ";
    const description = properties.Description?.rich_text?.[0]?.text?.content || "";
    const examples = properties.Examples?.rich_text?.[0]?.text?.content || "";
    const exceptions = properties.Exceptions?.rich_text?.[0]?.text?.content || "";
    const impact = properties["Impact Level"]?.select?.name || "ไม่ระบุ";
    const status = properties.Status?.select?.name || "Active";

    result += `**${index + 1}. ${ruleName}**\n`;
    result += `   📂 หมวด: ${ruleCategory} | ⭐ ระดับ: ${priority} | 🌍 ผลกระทบ: ${impact}\n`;
    result += `   📊 สถานะ: ${status}\n`;
    if (description) result += `   📝 คำอธิบาย: ${description}\n`;
    if (examples) result += `   💡 ตัวอย่าง: ${examples}\n`;
    if (exceptions) result += `   ⚠️ ข้อยกเว้น: ${exceptions}\n`;
    result += "\n";
  });

  return result;
}

async function queryRulesByKeyword(worldRulesDb: string, keyword: string, priority?: string) {
  let filter: any = {
    or: [
      {
        property: "Rule Name",
        title: {
          contains: keyword
        }
      },
      {
        property: "Description", 
        rich_text: {
          contains: keyword
        }
      },
      {
        property: "Examples",
        rich_text: {
          contains: keyword
        }
      }
    ]
  };

  if (priority) {
    filter = {
      and: [
        filter,
        {
          property: "Priority",
          select: {
            equals: priority
          }
        }
      ]
    };
  }

  const response = await notion.databases.query({
    database_id: worldRulesDb,
    filter,
    sorts: [
      {
        property: "Priority",
        direction: "ascending"
      }
    ]
  });

  let result = `🔍 **ผลการค้นหา "${keyword}":**\n\n`;

  if (response.results.length === 0) {
    result += `ไม่พบกฎที่เกี่ยวข้องกับ "${keyword}"`;
    return result;
  }

  response.results.forEach((rule: any, index) => {
    const properties = rule.properties;
    const ruleName = properties["Rule Name"]?.title?.[0]?.text?.content || "ไม่มีชื่อ";
    const category = properties.Category?.select?.name || "ไม่ระบุ";
    const priority = properties.Priority?.select?.name || "ไม่ระบุ";
    const description = properties.Description?.rich_text?.[0]?.text?.content || "";
    
    result += `**${index + 1}. ${ruleName}** (${category} - ${priority})\n`;
    if (description) {
      const highlightedDesc = description.replace(
        new RegExp(keyword, 'gi'), 
        `**${keyword}**`
      );
      result += `   📝 ${highlightedDesc}\n`;
    }
    result += "\n";
  });

  return result;
}

async function findRelatedRules(worldRulesDb: string, sceneContent: string) {
  // วิเคราะห์เนื้อหาฉากเพื่อหากฎที่เกี่ยวข้อง
  const keywords = extractKeywordsFromScene(sceneContent);
  
  let result = `🎬 **กฎที่เกี่ยวข้องกับฉาก:**\n\n`;
  result += `📝 **เนื้อหาฉาก:** ${sceneContent.substring(0, 200)}${sceneContent.length > 200 ? "..." : ""}\n\n`;
  result += `🔑 **คำสำคัญที่พบ:** ${keywords.join(", ")}\n\n`;

  const relatedRules = [];

  for (const keyword of keywords) {
    const rulesForKeyword = await queryRulesByKeyword(worldRulesDb, keyword);
    if (!rulesForKeyword.includes("ไม่พบกฎ")) {
      relatedRules.push(`**สำหรับ "${keyword}":**\n${rulesForKeyword}`);
    }
  }

  if (relatedRules.length === 0) {
    result += "ไม่พบกฎที่เกี่ยวข้องโดยตรง";
  } else {
    result += relatedRules.join("\n---\n");
  }

  return result;
}

async function getAllRules(worldRulesDb: string, priority?: string) {
  let filter: any = {
    property: "Status",
    select: {
      equals: "Active"
    }
  };

  if (priority) {
    filter = {
      and: [
        filter,
        {
          property: "Priority",
          select: {
            equals: priority
          }
        }
      ]
    };
  }

  const response = await notion.databases.query({
    database_id: worldRulesDb,
    filter,
    sorts: [
      {
        property: "Category",
        direction: "ascending"
      },
      {
        property: "Priority",
        direction: "ascending"
      }
    ]
  });

  let result = `📚 **กฎทั้งหมดของโลก Ashval${priority ? ` (${priority})` : ""}:**\n\n`;

  // จัดกลุ่มตามหมวด
  const rulesByCategory = new Map();
  
  response.results.forEach((rule: any) => {
    const category = rule.properties.Category?.select?.name || "ไม่ระบุ";
    if (!rulesByCategory.has(category)) {
      rulesByCategory.set(category, []);
    }
    rulesByCategory.get(category).push(rule);
  });

  rulesByCategory.forEach((rules, category) => {
    result += `## 📂 ${category}\n\n`;
    
    rules.forEach((rule: any, index: number) => {
      const properties = rule.properties;
      const ruleName = properties["Rule Name"]?.title?.[0]?.text?.content || "ไม่มีชื่อ";
      const priority = properties.Priority?.select?.name || "ไม่ระบุ";
      const description = properties.Description?.rich_text?.[0]?.text?.content || "";
      
      result += `**${index + 1}. ${ruleName}** (${priority})\n`;
      if (description) result += `   ${description}\n`;
      result += "\n";
    });
  });

  return result;
}

async function validateContentAgainstRules(worldRulesDb: string, content: string) {
  // ดึงกฎทั้งหมดที่สำคัญ
  const coreRules = await notion.databases.query({
    database_id: worldRulesDb,
    filter: {
      and: [
        {
          property: "Status",
          select: {
            equals: "Active"
          }
        },
        {
          or: [
            {
              property: "Priority",
              select: {
                equals: "Core"
              }
            },
            {
              property: "Priority",
              select: {
                equals: "Important"
              }
            }
          ]
        }
      ]
    }
  });

  let result = `✅ **การตรวจสอบความสอดคล้องกับกฎของโลก:**\n\n`;
  result += `📝 **เนื้อหาที่ตรวจสอบ:** ${content.substring(0, 300)}${content.length > 300 ? "..." : ""}\n\n`;

  const violations: any[] = [];
  const supportingRules: any[] = [];

  coreRules.results.forEach((rule: any) => {
    const properties = rule.properties;
    const ruleName = properties["Rule Name"]?.title?.[0]?.text?.content || "";
    const description = properties.Description?.rich_text?.[0]?.text?.content || "";
    const exceptions = properties.Exceptions?.rich_text?.[0]?.text?.content || "";
    const priority = properties.Priority?.select?.name || "";

    // ตรวจสอบการละเมิดกฎ
    const violation = checkRuleViolation(content, ruleName, description, exceptions);
    if (violation) {
      violations.push({
        rule: ruleName,
        priority,
        violation,
        description
      });
    }

    // ตรวจสอบการสนับสนุนกฎ
    const support = checkRuleSupport(content, ruleName, description);
    if (support) {
      supportingRules.push({
        rule: ruleName,
        priority,
        support
      });
    }
  });

  // แสดงผลการตรวจสอบ
  if (violations.length === 0 && supportingRules.length === 0) {
    result += "ไม่พบการละเมิดกฎหรือการสนับสนุนกฎที่ชัดเจน";
  } else {
    if (violations.length > 0) {
      result += `🚨 **การละเมิดกฎที่พบ (${violations.length} รายการ):**\n`;
      violations.forEach((v, index) => {
        result += `${index + 1}. **${v.rule}** (${v.priority})\n`;
        result += `   ❌ ปัญหา: ${v.violation}\n`;
        result += `   📜 กฎ: ${v.description}\n\n`;
      });
    }

    if (supportingRules.length > 0) {
      result += `✅ **กฎที่ได้รับการสนับสนุน (${supportingRules.length} รายการ):**\n`;
      supportingRules.forEach((s, index) => {
        result += `${index + 1}. **${s.rule}** (${s.priority})\n`;
        result += `   ✅ สนับสนุน: ${s.support}\n\n`;
      });
    }
  }

  return result;
}

function extractKeywordsFromScene(sceneContent: string): string[] {
  const keywords: string[] = [];
  
  // คำสำคัญของโลก Ashval
  const ashvalKeywords = [
    "มานา", "mana", "เอธีเรีย", "อัมบรา", "Arcana", "อาร์คานา",
    "The Fool", "The Hidden", "เหมือง", "หินมานา", 
    "โบสถ์", "นักผจญภัย", "ทหาร", "พลัง", "คำสาป",
    "ป่าเรดวู๊ด", "ทะเลทรายโลซาน", "เมือง", "หมู่บ้าน"
  ];
  
  const lowerContent = sceneContent.toLowerCase();
  
  ashvalKeywords.forEach(keyword => {
    if (lowerContent.includes(keyword.toLowerCase())) {
      keywords.push(keyword);
    }
  });

  return [...new Set(keywords)]; // ลบข้อมูลซ้ำ
}

function checkRuleViolation(content: string, ruleName: string, ruleDescription: string, exceptions: string): string | null {
  const lowerContent = content.toLowerCase();
  const lowerRule = ruleDescription.toLowerCase();
  
  // ตรวจสอบการละเมิดกฎเฉพาะ
  if (ruleName.includes("มานาเสียสมดุล")) {
    if (lowerContent.includes("มานา") && lowerContent.includes("สมดุล")) {
      if (!lowerContent.includes("ผุพัง") && !lowerContent.includes("เสียหาย")) {
        return "การใช้มานาไม่สมดุลแต่ไม่มีผลกระทบการผุพัง";
      }
    }
  }

  if (ruleName.includes("Arcana") && ruleName.includes("คำสาป")) {
    if (lowerContent.includes("arcana") || lowerContent.includes("อาร์คานา")) {
      if (lowerContent.includes("ใช้") && !lowerContent.includes("ภาระ") && !lowerContent.includes("ผลกระทบ")) {
        return "ใช้ Arcana แต่ไม่แสดงภาระหรือผลกระทบ";
      }
    }
  }

  return null;
}

function checkRuleSupport(content: string, ruleName: string, ruleDescription: string): string | null {
  const lowerContent = content.toLowerCase();
  
  // ตรวจสอบการสนับสนุนกฎ
  if (ruleName.includes("มานาเสียสมดุล")) {
    if (lowerContent.includes("มานา") && (lowerContent.includes("ผุพัง") || lowerContent.includes("เสียหาย"))) {
      return "แสดงผลกระทบของการใช้มานาไม่สมดุล";
    }
  }

  if (ruleName.includes("Arcana") && ruleName.includes("คำสาป")) {
    if ((lowerContent.includes("arcana") || lowerContent.includes("อาร์คานา")) && 
        (lowerContent.includes("ภาระ") || lowerContent.includes("ผลกระทบ") || lowerContent.includes("คำสาป"))) {
      return "แสดงภาระหรือผลกระทบของการใช้ Arcana";
    }
  }

  return null;
}
