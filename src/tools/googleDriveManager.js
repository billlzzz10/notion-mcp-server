import { google } from 'googleapis';
import { notionFetch } from '../services/notion.js';

/**
 * Google Drive Integration Tool
 * เชื่อมต่อกับ Google Drive และจัดการไฟล์
 */
export const googleDriveManager = {
  name: 'manageGoogleDrive',
  description: 'จัดการไฟล์ใน Google Drive และอัพเดต link กลับไปยัง Notion',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['upload', 'create_folder', 'share', 'get_link', 'list_files'],
        description: 'การดำเนินการ: upload=อัพโลด, create_folder=สร้างโฟลเดอร์, share=แชร์, get_link=ดึง link, list_files=แสดงไฟล์'
      },
      content: {
        type: 'string',
        description: 'เนื้อหาที่จะสร้างเป็นไฟล์ (สำหรับการสร้างไฟล์ใหม่)'
      },
      fileName: {
        type: 'string',
        description: 'ชื่อไฟล์ที่จะสร้างหรือค้นหา'
      },
      fileType: {
        type: 'string',
        enum: ['document', 'spreadsheet', 'presentation', 'text', 'pdf'],
        description: 'ประเภทไฟล์ที่จะสร้าง'
      },
      folderId: {
        type: 'string',
        description: 'ID ของโฟลเดอร์ที่จะบันทึกไฟล์ (ถ้าไม่ระบุจะบันทึกใน root)'
      },
      notionPageId: {
        type: 'string',
        description: 'ID ของหน้า Notion ที่จะอัพเดต link'
      },
      shareSettings: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['anyone', 'domain', 'user'],
            description: 'ประเภทการแชร์'
          },
          role: {
            type: 'string',
            enum: ['reader', 'writer', 'commenter'],
            description: 'สิทธิ์การเข้าถึง'
          }
        }
      }
    },
    required: ['action']
  }
};

export async function manageGoogleDrive(args) {
  try {
    const { action, content, fileName, fileType, folderId, notionPageId, shareSettings } = args;
    
    console.log(`📁 กำลังดำเนินการ Google Drive: ${action}`);
    
    // Initialize Google Drive API
    const drive = await initializeDriveAPI();
    
    let result;
    
    switch (action) {
      case 'upload':
      case 'create_folder':
        result = await createDriveFile(drive, { content, fileName, fileType, folderId });
        break;
      case 'share':
        result = await shareFile(drive, args);
        break;
      case 'get_link':
        result = await getFileLink(drive, args);
        break;
      case 'list_files':
        result = await listFiles(drive, folderId);
        break;
      default:
        throw new Error(`ไม่รองรับการดำเนินการ: ${action}`);
    }
    
    // Update Notion with Drive link if requested
    if (notionPageId && result.fileId) {
      await updateNotionWithDriveLink(notionPageId, result);
    }
    
    return {
      success: true,
      action,
      result,
      message: `ดำเนินการ Google Drive เสร็จสิ้น${notionPageId ? ' และอัพเดต Notion แล้ว' : ''}`
    };
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดใน Google Drive:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function initializeDriveAPI() {
  // Check for service account credentials or OAuth tokens
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY 
    ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
    : null;
  
  if (!credentials && !process.env.GOOGLE_ACCESS_TOKEN) {
    throw new Error('ไม่พบ Google API credentials ใน environment variables');
  }
  
  let auth;
  
  if (credentials) {
    // Use service account
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
  } else {
    // Use OAuth token
    auth = new google.auth.OAuth2();
    auth.setCredentials({
      access_token: process.env.GOOGLE_ACCESS_TOKEN,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
  }
  
  return google.drive({ version: 'v3', auth });
}

async function createDriveFile(drive, { content, fileName, fileType, folderId }) {
  try {
    const mimeTypes = {
      document: 'application/vnd.google-apps.document',
      spreadsheet: 'application/vnd.google-apps.spreadsheet',
      presentation: 'application/vnd.google-apps.presentation',
      text: 'text/plain',
      pdf: 'application/pdf'
    };
    
    const fileMetadata = {
      name: fileName,
      parents: folderId ? [folderId] : undefined
    };
    
    let media = null;
    
    if (content) {
      media = {
        mimeType: mimeTypes[fileType] || 'text/plain',
        body: content
      };
    }
    
    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, name, webViewLink, webContentLink'
    });
    
    console.log('✅ สร้างไฟล์ใน Google Drive เรียบร้อย');
    
    return {
      fileId: response.data.id,
      fileName: response.data.name,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink
    };
    
  } catch (error) {
    throw new Error(`เกิดข้อผิดพลาดในการสร้างไฟล์: ${error.message}`);
  }
}

async function shareFile(drive, { fileId, shareSettings }) {
  try {
    const { type = 'anyone', role = 'reader' } = shareSettings || {};
    
    await drive.permissions.create({
      fileId,
      resource: {
        role,
        type
      }
    });
    
    // Get the shareable link
    const file = await drive.files.get({
      fileId,
      fields: 'webViewLink, webContentLink'
    });
    
    console.log('✅ แชร์ไฟล์ Google Drive เรียบร้อย');
    
    return {
      fileId,
      shareSettings: { type, role },
      webViewLink: file.data.webViewLink,
      webContentLink: file.data.webContentLink
    };
    
  } catch (error) {
    throw new Error(`เกิดข้อผิดพลาดในการแชร์ไฟล์: ${error.message}`);
  }
}

async function getFileLink(drive, { fileId }) {
  try {
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, webViewLink, webContentLink, permissions'
    });
    
    return {
      fileId: response.data.id,
      fileName: response.data.name,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
      isShared: response.data.permissions?.some(p => p.type === 'anyone') || false
    };
    
  } catch (error) {
    throw new Error(`เกิดข้อผิดพลาดในการดึง link: ${error.message}`);
  }
}

async function listFiles(drive, folderId) {
  try {
    const query = folderId ? `'${folderId}' in parents` : undefined;
    
    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, webViewLink, createdTime, modifiedTime)',
      orderBy: 'modifiedTime desc'
    });
    
    return {
      files: response.data.files,
      count: response.data.files.length
    };
    
  } catch (error) {
    throw new Error(`เกิดข้อผิดพลาดในการแสดงไฟล์: ${error.message}`);
  }
}

async function updateNotionWithDriveLink(pageId, driveResult) {
  try {
    const updateData = {
      properties: {
        'Google Drive Link': {
          url: driveResult.webViewLink
        },
        'Drive File ID': {
          rich_text: [{
            text: {
              content: driveResult.fileId
            }
          }]
        }
      }
    };
    
    await notionFetch(`/pages/${pageId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
    
    console.log('✅ อัพเดต Notion ด้วย Google Drive link เรียบร้อย');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการอัพเดต Notion:', error);
    throw error;
  }
}
