import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { notion } from "../services/notion.js";

export const storyArcAnalyzerTool: Tool = {
  name: "analyze_story_arcs",
  description: "วิเคราะห์และติดตาม Story Arcs รวมถึงการพัฒนาตัวละคร",
  inputSchema: {
    type: "object",
    properties: {
      analysisType: {
        type: "string",
        enum: ["arc_progress", "character_development", "theme_consistency", "dependency_check"],
        description: "ประเภทการวิเคราะห์"
      },
      arcName: {
        type: "string",
        description: "ชื่อ Arc ที่ต้องการวิเคราะห์ (ถ้าต้องการเฉพาะ Arc)"
      },
      characterName: {
        type: "string", 
        description: "ชื่อตัวละครที่ต้องการวิเคราะห์ (สำหรับ character_development)"
      }
    },
    required: ["analysisType"]
  }
};

export async function handleStoryArcAnalysis(args: any) {
  const storyArcsDb = process.env.NOTION_STORY_ARCS_DB_ID;
  
  if (!storyArcsDb) {
    throw new Error("ไม่พบ NOTION_STORY_ARCS_DB_ID");
  }

  try {
    let analysisResult = "";

    switch (args.analysisType) {
      case "arc_progress":
        analysisResult = await analyzeArcProgress(storyArcsDb, args.arcName);
        break;
      case "character_development":
        analysisResult = await analyzeCharacterDevelopment(storyArcsDb, args.characterName);
        break;
      case "theme_consistency":
        analysisResult = await analyzeThemeConsistency(storyArcsDb);
        break;
      case "dependency_check":
        analysisResult = await analyzeDependencies(storyArcsDb);
        break;
    }

    return {
      content: [
        {
          type: "text",
          text: `📚 **การวิเคราะห์ Story Arcs:**\n\n${analysisResult}`
        }
      ]
    };

  } catch (error) {
    throw new Error(`ไม่สามารถวิเคราะห์ Story Arcs ได้: ${error}`);
  }
}

async function analyzeArcProgress(storyArcsDb: string, arcName?: string) {
  let filter: any = {};
  
  if (arcName) {
    filter = {
      property: "Arc Name",
      title: {
        contains: arcName
      }
    };
  }

  const dbResponse = await notion.databases.retrieve({ database_id: storyArcsDb });
  const dataSource = dbResponse.data_sources?.[0];
  if (!dataSource) {
    throw new Error(`No data source found for Story Arcs DB: ${storyArcsDb}`);
  }

  const response = await notion.dataSources.query({
    data_source_id: dataSource.id,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    sorts: [
      {
        property: "Start Chapter",
        direction: "ascending"
      }
    ]
  });

  let analysis = "📈 **ความคืบหน้า Story Arcs:**\n\n";

  const statusCounts = {
    "Planning": 0,
    "In Progress": 0, 
    "Completed": 0,
    "On Hold": 0
  };

  response.results.forEach((arc: any) => {
    const properties = arc.properties;
    const name = properties["Arc Name"]?.title?.[0]?.text?.content || "ไม่มีชื่อ";
    const status = properties["Status"]?.select?.name || "ไม่ระบุ";
    const startChapter = properties["Start Chapter"]?.number || 0;
    const endChapter = properties["End Chapter"]?.number || 0;
    const arcType = properties["Arc Type"]?.select?.name || "ไม่ระบุ";
    const priority = properties["Priority"]?.select?.name || "ไม่ระบุ";

    if (statusCounts.hasOwnProperty(status)) {
      (statusCounts as any)[status]++;
    }

    analysis += `**${name}** (${arcType})\n`;
    analysis += `  📊 สถานะ: ${status} | ระดับความสำคัญ: ${priority}\n`;
    analysis += `  📖 ตอนที่: ${startChapter}${endChapter > 0 ? ` - ${endChapter}` : " (ยังไม่กำหนด)"}\n`;
    
    if (status === "In Progress") {
      const progress = endChapter > 0 ? `${((startChapter / endChapter) * 100).toFixed(1)}%` : "ไม่สามารถคำนวณได้";
      analysis += `  ⏳ ความคืบหน้าโดยประมาณ: ${progress}\n`;
    }
    
    analysis += "\n";
  });

  analysis += "📊 **สรุปสถิติ:**\n";
  Object.entries(statusCounts).forEach(([status, count]) => {
    analysis += `• ${status}: ${count} arcs\n`;
  });

  return analysis;
}

async function analyzeCharacterDevelopment(storyArcsDb: string, characterName?: string) {
  const dbResponse = await notion.databases.retrieve({ database_id: storyArcsDb });
  const dataSource = dbResponse.data_sources?.[0];
  if (!dataSource) {
    throw new Error(`No data source found for Story Arcs DB: ${storyArcsDb}`);
  }

  const response = await notion.dataSources.query({
    data_source_id: dataSource.id,
    filter: {
      property: "Arc Type",
      select: {
        equals: "Character Arc"
      }
    },
    sorts: [
      {
        property: "Start Chapter",
        direction: "ascending"
      }
    ]
  });

  let analysis = "👥 **การพัฒนาตัวละคร:**\n\n";

  if (response.results.length === 0) {
    analysis += "ไม่พบ Character Arc ในระบบ";
    return analysis;
  }

  const characterArcs = new Map();

  response.results.forEach((arc: any) => {
    const properties = arc.properties;
    const arcName = properties["Arc Name"]?.title?.[0]?.text?.content || "ไม่มีชื่อ";
    const mainChars = properties["Main Characters"]?.relation || [];
    const characterGrowth = properties["Character Growth"]?.rich_text?.[0]?.text?.content || "";
    const startChapter = properties["Start Chapter"]?.number || 0;
    const endChapter = properties["End Chapter"]?.number || 0;
    const status = properties["Status"]?.select?.name || "ไม่ระบุ";

    mainChars.forEach((char: any) => {
      const charId = char.id;
      if (!characterArcs.has(charId)) {
        characterArcs.set(charId, []);
      }
      
      characterArcs.get(charId).push({
        arcName,
        characterGrowth,
        startChapter,
        endChapter,
        status
      });
    });
  });

  if (characterName) {
    analysis += `🎭 **การพัฒนาตัวละคร: ${characterName}**\n\n`;
  } else {
    analysis += `📋 **รายงานการพัฒนาตัวละครทั้งหมด:**\n\n`;
  }

  characterArcs.forEach((arcs, characterId) => {
    analysis += `**ตัวละคร ID: ${characterId}**\n`;
    
    arcs.sort((a: any, b: any) => a.startChapter - b.startChapter);
    
    arcs.forEach((arc: any, index: number) => {
      analysis += `  ${index + 1}. **${arc.arcName}** (ตอนที่ ${arc.startChapter}${arc.endChapter > 0 ? `-${arc.endChapter}` : ""})\n`;
      analysis += `     📈 สถานะ: ${arc.status}\n`;
      if (arc.characterGrowth) {
        analysis += `     🌱 การเปลี่ยนแปลง: ${arc.characterGrowth}\n`;
      }
      analysis += "\n";
    });
  });

  return analysis;
}

async function analyzeThemeConsistency(storyArcsDb: string) {
  const dbResponse = await notion.databases.retrieve({ database_id: storyArcsDb });
  const dataSource = dbResponse.data_sources?.[0];
  if (!dataSource) {
    throw new Error(`No data source found for Story Arcs DB: ${storyArcsDb}`);
  }

  const response = await notion.dataSources.query({
    data_source_id: dataSource.id
  });

  let analysis = "🎨 **ความสอดคล้องของธีม:**\n\n";

  const themeCounts = new Map();
  const themesByArcType = new Map();

  response.results.forEach((arc: any) => {
    const properties = arc.properties;
    const theme = properties["Theme"]?.select?.name || "ไม่ระบุ";
    const arcType = properties["Arc Type"]?.select?.name || "ไม่ระบุ";
    const arcName = properties["Arc Name"]?.title?.[0]?.text?.content || "ไม่มีชื่อ";

    themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1);
    
    if (!themesByArcType.has(arcType)) {
      themesByArcType.set(arcType, new Map());
    }
    const arcTypeThemes = themesByArcType.get(arcType);
    arcTypeThemes.set(theme, (arcTypeThemes.get(theme) || 0) + 1);
  });

  analysis += "📊 **การกระจายธีมโดยรวม:**\n";
  const sortedThemes = Array.from(themeCounts.entries()).sort((a, b) => b[1] - a[1]);
  
  sortedThemes.forEach(([theme, count]) => {
    const percentage = ((count / response.results.length) * 100).toFixed(1);
    analysis += `• ${theme}: ${count} arcs (${percentage}%)\n`;
  });

  analysis += "\n🎭 **ธีมตามประเภท Arc:**\n";
  themesByArcType.forEach((themes, arcType) => {
    analysis += `\n**${arcType}:**\n`;
    themes.forEach((count: any, theme: any) => {
      analysis += `  • ${theme}: ${count} arcs\n`;
    });
  });

  analysis += "\n💡 **คำแนะนำ:**\n";
  if (sortedThemes.length > 0) {
    const dominantTheme = sortedThemes[0];
    if (dominantTheme[1] > response.results.length * 0.4) {
      analysis += `⚠️ ธีม "${dominantTheme[0]}" มีสัดส่วนสูงเกินไป (${((dominantTheme[1] / response.results.length) * 100).toFixed(1)}%) ควรเพิ่มความหลากหลาย\n`;
    }
    
    if (sortedThemes.length < 3) {
      analysis += `💭 ควรเพิ่มธีมใหม่เพื่อความหลากหลายในการเล่าเรื่อง\n`;
    }
  }

  return analysis;
}

async function analyzeDependencies(storyArcsDb: string) {
  const dbResponse = await notion.databases.retrieve({ database_id: storyArcsDb });
  const dataSource = dbResponse.data_sources?.[0];
  if (!dataSource) {
    throw new Error(`No data source found for Story Arcs DB: ${storyArcsDb}`);
  }

  const response = await notion.dataSources.query({
    data_source_id: dataSource.id
  });

  let analysis = "🔗 **การวิเคราะห์ Dependencies:**\n\n";

  const dependencyMap = new Map();
  const arcNames = new Map();

  response.results.forEach((arc: any) => {
    const properties = arc.properties;
    const id = arc.id;
    const name = properties["Arc Name"]?.title?.[0]?.text?.content || "ไม่มีชื่อ";
    arcNames.set(id, name);
  });

  response.results.forEach((arc: any) => {
    const properties = arc.properties;
    const arcId = arc.id;
    const arcName = arcNames.get(arcId);
    const dependencies = properties["Dependencies"]?.relation || [];
    const startChapter = properties["Start Chapter"]?.number || 0;
    const status = properties["Status"]?.select?.name || "ไม่ระบุ";

    if (dependencies.length > 0) {
      dependencyMap.set(arcId, {
        name: arcName,
        startChapter,
        status,
        dependencies: dependencies.map((dep: any) => ({
          id: dep.id,
          name: arcNames.get(dep.id) || "ไม่ทราบชื่อ"
        }))
      });
    }
  });

  if (dependencyMap.size === 0) {
    analysis += "ไม่พบ Arc ที่มี dependencies";
    return analysis;
  }

  analysis += "📋 **รายการ Dependencies:**\n";
  dependencyMap.forEach((arcData, arcId) => {
    analysis += `\n**${arcData.name}** (สถานะ: ${arcData.status})\n`;
    analysis += `📖 เริ่มตอนที่: ${arcData.startChapter}\n`;
    analysis += `🔗 ขึ้นอยู่กับ:\n`;
    
    arcData.dependencies.forEach((dep: any) => {
      analysis += `  • ${dep.name}\n`;
    });
  });

  analysis += "\n⚠️ **การตรวจสอบปัญหา:**\n";
  let hasIssues = false;

  dependencyMap.forEach((arcData, arcId) => {
    const arc = response.results.find((a: any) => a.id === arcId) as any;
    const arcStartChapter = arc?.properties["Start Chapter"]?.number || 0;

    arcData.dependencies.forEach((dep: any) => {
      const depArc = response.results.find((a: any) => a.id === dep.id) as any;
      const depEndChapter = depArc?.properties["End Chapter"]?.number || 0;
      const depStatus = depArc?.properties["Status"]?.select?.name || "ไม่ระบุ";

      if (depEndChapter > 0 && arcStartChapter > 0 && depEndChapter >= arcStartChapter) {
        analysis += `🚨 **${arcData.name}** เริ่มตอนที่ ${arcStartChapter} แต่ **${dep.name}** จบตอนที่ ${depEndChapter}\n`;
        hasIssues = true;
      }

      if (arcData.status === "In Progress" && depStatus !== "Completed") {
        analysis += `⚠️ **${arcData.name}** กำลังดำเนินการแต่ **${dep.name}** ยังไม่เสร็จสิ้น\n`;
        hasIssues = true;
      }
    });
  });

  if (!hasIssues) {
    analysis += "✅ ไม่พบปัญหาใน dependencies";
  }

  return analysis;
}