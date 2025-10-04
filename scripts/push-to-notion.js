import { Client } from '@notionhq/client';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Setup Google Drive (optional)
let drive = null;
if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    drive = google.drive({ version: 'v3', auth });
    console.log('✅ Google Drive integration enabled');
  } catch (error) {
    console.log('⚠️ Google Drive integration disabled:', error.message);
  }
}

async function pushToNotion() {
  const databaseId = process.env.NOTION_DB_ID;
  const filePath = process.env.FILE_TO_SYNC;
  
  if (!databaseId) {
    throw new Error('❌ NOTION_DB_ID environment variable is required');
  }
  
  if (!filePath) {
    throw new Error('❌ FILE_TO_SYNC environment variable is required');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`❌ File not found: ${filePath}`);
  }

  console.log(`📤 Pushing file to Notion: ${filePath}`);
  console.log(`🎯 Target database: ${databaseId}`);

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { title, content, metadata } = parseMarkdownFile(fileContent, filePath);
    
    // Check if page already exists
    const existingPage = await findExistingPage(databaseId, title);
    
    if (existingPage) {
      console.log(`🔄 Updating existing page: ${title}`);
      await updateNotionPage(existingPage.id, title, content, metadata);
    } else {
      console.log(`✨ Creating new page: ${title}`);
      await createNotionPage(databaseId, title, content, metadata);
    }

    // Optional: Backup to Google Drive
    if (drive) {
      await backupToGoogleDrive(filePath);
    }

    console.log('✅ Push to Notion completed successfully');
  } catch (error) {
    console.error('❌ Error pushing to Notion:', error.message);
    throw error;
  }
}

function parseMarkdownFile(content, filePath) {
  const fileName = path.basename(filePath, '.md');
  const lines = content.split('\n');
  
  // Extract title (first # header or filename)
  let title = fileName;
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  // Extract metadata (between <!-- and --> or **key**: value format)
  const metadata = {};
  const metadataRegex = /\*\*([^*]+)\*\*:\s*(.+)/g;
  let match;
  while ((match = metadataRegex.exec(content)) !== null) {
    metadata[match[1].trim()] = match[2].trim();
  }

  // Clean content (remove title and metadata sections)
  let cleanContent = content
    .replace(/^#\s+.+$/m, ''); // Remove title
  // Remove all HTML comments, even if nested or overlapping
  let prevContent;
  do {
    prevContent = cleanContent;
    cleanContent = cleanContent.replace(/<!--[\s\S]*?-->/g, '');
  } while (cleanContent !== prevContent);
  cleanContent = cleanContent
    .replace(/\*\*[^*]+\*\*:\s*.+$/gm, '') // Remove metadata lines
    .replace(/^---$/gm, '') // Remove separators
    .replace(/^\*Synced from.*$/gm, '') // Remove sync notices
    .trim();

  return { title, content: cleanContent, metadata };
}

async function findExistingPage(databaseId, title) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Name', // Assuming 'Name' is the title property
        title: {
          equals: title,
        },
      },
    });

    return response.results.length > 0 ? response.results[0] : null;
  } catch (error) {
    console.log(`⚠️ Could not search for existing page: ${error.message}`);
    return null;
  }
}

async function createNotionPage(databaseId, title, content, metadata) {
  // Get data source ID
  const dbResponse = await notion.databases.retrieve({ database_id: databaseId });
  const dataSource = dbResponse.data_sources?.[0];
  if (!dataSource) {
    throw new Error(`No data source found for database ID: ${databaseId}`);
  }

  const properties = {
    Name: {
      title: [
        {
          text: {
            content: title,
          },
        },
      ],
    },
  };

  // Add metadata as properties (customize based on your database schema)
  Object.entries(metadata).forEach(([key, value]) => {
    if (key === 'Status' || key === 'Race' || key === 'Region') {
      properties[key] = {
        select: {
          name: value,
        },
      };
    } else if (key === 'Tags' || key === 'Faction') {
      properties[key] = {
        multi_select: value.split(',').map(tag => ({ name: tag.trim() })),
      };
    } else {
      properties[key] = {
        rich_text: [
          {
            text: {
              content: value,
            },
          },
        ],
      };
    }
  });

  const page = await notion.pages.create({
    parent: {
      data_source_id: dataSource.id,
    },
    properties,
  });

  // Add content as blocks
  if (content) {
    await addContentBlocks(page.id, content);
  }

  console.log(`✅ Created page: ${title} (ID: ${page.id})`);
  return page;
}

async function updateNotionPage(pageId, title, content, metadata) {
  // Update page properties
  const properties = {
    Name: {
      title: [
        {
          text: {
            content: title,
          },
        },
      ],
    },
  };

  // Add metadata as properties
  Object.entries(metadata).forEach(([key, value]) => {
    if (key === 'Status' || key === 'Race' || key === 'Region') {
      properties[key] = {
        select: {
          name: value,
        },
      };
    } else if (key === 'Tags' || key === 'Faction') {
      properties[key] = {
        multi_select: value.split(',').map(tag => ({ name: tag.trim() })),
      };
    } else {
      properties[key] = {
        rich_text: [
          {
            text: {
              content: value,
            },
          },
        ],
      };
    }
  });

  await notion.pages.update({
    page_id: pageId,
    properties,
  });

  // Clear existing content and add new content
  if (content) {
    await clearPageContent(pageId);
    await addContentBlocks(pageId, content);
  }

  console.log(`✅ Updated page: ${title} (ID: ${pageId})`);
}

async function clearPageContent(pageId) {
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
    });

    const blockIds = response.results.map(block => block.id);
    
    for (const blockId of blockIds) {
      await notion.blocks.delete({
        block_id: blockId,
      });
    }
  } catch (error) {
    console.log(`⚠️ Could not clear page content: ${error.message}`);
  }
}

async function addContentBlocks(pageId, content) {
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  const children = paragraphs.map(paragraph => {
    if (paragraph.startsWith('# ')) {
      return {
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: paragraph.replace('# ', ''),
              },
            },
          ],
        },
      };
    } else if (paragraph.startsWith('## ')) {
      return {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: paragraph.replace('## ', ''),
              },
            },
          ],
        },
      };
    } else if (paragraph.startsWith('### ')) {
      return {
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: paragraph.replace('### ', ''),
              },
            },
          ],
        },
      };
    } else {
      return {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: paragraph,
              },
            },
          ],
        },
      };
    }
  });

  if (children.length > 0) {
    await notion.blocks.children.append({
      block_id: pageId,
      children,
    });
  }
}

async function backupToGoogleDrive(filePath) {
  try {
    const fileName = `backup-${path.basename(filePath)}`;
    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || 'root'],
    };

    const media = {
      mimeType: 'text/markdown',
      body: fs.createReadStream(filePath),
    };

    await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    console.log(`☁️ Backed up to Google Drive: ${fileName}`);
  } catch (error) {
    console.log(`⚠️ Failed to backup to Google Drive: ${error.message}`);
  }
}

// Run the script
pushToNotion().catch(error => {
  console.error('💥 Script failed:', error.message);
  process.exit(1);
});
