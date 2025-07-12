import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { notion } from "../services/notion.js";

export const databaseAnalyzerTool: Tool = {
  name: "analyze_database_status",
  description: "วิเคราะห์สถานะและความคืบหน้าของข้อมูลในฐานข้อมูล Notion ทั้งหมด",
  inputSchema: {
    type: "object",
    properties: {
      analysisType: {
        type: "string",
        enum: ["overview", "detailed", "progress", "completion", "statistics", "health_check"],
        description: "ประเภทการวิเคราะห์",
        default: "overview"
      },
      includeDatabases: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "characters", "scenes", "locations", "worlds", "power_systems", 
            "arcanas", "missions", "ai_prompts", "version_history", 
            "story_timeline", "story_arcs", "world_rules"
          ]
        },
        description: "ฐานข้อมูลที่ต้องการวิเคราะห์ (หากไม่ระบุจะวิเคราะห์ทั้งหมด)"
      },
      showEmptyFields: {
        type: "boolean",
        description: "แสดงฟิลด์ที่ว่างเปล่า",
        default: false
      },
      exportFormat: {
        type: "string",
        enum: ["text", "table", "summary", "chart"],
        description: "รูปแบบการแสดงผล",
        default: "text"
      },
      generateRecommendations: {
        type: "boolean",
        description: "สร้างคำแนะนำการปรับปรุง",
        default: true
      }
    }
  }
};

interface DatabaseStats {
  name: string;
  displayName: string;
  envVar: string;
  totalRecords: number;
  completedRecords: number;
  emptyFields: { [field: string]: number };
  lastUpdated: string | null;
  completionRate: number;
  criticalFields: string[];
  health: "excellent" | "good" | "fair" | "poor";
}

export async function handleDatabaseAnalysis(args: any) {
  try {
    const databases = getDatabaseConfig(args.includeDatabases);
    const analysisResult = await analyzeDatabases(databases, args);
    
    let formattedResult = "";
    
    switch (args.analysisType) {
      case "overview":
        formattedResult = formatOverview(analysisResult);
        break;
      case "detailed":
        formattedResult = formatDetailed(analysisResult, args.showEmptyFields);
        break;
      case "progress":
        formattedResult = formatProgress(analysisResult);
        break;
      case "completion":
        formattedResult = formatCompletion(analysisResult);
        break;
      case "statistics":
        formattedResult = formatStatistics(analysisResult);
        break;
      case "health_check":
        formattedResult = formatHealthCheck(analysisResult);
        break;
    }

    // เพิ่มคำแนะนำ
    if (args.generateRecommendations) {
      formattedResult += "\n\n" + generateRecommendations(analysisResult);
    }

    // บันทึกผลการวิเคราะห์
    await saveAnalysisReport(formattedResult, args);

    return {
      content: [
        {
          type: "text",
          text: formattedResult
        }
      ]
    };

  } catch (error) {
    throw new Error(`ไม่สามารถวิเคราะห์ฐานข้อมูลได้: ${error}`);
  }
}

function getDatabaseConfig(includeDatabases?: string[]): any[] {
  const allDatabases = [
    {
      name: "characters",
      displayName: "ตัวละคร (Characters)",
      envVar: "NOTION_CHARACTERS_DB_ID",
      criticalFields: ["Name", "Role", "Goal"],
      schema: {
        "Name": "title",
        "Role": "select",
        "Arc Status": "select",
        "Screen Time": "select",
        "Goal": "rich_text",
        "Personality": "rich_text"
      }
    },
    {
      name: "scenes",
      displayName: "ฉาง (Scenes)",
      envVar: "NOTION_SCENES_DB_ID",
      criticalFields: ["Title", "Chapter", "Summary"],
      schema: {
        "Title": "title",
        "Chapter": "number",
        "Order": "number",
        "Summary": "rich_text",
        "Purpose": "rich_text",
        "Conflict": "rich_text",
        "Tone": "select",
        "Emotional Arc": "select",
        "Pacing": "select",
        "Characters in Scene": "relation"
      }
    },
    {
      name: "locations",
      displayName: "สถานที่ (Locations)",
      envVar: "NOTION_LOCATIONS_DB_ID",
      criticalFields: ["Name", "Description"],
      schema: {
        "Name": "title",
        "Description": "rich_text",
        "Type": "select"
      }
    },
    {
      name: "worlds",
      displayName: "โลก (Worlds)",
      envVar: "NOTION_WORLDS_DB_ID",
      criticalFields: ["Name", "Description"],
      schema: {
        "Name": "title",
        "Description": "rich_text"
      }
    },
    {
      name: "power_systems",
      displayName: "ระบบพลัง (Power Systems)",
      envVar: "NOTION_POWER_SYSTEMS_DB_ID",
      criticalFields: ["Name", "Type", "Description"],
      schema: {
        "Name": "title",
        "Type": "select",
        "Description": "rich_text"
      }
    },
    {
      name: "arcanas",
      displayName: "อาร์คานา (Arcanas)",
      envVar: "NOTION_ARCANAS_DB_ID",
      criticalFields: ["Name", "Description"],
      schema: {
        "Name": "title",
        "Description": "rich_text"
      }
    },
    {
      name: "missions",
      displayName: "ภารกิจ (Missions)",
      envVar: "NOTION_MISSIONS_DB_ID",
      criticalFields: ["Name", "Status", "Description"],
      schema: {
        "Name": "title",
        "Status": "select",
        "Description": "rich_text"
      }
    },
    {
      name: "ai_prompts",
      displayName: "AI Prompts",
      envVar: "NOTION_AI_PROMPTS_DB_ID",
      criticalFields: ["Prompt", "Type"],
      schema: {
        "Prompt": "rich_text",
        "Type": "select"
      }
    },
    {
      name: "version_history",
      displayName: "ประวัติการเปลี่ยนแปลง (Version History)",
      envVar: "NOTION_VERSION_HISTORY_DB_ID",
      criticalFields: ["Title", "Entity Type", "Change Type"],
      schema: {
        "Title": "title",
        "Entity Type": "select",
        "Change Type": "select",
        "New Value": "rich_text",
        "Reason": "rich_text",
        "AI Generated": "checkbox"
      }
    },
    {
      name: "story_timeline",
      displayName: "เส้นเวลาเรื่อง (Story Timeline)",
      envVar: "NOTION_STORY_TIMELINE_DB_ID",
      criticalFields: ["Title", "Description"],
      schema: {
        "Title": "title",
        "Description": "rich_text"
      }
    },
    {
      name: "story_arcs",
      displayName: "โครงเรื่อง (Story Arcs)",
      envVar: "NOTION_STORY_ARCS_DB_ID",
      criticalFields: ["Arc Name", "Arc Type", "Theme"],
      schema: {
        "Arc Name": "title",
        "Arc Type": "select",
        "Status": "select",
        "Start Chapter": "number",
        "End Chapter": "number",
        "Theme": "select",
        "Central Conflict": "rich_text"
      }
    },
    {
      name: "world_rules",
      displayName: "กฎของโลก (World Rules)",
      envVar: "NOTION_WORLD_RULES_DB_ID",
      criticalFields: ["Rule", "Description"],
      schema: {
        "Rule": "title",
        "Description": "rich_text"
      }
    }
  ];

  if (includeDatabases && includeDatabases.length > 0) {
    return allDatabases.filter(db => includeDatabases.includes(db.name));
  }

  return allDatabases;
}

async function analyzeDatabases(databases: any[], args: any): Promise<DatabaseStats[]> {
  const results: DatabaseStats[] = [];

  for (const dbConfig of databases) {
    const dbId = process.env[dbConfig.envVar];
    if (!dbId) {
      results.push({
        name: dbConfig.name,
        displayName: dbConfig.displayName,
        envVar: dbConfig.envVar,
        totalRecords: 0,
        completedRecords: 0,
        emptyFields: {},
        lastUpdated: null,
        completionRate: 0,
        criticalFields: dbConfig.criticalFields,
        health: "poor"
      });
      continue;
    }

    try {
      const response = await notion.databases.query({
        database_id: dbId,
        page_size: 100
      });

      const stats = analyzeDatabase(response.results, dbConfig);
      results.push(stats);

    } catch (error) {
      console.error(`Error analyzing ${dbConfig.name}:`, error);
      results.push({
        name: dbConfig.name,
        displayName: dbConfig.displayName,
        envVar: dbConfig.envVar,
        totalRecords: 0,
        completedRecords: 0,
        emptyFields: {},
        lastUpdated: null,
        completionRate: 0,
        criticalFields: dbConfig.criticalFields,
        health: "poor"
      });
    }
  }

  return results;
}

function analyzeDatabase(records: any[], dbConfig: any): DatabaseStats {
  const stats: DatabaseStats = {
    name: dbConfig.name,
    displayName: dbConfig.displayName,
    envVar: dbConfig.envVar,
    totalRecords: records.length,
    completedRecords: 0,
    emptyFields: {},
    lastUpdated: null,
    completionRate: 0,
    criticalFields: dbConfig.criticalFields,
    health: "poor"
  };

  if (records.length === 0) {
    return stats;
  }

  // หาวันที่อัปเดตล่าสุด
  const lastUpdatedRecord = records.reduce((latest, record) => {
    const recordDate = new Date(record.last_edited_time);
    const latestDate = latest ? new Date(latest) : new Date(0);
    return recordDate > latestDate ? record.last_edited_time : latest;
  }, null);

  stats.lastUpdated = lastUpdatedRecord;

  // วิเคราะห์ความสมบูรณ์ของข้อมูล
  const fieldNames = Object.keys(dbConfig.schema);
  
  fieldNames.forEach(fieldName => {
    stats.emptyFields[fieldName] = 0;
  });

  let totalCompletionScore = 0;

  records.forEach(record => {
    let recordCompletionScore = 0;
    const maxFieldScore = fieldNames.length;

    fieldNames.forEach(fieldName => {
      const property = record.properties[fieldName];
      if (!property || isFieldEmpty(property, dbConfig.schema[fieldName])) {
        stats.emptyFields[fieldName]++;
      } else {
        recordCompletionScore++;
      }
    });

    // คำนวณคะแนนความสมบูรณ์ของ record นี้
    const recordCompletion = recordCompletionScore / maxFieldScore;
    totalCompletionScore += recordCompletion;

    // ถือว่า record นี้สมบูรณ์ถ้ามีข้อมูลครบ 80% และมีข้อมูลใน critical fields
    const hasCriticalFields = dbConfig.criticalFields.every((field: string) => {
      const prop = record.properties[field];
      return prop && !isFieldEmpty(prop, dbConfig.schema[field]);
    });

    if (recordCompletion >= 0.8 && hasCriticalFields) {
      stats.completedRecords++;
    }
  });

  // คำนวณอัตราความสมบูรณ์โดยรวม
  stats.completionRate = Math.round((totalCompletionScore / records.length) * 100);

  // ประเมินสุขภาพของฐานข้อมูล
  if (stats.completionRate >= 90) {
    stats.health = "excellent";
  } else if (stats.completionRate >= 75) {
    stats.health = "good";
  } else if (stats.completionRate >= 50) {
    stats.health = "fair";
  } else {
    stats.health = "poor";
  }

  return stats;
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
    case "multi_select":
      return !property.multi_select || property.multi_select.length === 0;
    case "number":
      return property.number === null || property.number === undefined;
    case "checkbox":
      return property.checkbox === null || property.checkbox === undefined;
    case "date":
      return !property.date || !property.date.start;
    case "relation":
      return !property.relation || property.relation.length === 0;
    default:
      return true;
  }
}

function formatOverview(stats: DatabaseStats[]): string {
  let result = "📊 **ภาพรวมสถานะฐานข้อมูล Ashval World**\n\n";

  const totalRecords = stats.reduce((sum, db) => sum + db.totalRecords, 0);
  const totalCompleted = stats.reduce((sum, db) => sum + db.completedRecords, 0);
  const avgCompletion = Math.round(stats.reduce((sum, db) => sum + db.completionRate, 0) / stats.length);

  result += `🎯 **สถิติรวม:**\n`;
  result += `  📁 ฐานข้อมูลทั้งหมด: ${stats.length} ฐาน\n`;
  result += `  📄 เรกคอร์ดทั้งหมด: ${totalRecords} รายการ\n`;
  result += `  ✅ เรกคอร์ดสมบูรณ์: ${totalCompleted} รายการ (${Math.round((totalCompleted/totalRecords)*100)}%)\n`;
  result += `  📈 ความสมบูรณ์เฉลี่ย: ${avgCompletion}%\n\n`;

  result += `📋 **สถานะแต่ละฐานข้อมูล:**\n`;
  
  stats.forEach(db => {
    const healthIcon = getHealthIcon(db.health);
    const progressBar = generateProgressBar(db.completionRate);
    
    result += `\n${healthIcon} **${db.displayName}**\n`;
    result += `  📊 ${progressBar} ${db.completionRate}%\n`;
    result += `  📄 ${db.totalRecords} รายการ (สมบูรณ์ ${db.completedRecords} รายการ)\n`;
    
    if (db.lastUpdated) {
      const lastUpdate = new Date(db.lastUpdated).toLocaleDateString('th-TH');
      result += `  🕒 อัปเดตล่าสุด: ${lastUpdate}\n`;
    } else {
      result += `  🕒 ยังไม่มีข้อมูล\n`;
    }
  });

  return result;
}

function formatDetailed(stats: DatabaseStats[], showEmptyFields: boolean): string {
  let result = "📋 **รายงานสถานะฐานข้อมูลแบบละเอียด**\n\n";

  stats.forEach(db => {
    const healthIcon = getHealthIcon(db.health);
    result += `\n${healthIcon} **${db.displayName}**\n`;
    result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    result += `📊 **สถิติทั่วไป:**\n`;
    result += `  • เรกคอร์ดทั้งหมด: ${db.totalRecords}\n`;
    result += `  • เรกคอร์ดสมบูรณ์: ${db.completedRecords}\n`;
    result += `  • ความสมบูรณ์: ${db.completionRate}%\n`;
    result += `  • สุขภาพ: ${getHealthText(db.health)}\n`;
    
    if (db.lastUpdated) {
      const lastUpdate = new Date(db.lastUpdated).toLocaleDateString('th-TH');
      result += `  • อัปเดตล่าสุด: ${lastUpdate}\n`;
    }

    if (showEmptyFields && Object.keys(db.emptyFields).length > 0) {
      result += `\n🔍 **ฟิลด์ที่ว่างเปล่า:**\n`;
      Object.entries(db.emptyFields).forEach(([field, count]) => {
        const percentage = db.totalRecords > 0 ? Math.round((count / db.totalRecords) * 100) : 0;
        const isCritical = db.criticalFields.includes(field);
        const icon = isCritical ? "🔴" : "🟡";
        result += `  ${icon} ${field}: ${count}/${db.totalRecords} ว่าง (${percentage}%)\n`;
      });
    }

    result += `\n🎯 **ฟิลด์สำคัญ:** ${db.criticalFields.join(", ")}\n`;
  });

  return result;
}

function formatProgress(stats: DatabaseStats[]): string {
  let result = "📈 **ความคืบหน้าของฐานข้อมูล**\n\n";

  const sortedStats = [...stats].sort((a, b) => b.completionRate - a.completionRate);

  result += `🏆 **อันดับความสมบูรณ์:**\n`;
  sortedStats.forEach((db, index) => {
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
    const progressBar = generateProgressBar(db.completionRate);
    
    result += `\n${medal} **${db.displayName}**\n`;
    result += `   ${progressBar} ${db.completionRate}%\n`;
    result += `   📄 ${db.completedRecords}/${db.totalRecords} รายการสมบูรณ์\n`;
  });

  return result;
}

function formatCompletion(stats: DatabaseStats[]): string {
  let result = "✅ **รายงานความสมบูรณ์ของข้อมูล**\n\n";

  const excellentDbs = stats.filter(db => db.health === "excellent");
  const goodDbs = stats.filter(db => db.health === "good");
  const fairDbs = stats.filter(db => db.health === "fair");
  const poorDbs = stats.filter(db => db.health === "poor");

  result += `📊 **สรุปตามระดับสุขภาพ:**\n`;
  result += `  🟢 ดีเยี่ยม (90%+): ${excellentDbs.length} ฐาน\n`;
  result += `  🔵 ดี (75-89%): ${goodDbs.length} ฐาน\n`;
  result += `  🟡 พอใช้ (50-74%): ${fairDbs.length} ฐาน\n`;
  result += `  🔴 ต้องปรับปรุง (<50%): ${poorDbs.length} ฐาน\n\n`;

  if (poorDbs.length > 0) {
    result += `⚠️ **ฐานข้อมูลที่ต้องการความสนใจ:**\n`;
    poorDbs.forEach(db => {
      result += `  🔴 ${db.displayName}: ${db.completionRate}% (${db.totalRecords} รายการ)\n`;
    });
  }

  return result;
}

function formatStatistics(stats: DatabaseStats[]): string {
  let result = "📈 **สถิติและตัวเลขสำคัญ**\n\n";

  const totalRecords = stats.reduce((sum, db) => sum + db.totalRecords, 0);
  const totalCompleted = stats.reduce((sum, db) => sum + db.completedRecords, 0);
  const avgCompletion = stats.reduce((sum, db) => sum + db.completionRate, 0) / stats.length;

  result += `🎯 **สถิติรวม:**\n`;
  result += `  📁 ฐานข้อมูล: ${stats.length}\n`;
  result += `  📄 เรกคอร์ดทั้งหมด: ${totalRecords}\n`;
  result += `  ✅ เรกคอร์ดสมบูรณ์: ${totalCompleted}\n`;
  result += `  📊 อัตราความสมบูรณ์เฉลี่ย: ${avgCompletion.toFixed(1)}%\n\n`;

  result += `📊 **การกระจายข้อมูล:**\n`;
  stats.forEach(db => {
    const percentage = totalRecords > 0 ? ((db.totalRecords / totalRecords) * 100).toFixed(1) : "0";
    result += `  • ${db.displayName}: ${db.totalRecords} รายการ (${percentage}%)\n`;
  });

  const mostActiveDb = stats.reduce((prev, current) => 
    prev.totalRecords > current.totalRecords ? prev : current
  );

  const leastActiveDb = stats.reduce((prev, current) => 
    prev.totalRecords < current.totalRecords ? prev : current
  );

  result += `\n🏆 **สถิติเด่น:**\n`;
  result += `  📈 ฐานข้อมูลที่มีข้อมูลมากที่สุด: ${mostActiveDb.displayName} (${mostActiveDb.totalRecords} รายการ)\n`;
  result += `  📉 ฐานข้อมูลที่มีข้อมูลน้อยที่สุด: ${leastActiveDb.displayName} (${leastActiveDb.totalRecords} รายการ)\n`;

  return result;
}

function formatHealthCheck(stats: DatabaseStats[]): string {
  let result = "🏥 **การตรวจสุขภาพฐานข้อมูล**\n\n";

  const issues: string[] = [];
  const recommendations: string[] = [];

  stats.forEach(db => {
    if (db.totalRecords === 0) {
      issues.push(`❌ ${db.displayName}: ไม่มีข้อมูลเลย`);
      recommendations.push(`📝 เพิ่มข้อมูลเบื้องต้นในฐานข้อมูล ${db.displayName}`);
    } else if (db.health === "poor") {
      issues.push(`🔴 ${db.displayName}: ข้อมูลไม่สมบูรณ์ (${db.completionRate}%)`);
      recommendations.push(`🔧 ปรับปรุงข้อมูลในฟิลด์สำคัญของ ${db.displayName}`);
    } else if (db.health === "fair") {
      issues.push(`🟡 ${db.displayName}: ข้อมูลพอใช้ (${db.completionRate}%)`);
    }

    // ตรวจสอบฟิลด์สำคัญที่ว่าง
    db.criticalFields.forEach(field => {
      const emptyCount = db.emptyFields[field] || 0;
      if (emptyCount > db.totalRecords * 0.3) {
        issues.push(`⚠️ ${db.displayName}: ฟิลด์ "${field}" ว่างเปล่า ${emptyCount}/${db.totalRecords} รายการ`);
      }
    });
  });

  if (issues.length === 0) {
    result += `✅ **สุขภาพดีเยี่ยม!** ฐานข้อมูลทั้งหมดอยู่ในสภาพดี\n`;
  } else {
    result += `🚨 **ปัญหาที่พบ (${issues.length} ปัญหา):**\n`;
    issues.forEach(issue => {
      result += `${issue}\n`;
    });
  }

  if (recommendations.length > 0) {
    result += `\n💡 **คำแนะนำการแก้ไข:**\n`;
    recommendations.forEach(rec => {
      result += `${rec}\n`;
    });
  }

  return result;
}

function generateRecommendations(stats: DatabaseStats[]): string {
  let recommendations = "💡 **คำแนะนำการปรับปรุง:**\n\n";

  const poorDbs = stats.filter(db => db.health === "poor");
  const emptyDbs = stats.filter(db => db.totalRecords === 0);
  const incompleteDbs = stats.filter(db => db.completionRate < 75 && db.totalRecords > 0);

  if (emptyDbs.length > 0) {
    recommendations += `🔴 **เร่งด่วน - ฐานข้อมูลว่างเปล่า:**\n`;
    emptyDbs.forEach(db => {
      recommendations += `  • เริ่มเพิ่มข้อมูลในฐานข้อมูล ${db.displayName}\n`;
    });
    recommendations += `\n`;
  }

  if (poorDbs.length > 0) {
    recommendations += `🟡 **ความสำคัญสูง - ข้อมูลไม่สมบูรณ์:**\n`;
    poorDbs.forEach(db => {
      recommendations += `  • ปรับปรุงฟิลด์สำคัญใน ${db.displayName}: ${db.criticalFields.join(", ")}\n`;
    });
    recommendations += `\n`;
  }

  if (incompleteDbs.length > 0) {
    recommendations += `🔵 **ความสำคัญปานกลาง - เพิ่มความสมบูรณ์:**\n`;
    incompleteDbs.forEach(db => {
      const missingFields = Object.entries(db.emptyFields)
        .filter(([_, count]) => count > db.totalRecords * 0.5)
        .map(([field, _]) => field);
      
      if (missingFields.length > 0) {
        recommendations += `  • เติมข้อมูลในฟิลด์ ${missingFields.join(", ")} ของ ${db.displayName}\n`;
      }
    });
    recommendations += `\n`;
  }

  // คำแนะนำทั่วไป
  recommendations += `✨ **คำแนะนำทั่วไป:**\n`;
  recommendations += `  • ใช้เครื่องมือ AI สำหรับสร้างข้อมูลเบื้องต้น\n`;
  recommendations += `  • ตั้งค่า templates สำหรับฟิลด์ที่ใช้บ่อย\n`;
  recommendations += `  • สร้างข้อมูลตัวอย่างสำหรับฐานข้อมูลใหม่\n`;
  recommendations += `  • ตรวจสอบและอัปเดตข้อมูลเป็นประจำ\n`;

  return recommendations;
}

function getHealthIcon(health: string): string {
  switch (health) {
    case "excellent": return "🟢";
    case "good": return "🔵";
    case "fair": return "🟡";
    case "poor": return "🔴";
    default: return "⚫";
  }
}

function getHealthText(health: string): string {
  switch (health) {
    case "excellent": return "ดีเยี่ยม";
    case "good": return "ดี";
    case "fair": return "พอใช้";
    case "poor": return "ต้องปรับปรุง";
    default: return "ไม่ทราบ";
  }
}

function generateProgressBar(percentage: number, width: number = 10): string {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

async function saveAnalysisReport(analysis: string, args: any): Promise<void> {
  const versionsDb = process.env.NOTION_VERSION_HISTORY_DB_ID;
  if (!versionsDb) return;

  try {
    await notion.pages.create({
      parent: { database_id: versionsDb },
      properties: {
        "Title": {
          title: [
            {
              text: {
                content: `Database Analysis: ${args.analysisType}`
              }
            }
          ]
        },
        "Entity Type": {
          select: {
            name: "Database Analysis"
          }
        },
        "Change Type": {
          select: {
            name: "Analysis"
          }
        },
        "New Value": {
          rich_text: [
            {
              text: {
                content: analysis.substring(0, 2000)
              }
            }
          ]
        },
        "Reason": {
          rich_text: [
            {
              text: {
                content: "Database status and progress analysis report"
              }
            }
          ]
        },
        "AI Generated": {
          checkbox: true
        }
      }
    });
  } catch (error) {
    console.error("ไม่สามารถบันทึกรายงานการวิเคราะห์ฐานข้อมูล:", error);
  }
}
