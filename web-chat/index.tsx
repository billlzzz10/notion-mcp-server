/**
 * 🏰 Ashval Chat v2.1 - Perfect UX Edition with Environment Support
 * Auto-load settings from .env, sidebar toggle, file support, chat sharing
 */

console.log("🏰 Ashval Chat v2.1 - Perfect UX Loading...");

// === GLOBAL STATE ===
let ai: any = null;
let settings = {
    theme: 'dark' as 'light' | 'dark',
    geminiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    notionToken: import.meta.env.VITE_NOTION_TOKEN || '',
    projectsDbId: import.meta.env.VITE_NOTION_PROJECTS_DB_ID || '',
    tasksDbId: import.meta.env.VITE_NOTION_TASKS_DB_ID || '',
    aiPromptsDbId: import.meta.env.VITE_NOTION_AI_PROMPTS_DB_ID || '',
    charactersDbId: import.meta.env.VITE_NOTION_CHARACTERS_DB_ID || '',
    scenesDbId: import.meta.env.VITE_NOTION_SCENES_DB_ID || '',
    locationsDbId: import.meta.env.VITE_NOTION_LOCATIONS_DB_ID || '',
};

let chatSessions: Record<string, ChatSession> = {};
let activeChatId = '';
let isProcessing = false;
let currentAttachedFile: any = null;
let databaseSchemas: Record<string, DatabaseSchema> = {};
let sidebarOpen = true;

// === DOM ELEMENTS ===
let chatContainer: HTMLElement;
let promptForm: HTMLFormElement;
let input: HTMLTextAreaElement;
let fileInput: HTMLInputElement;
let filePreviewContainer: HTMLElement;
let chatList: HTMLElement;
let newChatButton: HTMLElement;
let sidebar: HTMLElement;
let sidebarToggle: HTMLElement;
let settingsButton: HTMLElement;
let settingsModal: HTMLElement;
let settingsForm: HTMLFormElement;
let closeSettingsButton: HTMLElement;
let toastContainer: HTMLElement;
let attachFileButton: HTMLElement;
let chatTitle: HTMLElement;
let submitButton: HTMLButtonElement;
let shareButton: HTMLElement;

// === TYPES ===
interface ChatMessage {
    id: string;
    sender: 'user' | 'ai' | 'tool';
    text: string;
    file?: { 
        name: string; 
        type: string; 
        previewUrl?: string; 
        content?: string;
        size?: number;
    };
    error?: boolean;
    toolResult?: any;
    timestamp?: number;
}

interface ChatSession {
    id: string;
    name: string;
    history: ChatMessage[];
    created: number;
    updated: number;
}

interface DatabaseSchema {
    id: string;
    title: string;
    properties: Record<string, {
        id: string;
        name: string;
        type: string;
        options?: any;
    }>;
    detectedFields: {
        titleField?: string;
        statusField?: string;
        priorityField?: string;
        descriptionField?: string;
        dateField?: string;
        selectFields: string[];
        multiSelectFields: string[];
        textFields: string[];
    };
}

// === LIBRARY INITIALIZATION ===
async function initializeLibraries() {
    try {
        showToast('🔄 กำลังโหลดไลบรารี...', 'info');
        
        const { GoogleGenerativeAI } = await import("https://esm.sh/@google/generative-ai@^0.21.0");
        
        if (settings.geminiKey) {
            ai = new GoogleGenerativeAI(settings.geminiKey);
            console.log("✅ Gemini AI initialized with API key from environment");
            showToast('✅ Gemini AI พร้อมใช้งาน! (จาก Environment)', 'success');
        } else {
            showToast('⚠️ กรุณาตั้งค่า VITE_GEMINI_API_KEY ใน .env', 'warning');
        }
        
        console.log("✅ Libraries loaded successfully");
    } catch (error) {
        console.error("❌ Failed to load libraries:", error);
        showToast('❌ ไม่สามารถโหลดไลบรารีได้', 'error');
    }
}

// === FILE HANDLING ===
async function handleFileUpload(file: File): Promise<any> {
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
        processedText: content ? `📄 ไฟล์: ${file.name}\n\nเนื้อหา:\n${content}` : `📄 ไฟล์: ${file.name} (${file.type})`
    };
}

// === SCHEMA DETECTION ===
async function detectDatabaseSchema(databaseId: string): Promise<DatabaseSchema> {
    try {
        const dbInfo = await notionFetch(`databases/${databaseId}`);
        
        const schema: DatabaseSchema = {
            id: databaseId,
            title: dbInfo.title?.[0]?.plain_text || 'Unknown Database',
            properties: {},
            detectedFields: {
                selectFields: [],
                multiSelectFields: [],
                textFields: []
            }
        };

        for (const [propName, propInfo] of Object.entries(dbInfo.properties as any)) {
            const property = {
                id: (propInfo as any).id,
                name: propName,
                type: (propInfo as any).type,
                options: (propInfo as any)[(propInfo as any).type]
            };

            schema.properties[propName] = property;
            const lowerName = propName.toLowerCase();
            
            if (property.type === 'title' && !schema.detectedFields.titleField) {
                schema.detectedFields.titleField = propName;
            } else if (property.type === 'select' && 
                (lowerName.includes('status') || lowerName.includes('สถานะ'))) {
                schema.detectedFields.statusField = propName;
                schema.detectedFields.selectFields.push(propName);
            } else if (property.type === 'select' && 
                (lowerName.includes('priority') || lowerName.includes('ความสำคัญ') || 
                 lowerName.includes('ระดับ'))) {
                schema.detectedFields.priorityField = propName;
                schema.detectedFields.selectFields.push(propName);
            } else if (property.type === 'rich_text' && 
                (lowerName.includes('description') || lowerName.includes('รายละเอียด') ||
                 lowerName.includes('คำอธิบาย'))) {
                schema.detectedFields.descriptionField = propName;
                schema.detectedFields.textFields.push(propName);
            } else if (property.type === 'date' && !schema.detectedFields.dateField) {
                schema.detectedFields.dateField = propName;
            } else if (property.type === 'select') {
                schema.detectedFields.selectFields.push(propName);
            } else if (property.type === 'multi_select') {
                schema.detectedFields.multiSelectFields.push(propName);
            } else if (property.type === 'rich_text') {
                schema.detectedFields.textFields.push(propName);
            }
        }

        databaseSchemas[databaseId] = schema;
        console.log(`🔍 Database Schema Detected for ${schema.title}:`, schema.detectedFields);
        return schema;
        
    } catch (error) {
        console.error('❌ Failed to detect database schema:', error);
        throw new Error(`Cannot detect schema for database ${databaseId}: ${error}`);
    }
}

async function getOrDetectSchema(databaseId: string): Promise<DatabaseSchema> {
    if (databaseSchemas[databaseId]) {
        return databaseSchemas[databaseId];
    }
    return await detectDatabaseSchema(databaseId);
}

function createDynamicProperties(schema: DatabaseSchema, args: any): any {
    const properties: any = {};
    const fields = schema.detectedFields;
    
    if (fields.titleField && args.name) {
        properties[fields.titleField] = { 
            title: [{ text: { content: args.name } }] 
        };
    }
    
    if (fields.statusField && args.status) {
        properties[fields.statusField] = { 
            select: { name: args.status } 
        };
    }
    
    if (fields.priorityField && args.priority) {
        properties[fields.priorityField] = { 
            select: { name: args.priority } 
        };
    }
    
    if (fields.descriptionField && args.description) {
        properties[fields.descriptionField] = { 
            rich_text: [{ text: { content: args.description } }] 
        };
    }
    
    return properties;
}

function createDynamicFilter(schema: DatabaseSchema, args: any): any {
    const filter: any = { and: [] };
    const fields = schema.detectedFields;
    
    if (args.status && fields.statusField) {
        filter.and.push({
            property: fields.statusField,
            select: { equals: args.status }
        });
    }
    
    if (args.priority && fields.priorityField) {
        filter.and.push({
            property: fields.priorityField,
            select: { equals: args.priority }
        });
    }
    
    return filter.and.length > 0 ? 
        (filter.and.length === 1 ? filter.and[0] : filter) : null;
}

function parseDynamicResult(schema: DatabaseSchema, page: any): any {
    const props = page.properties;
    const fields = schema.detectedFields;
    const result: any = {
        id: page.id,
        created: page.created_time,
        updated: page.last_edited_time
    };
    
    if (fields.titleField) {
        result.name = props[fields.titleField]?.title?.[0]?.text?.content || 'Untitled';
    }
    
    if (fields.statusField) {
        result.status = props[fields.statusField]?.select?.name || 'Unknown';
    }
    
    if (fields.priorityField) {
        result.priority = props[fields.priorityField]?.select?.name || 'Medium';
    }
    
    if (fields.descriptionField) {
        result.description = props[fields.descriptionField]?.rich_text?.[0]?.text?.content || '';
    }
    
    return result;
}

function getDatabaseIdByType(type: string): string | null {
    switch (type.toLowerCase()) {
        case 'projects':
            return settings.projectsDbId;
        case 'tasks':
            return settings.tasksDbId;
        case 'ai-prompts':
        case 'prompts':
            return settings.aiPromptsDbId;
        case 'characters':
            return settings.charactersDbId;
        case 'scenes':
            return settings.scenesDbId;
        case 'locations':
            return settings.locationsDbId;
        default:
            return null;
    }
}

// === NOTION API ===
async function notionFetch(endpoint: string, options: any = {}) {
    const url = `https://api.notion.com/v1/${endpoint}`;
    const headers = {
        'Authorization': `Bearer ${settings.notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
        ...options.headers
    };
    
    try {
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Notion API error (${response.status})`);
        }
        return await response.json();
    } catch (error) {
        console.error('Notion API Error:', error);
        throw error;
    }
}

// === NOTION TOOLS ===
async function createProject(args: any) {
    if (!settings.projectsDbId) {
        throw new Error("Projects Database ID ไม่ได้ตั้งค่า กรุณาตั้งค่าใน .env หรือ Settings");
    }
    
    try {
        const schema = await getOrDetectSchema(settings.projectsDbId);
        const properties = createDynamicProperties(schema, args);
        
        const result = await notionFetch('pages', {
            method: 'POST',
            body: JSON.stringify({
                parent: { database_id: settings.projectsDbId },
                properties
            })
        });

        return {
            success: true,
            projectId: result.id,
            message: `✅ สร้างโปรเจกต์ "${args.name}" เรียบร้อยแล้ว`,
            project: result,
            detectedSchema: schema.detectedFields
        };
        
    } catch (error: any) {
        return {
            success: false,
            error: `❌ เกิดข้อผิดพลาด: ${error?.message}`,
            suggestion: "ลองตรวจสอบชื่อคอลัมน์ใน Notion Database หรือรีเฟรช schema"
        };
    }
}

async function createTask(args: any) {
    if (!settings.tasksDbId) {
        throw new Error("Tasks Database ID ไม่ได้ตั้งค่า กรุณาตั้งค่าใน .env หรือ Settings");
    }
    
    try {
        const schema = await getOrDetectSchema(settings.tasksDbId);
        const properties = createDynamicProperties(schema, args);
        
        const result = await notionFetch('pages', {
            method: 'POST',
            body: JSON.stringify({
                parent: { database_id: settings.tasksDbId },
                properties
            })
        });

        return {
            success: true,
            taskId: result.id,
            message: `✅ สร้างงาน "${args.name}" เรียบร้อยแล้ว`,
            task: result,
            detectedSchema: schema.detectedFields
        };
        
    } catch (error: any) {
        return {
            success: false,
            error: `❌ เกิดข้อผิดพลาด: ${error?.message}`,
            suggestion: "ลองตรวจสอบชื่อคอลัมน์ใน Notion Database หรือรีเฟรช schema"
        };
    }
}

async function summarizeAndSaveToMCP(args: any) {
    if (!settings.projectsDbId) {
        throw new Error("Projects Database ID ไม่ได้ตั้งค่า");
    }

    try {
        const summary = await generateSummary(args.content);
        const projectData = {
            name: args.title || 'สรุปไอเดียจากแชท',
            description: summary,
            status: 'Not started',
            priority: args.priority || 'Medium'
        };

        return await createProject(projectData);
    } catch (error: any) {
        return {
            success: false,
            error: `❌ ไม่สามารถสรุปและบันทึกได้: ${error?.message}`
        };
    }
}

async function generateSummary(content: string): Promise<string> {
    if (!ai) throw new Error("AI ไม่พร้อมใช้งาน");
    
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const prompt = `สรุปเนื้อหาต่อไปนี้เป็นประเด็นสำคัญ ๆ ในรูปแบบที่เข้าใจง่าย:\n\n${content}`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
}

// === TOOL DEFINITIONS ===
const notionTools = {
    functionDeclarations: [
        {
            name: "createProject",
            description: "สร้างโปรเจกต์ใหม่ใน Notion Database",
            parameters: {
                type: "OBJECT",
                properties: {
                    name: { type: "STRING", description: "ชื่อโปรเจกต์" },
                    description: { type: "STRING", description: "รายละเอียดโปรเจกต์" },
                    status: { type: "STRING", description: "สถานะ: Not started, In progress, Completed, On hold" },
                    priority: { type: "STRING", description: "ระดับความสำคัญ: Low, Medium, High, Critical" },
                },
                required: ["name", "status", "priority"]
            }
        },
        {
            name: "createTask",
            description: "สร้างงาน/Task ใหม่ใน Notion Tasks Database",
            parameters: {
                type: "OBJECT",
                properties: {
                    name: { type: "STRING", description: "ชื่องาน" },
                    description: { type: "STRING", description: "รายละเอียดงาน" },
                    status: { type: "STRING", description: "สถานะ: To Do, In Progress, Done, Blocked" },
                    priority: { type: "STRING", description: "ระดับความสำคัญ: Low, Medium, High, Critical" },
                },
                required: ["name", "status", "priority"]
            }
        },
        {
            name: "summarizeAndSaveToMCP",
            description: "สรุปเนื้อหาและบันทึกลงใน MCP Database",
            parameters: {
                type: "OBJECT",
                properties: {
                    content: { type: "STRING", description: "เนื้อหาที่ต้องการสรุป" },
                    title: { type: "STRING", description: "หัวข้อของข้อมูล" },
                    priority: { type: "STRING", description: "ระดับความสำคัญ" }
                },
                required: ["content"]
            }
        }
    ],
};

// === CHAT MANAGEMENT ===
function createNewChat() {
    const now = Date.now();
    const newId = `chat-${now}`;
    const newSession: ChatSession = { 
        id: newId, 
        name: 'การสนทนาใหม่', 
        history: [],
        created: now,
        updated: now
    };
    chatSessions[newId] = newSession;
    switchChat(newId);
    saveSessions();
    showToast('💬 สร้างการสนทนาใหม่แล้ว', 'success');
}

function switchChat(chatId: string) {
    if (!chatSessions[chatId]) return;
    activeChatId = chatId;
    localStorage.setItem('ashvalActiveChatId', chatId);
    chatContainer.innerHTML = '';
    chatSessions[chatId].history.forEach(appendMessage);
    chatTitle.textContent = `🏰 ${chatSessions[chatId].name}`;
    renderSidebar();
    scrollToBottom();
    updateSubmitButtonState();
}

function addMessageToHistory(message: ChatMessage) {
    if (activeChatId && chatSessions[activeChatId]) {
        message.timestamp = Date.now();
        chatSessions[activeChatId].history.push(message);
        chatSessions[activeChatId].updated = message.timestamp;
        saveSessions();
        appendMessage(message);
    }
}

function saveSessions() {
    localStorage.setItem('ashvalChatSessions', JSON.stringify(chatSessions));
}

function loadSessions() {
    const savedSessions = localStorage.getItem('ashvalChatSessions');
    if (savedSessions) {
        chatSessions = JSON.parse(savedSessions);
    }
    activeChatId = localStorage.getItem('ashvalActiveChatId') || '';
}

function shareChat() {
    if (!activeChatId || !chatSessions[activeChatId]) {
        showToast('⚠️ ไม่มีการสนทนาที่จะแชร์', 'warning');
        return;
    }

    const session = chatSessions[activeChatId];
    const chatData = {
        name: session.name,
        created: new Date(session.created).toLocaleString('th-TH'),
        messages: session.history.map(msg => ({
            sender: msg.sender === 'user' ? 'ผู้ใช้' : 'AI',
            text: msg.text,
            time: msg.timestamp ? new Date(msg.timestamp).toLocaleString('th-TH') : ''
        }))
    };

    const shareText = `🏰 Ashval Chat - ${chatData.name}\n` +
        `สร้างเมื่อ: ${chatData.created}\n\n` +
        chatData.messages.map(msg => 
            `[${msg.time}] ${msg.sender}: ${msg.text}`
        ).join('\n\n');

    if (navigator.share) {
        navigator.share({
            title: `Ashval Chat - ${session.name}`,
            text: shareText
        });
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            showToast('📋 คัดลอกการสนทนาไปยังคลิปบอร์ดแล้ว!', 'success');
        });
    }
}

// === SIDEBAR MANAGEMENT ===
function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
    if (sidebarOpen) {
        sidebar.classList.remove('collapsed');
        sidebarToggle.textContent = '◀';
    } else {
        sidebar.classList.add('collapsed');
        sidebarToggle.textContent = '▶';
    }
    localStorage.setItem('ashvalSidebarOpen', sidebarOpen.toString());
}

// === MAIN CHAT ===
async function sendMessage() {
    const promptText = input.value.trim();
    if (!promptText && !currentAttachedFile) return;
    if (isProcessing) return;
    
    if (!ai) {
        showToast('⚠️ กรุณาตั้งค่า Gemini API Key ใน .env หรือ Settings', 'error');
        openSettingsModal();
        return;
    }

    setFormState(true);
    
    const userMessageId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
        id: userMessageId,
        sender: 'user',
        text: currentAttachedFile ? 
            `${promptText}\n\n${currentAttachedFile.processedText}` : 
            promptText,
        file: currentAttachedFile ? {
            name: currentAttachedFile.file.name,
            type: currentAttachedFile.file.type,
            previewUrl: currentAttachedFile.previewUrl,
            size: currentAttachedFile.file.size
        } : undefined
    };
    addMessageToHistory(userMessage);
    resetInputArea();

    const aiMessageId = `ai-${Date.now()}`;
    let aiMessageElement = createMessageElement('ai', aiMessageId);
    aiMessageElement.appendChild(createLoadingElement());
    chatContainer.appendChild(aiMessageElement);
    scrollToBottom();

    try {
        const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        
        const contents = [
            { role: 'user', parts: [{ text: userMessage.text }] }
        ];
        
        let fullResponse = '';

        const response = await model.generateContent({ 
            contents,
            tools: [notionTools]
        });
        
        const result = await response.response;
        fullResponse = result.text();
        
        if (!fullResponse) {
            fullResponse = '🤔 ขออภัย ผมไม่สามารถตอบคำถามนี้ได้ กรุณาลองถามใหม่';
        }
        
        aiMessageElement.innerHTML = '';
        aiMessageElement.textContent = fullResponse;
        
        addMessageToHistory({ id: aiMessageId, sender: 'ai', text: fullResponse });
        addMessageActions(aiMessageElement);

        // บันทึกการสนทนาลง AI Prompts Database
        if (settings.aiPromptsDbId) {
            try {
                const promptResult = await savePromptInteraction(promptText, fullResponse, {
                    timestamp: Date.now(),
                    sessionId: activeChatId
                });
                
                if (promptResult.success) {
                    console.log('✅ Prompt interaction saved:', promptResult);
                    if (promptResult.comparison) {
                        showToast(`📊 ${promptResult.message} - ${promptResult.comparison}`, 'info');
                    }
                }
            } catch (error) {
                console.error('Failed to save prompt interaction:', error);
            }
        }

        // Auto-rename chat after first exchange
        if (chatSessions[activeChatId].history.length === 2) {
            try {
                const titleModel = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
                const titleResponse = await titleModel.generateContent(
                    `สร้างชื่อสั้น ๆ (ไม่เกิน 25 ตัวอักษร) สำหรับการสนทนานี้: "${promptText}"`
                );
                const titleResult = await titleResponse.response;
                const newTitle = titleResult.text().trim().replace(/['"]/g, '');
                renameChat(activeChatId, newTitle, false);
            } catch (error) {
                console.error('Auto-rename failed:', error);
            }
        }

        showToast('✅ ได้รับคำตอบแล้ว!', 'success');

    } catch (error: any) {
        console.error('API Error:', error);
        const errorMessage = `❌ เกิดข้อผิดพลาด: ${error?.message || 'ไม่ทราบสาเหตุ'}`;
        aiMessageElement.innerHTML = '';
        aiMessageElement.textContent = errorMessage;
        aiMessageElement.classList.add('error');
        addMessageToHistory({ id: aiMessageId, sender: 'ai', text: errorMessage, error: true });
        showToast('❌ เกิดข้อผิดพลาดในการตอบกลับ', 'error');
    } finally {
        setFormState(false);
        input.focus();
        currentAttachedFile = null;
    }
}

function renameChat(chatId: string, newName: string, showToastMsg = true) {
    if (chatSessions[chatId]) {
        chatSessions[chatId].name = newName;
        if (chatId === activeChatId) {
            chatTitle.textContent = `🏰 ${newName}`;
        }
        saveSessions();
        renderSidebar();
        if(showToastMsg) showToast('💾 เปลี่ยนชื่อการสนทนาแล้ว!', 'success');
    }
}

// === UI HELPERS ===
function setFormState(isDisabled: boolean) {
    isProcessing = isDisabled;
    input.disabled = isDisabled;
    if (attachFileButton) (attachFileButton as any).disabled = isDisabled;
    updateSubmitButtonState();
}

function updateSubmitButtonState() {
    if (submitButton) {
        const hasText = input.value.trim().length > 0;
        const canSubmit = !isProcessing && (hasText || currentAttachedFile) && ai;
        submitButton.disabled = !canSubmit;
        
        if (isProcessing) {
            submitButton.textContent = '🔄';
            submitButton.classList.add('processing');
        } else if (!ai) {
            submitButton.textContent = '⚙️';
            submitButton.classList.remove('processing');
        } else {
            submitButton.textContent = '📤';
            submitButton.classList.remove('processing');
        }
    }
}

function createMessageElement(sender: 'user' | 'ai' | 'tool', id: string): HTMLDivElement {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.dataset.id = id;
    
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        messageDiv.style.transition = 'all 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 10);
    
    return messageDiv;
}

function createLoadingElement(): HTMLDivElement {
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('loading-indicator');
    loadingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    return loadingDiv;
}

function appendMessage(message: ChatMessage) {
    const messageDiv = createMessageElement(message.sender, message.id);
    if (message.error) messageDiv.classList.add('error');
    
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('message-content');
    
    if (message.file) {
        const filePreview = document.createElement('div');
        filePreview.classList.add('file-attachment-preview');
        const thumb = `<div class="file-attachment-preview-thumb">${message.file.previewUrl ? `<img src="${message.file.previewUrl}" alt="File preview" style="max-width:100px;">` : '📄'}</div>`;
        const name = `<span class="file-attachment-preview-name">${message.file.name.replace(/</g, "&lt;")} (${(message.file.size! / 1024).toFixed(1)}KB)</span>`;
        filePreview.innerHTML = thumb + name;
        contentWrapper.appendChild(filePreview);
    }
    
    if (message.text) {
        const textElement = document.createElement('p');
        textElement.style.whiteSpace = 'pre-wrap';
        textElement.textContent = message.text;
        contentWrapper.appendChild(textElement);
    }
    
    messageDiv.appendChild(contentWrapper);
    
    if (message.sender === 'ai' && !message.error) {
        addMessageActions(messageDiv);
    }
    
    chatContainer.appendChild(messageDiv);
    scrollToBottom();
}

function addMessageActions(messageDiv: HTMLDivElement) {
    const actionsWrapper = document.createElement('div');
    actionsWrapper.className = 'message-actions';
    
    const copyButton = document.createElement('button');
    copyButton.className = 'message-action-button copy-button';
    copyButton.ariaLabel = 'Copy message';
    copyButton.innerHTML = '📋';
    copyButton.onclick = () => {
        const text = messageDiv.textContent || '';
        navigator.clipboard.writeText(text).then(() => {
            showToast('📋 คัดลอกข้อความแล้ว!', 'success');
        });
    };

    const saveButton = document.createElement('button');
    saveButton.className = 'message-action-button save-button';
    saveButton.ariaLabel = 'Save to MCP';
    saveButton.innerHTML = '💾';
    saveButton.onclick = async () => {
        const text = messageDiv.textContent || '';
        try {
            const result = await summarizeAndSaveToMCP({ content: text });
            if (result.success) {
                showToast('💾 บันทึกเข้า MCP แล้ว!', 'success');
            } else {
                showToast(`❌ ${result.error}`, 'error');
            }
        } catch (error: any) {
            showToast(`❌ เกิดข้อผิดพลาด: ${error.message}`, 'error');
        }
    };
    
    actionsWrapper.appendChild(copyButton);
    actionsWrapper.appendChild(saveButton);
    messageDiv.appendChild(actionsWrapper);
}

function renderSidebar() {
    chatList.innerHTML = '';
    const sortedSessions = Object.values(chatSessions).sort((a, b) => b.updated - a.updated);
    
    sortedSessions.forEach(session => {
        const item = document.createElement('div');
        item.className = 'chat-list-item';
        item.dataset.id = session.id;
        if (session.id === activeChatId) item.classList.add('active');
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'chat-list-item-name';
        nameSpan.textContent = session.name;
        nameSpan.onclick = () => switchChat(session.id);

        item.appendChild(nameSpan);
        chatList.appendChild(item);
    });
}

function resetInputArea() {
    input.value = '';
    if (fileInput) fileInput.value = '';
    if (filePreviewContainer) filePreviewContainer.innerHTML = '';
    currentAttachedFile = null;
    autoResizeTextarea();
    updateSubmitButtonState();
}

function autoResizeTextarea() {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
}

function scrollToBottom() {
    requestAnimationFrame(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    });
}

function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transition = 'all 0.3s ease';
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// === SETTINGS ===
function openSettingsModal() {
    (settingsForm.elements.namedItem('geminiKey') as HTMLInputElement).value = settings.geminiKey;
    (settingsForm.elements.namedItem('notionToken') as HTMLInputElement).value = settings.notionToken;
    (settingsForm.elements.namedItem('projectsDbId') as HTMLInputElement).value = settings.projectsDbId;
    (settingsForm.elements.namedItem('tasksDbId') as HTMLInputElement).value = settings.tasksDbId;
    (settingsForm.elements.namedItem('aiPromptsDbId') as HTMLInputElement).value = settings.aiPromptsDbId;
    settingsModal.classList.remove('hidden');
    settingsModal.style.opacity = '0';
    setTimeout(() => {
        settingsModal.style.transition = 'opacity 0.3s ease';
        settingsModal.style.opacity = '1';
    }, 10);
}

function closeSettingsModal() {
    settingsModal.style.opacity = '0';
    setTimeout(() => {
        settingsModal.classList.add('hidden');
    }, 300);
}

function handleSettingsSave(e: Event) {
    e.preventDefault();
    const oldGeminiKey = settings.geminiKey;
    
    settings.geminiKey = (settingsForm.elements.namedItem('geminiKey') as HTMLInputElement).value.trim();
    settings.notionToken = (settingsForm.elements.namedItem('notionToken') as HTMLInputElement).value.trim();
    settings.projectsDbId = (settingsForm.elements.namedItem('projectsDbId') as HTMLInputElement).value.trim();
    settings.tasksDbId = (settingsForm.elements.namedItem('tasksDbId') as HTMLInputElement).value.trim();
    settings.aiPromptsDbId = (settingsForm.elements.namedItem('aiPromptsDbId') as HTMLInputElement).value.trim();
    
    if (settings.geminiKey && settings.geminiKey !== oldGeminiKey) {
        initializeLibraries();
    }
    
    saveSettings();
    updateSubmitButtonState();
    showToast('💾 บันทึกการตั้งค่าเรียบร้อย!', 'success');
    closeSettingsModal();
}

function saveSettings() { 
    localStorage.setItem('ashvalChatSettings', JSON.stringify(settings)); 
}

function loadSettings() {
    const savedSettings = localStorage.getItem('ashvalChatSettings');
    if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Merge with environment variables, giving priority to saved settings
        settings = { 
            ...settings, 
            ...parsed,
            // But keep environment variables if saved settings are empty
            geminiKey: parsed.geminiKey || settings.geminiKey,
            notionToken: parsed.notionToken || settings.notionToken,
            projectsDbId: parsed.projectsDbId || settings.projectsDbId,
            tasksDbId: parsed.tasksDbId || settings.tasksDbId,
            aiPromptsDbId: parsed.aiPromptsDbId || settings.aiPromptsDbId,
        };
    }
}

// === APP INITIALIZATION ===
async function initializeApp() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
        return;
    }

    console.log("🎬 Initializing Ashval Chat v2.1...");

    // Get DOM elements
    chatContainer = document.getElementById('chat-container')!;
    promptForm = document.getElementById('prompt-form') as HTMLFormElement;
    input = document.getElementById('prompt-input') as HTMLTextAreaElement;
    fileInput = document.getElementById('file-input') as HTMLInputElement;
    filePreviewContainer = document.getElementById('file-preview-container')!;
    chatList = document.getElementById('chat-list')!;
    newChatButton = document.getElementById('new-chat-button')!;
    sidebar = document.getElementById('sidebar')!;
    sidebarToggle = document.getElementById('sidebar-toggle')!;
    settingsButton = document.getElementById('settings-button')!;
    settingsModal = document.getElementById('settings-modal')!;
    settingsForm = document.getElementById('settings-form') as HTMLFormElement;
    closeSettingsButton = document.getElementById('close-settings-button')!;
    toastContainer = document.getElementById('toast-container')!;
    attachFileButton = document.getElementById('attach-file-button')!;
    chatTitle = document.getElementById('chat-title')!;
    submitButton = document.getElementById('submit-button') as HTMLButtonElement;
    shareButton = document.getElementById('share-button')!;

    // Load saved data
    loadSettings();
    loadSessions();
    
    // Sidebar state
    const savedSidebarState = localStorage.getItem('ashvalSidebarOpen');
    sidebarOpen = savedSidebarState !== 'false';
    if (!sidebarOpen) {
        sidebar.classList.add('collapsed');
        sidebarToggle.textContent = '▶';
    }
    
    // Initialize libraries
    await initializeLibraries();

    // Event listeners
    promptForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage();
    });
    
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
                    updateSubmitButtonState();
                } catch (error: any) {
                    showToast(`❌ ${error.message}`, 'error');
                    if (fileInput) fileInput.value = '';
                }
            }
        });
    }
    
    newChatButton.addEventListener('click', createNewChat);
    sidebarToggle.addEventListener('click', toggleSidebar);
    shareButton.addEventListener('click', shareChat);
    settingsButton.addEventListener('click', openSettingsModal);
    closeSettingsButton.addEventListener('click', closeSettingsModal);
    settingsForm.addEventListener('submit', handleSettingsSave);

    // Initialize chat session
    if (Object.keys(chatSessions).length === 0) {
        createNewChat();
    } else if (activeChatId && chatSessions[activeChatId]) {
        switchChat(activeChatId);
    } else {
        const firstChatId = Object.keys(chatSessions)[0];
        switchChat(firstChatId);
    }

    renderSidebar();
    updateSubmitButtonState();
    
    // Focus on input
    setTimeout(() => {
        input.focus();
    }, 500);
    
    // Show environment status
    const envLoaded = settings.geminiKey || settings.notionToken;
    if (envLoaded) {
        showToast('🏰 Ashval Chat พร้อมใช้งาน! (โหลดจาก .env)', 'success');
    } else {
        showToast('🏰 Ashval Chat พร้อมใช้งาน! (ตั้งค่าใน Settings)', 'info');
    }
    
    console.log("🎉 Ashval Chat v2.1 - Perfect UX Ready!");
}

// === START APPLICATION ===
initializeApp();

async function savePromptInteraction(userPrompt: string, aiResponse: string, metadata: any = {}) {
    if (!settings.aiPromptsDbId) {
        console.warn("AI Prompts Database ID ไม่ได้ตั้งค่า");
        return { success: false, error: "AI Prompts Database ID not configured" };
    }
    
    try {
        const schema = await getOrDetectSchema(settings.aiPromptsDbId);
        
        // ค้นหาคำสั่งที่มีอยู่แล้ว
        const existingPrompt = await findExistingPrompt(userPrompt);
        
        if (existingPrompt) {
            // อัพเดตคำสั่งที่มีอยู่
            return await updateExistingPrompt(existingPrompt, aiResponse, metadata);
        } else {
            // สร้างคำสั่งใหม่
            return await createNewPrompt(userPrompt, aiResponse, metadata, schema);
        }
        
    } catch (error: any) {
        console.error('❌ Failed to save prompt interaction:', error);
        return {
            success: false,
            error: `❌ เกิดข้อผิดพลาด: ${error?.message}`
        };
    }
}

async function findExistingPrompt(userPrompt: string) {
    try {
        const response = await notionFetch(`databases/${settings.aiPromptsDbId}/query`, {
            method: 'POST',
            body: JSON.stringify({
                filter: {
                    property: "User Prompt",
                    rich_text: {
                        contains: userPrompt.substring(0, 100) // ค้นหาจาก 100 ตัวอักษรแรก
                    }
                }
            })
        });
        
        return response.results.find((result: any) => {
            const promptText = result.properties["User Prompt"]?.rich_text?.[0]?.text?.content || '';
            return promptText.includes(userPrompt.substring(0, 50));
        });
        
    } catch (error) {
        console.error('Error finding existing prompt:', error);
        return null;
    }
}

async function createNewPrompt(userPrompt: string, aiResponse: string, metadata: any, schema: DatabaseSchema) {
    const properties = createDynamicProperties(schema, {
        name: `Prompt ${new Date().toLocaleDateString('th-TH')}`,
        description: userPrompt.substring(0, 200)
    });
    
    // เพิ่ม properties เฉพาะสำหรับ AI Prompts
    properties["User Prompt"] = {
        rich_text: [{ text: { content: userPrompt } }]
    };
    
    properties["AI Response"] = {
        rich_text: [{ text: { content: aiResponse.substring(0, 2000) } }]
    };
    
    properties["Version"] = {
        number: 1
    };
    
    properties["Usage Count"] = {
        number: 1
    };
    
    properties["Status"] = {
        select: { name: "Active" }
    };
    
    if (metadata.evaluation) {
        properties["Evaluation Score"] = {
            number: metadata.evaluation
        };
    }
    
    const result = await notionFetch('pages', {
        method: 'POST',
        body: JSON.stringify({
            parent: { database_id: settings.aiPromptsDbId },
            properties
        })
    });

    return {
        success: true,
        promptId: result.id,
        message: `✅ บันทึกการสนทนาใหม่แล้ว (เวอร์ชั่น 1)`,
        isNew: true,
        version: 1,
        usageCount: 1
    };
}

async function updateExistingPrompt(existingPrompt: any, newResponse: string, metadata: any) {
    const currentVersion = existingPrompt.properties["Version"]?.number || 1;
    const currentUsageCount = existingPrompt.properties["Usage Count"]?.number || 1;
    const currentResponse = existingPrompt.properties["AI Response"]?.rich_text?.[0]?.text?.content || '';
    
    // เปรียบเทียบ response
    const isSimilarResponse = calculateSimilarity(currentResponse, newResponse) > 0.8;
    
    let updateProperties: any = {};
    
    // เพิ่ม metadata ถ้ามี
    if (metadata.sessionId) {
        updateProperties["Session ID"] = {
            rich_text: [{ text: { content: metadata.sessionId } }]
        };
    }
    
    if (isSimilarResponse) {
        // Response คล้ายกัน: เพิ่ม usage count
        updateProperties["Usage Count"] = {
            number: currentUsageCount + 1
        };
        
        updateProperties["Last Used"] = {
            date: { start: new Date().toISOString() }
        };
        
        return await updatePromptRecord(existingPrompt.id, updateProperties, {
            message: `✅ อัพเดตจำนวนการใช้งาน (${currentUsageCount + 1} ครั้ง)`,
            isNew: false,
            version: currentVersion,
            usageCount: currentUsageCount + 1,
            comparison: "Similar response - increased usage count"
        });
        
    } else {
        // Response แตกต่าง: สร้างเวอร์ชั่นใหม่
        updateProperties["AI Response"] = {
            rich_text: [{ text: { content: newResponse.substring(0, 2000) } }]
        };
        
        updateProperties["Previous Response"] = {
            rich_text: [{ text: { content: currentResponse.substring(0, 1000) } }]
        };
        
        updateProperties["Version"] = {
            number: currentVersion + 1
        };
        
        updateProperties["Usage Count"] = {
            number: currentUsageCount + 1
        };
        
        updateProperties["Last Updated"] = {
            date: { start: new Date().toISOString() }
        };
        
        // ประเมินการปรับปรุง
        const improvement = await evaluateImprovement(currentResponse, newResponse);
        if (improvement.score) {
            updateProperties["Improvement Score"] = {
                number: improvement.score
            };
        }
        
        return await updatePromptRecord(existingPrompt.id, updateProperties, {
            message: `✅ อัพเดตเวอร์ชั่นใหม่ (v${currentVersion + 1})`,
            isNew: false,
            version: currentVersion + 1,
            usageCount: currentUsageCount + 1,
            comparison: `New version - ${improvement.analysis}`,
            previousResponse: currentResponse.substring(0, 200) + "...",
            newResponse: newResponse.substring(0, 200) + "..."
        });
    }
}

async function updatePromptRecord(promptId: string, properties: any, result: any) {
    await notionFetch(`pages/${promptId}`, {
        method: 'PATCH',
        body: JSON.stringify({ properties })
    });
    
    return {
        success: true,
        promptId,
        ...result
    };
}

function calculateSimilarity(text1: string, text2: string): number {
    // Simple similarity calculation based on common words
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    
    return commonWords.length / Math.max(words1.length, words2.length);
}

async function evaluateImprovement(oldResponse: string, newResponse: string) {
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
