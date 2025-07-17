// === 🏰 AI Management ===
import { settings } from './settings.js';
import { showToast } from '../utils/toast.js';

export let ai: any = null;

export async function initializeAI() {
    try {
        showToast('🔄 กำลังโหลดไลบรารี...', 'info');
        
        const { GoogleGenerativeAI } = await import("https://esm.sh/@google/generative-ai@^0.21.0") as any;
        
        if (settings.geminiKey) {
            ai = new GoogleGenerativeAI(settings.geminiKey);
            console.log("✅ Gemini AI initialized with API key from environment");
            showToast('✅ Gemini AI พร้อมใช้งาน! (จาก Environment)', 'success', true);
        } else {
            showToast('⚠️ กรุณาตั้งค่า VITE_GEMINI_API_KEY ใน .env', 'warning', true);
        }
        
        console.log("✅ Libraries loaded successfully");
    } catch (error) {
        console.error("❌ Failed to load libraries:", error);
        showToast('❌ ไม่สามารถโหลดไลบรารีได้', 'error');
    }
}

export async function generateSummary(content: string): Promise<string> {
    if (!ai) throw new Error("AI ไม่พร้อมใช้งาน");
    
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const prompt = `สรุปเนื้อหาต่อไปนี้เป็นประเด็นสำคัญ ๆ ในรูปแบบที่เข้าใจง่าย:\n\n${content}`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
}

export async function evaluateImprovement(oldResponse: string, newResponse: string) {
    if (!ai) {
        return { score: null, analysis: "Cannot evaluate - AI not available" };
    }
    
    try {
        const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const prompt = `เปรียบเทียบคำตอบทั้งสองและให้คะแนนการปรับปรุง (1-10):

คำตอบเก่า: ${oldResponse.substring(0, 500)}

คำตอบใหม่: ${newResponse.substring(0, 500)}

ให้ผลลัพธ์ในรูปแบบ JSON:
{
  "score": [คะแนน 1-10],
  "analysis": "[วิเคราะห์การปรับปรุงสั้นๆ]"
}`;
        
        const result = await model.generateContent(prompt);
        const evaluation = JSON.parse(result.response.text());
        
        return evaluation;
        
    } catch (error) {
        console.error('Evaluation error:', error);
        return { 
            score: 5, 
            analysis: "Auto-evaluation failed, assigned neutral score" 
        };
    }
}

export function calculateSimilarity(text1: string, text2: string): number {
    // Simple similarity calculation based on common words
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    
    return commonWords.length / Math.max(words1.length, words2.length);
}
