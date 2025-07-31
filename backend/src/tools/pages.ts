import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { handleNotionError } from "../utils/error.js";
import { PagesOperationParams } from "../types/page.js";
import { registerCreatePageTool } from "./createPage.js";
import { archivePage } from "./updatePage.js";
import { restorePage } from "./updatePage.js";
import { searchPages } from "./searchPage.js";
import { updatePageProperties } from "./updatePageProperties.js";

export const registerPagesOperationTool = async (
  params: PagesOperationParams
): Promise<CallToolResult> => {
  switch (params.payload.action) {
    case "create_page":
      return registerCreatePageTool(params.payload.params);
    case "archive_page":
      return archivePage(params.payload.params);
    case "restore_page":
      return restorePage(params.payload.params);
    case "search_pages":
      return searchPages(params.payload.params);
    case "update_page_properties":
      return updatePageProperties(params.payload.params);
    default:
      return handleNotionError(
        new Error(
          `Unsupported action, use one of the following: "create_page", "archive_page", "restore_page", "search_pages", "update_page_properties"`
        )
      );
  }
};
