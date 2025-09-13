import { server } from "../server/index.js";
import { PAGES_OPERATION_SCHEMA } from "../schema/page.js";
import { BLOCKS_OPERATION_SCHEMA } from "../schema/blocks.js";
import { DATABASE_OPERATION_SCHEMA } from "../schema/database.js";
import { COMMENTS_OPERATION_SCHEMA } from "../schema/comments.js";
import { USERS_OPERATION_SCHEMA } from "../schema/users.js";
import { registerPagesOperationTool } from "./pages.js";
import { registerBlocksOperationTool } from "./blocks.js";
import { registerDatabaseOperationTool } from "./database.js";
import { registerCommentsOperationTool } from "./comments.js";
import { registerUsersOperationTool } from "./users.js";

// Import World Building Tools
import { versionControlTool, handleVersionControl } from "./versionControl.js";
import { timelineAnalyzerTool, handleTimelineAnalysis } from "./timelineAnalyzer.js";
import { conflictGeneratorTool, handleConflictGeneration } from "./conflictGenerator.js";
import { storyArcAnalyzerTool, handleStoryArcAnalysis } from "./storyArcAnalyzer.js";
import { smartFilterTool, handleSmartFilter } from "./smartFilter.js";
import { imageGeneratorTool, handleImageGeneration } from "./imageGenerator.js";
import { consistencyCheckerTool, handleConsistencyCheck } from "./consistencyChecker.js";
import { worldRulesQueryTool, handleWorldRulesQuery } from "./worldRulesQuery.js";
import { advancedPromptGeneratorTool, handleAdvancedPromptGeneration } from "./advancedPromptGenerator.js";
import { storyStructureAnalyzerTool, handleStoryStructureAnalysis } from "./storyStructureAnalyzer.js";
import { databaseAnalyzerTool, handleDatabaseAnalysis } from "./databaseAnalyzer.js";
import { dataCompletionAssistantTool, handleDataCompletionAssistance } from "./dataCompletionAssistant.js";
import { projectsTools, handleProjectsTools } from "./projects.js";
import { writerAppTools, writerAppHandlers } from "./writerApp.js";

// Import the new tools
import { generateCharacterDialogue } from "./characterDialogueGenerator.js";
import { suggestTagsForContent } from "./autoTagSystem.js";
import { generateMindMapFromImage } from "./mindMapGenerator.js";

// Import Enhanced AI Tools
import { 
  semanticSearchTool, 
  findSimilarContentTool, 
  getContentRecommendationsTool, 
  detectPlotHolesTool,
  handleSemanticSearch,
  handleFindSimilarContent,
  handleGetContentRecommendations,
  handleDetectPlotHoles
} from "./semanticSearchTool.js";

export const registerAllTools = () => {
  // Define schemas for the new tools
  const characterDialogueGeneratorTool = {
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        personality: { type: "string" },
        situation: { type: "string" },
      },
      required: ["name", "personality", "situation"],
    },
  };

  const autoTagSystemTool = {
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string" },
        existingTags: { type: "array", items: { type: "string" } },
        tagOptions: { type: "array", items: { type: "string" } },
      },
      required: ["content"],
    },
  };

  const mindMapGeneratorTool = {
    inputSchema: {
        type: "object",
        properties: {
            imageUrl: { type: "string" },
            imageBase64: { type: "string" },
            prompt: { type: "string" },
        },
    },
  };

  // Register combined pages operation tool
  server.tool(
    "notion_pages",
    "Perform various page operations (create, archive, restore, search, update)",
    PAGES_OPERATION_SCHEMA,
    registerPagesOperationTool
  );

  // Register combined blocks operation tool
  server.tool(
    "notion_blocks",
    "Perform various block operations (retrieve, update, delete, append children, batch operations)",
    BLOCKS_OPERATION_SCHEMA,
    registerBlocksOperationTool
  );

  // Register combined database operation tool
  server.tool(
    "notion_database",
    "Perform various database operations (create, query, update)",
    DATABASE_OPERATION_SCHEMA,
    registerDatabaseOperationTool
  );

  // Register combined comments operation tool
  server.tool(
    "notion_comments",
    "Perform various comment operations (get, add to page, add to discussion)",
    COMMENTS_OPERATION_SCHEMA,
    registerCommentsOperationTool
  );

  // Register combined users operation tool
  server.tool(
    "notion_users",
    "Perform various user operations (list, get, get bot)",
    USERS_OPERATION_SCHEMA,
    registerUsersOperationTool
  );

  // Register World Building Tools
  server.tool(
    "ashval_version_control",
    "ติดตามและจัดการเวอร์ชันของข้อมูลใน Ashval World",
    versionControlTool.inputSchema as any,
    handleVersionControl as any
  );

  server.tool(
    "ashval_timeline_analyzer",
    "วิเคราะห์ timeline และตรวจหาความขัดแย้งทางเวลา",
    timelineAnalyzerTool.inputSchema as any,
    handleTimelineAnalysis as any
  );

  server.tool(
    "ashval_conflict_generator",
    "สร้างความขัดแย้งระหว่างตัวละครและสถานการณ์",
    conflictGeneratorTool.inputSchema as any,
    handleConflictGeneration as any
  );

  server.tool(
    "ashval_story_arc_analyzer",
    "วิเคราะห์ story arcs และความเชื่อมโยง",
    storyArcAnalyzerTool.inputSchema as any,
    handleStoryArcAnalysis as any
  );

  server.tool(
    "ashval_smart_filter",
    "สร้าง views และ filters อัจฉริยะสำหรับฐานข้อมูล",
    smartFilterTool.inputSchema as any,
    handleSmartFilter as any
  );

  server.tool(
    "ashval_image_generator",
    "สร้างคำสั่งสำหรับ AI image generation",
    imageGeneratorTool.inputSchema as any,
    handleImageGeneration as any
  );

  server.tool(
    "ashval_consistency_checker",
    "ตรวจสอบความสอดคล้องของข้อมูลในโลก Ashval",
    consistencyCheckerTool.inputSchema as any,
    handleConsistencyCheck as any
  );

  server.tool(
    "ashval_world_rules_query",
    "ค้นหาและตรวจสอบกฎของโลก Ashval",
    worldRulesQueryTool.inputSchema as any,
    handleWorldRulesQuery as any
  );

  server.tool(
    "ashval_advanced_prompt_generator",
    "สร้าง AI prompts ขั้นสูงสำหรับการเขียนเรื่อง",
    advancedPromptGeneratorTool.inputSchema as any,
    handleAdvancedPromptGeneration as any
  );

  server.tool(
    "ashval_story_structure_analyzer",
    "วิเคราะห์โครงสร้างเรื่องและ pacing",
    storyStructureAnalyzerTool.inputSchema as any,
    handleStoryStructureAnalysis as any
  );

  server.tool(
    "ashval_database_analyzer",
    "วิเคราะห์สถานะและความคืบหน้าของข้อมูลในฐานข้อมูลทั้งหมด",
    databaseAnalyzerTool.inputSchema as any,
    handleDatabaseAnalysis as any
  );

  server.tool(
    "ashval_data_completion_assistant",
    "ช่วยเติมข้อมูลที่ขาดหายไปในฐานข้อมูลด้วย AI และสร้างข้อเสนะแนะ",
    dataCompletionAssistantTool.inputSchema as any,
    handleDataCompletionAssistance as any
  );

  // Register Projects Tools
  for (const tool of projectsTools) {
    server.tool(
      tool.name,
      tool.description || "Projects management tool",
      tool.inputSchema as any,
      async (args: any) => {
        return await handleProjectsTools(tool.name, args);
      }
    );
  }

  // Register Writer App Tools
  for (const tool of writerAppTools) {
    const handler = (writerAppHandlers as any)[tool.name];
    if (handler) {
      server.tool(
        tool.name,
        tool.description || "Writer app tool",
        tool.inputSchema as any,
        handler
      );
    }
  }

  // Register Enhanced AI Tools
  server.tool(
    "semantic_search",
    "ค้นหาเนื้อหาแบบ semantic ใน Ashval databases โดยใช้ AI",
    semanticSearchTool.inputSchema as any,
    handleSemanticSearch as any
  );

  server.tool(
    "find_similar_content",
    "ค้นหาเนื้อหาที่คล้ายกับ character, scene หรือ location ที่ระบุ",
    findSimilarContentTool.inputSchema as any,
    handleFindSimilarContent as any
  );

  server.tool(
    "get_content_recommendations",
    "ได้รับคำแนะนำเนื้อหาตามบริบทปัจจุบันในการเขียน",
    getContentRecommendationsTool.inputSchema as any,
    handleGetContentRecommendations as any
  );

  server.tool(
    "detect_plot_holes",
    "ตรวจหาช่องโหว่ในโครงเรื่องและความไม่สอดคล้องในเนื้อหา",
    detectPlotHolesTool.inputSchema as any,
    handleDetectPlotHoles as any
  );

  // Register the new tools
  server.tool(
    "ashval_character_dialogue_generator",
    "สร้างบทสนทนาสำหรับตัวละครตามบุคลิกและสถานการณ์",
    characterDialogueGeneratorTool.inputSchema as any,
    generateCharacterDialogue as any
  );

  server.tool(
    "ashval_auto_tag_system",
    "แนะนำแท็กที่เกี่ยวข้องสำหรับเนื้อหาโดยอัตโนมัติ",
    autoTagSystemTool.inputSchema as any,
    suggestTagsForContent as any
  );

  server.tool(
    "ashval_mind_map_generator",
    "สร้าง mind map จากรูปภาพหรือข้อความ",
    mindMapGeneratorTool.inputSchema as any,
    generateMindMapFromImage as any
  );
};
