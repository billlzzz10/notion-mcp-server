import { z } from "zod";
import { getRootPageId } from "../services/notion.js";
import { ICON_SCHEMA } from "./icon.js";
import { TEXT_BLOCK_REQUEST_SCHEMA } from "./blocks.js";
import { preprocessJson } from "./preprocess.js";
import { TEXT_CONTENT_REQUEST_SCHEMA } from "./rich-text.js";
import { FILE_SCHEMA } from "./file.js";
import {
  CHECKBOX_PROPERTY_VALUE_SCHEMA,
  DATE_PROPERTY_VALUE_SCHEMA,
  EMAIL_PROPERTY_VALUE_SCHEMA,
  FILES_PROPERTY_VALUE_SCHEMA,
  NUMBER_PROPERTY_VALUE_SCHEMA,
  PEOPLE_PROPERTY_VALUE_SCHEMA,
  PHONE_NUMBER_PROPERTY_VALUE_SCHEMA,
  RELATION_PROPERTY_VALUE_SCHEMA,
  RICH_TEXT_PROPERTY_VALUE_SCHEMA,
  SELECT_PROPERTY_VALUE_SCHEMA,
  STATUS_PROPERTY_VALUE_SCHEMA,
} from "./page-properties.js";

export const TITLE_PROPERTY_SCHEMA = z.object({
  title: z
    .array(
      z.object({
        text: TEXT_CONTENT_REQUEST_SCHEMA.describe(
          "Text content for title segment"
        ),
      })
    )
    .describe("Array of text segments that make up the title"),
});

export const PARENT_SCHEMA = z.preprocess(
  (val) => (typeof val === "string" ? JSON.parse(val) : val),
  z.union([
    z.object({
      type: z.literal("page_id").describe("Parent type for page"),
      page_id: z.string().describe("ID of the parent page"),
    }),
    z.object({
      type: z.literal("database_id").describe("Parent type for database"),
      database_id: z.string().describe("ID of the parent database"),
    }),
  ])
);

export const CREATE_PAGE_SCHEMA = {
  parent: PARENT_SCHEMA.optional()
    .default({
      type: "page_id",
      page_id: getRootPageId(),
    })
    .describe(
      "Optional parent - if not provided, will use NOTION_PAGE_ID as parent page"
    ),
  properties: z
    .record(
      z.string().describe("Property name"),
      z.union([
        TITLE_PROPERTY_SCHEMA,
        CHECKBOX_PROPERTY_VALUE_SCHEMA,
        EMAIL_PROPERTY_VALUE_SCHEMA,
        STATUS_PROPERTY_VALUE_SCHEMA,
        FILES_PROPERTY_VALUE_SCHEMA,
        DATE_PROPERTY_VALUE_SCHEMA,
        PEOPLE_PROPERTY_VALUE_SCHEMA,
        PHONE_NUMBER_PROPERTY_VALUE_SCHEMA,
        RELATION_PROPERTY_VALUE_SCHEMA,
        RICH_TEXT_PROPERTY_VALUE_SCHEMA,
        SELECT_PROPERTY_VALUE_SCHEMA,
        NUMBER_PROPERTY_VALUE_SCHEMA,
      ])
    )
    .describe("Properties of the page"),
  children: z
    .array(TEXT_BLOCK_REQUEST_SCHEMA)
    .optional()
    .describe("Optional array of paragraph blocks to add as page content"),
  icon: z.preprocess(
    preprocessJson,
    ICON_SCHEMA.nullable().optional().describe("Optional icon for the page")
  ),
  cover: z.preprocess(
    preprocessJson,
    FILE_SCHEMA.nullable()
      .optional()
      .describe("Optional cover image for the page")
  ),
};

export const ARCHIVE_PAGE_SCHEMA = {
  pageId: z.string().describe("The ID of the page to archive"),
};

export const RESTORE_PAGE_SCHEMA = {
  pageId: z.string().describe("The ID of the page to restore"),
};

export const UPDATE_PAGE_PROPERTIES_SCHEMA = {
  pageId: z.string().describe("The ID of the page to restore"),
  properties: z
    .record(
      z.string().describe("Property name"),
      z.union([
        TITLE_PROPERTY_SCHEMA,
        CHECKBOX_PROPERTY_VALUE_SCHEMA,
        EMAIL_PROPERTY_VALUE_SCHEMA,
        STATUS_PROPERTY_VALUE_SCHEMA,
        FILES_PROPERTY_VALUE_SCHEMA,
        DATE_PROPERTY_VALUE_SCHEMA,
        PEOPLE_PROPERTY_VALUE_SCHEMA,
        PHONE_NUMBER_PROPERTY_VALUE_SCHEMA,
        RELATION_PROPERTY_VALUE_SCHEMA,
        RICH_TEXT_PROPERTY_VALUE_SCHEMA,
        SELECT_PROPERTY_VALUE_SCHEMA,
        NUMBER_PROPERTY_VALUE_SCHEMA,
      ])
    )
    .describe("Properties of the page"),
};

export const SEARCH_PAGES_SCHEMA = {
  query: z.string().optional().describe("Search query for filtering by title"),
  sort: z
    .object({
      direction: z.enum(["ascending", "descending"]),
      timestamp: z.literal("last_edited_time"),
    })
    .optional()
    .describe("Sort order for results"),
  start_cursor: z.string().optional().describe("Cursor for pagination"),
  page_size: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .describe("Number of results to return (1-100)"),
};

// Combined schema for all page operations
export const PAGES_OPERATION_SCHEMA = {
  payload: z
    .preprocess(
      preprocessJson,
      z.discriminatedUnion("action", [
        z.object({
          action: z
            .literal("create_page")
            .describe("Use this action to create a new page in the database."),
          params: z.object(CREATE_PAGE_SCHEMA),
        }),
        z.object({
          action: z
            .literal("archive_page")
            .describe(
              "Use this action to archive an existing page, making it inactive."
            ),
          params: z.object(ARCHIVE_PAGE_SCHEMA),
        }),
        z.object({
          action: z
            .literal("restore_page")
            .describe("Use this action to restore a previously archived page."),
          params: z.object(RESTORE_PAGE_SCHEMA),
        }),
        z.object({
          action: z
            .literal("search_pages")
            .describe("Use this action to search for pages based on a query."),
          params: z.object(SEARCH_PAGES_SCHEMA),
        }),
        z.object({
          action: z
            .literal("update_page_properties")
            .describe(
              "Use this action to update the properties of an existing page."
            ),
          params: z.object(UPDATE_PAGE_PROPERTIES_SCHEMA),
        }),
      ])
    )
    .describe(
      "A union of all possible page operations. Each operation has a specific action and corresponding parameters. Use this schema to validate the input for page operations such as creating, archiving, restoring, searching, and updating pages. Available actions include: 'create_page', 'archive_page', 'restore_page', 'search_pages', and 'update_page_properties'. Each operation requires specific parameters as defined in the corresponding schemas."
    ),
};
