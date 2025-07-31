import { Client } from "@notionhq/client";

export function getApiToken(): string {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    console.error("Error: NOTION_TOKEN environment variable is required");
    process.exit(1);
  }
  return token;
}

export function getRootPageId(): string {
  const pageId = process.env.NOTION_PAGE_ID;
  if (!pageId) {
    console.error("Error: NOTION_PAGE_ID environment variable is required");
    process.exit(1);
  }
  return pageId;
}

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});
