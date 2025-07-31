// === 🏰 Settings Management ===
import { AppSettings } from '../types/index.js';
import { showToast } from '../utils/toast.js';

export let settings: AppSettings = {
    theme: 'light',
    geminiKey: '', // Will be fetched securely from backend
    notionToken: '', // Will be fetched securely from backend
    projectsDbId: '', // Will be fetched securely from backend
    tasksDbId: '', // Will be fetched securely from backend
    aiPromptsDbId: '', // Will be fetched securely from backend
    charactersDbId: '', // Will be fetched securely from backend
    scenesDbId: '', // Will be fetched securely from backend
    locationsDbId: '' // Will be fetched securely from backend
};

let settingsModal: HTMLElement;
let settingsForm: HTMLFormElement;
let closeSettingsButton: HTMLElement;

export function initializeSettings() {
    settingsModal = document.getElementById('settings-modal')!;
    settingsForm = document.getElementById('settings-form') as HTMLFormElement;
    closeSettingsButton = document.getElementById('close-settings-button')!;

    loadSettings();
    applyTheme();
    
    // Event listeners
    settingsForm.addEventListener('submit', handleSettingsSave);
    closeSettingsButton.addEventListener('click', closeSettingsModal);
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeSettingsModal();
    });
}

export function openSettingsModal() {
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

export function closeSettingsModal() {
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
        // Re-initialize AI if key changed
        import('../modules/ai.js').then(({ initializeAI }) => {
            initializeAI();
        });
    }
    
    saveSettings();
    showToast('💾 บันทึกการตั้งค่าเรียบร้อย!', 'success');
    closeSettingsModal();
}

export function saveSettings() { 
    localStorage.setItem('ashvalChatSettings', JSON.stringify(settings)); 
}

export async function loadSettings() {
    const savedSettings = localStorage.getItem('ashvalChatSettings');
    if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        settings = { 
            ...settings, 
            ...parsed
        };
    }
    // Fetch sensitive credentials from backend securely
    try {
        const response = await fetch('/api/settings/secure-keys', { credentials: 'include' });
        if (response.ok) {
            const secureKeys = await response.json();
            settings.geminiKey = secureKeys.geminiKey || settings.geminiKey;
            settings.notionToken = secureKeys.notionToken || settings.notionToken;
            settings.projectsDbId = secureKeys.projectsDbId || settings.projectsDbId;
            settings.tasksDbId = secureKeys.tasksDbId || settings.tasksDbId;
            settings.aiPromptsDbId = secureKeys.aiPromptsDbId || settings.aiPromptsDbId;
            settings.charactersDbId = secureKeys.charactersDbId || settings.charactersDbId;
            settings.scenesDbId = secureKeys.scenesDbId || settings.scenesDbId;
            settings.locationsDbId = secureKeys.locationsDbId || settings.locationsDbId;
        }
    } catch (error) {
        console.error('Failed to fetch secure settings:', error);
    }
}

// Toggle theme between light and dark
export function toggleTheme() {
    settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    saveSettings();
    showToast(`🎨 เปลี่ยนเป็น ${settings.theme} theme`, 'success');
}

function applyTheme() {
    document.body.setAttribute('data-theme', settings.theme);
}

// Export settings for other modules to access
export { settings as getSettings };
