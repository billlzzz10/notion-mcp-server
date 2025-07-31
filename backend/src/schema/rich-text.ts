import { z } from "zod";
import { ANNOTATIONS_SCHEMA } from "./annotations.js";
import { MENTION_REQUEST_SCHEMA } from "./mention.js";

export const RICH_TEXT_BASE_SCHEMA = z.object({
  plain_text: z.string().describe("Plain text content without formatting"),
  href: z.string().nullable().describe("URL for the link"),
  annotations: ANNOTATIONS_SCHEMA.describe("Text formatting annotations"),
});

export const RICH_TEXT_BASE_REQUEST_SCHEMA = z.object({
  annotations: ANNOTATIONS_SCHEMA.optional().describe(
    "Text formatting annotations"
  ),
});

export const TEXT_CONTENT_REQUEST_SCHEMA = z
  .object({
    content: z.string().describe("The actual text content"),
    link: z
      .object({
        url: z.string().url().describe("URL for the link"),
      })
      .optional()
      .nullable()
      .describe("Optional link associated with the text"),
  })
  .describe("Text content request object");

export const EQUATION_CONTENT_SCHEMA = z
  .object({
    expression: z.string().describe("LaTeX equation expression"),
  })
  .describe("Equation content object");

export const TEXT_RICH_TEXT_ITEM_REQUEST_SCHEMA = z
  .object({
    type: z.literal("text").describe("Type of rich text content"),
    text: TEXT_CONTENT_REQUEST_SCHEMA.describe("Text content"),
    annotations: ANNOTATIONS_SCHEMA.optional().describe(
      "Text formatting annotations"
    ),
    plain_text: z
      .string()
      .optional()
      .describe("Plain text content without formatting"),
    href: z.string().nullable().optional().describe("URL for the link"),
  })
  .describe("Text rich text item request");

export const EQUATION_RICH_TEXT_ITEM_REQUEST_SCHEMA = z
  .object({
    type: z.literal("equation").describe("Type of equation content"),
    equation: EQUATION_CONTENT_SCHEMA.describe("Equation content"),
    annotations: ANNOTATIONS_SCHEMA.optional().describe(
      "Text formatting annotations"
    ),
    plain_text: z
      .string()
      .optional()
      .describe("Plain text content without formatting"),
    href: z.string().nullable().optional().describe("URL for the link"),
  })
  .describe("Equation rich text item request");

export const MENTION_RICH_TEXT_ITEM_REQUEST_SCHEMA = z
  .object({
    type: z.literal("mention").describe("Type of mention content"),
    mention: MENTION_REQUEST_SCHEMA.describe("Mention content"),
    annotations: ANNOTATIONS_SCHEMA.optional().describe(
      "Text formatting annotations"
    ),
    plain_text: z
      .string()
      .optional()
      .describe("Plain text content without formatting"),
    href: z.string().nullable().optional().describe("URL for the link"),
  })
  .describe("Mention rich text item request");

export const RICH_TEXT_ITEM_REQUEST_SCHEMA = z
  .discriminatedUnion("type", [
    TEXT_RICH_TEXT_ITEM_REQUEST_SCHEMA,
    EQUATION_RICH_TEXT_ITEM_REQUEST_SCHEMA,
    MENTION_RICH_TEXT_ITEM_REQUEST_SCHEMA,
  ])
  .describe("Union of all possible rich text item request types");
