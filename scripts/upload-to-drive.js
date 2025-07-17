/**
 * Google Drive Uploader - อัปโหลดไฟล์ไปยัง Google Drive
 * รองรับการอัปโหลดหลายไฟล์และสร้างโฟลเดอร์อัตโนมัติ
 */

const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

/**
 * ตั้งค่า Google Drive API
 */
function setupGoogleDrive() {
  try {
    // โหลด Credentials จาก Environment Variable
    const credentials = JSON.parse(process.env.GDRIVE_CREDENTIALS);
    
    // ตั้งค่า Authentication
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });
    
    return google.drive({ version: "v3", auth });
  } catch (error) {
    console.error("❌ Error setting up Google Drive:", error.message);
    throw error;
  }
}

/**
 * สร้างโฟลเดอร์ใน Google Drive (ถ้ายังไม่มี)
 */
async function createFolderIfNotExists(drive, folderName, parentFolderId) {
  try {
    // ค้นหาโฟลเดอร์ที่มีอยู่
    const searchResponse = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and parents in '${parentFolderId}' and trashed=false`,
      fields: 'files(id, name)',
    });
    
    if (searchResponse.data.files.length > 0) {
      console.log(`📁 Folder '${folderName}' already exists`);
      return searchResponse.data.files[0].id;
    }
    
    // สร้างโฟลเดอร์ใหม่
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    };
    
    const folderResponse = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id, name',
    });
    
    console.log(`✅ Created folder '${folderName}' with ID: ${folderResponse.data.id}`);
    return folderResponse.data.id;
    
  } catch (error) {
    console.error(`❌ Error creating folder '${folderName}':`, error.message);
    throw error;
  }
}

/**
 * อัปโหลดไฟล์ไปยัง Google Drive
 */
async function uploadFileToDrive(drive, filePath, fileName, folderId) {
  try {
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };
    
    const media = {
      mimeType: getMimeType(fileName),
      body: fs.createReadStream(filePath),
    };
    
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, webViewLink',
    });
    
    console.log(`✅ Uploaded '${fileName}' successfully`);
    console.log(`📎 View link: ${response.data.webViewLink}`);
    
    return response.data;
    
  } catch (error) {
    console.error(`❌ Error uploading '${fileName}':`, error.message);
    throw error;
  }
}

/**
 * กำหนด MIME type ตามนามสกุลไฟล์
 */
function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.csv': 'text/csv',
    '.html': 'text/html',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * อัปโหลดไฟล์ทั้งหมดจากโฟลเดอร์
 */
async function uploadAllFiles() {
  console.log('🚀 Starting Google Drive upload...');
  
  try {
    const drive = setupGoogleDrive();
    const destinationDir = path.join(__dirname, '../destination');
    const baseFolderId = process.env.GDRIVE_FOLDER_ID || '1VdW0hPyTBcpuLP19Jz-8Odat0Q6UwR0a';
    const targetFolderName = process.env.TARGET_FOLDER || 'notion-backup';
    
    // ตรวจสอบว่ามีโฟลเดอร์ destination หรือไม่
    if (!fs.existsSync(destinationDir)) {
      console.error(`❌ Destination directory not found: ${destinationDir}`);
      process.exit(1);
    }
    
    // สร้างโฟลเดอร์สำหรับวันที่
    const dateFolder = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const targetFolderId = await createFolderIfNotExists(drive, targetFolderName, baseFolderId);
    const dateFolderId = await createFolderIfNotExists(drive, dateFolder, targetFolderId);
    
    // ดึงรายชื่อไฟล์ทั้งหมดในโฟลเดอร์
    const files = fs.readdirSync(destinationDir).filter(file => {
      return fs.statSync(path.join(destinationDir, file)).isFile();
    });
    
    if (files.length === 0) {
      console.log('⚠️ No files found to upload');
      return;
    }
    
    console.log(`📂 Found ${files.length} files to upload`);
    
    const uploadResults = [];
    
    // อัปโหลดแต่ละไฟล์
    for (const file of files) {
      const filePath = path.join(destinationDir, file);
      try {
        const result = await uploadFileToDrive(drive, filePath, file, dateFolderId);
        uploadResults.push({
          fileName: file,
          status: 'success',
          fileId: result.id,
          webViewLink: result.webViewLink
        });
      } catch (error) {
        console.error(`❌ Failed to upload ${file}:`, error.message);
        uploadResults.push({
          fileName: file,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    // สร้างรายงานผลการอัปโหลด
    const report = {
      timestamp: new Date().toISOString(),
      totalFiles: files.length,
      successfulUploads: uploadResults.filter(r => r.status === 'success').length,
      failedUploads: uploadResults.filter(r => r.status === 'failed').length,
      targetFolder: `${targetFolderName}/${dateFolder}`,
      results: uploadResults
    };
    
    // บันทึกรายงาน
    const reportPath = path.join(destinationDir, 'upload-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // แสดงสรุปผล
    console.log('\n📋 Upload Summary:');
    console.log(`├── Total files: ${report.totalFiles}`);
    console.log(`├── Successful: ${report.successfulUploads}`);
    console.log(`├── Failed: ${report.failedUploads}`);
    console.log(`└── Target folder: ${report.targetFolder}`);
    
    if (report.successfulUploads > 0) {
      console.log('\n🔗 Uploaded files:');
      uploadResults
        .filter(r => r.status === 'success')
        .forEach(r => {
          console.log(`├── ${r.fileName}: ${r.webViewLink}`);
        });
    }
    
    if (report.failedUploads > 0) {
      console.log('\n❌ Failed uploads:');
      uploadResults
        .filter(r => r.status === 'failed')
        .forEach(r => {
          console.log(`├── ${r.fileName}: ${r.error}`);
        });
      process.exit(1);
    }
    
    console.log('\n✅ Google Drive upload completed successfully!');
    
  } catch (error) {
    console.error('❌ Upload process failed:', error.message);
    process.exit(1);
  }
}

/**
 * อัปโหลดไฟล์เดียว (สำหรับใช้แยก)
 */
async function uploadSingleFile(filePath, fileName, targetFolder = 'notion-backup') {
  try {
    const drive = setupGoogleDrive();
    const baseFolderId = process.env.GDRIVE_FOLDER_ID || '1VdW0hPyTBcpuLP19Jz-8Odat0Q6UwR0a';
    
    const targetFolderId = await createFolderIfNotExists(drive, targetFolder, baseFolderId);
    const result = await uploadFileToDrive(drive, filePath, fileName, targetFolderId);
    
    return result;
  } catch (error) {
    console.error(`❌ Error uploading single file:`, error.message);
    throw error;
  }
}

// เรียกใช้งานเมื่อรันสคริปต์โดยตรง
if (require.main === module) {
  uploadAllFiles().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = {
  uploadAllFiles,
  uploadSingleFile,
  setupGoogleDrive,
  createFolderIfNotExists,
  uploadFileToDrive
};
