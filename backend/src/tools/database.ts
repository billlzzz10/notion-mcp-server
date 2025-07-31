import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { handleNotionError } from "../utils/error.js";
import { DatabaseOperationParams } from "../types/database.js";
import { createDatabase } from "./createDatabase.js";
import { queryDatabase } from "./queryDatabase.js";
import { updateDatabase } from "./updateDatabase.js";

export const registerDatabaseOperationTool = async (
  params: DatabaseOperationParams
): Promise<CallToolResult> => {
  switch (params.payload.action) {
    case "create_database":
      return createDatabase(params.payload.params);
    case "query_database":
      return queryDatabase(params.payload.params);
    case "update_database":
      return updateDatabase(params.payload.params);
    default:
      return handleNotionError(
        new Error(
          `Unsupported action, use one of the following: "create_database", "query_database", "update_database"`
        )
      );
  }
};
