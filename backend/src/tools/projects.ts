import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { notion } from "../services/notion.js";
import { handleNotionError } from "../utils/error.js";

const projectSchema = z.object({
  name: z.string().describe("Project name"),
  description: z.string().optional().describe("Project description"),
  status: z.enum(["Not started", "In progress", "Completed", "On hold"]).describe("Project status"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).describe("Project priority"),
  startDate: z.string().optional().describe("Project start date (YYYY-MM-DD)"),
  endDate: z.string().optional().describe("Project end date (YYYY-MM-DD)"),
  tags: z.array(z.string()).optional().describe("Project tags"),
  assignee: z.string().optional().describe("Person assigned to the project"),
  progress: z.number().min(0).max(100).optional().describe("Project progress percentage"),
  budget: z.number().optional().describe("Project budget"),
  notes: z.string().optional().describe("Additional notes"),
});

const updateProjectSchema = z.object({
  projectId: z.string().describe("Project page ID to update"),
  updates: projectSchema.partial().describe("Fields to update"),
});

const queryProjectsSchema = z.object({
  status: z.enum(["Not started", "In progress", "Completed", "On hold"]).optional(),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).optional(),
  assignee: z.string().optional().describe("Filter by assignee"),
  tags: z.array(z.string()).optional().describe("Filter by tags"),
  sortBy: z.enum(["created_time", "last_edited_time", "priority", "status"]).optional(),
  sortDirection: z.enum(["ascending", "descending"]).optional(),
});

export const projectsTools: Tool[] = [
  {
    name: "createProject",
    description: "Create a new project in the Projects database",
    inputSchema: {
      type: "object",
      properties: {
        databaseId: {
          type: "string",
          description: "Projects database ID",
        },
        project: projectSchema,
      },
      required: ["databaseId", "project"],
    },
  },
  {
    name: "updateProject",
    description: "Update an existing project",
    inputSchema: {
      type: "object",
      properties: updateProjectSchema.shape,
      required: ["projectId", "updates"],
    },
  },
  {
    name: "queryProjects",
    description: "Query projects with filters and sorting",
    inputSchema: {
      type: "object",
      properties: {
        databaseId: {
          type: "string",
          description: "Projects database ID",
        },
        filters: queryProjectsSchema,
      },
      required: ["databaseId"],
    },
  },
  {
    name: "getProjectStats",
    description: "Get project statistics and analytics",
    inputSchema: {
      type: "object",
      properties: {
        databaseId: {
          type: "string",
          description: "Projects database ID",
        },
      },
      required: ["databaseId"],
    },
  },
];

export async function handleProjectsTools(
  name: string,
  args: any
): Promise<any> {
  try {
    switch (name) {
      case "createProject":
        return await createProject(args);
      case "updateProject":
        return await updateProject(args);
      case "queryProjects":
        return await queryProjects(args);
      case "getProjectStats":
        return await getProjectStats(args);
      default:
        throw new Error(`Unknown projects tool: ${name}`);
    }
  } catch (error) {
    return handleNotionError(error);
  }
}

async function createProject(args: any) {
  const { databaseId, project } = args;

  // Get data source ID
  const dbResponse = await notion.databases.retrieve({ database_id: databaseId });
  const dataSource = dbResponse.data_sources?.[0];
  if (!dataSource) {
    throw new Error(`No data source found for database ID: ${databaseId}`);
  }

  const properties: any = {
    Name: {
      title: [{ text: { content: project.name } }],
    },
    Status: {
      select: { name: project.status },
    },
    Priority: {
      select: { name: project.priority },
    },
  };

  if (project.description) {
    properties.Description = {
      rich_text: [{ text: { content: project.description } }],
    };
  }

  if (project.startDate) {
    properties["Start Date"] = {
      date: { start: project.startDate },
    };
  }

  if (project.endDate) {
    properties["End Date"] = {
      date: { start: project.endDate },
    };
  }

  if (project.tags && project.tags.length > 0) {
    properties.Tags = {
      multi_select: project.tags.map((tag: string) => ({ name: tag })),
    };
  }

  if (project.assignee) {
    properties.Assignee = {
      rich_text: [{ text: { content: project.assignee } }],
    };
  }

  if (project.progress !== undefined) {
    properties.Progress = {
      number: project.progress,
    };
  }

  if (project.budget !== undefined) {
    properties.Budget = {
      number: project.budget,
    };
  }

  if (project.notes) {
    properties.Notes = {
      rich_text: [{ text: { content: project.notes } }],
    };
  }

  const response = await notion.pages.create({
    parent: { data_source_id: dataSource.id },
    properties,
  });

  return {
    success: true,
    projectId: response.id,
    message: `Project "${project.name}" created successfully`,
    project: response,
  };
}

async function updateProject(args: any) {
  const { projectId, updates } = args;

  const properties: any = {};

  if (updates.name) {
    properties.Name = {
      title: [{ text: { content: updates.name } }],
    };
  }

  if (updates.status) {
    properties.Status = {
      select: { name: updates.status },
    };
  }

  if (updates.priority) {
    properties.Priority = {
      select: { name: updates.priority },
    };
  }

  if (updates.description !== undefined) {
    properties.Description = {
      rich_text: [{ text: { content: updates.description } }],
    };
  }

  if (updates.startDate !== undefined) {
    properties["Start Date"] = {
      date: updates.startDate ? { start: updates.startDate } : null,
    };
  }

  if (updates.endDate !== undefined) {
    properties["End Date"] = {
      date: updates.endDate ? { start: updates.endDate } : null,
    };
  }

  if (updates.tags !== undefined) {
    properties.Tags = {
      multi_select: updates.tags?.map((tag: string) => ({ name: tag })) || [],
    };
  }

  if (updates.assignee !== undefined) {
    properties.Assignee = {
      rich_text: [{ text: { content: updates.assignee || "" } }],
    };
  }

  if (updates.progress !== undefined) {
    properties.Progress = {
      number: updates.progress,
    };
  }

  if (updates.budget !== undefined) {
    properties.Budget = {
      number: updates.budget,
    };
  }

  if (updates.notes !== undefined) {
    properties.Notes = {
      rich_text: [{ text: { content: updates.notes || "" } }],
    };
  }

  const response = await notion.pages.update({ 
    page_id: projectId, 
    properties 
  });

  return {
    success: true,
    projectId,
    message: "Project updated successfully",
    project: response,
  };
}

async function queryProjects(args: any) {
  const { databaseId, filters = {} } = args;

  const filter: any = { and: [] };

  if (filters.status) {
    filter.and.push({
      property: "Status",
      select: { equals: filters.status },
    });
  }

  if (filters.priority) {
    filter.and.push({
      property: "Priority",
      select: { equals: filters.priority },
    });
  }

  if (filters.assignee) {
    filter.and.push({
      property: "Assignee",
      rich_text: { contains: filters.assignee },
    });
  }

  if (filters.tags && filters.tags.length > 0) {
    for (const tag of filters.tags) {
      filter.and.push({
        property: "Tags",
        multi_select: { contains: tag },
      });
    }
  }

  const sorts: any[] = [];
  if (filters.sortBy) {
    sorts.push({
      property: filters.sortBy === "created_time" || filters.sortBy === "last_edited_time" 
        ? filters.sortBy 
        : filters.sortBy === "priority" ? "Priority" : "Status",
      direction: filters.sortDirection || "descending",
    });
  }

  const queryOptions: any = {
    database_id: databaseId,
  };

  if (filter.and.length > 0) {
    queryOptions.filter = filter.and.length === 1 ? filter.and[0] : filter;
  }

  if (sorts.length > 0) {
    queryOptions.sorts = sorts;
  }

  const response = await notion.databases.query(queryOptions);

  return {
    success: true,
    projects: response.results,
    hasMore: response.has_more,
    nextCursor: response.next_cursor,
    totalCount: response.results.length,
  };
}

async function getProjectStats(args: any) {
  const { databaseId } = args;

  const response = await notion.databases.query({
    database_id: databaseId,
  });

  const projects = response.results;
  const stats = {
    total: projects.length,
    byStatus: {
      "Not started": 0,
      "In progress": 0,
      "Completed": 0,
      "On hold": 0,
    },
    byPriority: {
      "Low": 0,
      "Medium": 0,
      "High": 0,
      "Critical": 0,
    },
    averageProgress: 0,
    totalBudget: 0,
    overdue: 0,
  };

  let totalProgress = 0;
  let progressCount = 0;
  const today = new Date().toISOString().split('T')[0];

  for (const project of projects) {
    if ('properties' in project) {
      const properties = project.properties as any;

      // Count by status
      if (properties.Status?.select?.name) {
        const status = properties.Status.select.name;
        if (status in stats.byStatus) {
          stats.byStatus[status as keyof typeof stats.byStatus]++;
        }
      }

      // Count by priority
      if (properties.Priority?.select?.name) {
        const priority = properties.Priority.select.name;
        if (priority in stats.byPriority) {
          stats.byPriority[priority as keyof typeof stats.byPriority]++;
        }
      }

      // Calculate average progress
      if (properties.Progress?.number !== undefined && properties.Progress?.number !== null) {
        totalProgress += Number(properties.Progress.number);
        progressCount++;
      }

      // Sum budget
      if (properties.Budget?.number !== undefined && properties.Budget?.number !== null) {
        stats.totalBudget += Number(properties.Budget.number);
      }

      // Count overdue projects
      if (properties["End Date"]?.date?.start && 
          properties.Status?.select?.name !== "Completed") {
        if (properties["End Date"].date.start < today) {
          stats.overdue++;
        }
      }
    }
  }

  if (progressCount > 0) {
    stats.averageProgress = Math.round(totalProgress / progressCount);
  }

  return {
    success: true,
    stats,
    lastUpdated: new Date().toISOString(),
  };
}
