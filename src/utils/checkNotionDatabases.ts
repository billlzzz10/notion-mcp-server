import { notion } from "../services/notion.js";
import dotenv from "dotenv";

dotenv.config();

// ดึง database id ทั้งหมดจาก process.env ที่ลงท้ายด้วย _DB_ID
function getDatabaseIdsFromEnv() {
  return Object.entries(process.env)
    .filter(([key]) => key.endsWith("_DB_ID"))
    .map(([_, value]) => value)
    .filter(Boolean);
}

// ดึง schema ของแต่ละ database
export async function checkAllNotionDatabases() {
  const dbIds = getDatabaseIdsFromEnv();
  if (dbIds.length === 0) {
    console.warn("No Notion database IDs found in .env");
    return;
  }
  for (const dbId of dbIds) {
    if (!dbId) continue; // Skip undefined values
    try {
      const db = await notion.databases.retrieve({ database_id: dbId });
      // Fix: Use proper property access for database name
      const dbName = 'title' in db && Array.isArray(db.title) ? db.title[0]?.plain_text : 'Unknown';
      console.log(`✅ Database ${dbName || dbId} found.`);
    } catch (err) {
      console.error(`❌ Database ID ${dbId} not found or inaccessible.`);
    }
  }
}

// เรียกใช้ฟังก์ชันถ้ารันไฟล์นี้โดยตรง
if (import.meta.url === `file://${process.argv[1]}`) {
  checkAllNotionDatabases().catch(console.error);
}
