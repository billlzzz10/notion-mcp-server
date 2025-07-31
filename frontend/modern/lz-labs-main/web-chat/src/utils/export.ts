// === 🏰 Export Functions ===
import { getCurrentChat } from '../modules/chat.js';
import { showToast } from './toast.js';

export function exportChat(format: string) {
    const session = getCurrentChat();
    if (!session || session.history.length === 0) {
        showToast('❌ ไม่มีข้อความให้ Export', 'error');
        return;
    }

    let content = '';
    let filename = '';

    switch (format) {
        case 'txt':
            content = generateTextExport(session);
            filename = `${session.name}.txt`;
            break;
        case 'md':
            content = generateMarkdownExport(session);
            filename = `${session.name}.md`;
            break;
        case 'html':
            content = generateHTMLExport(session);
            filename = `${session.name}.html`;
            break;
        case 'pdf':
            // For PDF, we'll just show a message for now
            showToast('📄 PDF Export กำลังพัฒนา...', 'info');
            return;
        default:
            showToast('❌ รูปแบบไฟล์ไม่ถูกต้อง', 'error');
            return;
    }

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`📥 Export เป็น ${format.toUpperCase()} สำเร็จ!`, 'success');
}

function generateTextExport(session: any): string {
    let content = `🏰 Ashval Chat Export\n`;
    content += `📝 ชื่อการสนทนา: ${session.name}\n`;
    content += `📅 สร้างเมื่อ: ${session.createdAt.toLocaleString('th-TH')}\n`;
    content += `🔄 อัพเดตล่าสุด: ${session.updatedAt.toLocaleString('th-TH')}\n`;
    content += `💬 จำนวนข้อความ: ${session.history.length}\n\n`;
    content += `${'='.repeat(50)}\n\n`;

    session.history.forEach((message: any, index: number) => {
        const speaker = message.type === 'user' ? '👤 ผู้ใช้' : '🤖 AI';
        content += `[${index + 1}] ${speaker} (${message.timestamp.toLocaleString('th-TH')})\n`;
        content += `${message.content}\n\n`;
    });

    return content;
}

function generateMarkdownExport(session: any): string {
    let content = `# 🏰 Ashval Chat Export\n\n`;
    content += `**📝 ชื่อการสนทนา:** ${session.name}\n`;
    content += `**📅 สร้างเมื่อ:** ${session.createdAt.toLocaleString('th-TH')}\n`;
    content += `**🔄 อัพเดตล่าสุด:** ${session.updatedAt.toLocaleString('th-TH')}\n`;
    content += `**💬 จำนวนข้อความ:** ${session.history.length}\n\n`;
    content += `---\n\n`;

    session.history.forEach((message: any, index: number) => {
        const speaker = message.type === 'user' ? '👤 **ผู้ใช้**' : '🤖 **AI**';
        content += `## ${speaker}\n`;
        content += `*${message.timestamp.toLocaleString('th-TH')}*\n\n`;
        content += `${message.content}\n\n`;
    });

    return content;
}

function generateHTMLExport(session: any): string {
    let content = `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${session.name} - Ashval Chat Export</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .header { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .message { margin-bottom: 20px; padding: 15px; border-radius: 8px; }
        .user { background: #3b82f6; color: white; margin-left: 20%; }
        .ai { background: #f1f5f9; border: 1px solid #e2e8f0; margin-right: 20%; }
        .timestamp { font-size: 0.8em; opacity: 0.7; margin-bottom: 5px; }
        .content { white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏰 Ashval Chat Export</h1>
        <p><strong>📝 ชื่อการสนทนา:</strong> ${session.name}</p>
        <p><strong>📅 สร้างเมื่อ:</strong> ${session.createdAt.toLocaleString('th-TH')}</p>
        <p><strong>🔄 อัพเดตล่าสุด:</strong> ${session.updatedAt.toLocaleString('th-TH')}</p>
        <p><strong>💬 จำนวนข้อความ:</strong> ${session.history.length}</p>
    </div>`;

    session.history.forEach((message: any) => {
        const speaker = message.type === 'user' ? '👤 ผู้ใช้' : '🤖 AI';
        content += `
    <div class="message ${message.type}">
        <div class="timestamp">${speaker} - ${message.timestamp.toLocaleString('th-TH')}</div>
        <div class="content">${message.content}</div>
    </div>`;
    });

    content += `
</body>
</html>`;

    return content;
}
