import { notion } from "../services/notion.js";

// Cache สำหรับเก็บ schema ของแต่ละ database
const schemaCache = new Map();

// ดึง schema จาก Notion และสร้าง mapping
export async function getDatabaseSchema(databaseId: string): Promise<any> {
  if (schemaCache.has(databaseId)) {
    return schemaCache.get(databaseId);
  }

  try {
    const database = await notion.databases.retrieve({ database_id: databaseId });
    const schema = {
      id: databaseId,
      title: (database as any).title?.[0]?.plain_text || 'Untitled',
      properties: {},
      propertyMapping: {}
    };

    // สร้าง mapping สำหรับแต่ละ property
    Object.entries((database as any).properties).forEach(([key, prop]: [string, any]) => {
      (schema as any).properties[key] = {
        name: key,
        type: prop.type,
        config: (prop as any)[prop.type] || {}
      };

      // สร้าง mapping ชื่อภาษาอังกฤษเพื่อใช้ในโค้ด
      const englishKey = convertToEnglishKey(key);
      (schema as any).propertyMapping[englishKey] = key;
    });

    schemaCache.set(databaseId, schema);
    return schema;
  } catch (error) {
    console.error(`Error fetching schema for database ${databaseId}:`, error);
    throw error;
  }
}

// แปลงชื่อ property เป็นภาษาอังกฤษเพื่อใช้ในโค้ด
function convertToEnglishKey(thaiName: string): string {
  const mapping = {
    'ชื่อตัวละคร': 'character_name',
    'ประวัติย่อ': 'biography',
    'อายุ': 'age',
    'บุคลิก/นิสัย': 'personality',
    'สถานะ': 'status',
    'บทบาท': 'role',
    'สปีชีส์ / เผ่า': 'species',
    'ระดับมานา': 'mana_level',
    'Scene': 'scenes',
    'ชื่อฉาก': 'scene_title',
    'เนื้อหาฉาก': 'scene_content',
    'จำนวนคำ': 'word_count',
    'ประเภทฉาก': 'scene_type',
    'ตัวละครที่ปรากฏ': 'characters',
    'location': 'location',
    'Related Scene': 'related_scenes'
  };

  return (mapping as any)[thaiName] || thaiName.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

// สร้างข้อมูลสำหรับ Notion API ตาม schema
export function buildNotionData(schema: any, data: any): any {
  const notionData = {};

  Object.entries(data).forEach(([englishKey, value]) => {
    const thaiPropertyName = schema.propertyMapping[englishKey];
    if (!thaiPropertyName) return;

    const property = schema.properties[thaiPropertyName];
    if (!property) return;

    // แปลงข้อมูลตาม property type
    (notionData as any)[thaiPropertyName] = convertValueByType(value, property.type);
  });

  return notionData;
}

// แปลงค่าตาม property type
function convertValueByType(value: any, type: string): any {
  switch (type) {
    case 'title':
      return { title: [{ text: { content: String(value) } }] };
    case 'rich_text':
      return { rich_text: [{ text: { content: String(value) } }] };
    case 'number':
      return { number: Number(value) };
    case 'select':
      return { select: { name: String(value) } };
    case 'multi_select':
      const options = Array.isArray(value) ? value : [value];
      return { multi_select: options.map(opt => ({ name: String(opt) })) };
    case 'relation':
      const relations = Array.isArray(value) ? value : [value];
      return { relation: relations.map(id => ({ id: String(id) })) };
    case 'date':
      return { date: { start: value } };
    case 'checkbox':
      return { checkbox: Boolean(value) };
    default:
      return { rich_text: [{ text: { content: String(value) } }] };
  }
}

// ดึงข้อมูลจาก Notion และแปลงเป็นรูปแบบที่อ่านง่าย
export function parseNotionData(notionPage: any, schema: any): any {
  const parsed = {};

  Object.entries(schema.propertyMapping).forEach(([englishKey, thaiPropertyName]) => {
    const property = notionPage.properties[thaiPropertyName as keyof typeof notionPage.properties];
    if (!property) return;

    (parsed as any)[englishKey] = parseValueByType(property);
  });

  return parsed;
}

// แปลงค่าจาก Notion เป็นรูปแบบที่อ่านง่าย
function parseValueByType(property: any): any {
  switch (property.type) {
    case 'title':
      return property.title?.[0]?.plain_text || '';
    case 'rich_text':
      return property.rich_text?.map((t: any) => t.plain_text).join('') || '';
    case 'number':
      return property.number || 0;
    case 'select':
      return property.select?.name || '';
    case 'multi_select':
      return property.multi_select?.map((opt: any) => opt.name) || [];
    case 'relation':
      return property.relation?.map((rel: any) => rel.id) || [];
    case 'date':
      return property.date?.start || '';
    case 'checkbox':
      return property.checkbox || false;
    default:
      return '';
  }
}

// ล้าง cache (ใช้เมื่อ schema เปลี่ยน)
export function clearSchemaCache() {
  schemaCache.clear();
}
