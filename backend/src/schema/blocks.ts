import { z } from "zod";
import { COLOR_SCHEMA } from "./color.js";
import { ICON_SCHEMA } from "./icon.js";
import { RICH_TEXT_ITEM_REQUEST_SCHEMA } from "./rich-text.js";
import { preprocessJson } from "./preprocess.js";
import { LANGUAGE_SCHEMA } from "./lang.js";
import { FILE_SCHEMA } from "./file.js";

export const BASE_BLOCK_REQUEST_SCHEMA = z.object({
  type: z.string().describe("Type of block"),
  object: z.literal("block").optional().describe("Object type identifier"),
  created_time: z
    .string()
    .optional()
    .describe("ISO timestamp of block creation"),
  last_edited_time: z
    .string()
    .optional()
    .describe("ISO timestamp of last edit"),
  has_children: z
    .boolean()
    .optional()
    .describe("Whether block has child blocks"),
  archived: z.boolean().optional().describe("Whether block is archived"),
});

export const TEXT_BLOCK_BASE_REQUEST_SCHEMA = z.object({
  rich_text: z
    .array(RICH_TEXT_ITEM_REQUEST_SCHEMA)
    .describe("Array of rich text content"),
  color: COLOR_SCHEMA.optional().describe("Color of the block"),
});

export const PARAGRAPH_BLOCK_REQUEST_SCHEMA = BASE_BLOCK_REQUEST_SCHEMA.extend({
  type: z.literal("paragraph").describe("Paragraph block type"),
  paragraph: TEXT_BLOCK_BASE_REQUEST_SCHEMA.describe("Paragraph block content"),
});

export const HEADING1_BLOCK_REQUEST_SCHEMA = BASE_BLOCK_REQUEST_SCHEMA.extend({
  type: z.literal("heading_1").describe("Heading 1 block type"),
  heading_1: TEXT_BLOCK_BASE_REQUEST_SCHEMA.extend({
    is_toggleable: z
      .boolean()
      .optional()
      .describe("Whether heading can be toggled"),
  }).describe("Heading 1 block content"),
});

export const HEADING2_BLOCK_REQUEST_SCHEMA = BASE_BLOCK_REQUEST_SCHEMA.extend({
  type: z.literal("heading_2").describe("Heading 2 block type"),
  heading_2: TEXT_BLOCK_BASE_REQUEST_SCHEMA.extend({
    is_toggleable: z
      .boolean()
      .optional()
      .describe("Whether heading can be toggled"),
  }).describe("Heading 2 block content"),
});

export const HEADING3_BLOCK_REQUEST_SCHEMA = BASE_BLOCK_REQUEST_SCHEMA.extend({
  type: z.literal("heading_3").describe("Heading 3 block type"),
  heading_3: TEXT_BLOCK_BASE_REQUEST_SCHEMA.extend({
    is_toggleable: z
      .boolean()
      .optional()
      .describe("Whether heading can be toggled"),
  }).describe("Heading 3 block content"),
});

export const QUOTE_BLOCK_REQUEST_SCHEMA = BASE_BLOCK_REQUEST_SCHEMA.extend({
  type: z.literal("quote").describe("Quote block type"),
  quote: TEXT_BLOCK_BASE_REQUEST_SCHEMA.describe("Quote block content"),
});

export const CALLOUT_BLOCK_REQUEST_SCHEMA = BASE_BLOCK_REQUEST_SCHEMA.extend({
  type: z.literal("callout").describe("Callout block type"),
  callout: TEXT_BLOCK_BASE_REQUEST_SCHEMA.extend({
    icon: ICON_SCHEMA.optional().describe("Icon for the callout"),
  }).describe("Callout block content"),
});

export const TOGGLE_BLOCK_REQUEST_SCHEMA = BASE_BLOCK_REQUEST_SCHEMA.extend({
  type: z.literal("toggle").describe("Toggle block type"),
  toggle: TEXT_BLOCK_BASE_REQUEST_SCHEMA.describe("Toggle block content"),
});

export const BULLETED_LIST_ITEM_BLOCK_REQUEST_SCHEMA =
  BASE_BLOCK_REQUEST_SCHEMA.extend({
    type: z
      .literal("bulleted_list_item")
      .describe("Bulleted list item block type"),
    bulleted_list_item: TEXT_BLOCK_BASE_REQUEST_SCHEMA.describe(
      "Bulleted list item block content"
    ),
  });

export const NUMBERED_LIST_ITEM_BLOCK_REQUEST_SCHEMA =
  BASE_BLOCK_REQUEST_SCHEMA.extend({
    type: z
      .literal("numbered_list_item")
      .describe("Numbered list item block type"),
    numbered_list_item: TEXT_BLOCK_BASE_REQUEST_SCHEMA.describe(
      "Numbered list item block content"
    ),
  });

export const TO_DO_BLOCK_REQUEST_SCHEMA = BASE_BLOCK_REQUEST_SCHEMA.extend({
  type: z.literal("to_do").describe("To-do block type"),
  to_do: TEXT_BLOCK_BASE_REQUEST_SCHEMA.extend({
    checked: z.boolean().optional().describe("Whether the to-do is checked"),
  }).describe("To-do block content"),
});

export const CODE_BLOCK_REQUEST_SCHEMA = BASE_BLOCK_REQUEST_SCHEMA.extend({
  type: z.literal("code").describe("Code block type"),
  code: TEXT_BLOCK_BASE_REQUEST_SCHEMA.extend({
    language: LANGUAGE_SCHEMA,
  }).describe("Code block content"),
});

export const DIVIDER_BLOCK_REQUEST_SCHEMA = BASE_BLOCK_REQUEST_SCHEMA.extend({
  type: z.literal("divider").describe("Divider block type"),
  divider: z.object({}).describe("Divider block content"),
});

export const IMAGE_BLOCK_REQUEST_SCHEMA = BASE_BLOCK_REQUEST_SCHEMA.extend({
  type: z.literal("image").describe("Image block type"),
  image: z
    .object({
      ...FILE_SCHEMA.shape,
      caption: z
        .array(RICH_TEXT_ITEM_REQUEST_SCHEMA)
        .optional()
        .describe("Image caption"),
    })
    .describe("Image block content"),
});

export const TEXT_BLOCK_REQUEST_SCHEMA = z.preprocess(
  preprocessJson,
  z
    .discriminatedUnion("type", [
      PARAGRAPH_BLOCK_REQUEST_SCHEMA,
      HEADING1_BLOCK_REQUEST_SCHEMA,
      HEADING2_BLOCK_REQUEST_SCHEMA,
      HEADING3_BLOCK_REQUEST_SCHEMA,
      QUOTE_BLOCK_REQUEST_SCHEMA,
      CALLOUT_BLOCK_REQUEST_SCHEMA,
      TOGGLE_BLOCK_REQUEST_SCHEMA,
      BULLETED_LIST_ITEM_BLOCK_REQUEST_SCHEMA,
      NUMBERED_LIST_ITEM_BLOCK_REQUEST_SCHEMA,
      TO_DO_BLOCK_REQUEST_SCHEMA,
      CODE_BLOCK_REQUEST_SCHEMA,
      DIVIDER_BLOCK_REQUEST_SCHEMA,
      IMAGE_BLOCK_REQUEST_SCHEMA,
    ])
    .describe("Union of all possible text block request types")
);

export const APPEND_BLOCK_CHILDREN_SCHEMA = {
  blockId: z.string().describe("The ID of the block to append children to"),
  children: z
    .array(TEXT_BLOCK_REQUEST_SCHEMA)
    .describe("Array of blocks to append as children"),
};

export const RETRIEVE_BLOCK_SCHEMA = {
  blockId: z.string().describe("The ID of the block to retrieve"),
};

export const RETRIEVE_BLOCK_CHILDREN_SCHEMA = {
  blockId: z.string().describe("The ID of the block to retrieve children for"),
  start_cursor: z.string().optional().describe("Cursor for pagination"),
  page_size: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .describe("Number of results to return (1-100)"),
};

export const UPDATE_BLOCK_SCHEMA = {
  blockId: z.string().describe("The ID of the block to update"),
  data: TEXT_BLOCK_REQUEST_SCHEMA.describe("The block data to update"),
};

export const DELETE_BLOCK_SCHEMA = {
  blockId: z.string().describe("The ID of the block to delete/archive"),
};

// Batch operation schemas for multiple blocks

export const BATCH_APPEND_BLOCK_CHILDREN_SCHEMA = {
  operations: z
    .array(
      z.object({
        blockId: z
          .string()
          .describe("The ID of the block to append children to"),
        children: z
          .array(TEXT_BLOCK_REQUEST_SCHEMA)
          .describe("Array of blocks to append as children"),
      })
    )
    .describe("Array of append operations to perform in a single batch"),
};

export const BATCH_UPDATE_BLOCKS_SCHEMA = {
  operations: z
    .array(
      z.object({
        blockId: z.string().describe("The ID of the block to update"),
        data: TEXT_BLOCK_REQUEST_SCHEMA.describe("The block data to update"),
      })
    )
    .describe("Array of update operations to perform in a single batch"),
};

export const BATCH_DELETE_BLOCKS_SCHEMA = {
  blockIds: z
    .array(z.string().describe("The ID of a block to delete/archive"))
    .describe("Array of block IDs to delete in a single batch"),
};

// Schema for multi-operation batches (mixed operations)
export const BATCH_MIXED_OPERATIONS_SCHEMA = {
  operations: z
    .array(
      z.discriminatedUnion("operation", [
        z.object({
          operation: z.literal("append"),
          blockId: z
            .string()
            .describe("The ID of the block to append children to"),
          children: z
            .array(TEXT_BLOCK_REQUEST_SCHEMA)
            .describe("Array of blocks to append as children"),
        }),
        z.object({
          operation: z.literal("update"),
          blockId: z.string().describe("The ID of the block to update"),
          data: TEXT_BLOCK_REQUEST_SCHEMA.describe("The block data to update"),
        }),
        z.object({
          operation: z.literal("delete"),
          blockId: z.string().describe("The ID of the block to delete/archive"),
        }),
      ])
    )
    .describe("Array of mixed operations to perform in a single batch"),
};

// Combined schema for all block operations
export const BLOCKS_OPERATION_SCHEMA = {
  payload: z
    .preprocess(
      preprocessJson,
      z.discriminatedUnion("action", [
        z.object({
          action: z
            .literal("append_block_children")
            .describe("Use this action to append children to a block."),
          params: z.object(APPEND_BLOCK_CHILDREN_SCHEMA),
        }),
        z.object({
          action: z
            .literal("retrieve_block")
            .describe("Use this action to retrieve a block."),
          params: z.object(RETRIEVE_BLOCK_SCHEMA),
        }),
        z.object({
          action: z
            .literal("retrieve_block_children")
            .describe("Use this action to retrieve children of a block."),
          params: z.object(RETRIEVE_BLOCK_CHILDREN_SCHEMA),
        }),
        z.object({
          action: z
            .literal("update_block")
            .describe("Use this action to update a block."),
          params: z.object(UPDATE_BLOCK_SCHEMA),
        }),
        z.object({
          action: z
            .literal("delete_block")
            .describe("Use this action to delete/archive a block."),
          params: z.object(DELETE_BLOCK_SCHEMA),
        }),
        z.object({
          action: z
            .literal("batch_append_block_children")
            .describe(
              "Use this action to perform batch append operations on blocks."
            ),
          params: z.object(BATCH_APPEND_BLOCK_CHILDREN_SCHEMA),
        }),
        z.object({
          action: z
            .literal("batch_update_blocks")
            .describe(
              "Use this action to perform batch update operations on blocks."
            ),
          params: z.object(BATCH_UPDATE_BLOCKS_SCHEMA),
        }),
        z.object({
          action: z
            .literal("batch_delete_blocks")
            .describe(
              "Use this action to perform batch delete operations on blocks."
            ),
          params: z.object(BATCH_DELETE_BLOCKS_SCHEMA),
        }),
        z.object({
          action: z
            .literal("batch_mixed_operations")
            .describe(
              "Use this action to perform batch mixed operations on blocks."
            ),
          params: z.object(BATCH_MIXED_OPERATIONS_SCHEMA),
        }),
      ])
    )
    .describe(
      "A union of all possible block operations. Each operation has a specific action and corresponding parameters. Use this schema to validate the input for block operations such as appending, retrieving, updating, deleting, and performing batch operations. Available actions include: 'append_block_children', 'retrieve_block', 'retrieve_block_children', 'update_block', 'delete_block', 'batch_append_block_children', 'batch_update_blocks', 'batch_delete_blocks', and 'batch_mixed_operations'. Each operation requires specific parameters as defined in the corresponding schemas."
    ),
};
