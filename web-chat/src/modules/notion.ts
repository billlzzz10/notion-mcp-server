// === 🏰 Notion Integration ===
import { settings } from './settings.js';
import { DatabaseSchema, NotionPageResult } from '../types/index.js';
import { generateSummary, calculateSimilarity, evaluateImprovement } from './ai.js';

export async function notionFetch(endpoint: string, options: any = {}) {
    const url = `https://api.notion.com/v1/${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${settings.notionToken}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Notion API Error: ${response.status} - ${error}`);
    }

    return response.json();
}

export async function detectDatabaseSchema(databaseId: string): Promise<DatabaseSchema> {
    const database = await notionFetch(`databases/${databaseId}`);
    const properties = database.properties;
    
    const detectedFields = {
        nameField: 'Name',
        statusField: '',
        priorityField: '',
        descriptionField: '',
        dateFields: [] as string[],
        selectFields: [] as string[],
        multiSelectFields: [] as string[],
        textFields: [] as string[]
    };

    Object.entries(properties).forEach(([key, prop]: [string, any]) => {
        const lowerKey = key.toLowerCase();
        
        if (prop.type === 'title') {
            detectedFields.nameField = key;
        } else if (prop.type === 'select') {
            detectedFields.selectFields.push(key);
            if (lowerKey.includes('status') || lowerKey.includes('สถานะ')) {
                detectedFields.statusField = key;
            } else if (lowerKey.includes('priority') || lowerKey.includes('ความสำคัญ')) {
                detectedFields.priorityField = key;
            }
        } else if (prop.type === 'multi_select') {
            detectedFields.multiSelectFields.push(key);
        } else if (prop.type === 'rich_text') {
            detectedFields.textFields.push(key);
            if (lowerKey.includes('description') || lowerKey.includes('รายละเอียด')) {
                detectedFields.descriptionField = key;
            }
        } else if (prop.type === 'date') {
            detectedFields.dateFields.push(key);
        }
    });

    // Fallbacks
    if (!detectedFields.statusField && detectedFields.selectFields.length > 0) {
        detectedFields.statusField = detectedFields.selectFields[0];
    }
    if (!detectedFields.priorityField && detectedFields.selectFields.length > 1) {
        detectedFields.priorityField = detectedFields.selectFields[1];
    }
    if (!detectedFields.descriptionField && detectedFields.textFields.length > 0) {
        detectedFields.descriptionField = detectedFields.textFields[0];
    }

    return { detectedFields };
}

export function createDynamicProperties(schema: DatabaseSchema, data: any) {
    const properties: any = {};
    const fields = schema.detectedFields;

    if (data.name && fields.nameField) {
        properties[fields.nameField] = {
            title: [{ text: { content: data.name } }]
        };
    }

    if (data.status && fields.statusField) {
        properties[fields.statusField] = {
            select: { name: data.status }
        };
    }

    if (data.priority && fields.priorityField) {
        properties[fields.priorityField] = {
            select: { name: data.priority }
        };
    }

    if (data.description && fields.descriptionField) {
        properties[fields.descriptionField] = {
            rich_text: [{ text: { content: data.description } }]
        };
    }

    return properties;
}

export async function createProject(args: any): Promise<NotionPageResult> {
    if (!settings.projectsDbId) {
        return {
            success: false,
            error: "Projects Database ID ไม่ได้ตั้งค่า"
        };
    }

    try {
        const schema = await detectDatabaseSchema(settings.projectsDbId);
        const properties = createDynamicProperties(schema, args);

        const result = await notionFetch('pages', {
            method: 'POST',
            body: JSON.stringify({
                parent: { database_id: settings.projectsDbId },
                properties
            })
        });

        return {
            success: true,
            taskId: result.id,
            message: `✅ สร้างโปรเจกต์ "${args.name}" เรียบร้อยแล้ว`,
            task: result,
            detectedSchema: schema.detectedFields
        };
        
    } catch (error: any) {
        return {
            success: false,
            error: `❌ เกิดข้อผิดพลาด: ${error?.message}`,
            suggestion: "ลองตรวจสอบ Projects Database ID หรือ Notion Token"
        };
    }
}

export async function createTask(args: any): Promise<NotionPageResult> {
    if (!settings.tasksDbId) {
        return {
            success: false,
            error: "Tasks Database ID ไม่ได้ตั้งค่า"
        };
    }

    try {
        const schema = await detectDatabaseSchema(settings.tasksDbId);
        const properties = createDynamicProperties(schema, args);

        const result = await notionFetch('pages', {
            method: 'POST',
            body: JSON.stringify({
                parent: { database_id: settings.tasksDbId },
                properties
            })
        });

        return {
            success: true,
            taskId: result.id,
            message: `✅ สร้างงาน "${args.name}" เรียบร้อยแล้ว`,
            task: result,
            detectedSchema: schema.detectedFields
        };
        
    } catch (error: any) {
        return {
            success: false,
            error: `❌ เกิดข้อผิดพลาด: ${error?.message}`,
            suggestion: "ลองตรวจสอบชื่อคอลัมน์ใน Notion Database หรือรีเฟรช schema"
        };
    }
}

export async function summarizeAndSaveToMCP(args: any) {
    if (!settings.projectsDbId) {
        throw new Error("Projects Database ID ไม่ได้ตั้งค่า");
    }

    try {
        const summary = await generateSummary(args.content);
        const projectData = {
            name: args.title || 'สรุปไอเดียจากแชท',
            description: summary,
            status: 'Not started',
            priority: args.priority || 'Medium'
        };

        return await createProject(projectData);
    } catch (error: any) {
        return {
            success: false,
            error: `❌ ไม่สามารถสรุปและบันทึกได้: ${error?.message}`
        };
    }
}
