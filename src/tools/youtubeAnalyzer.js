import { notionFetch } from '../services/notion.js';

/**
 * YouTube Video Analyzer Tool
 * วิเคราะห์วิดีโอ YouTube ผ่าน Gemini API
 */
export const youtubeAnalyzer = {
  name: 'analyzeYouTubeVideo',
  description: 'วิเคราะห์วิดีโอ YouTube โดยใช้ Gemini API และบันทึกผลลัพธ์ลง Notion',
  inputSchema: {
    type: 'object',
    properties: {
      youtubeUrl: {
        type: 'string',
        description: 'URL ของวิดีโอ YouTube ที่ต้องการวิเคราะห์'
      },
      analysisType: {
        type: 'string',
        enum: ['summary', 'transcript', 'keywords', 'sentiment', 'full'],
        description: 'ประเภทการวิเคราะห์: summary=สรุป, transcript=คำบรรยาย, keywords=คำสำคัญ, sentiment=อารมณ์, full=ครบถ้วน'
      },
      saveToNotion: {
        type: 'boolean',
        default: true,
        description: 'บันทึกผลลัพธ์ลง Notion หรือไม่'
      },
      notionDatabaseId: {
        type: 'string',
        description: 'Database ID ของ Notion ที่จะบันทึกผลลัพธ์ (ถ้าไม่ระบุจะใช้ default)'
      }
    },
    required: ['youtubeUrl', 'analysisType']
  }
};

export async function analyzeYouTubeVideo(args) {
  try {
    const { youtubeUrl, analysisType, saveToNotion = true, notionDatabaseId } = args;
    
    console.log(`🎥 กำลังวิเคราะห์วิดีโอ YouTube: ${youtubeUrl}`);
    
    // Extract video ID from URL
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      throw new Error('ไม่สามารถแยก Video ID จาก URL ได้');
    }
    
    // Call Gemini API for YouTube analysis
    const analysisResult = await callGeminiForYouTube(videoId, analysisType);
    
    // Save to Notion if requested
    let notionPageId = null;
    if (saveToNotion) {
      notionPageId = await saveAnalysisToNotion(analysisResult, notionDatabaseId);
    }
    
    return {
      success: true,
      videoId,
      analysisType,
      result: analysisResult,
      notionPageId,
      message: `วิเคราะห์วิดีโอ YouTube เสร็จสิ้น${notionPageId ? ' และบันทึกลง Notion แล้ว' : ''}`
    };
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการวิเคราะห์ YouTube:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function callGeminiForYouTube(videoId, analysisType) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY ไม่ได้ตั้งค่าใน environment variables');
  }
  
  const prompts = {
    summary: 'สรุปเนื้อหาหลักของวิดีโอนี้ในรูปแบบที่กระชับและเข้าใจง่าย',
    transcript: 'สร้าง transcript ภาษาไทยของวิดีโอนี้',
    keywords: 'แยกคำสำคัญและหัวข้อหลักจากวิดีโอนี้',
    sentiment: 'วิเคราะห์อารมณ์และโทนเสียงของวิดีโอนี้',
    full: 'วิเคราะห์วิดีโอนี้ครบถ้วน รวมถึง สรุปเนื้อหา, คำสำคัญ, อารมณ์, และข้อมูลที่น่าสนใจ'
  };
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${prompts[analysisType]} จากวิดีโอ YouTube ID: ${videoId}`
          }]
        }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!analysisText) {
      throw new Error('ไม่ได้รับผลลัพธ์จาก Gemini API');
    }
    
    return {
      videoId,
      analysisType,
      content: analysisText,
      timestamp: new Date().toISOString(),
      model: model
    };
    
  } catch (error) {
    throw new Error(`เกิดข้อผิดพลาดในการเรียก Gemini API: ${error.message}`);
  }
}

async function saveAnalysisToNotion(analysisResult, databaseId) {
  try {
    const dbId = databaseId || process.env.NOTION_YOUTUBE_ANALYSIS_DB_ID || process.env.NOTION_PROJECTS_DB_ID;
    
    if (!dbId) {
      throw new Error('ไม่พบ Database ID สำหรับบันทึกผลลัพธ์');
    }
    
    const pageData = {
      parent: { database_id: dbId },
      properties: {
        Name: {
          title: [{
            text: {
              content: `YouTube Analysis - ${analysisResult.videoId}`
            }
          }]
        },
        Type: {
          select: {
            name: 'YouTube Analysis'
          }
        },
        Status: {
          select: {
            name: 'Completed'
          }
        },
        'Analysis Type': {
          select: {
            name: analysisResult.analysisType
          }
        },
        'Video ID': {
          rich_text: [{
            text: {
              content: analysisResult.videoId
            }
          }]
        },
        'Created Date': {
          date: {
            start: analysisResult.timestamp
          }
        }
      },
      children: [{
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{
            type: 'text',
            text: {
              content: `YouTube Video Analysis (${analysisResult.analysisType})`
            }
          }]
        }
      }, {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            type: 'text',
            text: {
              content: `Video ID: ${analysisResult.videoId}`
            }
          }]
        }
      }, {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            type: 'text',
            text: {
              content: `Analysis Date: ${new Date(analysisResult.timestamp).toLocaleString('th-TH')}`
            }
          }]
        }
      }, {
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{
            type: 'text',
            text: {
              content: 'ผลการวิเคราะห์'
            }
          }]
        }
      }, {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            type: 'text',
            text: {
              content: analysisResult.content
            }
          }]
        }
      }]
    };
    
    const response = await notionFetch('/pages', {
      method: 'POST',
      body: JSON.stringify(pageData)
    });
    
    console.log('✅ บันทึกผลการวิเคราะห์ลง Notion เรียบร้อย');
    return response.id;
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการบันทึกลง Notion:', error);
    throw error;
  }
}
