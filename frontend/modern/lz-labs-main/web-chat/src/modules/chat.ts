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
    chatList.textContent = ''; // Use textContent for safe clearing
    
    Object.values(chatSessions)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .forEach(chat => {
            const item = document.createElement('div');
            item.className = `chat-list-item ${chat.id === activeChatId ? 'active' : ''}`;
            item.dataset.chatId = chat.id;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'chat-list-item-name';
            nameSpan.textContent = chat.name;
            item.appendChild(nameSpan);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'chat-actions';

            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.title = 'แก้ไขชื่อ';
            editButton.textContent = '✏️';
            actionsDiv.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.title = 'ลบ';
            deleteButton.textContent = '🗑️';
            actionsDiv.appendChild(deleteButton);

            item.appendChild(actionsDiv);

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
    chatContainer.textContent = ''; // Use textContent for safe clearing
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

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessageContent(message.content); // Kept for formatting, as it's a LOW risk

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'message-actions';

    const copyButton = document.createElement('button');
    copyButton.className = 'message-action-button';
    copyButton.type = 'button';
    copyButton.textContent = '📋 คัดลอก';

    const saveButton = document.createElement('button');
    saveButton.className = 'message-action-button';
    saveButton.type = 'button';
    saveButton.textContent = '💾 บันทึก MCP';

    actionsDiv.appendChild(copyButton);
    actionsDiv.appendChild(saveButton);

    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(actionsDiv);
    
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

// Event delegation for chat list actions
chatList?.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const parentItem = target.closest('.chat-list-item') as HTMLElement;
    if (!parentItem) return;
    const chatId = Object.values(chatSessions).find(chat => chat.name === parentItem.querySelector('.chat-list-item-name')?.textContent)?.id;
    if (!chatId) return;

    if (target.closest('button[title="แก้ไขชื่อ"]')) {
        const newName = prompt('ชื่อใหม่:', chatSessions[chatId]?.name || '');
        if (newName && newName.trim()) {
            renameChat(chatId, newName.trim());
        }
        event.stopPropagation();
    } else if (target.closest('button[title="ลบ"]')) {
        if (confirm('ลบการสนทนานี้?')) {
            deleteChat(chatId);
        }
        event.stopPropagation();
    }
});

// Event delegation for message actions
chatContainer?.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement;
    const messageDiv = target.closest('.message') as HTMLElement;
    if (!messageDiv) return;
    const messageIndex = Array.from(chatContainer.children).indexOf(messageDiv);
    const message = chatSessions[activeChatId]?.history[messageIndex];
    if (!message) return;

    if (target.classList.contains('message-action-button')) {
        if (target.textContent?.includes('📋')) {
            try {
                await navigator.clipboard.writeText(message.content);
                showToast('📋 คัดลอกข้อความแล้ว!', 'success');
            } catch (error) {
                console.error('Copy failed:', error);
            }
        } else if (target.textContent?.includes('💾')) {
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
        event.stopPropagation();
    }
});

export function getCurrentChat(): ChatSession | null {
    return chatSessions[activeChatId] || null;
}
