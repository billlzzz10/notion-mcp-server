// === 🏰 Ashval Chat v2.1 - Modular Edition ===
import { ChatMessage, FileAttachment } from './types/index.js';
import { initializeToastContainer, showToast } from './utils/toast.js';
import { initializeSettings, toggleTheme, openSettingsModal } from './modules/settings.js';
import { initializeAI, ai } from './modules/ai.js';
import { initializeChatManager, createNewChat, addMessage } from './modules/chat.js';
import { exportChat } from './utils/export.js';
import { createShareMenu, shareToPlatform } from './utils/share.js';

// Global variables
let input: HTMLTextAreaElement;
let promptForm: HTMLFormElement;
let submitButton: HTMLButtonElement;
let fileInput: HTMLInputElement;
let filePreviewContainer: HTMLElement;
let attachFileButton: HTMLElement;
let currentAttachedFile: FileAttachment | null = null;
let isProcessing = false;

// === APP INITIALIZATION ===
async function initializeApp() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
        return;
    }

    console.log("🎬 Initializing Ashval Chat v2.1 (Modular)...");

    // Initialize all modules
    initializeToastContainer();
    initializeSettings();
    initializeChatManager();
    
    // Get DOM elements
    promptForm = document.getElementById('prompt-form') as HTMLFormElement;
    input = document.getElementById('prompt-input') as HTMLTextAreaElement;
    fileInput = document.getElementById('file-input') as HTMLInputElement;
    filePreviewContainer = document.getElementById('file-preview-container')!;
    attachFileButton = document.getElementById('attach-file-button')!;
    submitButton = document.getElementById('submit-button') as HTMLButtonElement;

    // Setup share menu
    const shareButtonContainer = document.querySelector('#share-button')?.parentElement;
    if (shareButtonContainer) {
        shareButtonContainer.innerHTML += createShareMenu();
    }

    // Initialize AI
    await initializeAI();

    // Show welcome toast with "don't show again" option
    setTimeout(() => {
        showToast('🏰 ยินดีต้อนรับสู่ Ashval Chat! กดปุ่มต่างๆ เพื่อสำรวจฟีเจอร์ใหม่', 'info', true);
    }, 1000);

    // Event listeners
    setupEventListeners();
    
    console.log("✅ Ashval Chat initialized successfully!");
}

function setupEventListeners() {
    // Form submission
    promptForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage();
    });
    
    // Input handling
    input.addEventListener('input', () => {
        autoResizeTextarea();
        updateSubmitButtonState();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // File input handler
    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                try {
                    currentAttachedFile = await handleFileUpload(file);
                    showToast(`📎 แนบไฟล์: ${file.name}`, 'success');
                    showFilePreview();
                } catch (error: any) {
                    showToast(`❌ ไม่สามารถแนบไฟล์: ${error.message}`, 'error');
                }
            }
        });
    }

    // Attach file button
    if (attachFileButton) {
        attachFileButton.addEventListener('click', () => {
            fileInput?.click();
        });
    }

    // Header button listeners
    setupHeaderButtons();
}

function setupHeaderButtons() {
    // New chat button
    const newChatButton = document.getElementById('new-chat-button');
    newChatButton?.addEventListener('click', createNewChat);

    // Settings button
    const settingsButton = document.getElementById('settings-button');
    settingsButton?.addEventListener('click', openSettingsModal);

    // Theme toggle
    const themeButton = document.getElementById('theme-toggle-button');
    themeButton?.addEventListener('click', toggleTheme);

    // Dashboard button
    const dashboardButton = document.getElementById('dashboard-button');
    dashboardButton?.addEventListener('click', toggleDashboard);

    // Export button
    const exportButton = document.getElementById('export-button');
    const exportMenu = document.getElementById('export-menu');
    
    exportButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        exportMenu?.classList.toggle('hidden');
    });

    // Export menu items
    exportMenu?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'A') {
            e.preventDefault();
            const format = target.getAttribute('data-format');
            if (format) {
                exportChat(format);
                exportMenu.classList.add('hidden');
            }
        }
    });

    // Share button
    const shareButton = document.getElementById('share-button');
    const shareMenu = document.getElementById('share-menu');
    
    shareButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        shareMenu?.classList.toggle('hidden');
    });

    // Close menus when clicking outside
    document.addEventListener('click', () => {
        exportMenu?.classList.add('hidden');
        shareMenu?.classList.add('hidden');
    });
}

// === MESSAGE HANDLING ===
async function sendMessage() {
    const content = input.value.trim();
    if (!content || isProcessing) return;

    if (!ai) {
        showToast('⚠️ กรุณาตั้งค่า Gemini API Key ใน .env หรือ Settings', 'error');
        return;
    }

    isProcessing = true;
    updateSubmitButtonState();

    // Add user message
    const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'user',
        content,
        timestamp: new Date(),
        metadata: {
            fileAttachment: currentAttachedFile || undefined
        }
    };

    addMessage(userMessage);
    input.value = '';
    clearFilePreview();
    autoResizeTextarea();

    // Show loading
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai loading';
    loadingDiv.innerHTML = `
        <div class="message-content">
            <div class="loading-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
    `;
    
    const chatContainer = document.getElementById('chat-container')!;
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        // Prepare prompt with file context
        let fullPrompt = content;
        if (currentAttachedFile) {
            fullPrompt += `\n\nไฟล์แนบ: ${currentAttachedFile.file.name}\nเนื้อหา:\n${currentAttachedFile.content}`;
        }

        // Generate AI response
        const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const result = await model.generateContent(fullPrompt);
        const aiResponse = result.response.text();

        // Remove loading indicator
        loadingDiv.remove();

        // Add AI message
        const aiMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            type: 'ai',
            content: aiResponse,
            timestamp: new Date()
        };

        addMessage(aiMessage);
        showToast('✅ ได้รับคำตอบแล้ว!', 'success');

    } catch (error: any) {
        loadingDiv.remove();
        
        const errorMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            type: 'error',
            content: `ขออภัย เกิดข้อผิดพลาด: ${error.message}`,
            timestamp: new Date()
        };
        
        addMessage(errorMessage);
        showToast('❌ เกิดข้อผิดพลาดในการตอบกลับ', 'error');
    } finally {
        isProcessing = false;
        currentAttachedFile = null;
        updateSubmitButtonState();
    }
}

// === FILE HANDLING ===
async function handleFileUpload(file: File): Promise<FileAttachment> {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        throw new Error(`ไฟล์ใหญ่เกินไป (${(file.size / 1024 / 1024).toFixed(1)}MB) ขีดจำกัด 10MB`);
    }

    const supportedTypes = [
        'text/plain', 'text/markdown', 'text/csv',
        'application/json', 'application/javascript',
        'application/pdf', 'text/html', 'text/css',
        'image/jpeg', 'image/png', 'image/gif', 'image/webp'
    ];

    if (!supportedTypes.includes(file.type)) {
        throw new Error(`ประเภทไฟล์ไม่รองรับ: ${file.type}`);
    }

    let content = '';
    let previewUrl = '';

    if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
    } else if (file.type.startsWith('text/') || file.type.includes('json') || file.type.includes('javascript')) {
        content = await file.text();
        if (content.length > 50000) { // 50KB text limit
            content = content.substring(0, 50000) + '\n... (ตัดข้อความที่เหลือ)';
        }
    }

    return {
        file,
        content,
        previewUrl,
        type: file.type,
        size: file.size
    };
}

function showFilePreview() {
    if (!currentAttachedFile) return;

    filePreviewContainer.innerHTML = `
        <div class="file-preview">
            <span class="file-name">📎 ${currentAttachedFile.file.name}</span>
            <button type="button" onclick="clearFilePreview()" class="file-remove">✕</button>
        </div>
    `;
    filePreviewContainer.style.display = 'block';
}

function clearFilePreview() {
    currentAttachedFile = null;
    filePreviewContainer.innerHTML = '';
    filePreviewContainer.style.display = 'none';
    if (fileInput) fileInput.value = '';
}

// === UI HELPERS ===
function autoResizeTextarea() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
}

function updateSubmitButtonState() {
    const hasContent = input.value.trim().length > 0;
    const isReady = !isProcessing && hasContent;
    
    submitButton.disabled = !isReady;
    submitButton.classList.toggle('primary', isReady);
    submitButton.classList.toggle('processing', isProcessing);
}

function toggleDashboard() {
    const container = document.getElementById('dashboard-container');
    if (container) {
        const isVisible = container.style.display !== 'none';
        container.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            showToast('📊 Dashboard feature coming soon!', 'info');
        }
    }
}

// Attach global functions to window
(window as any).clearFilePreview = clearFilePreview;
(window as any).shareToPlatform = shareToPlatform;

// Start the app
initializeApp();
