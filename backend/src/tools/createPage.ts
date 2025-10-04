import { notion } from "../services/notion.js";
import { CreatePageParams } from "../types/page.js";
import { handleNotionError } from "../utils/error.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const registerCreatePageTool = async (
  params: CreatePageParams
): Promise<CallToolResult> => {
  try {
    const { parent, ...rest } = params;

    if (!('database_id' in parent)) {
      // If not a database parent, create as is
      const response = await notion.pages.create(params);
      return {
        content: [
          {
            type: "text",
            text: `Page created successfully: ${response.id}`,
          },
        ],
      };
    }

    // It's a database parent, so we need to get the data_source_id
    const dbResponse = await notion.databases.retrieve({ database_id: parent.database_id });
    const dataSource = dbResponse.data_sources?.[0];

    if (!dataSource) {
      throw new Error(`No data source found for database ID: ${parent.database_id}`);
    }

    const newParams = {
      parent: {
        type: 'data_source_id',
        data_source_id: dataSource.id,
      },
      ...rest,
    };

    const response = await notion.pages.create(newParams as CreatePageParams);

    return {
      content: [
        {
          type: "text",
          text: `Page created successfully: ${response.id}`,
        },
      ],
    };
  } catch (error) {
    return handleNotionError(error);
  }
};
