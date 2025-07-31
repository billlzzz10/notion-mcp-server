import { z } from "zod";
import {
  GET_COMMENTS_SCHEMA,
  ADD_PAGE_COMMENT_SCHEMA,
  ADD_DISCUSSION_COMMENT_SCHEMA,
  COMMENTS_OPERATION_SCHEMA,
} from "../schema/comments.js";

// Types inferred from the schemas
export const getCommentsSchema = z.object(GET_COMMENTS_SCHEMA);
export type GetCommentsParams = z.infer<typeof getCommentsSchema>;

export const addPageCommentSchema = z.object(ADD_PAGE_COMMENT_SCHEMA);
export type AddPageCommentParams = z.infer<typeof addPageCommentSchema>;

export const addDiscussionCommentSchema = z.object(
  ADD_DISCUSSION_COMMENT_SCHEMA
);
export type AddDiscussionCommentParams = z.infer<
  typeof addDiscussionCommentSchema
>;

export const commentsOperationSchema = z.object(COMMENTS_OPERATION_SCHEMA);
export type CommentsOperationParams = z.infer<typeof commentsOperationSchema>;
