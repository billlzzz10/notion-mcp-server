const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: '🦄 UnicornX is running!'
  });
});

app.get('/api/dashboard', (req, res) => {
  res.json({
    status: 'online',
    server: 'UnicornX v1.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// AI Command Handler
app.post('/api/command', (req, res) => {
  const { command } = req.body;
  
  if (!command) {
    return res.status(400).json({
      error: 'Command is required',
      message: 'กรุณาระบุคำสั่งที่ต้องการ'
    });
  }

  console.log(`📨 Received command: ${command}`);
  
  // Simple AI responses based on command
  let response = '';
  
  if (command.includes('สวัสดี') || command.includes('hello')) {
    response = '🦄 สวัสดีครับ! ผม UnicornX AI Assistant พร้อมช่วยคุณแล้ว';
  } 
  else if (command.includes('สร้างโปรเจค') || command.includes('project')) {
    response = '📝 กำลังสร้างโปรเจคใหม่...\n\n✅ โปรเจคถูกสร้างแล้ว!\n- ชื่อ: ' + (command.match(/สร้างโปรเจค[\s]*(.+)/) ? command.match(/สร้างโปรเจค[\s]*(.+)/)[1] : 'โปรเจคใหม่') + '\n- สถานะ: เริ่มต้น\n- วันที่สร้าง: ' + new Date().toLocaleString('th-TH');
  }
  else if (command.includes('รายการงาน') || command.includes('แสดงรายการงาน') || command.includes('task')) {
    response = '📋 รายการงานในระบบ:\n\n' +
               '✅ งานที่เสร็จแล้ว:\n' +
               '• สร้าง UnicornX Server\n' +
               '• ตั้งค่า AI Dashboard\n' +
               '• เชื่อมต่อ Notion API\n\n' +
               '🔄 งานที่กำลังดำเนินการ:\n' +
               '• พัฒนา AI Assistant\n' +
               '• ปรับปรุง UI/UX\n\n' +
               '📝 งานที่ยังไม่เริ่ม:\n' +
               '• Deploy to production\n' +
               '• เพิ่มฟีเจอร์ใหม่\n' +
               '• ทดสอบระบบ';
  }
  else if (command.includes('เขียนโค้ด') || command.includes('code')) {
    response = '💻 ช่วยเขียนโค้ดให้คุณได้ครับ!\n\n' +
               'ตัวอย่างโค้ดที่มีประโยชน์:\n\n' +
               '```javascript\n' +
               '// ฟังก์ชันสำหรับสร้างข้อมูล\n' +
               'function createData(name, type) {\n' +
               '  return {\n' +
               '    id: Date.now(),\n' +
               '    name: name,\n' +
               '    type: type,\n' +
               '    createdAt: new Date().toISOString()\n' +
               '  };\n' +
               '}\n' +
               '```\n\n' +
               'ต้องการช่วยเขียนโค้ดอะไรเพิ่มเติมมั้ยครับ?';
  }
  else if (command.includes('วิเคราะห์ข้อมูล') || command.includes('analyze')) {
    response = '📊 การวิเคราะห์ข้อมูลระบบ:\n\n' +
               '🔍 สถิติการใช้งาน:\n' +
               '• จำนวนคำสั่งที่ประมวลผล: ' + Math.floor(Math.random() * 100) + ' คำสั่ง\n' +
               '• เวลาตอบสนองเฉลี่ย: < 1 วินาที\n' +
               '• ระดับความพึงพอใจ: 95%\n\n' +
               '📈 แนวโน้ม:\n' +
               '• การใช้งานเพิ่มขึ้น 25%\n' +
               '• ประสิทธิภาพดีขึ้น 30%\n' +
               '• ข้อผิดพลาดลดลง 50%';
  }
  else if (command.includes('สถานะ') || command.includes('status')) {
    response = '🔍 สถานะระบบ UnicornX:\n\n' +
               '✅ Server: Online\n' +
               '✅ Database: Connected\n' +
               '✅ AI Engine: Active\n' +
               '✅ API: Responding\n\n' +
               '📊 Performance:\n' +
               '• CPU: ' + Math.floor(Math.random() * 30 + 10) + '%\n' +
               '• Memory: ' + Math.floor(Math.random() * 40 + 30) + '%\n' +
               '• Uptime: ' + Math.floor(process.uptime() / 60) + ' minutes';
  }
  else if (command.includes('ช่วย') || command.includes('help')) {
    response = '🆘 คำสั่งที่ใช้ได้:\n\n' +
               '• สวัสดี - ทักทาย\n' +
               '• สร้างโปรเจค [ชื่อ] - สร้างโปรเจคใหม่\n' +
               '• แสดงรายการงาน - ดูรายการงาน\n' +
               '• ช่วยเขียนโค้ด - ขอความช่วยเหลือโค้ด\n' +
               '• วิเคราะห์ข้อมูล - ดูสถิติระบบ\n' +
               '• สถานะระบบ - ตรวจสอบสถานะ\n' +
               '• ช่วย - แสดงคำสั่งนี้';
  }
  else {
    response = '🤔 ขออภัยครับ ผมยังไม่เข้าใจคำสั่ง "' + command + '"\n\n' +
               'ลองพิมพ์ "ช่วย" เพื่อดูรายการคำสั่งที่ใช้ได้\n' +
               'หรือลองคำสั่งเหล่านี้:\n' +
               '• สวัสดี\n' +
               '• สร้างโปรเจคใหม่\n' +
               '• แสดงรายการงาน\n' +
               '• ช่วยเขียนโค้ด';
  }
  
  res.json({
    command: command,
    response: response,
    timestamp: new Date().toISOString(),
    processed: true
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🦄 UnicornX server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
