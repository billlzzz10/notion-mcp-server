import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { notion } from "../services/notion.js";

export const storyStructureAnalyzerTool: Tool = {
  name: "analyze_story_structure",
  description: "วิเคราะห์โครงสร้างเรื่อง pacing และการพัฒนาตัวละครพร้อมแนะนำการปรับปรุง",
  inputSchema: {
    type: "object",
    properties: {
      analysisType: {
        type: "string",
        enum: ["pacing_analysis", "character_development", "plot_structure", "emotional_beats", "theme_consistency", "conflict_progression", "ai_prompt_analysis", "full_analysis"],
        description: "ประเภทการวิเคราะห์"
      },
      chapterRange: {
        type: "object",
        properties: {
          start: { type: "number" },
          end: { type: "number" }
        },
        description: "ช่วงตอนที่ต้องการวิเคราะห์"
      },
      focusCharacter: {
        type: "string",
        description: "ตัวละครที่ต้องการโฟกัส (สำหรับ character_development)"
      },
      generateSuggestions: {
        type: "boolean",
        description: "สร้างคำแนะนำการปรับปรุง",
        default: true
      },
      compareWithTemplate: {
        type: "string",
        enum: ["three_act", "heros_journey", "seven_point", "save_the_cat", "custom"],
        description: "เปรียบเทียบกับโครงสร้างมาตรฐาน"
      },
      exportFormat: {
        type: "string",
        enum: ["text", "chart", "timeline"],
        description: "รูปแบบการแสดงผล",
        default: "text"
      }
    },
    required: ["analysisType"]
  }
};

export async function handleStoryStructureAnalysis(args: any) {
  try {
    const storyData = await gatherStoryData(args.chapterRange);
    
    let analysisResult = "";

    switch (args.analysisType) {
      case "pacing_analysis":
        analysisResult = await analyzePacing(storyData, args);
        break;
      case "character_development":
        analysisResult = await analyzeCharacterDevelopment(storyData, args.focusCharacter);
        break;
      case "plot_structure":
        analysisResult = await analyzePlotStructure(storyData, args.compareWithTemplate);
        break;
      case "emotional_beats":
        analysisResult = await analyzeEmotionalBeats(storyData);
        break;
      case "theme_consistency":
        analysisResult = await analyzeThemeConsistency(storyData);
        break;
      case "conflict_progression":
        analysisResult = await analyzeConflictProgression(storyData);
        break;
      case "ai_prompt_analysis":
        analysisResult = await analyzeAIPrompts(storyData);
        break;
      case "full_analysis":
        analysisResult = await performFullAnalysis(storyData, args);
        break;
    }

    let suggestions = "";
    if (args.generateSuggestions) {
      suggestions = await generateImprovementSuggestions(storyData, args.analysisType);
    }

    await saveAnalysisReport(analysisResult, suggestions, args);

    return {
      content: [
        {
          type: "text",
          text: `📊 **Story Structure Analysis - ${args.analysisType}:**\n\n${analysisResult}${suggestions ? `\n\n${suggestions}` : ""}`
        }
      ]
    };

  } catch (error) {
    throw new Error(`ไม่สามารถวิเคราะห์โครงสร้างเรื่องได้: ${error}`);
  }
}

async function gatherStoryData(chapterRange?: any) {
  const storyData: any = {
    scenes: [],
    characters: [],
    storyArcs: [],
    aiPrompts: []
  };

  let filter: any = {};
  if (chapterRange) {
    filter = {
      and: [
        { property: "Chapter", number: { greater_than_or_equal_to: chapterRange.start } },
        { property: "Chapter", number: { less_than_or_equal_to: chapterRange.end } }
      ]
    };
  }

  const scenesDb = process.env.NOTION_SCENES_DB_ID;
  if (scenesDb) {
    const dbResponse = await notion.databases.retrieve({ database_id: scenesDb });
    const dataSource = dbResponse.data_sources?.[0];
    if (!dataSource) throw new Error(`No data source found for Scenes DB: ${scenesDb}`);
    const scenesResponse = await notion.dataSources.query({
      data_source_id: dataSource.id,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      sorts: [{ property: "Chapter", direction: "ascending" }, { property: "Order", direction: "ascending" }]
    });
    storyData.scenes = scenesResponse.results.map((scene: any) => {
      const props = scene.properties;
      return {
        id: scene.id,
        title: props.Title?.title?.[0]?.text?.content || "",
        chapter: props.Chapter?.number || 0,
        order: props.Order?.number || 0,
        summary: props.Summary?.rich_text?.[0]?.text?.content || "",
        purpose: props.Purpose?.rich_text?.[0]?.text?.content || "",
        conflict: props.Conflict?.rich_text?.[0]?.text?.content || "",
        tone: props.Tone?.select?.name || "",
        emotionalArc: props["Emotional Arc"]?.select?.name || "",
        pacing: props.Pacing?.select?.name || "",
        charactersInScene: props["Characters in Scene"]?.relation || []
      };
    });
  }

  const charactersDb = process.env.NOTION_CHARACTERS_DB_ID;
  if (charactersDb) {
    const dbResponse = await notion.databases.retrieve({ database_id: charactersDb });
    const dataSource = dbResponse.data_sources?.[0];
    if (!dataSource) throw new Error(`No data source found for Characters DB: ${charactersDb}`);
    const charactersResponse = await notion.dataSources.query({ data_source_id: dataSource.id });
    storyData.characters = charactersResponse.results.map((char: any) => {
      const props = char.properties;
      return {
        id: char.id,
        name: props.Name?.title?.[0]?.text?.content || "",
        role: props.Role?.select?.name || "",
        arcStatus: props["Arc Status"]?.select?.name || "",
        screenTime: props["Screen Time"]?.select?.name || "",
        goal: props.Goal?.rich_text?.[0]?.text?.content || "",
        personality: props.Personality?.rich_text?.[0]?.text?.content || ""
      };
    });
  }

  const storyArcsDb = process.env.NOTION_STORY_ARCS_DB_ID;
  if (storyArcsDb) {
    const dbResponse = await notion.databases.retrieve({ database_id: storyArcsDb });
    const dataSource = dbResponse.data_sources?.[0];
    if (!dataSource) throw new Error(`No data source found for Story Arcs DB: ${storyArcsDb}`);
    const arcsResponse = await notion.dataSources.query({ data_source_id: dataSource.id });
    storyData.storyArcs = arcsResponse.results.map((arc: any) => {
      const props = arc.properties;
      return {
        id: arc.id,
        name: props["Arc Name"]?.title?.[0]?.text?.content || "",
        type: props["Arc Type"]?.select?.name || "",
        status: props.Status?.select?.name || "",
        startChapter: props["Start Chapter"]?.number || 0,
        endChapter: props["End Chapter"]?.number || 0,
        theme: props.Theme?.select?.name || "",
        centralConflict: props["Central Conflict"]?.rich_text?.[0]?.text?.content || ""
      };
    });
  }

  const aiPromptsDb = process.env.NOTION_AI_PROMPTS_DB_ID;
  if (aiPromptsDb) {
    const dbResponse = await notion.databases.retrieve({ database_id: aiPromptsDb });
    const dataSource = dbResponse.data_sources?.[0];
    if (!dataSource) throw new Error(`No data source found for AI Prompts DB: ${aiPromptsDb}`);
    const promptsResponse = await notion.dataSources.query({ data_source_id: dataSource.id });
    storyData.aiPrompts = promptsResponse.results.map((prompt: any) => {
      const props = prompt.properties;
      return {
        id: prompt.id,
        prompt: props.Prompt?.rich_text?.[0]?.text?.content || "",
        type: props.Type?.select?.name || "",
        usage: props.Usage?.rich_text?.[0]?.text?.content || "",
        effectiveness: props.Effectiveness?.number || 0
      };
    });
  }

  return storyData;
}

async function analyzePacing(storyData: any, args: any): Promise<string> {
  let analysis = "⏱️ **การวิเคราะห์ Pacing:**\n\n";

  const chapterDistribution = new Map();
  const pacingData = new Map();

  storyData.scenes.forEach((scene: any) => {
    const chapter = scene.chapter;
    chapterDistribution.set(chapter, (chapterDistribution.get(chapter) || 0) + 1);
    const pacing = scene.pacing || "Medium";
    pacingData.set(pacing, (pacingData.get(pacing) || 0) + 1);
  });

  analysis += "📊 **การกระจายฉากต่อตอน:**\n";
  const chapters = Array.from(chapterDistribution.keys()).sort((a, b) => a - b);
  const avgScenesPerChapter = chapters.length > 0 ? storyData.scenes.length / chapters.length : 0;
  
  chapters.forEach(chapter => {
    const sceneCount = chapterDistribution.get(chapter);
    const status = sceneCount > avgScenesPerChapter * 1.5 ? "🔥 หนาแน่น" : 
                   sceneCount < avgScenesPerChapter * 0.5 ? "🐌 ช้า" : "✅ สมดุล";
    analysis += `  ตอนที่ ${chapter}: ${sceneCount} ฉาก ${status}\n`;
  });

  analysis += "\n🎯 **การวิเคราะห์ Pacing โดยรวม:**\n";
  pacingData.forEach((count, pacing) => {
    const percentage = storyData.scenes.length > 0 ? ((count / storyData.scenes.length) * 100).toFixed(1) : "0.0";
    analysis += `  ${pacing}: ${count} ฉาก (${percentage}%)\n`;
  });

  analysis += "\n⚠️ **ปัญหา Pacing ที่พบ:**\n";
  let issues = 0;

  for (let i = 0; i < storyData.scenes.length - 2; i++) {
    const current = storyData.scenes[i];
    const next = storyData.scenes[i + 1];
    const nextNext = storyData.scenes[i + 2];
    
    if (current.pacing === "Slow" && next.pacing === "Slow" && nextNext.pacing === "Slow") {
      analysis += `  🐌 ตอนที่ ${current.chapter}-${nextNext.chapter}: ฉากช้า 3 ฉากติดต่อกัน\n`;
      issues++;
    }
  }

  const fastScenes = storyData.scenes.filter((s: any) => s.pacing === "Very Fast" || s.pacing === "Fast");
  if (storyData.scenes.length > 0 && fastScenes.length > storyData.scenes.length * 0.6) {
    analysis += `  ⚡ การเร่งรัดเกินไป: ${fastScenes.length}/${storyData.scenes.length} ฉากมี pacing เร็ว\n`;
    issues++;
  }

  if (issues === 0) {
    analysis += "  ✅ ไม่พบปัญหา pacing ที่สำคัญ\n";
  }

  return analysis;
}

async function analyzeCharacterDevelopment(storyData: any, focusCharacter?: string): Promise<string> {
  let analysis = "👥 **การวิเคราะห์การพัฒนาตัวละคร:**\n\n";
  const characterAppearances = new Map();
  
  storyData.scenes.forEach((scene: any) => {
    scene.charactersInScene.forEach((charRef: any) => {
      const charId = charRef.id;
      if (!characterAppearances.has(charId)) {
        characterAppearances.set(charId, []);
      }
      characterAppearances.get(charId).push({
        chapter: scene.chapter,
        sceneTitle: scene.title,
        purpose: scene.purpose,
        emotionalArc: scene.emotionalArc
      });
    });
  });

  const mainCharacters = Array.from(characterAppearances.entries())
    .sort(([,a], [,b]) => b.length - a.length)
    .slice(0, 5);

  if (focusCharacter) {
    analysis += `🎯 **โฟกัส: ${focusCharacter}**\n\n`;
    const charData = storyData.characters.find((c: any) => c.name.includes(focusCharacter));
    if (charData) {
      const appearances = characterAppearances.get(charData.id) || [];
      analysis += analyzeIndividualCharacter(charData, appearances);
    }
  } else {
    analysis += "📊 **ตัวละครหลักและการปรากฏ:**\n";
    mainCharacters.forEach(([charId, appearances], index) => {
      const charData = storyData.characters.find((c: any) => c.id === charId);
      if (charData) {
        analysis += `${index + 1}. **${charData.name}**: ${appearances.length} ฉาง (${charData.role})\n`;
        analysis += `   สถานะ Arc: ${charData.arcStatus || "ไม่ระบุ"}\n`;
      }
    });
  }

  analysis += "\n⏱️ **การวิเคราะห์ Screen Time:**\n";
  const screenTimeDistribution = new Map();
  
  storyData.characters.forEach((char: any) => {
    const screenTime = char.screenTime || "Minor";
    screenTimeDistribution.set(screenTime, (screenTimeDistribution.get(screenTime) || 0) + 1);
  });

  screenTimeDistribution.forEach((count, screenTime) => {
    analysis += `  ${screenTime}: ${count} ตัวละคร\n`;
  });

  return analysis;
}

function analyzeIndividualCharacter(charData: any, appearances: any[]): string {
  let analysis = "";
  analysis += `**ข้อมูลพื้นฐาน:**\n`;
  analysis += `  บทบาท: ${charData.role}\n`;
  analysis += `  เป้าหมาย: ${charData.goal || "ไม่ระบุ"}\n`;
  analysis += `  สถานะ Arc: ${charData.arcStatus || "ไม่ระบุ"}\n\n`;
  analysis += `**การปรากฏในเรื่อง (${appearances.length} ฉาก):**\n`;
  
  const chapterGroups = new Map();
  appearances.forEach(app => {
    const chapter = app.chapter;
    if (!chapterGroups.has(chapter)) {
      chapterGroups.set(chapter, []);
    }
    chapterGroups.get(chapter).push(app);
  });

  Array.from(chapterGroups.keys()).sort((a, b) => a - b).forEach(chapter => {
    const scenes = chapterGroups.get(chapter);
    analysis += `  ตอนที่ ${chapter}: ${scenes.length} ฉาก\n`;
    scenes.forEach((scene: any) => {
      analysis += `    - ${scene.sceneTitle}${scene.emotionalArc ? ` (${scene.emotionalArc})` : ""}\n`;
    });
  });

  return analysis;
}

async function analyzePlotStructure(storyData: any, template?: string): Promise<string> {
  let analysis = "📚 **การวิเคราะห์โครงสร้างเนื้อเรื่อง:**\n\n";
  if (storyData.scenes.length === 0) return analysis + "ไม่มีข้อมูลฉากให้วิเคราะห์";

  const totalChapters = Math.max(1, ...storyData.scenes.map((s: any) => s.chapter));
  const act1End = Math.floor(totalChapters * 0.25);
  const act2End = Math.floor(totalChapters * 0.75);

  analysis += "🎭 **โครงสร้าง 3 องก์:**\n";
  analysis += `  Act 1 (Setup): ตอนที่ 1-${act1End}\n`;
  analysis += `  Act 2 (Confrontation): ตอนที่ ${act1End + 1}-${act2End}\n`;
  analysis += `  Act 3 (Resolution): ตอนที่ ${act2End + 1}-${totalChapters}\n\n`;

  const conflictsByAct = {
    act1: storyData.scenes.filter((s: any) => s.chapter <= act1End && s.conflict).length,
    act2: storyData.scenes.filter((s: any) => s.chapter > act1End && s.chapter <= act2End && s.conflict).length,
    act3: storyData.scenes.filter((s: any) => s.chapter > act2End && s.conflict).length
  };

  analysis += "⚔️ **การกระจาย Conflicts:**\n";
  analysis += `  Act 1: ${conflictsByAct.act1} ฉากที่มี conflict\n`;
  analysis += `  Act 2: ${conflictsByAct.act2} ฉากที่มี conflict\n`;
  analysis += `  Act 3: ${conflictsByAct.act3} ฉากที่มี conflict\n\n`;

  const emotionalProgression = storyData.scenes.map((s: any) => ({
    chapter: s.chapter,
    emotional: s.emotionalArc,
    tone: s.tone
  })).filter((s: any) => s.emotional);

  analysis += "💝 **Emotional Progression:**\n";
  const emotionalCounts = new Map();
  emotionalProgression.forEach((ep: any) => {
    emotionalCounts.set(ep.emotional, (emotionalCounts.get(ep.emotional) || 0) + 1);
  });

  emotionalCounts.forEach((count, emotion) => {
    analysis += `  ${emotion}: ${count} ฉาก\n`;
  });

  return analysis;
}

async function analyzeEmotionalBeats(storyData: any): Promise<string> {
  let analysis = "💝 **การวิเคราะห์ Emotional Beats:**\n\n";
  if (storyData.scenes.length === 0) return analysis + "ไม่มีข้อมูลฉากให้วิเคราะห์";

  const toneProgression = storyData.scenes.map((s: any) => ({
    chapter: s.chapter,
    order: s.order,
    tone: s.tone,
    title: s.title
  })).filter((s: any) => s.tone);

  analysis += "🎭 **Tone Progression:**\n";
  
  const chapterTones = new Map();
  toneProgression.forEach((tp: any) => {
    const chapter = tp.chapter;
    if (!chapterTones.has(chapter)) chapterTones.set(chapter, []);
    chapterTones.get(chapter).push(tp);
  });

  Array.from(chapterTones.keys()).sort((a, b) => a - b).forEach(chapter => {
    const tones = chapterTones.get(chapter);
    const dominantTone = findDominantTone(tones);
    analysis += `  ตอนที่ ${chapter}: ${dominantTone} (${tones.length} ฉาก)\n`;
  });

  const toneVariety = new Set(toneProgression.map((tp: any) => tp.tone));
  analysis += `\n🌈 **ความหลากหลายทางอารมณ์:** ${toneVariety.size} โทนที่แตกต่าง\n`;

  const toneCounts = new Map();
  toneProgression.forEach((tp: any) => {
    toneCounts.set(tp.tone, (toneCounts.get(tp.tone) || 0) + 1);
  });

  const totalScenes = toneProgression.length;
  if (totalScenes > 0) {
    const darkTones = ["มืดมัว", "น่ากลัว", "เศร้า"].reduce((sum, tone) => sum + (toneCounts.get(tone) || 0), 0);
    const lightTones = ["หวังใจ", "สงบ"].reduce((sum, tone) => sum + (toneCounts.get(tone) || 0), 0);
    analysis += `\n⚖️ **สมดุลทางอารมณ์:**\n`;
    analysis += `  โทนมืด: ${darkTones}/${totalScenes} (${((darkTones/totalScenes)*100).toFixed(1)}%)\n`;
    analysis += `  โทนสว่าง: ${lightTones}/${totalScenes} (${((lightTones/totalScenes)*100).toFixed(1)}%)\n`;
  }

  return analysis;
}

function findDominantTone(tones: any[]): string {
  if (tones.length === 0) return "ไม่ระบุ";
  const toneCount = new Map();
  tones.forEach(t => {
    toneCount.set(t.tone, (toneCount.get(t.tone) || 0) + 1);
  });
  
  let maxCount = 0;
  let dominantTone = "";
  toneCount.forEach((count, tone) => {
    if (count > maxCount) {
      maxCount = count;
      dominantTone = tone;
    }
  });
  
  return dominantTone;
}

async function analyzeThemeConsistency(storyData: any): Promise<string> {
  return "🎨 **การวิเคราะห์ความสอดคล้องของธีม:**\n(ฟีเจอร์นี้ต้องการข้อมูลเพิ่มเติมจาก Story Arcs)";
}

async function analyzeConflictProgression(storyData: any): Promise<string> {
  let analysis = "⚔️ **การวิเคราะห์ Conflict Progression:**\n\n";
  if (storyData.scenes.length === 0) return analysis + "ไม่มีข้อมูลฉากให้วิเคราะห์";

  const conflictScenes = storyData.scenes.filter((s: any) => s.conflict && s.conflict.trim() !== "");
  
  analysis += `📊 **สถิติ Conflict:**\n`;
  analysis += `  ฉากที่มี conflict: ${conflictScenes.length}/${storyData.scenes.length}\n`;
  analysis += `  อัตราส่วน: ${((conflictScenes.length/storyData.scenes.length)*100).toFixed(1)}%\n\n`;

  const conflictByChapter = new Map();
  conflictScenes.forEach((scene: any) => {
    const chapter = scene.chapter;
    conflictByChapter.set(chapter, (conflictByChapter.get(chapter) || 0) + 1);
  });

  analysis += "📈 **การกระจาย Conflict ตามตอน:**\n";
  Array.from(conflictByChapter.keys()).sort((a, b) => a - b).forEach(chapter => {
    const count = conflictByChapter.get(chapter);
    analysis += `  ตอนที่ ${chapter}: ${count} conflicts\n`;
  });

  return analysis;
}

async function performFullAnalysis(storyData: any, args: any): Promise<string> {
  const pacing = await analyzePacing(storyData, args);
  const character = await analyzeCharacterDevelopment(storyData);
  const plot = await analyzePlotStructure(storyData);
  const emotional = await analyzeEmotionalBeats(storyData);
  const conflict = await analyzeConflictProgression(storyData);
  const aiPrompts = await analyzeAIPrompts(storyData);

  return `${pacing}\n\n---\n\n${character}\n\n---\n\n${plot}\n\n---\n\n${emotional}\n\n---\n\n${conflict}\n\n---\n\n${aiPrompts}`;
}

async function generateImprovementSuggestions(storyData: any, analysisType: string): Promise<string> {
  let suggestions = "\n💡 **คำแนะนำการปรับปรุง:**\n\n";

  switch (analysisType) {
    case "pacing_analysis":
      suggestions += generatePacingSuggestions(storyData);
      break;
    case "character_development":
      suggestions += generateCharacterSuggestions(storyData);
      break;
    case "plot_structure":
      suggestions += generatePlotSuggestions(storyData);
      break;
    case "ai_prompt_analysis":
      suggestions += generateAIPromptSuggestions(storyData);
      break;
    default:
      suggestions += generateGeneralSuggestions(storyData);
  }

  return suggestions;
}

function generatePacingSuggestions(storyData: any): string {
  let suggestions = "";
  if (storyData.scenes.length === 0) return suggestions;
  
  const chapters = [...new Set(storyData.scenes.map(s => s.chapter))];
  const avgScenesPerChapter = chapters.length > 0 ? storyData.scenes.length / chapters.length : 0;
  
  if (avgScenesPerChapter > 4) {
    suggestions += "📝 **Pacing:** พิจารณารวมฉากสั้นๆ เข้าด้วยกันเพื่อความลื่นไหล\n";
  } else if (avgScenesPerChapter < 2) {
    suggestions += "📝 **Pacing:** พิจารณาแบ่งฉางยาวออกเป็นส่วนย่อยเพื่อให้ติดตามได้ง่าย\n";
  }

  const fastScenes = storyData.scenes.filter((s: any) => s.pacing === "Very Fast" || s.pacing === "Fast").length;
  if (fastScenes > storyData.scenes.length * 0.6) {
    suggestions += "⚡ **Pacing:** เพิ่มฉากผ่อนคลายเพื่อให้ผู้อ่านได้พักผ่อน\n";
  }

  return suggestions;
}

function generateCharacterSuggestions(storyData: any): string {
  let suggestions = "";
  if (storyData.characters.length === 0) return suggestions;
  
  const majorCharacters = storyData.characters.filter((c: any) => c.screenTime === "Major");
  const developingCharacters = storyData.characters.filter((c: any) => c.arcStatus === "Developing");
  
  if (majorCharacters.length > 5) {
    suggestions += "👥 **Characters:** มีตัวละครหลักมากเกินไป พิจารณาลดหรือรวมบทบาท\n";
  }
  
  if (majorCharacters.length > 0 && developingCharacters.length < majorCharacters.length * 0.5) {
    suggestions += "📈 **Character Development:** ตัวละครหลักส่วนใหญ่ไม่ได้พัฒนา พิจารณาเพิ่ม character arcs\n";
  }

  return suggestions;
}

function generatePlotSuggestions(storyData: any): string {
  let suggestions = "";
  if (storyData.scenes.length === 0) return suggestions;
  
  const conflictScenes = storyData.scenes.filter((s: any) => s.conflict && s.conflict.trim() !== "").length;
  const conflictRatio = conflictScenes / storyData.scenes.length;
  
  if (conflictRatio < 0.3) {
    suggestions += "⚔️ **Plot:** เพิ่มความขัดแย้งในฉากต่างๆ เพื่อสร้างความตึงเครียด\n";
  } else if (conflictRatio > 0.8) {
    suggestions += "😌 **Plot:** เพิ่มฉากที่ให้ข้อมูลหรือพัฒนาตัวละครเพื่อสมดุล\n";
  }

  return suggestions;
}

function generateGeneralSuggestions(storyData: any): string {
  return "✨ **ทั่วไป:** ตรวจสอบความสอดคล้องของโลก Ashval และระบบมานาในทุกฉาง\n";
}

async function saveAnalysisReport(analysis: string, suggestions: string, args: any): Promise<void> {
  const versionsDb = process.env.NOTION_VERSION_HISTORY_DB_ID;
  if (!versionsDb) return;

  try {
    const dbResponse = await notion.databases.retrieve({ database_id: versionsDb });
    const dataSource = dbResponse.data_sources?.[0];
    if (!dataSource) {
      console.error(`No data source found for Version History DB: ${versionsDb}`);
      return;
    }

    await notion.pages.create({
      parent: { data_source_id: dataSource.id },
      properties: {
        "Title": {
          title: [
            {
              text: {
                content: `Story Analysis: ${args.analysisType}`
              }
            }
          ]
        },
        "Entity Type": { select: { name: "Analysis" } },
        "Change Type": { select: { name: "Analysis" } },
        "New Value": { rich_text: [{ text: { content: `${analysis}\n\n${suggestions}`.substring(0, 2000) } }] },
        "Reason": { rich_text: [{ text: { content: "Story structure analysis report" } }] },
        "AI Generated": { checkbox: true }
      }
    });
  } catch (error) {
    console.error("ไม่สามารถบันทึกรายงานการวิเคราะห์:", error);
  }
}

async function analyzeAIPrompts(storyData: any): Promise<string> {
  let analysis = "🤖 **การวิเคราะห์ AI Prompts:**\n\n";

  if (storyData.aiPrompts.length === 0) {
    analysis += "⚠️ ยังไม่มีข้อมูล AI Prompts ในฐานข้อมูล\n";
    analysis += "💡 แนะนำให้เพิ่ม prompts ที่ใช้ในการพัฒนาเรื่อง\n";
    return analysis;
  }

  const promptTypes = new Map();
  storyData.aiPrompts.forEach((prompt: any) => {
    const type = prompt.type || "ไม่ระบุ";
    promptTypes.set(type, (promptTypes.get(type) || 0) + 1);
  });

  analysis += `📊 **สถิติ AI Prompts:**\n`;
  analysis += `  จำนวนทั้งหมด: ${storyData.aiPrompts.length} prompts\n`;
  analysis += `  ประเภทที่แตกต่าง: ${promptTypes.size} ประเภท\n\n`;

  analysis += `🏷️ **การแจกแจงตามประเภท:**\n`;
  promptTypes.forEach((count, type) => {
    const percentage = ((count / storyData.aiPrompts.length) * 100).toFixed(1);
    analysis += `  ${type}: ${count} prompts (${percentage}%)\n`;
  });

  const effectivePrompts = storyData.aiPrompts.filter((p: any) => p.effectiveness >= 7);
  const averageEffectiveness = storyData.aiPrompts.length > 0 ? storyData.aiPrompts.reduce((sum: number, p: any) => sum + (p.effectiveness || 0), 0) / storyData.aiPrompts.length : 0;

  analysis += `\n⭐ **ประสิทธิภาพ:**\n`;
  analysis += `  ค่าเฉลี่ย: ${averageEffectiveness.toFixed(1)}/10\n`;
  analysis += `  Prompts ที่มีประสิทธิภาพสูง (7+): ${effectivePrompts.length}/${storyData.aiPrompts.length}\n`;

  if (effectivePrompts.length > 0) {
    analysis += `\n🌟 **Prompts ที่แนะนำ:**\n`;
    effectivePrompts.slice(0, 3).forEach((prompt: any, index: number) => {
      const shortPrompt = prompt.prompt.length > 100 ? 
        prompt.prompt.substring(0, 100) + "..." : 
        prompt.prompt;
      analysis += `${index + 1}. [${prompt.type}] ${shortPrompt} (${prompt.effectiveness}/10)\n`;
    });
  }

  return analysis;
}

function generateAIPromptSuggestions(storyData: any): string {
  let suggestions = "";
  
  if (storyData.aiPrompts.length === 0) {
    suggestions += "🤖 **AI Prompts:** สร้างฐานข้อมูล prompts เพื่อเก็บเทคนิคที่ได้ผล\n";
    suggestions += "📝 **แนะนำประเภท prompts:**\n";
    suggestions += "  - Character Development: สำหรับพัฒนาตัวละคร\n";
    suggestions += "  - Scene Writing: สำหรับเขียนฉากต่างๆ\n";
    suggestions += "  - World Building: สำหรับขยายโลก Ashval\n";
    suggestions += "  - Dialogue: สำหรับบทสนทนา\n";
    return suggestions;
  }

  const averageEffectiveness = storyData.aiPrompts.length > 0 ? storyData.aiPrompts.reduce((sum: number, p: any) => sum + (p.effectiveness || 0), 0) / storyData.aiPrompts.length : 0;
  
  if (averageEffectiveness < 6) {
    suggestions += "📈 **AI Prompts:** ปรับปรุงคุณภาพ prompts โดยเพิ่มรายละเอียดและบริบท\n";
  }

  const promptTypes = new Set(storyData.aiPrompts.map((p: any) => p.type));
  if (promptTypes.size < 4) {
    suggestions += "🎯 **AI Prompts:** เพิ่มความหลากหลายของประเภท prompts\n";
  }

  const lowEffectivePrompts = storyData.aiPrompts.filter((p: any) => p.effectiveness < 5);
  if (lowEffectivePrompts.length > 0) {
    suggestions += `⚡ **AI Prompts:** ปรับปรุง ${lowEffectivePrompts.length} prompts ที่มีประสิทธิภาพต่ำ\n`;
  }

  return suggestions;
}