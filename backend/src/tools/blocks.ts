import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { handleNotionError } from "../utils/error.js";
import { BlocksOperationParams } from "../types/blocks.js";
import { appendBlockChildren } from "./appendBlockChildren.js";
import { retrieveBlock } from "./retrieveBlock.js";
import { retrieveBlockChildren } from "./retrieveBlockChildren.js";
import { updateBlock } from "./updateBlock.js";
import { deleteBlock } from "./deleteBlock.js";
import { batchAppendBlockChildren } from "./batchAppendBlockChildren.js";
import { batchUpdateBlocks } from "./batchUpdateBlocks.js";
import { batchDeleteBlocks } from "./batchDeleteBlocks.js";
import { batchMixedOperations } from "./batchMixedOperations.js";

export const registerBlocksOperationTool = async (
  params: BlocksOperationParams
): Promise<CallToolResult> => {
  switch (params.payload.action) {
    case "append_block_children":
      return appendBlockChildren(params.payload.params);
    case "retrieve_block":
      return retrieveBlock(params.payload.params);
    case "retrieve_block_children":
      return retrieveBlockChildren(params.payload.params);
    case "update_block":
      return updateBlock(params.payload.params);
    case "delete_block":
      return deleteBlock(params.payload.params);
    case "batch_append_block_children":
      return batchAppendBlockChildren(params.payload.params);
    case "batch_update_blocks":
      return batchUpdateBlocks(params.payload.params);
    case "batch_delete_blocks":
      return batchDeleteBlocks(params.payload.params);
    case "batch_mixed_operations":
      return batchMixedOperations(params.payload.params);
    default:
      return handleNotionError(
        new Error(
          `Unsupported action, use one of the following: "append_block_children", "retrieve_block", "retrieve_block_children", "update_block", "delete_block", "batch_append_block_children", "batch_update_blocks", "batch_delete_blocks", "batch_mixed_operations"`
        )
      );
  }
};
