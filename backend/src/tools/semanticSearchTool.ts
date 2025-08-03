/**
 * Semantic Search MCP Tool
 * ค้นหาเนื้อหาแบบ semantic ใน Ashval content
 */

import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { vectorSearchService } from "../services/vectorSearchService.js";

// Simple error handler for now
const handleNotionError = (error: any): CallToolResult => {
  return {
    content: [{
      type: "text",
      text: `❌ เกิดข้อผิดพลาด: ${error.message || error.toString()}`
    }]
  };
};

export const semanticSearchTool: Tool = {
  name: "semantic_search",
  description: "ค้นหาเนื้อหาแบบ semantic ใน Ashval databases (ตัวละคร, ฉาก, สถานที่) โดยใช้ AI เพื่อหาเนื้อหาที่เกี่ยวข้องตามความหมาย",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "คำค้นหาหรือคำอธิบายสิ่งที่ต้องการค้นหา (เช่น 'ตัวละครที่มีพลังมืด', 'ฉากการต่อสู้ที่เข้มข้น')"
      },
      contentTypes: {
        type: "array",
        items: {
          type: "string",
          enum: ["characters", "scenes", "locations", "world_rules", "story_arcs"]
        },
        description: "ประเภทเนื้อหาที่ต้องการค้นหา",
        default: ["characters", "scenes", "locations"]
      },
      limit: {
        type: "number",
        description: "จำนวนผลลัพธ์สูงสุดที่ต้องการ",
        default: 10,
        minimum: 1,
        maximum: 50
      },
      minSimilarity: {
        type: "number",
        description: "ระดับความคล้ายขั้นต่ำ (0-1)",
        default: 0.5,
        minimum: 0,
        maximum: 1
      }
    },
    required: ["query"]
  }
};

export const findSimilarContentTool: Tool = {
  name: "find_similar_content",
  description: "ค้นหาเนื้อหาที่คล้ายกับ character, scene หรือ location ที่ระบุ",
  inputSchema: {
    type: "object",
    properties: {
      referenceId: {
        type: "string",
        description: "ID ของ page ใน Notion ที่ต้องการใช้เป็นอ้างอิง"
      },
      contentType: {
        type: "string",
        enum: ["character", "scene", "location"],
        description: "ประเภทของเนื้อหาอ้างอิง"
      },
      limit: {
        type: "number",
        description: "จำนวนผลลัพธ์สูงสุด",
        default: 5,
        minimum: 1,
        maximum: 20
      }
    },
    required: ["referenceId", "contentType"]
  }
};

export const getContentRecommendationsTool: Tool = {
  name: "get_content_recommendations",
  description: "ได้รับคำแนะนำเนื้อหาตามบริบทปัจจุบันในการเขียน",
  inputSchema: {
    type: "object",
    properties: {
      currentContent: {
        type: "string",
        description: "เนื้อหาปัจจุบันที่กำลังเขียนหรือแก้ไข"
      },
      recommendationType: {
        type: "string",
        enum: ["character", "scene", "location"],
        description: "ประเภทเนื้อหาที่ต้องการคำแนะนำ",
        default: "scene"
      },
      limit: {
        type: "number",
        description: "จำนวนคำแนะนำสูงสุด",
        default: 5,
        minimum: 1,
        maximum: 15
      }
    },
    required: ["currentContent"]
  }
};

export const detectPlotHolesTool: Tool = {
  name: "detect_plot_holes",
  description: "ตรวจหาช่องโหว่ในโครงเรื่องและความไม่สอดคล้องในเนื้อหา",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "string",
        description: "ID ของโปรเจค (ถ้ามี) สำหรับขอบเขตการตรวจสอบ",
        default: null
      },
      analysisDepth: {
        type: "string",
        enum: ["basic", "detailed", "comprehensive"],
        description: "ระดับความลึกของการวิเคราะห์",
        default: "basic"
      }
    },
    required: []
  }
};

// Tool handlers
export async function handleSemanticSearch(args: any): Promise<CallToolResult> {
  try {
    const { query, contentTypes = ["characters", "scenes", "locations"], limit = 10, minSimilarity = 0.5 } = args;

    // Initialize vector service
    await vectorSearchService.initialize();

    // Perform semantic search
    const results = await vectorSearchService.semanticSearch(query, contentTypes, limit);

    // Check if this is a demo result (ChromaDB not installed)
    if (results.length === 1 && results[0].id === 'demo-result') {
      return {
        content: [{
          type: "text",
          text: `🔧 **Vector Search Demo Mode**\n\n` +
                `คุณเรียกใช้ \`semantic_search\` สำหรับ: "${query}"\n\n` +
                `⚠️ **ChromaDB ยังไม่ได้ติดตั้ง** - กำลังแสดงข้อมูล demo\n\n` +
                `🚀 **วิธีเปิดใช้งาน Vector Search**:\n` +
                `1. รัน: \`./scripts/install-enhancements.sh\`\n` +
                `2. ตั้งค่า: \`CHROMADB_URL=http://localhost:8000\` ใน .env\n` +
                `3. เริ่ม ChromaDB: \`docker run -p 8000:8000 chromadb/chroma\`\n` +
                `4. รัน: \`npm run build && npm run dev-mcp-only\`\n\n` +
                `✨ **หลังจากติดตั้งแล้ว** คุณจะสามารถ:\n` +
                `- ค้นหาเนื้อหาแบบ semantic (ตามความหมาย)\n` +
                `- หาตัวละคร/ฉาง/สถานที่ที่คล้ายกัน\n` +
                `- ได้รับคำแนะนำเนื้อหาอัตโนมัติ\n` +
                `- ตรวจหาช่องโหว่ในโครงเรื่อง`
        }]
      };
    }

    // Filter by minimum similarity
    const filteredResults = results.filter(r => r.similarity >= minSimilarity);

    if (filteredResults.length === 0) {
      return {
        content: [{
          type: "text",
          text: `ไม่พบเนื้อหาที่เกี่ยวข้องกับ "${query}" ที่มีระดับความคล้าย >= ${minSimilarity}\n\nแนะนำ:\n- ลองใช้คำค้นหาที่กว้างขึ้น\n- ลดระดับ minSimilarity\n- ตรวจสอบว่ามีเนื้อหาในฐานข้อมูลแล้วหรือไม่`
        }]
      };
    }

    // Format results (rest of the function remains the same)
    let response = `🔍 **ผลการค้นหา semantic สำหรับ**: "${query}"\n`;
    response += `📊 **พบ ${filteredResults.length} รายการ** (จาก ${results.length} รายการทั้งหมด)\n\n`;

    filteredResults.forEach((result, index) => {
      const similarityPercent = Math.round(result.similarity * 100);
      const typeEmoji = {
        characters: "👤",
        scenes: "🎬", 
        locations: "📍",
        world_rules: "⚖️",
        story_arcs: "📚"
      }[result.type] || "📄";

      response += `${index + 1}. ${typeEmoji} **${result.metadata.name || result.metadata.title || 'ไม่มีชื่อ'}**\n`;
      response += `   🎯 ความคล้าย: ${similarityPercent}%\n`;
      response += `   📝 ประเภท: ${result.type}\n`;
      response += `   🆔 ID: \`${result.id}\`\n`;
      
      // Show relevant metadata
      if (result.metadata.characters && result.metadata.characters.length > 0) {
        response += `   👥 ตัวละคร: ${result.metadata.characters.join(', ')}\n`;
      }
      if (result.metadata.location) {
        response += `   📍 สถานที่: ${result.metadata.location}\n`;
      }
      
      // Show content preview (first 150 characters)
      const preview = result.content.length > 150 
        ? result.content.substring(0, 150) + "..." 
        : result.content;
      response += `   📖 เนื้อหา: ${preview}\n\n`;
    });

    // Add usage tips
    response += `💡 **เทคนิคการใช้งาน**:\n`;
    response += `- ใช้ \`find_similar_content\` เพื่อหาเนื้อหาที่คล้ายกับ page ที่มีอยู่\n`;
    response += `- ใช้ \`get_content_recommendations\` เพื่อได้คำแนะนำระหว่างการเขียน\n`;
    response += `- ปรับ \`minSimilarity\` เพื่อควบคุมความแม่นยำของผลลัพธ์`;

    return {
      content: [{
        type: "text",
        text: response
      }]
    };

  } catch (error) {
    return handleNotionError(error);
  }
}

export async function handleFindSimilarContent(args: any): Promise<CallToolResult> {
  try {
    const { referenceId, contentType, limit = 5 } = args;

    await vectorSearchService.initialize();

    let results;
    if (contentType === "character") {
      results = await vectorSearchService.findSimilarCharacters(referenceId, limit);
    } else {
      // For scenes and locations, use semantic search with the reference content
      const referenceContent = await vectorSearchService.semanticSearch(
        referenceId, 
        [contentType === "scene" ? "scenes" : "locations"], 
        1
      );
      
      if (referenceContent.length === 0) {
        return {
          content: [{
            type: "text",
            text: `❌ ไม่พบเนื้อหาอ้างอิงที่มี ID: ${referenceId}`
          }]
        };
      }

      results = await vectorSearchService.semanticSearch(
        referenceContent[0].content,
        [contentType === "scene" ? "scenes" : "locations"],
        limit + 1
      );
      
      // Remove the reference item from results
      results = results.filter(r => r.id !== referenceId).slice(0, limit);
    }

    if (results.length === 0) {
      return {
        content: [{
          type: "text",
          text: `ไม่พบเนื้อหาที่คล้ายกับ ${contentType} ที่ระบุ\n\nเป็นไปได้ว่า:\n- เนื้อหานี้เป็นเอกลักษณ์เฉพาะตัว\n- ยังไม่มี ${contentType} อื่นที่คล้ายกันในฐานข้อมูล\n- ต้องการ index เนื้อหาเพิ่มเติม`
        }]
      };
    }

    const typeText = contentType === "character" ? "ตัวละคร" : 
                     contentType === "scene" ? "ฉาก" : "สถานที่";

    let response = `🔗 **${typeText}ที่คล้ายกัน** (อ้างอิงจาก ID: \`${referenceId}\`)\n\n`;

    results.forEach((result, index) => {
      const similarityPercent = Math.round(result.similarity * 100);
      response += `${index + 1}. **${result.metadata.name || result.metadata.title || 'ไม่มีชื่อ'}**\n`;
      response += `   🎯 ความคล้าย: ${similarityPercent}%\n`;
      response += `   🆔 ID: \`${result.id}\`\n`;
      
      const preview = result.content.length > 100 
        ? result.content.substring(0, 100) + "..." 
        : result.content;
      response += `   📝 เนื้อหา: ${preview}\n\n`;
    });

    return {
      content: [{
        type: "text",
        text: response
      }]
    };

  } catch (error) {
    return handleNotionError(error);
  }
}

export async function handleGetContentRecommendations(args: any): Promise<CallToolResult> {
  try {
    const { currentContent, recommendationType = "scene", limit = 5 } = args;

    await vectorSearchService.initialize();

    const recommendations = await vectorSearchService.getContentRecommendations(
      currentContent, 
      recommendationType, 
      limit
    );

    if (recommendations.length === 0) {
      return {
        content: [{
          type: "text",
          text: `💡 **ไม่พบคำแนะนำเนื้อหาที่เกี่ยวข้อง**\n\nเป็นไปได้ว่า:\n- เนื้อหาที่ป้อนมีความเป็นเอกลักษณ์สูง\n- ยังไม่มี${recommendationType === "character" ? "ตัวละคร" : recommendationType === "scene" ? "ฉาก" : "สถานที่"}ที่เกี่ยวข้องในฐานข้อมูล\n- ลองปรับเนื้อหาให้กว้างขึ้นหรือเฉพาะเจาะจงมากขึ้น`
        }]
      };
    }

    const typeText = recommendationType === "character" ? "ตัวละคร" : 
                     recommendationType === "scene" ? "ฉาก" : "สถานที่";

    let response = `💡 **คำแนะนำ${typeText}** ตามบริบทปัจจุบัน:\n\n`;
    response += `📝 **เนื้อหาอ้างอิง**: ${currentContent.substring(0, 200)}${currentContent.length > 200 ? "..." : ""}\n\n`;

    recommendations.forEach((rec, index) => {
      const similarityPercent = Math.round(rec.similarity * 100);
      response += `${index + 1}. **${rec.metadata.name || rec.metadata.title || 'ไม่มีชื่อ'}**\n`;
      response += `   🎯 เกี่ยวข้อง: ${similarityPercent}%\n`;
      response += `   🆔 ID: \`${rec.id}\`\n`;
      
      if (rec.metadata.characters && rec.metadata.characters.length > 0) {
        response += `   👥 ตัวละคร: ${rec.metadata.characters.join(', ')}\n`;
      }
      
      const preview = rec.content.length > 120 
        ? rec.content.substring(0, 120) + "..." 
        : rec.content;
      response += `   📝 เนื้อหา: ${preview}\n\n`;
    });

    response += `💡 **วิธีใช้คำแนะนำ**:\n`;
    response += `- คัดลอก ID เพื่อดูรายละเอียดเต็มใน Notion\n`;
    response += `- ใช้เป็นแรงบันดาลใจสำหรับการพัฒนาเนื้อหาใหม่\n`;
    response += `- ตรวจสอบความสอดคล้องกับโครงเรื่องหลัก`;

    return {
      content: [{
        type: "text",
        text: response
      }]
    };

  } catch (error) {
    return handleNotionError(error);
  }
}

export async function handleDetectPlotHoles(args: any): Promise<CallToolResult> {
  try {
    const { projectId, analysisDepth = "basic" } = args;

    await vectorSearchService.initialize();

    const potentialIssues = await vectorSearchService.findPotentialPlotHoles(projectId);

    if (potentialIssues.length === 0) {
      return {
        content: [{
          type: "text",
          text: `✅ **ไม่พบช่องโหว่ในโครงเรื่องที่ชัดเจน**\n\nการวิเคราะห์แบบ ${analysisDepth} ไม่พบความไม่สอดคล้องที่เด่นชัด\n\n💡 **แนะนำ**:\n- ลองใช้ \`analysisDepth: "detailed"\` สำหรับการตรวจสอบที่ละเอียดขึ้น\n- ตรวจสอบ timeline และ character development แยกต่างหาก\n- พิจารณาใช้ \`timeline_analyzer\` สำหรับการวิเคราะห์ลำดับเหตุการณ์`
        }]
      };
    }

    let response = `🔍 **การตรวจสอบช่องโหว่ในโครงเรื่อง** (ระดับ: ${analysisDepth})\n\n`;
    response += `⚠️ **พบความไม่สอดคล้องที่อาจเป็นปัญหา**: ${potentialIssues.length} รายการ\n\n`;

    potentialIssues.forEach((issue, index) => {
      const confidencePercent = Math.round(issue.similarity * 100);
      response += `${index + 1}. **${issue.metadata.title || 'ฉากไม่มีชื่อ'}**\n`;
      response += `   🎯 ระดับความเสี่ยง: ${confidencePercent}%\n`;
      response += `   🆔 ID: \`${issue.id}\`\n`;
      
      if (issue.metadata.characters && issue.metadata.characters.length > 0) {
        response += `   👥 ตัวละครที่เกี่ยวข้อง: ${issue.metadata.characters.join(', ')}\n`;
      }
      
      if (issue.metadata.location) {
        response += `   📍 สถานที่: ${issue.metadata.location}\n`;
      }
      
      const preview = issue.content.length > 100 
        ? issue.content.substring(0, 100) + "..." 
        : issue.content;
      response += `   📝 เนื้อหา: ${preview}\n\n`;
    });

    response += `🔧 **แนะนำการแก้ไข**:\n`;
    response += `- ตรวจสอบ scenes ที่มีความคล้ายสูงว่ามีผลลัพธ์ที่แตกต่างกันหรือไม่\n`;
    response += `- ใช้ \`timeline_analyzer\` เพื่อตรวจสอบลำดับเหตุการณ์\n`;
    response += `- ตรวจสอบ character consistency ในแต่ละ scene\n`;
    response += `- พิจารณาใช้ \`story_arc_analyzer\` สำหรับภาพรวมโครงเรื่อง`;

    return {
      content: [{
        type: "text",
        text: response
      }]
    };

  } catch (error) {
    return handleNotionError(error);
  }
}