/**
 * Test Google Drive Integration
 * ทดสอบการทำงานของระบบ Google Drive upload
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import functions
const { uploadSingleFile, setupGoogleDrive } = require('./upload-to-drive');

async function testGoogleDriveIntegration() {
  console.log('🧪 Testing Google Drive Integration...\n');

  // 1. ตรวจสอบ Environment Variables
  console.log('1️⃣ Checking Environment Variables:');
  const requiredEnvs = ['GDRIVE_CREDENTIALS', 'GDRIVE_FOLDER_ID'];
  const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
  
  if (missingEnvs.length > 0) {
    console.error(`❌ Missing environment variables: ${missingEnvs.join(', ')}`);
    console.log('📖 Please see GDRIVE-SETUP-GUIDE.md for setup instructions');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set\n');

  // 2. ทดสอบการเชื่อมต่อ Google Drive API
  console.log('2️⃣ Testing Google Drive API Connection:');
  try {
    const drive = setupGoogleDrive();
    console.log('✅ Google Drive API connection successful\n');
  } catch (error) {
    console.error('❌ Google Drive API connection failed:', error.message);
    process.exit(1);
  }

  // 3. สร้างไฟล์ทดสอบ
  console.log('3️⃣ Creating test file:');
  const testData = {
    test: true,
    timestamp: new Date().toISOString(),
    message: 'UnicornX Google Drive integration test',
    metadata: {
      version: '1.0.0',
      platform: process.platform,
      nodeVersion: process.version
    }
  };

  const testDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const testFileName = `gdrive-test-${Date.now()}.json`;
  const testFilePath = path.join(testDir, testFileName);
  fs.writeFileSync(testFilePath, JSON.stringify(testData, null, 2));
  
  console.log(`✅ Test file created: ${testFileName}\n`);

  // 4. ทดสอบการอัปโหลด
  console.log('4️⃣ Testing file upload to Google Drive:');
  try {
    const uploadResult = await uploadSingleFile(
      testFilePath, 
      testFileName, 
      'unicorn-test'
    );

    console.log('✅ Upload successful!');
    console.log(`📁 File ID: ${uploadResult.id}`);
    console.log(`🔗 View Link: ${uploadResult.webViewLink}\n`);

    // ลบไฟล์ทดสอบ
    fs.unlinkSync(testFilePath);
    console.log('🗑️ Test file cleaned up locally\n');

    // 5. สรุปผล
    console.log('📋 Test Summary:');
    console.log('├── ✅ Environment variables: OK');
    console.log('├── ✅ Google Drive API: Connected');
    console.log('├── ✅ File creation: OK');
    console.log('├── ✅ File upload: Successful');
    console.log('└── ✅ Cleanup: Complete\n');

    console.log('🎉 All tests passed! Google Drive integration is working correctly.');
    console.log('🚀 You can now use the backup features in GitHub Actions and UnicornX.');

  } catch (error) {
    console.error('❌ Upload test failed:', error.message);
    
    // ลบไฟล์ทดสอบถ้ามี
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    
    process.exit(1);
  }
}

// เรียกใช้งานทดสอบ
if (require.main === module) {
  testGoogleDriveIntegration().catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  });
}

module.exports = { testGoogleDriveIntegration };
