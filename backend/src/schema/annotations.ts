import { z } from "zod";
import { COLOR_SCHEMA } from "./color.js";

export const ANNOTATIONS_SCHEMA = z
  .object({
    bold: z.boolean().optional().describe("Whether text is bold"),
    italic: z.boolean().optional().describe("Whether text is italic"),
    strikethrough: z
      .boolean()
      .optional()
      .describe("Whether text has strikethrough"),
    underline: z.boolean().optional().describe("Whether text is underlined"),
    code: z.boolean().optional().describe("Whether text is code formatted"),
    color: COLOR_SCHEMA.optional().describe("Color of the text"),
  })
  .describe("Text formatting annotations");
