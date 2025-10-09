import { Client } from "@notionhq/client";

export function getApiToken(): string {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    // Return a demo token for testing purposes
    return "demo_token_for_testing";
  }
  return token;
}

export function getRootPageId(): string {
  const pageId = process.env.NOTION_PAGE_ID;
  if (!pageId) {
    // Return a demo page ID for testing purposes
    return "demo_page_id_for_testing";
  }
  return pageId;
}

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  notionVersion: "2025-09-03",
});
