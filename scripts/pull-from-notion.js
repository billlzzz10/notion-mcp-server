import { Client } from '@notionhq/client';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Setup Google Drive (optional - for backup)
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

async function pullFromNotion() {
  const databaseId = process.env.NOTION_DB_ID;
  const targetFolder = process.env.TARGET_FOLDER || 'vault';
  
  if (!databaseId) {
    throw new Error('❌ NOTION_DB_ID environment variable is required');
  }

  console.log(`🔄 Pulling from Notion database: ${databaseId}`);
  console.log(`📁 Target folder: ${targetFolder}`);

  // Ensure target directory exists
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
    console.log(`📂 Created directory: ${targetFolder}`);
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    console.log(`📄 Found ${response.results.length} pages in database`);

    for (const page of response.results) {
      await processPage(page, targetFolder);
    }

    console.log('✅ Notion pull completed successfully');
  } catch (error) {
    console.error('❌ Error pulling from Notion:', error.message);
    throw error;
  }
}

async function processPage(page, targetFolder) {
  try {
    // Extract page title
    const titleProperty = Object.values(page.properties).find(
      prop => prop.type === 'title'
    );
    
    const title = titleProperty?.title?.[0]?.plain_text || 'Untitled';
    const pageId = page.id;
    
    // Clean filename
    const safeTitle = title.replace(/[\/\\?%*:|"<>]/g, '-').trim();
    const fileName = `${safeTitle}.md`;
    const filePath = path.join(targetFolder, fileName);

    console.log(`📝 Processing: ${title}`);

    // Get page content
    const pageContent = await getPageContent(pageId);
    
    // Create markdown content
    const markdownContent = createMarkdownContent(title, page, pageContent);

    // Write file
    fs.writeFileSync(filePath, markdownContent, 'utf8');
    console.log(`✅ Created/Updated: ${filePath}`);

    // Optional: Upload to Google Drive
    if (drive) {
      await uploadToGoogleDrive(filePath, fileName);
    }

  } catch (error) {
    console.error(`❌ Error processing page:`, error.message);
  }
}

async function getPageContent(pageId) {
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
    });

    return response.results.map(block => {
      if (block.type === 'paragraph' && block.paragraph?.rich_text) {
        return block.paragraph.rich_text.map(text => text.plain_text).join('');
      }
      if (block.type === 'heading_1' && block.heading_1?.rich_text) {
        return '# ' + block.heading_1.rich_text.map(text => text.plain_text).join('');
      }
      if (block.type === 'heading_2' && block.heading_2?.rich_text) {
        return '## ' + block.heading_2.rich_text.map(text => text.plain_text).join('');
      }
      if (block.type === 'heading_3' && block.heading_3?.rich_text) {
        return '### ' + block.heading_3.rich_text.map(text => text.plain_text).join('');
      }
      return '';
    }).filter(text => text.length > 0).join('\n\n');
  } catch (error) {
    console.log(`⚠️ Could not fetch content for page ${pageId}:`, error.message);
    return '';
  }
}

function createMarkdownContent(title, page, content) {
  const metadata = extractMetadata(page);
  const timestamp = new Date().toISOString();
  
  return `# ${title}

<!-- Notion Page ID: ${page.id} -->
<!-- Last synced: ${timestamp} -->

${metadata}

${content || '*No content available*'}

---
*Synced from Notion by GitHub Action*
`;
}

function extractMetadata(page) {
  const metadata = [];
  
  Object.entries(page.properties).forEach(([key, prop]) => {
    if (prop.type === 'select' && prop.select) {
      metadata.push(`**${key}**: ${prop.select.name}`);
    } else if (prop.type === 'multi_select' && prop.multi_select?.length > 0) {
      const values = prop.multi_select.map(item => item.name).join(', ');
      metadata.push(`**${key}**: ${values}`);
    } else if (prop.type === 'rich_text' && prop.rich_text?.length > 0) {
      const text = prop.rich_text.map(text => text.plain_text).join('');
      if (text.trim()) {
        metadata.push(`**${key}**: ${text}`);
      }
    } else if (prop.type === 'date' && prop.date) {
      metadata.push(`**${key}**: ${prop.date.start}`);
    }
  });

  return metadata.length > 0 ? metadata.join('\n') + '\n' : '';
}

async function uploadToGoogleDrive(filePath, fileName) {
  try {
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

    console.log(`☁️ Uploaded to Google Drive: ${fileName}`);
  } catch (error) {
    console.log(`⚠️ Failed to upload to Google Drive: ${error.message}`);
  }
}

// Run the script
pullFromNotion().catch(error => {
  console.error('💥 Script failed:', error.message);
  process.exit(1);
});
