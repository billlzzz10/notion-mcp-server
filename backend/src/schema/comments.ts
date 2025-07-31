import { z } from "zod";
import { RICH_TEXT_ITEM_REQUEST_SCHEMA } from "./rich-text.js";
import { preprocessJson } from "./preprocess.js";
// Schema for getting comments
export const GET_COMMENTS_SCHEMA = {
  block_id: z
    .string()
    .describe("The ID of the block or page to get comments from"),
  start_cursor: z
    .string()
    .optional()
    .describe("The cursor to start from for pagination"),
  page_size: z
    .number()
    .optional()
    .describe("Number of comments to return per page"),
};

// Schema for adding a comment to a page
export const ADD_PAGE_COMMENT_SCHEMA = {
  parent: z.object({
    page_id: z.string().describe("The ID of the page to add the comment to"),
  }),
  rich_text: z
    .array(RICH_TEXT_ITEM_REQUEST_SCHEMA)
    .describe("Rich text content for the comment"),
};

// Schema for adding a comment to a discussion
export const ADD_DISCUSSION_COMMENT_SCHEMA = {
  discussion_id: z
    .string()
    .describe("The ID of the discussion to add the comment to"),
  rich_text: z
    .array(RICH_TEXT_ITEM_REQUEST_SCHEMA)
    .describe("Rich text content for the comment"),
};

// Combined schema for all comment operations
export const COMMENTS_OPERATION_SCHEMA = {
  payload: z
    .preprocess(
      preprocessJson,
      z.discriminatedUnion("action", [
        z.object({
          action: z
            .literal("get_comments")
            .describe("Use this action to get comments from a block or page."),
          params: z.object(GET_COMMENTS_SCHEMA),
        }),
        z.object({
          action: z
            .literal("add_page_comment")
            .describe("Use this action to add a comment to a page."),
          params: z.object(ADD_PAGE_COMMENT_SCHEMA),
        }),
        z.object({
          action: z
            .literal("add_discussion_comment")
            .describe("Use this action to add a comment to a discussion."),
          params: z.object(ADD_DISCUSSION_COMMENT_SCHEMA),
        }),
      ])
    )
    .describe(
      "A union of all possible comment operations. Each operation has a specific action and corresponding parameters. Use this schema to validate the input for comment operations such as getting, adding to page, and adding to discussion. Available actions include: 'get_comments', 'add_page_comment', and 'add_discussion_comment'. Each operation requires specific parameters as defined in the corresponding schemas."
    ),
};
