// Enhanced Chat Features for Ashval Chat v2.0

// Helper to escape HTML
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        return '';
    }
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Folder Management System
class FolderManager {
  constructor() {
    this.folders = JSON.parse(localStorage.getItem('chatFolders') || '{}');
    this.defaultFolder = 'General';
    this.initFolders();
  }

  initFolders() {
    if (!this.folders[this.defaultFolder]) {
      this.folders[this.defaultFolder] = [];
    }
    this.saveFolders();
  }

  createFolder(name) {
    if (!this.folders[name]) {
      this.folders[name] = [];
      this.saveFolders();
      this.renderFolders();
      return true;
    }
    return false;
  }

  deleteFolder(name) {
    if (name === this.defaultFolder) return false;
    
    // Move chats to default folder
    if (this.folders[name]) {
      this.folders[this.defaultFolder].push(...this.folders[name]);
      delete this.folders[name];
      this.saveFolders();
      this.renderFolders();
      return true;
    }
    return false;
  }

  addChatToFolder(chatId, folderName) {
    // Remove from all folders first
    Object.keys(this.folders).forEach(folder => {
      this.folders[folder] = this.folders[folder].filter(id => id !== chatId);
    });
    
    // Add to specified folder
    if (!this.folders[folderName]) {
      this.folders[folderName] = [];
    }
    this.folders[folderName].push(chatId);
    this.saveFolders();
  }

  getChatFolder(chatId) {
    for (const [folderName, chats] of Object.entries(this.folders)) {
      if (chats.includes(chatId)) {
        return folderName;
      }
    }
    return this.defaultFolder;
  }

  saveFolders() {
    localStorage.setItem('chatFolders', JSON.stringify(this.folders));
  }

  renderFolders() {
    const folderList = document.getElementById('folder-list');
    if (!folderList) return;

    folderList.textContent = '';
    
    Object.entries(this.folders).forEach(([name, chats]) => {
      const folderItem = document.createElement('div');
      folderItem.className = 'folder-item';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'folder-name';
      nameSpan.textContent = `📁 ${name}`;

      const countSpan = document.createElement('span');
      countSpan.className = 'chat-count';
      countSpan.textContent = chats.length;

      folderItem.appendChild(nameSpan);
      folderItem.appendChild(countSpan);

      if (name !== this.defaultFolder) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '🗑️';
        deleteButton.addEventListener('click', () => this.deleteFolder(name));
        folderItem.appendChild(deleteButton);
      }
      folderList.appendChild(folderItem);
    });
  }
}

// Smart Database Detection
class DatabaseDetector {
  constructor() {
    this.detectedDatabases = [];
  }

  async detectFromUrl(url) {
    try {
      // Mock detection - in real implementation, this would call Notion API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.detectedDatabases = [
        { id: 'db1', name: 'Characters Database', type: 'Characters', url },
        { id: 'db2', name: 'Scenes Database', type: 'Scenes', url },
        { id: 'db3', name: 'Locations Database', type: 'Locations', url }
      ];
      
      this.renderDetectedDatabases();
      return this.detectedDatabases;
    } catch (error) {
      console.error('Database detection failed:', error);
      return [];
    }
  }

  renderDetectedDatabases() {
    const container = document.getElementById('detected-databases');
    const list = document.getElementById('database-list');
    
    if (!container || !list) return;

    list.textContent = '';
    
    this.detectedDatabases.forEach(db => {
      const item = document.createElement('div');
      item.className = 'database-item';

      const infoDiv = document.createElement('div');
      infoDiv.className = 'database-info';

      const nameDiv = document.createElement('div');
      nameDiv.className = 'database-name';
      nameDiv.textContent = db.name;

      const typeDiv = document.createElement('div');
      typeDiv.className = 'database-type';
      typeDiv.textContent = db.type;

      infoDiv.appendChild(nameDiv);
      infoDiv.appendChild(typeDiv);

      const button = document.createElement('button');
      button.className = 'button secondary';
      button.textContent = '✅ Select';
      button.addEventListener('click', () => this.selectDatabase(db.id, db.type));

      item.appendChild(infoDiv);
      item.appendChild(button);
      list.appendChild(item);
    });

    container.classList.remove('hidden');
  }

  selectDatabase(id, type) {
    const database = this.detectedDatabases.find(db => db.id === id);
    if (!database) return;

    // Auto-fill the corresponding field
    const fieldMap = {
      'Characters': 'characters-db-id',
      'Scenes': 'scenes-db-id',
      'Locations': 'locations-db-id'
    };

    const fieldId = fieldMap[type];
    if (fieldId) {
      const field = document.getElementById(fieldId);
      if (field) {
        field.value = database.id;
        // Show success toast
        showToast(`✅ ${database.name} has been added to ${type} database field`, 'success');
      }
    }
  }
}

// Enhanced Chat List Renderer
class ChatListRenderer {
  constructor() {
    this.folderManager = new FolderManager();
    this.collapsedFolders = new Set();
  }

  renderChatList(chats) {
    const chatList = document.getElementById('chat-list');
    if (!chatList) return;

    // Group chats by folder
    const chatsByFolder = {};
    
    chats.forEach(chat => {
      const folder = this.folderManager.getChatFolder(chat.id);
      if (!chatsByFolder[folder]) {
        chatsByFolder[folder] = [];
      }
      chatsByFolder[folder].push(chat);
    });

    chatList.textContent = '';

    // Render each folder
    Object.entries(chatsByFolder).forEach(([folderName, folderChats]) => {
      this.renderFolder(chatList, folderName, folderChats);
    });
  }

  renderFolder(container, folderName, chats) {
    const folderSection = document.createElement('div');
    folderSection.className = 'folder-section';
    folderSection.dataset.folder = folderName;

    const folderHeader = document.createElement('div');
    folderHeader.className = 'folder-header';
    folderHeader.onclick = () => this.toggleFolder(folderName);
    
    const isCollapsed = this.collapsedFolders.has(folderName);

    const folderTitle = document.createElement('div');
    folderTitle.className = 'folder-title';

    const iconSpan = document.createElement('span');
    iconSpan.textContent = '📁';
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = folderName;

    const countSpan = document.createElement('span');
    countSpan.className = 'chat-count';
    countSpan.textContent = `(${chats.length})`;

    folderTitle.appendChild(iconSpan);
    folderTitle.appendChild(nameSpan);
    folderTitle.appendChild(countSpan);

    const toggleSpan = document.createElement('span');
    toggleSpan.className = `folder-toggle ${isCollapsed ? 'collapsed' : ''}`;
    toggleSpan.textContent = '▼';

    folderHeader.appendChild(folderTitle);
    folderHeader.appendChild(toggleSpan);

    const folderContent = document.createElement('div');
    folderContent.className = `folder-content ${isCollapsed ? 'collapsed' : ''}`;

    chats.forEach(chat => {
      const chatItem = this.createChatItem(chat);
      folderContent.appendChild(chatItem);
    });

    folderSection.appendChild(folderHeader);
    folderSection.appendChild(folderContent);
    container.appendChild(folderSection);
  }

  createChatItem(chat) {
    const item = document.createElement('div');
    item.className = 'chat-list-item';
    item.dataset.chatId = chat.id;
    
    if (chat.active) {
      item.classList.add('active');
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'chat-list-item-content';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'chat-list-item-name';
    nameDiv.textContent = chat.title || 'New Chat';

    const previewDiv = document.createElement('div');
    previewDiv.className = 'chat-list-item-preview';
    previewDiv.textContent = chat.preview || 'No messages yet';

    contentDiv.appendChild(nameDiv);
    contentDiv.appendChild(previewDiv);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'chat-list-item-actions';

    const editButton = document.createElement('button');
    editButton.className = 'chat-action-button';
    editButton.title = 'Edit name';
    editButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`;
    editButton.addEventListener('click', () => this.editChatName(chat.id));

    const deleteButton = document.createElement('button');
    deleteButton.className = 'chat-action-button';
    deleteButton.title = 'Delete chat';
    deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;
    deleteButton.addEventListener('click', () => this.deleteChat(chat.id));

    actionsDiv.appendChild(editButton);
    actionsDiv.appendChild(deleteButton);

    item.appendChild(contentDiv);
    item.appendChild(actionsDiv);

    item.addEventListener('click', (e) => {
      if (!e.target.closest('.chat-action-button')) {
        this.selectChat(chat.id);
      }
    });

    return item;
  }

  toggleFolder(folderName) {
    if (this.collapsedFolders.has(folderName)) {
      this.collapsedFolders.delete(folderName);
    } else {
      this.collapsedFolders.add(folderName);
    }
    
    // Re-render to update collapsed state
    const folderSection = document.querySelector(`[data-folder="${folderName}"]`);
    if (folderSection) {
      const toggle = folderSection.querySelector('.folder-toggle');
      const content = folderSection.querySelector('.folder-content');
      
      toggle.classList.toggle('collapsed');
      content.classList.toggle('collapsed');
    }
  }

  editChatName(chatId) {
    const newName = prompt('Enter new chat name:');
    if (newName && newName.trim()) {
      // Update chat name logic would go here
      showToast('✅ Chat name updated', 'success');
    }
  }

  deleteChat(chatId) {
    if (confirm('Are you sure you want to delete this chat?')) {
      // Delete chat logic would go here
      showToast('🗑️ Chat deleted', 'info');
    }
  }

  selectChat(chatId) {
    // Select chat logic would go here
    console.log('Selected chat:', chatId);
  }
}

// Initialize enhanced features
const folderManager = new FolderManager();
const databaseDetector = new DatabaseDetector();
const chatListRenderer = new ChatListRenderer();

// Setup event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Auto-detect database button
  const autoDetectButton = document.getElementById('auto-detect-button');
  if (autoDetectButton) {
    autoDetectButton.addEventListener('click', async function() {
      const urlInput = document.getElementById('notion-url');
      const url = urlInput?.value;
      
      if (!url) {
        showToast('❌ Please enter a Notion URL first', 'error');
        return;
      }

      this.disabled = true;
      this.textContent = '🔍 Detecting...';
      
      try {
        await databaseDetector.detectFromUrl(url);
      } finally {
        this.disabled = false;
        this.textContent = '🔍 Auto Detect';
      }
    });
  }

  // Create folder button
  const createFolderButton = document.getElementById('create-folder-button');
  if (createFolderButton) {
    createFolderButton.addEventListener('click', function() {
      const nameInput = document.getElementById('new-folder-name');
      const name = nameInput?.value?.trim();
      
      if (!name) {
        showToast('❌ Please enter a folder name', 'error');
        return;
      }

      if (folderManager.createFolder(name)) {
        nameInput.value = '';
        showToast(`✅ Folder "${name}" created`, 'success');
      } else {
        showToast('❌ Folder already exists', 'error');
      }
    });
  }

  // Render initial folders
  folderManager.renderFolders();
});

// Export for global access
window.folderManager = folderManager;
window.databaseDetector = databaseDetector;
window.chatListRenderer = chatListRenderer;

// Menu Management System
class MenuManager {
  constructor() {
    this.activeMenu = null;
    this.initMenuHandlers();
  }

  initMenuHandlers() {
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      if (this.activeMenu && !this.activeMenu.contains(event.target) && 
          !event.target.closest('.header-action-item')) {
        this.closeActiveMenu();
      }
    });

    // Prevent menu close when clicking inside menu
    document.addEventListener('click', (event) => {
      if (event.target.closest('.actions-menu')) {
        event.stopPropagation();
      }
    });
  }

  toggleMenu(menuId, buttonElement) {
    const menu = document.getElementById(menuId);
    if (!menu) return;

    // Close other menus first
    if (this.activeMenu && this.activeMenu !== menu) {
      this.closeActiveMenu();
    }

    if (menu.classList.contains('hidden')) {
      this.openMenu(menu);
    } else {
      this.closeMenu(menu);
    }
  }

  openMenu(menu) {
    menu.classList.remove('hidden');
    this.activeMenu = menu;
  }

  closeMenu(menu) {
    menu.classList.add('hidden');
    if (this.activeMenu === menu) {
      this.activeMenu = null;
    }
  }

  closeActiveMenu() {
    if (this.activeMenu) {
      this.closeMenu(this.activeMenu);
    }
  }

  // Export menu specific functions
  toggleExportMenu() {
    this.toggleMenu('export-menu');
  }

  exportAsText() {
    console.log('Exporting as TXT...');
    // Get current chat messages
    const messages = document.querySelectorAll('.message');
    let content = 'Chat Export - ' + new Date().toLocaleString() + '\n\n';
    
    messages.forEach(msg => {
      const role = msg.classList.contains('user-message') ? 'User' : 'Assistant';
      const text = msg.querySelector('.message-content')?.textContent || '';
      content += `${role}: ${text}\n\n`;
    });
    
    this.downloadFile(content, 'chat-export.txt', 'text/plain');
    this.closeActiveMenu();
  }

  exportAsMarkdown() {
    console.log('Exporting as Markdown...');
    const messages = document.querySelectorAll('.message');
    let content = '# Chat Export\n\n';
    content += `*Exported on: ${new Date().toLocaleString()}*\n\n`;
    
    messages.forEach(msg => {
      const role = msg.classList.contains('user-message') ? 'User' : 'Assistant';
      const text = msg.querySelector('.message-content')?.textContent || '';
      content += `## ${role}\n\n${text}\n\n`;
    });
    
    this.downloadFile(content, 'chat-export.md', 'text/markdown');
    this.closeActiveMenu();
  }

  exportAsHTML() {
    console.log('Exporting as HTML...');
    const messages = document.querySelectorAll('.message');
    let content = `
<!DOCTYPE html>
<html>
<head>
  <title>Chat Export</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .message { margin: 20px 0; padding: 15px; border-radius: 8px; }
    .user-message { background: #e3f2fd; }
    .assistant-message { background: #f5f5f5; }
    .role { font-weight: bold; margin-bottom: 10px; }
  </style>
</head>
<body>
  <h1>Chat Export</h1>
  <p><em>Exported on: ${new Date().toLocaleString()}</em></p>
`;
    
    messages.forEach(msg => {
      const role = msg.classList.contains('user-message') ? 'User' : 'Assistant';
      const text = msg.querySelector('.message-content')?.textContent || '';
      const messageClass = msg.classList.contains('user-message') ? 'user-message' : 'assistant-message';
      content += `
  <div class="message ${messageClass}">
    <div class="role">${escapeHtml(role)}</div>
    <div class="content">${escapeHtml(text)}</div>
  </div>
`;
    });
    
    content += '</body></html>';
    this.downloadFile(content, 'chat-export.html', 'text/html');
    this.closeActiveMenu();
  }

  exportAsPDF() {
    console.log('Exporting as PDF...');
    // For PDF export, we'll use browser's print to PDF functionality
    const messages = document.querySelectorAll('.message');
    let content = `
<html>
<head>
  <title>Chat Export</title>
  <style>
    @media print {
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
      .message { margin: 15px 0; padding: 10px; border: 1px solid #ddd; page-break-inside: avoid; }
      .user-message { background: #f0f8ff; }
      .assistant-message { background: #f9f9f9; }
      .role { font-weight: bold; margin-bottom: 8px; }
    }
  </style>
</head>
<body>
  <h1>Chat Export</h1>
  <p><em>Exported on: ${new Date().toLocaleString()}</em></p>
`;
    
    messages.forEach(msg => {
      const role = msg.classList.contains('user-message') ? 'User' : 'Assistant';
      const text = msg.querySelector('.message-content')?.textContent || '';
      const messageClass = msg.classList.contains('user-message') ? 'user-message' : 'assistant-message';
      content += `
  <div class="message ${messageClass}">
    <div class="role">${escapeHtml(role)}</div>
    <div class="content">${escapeHtml(text)}</div>
  </div>
`;
    });
    
    content += '</body></html>';
    
    const newWindow = window.open('', '_blank');
    newWindow.document.write(content);
    newWindow.document.close();
    newWindow.print();
    
    this.closeActiveMenu();
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Initialize menu manager
const menuManager = new MenuManager();
window.menuManager = menuManager;

// Debug log
console.log('Enhanced features loaded:', {
  folderManager: !!window.folderManager,
  databaseDetector: !!window.databaseDetector,
  chatListRenderer: !!window.chatListRenderer,
  menuManager: !!window.menuManager
});