const express = require('express');
const path = require('path');
const https = require('https');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Gemini AI Integration
async function callGeminiAI(prompt) {
  const API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
  
  const data = {
    contents: [{
      parts: [{
        text: `คุณเป็น UnicornX AI Assistant ที่ช่วยจัดการงาน Notion และพัฒนาโปรเจค โปรดตอบเป็นภาษาไทยและใช้ emoji ให้เหมาะสม:\n\n${prompt}`
      }]
    }]
  };

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(data).length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.candidates && result.candidates[0]) {
            resolve(result.candidates[0].content.parts[0].text);
          } else {
            resolve('ขออภัยครับ ไม่สามารถประมวลผลได้ในขณะนี้');
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}

// OpenAI Integration (Alternative)
async function callOpenAI(prompt) {
  const API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY';
  
  const data = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "คุณเป็น UnicornX AI Assistant ที่ช่วยจัดการงาน Notion และพัฒนาโปรเจค โปรดตอบเป็นภาษาไทยและใช้ emoji ให้เหมาะสม"
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 500,
    temperature: 0.7
  };

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': JSON.stringify(data).length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.choices && result.choices[0]) {
            resolve(result.choices[0].message.content);
          } else {
            resolve('ขออภัยครับ ไม่สามารถประมวลผลได้ในขณะนี้');
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: '🦄 UnicornX AI is running!',
    ai_status: 'ready'
  });
});

app.get('/api/dashboard', (req, res) => {
  res.json({
    status: 'online',
    server: 'UnicornX AI v1.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    ai_engine: 'Gemini/OpenAI Ready'
  });
});

// AI Command Handler with Real AI
app.post('/api/command', async (req, res) => {
  const { command } = req.body;
  
  if (!command) {
    return res.status(400).json({
      error: 'Command is required',
      message: 'กรุณาระบุคำสั่งที่ต้องการ'
    });
  }

  console.log(`📨 Received command: ${command}`);
  
  try {
    let response = '';
    
    // Check if we have API keys for real AI
    if (process.env.GEMINI_API_KEY) {
      console.log('🤖 Using Gemini AI...');
      response = await callGeminiAI(command);
    } else if (process.env.OPENAI_API_KEY) {
      console.log('🤖 Using OpenAI...');
      response = await callOpenAI(command);
    } else {
      // Fallback to simple responses if no AI API available
      console.log('💭 Using fallback responses...');
      response = getFallbackResponse(command);
    }
    
    res.json({
      command: command,
      response: response,
      timestamp: new Date().toISOString(),
      processed: true,
      ai_powered: !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY)
    });
    
  } catch (error) {
    console.error('❌ AI Error:', error);
    res.json({
      command: command,
      response: '❌ เกิดข้อผิดพลาดในการประมวลผล AI: ' + error.message + '\n\nกรุณาลองใหม่อีกครั้ง',
      timestamp: new Date().toISOString(),
      processed: false,
      error: true
    });
  }
});

// Fallback responses when no AI API is available
function getFallbackResponse(command) {
  if (command.includes('สวัสดี') || command.includes('hello')) {
    return '🦄 สวัสดีครับ! ผม UnicornX AI Assistant\n\n💡 เพื่อการทำงานที่ดีที่สุด กรุณาตั้งค่า API Key:\n• GEMINI_API_KEY สำหรับ Google Gemini\n• OPENAI_API_KEY สำหรับ OpenAI\n\nในระหว่างนี้ผมจะใช้ response แบบง่ายๆ ก่อนนะครับ';
  } 
  else if (command.includes('สร้างโปรเจค') || command.includes('project')) {
    return '📝 กำลังสร้างโปรเจคใหม่...\n\n✅ โปรเจคถูกสร้างแล้ว!\n- ชื่อ: ' + (command.match(/สร้างโปรเจค[\s]*(.+)/) ? command.match(/สร้างโปรเจค[\s]*(.+)/)[1] : 'โปรเจคใหม่') + '\n- สถานะ: เริ่มต้น\n- วันที่สร้าง: ' + new Date().toLocaleString('th-TH') + '\n\n💡 เชื่อมต่อ AI จริงเพื่อการจัดการที่ดีกว่า!';
  }
  else if (command.includes('รายการงาน') || command.includes('แสดงรายการงาน') || command.includes('task')) {
    return '📋 รายการงานในระบบ:\n\n✅ งานที่เสร็จแล้ว:\n• สร้าง UnicornX Server\n• ตั้งค่า AI Dashboard\n• เชื่อมต่อ Notion API\n\n🔄 งานที่กำลังดำเนินการ:\n• เชื่อมต่อ AI จริง\n• ปรับปรุง UI/UX\n\n📝 งานที่ยังไม่เริ่ม:\n• Deploy to production\n• เพิ่มฟีเจอร์ใหม่\n• ทดสอบระบบ\n\n💡 ตั้งค่า API Key เพื่อการวิเคราะห์ที่ดีกว่า!';
  }
  else {
    return '🤖 ขณะนี้ผมทำงานในโหมดพื้นฐาน\n\n💡 เพื่อการแชทที่ดีกว่า กรุณาตั้งค่า:\n• GEMINI_API_KEY=your_key\n• OPENAI_API_KEY=your_key\n\n📝 คำสั่งที่ใช้ได้:\n• สวัสดี\n• สร้างโปรเจค [ชื่อ]\n• แสดงรายการงาน\n• ช่วยเขียนโค้ด\n• วิเคราะห์ข้อมูล\n\n🔧 หรือลองพิมพ์: "ตั้งค่า API Key"';
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🦄 UnicornX AI server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Status: ${process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY ? 'Ready' : 'Setup API Key Required'}`);
});

module.exports = app;
