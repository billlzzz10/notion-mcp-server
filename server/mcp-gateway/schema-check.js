const { Client } = require('@notionhq/client');
const NodeCache = require('node-cache');

// In-memory cache for schema
const schemaCache = new NodeCache({ stdTTL: 300 }); // cache for 5 minutes
const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function getSchema(databaseId) {
  // check cache
  let schema = schemaCache.get(databaseId);
  if (schema) return schema;

  // fetch from Notion
  const response = await notion.databases.retrieve({ database_id: databaseId });
  schema = response.properties;

  // cache schema
  schemaCache.set(databaseId, schema);
  return schema;
}

async function refreshSchema(databaseId) {
  const response = await notion.databases.retrieve({ database_id: databaseId });
  const schema = response.properties;
  schemaCache.set(databaseId, schema);
  return schema;
}

module.exports = { getSchema, refreshSchema };
