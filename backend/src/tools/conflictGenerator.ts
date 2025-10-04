import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { notion } from "../services/notion.js";

export const conflictGeneratorTool: Tool = {
  name: "generate_conflicts",
  description: "สร้างความขัดแย้งอัตโนมัติจากความสัมพันธ์ระหว่างตัวละคร",
  inputSchema: {
    type: "object",
    properties: {
      conflictType: {
        type: "string",
        enum: ["character_vs_character", "character_vs_world", "character_vs_self", "ideological", "resource", "romantic"],
        description: "ประเภทความขัดแย้ง"
      },
      intensity: {
        type: "string",
        enum: ["low", "medium", "high", "critical"],
        description: "ระดับความรุนแรง"
      },
      charactersInvolved: {
        type: "array",
        items: { type: "string" },
        description: "รายชื่อตัวละครที่เกี่ยวข้อง"
      },
      settingContext: {
        type: "string",
        description: "บริบทสถานการณ์หรือสถานที่"
      },
      timeframe: {
        type: "string",
        enum: ["immediate", "short_term", "long_term", "arc_spanning"],
        description: "ระยะเวลาที่ความขัดแย้งดำเนินไป"
      }
    },
    required: ["conflictType", "intensity", "charactersInvolved"]
  }
};

export async function handleConflictGeneration(args: any) {
  const charactersDb = process.env.NOTION_CHARACTERS_DB_ID;
  const locationsDb = process.env.NOTION_LOCATIONS_DB_ID;
  
  if (!charactersDb) {
    throw new Error("ไม่พบ NOTION_CHARACTERS_DB_ID");
  }

  try {
    // ดึงข้อมูลตัวละครที่เกี่ยวข้อง
    const characterData = await getCharacterDetails(charactersDb, args.charactersInvolved);
    
    // สร้าง AI Prompt สำหรับ Gemini
    const conflictPrompt = generateConflictPrompt(args, characterData);
    
    // บันทึกลงฐานข้อมูล AI Prompts (ถ้ามี)
    const aiPromptsDb = process.env.NOTION_AI_PROMPTS_DB_ID;
    if (aiPromptsDb) {
      await saveConflictPrompt(aiPromptsDb, conflictPrompt, args);
    }

    return {
      content: [
        {
          type: "text",
          text: `🎭 **ความขัดแย้งที่สร้างขึ้น:**\n\n${conflictPrompt}\n\n💡 **คำแนะนำ:** ใช้ prompt นี้กับ Gemini AI เพื่อพัฒนารายละเอียดเพิ่มเติม`
        }
      ]
    };

  } catch (error) {
    throw new Error(`ไม่สามารถสร้างความขัดแย้งได้: ${error}`);
  }
}

async function getCharacterDetails(charactersDb: string, characterNames: string[]) {
  const characters = [];
  
  // Get data source ID for Characters DB
  const dbResponse = await notion.databases.retrieve({ database_id: charactersDb });
  const dataSource = dbResponse.data_sources?.[0];
  if (!dataSource) {
    throw new Error(`No data source found for Characters DB: ${charactersDb}`);
  }

  for (const name of characterNames) {
    try {
      const response = await notion.request({
        path: `data_sources/${dataSource.id}/query`,
        method: 'post',
        body: {
          filter: {
            property: "Name",
            title: {
              contains: name
            }
          }
        }
      }) as any;

      if (response.results.length > 0) {
        const char = response.results[0] as any;
        const properties = char.properties;
        
        characters.push({
          name: properties.Name?.title?.[0]?.text?.content || name,
          nickname: properties.Nickname?.rich_text?.[0]?.text?.content || "",
          role: properties.Role?.select?.name || "",
          personality: properties.Personality?.rich_text?.[0]?.text?.content || "",
          goal: properties.Goal?.rich_text?.[0]?.text?.content || "",
          background: properties.Background?.rich_text?.[0]?.text?.content || "",
          abilities: properties.Abilities?.rich_text?.[0]?.text?.content || ""
        });
      }
    } catch (error) {
      console.error(`ไม่สามารถดึงข้อมูลตัวละคร ${name}:`, error);
    }
  }
  
  return characters;
}

function generateConflictPrompt(args: any, characters: any[]): string {
  let prompt = `สร้างความขัดแย้งในโลก Ashval ตามข้อมูลต่อไปนี้:\n\n`;
  
  // ข้อมูลพื้นฐาน
  prompt += `**ประเภทความขัดแย้ง:** ${translateConflictType(args.conflictType)}\n`;
  prompt += `**ระดับความรุนแรง:** ${translateIntensity(args.intensity)}\n`;
  prompt += `**ระยะเวลา:** ${translateTimeframe(args.timeframe)}\n\n`;
  
  // ข้อมูลตัวละคร
  prompt += `**ตัวละครที่เกี่ยวข้อง:**\n`;
  characters.forEach((char, index) => {
    prompt += `${index + 1}. **${char.name}** (${char.nickname || char.role})\n`;
    if (char.personality) prompt += `   - บุคลิก: ${char.personality}\n`;
    if (char.goal) prompt += `   - เป้าหมาย: ${char.goal}\n`;
    if (char.abilities) prompt += `   - ความสามารถ: ${char.abilities}\n`;
    prompt += `\n`;
  });
  
  // บริบทสถานการณ์
  if (args.settingContext) {
    prompt += `**บริบท:** ${args.settingContext}\n\n`;
  }
  
  // คำสั่งเฉพาะ
  prompt += `**คำสั่ง:**\n`;
  prompt += `1. สร้างสถานการณ์ความขัดแย้งที่เหมาะสมกับโลก Ashval (Dark Fantasy)\n`;
  prompt += `2. อธิบายสาเหตุของความขัดแย้งที่เกี่ยวกับ:\n`;
  
  switch (args.conflictType) {
    case "character_vs_character":
      prompt += `   - ความแตกต่างในเป้าหมายหรือค่านิยม\n`;
      prompt += `   - การแข่งขันหรือการแย่งชิง\n`;
      break;
    case "character_vs_world":
      prompt += `   - กฎเกณฑ์หรือระบบของโลกที่ขัดแย้งกับตัวละคร\n`;
      prompt += `   - ภัยคุกคามจากสภาพแวดล้อมหรือสังคม\n`;
      break;
    case "character_vs_self":
      prompt += `   - ความขัดแย้งภายในใจ\n`;
      prompt += `   - การต่อสู้กับอดีตหรือความกลัว\n`;
      break;
    case "ideological":
      prompt += `   - ความแตกต่างในอุดมการณ์หรือความเชื่อ\n`;
      prompt += `   - ทัศนคติต่อการใช้พลัง Arcana\n`;
      break;
    case "resource":
      prompt += `   - การแย่งชิงทรัพยากรที่หายาก\n`;
      prompt += `   - การควบคุมดินแดนหรืออำนาจ\n`;
      break;
    case "romantic":
      prompt += `   - ความรักที่ซับซ้อนหรือหลายเหลี่ยม\n`;
      prompt += `   - การเลือกระหว่างความรักและหน้าที่\n`;
      break;
  }
  
  prompt += `3. เสนอ 3 ทางเลือกในการแก้ไขความขัดแย้ง\n`;
  prompt += `4. ระบุผลที่ตามมาจากแต่ละทางเลือก\n`;
  prompt += `5. เชื่อมโยงกับระบบมานาและ Arcana ที่มีอยู่ในโลก\n\n`;
  
  prompt += `**สไตล์การเขียน:** มืดมัว, complex, psychological depth\n`;
  prompt += `**ความยาว:** 300-500 คำ`;
  
  return prompt;
}

async function saveConflictPrompt(aiPromptsDb: string, prompt: string, args: any) {
  try {
    // Get data source ID
    const dbResponse = await notion.databases.retrieve({ database_id: aiPromptsDb });
    const dataSource = dbResponse.data_sources?.[0];
    if (!dataSource) {
      console.error(`No data source found for AI Prompts DB: ${aiPromptsDb}`);
      return;
    }

    await notion.pages.create({
      parent: { data_source_id: dataSource.id },
      properties: {
        "Prompt Type": {
          select: {
            name: "Conflict Generation"
          }
        },
        "Content": {
          rich_text: [
            {
              text: {
                content: prompt
              }
            }
          ]
        },
        "Parameters": {
          rich_text: [
            {
              text: {
                content: `Type: ${args.conflictType}, Intensity: ${args.intensity}, Characters: ${args.charactersInvolved.join(", ")}`
              }
            }
          ]
        }
      }
    });
  } catch (error) {
    console.error("ไม่สามารถบันทึก Conflict Prompt:", error);
  }
}

function translateConflictType(type: string): string {
  const translations = {
    "character_vs_character": "ตัวละคร vs ตัวละคร",
    "character_vs_world": "ตัวละคร vs โลก",
    "character_vs_self": "ตัวละคร vs ตนเอง",
    "ideological": "ความขัดแย้งทางอุดมการณ์",
    "resource": "การแย่งชิงทรัพยากร",
    "romantic": "ความขัดแย้งด้านความรัก"
  };
  return translations[type as keyof typeof translations] || type;
}

function translateIntensity(intensity: string): string {
  const translations = {
    "low": "ต่ำ (ความตึงเครียดเล็กน้อย)",
    "medium": "ปานกลาง (ความขัดแย้งที่เห็นได้ชัด)",
    "high": "สูง (ความขัดแย้งรุนแรง)",
    "critical": "วิกฤต (อาจเปลี่ยนเส้นทางเรื่อง)"
  };
  return translations[intensity as keyof typeof translations] || intensity;
}

function translateTimeframe(timeframe: string): string {
  const translations = {
    "immediate": "ทันที (แก้ไขในฉากเดียว)",
    "short_term": "ระยะสั้น (2-3 ตอน)",
    "long_term": "ระยะยาว (5+ ตอน)",
    "arc_spanning": "ข้ามหลาย Arc"
  };
  return translations[timeframe as keyof typeof translations] || timeframe;
}
