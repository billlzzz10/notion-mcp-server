import { Client } from '@notionhq/client';

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Export notion client for other modules to use
export { notion };

/**
 * Generic Notion API fetch wrapper
 * @param {string} endpoint - API endpoint (e.g., '/pages', '/databases/query')
 * @param {object} options - Request options including method, body, etc.
 */
export async function notionFetch(endpoint, options = {}) {
  try {
    const { method = 'GET', body, ...otherOptions } = options;
    
    if (endpoint === '/pages' && method === 'POST') {
      const params = JSON.parse(body);
      if (params.parent && params.parent.database_id) {
        const dbResponse = await notion.databases.retrieve({ database_id: params.parent.database_id });
        const dataSource = dbResponse.data_sources?.[0];
        if (!dataSource) {
          throw new Error(`No data source found for database ID: ${params.parent.database_id}`);
        }
        params.parent = { data_source_id: dataSource.id };
      }
      return await notion.pages.create(params);
    } else if (endpoint.includes('/databases/') && endpoint.includes('/query')) {
      const databaseId = endpoint.split('/')[2];

      // Get data source ID
      const dbResponse = await notion.databases.retrieve({ database_id: databaseId });
      const dataSource = dbResponse.data_sources?.[0];
      if (!dataSource) {
        throw new Error(`No data source found for database ID: ${databaseId}`);
      }

      // Use the dedicated SDK v5 method to query the data source
      return await notion.dataSources.query({
          data_source_id: dataSource.id,
          ...JSON.parse(body || '{}')
      });
    } else {
      throw new Error(`Unsupported endpoint: ${endpoint} with method: ${method}`);
    }
  } catch (error) {
    console.error('❌ Notion API Error:', error);
    throw error;
  }
}

/**
 * Query all tasks in the Project Progress database
 */
export async function getProgressTasks() {
  const databaseId = process.env.NOTION_PROJECT_PROGRESS_DB_ID || process.env.NOTION_PROJECTS_DB_ID;

  // Get data source ID
  const dbResponse = await notion.databases.retrieve({ database_id: databaseId });
  const dataSource = dbResponse.data_sources?.[0];
  if (!dataSource) {
    throw new Error(`No data source found for database ID: ${databaseId}`);
  }

  const response = await notion.dataSources.query({
      data_source_id: dataSource.id,
  });
  return response.results;
}

/**
 * Create a new task in the Project Progress database
 * @param {object} task - Task fields
 */
export async function createProgressTask(task) {
  const databaseId = process.env.NOTION_PROJECT_PROGRESS_DB_ID || process.env.NOTION_PROJECTS_DB_ID;

  // Get data source ID
  const dbResponse = await notion.databases.retrieve({ database_id: databaseId });
  const dataSource = dbResponse.data_sources?.[0];
  if (!dataSource) {
    throw new Error(`No data source found for database ID: ${databaseId}`);
  }

  const response = await notion.pages.create({
    parent: { data_source_id: dataSource.id },
    properties: {
      'Task Name': { title: [{ text: { content: task.name } }] },
      'Module': { select: { name: task.module } },
      'Status': { select: { name: task.status } },
      'Assignee': { rich_text: [{ text: { content: task.assignee } }] },
      'Deadline': { date: { start: task.deadline } },
      'Checklist': { rich_text: [{ text: { content: task.checklist } }] },
      'Feedback': { rich_text: [{ text: { content: task.feedback } }] },
      'Forecast': { rich_text: [{ text: { content: task.forecast } }] }
    }
  });
  return response;
}

/**
 * Update an existing task page in the Project Progress database
 * @param {string} pageId - Notion page ID
 * @param {object} updates - Partial properties to update
 */
export async function updateProgressTask(pageId, updates) {
  const props = {};
  if (updates.name) props['Task Name'] = { title: [{ text: { content: updates.name } }] };
  if (updates.module) props['Module'] = { select: { name: updates.module } };
  if (updates.status) props['Status'] = { select: { name: updates.status } };
  if (updates.assignee) props['Assignee'] = { rich_text: [{ text: { content: updates.assignee } }] };
  if (updates.deadline) props['Deadline'] = { date: { start: updates.deadline } };
  if (updates.checklist) props['Checklist'] = { rich_text: [{ text: { content: updates.checklist } }] };
  if (updates.feedback) props['Feedback'] = { rich_text: [{ text: { content: updates.feedback } }] };
  if (updates.forecast) props['Forecast'] = { rich_text: [{ text: { content: updates.forecast } }] };

  const response = await notion.pages.update({
    page_id: pageId,
    properties: props
  });
  return response;
}
