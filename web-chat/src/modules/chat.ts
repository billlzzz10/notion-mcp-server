// === 🏰 Chat Management ===
import { ChatSession, ChatMessage } from '../types/index.js';
import { showToast } from '../utils/toast.js';

export let chatSessions: { [key: string]: ChatSession } = {};
export let activeChatId: string = '';

let chatList: HTMLElement;
let chatTitle: HTMLElement;
let chatContainer: HTMLElement;

export function initializeChatManager() {
    chatList = document.getElementById('chat-list')!;
    chatTitle = document.getElementById('chat-title')!;
    chatContainer = document.getElementById('chat-container')!;
    
    loadChatSessions();
    
    // Create initial chat if none exists
    if (Object.keys(chatSessions).length === 0) {
        createNewChat();
    } else {
        // Load the first chat
        const firstChatId = Object.keys(chatSessions)[0];
        switchToChat(firstChatId);
    }
    
    updateChatList();
}

export function createNewChat(): string {
    const chatId = `chat_${Date.now()}`;
    const newChat: ChatSession = {
        id: chatId,
        name: 'การสนทนาใหม่',
        history: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    chatSessions[chatId] = newChat;
    activeChatId = chatId;
    
    updateChatList();
    updateChatTitle();
    clearChatContainer();
    saveChatSessions();
    
    showToast('💬 สร้างการสนทนาใหม่แล้ว', 'success');
    return chatId;
}

export function switchToChat(chatId: string) {
    if (!chatSessions[chatId]) return;
    
    activeChatId = chatId;
    updateChatTitle();
    renderChatHistory();
    updateChatList();
}

export function renameChat(chatId: string, newName: string, showToastMsg = true) {
    if (!chatSessions[chatId]) return;
    
    chatSessions[chatId].name = newName;
    chatSessions[chatId].updatedAt = new Date();
    
    updateChatList();
    if (chatId === activeChatId) {
        updateChatTitle();
    }
    saveChatSessions();
    if(showToastMsg) showToast('💾 เปลี่ยนชื่อการสนทนาแล้ว!', 'success');
}

export function deleteChat(chatId: string) {
    if (!chatSessions[chatId]) return;
    
    delete chatSessions[chatId];
    
    // If deleted chat was active, switch to another
    if (chatId === activeChatId) {
        const remainingChats = Object.keys(chatSessions);
        if (remainingChats.length > 0) {
            switchToChat(remainingChats[0]);
        } else {
            createNewChat();
        }
    }
    
    updateChatList();
    saveChatSessions();
}

export function addMessage(message: ChatMessage) {
    if (!chatSessions[activeChatId]) return;
    
    chatSessions[activeChatId].history.push(message);
    chatSessions[activeChatId].updatedAt = new Date();
    
    // Auto-rename chat based on first user message
    if (message.type === 'user' && chatSessions[activeChatId].history.length === 1) {
        const shortName = message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '');
        renameChat(activeChatId, shortName, false);
    }
    
    renderMessage(message);
    saveChatSessions();
}

function updateChatList() {
    chatList.innerHTML = '';
    
    Object.values(chatSessions)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .forEach(chat => {
            const item = document.createElement('div');
            item.className = `chat-list-item ${chat.id === activeChatId ? 'active' : ''}`;
            item.innerHTML = `
                <span class="chat-list-item-name">${chat.name}</span>
                <div class="chat-actions">
                    <button onclick="window.editChatName('${chat.id}')" title="แก้ไขชื่อ">✏️</button>
                    <button onclick="window.deleteChatItem('${chat.id}')" title="ลบ">🗑️</button>
                </div>
            `;
            item.addEventListener('click', () => switchToChat(chat.id));
            chatList.appendChild(item);
        });
}

function updateChatTitle() {
    if (chatSessions[activeChatId]) {
        chatTitle.textContent = chatSessions[activeChatId].name;
    }
}

function clearChatContainer() {
    chatContainer.innerHTML = '';
}

function renderChatHistory() {
    clearChatContainer();
    
    if (chatSessions[activeChatId]) {
        chatSessions[activeChatId].history.forEach(message => {
            renderMessage(message);
        });
    }
}

function renderMessage(message: ChatMessage) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type}`;
    messageDiv.innerHTML = `
        <div class="message-content">${formatMessageContent(message.content)}</div>
        <div class="message-actions">
            <button class="message-action-button" onclick="window.copyMessage('${message.id}')">📋 คัดลอก</button>
            <button class="message-action-button" onclick="window.saveToMCP('${message.id}')">💾 บันทึก MCP</button>
        </div>
    `;
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function formatMessageContent(content: string): string {
    // Basic markdown-like formatting
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
}

export function saveChatSessions() {
    localStorage.setItem('ashvalChatSessions', JSON.stringify(chatSessions));
}

function loadChatSessions() {
    const saved = localStorage.getItem('ashvalChatSessions');
    if (saved) {
        const parsed = JSON.parse(saved);
        chatSessions = {};
        
        // Convert date strings back to Date objects
        Object.values(parsed).forEach((session: any) => {
            chatSessions[session.id] = {
                ...session,
                createdAt: new Date(session.createdAt),
                updatedAt: new Date(session.updatedAt),
                history: session.history.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }))
            };
        });
    }
}

// Attach functions to window for onclick access
(window as any).editChatName = (chatId: string) => {
    const newName = prompt('ชื่อใหม่:', chatSessions[chatId]?.name || '');
    if (newName && newName.trim()) {
        renameChat(chatId, newName.trim());
    }
};

(window as any).deleteChatItem = (chatId: string) => {
    if (confirm('ลบการสนทนานี้?')) {
        deleteChat(chatId);
    }
};

(window as any).copyMessage = async (messageId: string) => {
    // Find message in current chat
    const message = chatSessions[activeChatId]?.history.find(m => m.id === messageId);
    if (message) {
        try {
            await navigator.clipboard.writeText(message.content);
            showToast('📋 คัดลอกข้อความแล้ว!', 'success');
        } catch (error) {
            console.error('Copy failed:', error);
        }
    }
};

(window as any).saveToMCP = async (messageId: string) => {
    const message = chatSessions[activeChatId]?.history.find(m => m.id === messageId);
    if (message) {
        try {
            const { summarizeAndSaveToMCP } = await import('./notion.js');
            const result = await summarizeAndSaveToMCP({
                content: message.content,
                title: `บันทึกจากแชท ${new Date().toLocaleDateString('th-TH')}`
            });
            
            if (result.success) {
                showToast('💾 บันทึกเข้า MCP แล้ว!', 'success');
            } else {
                showToast(`❌ ${result.error}`, 'error');
            }
        } catch (error: any) {
            showToast(`❌ เกิดข้อผิดพลาด: ${error.message}`, 'error');
        }
    }
};

export function getCurrentChat(): ChatSession | null {
    return chatSessions[activeChatId] || null;
}
