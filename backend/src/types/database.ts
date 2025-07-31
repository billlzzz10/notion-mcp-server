import { z } from "zod";
import {
  CREATE_DATABASE_SCHEMA,
  QUERY_DATABASE_SCHEMA,
  UPDATE_DATABASE_SCHEMA,
  DATABASE_OPERATION_SCHEMA,
} from "../schema/database.js";

export const createDatabaseSchema = z.object(CREATE_DATABASE_SCHEMA);
export type CreateDatabaseParams = z.infer<typeof createDatabaseSchema>;

export const queryDatabaseSchema = z.object(QUERY_DATABASE_SCHEMA);
export type QueryDatabaseParams = z.infer<typeof queryDatabaseSchema>;

export const updateDatabaseSchema = z.object(UPDATE_DATABASE_SCHEMA);
export type UpdateDatabaseParams = z.infer<typeof updateDatabaseSchema>;

export const databaseOperationSchema = z.object(DATABASE_OPERATION_SCHEMA);
export type DatabaseOperationParams = z.infer<typeof databaseOperationSchema>;
