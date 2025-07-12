# Notion Database Operations Patterns

เมื่อทำงานกับ Notion Database APIs ให้ใช้ pattern เหล่านี้:

## Environment Variables Pattern
```typescript
// ตรวจสอบ environment variables
const dbId = process.env.NOTION_[DATABASE_NAME]_DB_ID;
if (!dbId) {
  throw new Error("ไม่พบ database ID สำหรับ [DATABASE_NAME]");
}
```

## Query Database Pattern
```typescript
// Query with filters and sorts
const response = await notion.databases.query({
  database_id: dbId,
  filter: {
    and: [
      {
        property: "Status",
        select: { equals: "Active" }
      },
      {
        property: "Priority",
        select: { does_not_equal: "Low" }
      }
    ]
  },
  sorts: [
    { property: "Created", direction: "descending" },
    { property: "Name", direction: "ascending" }
  ],
  page_size: 100
});
```

## Property Access Pattern
```typescript
// Safe property extraction
function extractPageProperties(page: any) {
  const props = page.properties;
  
  return {
    id: page.id,
    title: props.Title?.title?.[0]?.text?.content || "",
    status: props.Status?.select?.name || "",
    priority: props.Priority?.select?.name || "",
    assignee: props.Assignee?.people?.[0]?.name || "",
    dueDate: props["Due Date"]?.date?.start || null,
    tags: props.Tags?.multi_select?.map((tag: any) => tag.name) || [],
    description: props.Description?.rich_text?.[0]?.text?.content || "",
    relations: props["Related Items"]?.relation?.map((rel: any) => rel.id) || [],
    number: props.Count?.number || 0,
    checkbox: props.Completed?.checkbox || false,
    url: props.Link?.url || "",
    email: props.Email?.email || "",
    phone: props.Phone?.phone_number || ""
  };
}
```

## Create Page Pattern
```typescript
// Create new page in database
async function createDatabasePage(dbId: string, properties: any) {
  const response = await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      "Title": {
        title: [
          {
            text: {
              content: properties.title
            }
          }
        ]
      },
      "Status": {
        select: {
          name: properties.status
        }
      },
      "Tags": {
        multi_select: properties.tags.map((tag: string) => ({ name: tag }))
      },
      "Description": {
        rich_text: [
          {
            text: {
              content: properties.description
            }
          }
        ]
      },
      "Related Items": {
        relation: properties.relationIds.map((id: string) => ({ id }))
      }
    }
  });
  
  return response;
}
```

## Update Page Pattern
```typescript
// Update existing page properties
async function updatePageProperties(pageId: string, updates: any) {
  const response = await notion.pages.update({
    page_id: pageId,
    properties: {
      ...updates.status && {
        "Status": {
          select: {
            name: updates.status
          }
        }
      },
      ...updates.description && {
        "Description": {
          rich_text: [
            {
              text: {
                content: updates.description
              }
            }
          ]
        }
      }
    }
  });
  
  return response;
}
```

## Batch Operations Pattern
```typescript
// Process large datasets with pagination
async function getAllPagesFromDatabase(dbId: string) {
  const allPages: any[] = [];
  let hasMore = true;
  let nextCursor: string | undefined;
  
  while (hasMore) {
    const response = await notion.databases.query({
      database_id: dbId,
      start_cursor: nextCursor,
      page_size: 100
    });
    
    allPages.push(...response.results);
    hasMore = response.has_more;
    nextCursor = response.next_cursor || undefined;
  }
  
  return allPages;
}
```

## Relation Handling Pattern
```typescript
// Work with database relations
async function getRelatedPages(pageId: string, relationProperty: string) {
  const page = await notion.pages.retrieve({ page_id: pageId });
  const props = page.properties;
  const relations = props[relationProperty]?.relation || [];
  
  // Fetch related pages
  const relatedPages = await Promise.all(
    relations.map(async (rel: any) => {
      return await notion.pages.retrieve({ page_id: rel.id });
    })
  );
  
  return relatedPages;
}
```

## Search Pattern
```typescript
// Search across pages and databases
async function searchNotionContent(query: string, filter?: any) {
  const response = await notion.search({
    query: query,
    filter: {
      value: "page",
      property: "object",
      ...filter
    },
    sort: {
      direction: "descending",
      timestamp: "last_edited_time"
    }
  });
  
  return response.results;
}
```

## Error Handling for Notion API
```typescript
// Standard error handling pattern
try {
  const response = await notion.databases.query({
    database_id: dbId,
    // query parameters...
  });
  
  return {
    success: true,
    data: response.results
  };
} catch (error: any) {
  // Handle specific Notion API errors
  if (error.code === 'object_not_found') {
    throw new Error(`ไม่พบฐานข้อมูล ID: ${dbId}`);
  } else if (error.code === 'unauthorized') {
    throw new Error('ไม่มีสิทธิ์เข้าถึงฐานข้อมูลนี้');
  } else if (error.code === 'validation_error') {
    throw new Error(`ข้อมูลไม่ถูกต้อง: ${error.message}`);
  }
  
  throw new Error(`Notion API Error: ${error.message}`);
}
```

## Ashval-Specific Database Patterns

### Characters Database:
```typescript
const characterProps = {
  "Name": { title: [{ text: { content: name } }] },
  "Role": { select: { name: role } }, // Protagonist, Antagonist, Supporting, Minor
  "Arc Status": { select: { name: arcStatus } }, // Not Started, Developing, Complete
  "Screen Time": { select: { name: screenTime } }, // Major, Medium, Minor
  "Goal": { rich_text: [{ text: { content: goal } }] },
  "Personality": { rich_text: [{ text: { content: personality } }] }
};
```

### Scenes Database:
```typescript
const sceneProps = {
  "Title": { title: [{ text: { content: title } }] },
  "Chapter": { number: chapter },
  "Order": { number: order },
  "Summary": { rich_text: [{ text: { content: summary } }] },
  "Tone": { select: { name: tone } }, // มืดมัว, น่ากลัว, หวังใจ, etc.
  "Characters in Scene": { relation: characterIds.map(id => ({ id })) }
};
```