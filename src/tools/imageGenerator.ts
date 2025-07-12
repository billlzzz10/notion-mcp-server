import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { notion } from "../services/notion.js";

export const imageGeneratorTool: Tool = {
  name: "generate_character_image",
  description: "สร้าง AI Prompt สำหรับสร้างภาพตัวละครหรือสถานที่",
  inputSchema: {
    type: "object",
    properties: {
      entityType: {
        type: "string",
        enum: ["character", "location", "scene"],
        description: "ประเภทของสิ่งที่ต้องการสร้างภาพ"
      },
      entityName: {
        type: "string",
        description: "ชื่อตัวละคร/สถานที่/ฉาก"
      },
      imageStyle: {
        type: "string",
        enum: ["realistic", "anime", "dark_fantasy", "concept_art", "detailed_illustration"],
        description: "สไตล์ภาพ"
      },
      imageService: {
        type: "string",
        enum: ["midjourney", "dalle", "stable_diffusion", "leonardo"],
        description: "บริการสร้างภาพ AI"
      },
      aspectRatio: {
        type: "string",
        enum: ["1:1", "16:9", "9:16", "3:4", "4:3"],
        description: "อัตราส่วนภาพ",
        default: "1:1"
      },
      includeDetails: {
        type: "boolean",
        description: "รวมรายละเอียดจากฐานข้อมูลหรือไม่",
        default: true
      }
    },
    required: ["entityType", "entityName", "imageStyle", "imageService"]
  }
};

export async function handleImageGeneration(args: any) {
  try {
    let entityData: any = {};
    
    if (args.includeDetails) {
      entityData = await getEntityData(args.entityType, args.entityName);
    }

    const imagePrompt = generateImagePrompt(args, entityData);
    
    // บันทึก Prompt ลงฐานข้อมูล AI Prompts
    const aiPromptsDb = process.env.NOTION_AI_PROMPTS_DB_ID;
    if (aiPromptsDb) {
      await saveImagePrompt(aiPromptsDb, imagePrompt, args);
    }

    // สร้าง Make.com Webhook URL สำหรับเชื่อมต่อกับบริการสร้างภาพ
    const webhookInstructions = generateWebhookInstructions(args.imageService, imagePrompt);

    return {
      content: [
        {
          type: "text",
          text: `🎨 **AI Image Generation Prompt:**\n\n**สำหรับ ${args.imageService}:**\n\`\`\`\n${imagePrompt}\n\`\`\`\n\n${webhookInstructions}\n\n💡 **คำแนะนำ:** คัดลอก prompt ไปใช้กับ ${args.imageService} หรือใช้ Make.com Webhook เพื่อสร้างภาพอัตโนมัติ`
        }
      ]
    };

  } catch (error) {
    throw new Error(`ไม่สามารถสร้าง Image Prompt ได้: ${error}`);
  }
}

async function getEntityData(entityType: string, entityName: string) {
  let dbId = "";
  let nameProperty = "Name";

  switch (entityType) {
    case "character":
      dbId = process.env.NOTION_CHARACTERS_DB_ID || "";
      nameProperty = "Name";
      break;
    case "location":
      dbId = process.env.NOTION_LOCATIONS_DB_ID || "";
      nameProperty = "Name";
      break;
    case "scene":
      dbId = process.env.NOTION_SCENES_DB_ID || "";
      nameProperty = "Title";
      break;
  }

  if (!dbId) {
    throw new Error(`ไม่พบ Database ID สำหรับ ${entityType}`);
  }

  try {
    const response = await notion.databases.query({
      database_id: dbId,
      filter: {
        property: nameProperty,
        title: {
          contains: entityName
        }
      }
    });

    if (response.results.length > 0) {
      const entity = response.results[0] as any;
      return entity.properties;
    }

    return {};
  } catch (error) {
    console.error(`ไม่สามารถดึงข้อมูล ${entityType}:`, error);
    return {};
  }
}

function generateImagePrompt(args: any, entityData: any): string {
  let basePrompt = "";
  
  switch (args.entityType) {
    case "character":
      basePrompt = generateCharacterPrompt(args, entityData);
      break;
    case "location":
      basePrompt = generateLocationPrompt(args, entityData);
      break;
    case "scene":
      basePrompt = generateScenePrompt(args, entityData);
      break;
  }

  // เพิ่มข้อมูลสไตล์และคุณภาพ
  let styleModifiers = getStyleModifiers(args.imageStyle);
  let serviceSpecificTags = getServiceSpecificTags(args.imageService);
  
  // รวม prompt ทั้งหมด
  let finalPrompt = `${basePrompt}, ${styleModifiers}, ${serviceSpecificTags}`;
  
  // เพิ่ม negative prompts สำหรับ Ashval theme
  if (args.imageService === "stable_diffusion" || args.imageService === "leonardo") {
    finalPrompt += `\n\nNegative Prompt: bright colors, cheerful, cartoon, low quality, blurry, modern clothing, technology, vehicles, guns`;
  }

  return finalPrompt;
}

function generateCharacterPrompt(args: any, entityData: any): string {
  let prompt = "";
  
  const name = entityData.Name?.title?.[0]?.text?.content || args.entityName;
  const nickname = entityData.Nickname?.rich_text?.[0]?.text?.content || "";
  const appearance = entityData.Appearance?.rich_text?.[0]?.text?.content || "";
  const personality = entityData.Personality?.rich_text?.[0]?.text?.content || "";
  const abilities = entityData.Abilities?.rich_text?.[0]?.text?.content || "";
  const role = entityData.Role?.select?.name || "";
  const gender = entityData.Gender?.select?.name || "";
  const age = entityData.Age?.number || "";

  // สร้าง base prompt
  prompt = `Portrait of ${name}`;
  if (nickname) prompt += ` (${nickname})`;
  
  // เพิ่มข้อมูลพื้นฐาน
  if (age) prompt += `, ${age} years old`;
  if (gender) prompt += `, ${gender === "ชาย" ? "male" : "female"}`;
  if (role) prompt += `, ${translateRole(role)}`;
  
  // เพิ่มลักษณะภายนอก
  if (appearance) {
    prompt += `, ${translateAppearance(appearance)}`;
  } else {
    // ลักษณะพื้นฐานของโลก Ashval
    prompt += `, dark fantasy character, medieval fantasy clothing`;
  }
  
  // เพิ่มข้อมูลบุคลิกและพลัง
  if (personality) {
    const personalityEng = translatePersonality(personality);
    prompt += `, ${personalityEng} expression`;
  }
  
  if (abilities && abilities.includes("Arcana")) {
    prompt += `, mystical aura, magical energy emanating`;
  }
  
  // เพิ่มบรรยากาศ Ashval
  prompt += `, dark fantasy setting, mana crystal ambiance, ethereal and umbra energy background`;
  
  return prompt;
}

function generateLocationPrompt(args: any, entityData: any): string {
  let prompt = "";
  
  const name = entityData.Name?.title?.[0]?.text?.content || args.entityName;
  const type = entityData.Type?.select?.name || "";
  const description = entityData.Description?.rich_text?.[0]?.text?.content || "";
  const atmosphere = entityData.Atmosphere?.select?.name || "";
  const importance = entityData.Importance?.number || 5;
  
  prompt = `${name}`;
  if (type) prompt += `, ${translateLocationType(type)}`;
  
  if (description) {
    prompt += `, ${description}`;
  }
  
  if (atmosphere) {
    prompt += `, ${translateAtmosphere(atmosphere)} atmosphere`;
  }
  
  // เพิ่มรายละเอียดตามความสำคัญ
  if (importance >= 8) {
    prompt += `, highly detailed, epic scale, dramatic lighting`;
  } else if (importance >= 5) {
    prompt += `, detailed environment, atmospheric lighting`;
  } else {
    prompt += `, ambient environment`;
  }
  
  // เพิ่มธีม Ashval
  prompt += `, dark fantasy world, mana-infused environment, mystical elements`;
  
  return prompt;
}

function generateScenePrompt(args: any, entityData: any): string {
  let prompt = "";
  
  const title = entityData.Title?.title?.[0]?.text?.content || args.entityName;
  const summary = entityData.Summary?.rich_text?.[0]?.text?.content || "";
  const tone = entityData.Tone?.select?.name || "";
  const conflict = entityData.Conflict?.rich_text?.[0]?.text?.content || "";
  const purpose = entityData.Purpose?.rich_text?.[0]?.text?.content || "";
  
  prompt = `Scene: ${title}`;
  
  if (summary) {
    prompt += `, ${summary}`;
  }
  
  if (tone) {
    prompt += `, ${translateTone(tone)} mood`;
  }
  
  if (conflict) {
    prompt += `, tension and conflict, ${conflict}`;
  }
  
  // เพิ่มองค์ประกอบโลก Ashval
  prompt += `, dark fantasy scene, Ashval world setting, mana energy effects`;
  
  return prompt;
}

function getStyleModifiers(style: string): string {
  const styleMap = {
    realistic: "photorealistic, high quality, detailed, cinematic lighting",
    anime: "anime style, detailed anime art, vibrant colors, studio quality",
    dark_fantasy: "dark fantasy art, gothic, atmospheric, dramatic shadows",
    concept_art: "concept art, digital painting, professional illustration",
    detailed_illustration: "highly detailed illustration, digital art, fantasy art"
  };
  
  return styleMap[style as keyof typeof styleMap] || styleMap.dark_fantasy;
}

function getServiceSpecificTags(service: string): string {
  const serviceMap = {
    midjourney: "--ar 1:1 --v 6 --style raw",
    dalle: "high quality, detailed, artistic",
    stable_diffusion: "masterpiece, best quality, ultra detailed, 8k",
    leonardo: "high quality, professional, artistic rendering"
  };
  
  return serviceMap[service as keyof typeof serviceMap] || "";
}

async function saveImagePrompt(aiPromptsDb: string, prompt: string, args: any) {
  try {
    await notion.pages.create({
      parent: { database_id: aiPromptsDb },
      properties: {
        "Prompt Type": {
          select: {
            name: "Image Generation"
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
                content: `Entity: ${args.entityName}, Type: ${args.entityType}, Style: ${args.imageStyle}, Service: ${args.imageService}`
              }
            }
          ]
        }
      }
    });
  } catch (error) {
    console.error("ไม่สามารถบันทึก Image Prompt:", error);
  }
}

function generateWebhookInstructions(service: string, prompt: string): string {
  let instructions = `\n🔗 **การเชื่อมต่อกับ Make.com:**\n\n`;
  
  instructions += `**ขั้นตอนการตั้งค่า ${service} Webhook:**\n`;
  instructions += `1. สร้าง Scenario ใหม่ใน Make.com\n`;
  instructions += `2. เพิ่ม Webhook Module เป็น Trigger\n`;
  instructions += `3. เพิ่ม ${service} Module เป็น Action\n`;
  instructions += `4. ตั้งค่า Prompt: \`{{webhook.prompt}}\`\n`;
  
  switch (service) {
    case "midjourney":
      instructions += `5. ใช้ Midjourney Bot API หรือ Discord Webhook\n`;
      instructions += `6. ส่งคำสั่ง: \`/imagine prompt: {{webhook.prompt}}\`\n`;
      break;
    case "dalle":
      instructions += `5. ใช้ OpenAI API Key\n`;
      instructions += `6. Endpoint: https://api.openai.com/v1/images/generations\n`;
      break;
    case "stable_diffusion":
      instructions += `5. ใช้ Stability AI API หรือ RunPod\n`;
      instructions += `6. ส่ง POST request พร้อม prompt และ negative_prompt\n`;
      break;
    case "leonardo":
      instructions += `5. ใช้ Leonardo AI API\n`;
      instructions += `6. Endpoint: https://cloud.leonardo.ai/api/rest/v1/generations\n`;
      break;
  }
  
  instructions += `\n**ตัวอย่าง Webhook Payload:**\n`;
  instructions += `\`\`\`json\n`;
  instructions += `{\n`;
  instructions += `  "prompt": "${prompt}",\n`;
  instructions += `  "entity_name": "${service}",\n`;
  instructions += `  "callback_url": "YOUR_NOTION_WEBHOOK_URL"\n`;
  instructions += `}\n`;
  instructions += `\`\`\``;
  
  return instructions;
}

// Helper functions สำหรับแปลภาษา
function translateRole(role: string): string {
  const roleMap: { [key: string]: string } = {
    "นักผจญภัย": "adventurer",
    "นักรบ": "warrior", 
    "นักมายากล": "mage",
    "นักล่า": "hunter",
    "พ่อค้า": "merchant",
    "นักปราชญ์": "scholar"
  };
  return roleMap[role] || role;
}

function translateAppearance(appearance: string): string {
  // แปลลักษณะภายนอกพื้นฐาน
  return appearance
    .replace(/ผมดำ/g, "black hair")
    .replace(/ผมน้ำตาล/g, "brown hair") 
    .replace(/ผมบลอนด์/g, "blonde hair")
    .replace(/ตาสีน้ำเงิน/g, "blue eyes")
    .replace(/ตาสีเหลือง/g, "golden eyes")
    .replace(/ตาสีน้ำตาล/g, "brown eyes")
    .replace(/เสื้อเหล็ก/g, "metal armor")
    .replace(/เสื้อผ้า/g, "clothing")
    .replace(/สูง/g, "tall")
    .replace(/เตี้ย/g, "short");
}

function translatePersonality(personality: string): string {
  const personalityMap: { [key: string]: string } = {
    "เงียบ": "calm and serious",
    "แต่คิดมาก": "thoughtful and contemplative", 
    "ร่าเริง": "cheerful",
    "มั่นใจ": "confident",
    "ระมัดระวัง": "cautious",
    "กล้าหาญ": "brave"
  };
  
  let result = personality;
  Object.entries(personalityMap).forEach(([thai, english]) => {
    result = result.replace(new RegExp(thai, 'g'), english);
  });
  
  return result;
}

function translateLocationType(type: string): string {
  const typeMap: { [key: string]: string } = {
    "เหมือง": "mine",
    "ป่า": "forest", 
    "เมือง": "city",
    "หมู่บ้าน": "village",
    "ปราสาท": "castle",
    "ถ้ำ": "cave",
    "ทะเลทราย": "desert",
    "ภูเขา": "mountain"
  };
  return typeMap[type] || type;
}

function translateAtmosphere(atmosphere: string): string {
  const atmosphereMap: { [key: string]: string } = {
    "สงบ": "peaceful",
    "น่ากลัว": "ominous",
    "ลึกลับ": "mysterious", 
    "มืดมัว": "dark and foreboding",
    "วิเศษ": "magical",
    "อันตราย": "dangerous"
  };
  return atmosphereMap[atmosphere] || atmosphere;
}

function translateTone(tone: string): string {
  const toneMap: { [key: string]: string } = {
    "มืดมัว": "dark and grim",
    "สว่าง": "bright and hopeful",
    "ตึงเครียด": "tense",
    "ผ่อนคลาย": "relaxed",
    "ลึกลับ": "mysterious"
  };
  return toneMap[tone] || tone;
}
