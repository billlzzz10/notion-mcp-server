// Configuration
export const CONFIG = {
  serverName: "notion-mcp-server",
  serverVersion: "1.0.1",
};

// Database IDs
export const DATABASE_IDS = {
  CHARACTERS: process.env.NOTION_CHARACTERS_DB_ID!,
  SCENES: process.env.NOTION_SCENES_DB_ID!,
  CHAPTERS: process.env.NOTION_CHAPTERS_DB_ID!,
  LOCATIONS: process.env.NOTION_ALL_LOCATION_DB_ID!,
  PROJECTS: process.env.NOTION_PROJECTS_DB_ID!,
};

// API Configuration
export const API_CONFIG = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN!,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
};
