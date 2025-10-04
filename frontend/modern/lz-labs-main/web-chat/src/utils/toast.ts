// === 🏰 Toast Notification System ===
import { ToastType } from '../types/index.js';

let toastContainer: HTMLElement;

export function initializeToastContainer() {
    toastContainer = document.getElementById('toast-container')!;
    cleanupOldToastSettings();
}

// Toast notification with optional "Don't show again today" feature
export function showToast(message: string, type: ToastType = 'success', showDontShowAgain: boolean = false) {
    // Check if user has disabled this type of notification for today
    const today = new Date().toDateString();
    const disabledKey = `toast_disabled_${type}_${today}`;
    
    if (localStorage.getItem(disabledKey) === 'true' && showDontShowAgain) {
        return; // Don't show if user disabled it for today
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'toast-message';
    messageDiv.textContent = message;
    toast.appendChild(messageDiv);
    
    if (showDontShowAgain) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'toast-actions';

        const dismissButton = document.createElement('button');
        dismissButton.className = 'toast-button toast-dismiss';
        dismissButton.textContent = 'ปิด';
        actionsDiv.appendChild(dismissButton);

        const dontShowButton = document.createElement('button');
        dontShowButton.className = 'toast-button toast-dont-show';
        dontShowButton.textContent = 'ไม่แสดงอีกวันนี้';
        dontShowButton.dataset.toastType = type;
        actionsDiv.appendChild(dontShowButton);

        toast.appendChild(actionsDiv);
    }
    
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transition = 'all 0.3s ease';
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto remove after timeout (longer for interactive toasts)
    const timeout = showDontShowAgain ? 8000 : 3000;
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }
    }, timeout);
}

// Helper functions for toast actions (attach to window for onclick access)
function dismissToast(button: HTMLElement) {
    const toast = button.closest('.toast');
    if (toast && toast.parentNode) {
        (toast as HTMLElement).style.opacity = '0';
        (toast as HTMLElement).style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }
}

function dontShowAgainToday(button: HTMLElement, type: string) {
    const today = new Date().toDateString();
    const disabledKey = `toast_disabled_${type}_${today}`;
    localStorage.setItem(disabledKey, 'true');
    
    const toast = button.closest('.toast');
    if (toast && toast.parentNode) {
        (toast as HTMLElement).style.opacity = '0';
        (toast as HTMLElement).style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }
    
    // Show confirmation (without "don't show again" option)
    setTimeout(() => {
        showToast('การแจ้งเตือนประเภทนี้จะไม่แสดงอีกในวันนี้', 'info');
    }, 400);
}

// Use event delegation to handle toast actions
if (typeof window !== 'undefined') {
    document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('toast-dismiss')) {
            dismissToast(target);
        } else if (target.classList.contains('toast-dont-show')) {
            const toast = target.closest('.toast');
            if (toast) {
                // Extract type from the button's data attribute
                const type = target.getAttribute('data-toast-type');
                if (type) {
                    dontShowAgainToday(target, type);
                }
            }
        }
    });
}

// Clean up old localStorage entries on page load
function cleanupOldToastSettings() {
    const today = new Date().toDateString();
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
        if (key.startsWith('toast_disabled_') && !key.includes(today)) {
            localStorage.removeItem(key);
        }
    });
}
