import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { notion } from "../services/notion.js";

export const trackVersionTool: Tool = {
  name: "track_version",
  description: "บันทึกการเปลี่ยนแปลงในฐานข้อมูล Version History",
  inputSchema: {
    type: "object",
    properties: {
      entityType: {
        type: "string",
        enum: ["Character", "Scene", "Location", "World", "Power System", "Arcana", "Mission", "AI Prompt"],
        description: "ประเภทของข้อมูลที่เปลี่ยนแปลง"
      },
      entityName: {
        type: "string",
        description: "ชื่อของข้อมูลที่เปลี่ยนแปลง"
      },
      changeType: {
        type: "string",
        enum: ["Create", "Update", "Delete", "Merge", "Split"],
        description: "ประเภทการเปลี่ยนแปลง"
      },
      oldValue: {
        type: "string",
        description: "ข้อมูลเดิม (ถ้ามี)"
      },
      newValue: {
        type: "string",
        description: "ข้อมูลใหม่"
      },
      reason: {
        type: "string",
        description: "เหตุผลในการเปลี่ยนแปลง"
      },
      aiGenerated: {
        type: "boolean",
        description: "สร้างโดย AI หรือไม่",
        default: false
      }
    },
    required: ["entityType", "entityName", "changeType", "newValue", "reason"]
  }
};

export async function handleTrackVersion(args: any) {
  const versionHistoryDb = process.env.NOTION_VERSION_HISTORY_DB_ID;
  
  if (!versionHistoryDb) {
    throw new Error("ไม่พบ NOTION_VERSION_HISTORY_DB_ID ใน environment variables");
  }

  try {
    const response = await notion.pages.create({
      parent: { database_id: versionHistoryDb },
      properties: {
        "Title": {
          title: [
            {
              text: {
                content: `${args.changeType}: ${args.entityName}`
              }
            }
          ]
        },
        "Entity Type": {
          select: {
            name: args.entityType
          }
        },
        "Entity Name": {
          rich_text: [
            {
              text: {
                content: args.entityName
              }
            }
          ]
        },
        "Change Type": {
          select: {
            name: args.changeType
          }
        },
        "Old Value": {
          rich_text: [
            {
              text: {
                content: args.oldValue || ""
              }
            }
          ]
        },
        "New Value": {
          rich_text: [
            {
              text: {
                content: args.newValue
              }
            }
          ]
        },
        "Timestamp": {
          date: {
            start: new Date().toISOString()
          }
        },
        "Reason": {
          rich_text: [
            {
              text: {
                content: args.reason
              }
            }
          ]
        },
        "AI Generated": {
          checkbox: args.aiGenerated || false
        }
      }
    });

    return {
      content: [
        {
          type: "text",
          text: `บันทึกการเปลี่ยนแปลงสำเร็จ: ${args.changeType} - ${args.entityName}`
        }
      ]
    };
  } catch (error) {
    throw new Error(`ไม่สามารถบันทึกการเปลี่ยนแปลงได้: ${error}`);
  }
}
