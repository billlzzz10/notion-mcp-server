import { z } from "zod";

export const FILE_SCHEMA = z
  .object({
    external: z
      .object({
        url: z.string().url().describe("URL of the external file"),
      })
      .describe("External file source"),
    type: z.literal("external").describe("Type of file source"),
  })
  .describe("File schema");
