import { notion } from "../services/notion.js";
import { AppendBlockChildrenParams } from "../types/blocks.js";
import { handleNotionError } from "../utils/error.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";

export const appendBlockChildren = async (
  params: AppendBlockChildrenParams
): Promise<CallToolResult> => {
  try {
    const response = await notion.blocks.children.append({
      block_id: params.blockId,
      children: params.children as BlockObjectRequest[],
    });

    return {
      content: [
        {
          type: "text",
          text: `Successfully appended ${params.children.length} block(s) to ${params.blockId}`,
        },
        {
          type: "text",
          text: `Block ID: ${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return handleNotionError(error);
  }
};
