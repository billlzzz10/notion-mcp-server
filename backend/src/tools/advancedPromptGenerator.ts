import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { notion } from "../services/notion.js";

export const advancedPromptGeneratorTool: Tool = {
  name: "generate_advanced_prompt",
  description: "สร้าง AI Prompt เฉพาะทางสำหรับแต่ละประเภทเนื้อหาใน Ashval",
  inputSchema: {
    type: "object",
    properties: {
      promptType: {
        type: "string",
        enum: ["combat_scene", "dialogue", "location_description", "character_introspection", "world_building", "plot_advancement", "emotional_scene", "mystery_revelation"],
        description: "ประเภท Prompt ที่ต้องการ"
      },
      sceneContext: {
        type: "string",
        description: "บริบทของฉากที่ต้องการสร้าง"
      },
      charactersInvolved: {
        type: "array",
        items: { type: "string" },
        description: "ตัวละครที่เกี่ยวข้อง"
      },
      location: {
        type: "string",
        description: "สถานที่เกิดเหตุ"
      },
      moodTone: {
        type: "string",
        enum: ["มืดมัว", "ลึกลับ", "ตึงเครียด", "เศร้า", "หวังใจ", "น่ากลัว", "สงบ"],
        description: "อารมณ์และโทนของฉาก"
      },
      complexity: {
        type: "string",
        enum: ["simple", "medium", "complex", "very_complex"],
        description: "ระดับความซับซ้อน"
      },
      targetLength: {
        type: "string",
        enum: ["short", "medium", "long", "very_long"],
        description: "ความยาวที่ต้องการ"
      },
      includeWorldRules: {
        type: "boolean",
        description: "รวมกฎของโลกใน Prompt",
        default: true
      },
      customInstructions: {
        type: "string",
        description: "คำสั่งเพิ่มเติม (ถ้ามี)"
      }
    },
    required: ["promptType", "sceneContext", "moodTone"]
  }
};

export async function handleAdvancedPromptGeneration(args: any) {
  try {
    // ดึงข้อมูลที่เกี่ยวข้องจากฐานข้อมูล
    const contextData = await gatherContextData(args);
    
    // สร้าง Prompt เฉพาะทาง
    const prompt = await generateSpecializedPrompt(args, contextData);
    
    // บันทึก Prompt ลงฐานข้อมูล
    await saveAdvancedPrompt(prompt, args);
    
    // สร้างคำแนะนำเพิ่มเติม
    const additionalTips = generatePromptTips(args.promptType);

    return {
      content: [
        {
          type: "text",
          text: `🎯 **Advanced AI Prompt - ${args.promptType}:**\n\n\`\`\`\n${prompt}\n\`\`\`\n\n${additionalTips}\n\n💡 **การใช้งาน:** คัดลอก prompt นี้ไปใช้กับ Gemini AI หรือ AI อื่นๆ เพื่อสร้างเนื้อหาคุณภาพสูง`
        }
      ]
    };

  } catch (error) {
    throw new Error(`ไม่สามารถสร้าง Advanced Prompt ได้: ${error}`);
  }
}

async function gatherContextData(args: any) {
  const contextData: any = {
    characters: [],
    location: null,
    worldRules: [],
    relatedScenes: []
  };

  // ดึงข้อมูลตัวละคร
  if (args.charactersInvolved && args.charactersInvolved.length > 0) {
    const charactersDb = process.env.NOTION_CHARACTERS_DB_ID;
    if (charactersDb) {
      const dbResponse = await notion.databases.retrieve({ database_id: charactersDb });
      const dataSource = dbResponse.data_sources?.[0];
      if (!dataSource) {
        throw new Error(`No data source found for Characters DB: ${charactersDb}`);
      }
      for (const charName of args.charactersInvolved) {
        try {
          const response = await notion.dataSources.query({
            data_source_id: dataSource.id,
            filter: {
              property: "Name",
              title: {
                contains: charName
              }
            }
          });

          if (response.results.length > 0) {
            const char = response.results[0] as any;
            const props = char.properties;
            
            contextData.characters.push({
              name: props.Name?.title?.[0]?.text?.content || charName,
              nickname: props.Nickname?.rich_text?.[0]?.text?.content || "",
              personality: props.Personality?.rich_text?.[0]?.text?.content || "",
              abilities: props.Abilities?.rich_text?.[0]?.text?.content || "",
              goal: props.Goal?.rich_text?.[0]?.text?.content || "",
              background: props.Background?.rich_text?.[0]?.text?.content || ""
            });
          }
        } catch (error) {
          console.error(`ไม่สามารถดึงข้อมูลตัวละคร ${charName}:`, error);
        }
      }
    }
  }

  // ดึงข้อมูลสถานที่
  if (args.location) {
    const locationsDb = process.env.NOTION_LOCATIONS_DB_ID;
    if (locationsDb) {
      try {
        const dbResponse = await notion.databases.retrieve({ database_id: locationsDb });
        const dataSource = dbResponse.data_sources?.[0];
        if (!dataSource) {
          throw new Error(`No data source found for Locations DB: ${locationsDb}`);
        }
        const response = await notion.dataSources.query({
          data_source_id: dataSource.id,
          filter: {
            property: "Name",
            title: {
              contains: args.location
            }
          }
        });

        if (response.results.length > 0) {
          const loc = response.results[0] as any;
          const props = loc.properties;
          
          contextData.location = {
            name: props.Name?.title?.[0]?.text?.content || args.location,
            description: props.Description?.rich_text?.[0]?.text?.content || "",
            atmosphere: props.Atmosphere?.select?.name || "",
            type: props.Type?.select?.name || "",
            importance: props.Importance?.number || 5
          };
        }
      } catch (error) {
        console.error(`ไม่สามารถดึงข้อมูลสถานที่ ${args.location}:`, error);
      }
    }
  }

  // ดึงกฎของโลก (ถ้าต้องการ)
  if (args.includeWorldRules) {
    const worldRulesDb = process.env.NOTION_WORLD_RULES_DB_ID;
    if (worldRulesDb) {
      try {
        const dbResponse = await notion.databases.retrieve({ database_id: worldRulesDb });
        const dataSource = dbResponse.data_sources?.[0];
        if (!dataSource) {
          throw new Error(`No data source found for World Rules DB: ${worldRulesDb}`);
        }
        const response = await notion.dataSources.query({
          data_source_id: dataSource.id,
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

        response.results.forEach((rule: any) => {
          const props = rule.properties;
          contextData.worldRules.push({
            name: props["Rule Name"]?.title?.[0]?.text?.content || "",
            description: props.Description?.rich_text?.[0]?.text?.content || "",
            category: props.Category?.select?.name || ""
          });
        });
      } catch (error) {
        console.error("ไม่สามารถดึงกฎของโลก:", error);
      }
    }
  }

  return contextData;
}

async function generateSpecializedPrompt(args: any, contextData: any): Promise<string> {
  let prompt = "";

  // Header สำหรับทุก Prompt
  prompt += `สร้าง${getPromptTypeInThai(args.promptType)}สำหรับโลก Ashval ตามข้อมูลต่อไปนี้:\n\n`;
  
  // ข้อมูลบริบท
  prompt += `**บริบทฉาง:** ${args.sceneContext}\n`;
  prompt += `**อารมณ์และโทน:** ${args.moodTone}\n`;
  prompt += `**ระดับความซับซ้อน:** ${translateComplexity(args.complexity)}\n`;
  prompt += `**ความยาวที่ต้องการ:** ${translateLength(args.targetLength)}\n\n`;

  // ข้อมูลตัวละคร
  if (contextData.characters.length > 0) {
    prompt += `**ตัวละครที่เกี่ยวข้อง:**\n`;
    contextData.characters.forEach((char: any, index: number) => {
      prompt += `${index + 1}. **${char.name}**${char.nickname ? ` (${char.nickname})` : ""}\n`;
      if (char.personality) prompt += `   - บุคลิก: ${char.personality}\n`;
      if (char.abilities) prompt += `   - ความสามารถ: ${char.abilities}\n`;
      if (char.goal) prompt += `   - เป้าหมาย: ${char.goal}\n`;
    });
    prompt += "\n";
  }

  // ข้อมูลสถานที่
  if (contextData.location) {
    prompt += `**สถานที่:** ${contextData.location.name}\n`;
    if (contextData.location.description) prompt += `**คำอธิบาย:** ${contextData.location.description}\n`;
    if (contextData.location.atmosphere) prompt += `**บรรยากาศ:** ${contextData.location.atmosphere}\n`;
    prompt += "\n";
  }

  // กฎของโลก
  if (contextData.worldRules.length > 0) {
    prompt += `**กฎสำคัญของโลก Ashval:**\n`;
    contextData.worldRules.forEach((rule: any, index: number) => {
      prompt += `${index + 1}. ${rule.name}: ${rule.description}\n`;
    });
    prompt += "\n";
  }

  // คำสั่งเฉพาะตามประเภท
  prompt += getSpecificInstructions(args.promptType);

  // คำสั่งทั่วไปสำหรับ Ashval
  prompt += `\n**คำสั่งทั่วไป:**\n`;
  prompt += `- ใช้ภาษาไทยที่สวยงามและเหมาะกับแนว Dark Fantasy\n`;
  prompt += `- รักษาความสอดคล้องกับโลก Ashval และระบบมานา\n`;
  prompt += `- สร้างบรรยากาศ${args.moodTone}ให้เข้มข้น\n`;
  prompt += `- เชื่อมโยงกับระบบ Arcana และผลกระทบที่ตามมา\n`;
  prompt += `- ใช้รายละเอียดที่เฉพาะเจาะจงและสร้างภาพได้\n`;
  
  if (args.customInstructions) {
    prompt += `\n**คำสั่งเพิ่มเติม:** ${args.customInstructions}\n`;
  }

  return prompt;
}

function getPromptTypeInThai(type: string): string {
  const typeMap = {
    "combat_scene": "ฉากต่อสู้",
    "dialogue": "บทสนทนา",
    "location_description": "การบรรยายสถานที่",
    "character_introspection": "การครุ่นคิดของตัวละคร",
    "world_building": "การสร้างโลก",
    "plot_advancement": "การพัฒนาเนื้อเรื่อง",
    "emotional_scene": "ฉากแสดงอารมณ์",
    "mystery_revelation": "การเปิดเผยความลึกลับ"
  };
  return typeMap[type as keyof typeof typeMap] || type;
}

function translateComplexity(complexity: string): string {
  const complexityMap = {
    "simple": "เรียบง่าย (โฟกัสหลักๆ)",
    "medium": "ปานกลาง (มีรายละเอียดพอสมควร)",
    "complex": "ซับซ้อน (หลายชั้นความหมาย)",
    "very_complex": "ซับซ้อนมาก (เต็มไปด้วยนัยยะ)"
  };
  return complexityMap[complexity as keyof typeof complexityMap] || complexity;
}

function translateLength(length: string): string {
  const lengthMap = {
    "short": "สั้น (100-200 คำ)",
    "medium": "ปานกลาง (300-500 คำ)",
    "long": "ยาว (600-1000 คำ)",
    "very_long": "ยาวมาก (1000+ คำ)"
  };
  return lengthMap[length as keyof typeof lengthMap] || length;
}

function getSpecificInstructions(promptType: string): string {
  let instructions = `**คำสั่งเฉพาะสำหรับ${getPromptTypeInThai(promptType)}:**\n`;

  switch (promptType) {
    case "combat_scene":
      instructions += `1. อธิบายการใช้พลัง Arcana และผลกระทบต่อร่างกาย\n`;
      instructions += `2. แสดงกลยุทธ์และการตัดสินใจในสถานการณ์คับขัน\n`;
      instructions += `3. ใช้รายละเอียดการเคลื่อนไหวที่สร้างภาพได้\n`;
      instructions += `4. แสดงความเจ็บปวดทางกายและจิตใจ\n`;
      instructions += `5. อธิบายผลกระทบของการใช้มานาต่อสภาพแวดล้อม\n`;
      break;

    case "dialogue":
      instructions += `1. ใช้การพูดที่สะท้อนบุคลิกและพื้นเพของตัวละคร\n`;
      instructions += `2. แสดงความตึงเครียดหรืออารมณ์ผ่านการเลือกคำ\n`;
      instructions += `3. รวมข้อมูลสำคัญเกี่ยวกับโลกหรือเนื้อเรื่องในบทสนทนา\n`;
      instructions += `4. ใช้ subtext และสิ่งที่ไม่ได้พูดออกมา\n`;
      instructions += `5. สร้างจังหวะการสนทนาที่เป็นธรรมชาติ\n`;
      break;

    case "location_description":
      instructions += `1. อธิบายผลกระทบของมานาต่อสภาพแวดล้อม\n`;
      instructions += `2. ใช้ประสาทสัมผัสทั้ง 5 ในการบรรยาย\n`;
      instructions += `3. แสดงอารมณ์และความรู้สึกที่สถานที่ก่อให้เกิด\n`;
      instructions += `4. เชื่อมโยงกับประวัติศาสตร์หรือเหตุการณ์สำคัญ\n`;
      instructions += `5. แสดงสัญญาณของการอยู่อาศัยหรือกิจกรรม\n`;
      break;

    case "character_introspection":
      instructions += `1. แสดงความขัดแย้งภายในใจ\n`;
      instructions += `2. เชื่อมโยงกับอดีตและเป้าหมายของตัวละคร\n`;
      instructions += `3. อธิบายผลกระทบของ Arcana ต่อจิตใจ\n`;
      instructions += `4. ใช้ stream of consciousness หรือ internal monologue\n`;
      instructions += `5. แสดงการเปลี่ยนแปลงหรือการตระหนักรู้\n`;
      break;

    case "world_building":
      instructions += `1. อธิบายระบบมานาและ Arcana อย่างละเอียด\n`;
      instructions += `2. แสดงผลกระทบของระบบต่อสังคมและวัฒนธรรม\n`;
      instructions += `3. สร้างประวัติศาสตร์และตำนานที่เชื่อมโยงกัน\n`;
      instructions += `4. อธิบายเทคโนโลยีและวิธีการดำรงชีวิต\n`;
      instructions += `5. แสดงความขัดแย้งและปัญหาของโลก\n`;
      break;

    case "plot_advancement":
      instructions += `1. เชื่อมโยงเหตุการณ์ปัจจุบันกับเนื้อเรื่องใหญ่\n`;
      instructions += `2. แสดงผลกระทบของการกระทำต่อตัวละครอื่น\n`;
      instructions += `3. สร้าง foreshadowing สำหรับเหตุการณ์ต่อไป\n`;
      instructions += `4. แก้ไขหรือซับซ้อนขึ้นกับความขัดแย้งที่มีอยู่\n`;
      instructions += `5. แสดงการพัฒนาของตัวละครผ่านการกระทำ\n`;
      break;

    case "emotional_scene":
      instructions += `1. ใช้รายละเอียดที่สัมผัสได้เพื่อสื่ออารมณ์\n`;
      instructions += `2. แสดงผลกระทบทางกายของอารมณ์\n`;
      instructions += `3. ใช้สัญลักษณ์และ metaphor ที่เหมาะสม\n`;
      instructions += `4. สร้างจังหวะที่เหมาะกับอารมณ์\n`;
      instructions += `5. แสดงการเปลี่ยนแปลงหรือการตระหนักรู้\n`;
      break;

    case "mystery_revelation":
      instructions += `1. เปิดเผยข้อมูลแบบค่อยเป็นค่อยไป\n`;
      instructions += `2. เชื่อมโยงกับเบาะแสที่วางไว้ก่อนหน้า\n`;
      instructions += `3. แสดงปฏิกิริยาของตัวละครต่อความจริง\n`;
      instructions += `4. สร้างคำถามใหม่หรือความลึกลับเพิ่มเติม\n`;
      instructions += `5. ใช้การเปิดเผยเพื่อพัฒนาตัวละครหรือเนื้อเรื่อง\n`;
      break;
  }

  return instructions;
}

function generatePromptTips(promptType: string): string {
  let tips = `📚 **เทคนิคเพิ่มเติมสำหรับ${getPromptTypeInThai(promptType)}:**\n\n`;

  switch (promptType) {
    case "combat_scene":
      tips += `• **จังหวะ:** สลับระหว่างการกระทำเร็วและช่วงพัก\n`;
      tips += `• **ภาษากาย:** อธิบายท่าทางและการเคลื่อนไหวที่แสดงทักษะ\n`;
      tips += `• **สิ่งแวดล้อม:** ใช้สถานที่เป็นส่วนหนึ่งของการต่อสู้\n`;
      tips += `• **ผลกระทบ:** แสดงความเสียหายทั้งกายและใจ\n`;
      break;

    case "dialogue":
      tips += `• **เสียง:** ให้ตัวละครแต่ละคนมีลีลาการพูดเฉพาะตัว\n`;
      tips += `• **การขัดจังหวะ:** ใช้เพื่อสร้างความตึงเครียด\n`;
      tips += `• **ภาษากาย:** อธิบายท่าทางระหว่างพูด\n`;
      tips += `• **เลเยอร์:** แฝงความหมายหลายชั้นในบทสนทนา\n`;
      break;

    case "location_description":
      tips += `• **ความต่างระหว่างวันและคืน:** อธิบายการเปลี่ยนแปลง\n`;
      tips += `• **ประวัติ:** แสดงร่องรอยของอดีต\n`;
      tips += `• **อันตราย:** บ่งบอกถึงความปลอดภัยหรือภัยคุกคาม\n`;
      tips += `• **ชีวิต:** แสดงสิ่งมีชีวิตหรือการขาดหายไป\n`;
      break;

    default:
      tips += `• **ความสอดคล้อง:** ตรวจสอบให้ตรงกับโลก Ashval\n`;
      tips += `• **รายละเอียด:** ใช้รายละเอียดที่เฉพาะเจาะจง\n`;
      tips += `• **อารมณ์:** รักษาโทนที่ต้องการตลอด\n`;
      tips += `• **เชื่อมโยง:** เชื่อมกับเหตุการณ์อื่นๆ ในเรื่อง\n`;
  }

  return tips;
}

async function saveAdvancedPrompt(prompt: string, args: any): Promise<void> {
  const aiPromptsDb = process.env.NOTION_AI_PROMPTS_DB_ID;
  if (!aiPromptsDb) return;

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
            name: `Advanced ${getPromptTypeInThai(args.promptType)}`
          }
        },
        "Content": {
          rich_text: [
            {
              text: {
                content: prompt.substring(0, 2000) // จำกัดความยาว
              }
            }
          ]
        },
        "Parameters": {
          rich_text: [
            {
              text: {
                content: `Type: ${args.promptType}, Mood: ${args.moodTone}, Complexity: ${args.complexity}, Characters: ${args.charactersInvolved?.join(", ") || "None"}`
              }
            }
          ]
        }
      }
    });
  } catch (error) {
    console.error("ไม่สามารถบันทึก Advanced Prompt:", error);
  }
}
