import { Client } from '@notionhq/client';
import NodeCache from 'node-cache';

// In-memory cache for schema
const schemaCache = new NodeCache({ stdTTL: 300 }); // cache for 5 minutes
const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function getSchema(databaseId) {
  // check cache
  let schema = schemaCache.get(databaseId);
  if (schema) return schema;

  // 1. Get data sources for the database
  const dbResponse = await notion.databases.retrieve({ database_id: databaseId });
  const dataSource = dbResponse.data_sources?.[0];

  if (!dataSource) {
    throw new Error(`No data source found for database ID: ${databaseId}`);
  }

  // 2. Retrieve the schema from the data source
  const dsResponse = await notion.dataSources.retrieve({ data_source_id: dataSource.id });
  schema = dsResponse.properties;

  // cache schema
  schemaCache.set(databaseId, schema);
  return schema;
}

async function refreshSchema(databaseId) {
  // 1. Get data sources for the database
  const dbResponse = await notion.databases.retrieve({ database_id: databaseId });
  const dataSource = dbResponse.data_sources?.[0];

  if (!dataSource) {
    throw new Error(`No data source found for database ID: ${databaseId}`);
  }

  // 2. Retrieve the schema from the data source
  const dsResponse = await notion.dataSources.retrieve({ data_source_id: dataSource.id });
  const schema = dsResponse.properties;

  // 3. Update cache
  schemaCache.set(databaseId, schema);
  return schema;
}

export { getSchema, refreshSchema };
