import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { notion } from "../services/notion.js";

export const smartFilterTool: Tool = {
  name: "create_smart_filter",
  description: "สร้าง View และ Filter อัตโนมัติตามเงื่อนไขที่กำหนด",
  inputSchema: {
    type: "object",
    properties: {
      database: {
        type: "string",
        enum: ["Characters", "Scenes", "Locations", "Story Arcs"],
        description: "ฐานข้อมูลที่ต้องการสร้าง Filter"
      },
      filterType: {
        type: "string",
        enum: ["by_tone", "by_character", "by_location", "by_conflict", "by_arc_status", "by_mood", "by_pacing"],
        description: "ประเภท Filter"
      },
      filterValue: {
        type: "string",
        description: "ค่าที่ต้องการกรอง"
      },
      viewName: {
        type: "string",
        description: "ชื่อ View ที่จะสร้าง"
      },
      sortBy: {
        type: "string",
        enum: ["Chapter", "Order", "Importance", "Timeline Order", "Start Chapter"],
        description: "การเรียงลำดับ",
        default: "Chapter"
      },
      includeRelated: {
        type: "boolean",
        description: "รวมข้อมูลที่เกี่ยวข้องหรือไม่",
        default: true
      }
    },
    required: ["database", "filterType", "filterValue", "viewName"]
  }
};

export async function handleSmartFilter(args: any) {
  try {
    let queryResult = "";

    switch (args.database) {
      case "Characters":
        queryResult = await filterCharacters(args);
        break;
      case "Scenes":
        queryResult = await filterScenes(args);
        break;
      case "Locations":
        queryResult = await filterLocations(args);
        break;
      case "Story Arcs":
        queryResult = await filterStoryArcs(args);
        break;
    }

    return {
      content: [
        {
          type: "text",
          text: `🔍 **Smart Filter Results: ${args.viewName}**\n\n${queryResult}\n\n💡 **การใช้งาน:** คุณสามารถใช้ผลลัพธ์นี้เพื่อสร้าง View ใน Notion หรือวิเคราะห์ข้อมูลเพิ่มเติม`
        }
      ]
    };

  } catch (error) {
    throw new Error(`ไม่สามารถสร้าง Smart Filter ได้: ${error}`);
  }
}

async function filterScenes(args: any) {
  const scenesDb = process.env.NOTION_SCENES_DB_ID;
  if (!scenesDb) throw new Error("ไม่พบ NOTION_SCENES_DB_ID");

  let filter: any = {};

  switch (args.filterType) {
    case "by_tone":
      filter = {
        property: "Tone",
        select: {
          equals: args.filterValue
        }
      };
      break;
    case "by_character":
      filter = {
        property: "Characters in Scene",
        relation: {
          contains: args.filterValue // ต้องใช้ ID จริง
        }
      };
      break;
    case "by_location":
      filter = {
        property: "Location",
        relation: {
          contains: args.filterValue // ต้องใช้ ID จริง
        }
      };
      break;
    case "by_conflict":
      filter = {
        property: "Conflict",
        rich_text: {
          is_not_empty: true
        }
      };
      break;
    case "by_mood":
      filter = {
        property: "Mood Intensity",
        select: {
          equals: args.filterValue
        }
      };
      break;
    case "by_pacing":
      filter = {
        property: "Pacing",
        select: {
          equals: args.filterValue
        }
      };
      break;
  }

  const response = await notion.databases.query({
    database_id: scenesDb,
    filter,
    sorts: [
      {
        property: args.sortBy || "Chapter",
        direction: "ascending"
      }
    ]
  });

  let result = `📊 **ผลลัพธ์การค้นหาฉาก (${response.results.length} รายการ):**\n\n`;

  if (response.results.length === 0) {
    result += "ไม่พบฉากที่ตรงตามเงื่อนไข";
    return result;
  }

  response.results.forEach((scene: any, index) => {
    const properties = scene.properties;
    const title = properties.Title?.title?.[0]?.text?.content || "ไม่มีชื่อ";
    const chapter = properties.Chapter?.number || 0;
    const order = properties.Order?.number || 0;
    const tone = properties.Tone?.select?.name || "ไม่ระบุ";
    const summary = properties.Summary?.rich_text?.[0]?.text?.content || "";
    const conflict = properties.Conflict?.rich_text?.[0]?.text?.content || "";

    result += `**${index + 1}. ${title}** (ตอนที่ ${chapter}.${order})\n`;
    result += `   🎭 Tone: ${tone}\n`;
    if (summary) result += `   📝 สรุป: ${summary.substring(0, 100)}${summary.length > 100 ? "..." : ""}\n`;
    if (conflict) result += `   ⚔️ ความขัดแย้ง: ${conflict.substring(0, 100)}${conflict.length > 100 ? "..." : ""}\n`;
    result += "\n";
  });

  // เพิ่มการวิเคราะห์สถิติ
  const toneStats = new Map();
  response.results.forEach((scene: any) => {
    const tone = scene.properties.Tone?.select?.name || "ไม่ระบุ";
    toneStats.set(tone, (toneStats.get(tone) || 0) + 1);
  });

  result += "📈 **สถิติ Tone:**\n";
  toneStats.forEach((count, tone) => {
    result += `• ${tone}: ${count} ฉาก\n`;
  });

  return result;
}

async function filterCharacters(args: any) {
  const charactersDb = process.env.NOTION_CHARACTERS_DB_ID;
  if (!charactersDb) throw new Error("ไม่พบ NOTION_CHARACTERS_DB_ID");

  let filter: any = {};

  switch (args.filterType) {
    case "by_character":
      filter = {
        property: "Name",
        title: {
          contains: args.filterValue
        }
      };
      break;
    case "by_arc_status":
      filter = {
        property: "Arc Status",
        select: {
          equals: args.filterValue
        }
      };
      break;
  }

  const response = await notion.databases.query({
    database_id: charactersDb,
    filter,
    sorts: [
      {
        property: "Screen Time",
        direction: "descending"
      }
    ]
  });

  let result = `👥 **ผลลัพธ์การค้นหาตัวละคร (${response.results.length} รายการ):**\n\n`;

  if (response.results.length === 0) {
    result += "ไม่พบตัวละครที่ตรงตามเงื่อนไข";
    return result;
  }

  response.results.forEach((character: any, index) => {
    const properties = character.properties;
    const name = properties.Name?.title?.[0]?.text?.content || "ไม่มีชื่อ";
    const nickname = properties.Nickname?.rich_text?.[0]?.text?.content || "";
    const role = properties.Role?.select?.name || "ไม่ระบุ";
    const arcStatus = properties["Arc Status"]?.select?.name || "ไม่ระบุ";
    const screenTime = properties["Screen Time"]?.select?.name || "ไม่ระบุ";
    const goal = properties.Goal?.rich_text?.[0]?.text?.content || "";

    result += `**${index + 1}. ${name}**${nickname ? ` (${nickname})` : ""}\n`;
    result += `   🎭 บทบาท: ${role}\n`;
    result += `   📈 สถานะ Arc: ${arcStatus}\n`;
    result += `   ⏱️ Screen Time: ${screenTime}\n`;
    if (goal) result += `   🎯 เป้าหมาย: ${goal.substring(0, 100)}${goal.length > 100 ? "..." : ""}\n`;
    result += "\n";
  });

  return result;
}

async function filterLocations(args: any) {
  const locationsDb = process.env.NOTION_LOCATIONS_DB_ID;
  if (!locationsDb) throw new Error("ไม่พบ NOTION_LOCATIONS_DB_ID");

  let filter: any = {};

  switch (args.filterType) {
    case "by_location":
      filter = {
        property: "Name",
        title: {
          contains: args.filterValue
        }
      };
      break;
  }

  const response = await notion.databases.query({
    database_id: locationsDb,
    filter,
    sorts: [
      {
        property: "Importance",
        direction: "descending"
      }
    ]
  });

  let result = `🗺️ **ผลลัพธ์การค้นหาสถานที่ (${response.results.length} รายการ):**\n\n`;

  response.results.forEach((location: any, index) => {
    const properties = location.properties;
    const name = properties.Name?.title?.[0]?.text?.content || "ไม่มีชื่อ";
    const type = properties.Type?.select?.name || "ไม่ระบุ";
    const importance = properties.Importance?.number || 0;
    const description = properties.Description?.rich_text?.[0]?.text?.content || "";
    const atmosphere = properties.Atmosphere?.select?.name || "ไม่ระบุ";

    result += `**${index + 1}. ${name}** (${type})\n`;
    result += `   ⭐ ความสำคัญ: ${importance}/10\n`;
    result += `   🌅 บรรยากาศ: ${atmosphere}\n`;
    if (description) result += `   📝 คำอธิบาย: ${description.substring(0, 150)}${description.length > 150 ? "..." : ""}\n`;
    result += "\n";
  });

  return result;
}

async function filterStoryArcs(args: any) {
  const storyArcsDb = process.env.NOTION_STORY_ARCS_DB_ID;
  if (!storyArcsDb) throw new Error("ไม่พบ NOTION_STORY_ARCS_DB_ID");

  let filter: any = {};

  switch (args.filterType) {
    case "by_arc_status":
      filter = {
        property: "Status",
        select: {
          equals: args.filterValue
        }
      };
      break;
  }

  const response = await notion.databases.query({
    database_id: storyArcsDb,
    filter,
    sorts: [
      {
        property: args.sortBy || "Start Chapter",
        direction: "ascending"
      }
    ]
  });

  let result = `📚 **ผลลัพธ์การค้นหา Story Arcs (${response.results.length} รายการ):**\n\n`;

  response.results.forEach((arc: any, index) => {
    const properties = arc.properties;
    const name = properties["Arc Name"]?.title?.[0]?.text?.content || "ไม่มีชื่อ";
    const type = properties["Arc Type"]?.select?.name || "ไม่ระบุ";
    const status = properties.Status?.select?.name || "ไม่ระบุ";
    const startChapter = properties["Start Chapter"]?.number || 0;
    const endChapter = properties["End Chapter"]?.number || 0;
    const theme = properties.Theme?.select?.name || "ไม่ระบุ";

    result += `**${index + 1}. ${name}** (${type})\n`;
    result += `   📊 สถานะ: ${status}\n`;
    result += `   📖 ตอนที่: ${startChapter}${endChapter > 0 ? ` - ${endChapter}` : ""}\n`;
    result += `   🎨 ธีม: ${theme}\n`;
    result += "\n";
  });

  return result;
}
