import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { notion } from "../services/notion.js";

export const timelineAnalyzerTool: Tool = {
  name: "analyze_timeline",
  description: "วิเคราะห์ Timeline และหาช่องว่างหรือความขัดแย้งในเนื้อเรื่อง",
  inputSchema: {
    type: "object",
    properties: {
      startChapter: {
        type: "number",
        description: "ตอนเริ่มต้นที่ต้องการวิเคราะห์"
      },
      endChapter: {
        type: "number", 
        description: "ตอนสุดท้ายที่ต้องการวิเคราะห์"
      },
      analysisType: {
        type: "string",
        enum: ["gaps", "conflicts", "pacing", "character_development"],
        description: "ประเภทการวิเคราะห์"
      }
    },
    required: ["startChapter", "endChapter", "analysisType"]
  }
};

export async function handleTimelineAnalysis(args: any) {
  const timelineDb = process.env.NOTION_TIMELINE_DB_ID;
  const scenesDb = process.env.NOTION_SCENES_DB_ID;
  
  if (!timelineDb || !scenesDb) {
    throw new Error("ไม่พบ database IDs ที่จำเป็น");
  }

  try {
    // ดึงข้อมูล Timeline ในช่วงที่กำหนด
    const timelineResponse = await notion.databases.query({
      database_id: timelineDb,
      filter: {
        and: [
          {
            property: "Real Chapter",
            number: {
              greater_than_or_equal_to: args.startChapter
            }
          },
          {
            property: "Real Chapter", 
            number: {
              less_than_or_equal_to: args.endChapter
            }
          }
        ]
      },
      sorts: [
        {
          property: "Timeline Order",
          direction: "ascending"
        }
      ]
    });

    // ดึงข้อมูล Scenes ในช่วงเดียวกน
    const scenesResponse = await notion.databases.query({
      database_id: scenesDb,
      filter: {
        and: [
          {
            property: "Chapter",
            number: {
              greater_than_or_equal_to: args.startChapter
            }
          },
          {
            property: "Chapter",
            number: {
              less_than_or_equal_to: args.endChapter
            }
          }
        ]
      },
      sorts: [
        {
          property: "Chapter",
          direction: "ascending"
        },
        {
          property: "Order", 
          direction: "ascending"
        }
      ]
    });

    let analysisResult = "";

    switch (args.analysisType) {
      case "gaps":
        analysisResult = analyzeTimelineGaps(timelineResponse.results, scenesResponse.results);
        break;
      case "conflicts":
        analysisResult = analyzeTimelineConflicts(timelineResponse.results);
        break;
      case "pacing":
        analysisResult = analyzePacing(timelineResponse.results, scenesResponse.results);
        break;
      case "character_development":
        analysisResult = analyzeCharacterDevelopment(timelineResponse.results);
        break;
    }

    return {
      content: [
        {
          type: "text",
          text: `การวิเคราะห์ Timeline (ตอนที่ ${args.startChapter}-${args.endChapter}):\n\n${analysisResult}`
        }
      ]
    };

  } catch (error) {
    throw new Error(`ไม่สามารถวิเคราะห์ Timeline ได้: ${error}`);
  }
}

function analyzeTimelineGaps(timelineEvents: any[], scenes: any[]): string {
  let analysis = "🔍 **การวิเคราะห์ช่องว่างใน Timeline:**\n\n";
  
  // ตรวจสอบลำดับเหตุการณ์
  const orders = timelineEvents.map(event => {
    const orderProp = event.properties["Timeline Order"];
    return orderProp?.number || 0;
  }).sort((a, b) => a - b);

  for (let i = 0; i < orders.length - 1; i++) {
    const gap = orders[i + 1] - orders[i];
    if (gap > 1) {
      analysis += `⚠️ พบช่องว่างระหว่างลำดับ ${orders[i]} และ ${orders[i + 1]} (ขาด ${gap - 1} เหตุการณ์)\n`;
    }
  }

  // ตรวจสอบเหตุการณ์ที่ไม่มีฉากรองรับ
  const eventsWithoutScenes = timelineEvents.filter(event => {
    const relatedScenes = event.properties["Related Scenes"];
    return !relatedScenes?.relation || relatedScenes.relation.length === 0;
  });

  if (eventsWithoutScenes.length > 0) {
    analysis += "\n📝 **เหตุการณ์ที่ไม่มีฉากรองรับ:**\n";
    eventsWithoutScenes.forEach(event => {
      const title = event.properties["Event Name"]?.title?.[0]?.text?.content || "ไม่มีชื่อ";
      analysis += `• ${title}\n`;
    });
  }

  return analysis;
}

function analyzeTimelineConflicts(timelineEvents: any[]): string {
  let analysis = "⚔️ **การวิเคราะห์ความขัดแย้งใน Timeline:**\n\n";
  
  // ตรวจสอบเหตุการณ์ที่เกิดขึ้นพร้อมกัน
  const eventsByChapter = new Map();
  
  timelineEvents.forEach(event => {
    const chapter = event.properties["Real Chapter"]?.number || 0;
    if (!eventsByChapter.has(chapter)) {
      eventsByChapter.set(chapter, []);
    }
    eventsByChapter.get(chapter).push(event);
  });

  eventsByChapter.forEach((events, chapter) => {
    if (events.length > 1) {
      analysis += `📖 **ตอนที่ ${chapter}:**\n`;
      events.forEach((event: any) => {
        const title = event.properties["Event Name"]?.title?.[0]?.text?.content || "ไม่มีชื่อ";
        const impact = event.properties["Impact Level"]?.select?.name || "ไม่ระบุ";
        analysis += `  • ${title} (ระดับผลกระทบ: ${impact})\n`;
      });
      analysis += "\n";
    }
  });

  return analysis;
}

function analyzePacing(timelineEvents: any[], scenes: any[]): string {
  let analysis = "⏱️ **การวิเคราะห์ Pacing:**\n\n";
  
  const eventsByChapter = new Map();
  const scenesByChapter = new Map();

  // จัดกลุ่มเหตุการณ์ตามตอน
  timelineEvents.forEach(event => {
    const chapter = event.properties["Real Chapter"]?.number || 0;
    if (!eventsByChapter.has(chapter)) {
      eventsByChapter.set(chapter, []);
    }
    eventsByChapter.get(chapter).push(event);
  });

  // จัดกลุ่มฉากตามตอน
  scenes.forEach(scene => {
    const chapter = scene.properties["Chapter"]?.number || 0;
    if (!scenesByChapter.has(chapter)) {
      scenesByChapter.set(chapter, 0);
    }
    scenesByChapter.set(chapter, scenesByChapter.get(chapter) + 1);
  });

  // วิเคราะห์ความหนาแน่นของเหตุการณ์
  const allChapters = new Set([...eventsByChapter.keys(), ...scenesByChapter.keys()]);
  
  allChapters.forEach(chapter => {
    const eventCount = eventsByChapter.get(chapter)?.length || 0;
    const sceneCount = scenesByChapter.get(chapter) || 0;
    
    let pacingNote = "";
    if (eventCount > 3 && sceneCount < 2) {
      pacingNote = "⚡ เหตุการณ์หนาแน่นเกินไป อาจต้องเพิ่มฉาก";
    } else if (eventCount === 0 && sceneCount > 0) {
      pacingNote = "🐌 มีฉากแต่ไม่มีเหตุการณ์สำคัญ อาจช้าเกินไป";
    } else if (eventCount > 0 && sceneCount > 0) {
      pacingNote = "✅ สมดุลดี";
    }
    
    analysis += `📖 **ตอนที่ ${chapter}:** ${eventCount} เหตุการณ์, ${sceneCount} ฉาก - ${pacingNote}\n`;
  });

  return analysis;
}

function analyzeCharacterDevelopment(timelineEvents: any[]): string {
  let analysis = "👥 **การวิเคราะห์พัฒนาการตัวละคร:**\n\n";
  
  const characterEvents = new Map();
  
  timelineEvents.forEach(event => {
    const eventType = event.properties["Event Type"]?.select?.name;
    if (eventType === "Character Development") {
      const title = event.properties["Event Name"]?.title?.[0]?.text?.content || "ไม่มีชื่อ";
      const chapter = event.properties["Real Chapter"]?.number || 0;
      const keyChars = event.properties["Key Characters"]?.relation || [];
      
      keyChars.forEach((char: any) => {
        if (!characterEvents.has(char.id)) {
          characterEvents.set(char.id, []);
        }
        characterEvents.get(char.id).push({ title, chapter });
      });
    }
  });

  if (characterEvents.size === 0) {
    analysis += "⚠️ ไม่พบเหตุการณ์พัฒนาตัวละครในช่วงที่วิเคราะห์";
  } else {
    characterEvents.forEach((events, characterId) => {
      analysis += `**ตัวละคร ID ${characterId}:**\n`;
      events.sort((a: any, b: any) => a.chapter - b.chapter);
      events.forEach((event: any) => {
        analysis += `  • ตอนที่ ${event.chapter}: ${event.title}\n`;
      });
      analysis += "\n";
    });
  }

  return analysis;
}
