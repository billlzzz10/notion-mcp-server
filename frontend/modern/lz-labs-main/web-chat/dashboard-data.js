// Dashboard Data Management System
class DashboardDataManager {
  constructor() {
    // Use globalThis.API_BASE_URL if defined, otherwise fallback to localhost:3001
    this.apiBase = typeof globalThis.API_BASE_URL === 'string' && globalThis.API_BASE_URL
      ? globalThis.API_BASE_URL
      : 'http://localhost:3001';
    this.databases = {};
    this.isLoading = false;
  }

  // Fetch all available databases
  async fetchDatabases() {
    try {
      this.isLoading = true;
      this.updateLoadingState();

      console.log('Fetching databases from:', `${this.apiBase}/api/databases`);
      const response = await fetch(`${this.apiBase}/api/databases`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched databases:', data);
      
      this.databases = data.databases || {};
      this.renderDatabaseList();
      return this.databases;
    } catch (error) {
      console.error('Error fetching databases:', error);
      this.showError('Failed to fetch databases: ' + error.message);
      return {};
    } finally {
      this.isLoading = false;
      this.updateLoadingState();
    }
  }

  // Fetch data from specific database
  async fetchDatabaseData(databaseId, databaseName) {
    try {
      this.isLoading = true;
      this.updateLoadingState();

      const response = await fetch(`${this.apiBase}/api/database/${databaseId}/pages`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Fetched data from ${databaseName}:`, data);
      
      this.renderDatabaseData(databaseName, data);
      return data;
    } catch (error) {
      console.error(`Error fetching data from ${databaseName}:`, error);
      this.showError(`Failed to fetch data from ${databaseName}: ` + error.message);
      return null;
    } finally {
      this.isLoading = false;
      this.updateLoadingState();
    }
  }

  // Render database list in sidebar
  renderDatabaseList() {
    const container = document.getElementById('database-list');
    if (!container) return;

    container.innerHTML = '';

    Object.entries(this.databases).forEach(([name, dbId]) => {
      const dbItem = document.createElement('div');
      dbItem.className = 'database-item';
      dbItem.innerHTML = `
        <div class="database-info">
          <div class="database-name">${name}</div>
        </div>
        <button class="view-database-btn" onclick="dashboardData.fetchDatabaseData('${dbId}', '${name}')">
          View
        </button>
      `;
      container.appendChild(dbItem);
    });

    // Add summary info
    const summary = document.createElement('div');
    summary.className = 'database-summary';
    summary.innerHTML = `
      <div class="summary-stat">
        <span class="stat-number">${Object.keys(this.databases).length}</span>
        <span class="stat-label">Databases</span>
      </div>
    `;
    container.appendChild(summary);
  }

  // Render database data in main content area
  renderDatabaseData(databaseName, data) {
    const container = document.getElementById('database-content');
    if (!container) return;

    // Calculate stats
    const totalPages = data.pages?.length || 0;
    const uniqueProperties = new Set();
    data.pages?.forEach(page => {
      if (page.properties) {
        Object.keys(page.properties).forEach(prop => uniqueProperties.add(prop));
      }
    });

    container.innerHTML = `
      <div class="database-header">
        <h2>📊 ${databaseName}</h2>
        <div class="database-stats">
          <div class="stat-card">
            <div class="stat-number">${totalPages}</div>
            <div class="stat-label">Entries</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${uniqueProperties.size}</div>
            <div class="stat-label">Properties</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${new Date().toLocaleDateString()}</div>
            <div class="stat-label">Last Updated</div>
          </div>
        </div>
      </div>
      <div class="database-table-container">
        ${this.renderDataTable(data)}
      </div>
    `;
  }

  // Render data as table
  renderDataTable(data) {
    if (!data.pages || data.pages.length === 0) {
      return '<div class="no-data">📭 No data found in this database</div>';
    }

    // Get all unique properties from all pages
    const allProperties = new Set();
    data.pages.forEach(page => {
      if (page.properties) {
        Object.keys(page.properties).forEach(prop => allProperties.add(prop));
      }
    });

    const headers = Array.from(allProperties);

    let tableHTML = `
      <div class="table-controls">
        <div class="search-container">
          <input type="text" id="table-search" placeholder="🔍 Search entries..." class="table-search-input">
        </div>
        <div class="view-controls">
          <button class="view-toggle active" data-view="table">📊 Table</button>
          <button class="view-toggle" data-view="cards">📋 Cards</button>
        </div>
      </div>
      <div id="table-view">
        <table class="data-table">
          <thead>
            <tr>
              <th class="title-header">📌 Title</th>
              ${headers.filter(h => h !== 'Name' && h !== 'Title').map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;

    data.pages.forEach(page => {
      const title = this.extractTitle(page);
      tableHTML += `<tr class="table-row">`;
      tableHTML += `<td class="title-cell">${title}</td>`;
      
      headers.filter(h => h !== 'Name' && h !== 'Title').forEach(header => {
        const property = page.properties?.[header];
        const value = this.formatPropertyValue(property);
        tableHTML += `<td>${value}</td>`;
      });
      
      tableHTML += `</tr>`;
    });

    tableHTML += `
          </tbody>
        </table>
      </div>
      <div id="cards-view" style="display: none;">
        ${this.renderDataCards(data)}
      </div>
    `;
    return tableHTML;
  }

  // Render data as cards
  renderDataCards(data) {
    let cardsHTML = '<div class="cards-container">';
    
    data.pages.forEach(page => {
      const title = this.extractTitle(page);
      cardsHTML += `
        <div class="data-card">
          <div class="card-header">
            <h3 class="card-title">${title}</h3>
          </div>
          <div class="card-properties">
      `;
      
      Object.entries(page.properties || {}).forEach(([key, property]) => {
        if (key !== 'Name' && key !== 'Title') {
          const value = this.formatPropertyValue(property);
          if (value && value !== '<span class="empty-value">—</span>') {
            cardsHTML += `
              <div class="card-property">
                <span class="property-label">${key}:</span>
                <span class="property-value">${value}</span>
              </div>
            `;
          }
        }
      });
      
      cardsHTML += `
          </div>
        </div>
      `;
    });
    
    cardsHTML += '</div>';
    return cardsHTML;
  }

  // Extract title from page
  extractTitle(page) {
    if (page.properties?.Name?.title?.[0]?.plain_text) {
      return page.properties.Name.title[0].plain_text;
    }
    if (page.properties?.Title?.title?.[0]?.plain_text) {
      return page.properties.Title.title[0].plain_text;
    }
    return 'Untitled';
  }

  // Format property value for display
  formatPropertyValue(property) {
    if (!property) return '<span class="empty-value">—</span>';

    switch (property.type) {
      case 'title':
        return `<strong>${property.title?.[0]?.plain_text || ''}</strong>`;
      case 'rich_text':
        return property.rich_text?.[0]?.plain_text || '';
      case 'number':
        return `<span class="number-value">${property.number || 0}</span>`;
      case 'select':
        const selectName = property.select?.name || '';
        return selectName ? `<span class="select-tag select-${selectName.toLowerCase().replace(/\s+/g, '-')}">${selectName}</span>` : '';
      case 'multi_select':
        return property.multi_select?.map(s => 
          `<span class="select-tag multi-select-tag">${s.name}</span>`
        ).join(' ') || '';
      case 'date':
        return property.date?.start ? 
          `<span class="date-value">${new Date(property.date.start).toLocaleDateString()}</span>` : '';
      case 'checkbox':
        return property.checkbox ? 
          '<span class="checkbox-value checked">✅ Yes</span>' : 
          '<span class="checkbox-value unchecked">❌ No</span>';
      case 'url':
        return property.url ? 
          `<a href="${property.url}" target="_blank" class="url-link">🔗 Link</a>` : '';
      case 'email':
        return property.email ? 
          `<a href="mailto:${property.email}" class="email-link">${property.email}</a>` : '';
      case 'phone_number':
        return property.phone_number ? 
          `<a href="tel:${property.phone_number}" class="phone-link">${property.phone_number}</a>` : '';
      case 'relation':
        return property.relation?.length > 0 ? 
          `<span class="relation-count">${property.relation.length} relations</span>` : '';
      default:
        const jsonStr = JSON.stringify(property).substring(0, 50);
        return `<span class="json-preview" title="${jsonStr}...">${jsonStr}...</span>`;
    }
  }

  // Update loading state UI
  updateLoadingState() {
    const loadingIndicator = document.getElementById('loading-indicator');
    const refreshBtn = document.getElementById('refresh-databases-btn');
    
    if (loadingIndicator) {
      loadingIndicator.style.display = this.isLoading ? 'block' : 'none';
    }
    
    if (refreshBtn) {
      refreshBtn.disabled = this.isLoading;
      refreshBtn.innerHTML = this.isLoading ? 
        '<i>⏳</i> Loading...' : 
        '<i>🔄</i> Refresh';
    }
  }

  // Show error message
  showError(message) {
    const container = document.getElementById('database-content');
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <div class="error-icon">⚠️</div>
          <div class="error-text">${message}</div>
          <button onclick="dashboardData.fetchDatabases()" class="retry-btn">Try Again</button>
        </div>
      `;
    }
  }

  // Initialize dashboard
  async init() {
    console.log('Initializing Dashboard Data Manager...');
    await this.fetchDatabases();
    this.setupEventListeners();
  }

  // Setup event listeners for interactive features
  setupEventListeners() {
    // Search functionality
    document.addEventListener('input', (e) => {
      if (e.target.id === 'table-search') {
        this.filterTable(e.target.value);
      }
    });

    // View toggle functionality
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('view-toggle')) {
        const viewType = e.target.dataset.view;
        this.switchView(viewType);
        
        // Update active state
        document.querySelectorAll('.view-toggle').forEach(btn => {
          btn.classList.remove('active');
        });
        e.target.classList.add('active');
      }
    });
  }

  // Filter table based on search query
  filterTable(query) {
    const rows = document.querySelectorAll('.table-row');
    const cards = document.querySelectorAll('.data-card');
    
    const searchTerm = query.toLowerCase();
    
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
    
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(searchTerm) ? '' : 'none';
    });
  }

  // Switch between table and cards view
  switchView(viewType) {
    const tableView = document.getElementById('table-view');
    const cardsView = document.getElementById('cards-view');
    
    if (viewType === 'table') {
      tableView.style.display = 'block';
      cardsView.style.display = 'none';
    } else {
      tableView.style.display = 'none';
      cardsView.style.display = 'block';
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.dashboardData = new DashboardDataManager();
});
