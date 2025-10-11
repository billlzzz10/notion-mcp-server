import { z } from "zod";
import { preprocessJson } from "./preprocess.js";

// Schema for listing users with pagination
const LIST_USERS_OPTIONAL_PROPS = z.object({
    start_cursor: z.string(),
    page_size: z.number(),
}).partial();
export const LIST_USERS_SCHEMA = LIST_USERS_OPTIONAL_PROPS;


// Schema for getting a single user
const GET_USER_REQUIRED_PROPS = z.object({
    user_id: z.string().describe("The ID of the user to retrieve"),
});
export const GET_USER_SCHEMA = GET_USER_REQUIRED_PROPS;

// Combined schema for all user operations
export const USERS_OPERATION_SCHEMA = {
  payload: z
    .preprocess(
      preprocessJson,
      z.discriminatedUnion("action", [
        z.object({
          action: z
            .literal("list_users")
            .describe("Use this action to list users."),
          params: z.object(LIST_USERS_SCHEMA),
        }),
        z.object({
          action: z
            .literal("get_user")
            .describe("Use this action to get a single user."),
          params: z.object(GET_USER_SCHEMA),
        }),
        z.object({
          action: z
            .literal("get_bot_user")
            .describe("Use this action to get the bot user."),
          params: z.object({}),
        }),
      ])
    )
    .describe(
      "A union of all possible user operations. Each operation has a specific action and corresponding parameters. Use this schema to validate the input for user operations such as listing, getting a single user, and getting the bot user. Available actions include: 'list_users', 'get_user', and 'get_bot_user'. Each operation requires specific parameters as defined in the corresponding schemas."
    ),
};
