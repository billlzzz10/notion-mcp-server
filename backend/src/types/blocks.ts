import { z } from "zod";
import {
  APPEND_BLOCK_CHILDREN_SCHEMA,
  RETRIEVE_BLOCK_SCHEMA,
  RETRIEVE_BLOCK_CHILDREN_SCHEMA,
  UPDATE_BLOCK_SCHEMA,
  DELETE_BLOCK_SCHEMA,
  BATCH_APPEND_BLOCK_CHILDREN_SCHEMA,
  BATCH_UPDATE_BLOCKS_SCHEMA,
  BATCH_DELETE_BLOCKS_SCHEMA,
  BATCH_MIXED_OPERATIONS_SCHEMA,
  BLOCKS_OPERATION_SCHEMA,
} from "../schema/blocks.js";

export const appendBlockChildrenSchema = z.object(APPEND_BLOCK_CHILDREN_SCHEMA);
export type AppendBlockChildrenParams = z.infer<
  typeof appendBlockChildrenSchema
>;

export const retrieveBlockSchema = z.object(RETRIEVE_BLOCK_SCHEMA);
export type RetrieveBlockParams = z.infer<typeof retrieveBlockSchema>;

export const retrieveBlockChildrenSchema = z.object(
  RETRIEVE_BLOCK_CHILDREN_SCHEMA
);
export type RetrieveBlockChildrenParams = z.infer<
  typeof retrieveBlockChildrenSchema
>;

export const updateBlockSchema = z.object(UPDATE_BLOCK_SCHEMA);
export type UpdateBlockParams = z.infer<typeof updateBlockSchema>;

export const deleteBlockSchema = z.object(DELETE_BLOCK_SCHEMA);
export type DeleteBlockParams = z.infer<typeof deleteBlockSchema>;

export const batchAppendBlockChildrenSchema = z.object(
  BATCH_APPEND_BLOCK_CHILDREN_SCHEMA
);
export type BatchAppendBlockChildrenParams = z.infer<
  typeof batchAppendBlockChildrenSchema
>;

export const batchUpdateBlocksSchema = z.object(BATCH_UPDATE_BLOCKS_SCHEMA);
export type BatchUpdateBlocksParams = z.infer<typeof batchUpdateBlocksSchema>;

export const batchDeleteBlocksSchema = z.object(BATCH_DELETE_BLOCKS_SCHEMA);
export type BatchDeleteBlocksParams = z.infer<typeof batchDeleteBlocksSchema>;

export const batchMixedOperationsSchema = z.object(
  BATCH_MIXED_OPERATIONS_SCHEMA
);
export type BatchMixedOperationsParams = z.infer<
  typeof batchMixedOperationsSchema
>;

export const blocksOperationSchema = z.object(BLOCKS_OPERATION_SCHEMA);
export type BlocksOperationParams = z.infer<typeof blocksOperationSchema>;
