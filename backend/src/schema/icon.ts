import { EmojiRequest } from "../types/emoji.js";
import { z } from "zod";

export const ICON_SCHEMA = z.object({
  emoji: z
    .string()
    .refine(
      (value) => /(\p{Emoji}\uFE0F|\p{Emoji_Presentation})/gu.test(value),
      {
        message: "Invalid emoji",
      }
    )
    .transform((value) => value as EmojiRequest),
  type: z.literal("emoji"),
});
