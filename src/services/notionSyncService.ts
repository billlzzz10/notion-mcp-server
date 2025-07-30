import { notion } from "./notion.js";
import type { GetDatabaseResponse } from "@notionhq/client";
import { Client, APIResponseError } from "@notionhq/client";
import type { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";

// Function to get the schema of a Notion database
export async function getDatabaseSchema(databaseId: string): Promise<GetDatabaseResponse> {
  try {
    const response = await notion.databases.retrieve({ database_id: databaseId });
    return response;
  } catch (error: any) {
    console.error(`Error retrieving database schema for ID ${databaseId}:`, error.body || error.message);
    throw error;
  }
}

// Function to map data to the Notion schema to create a valid payload
export async function mapDataToNotionSchema(databaseId: string, dataToMap: Record<string, any>): Promise<Record<string, any>> {
  const schema = await getDatabaseSchema(databaseId);
  const properties = schema.properties;
  const payload: Record<string, any> = {};

  for (const key in dataToMap) {
    if (properties[key]) {
      const propType = properties[key].type;
      const value = dataToMap[key];

      switch (propType) {
        case "title":
          payload[key] = { title: [{ text: { content: String(value) } }] };
          break;
        case "rich_text":
          payload[key] = { rich_text: [{ text: { content: String(value) } }] };
          break;
        case "number":
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            payload[key] = { number: numValue };
          }
          break;
        case "select":
          if (typeof value === 'string' && value) {
            payload[key] = { select: { name: value } };
          }
          break;
        case "multi_select":
          if (Array.isArray(value)) {
            payload[key] = { multi_select: value.map(item => ({ name: String(item) })) };
          }
          break;
        case "date":
          try {
            payload[key] = { date: { start: new Date(value).toISOString() } };
          } catch (e) {
            // ignore invalid date
          }
          break;
        case "checkbox":
          payload[key] = { checkbox: Boolean(value) };
          break;
        case "url":
          payload[key] = { url: String(value) };
          break;
        case "email":
          payload[key] = { email: String(value) };
          break;
        // Add other property types as needed
        default:
          console.warn(`Unsupported property type "${propType}" for key "${key}". Skipping.`);
      }
    }
  }

  return payload;
}

async function getDatabase(): Promise<DatabaseObjectResponse> {
  // ...your code to fetch the database...
}