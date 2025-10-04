import { notion } from "../services/notion.js";
import { QueryDatabaseParams } from "../types/database.js";
import { handleNotionError } from "../utils/error.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const queryDatabase = async (
  params: QueryDatabaseParams
): Promise<CallToolResult> => {
  try {
    const { database_id, ...restOfParams } = params;

    if (!database_id) {
      throw new Error("database_id is required for querying.");
    }

    // Step 1: Retrieve the data source ID from the database ID.
    const dbResponse = await notion.databases.retrieve({ database_id });
    const dataSource = dbResponse.data_sources?.[0];

    if (!dataSource) {
      throw new Error(`No data source found for database ID: ${database_id}`);
    }

    // Step 2: Use the dedicated SDK v5 method to query the data source.
    const response = await notion.dataSources.query({
      data_source_id: dataSource.id,
      ...restOfParams,
    });

    return {
      content: [
        {
          type: "text",
          text: `Database queried successfully. Found ${response.results.length} results.`,
        },
        {
          type: "text",
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  } catch (error) {
    return handleNotionError(error);
  }
};
