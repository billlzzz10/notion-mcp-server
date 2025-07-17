/**
 * UnicornX Google Drive Integration
 * เพิ่ม endpoint สำหรับ backup ข้อมูลไป Google Drive
 */

// เพิ่มใน server.js ของ UnicornX
const { uploadSingleFile } = require('../scripts/upload-to-drive');

/**
 * Backup data to Google Drive endpoint
 */
app.post('/api/backup/gdrive', async (req, res) => {
  try {
    const { data, fileName, targetFolder } = req.body;

    if (!data || !fileName) {
      return res.status(400).json({
        error: 'Invalid configuration',
        message: 'Data and fileName are required'
      });
    }

    logger.info('Creating Google Drive backup', { fileName, targetFolder });

    // สร้างไฟล์ชั่วคราว
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, fileName);
    fs.writeFileSync(tempFilePath, JSON.stringify(data, null, 2));

    // อัปโหลดไป Google Drive
    const result = await uploadSingleFile(tempFilePath, fileName, targetFolder);

    // ลบไฟล์ชั่วคราว
    fs.unlinkSync(tempFilePath);

    logger.info('Google Drive backup completed', { 
      fileName,
      fileId: result.id,
      webViewLink: result.webViewLink
    });

    res.json({
      success: true,
      result: {
        status: 'uploaded',
        fileName,
        fileId: result.id,
        webViewLink: result.webViewLink,
        message: `สำรองข้อมูลไป Google Drive เสร็จสิ้น: ${fileName}`
      }
    });

  } catch (error) {
    logger.error('Error creating Google Drive backup', error.message);
    
    res.status(500).json({
      error: 'Backup failed',
      message: error.message || 'Unknown error occurred'
    });
  }
});

/**
 * Test Google Drive connection
 */
app.get('/api/backup/gdrive/test', async (req, res) => {
  try {
    // ทดสอบการเชื่อมต่อ Google Drive
    const testData = {
      test: true,
      timestamp: new Date().toISOString(),
      message: 'UnicornX Google Drive connection test'
    };

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const testFileName = `unicorn-test-${Date.now()}.json`;
    const tempFilePath = path.join(tempDir, testFileName);
    fs.writeFileSync(tempFilePath, JSON.stringify(testData, null, 2));

    const result = await uploadSingleFile(tempFilePath, testFileName, 'unicorn-test');
    fs.unlinkSync(tempFilePath);

    res.json({
      success: true,
      message: 'Google Drive connection test successful',
      result: {
        fileName: testFileName,
        fileId: result.id,
        webViewLink: result.webViewLink
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Google Drive connection test failed',
      message: error.message
    });
  }
});
