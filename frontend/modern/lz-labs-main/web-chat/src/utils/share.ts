// === 🏰 Share Functions ===
import { getCurrentChat } from '../modules/chat.js';
import { showToast } from './toast.js';

export function createShareMenu(): string {
    return `
        <div id="share-menu" class="actions-menu hidden" style="display: none;">
            <a href="#" onclick="window.shareToPlatform('facebook')">📘 Facebook</a>
            <a href="#" onclick="window.shareToPlatform('twitter')">🐦 Twitter</a>
            <a href="#" onclick="window.shareToPlatform('line')">💚 LINE</a>
            <a href="#" onclick="window.shareToPlatform('telegram')">✈️ Telegram</a>
            <a href="#" onclick="window.shareToPlatform('whatsapp')">💬 WhatsApp</a>
            <a href="#" onclick="window.shareToPlatform('email')">📧 Email</a>
            <a href="#" onclick="window.shareToPlatform('copy')">📋 คัดลอกลิงค์</a>
            <a href="#" onclick="window.shareToPlatform('google-docs')">📄 Google Docs</a>
            <a href="#" onclick="window.shareToPlatform('notion')">📝 Notion</a>
        </div>
    `;
}

export function shareToPlatform(platform: string) {
    const session = getCurrentChat();
    if (!session || session.history.length === 0) {
        showToast('⚠️ ไม่มีการสนทนาที่จะแชร์', 'warning');
        return;
    }

    const chatText = generateShareText(session);
    const encodedText = encodeURIComponent(chatText);
    const subject = encodeURIComponent(`แชร์การสนทนา: ${session.name}`);

    switch (platform) {
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`, '_blank');
            break;
            
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
            break;
            
        case 'line':
            window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}&text=${encodedText}`, '_blank');
            break;
            
        case 'telegram':
            window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodedText}`, '_blank');
            break;
            
        case 'whatsapp':
            window.open(`https://wa.me/?text=${encodedText}`, '_blank');
            break;
            
        case 'email':
            window.open(`mailto:?subject=${subject}&body=${encodedText}`, '_blank');
            break;
            
        case 'copy':
            copyToClipboard(chatText);
            break;
            
        case 'google-docs':
            copyToClipboard(chatText);
            window.open('https://docs.google.com/document/create', '_blank');
            showToast('📄 เปิด Google Docs แล้ว - ข้อความถูกคัดลอกไว้แล้ว กด Ctrl+V เพื่อวาง', 'success');
            break;
            
        case 'notion':
            const notionText = generateNotionText(session);
            copyToClipboard(notionText);
            showToast('📝 คัดลอกข้อความสำหรับ Notion แล้ว - ไปวางใน Notion page', 'success');
            break;
            
        default:
            showToast('❌ แพลตฟอร์มไม่รองรับ', 'error');
    }
}

function generateShareText(session: any): string {
    let text = `🏰 Ashval Chat - ${session.name}\n`;
    text += `📅 ${session.createdAt.toLocaleDateString('th-TH')}\n\n`;
    
    const recentMessages = session.history.slice(-5); // Last 5 messages
    recentMessages.forEach((message: any) => {
        const speaker = message.type === 'user' ? '👤' : '🤖';
        text += `${speaker} ${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}\n\n`;
    });
    
    if (session.history.length > 5) {
        text += `... และอีก ${session.history.length - 5} ข้อความ\n\n`;
    }
    
    text += '🔗 สร้างด้วย Ashval Chat';
    return text;
}

function generateNotionText(session: any): string {
    let text = `# ${session.name}\n\n`;
    text += `**สร้างเมื่อ:** ${session.createdAt.toLocaleDateString('th-TH')}\n`;
    text += `**จำนวนข้อความ:** ${session.history.length}\n\n`;
    text += `---\n\n`;
    
    session.history.forEach((message: any, index: number) => {
        const speaker = message.type === 'user' ? '👤 ผู้ใช้' : '🤖 AI';
        text += `## ${speaker}\n`;
        text += `${message.content}\n\n`;
    });
    
    return text;
}

async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('📋 คัดลอกการสนทนาแล้ว!', 'success');
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('📋 คัดลอกการสนทนาแล้ว!', 'success');
    }
}

// Attach function to window for onclick access
(window as any).shareToPlatform = shareToPlatform;
