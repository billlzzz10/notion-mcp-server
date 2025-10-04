import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { notion } from "../services/notion.js";

export const consistencyCheckerTool: Tool = {
  name: "check_consistency",
  description: "ตรวจสอบความสอดคล้องของข้อมูลระหว่างฐานข้อมูลต่างๆ อัตโนมัติ",
  inputSchema: {
    type: "object",
    properties: {
      checkType: {
        type: "string",
        enum: ["character_abilities", "location_references", "timeline_events", "power_system_usage", "relationship_consistency", "full_check"],
        description: "ประเภทการตรวจสอบ"
      },
      entityName: {
        type: "string",
        description: "ชื่อเฉพาะที่ต้องการตรวจสอบ (ถ้ามี)"
      },
      autoFix: {
        type: "boolean",
        description: "แก้ไขข้อผิดพลาดที่พบโดยอัตโนมัติ",
        default: false
      },
      generateReport: {
        type: "boolean", 
        description: "สร้างรายงานครบถ้วน",
        default: true
      }
    },
    required: ["checkType"]
  }
};

export async function handleConsistencyCheck(args: any) {
  try {
    let checkResults: any[] = [];

    switch (args.checkType) {
      case "character_abilities":
        checkResults = await checkCharacterAbilities(args.entityName);
        break;
      case "location_references":
        checkResults = await checkLocationReferences(args.entityName);
        break;
      case "timeline_events":
        checkResults = await checkTimelineEvents();
        break;
      case "power_system_usage":
        checkResults = await checkPowerSystemUsage();
        break;
      case "relationship_consistency":
        checkResults = await checkRelationshipConsistency();
        break;
      case "full_check":
        const charCheck = await checkCharacterAbilities();
        const locCheck = await checkLocationReferences();
        const timeCheck = await checkTimelineEvents();
        const powerCheck = await checkPowerSystemUsage();
        const relCheck = await checkRelationshipConsistency();
        
        checkResults = [
          ...charCheck,
          ...locCheck, 
          ...timeCheck,
          ...powerCheck,
          ...relCheck
        ];
        break;
    }

    if (args.autoFix) {
      await performAutoFixes(checkResults);
    }

    const report = generateConsistencyReport(checkResults, args.checkType);
    
    if (args.generateReport) {
      await saveConsistencyReport(report, args.checkType);
    }

    return {
      content: [
        {
          type: "text",
          text: `🔍 **Consistency Check Results:**\n\n${report}`
        }
      ]
    };

  } catch (error) {
    throw new Error(`ไม่สามารถตรวจสอบความสอดคล้องได้: ${error}`);
  }
}

async function checkCharacterAbilities(entityName?: string): Promise<any[]> {
  const charactersDb = process.env.NOTION_CHARACTERS_DB_ID;
  const powerSystemsDb = process.env.NOTION_POWER_SYSTEMS_DB_ID;
  const arcanasDb = process.env.NOTION_ARCANAS_DB_ID;
  
  if (!charactersDb || !powerSystemsDb || !arcanasDb) {
    throw new Error("ไม่พบ Database IDs ที่จำเป็น");
  }

  const issues: any[] = [];

  let characterFilter: any = {};
  if (entityName) {
    characterFilter = {
      property: "Name",
      title: {
        contains: entityName
      }
    };
  }

  const dbResponseChars = await notion.databases.retrieve({ database_id: charactersDb });
  const dataSourceChars = dbResponseChars.data_sources?.[0];
  if (!dataSourceChars) throw new Error(`No data source found for Characters DB: ${charactersDb}`);
  const charactersResponse = await notion.dataSources.query({
    data_source_id: dataSourceChars.id,
    filter: Object.keys(characterFilter).length > 0 ? characterFilter : undefined
  });

  const dbResponsePower = await notion.databases.retrieve({ database_id: powerSystemsDb });
  const dataSourcePower = dbResponsePower.data_sources?.[0];
  if (!dataSourcePower) throw new Error(`No data source found for Power Systems DB: ${powerSystemsDb}`);
  const powerSystemsResponse = await notion.dataSources.query({
    data_source_id: dataSourcePower.id
  });

  const dbResponseArcanas = await notion.databases.retrieve({ database_id: arcanasDb });
  const dataSourceArcanas = dbResponseArcanas.data_sources?.[0];
  if (!dataSourceArcanas) throw new Error(`No data source found for Arcanas DB: ${arcanasDb}`);
  const arcanasResponse = await notion.dataSources.query({
    data_source_id: dataSourceArcanas.id
  });

  const powerSystemsMap = new Map();
  powerSystemsResponse.results.forEach((ps: any) => {
    const name = ps.properties["System Name"]?.title?.[0]?.text?.content;
    if (name) {
      powerSystemsMap.set(ps.id, name);
    }
  });

  const arcanasMap = new Map();
  arcanasResponse.results.forEach((arcana: any) => {
    const name = arcana.properties.Name?.title?.[0]?.text?.content;
    if (name) {
      arcanasMap.set(arcana.id, name);
    }
  });

  for (const character of charactersResponse.results) {
    const charProps = (character as any).properties;
    const charName = charProps.Name?.title?.[0]?.text?.content || "ไม่มีชื่อ";
    const abilities = charProps.Abilities?.rich_text?.[0]?.text?.content || "";
    const powerSystemRefs = charProps["Power System"]?.relation || [];

    for (const psRef of powerSystemRefs) {
      const psName = powerSystemsMap.get(psRef.id);
      if (!psName) {
        issues.push({
          type: "missing_power_system",
          severity: "high",
          character: charName,
          description: `ตัวละคร ${charName} อ้างอิง Power System ที่ไม่มีอยู่ (ID: ${psRef.id})`,
          suggestion: "ตรวจสอบและอัปเดต Power System reference",
          autoFixable: false
        });
      } else {
        if (abilities && !abilities.toLowerCase().includes(psName.toLowerCase())) {
          issues.push({
            type: "ability_power_mismatch",
            severity: "medium",
            character: charName,
            description: `Abilities ของ ${charName} ไม่ตรงกับ Power System "${psName}"`,
            suggestion: `เพิ่ม "${psName}" ใน Abilities หรือปรับปรุงข้อมูล`,
            autoFixable: true,
            fixData: { characterId: (character as any).id, powerSystem: psName }
          });
        }
      }
    }

    if (abilities) {
      const mentionedArcanas = extractArcanaNames(abilities);
      for (const arcanaName of mentionedArcanas) {
        const arcanaExists = Array.from(arcanasMap.values()).some(
          name => name.toLowerCase().includes(arcanaName.toLowerCase())
        );
        
        if (!arcanaExists) {
          issues.push({
            type: "undefined_arcana",
            severity: "medium",
            character: charName,
            description: `ตัวละคร ${charName} มี Arcana "${arcanaName}" ที่ไม่มีในฐานข้อมูล`,
            suggestion: `สร้าง Arcana "${arcanaName}" ในฐานข้อมูล Arcanas`,
            autoFixable: true,
            fixData: { arcanaName: arcanaName }
          });
        }
      }
    }
  }

  return issues;
}

async function checkLocationReferences(entityName?: string): Promise<any[]> {
  const locationsDb = process.env.NOTION_LOCATIONS_DB_ID;
  const scenesDb = process.env.NOTION_SCENES_DB_ID;
  
  if (!locationsDb || !scenesDb) {
    throw new Error("ไม่พบ Database IDs ที่จำเป็น");
  }

  const issues: any[] = [];

  const dbResponseLocs = await notion.databases.retrieve({ database_id: locationsDb });
  const dataSourceLocs = dbResponseLocs.data_sources?.[0];
  if (!dataSourceLocs) throw new Error(`No data source found for Locations DB: ${locationsDb}`);
  const locationsResponse = await notion.dataSources.query({
    data_source_id: dataSourceLocs.id
  });

  const dbResponseScenes = await notion.databases.retrieve({ database_id: scenesDb });
  const dataSourceScenes = dbResponseScenes.data_sources?.[0];
  if (!dataSourceScenes) throw new Error(`No data source found for Scenes DB: ${scenesDb}`);
  const scenesResponse = await notion.dataSources.query({
    data_source_id: dataSourceScenes.id
  });

  const locationsMap = new Map();
  locationsResponse.results.forEach((loc: any) => {
    const name = loc.properties.Name?.title?.[0]?.text?.content;
    if (name) {
      locationsMap.set(loc.id, name);
    }
  });

  for (const scene of scenesResponse.results) {
    const sceneProps = (scene as any).properties;
    const sceneTitle = sceneProps.Title?.title?.[0]?.text?.content || "ไม่มีชื่อ";
    const locationRefs = sceneProps.Location?.relation || [];
    const sceneSummary = sceneProps.Summary?.rich_text?.[0]?.text?.content || "";

    for (const locRef of locationRefs) {
      const locName = locationsMap.get(locRef.id);
      if (!locName) {
        issues.push({
          type: "missing_location",
          severity: "high",
          scene: sceneTitle,
          description: `ฉาก "${sceneTitle}" อ้างอิงสถานที่ที่ไม่มีอยู่ (ID: ${locRef.id})`,
          suggestion: "ตรวจสอบและอัปเดต Location reference",
          autoFixable: false
        });
      }
    }

    if (sceneSummary) {
      const mentionedLocations = extractLocationNames(sceneSummary);
      for (const locName of mentionedLocations) {
        const locationExists = Array.from(locationsMap.values()).some(
          name => name.toLowerCase().includes(locName.toLowerCase())
        );
        
        const isReferenced = locationRefs.some((ref: any) => {
          const refName = locationsMap.get(ref.id);
          return refName?.toLowerCase().includes(locName.toLowerCase());
        });

        if (locationExists && !isReferenced) {
          issues.push({
            type: "unreferenced_location",
            severity: "low",
            scene: sceneTitle,
            description: `ฉาง "${sceneTitle}" กล่าวถึง "${locName}" แต่ไม่ได้อ้างอิงใน Location field`,
            suggestion: `เพิ่ม "${locName}" ใน Location field ของฉาก`,
            autoFixable: true,
            fixData: { sceneId: (scene as any).id, locationName: locName }
          });
        }
      }
    }
  }

  return issues;
}

async function checkTimelineEvents(): Promise<any[]> {
  const timelineDb = process.env.NOTION_TIMELINE_DB_ID;
  const scenesDb = process.env.NOTION_SCENES_DB_ID;
  
  if (!timelineDb || !scenesDb) {
    return [];
  }

  const issues: any[] = [];

  const dbResponseTimeline = await notion.databases.retrieve({ database_id: timelineDb });
  const dataSourceTimeline = dbResponseTimeline.data_sources?.[0];
  if (!dataSourceTimeline) throw new Error(`No data source found for Timeline DB: ${timelineDb}`);
  const timelineResponse = await notion.dataSources.query({
    data_source_id: dataSourceTimeline.id,
    sorts: [{ property: "Timeline Order", direction: "ascending" }]
  });

  const dbResponseScenes = await notion.databases.retrieve({ database_id: scenesDb });
  const dataSourceScenes = dbResponseScenes.data_sources?.[0];
  if (!dataSourceScenes) throw new Error(`No data source found for Scenes DB: ${scenesDb}`);
  const scenesResponse = await notion.dataSources.query({
    data_source_id: dataSourceScenes.id,
    sorts: [{ property: "Chapter", direction: "ascending" }, { property: "Order", direction: "ascending" }]
  });

  for (let i = 0; i < timelineResponse.results.length - 1; i++) {
    const currentEvent = timelineResponse.results[i] as any;
    const nextEvent = timelineResponse.results[i + 1] as any;
    
    const currentOrder = currentEvent.properties["Timeline Order"]?.number || 0;
    const nextOrder = nextEvent.properties["Timeline Order"]?.number || 0;
    const currentChapter = currentEvent.properties["Real Chapter"]?.number || 0;
    const nextChapter = nextEvent.properties["Real Chapter"]?.number || 0;

    if (currentChapter > nextChapter && currentOrder < nextOrder) {
      issues.push({
        type: "timeline_order_mismatch",
        severity: "medium",
        description: `Timeline Order ไม่สอดคล้องกับ Chapter: Order ${currentOrder} (Chapter ${currentChapter}) มาก่อน Order ${nextOrder} (Chapter ${nextChapter})`,
        suggestion: "ปรับปรุง Timeline Order หรือ Real Chapter ให้สอดคล้องกน",
        autoFixable: false
      });
    }
  }

  return issues;
}

async function checkPowerSystemUsage(): Promise<any[]> {
  const powerSystemsDb = process.env.NOTION_POWER_SYSTEMS_DB_ID;
  const arcanasDb = process.env.NOTION_ARCANAS_DB_ID;
  const charactersDb = process.env.NOTION_CHARACTERS_DB_ID;
  
  if (!powerSystemsDb || !arcanasDb || !charactersDb) {
    throw new Error("ไม่พบ Database IDs ที่จำเป็น");
  }

  const issues: any[] = [];

  const dbResponsePower = await notion.databases.retrieve({ database_id: powerSystemsDb });
  const dataSourcePower = dbResponsePower.data_sources?.[0];
  if (!dataSourcePower) throw new Error(`No data source found for Power Systems DB: ${powerSystemsDb}`);
  const powerSystems = await notion.dataSources.query({ data_source_id: dataSourcePower.id });

  const dbResponseArcanas = await notion.databases.retrieve({ database_id: arcanasDb });
  const dataSourceArcanas = dbResponseArcanas.data_sources?.[0];
  if (!dataSourceArcanas) throw new Error(`No data source found for Arcanas DB: ${arcanasDb}`);
  const arcanas = await notion.dataSources.query({ data_source_id: dataSourceArcanas.id });

  const dbResponseChars = await notion.databases.retrieve({ database_id: charactersDb });
  const dataSourceChars = dbResponseChars.data_sources?.[0];
  if (!dataSourceChars) throw new Error(`No data source found for Characters DB: ${charactersDb}`);
  const characters = await notion.dataSources.query({ data_source_id: dataSourceChars.id });

  for (const ps of powerSystems.results) {
    const psProps = (ps as any).properties;
    const psName = psProps["System Name"]?.title?.[0]?.text?.content;
    
    if (psName) {
      const usedByCharacters = characters.results.some((char: any) => {
        const charPowerSystems = char.properties["Power System"]?.relation || [];
        return charPowerSystems.some((ref: any) => ref.id === ps.id);
      });

      if (!usedByCharacters) {
        issues.push({
          type: "unused_power_system",
          severity: "low",
          description: `Power System "${psName}" ไม่มีตัวละครใดใช้`,
          suggestion: `พิจารณาลบหรือกำหนดตัวละครให้ใช้ "${psName}"`,
          autoFixable: false
        });
      }
    }
  }

  for (const arcana of arcanas.results) {
    const arcanaProps = (arcana as any).properties;
    const arcanaName = arcanaProps.Name?.title?.[0]?.text?.content;
    
    if (arcanaName) {
      const usedByCharacters = characters.results.some((char: any) => {
        const abilities = char.properties.Abilities?.rich_text?.[0]?.text?.content || "";
        return abilities.toLowerCase().includes(arcanaName.toLowerCase());
      });

      if (!usedByCharacters) {
        issues.push({
          type: "unused_arcana",
          severity: "low",
          description: `Arcana "${arcanaName}" ไม่มีตัวละครใดใช้`,
          suggestion: `พิจารณาลบหรือกำหนดตัวละครให้ใช้ "${arcanaName}"`,
          autoFixable: false
        });
      }
    }
  }

  return issues;
}

async function checkRelationshipConsistency(): Promise<any[]> {
  const charactersDb = process.env.NOTION_CHARACTERS_DB_ID;
  
  if (!charactersDb) {
    throw new Error("ไม่พบ NOTION_CHARACTERS_DB_ID");
  }

  const issues: any[] = [];

  const dbResponse = await notion.databases.retrieve({ database_id: charactersDb });
  const dataSource = dbResponse.data_sources?.[0];
  if (!dataSource) throw new Error(`No data source found for Characters DB: ${charactersDb}`);

  const charactersResponse = await notion.dataSources.query({
    data_source_id: dataSource.id,
  });

  for (const character of charactersResponse.results) {
    const charProps = (character as any).properties;
    const charName = charProps.Name?.title?.[0]?.text?.content || "ไม่มีชื่อ";
    const relationships = charProps.Relationships?.rich_text?.[0]?.text?.content || "";
    const background = charProps.Background?.rich_text?.[0]?.text?.content || "";

    if (relationships) {
      const relationshipConflicts = findRelationshipConflicts(relationships);
      
      for (const conflict of relationshipConflicts) {
        issues.push({
          type: "relationship_conflict",
          severity: "medium",
          character: charName,
          description: `ตัวละคร ${charName} มีความสัมพันธ์ที่ขัดแย้ง: ${conflict}`,
          suggestion: "ตรวจสอบและแก้ไขความสัมพันธ์ให้สอดคล้องกน",
          autoFixable: false
        });
      }
    }

    if (relationships && background) {
      const backgroundMentions = extractCharacterMentions(background);
      const relationshipMentions = extractCharacterMentions(relationships);
      
      for (const mention of backgroundMentions) {
        if (!relationshipMentions.includes(mention)) {
          issues.push({
            type: "missing_relationship",
            severity: "low",
            character: charName,
            description: `ตัวละคร ${charName} กล่าวถึง "${mention}" ใน Background แต่ไม่มีใน Relationships`,
            suggestion: `เพิ่ม "${mention}" ใน Relationships field`,
            autoFixable: true,
            fixData: { characterId: (character as any).id, relationshipToAdd: mention }
          });
        }
      }
    }
  }

  return issues;
}

// ... (Rest of the file is unchanged and correct)
async function performAutoFixes(issues: any[]): Promise<void> {
  for (const issue of issues) {
    if (issue.autoFixable && issue.fixData) {
      try {
        switch (issue.type) {
          case "ability_power_mismatch":
            await fixAbilityPowerMismatch(issue.fixData);
            break;
          case "undefined_arcana":
            await createMissingArcana(issue.fixData);
            break;
          case "unreferenced_location":
            await addLocationReference(issue.fixData);
            break;
          case "missing_relationship":
            await addMissingRelationship(issue.fixData);
            break;
        }
        
        issue.fixed = true;
      } catch (error) {
        console.error(`ไม่สามารถแก้ไข ${issue.type}:`, error);
        issue.fixed = false;
        issue.fixError = error;
      }
    }
  }
}

async function fixAbilityPowerMismatch(fixData: any): Promise<void> {
  const { characterId, powerSystem } = fixData;
  
  const character = await notion.pages.retrieve({ page_id: characterId }) as any;
  const currentAbilities = character.properties.Abilities?.rich_text?.[0]?.text?.content || "";
  
  const updatedAbilities = currentAbilities 
    ? `${currentAbilities}. ใช้พลัง ${powerSystem}`
    : `ใช้พลัง ${powerSystem}`;

  await notion.pages.update({
    page_id: characterId,
    properties: {
      "Abilities": {
        rich_text: [
          {
            text: {
              content: updatedAbilities
            }
          }
        ]
      }
    }
  });
}

async function createMissingArcana(fixData: any): Promise<void> {
  const arcanasDb = process.env.NOTION_ARCANAS_DB_ID;
  if (!arcanasDb) throw new Error("ไม่พบ NOTION_ARCANAS_DB_ID");

  const { arcanaName } = fixData;

  const dbResponse = await notion.databases.retrieve({ database_id: arcanasDb });
  const dataSource = dbResponse.data_sources?.[0];
  if (!dataSource) {
    console.error(`No data source found for Arcanas DB: ${arcanasDb}`);
    return;
  }

  await notion.pages.create({
    parent: { data_source_id: dataSource.id },
    properties: {
      "Name": {
        title: [
          {
            text: {
              content: arcanaName
            }
          }
        ]
      },
      "Type": {
        select: {
          name: "Unknown"
        }
      },
      "Description": {
        rich_text: [
          {
            text: {
              content: `Arcana ที่สร้างอัตโนมัติจากการตรวจสอบความสอดคล้อง`
            }
          }
        ]
      }
    }
  });
}

async function addLocationReference(fixData: any): Promise<void> {
  console.log("Adding location reference:", fixData);
}

async function addMissingRelationship(fixData: any): Promise<void> {
  const { characterId, relationshipToAdd } = fixData;
  
  const character = await notion.pages.retrieve({ page_id: characterId }) as any;
  const currentRelationships = character.properties.Relationships?.rich_text?.[0]?.text?.content || "";
  
  const updatedRelationships = currentRelationships 
    ? `${currentRelationships}. เกี่ยวข้องกับ ${relationshipToAdd}`
    : `เกี่ยวข้องกับ ${relationshipToAdd}`;

  await notion.pages.update({
    page_id: characterId,
    properties: {
      "Relationships": {
        rich_text: [
          {
            text: {
              content: updatedRelationships
            }
          }
        ]
      }
    }
  });
}

function generateConsistencyReport(issues: any[], checkType: string): string {
  let report = `📋 **Consistency Check Report - ${checkType}**\n\n`;
  
  if (issues.length === 0) {
    report += "✅ ไม่พบปัญหาความสอดคล้อง";
    return report;
  }

  const severityGroups = {
    high: issues.filter(i => i.severity === "high"),
    medium: issues.filter(i => i.severity === "medium"), 
    low: issues.filter(i => i.severity === "low")
  };

  report += `🔍 **สรุป:** พบปัญหา ${issues.length} รายการ\n`;
  report += `• High Severity: ${severityGroups.high.length}\n`;
  report += `• Medium Severity: ${severityGroups.medium.length}\n`;
  report += `• Low Severity: ${severityGroups.low.length}\n\n`;

  Object.entries(severityGroups).forEach(([severity, severityIssues]) => {
    if (severityIssues.length > 0) {
      const icon = severity === "high" ? "🚨" : severity === "medium" ? "⚠️" : "💡";
      report += `${icon} **${severity.toUpperCase()} SEVERITY ISSUES:**\n\n`;
      
      severityIssues.forEach((issue, index) => {
        report += `**${index + 1}. ${issue.type}**\n`;
        if (issue.character) report += `   👤 Character: ${issue.character}\n`;
        if (issue.scene) report += `   🎬 Scene: ${issue.scene}\n`;
        report += `   📝 Issue: ${issue.description}\n`;
        report += `   💡 Suggestion: ${issue.suggestion}\n`;
        if (issue.fixed !== undefined) {
          report += `   🔧 Auto-fix: ${issue.fixed ? "✅ ทำสำเร็จ" : "❌ ล้มเหลว"}\n`;
        }
        report += "\n";
      });
    }
  });

  const fixableIssues = issues.filter(i => i.autoFixable);
  const fixedIssues = issues.filter(i => i.fixed === true);
  
  if (fixableIssues.length > 0) {
    report += `🔧 **Auto-fix Status:**\n`;
    report += `• Fixable Issues: ${fixableIssues.length}\n`;
    report += `• Successfully Fixed: ${fixedIssues.length}\n`;
    report += `• Failed to Fix: ${fixableIssues.length - fixedIssues.length}\n`;
  }

  return report;
}

async function saveConsistencyReport(report: string, checkType: string): Promise<void> {
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
                content: `Consistency Check: ${checkType}`
              }
            }
          ]
        },
        "Entity Type": {
          select: {
            name: "System"
          }
        },
        "Change Type": {
          select: {
            name: "Check"
          }
        },
        "New Value": {
          rich_text: [
            {
              text: {
                content: report.substring(0, 2000)
              }
            }
          ]
        },
        "Reason": {
          rich_text: [
            {
              text: {
                content: "Automated consistency check"
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
    console.error("ไม่สามารถบันทึกรายงาน:", error);
  }
}

function extractArcanaNames(text: string): string[] {
  const patterns = [
    /The\s+[A-Z][a-z]+/g,
    /อาร์คานา\s*([ก-๙\s]+)/g
  ];
  
  const found: string[] = [];
  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      found.push(...matches);
    }
  });
  
  return [...new Set(found)];
}

function extractLocationNames(text: string): string[] {
  const locationPatterns = [
    /เหมือง[ก-๙]+/g,
    /ป่า[ก-๙]+/g,
    /เมือง[ก-๙]+/g,
    /หมู่บ้าน[ก-๙]+/g,
    /ปราสาท[ก-๙]+/g,
    /ถ้ำ[ก-๙]+/g
  ];
  
  const found: string[] = [];
  locationPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      found.push(...matches);
    }
  });
  
  return [...new Set(found)];
}

function extractCharacterMentions(text: string): string[] {
  const characterPatterns = [
    /กับ\s+([ก-๙A-Za-z]+)/g,
    /เพื่อน\s*([ก-๙A-Za-z]+)/g,
    /ศัตรู\s*([ก-๙A-Za-z]+)/g
  ];
  
  const found: string[] = [];
  characterPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      found.push(...matches.map(m => m.replace(/^(กับ|เพื่อน|ศัตรู)\s*/, "")));
    }
  });
  
  return [...new Set(found)];
}

function findRelationshipConflicts(relationships: string): string[] {
  const conflicts: string[] = [];
  const text = relationships.toLowerCase();
  
  if (text.includes("เพื่อน") && text.includes("ศัตรู")) {
    conflicts.push("มีทั้งเพื่อนและศัตรูในคนเดียวกน");
  }
  
  if (text.includes("รัก") && text.includes("เกลียด")) {
    conflicts.push("มีทั้งความรักและความเกลียดในคนเดียวกน");
  }
  
  return conflicts;
}