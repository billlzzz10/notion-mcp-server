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
      return await notion.pages.create(JSON.parse(body));
    } else if (endpoint.includes('/databases/') && endpoint.includes('/query')) {
      const databaseId = endpoint.split('/')[2];
      return await notion.databases.query({ 
        database_id: databaseId,
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
  const response = await notion.databases.query({ database_id: databaseId });
  return response.results;
}

/**
 * Create a new task in the Project Progress database
 * @param {object} task - Task fields
 */
export async function createProgressTask(task) {
  const databaseId = process.env.NOTION_PROJECT_PROGRESS_DB_ID || process.env.NOTION_PROJECTS_DB_ID;
  const response = await notion.pages.create({
    parent: { database_id: databaseId },
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
