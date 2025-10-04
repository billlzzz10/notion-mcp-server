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

    container.textContent = ''; // Clear existing content

    Object.entries(this.databases).forEach(([name, dbId]) => {
      const dbItem = document.createElement('div');
      dbItem.className = 'database-item';

      const infoDiv = document.createElement('div');
      infoDiv.className = 'database-info';

      const nameDiv = document.createElement('div');
      nameDiv.className = 'database-name';
      nameDiv.textContent = name;
      infoDiv.appendChild(nameDiv);

      const button = document.createElement('button');
      button.className = 'view-database-btn';
      button.textContent = 'View';
      button.addEventListener('click', () => this.fetchDatabaseData(dbId, name));

      dbItem.appendChild(infoDiv);
      dbItem.appendChild(button);
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
    `; // This is safe, no user input
    container.appendChild(summary);
  }

  // Render database data in main content area
  renderDatabaseData(databaseName, data) {
    const container = document.getElementById('database-content');
    if (!container) return;

    container.textContent = ''; // Clear content

    // Calculate stats
    const totalPages = data.pages?.length || 0;
    const uniqueProperties = new Set();
    data.pages?.forEach(page => {
      if (page.properties) {
        Object.keys(page.properties).forEach(prop => uniqueProperties.add(prop));
      }
    });

    const headerDiv = document.createElement('div');
    headerDiv.className = 'database-header';

    const h2 = document.createElement('h2');
    h2.textContent = `📊 ${databaseName}`; // SAFE
    headerDiv.appendChild(h2);

    const statsDiv = document.createElement('div');
    statsDiv.className = 'database-stats';
    statsDiv.innerHTML = `
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
    `; // Safe, no user input
    headerDiv.appendChild(statsDiv);
    container.appendChild(headerDiv);

    const tableContainer = document.createElement('div');
    tableContainer.className = 'database-table-container';
    this.renderDataTable(tableContainer, data); // Pass container to render into
    container.appendChild(tableContainer);
  }

  // Render data as table
  renderDataTable(container, data) {
    container.textContent = '';

    if (!data.pages || data.pages.length === 0) {
      container.innerHTML = '<div class="no-data">📭 No data found in this database</div>';
      return;
    }

    const allProperties = new Set();
    data.pages.forEach(page => {
      if (page.properties) {
        Object.keys(page.properties).forEach(prop => allProperties.add(prop));
      }
    });
    const headers = Array.from(allProperties);

    // Create controls
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'table-controls';
    controlsDiv.innerHTML = `
        <div class="search-container">
          <input type="text" id="table-search" placeholder="🔍 Search entries..." class="table-search-input">
        </div>
        <div class="view-controls">
          <button class="view-toggle active" data-view="table">📊 Table</button>
          <button class="view-toggle" data-view="cards">📋 Cards</button>
        </div>
    `; // Safe
    container.appendChild(controlsDiv);

    const tableView = document.createElement('div');
    tableView.id = 'table-view';
    const table = document.createElement('table');
    table.className = 'data-table';
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headerRow = document.createElement('tr');
    const titleHeader = document.createElement('th');
    titleHeader.className = 'title-header';
    titleHeader.textContent = '📌 Title';
    headerRow.appendChild(titleHeader);

    headers.filter(h => h !== 'Name' && h !== 'Title').forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    data.pages.forEach(page => {
      const tr = document.createElement('tr');
      tr.className = 'table-row';
      const titleTd = document.createElement('td');
      titleTd.className = 'title-cell';
      titleTd.textContent = this.extractTitle(page);
      tr.appendChild(titleTd);
      
      headers.filter(h => h !== 'Name' && h !== 'Title').forEach(header => {
        const td = document.createElement('td');
        const property = page.properties?.[header];
        td.appendChild(this.formatPropertyValue(property));
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    tableView.appendChild(table);
    container.appendChild(tableView);

    const cardsView = document.createElement('div');
    cardsView.id = 'cards-view';
    cardsView.style.display = 'none';
    this.renderDataCards(cardsView, data); // Pass container
    container.appendChild(cardsView);
  }

  // Render data as cards
  renderDataCards(container, data) {
    container.textContent = '';
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards-container';
    
    data.pages.forEach(page => {
      const card = document.createElement('div');
      card.className = 'data-card';

      const header = document.createElement('div');
      header.className = 'card-header';
      const title = document.createElement('h3');
      title.className = 'card-title';
      title.textContent = this.extractTitle(page);
      header.appendChild(title);
      card.appendChild(header);

      const propertiesDiv = document.createElement('div');
      propertiesDiv.className = 'card-properties';

      Object.entries(page.properties || {}).forEach(([key, property]) => {
        if (key !== 'Name' && key !== 'Title') {
          const valueNode = this.formatPropertyValue(property);
          // Only add if it's not the empty node
          if (valueNode.textContent !== '—') {
              const propDiv = document.createElement('div');
              propDiv.className = 'card-property';

              const labelSpan = document.createElement('span');
              labelSpan.className = 'property-label';
              labelSpan.textContent = `${key}:`;

              const valueSpan = document.createElement('span');
              valueSpan.className = 'property-value';
              valueSpan.appendChild(valueNode);

              propDiv.appendChild(labelSpan);
              propDiv.appendChild(valueSpan);
              propertiesDiv.appendChild(propDiv);
          }
        }
      });
      card.appendChild(propertiesDiv);
      cardsContainer.appendChild(card);
    });
    container.appendChild(cardsContainer);
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
    const createSpan = (text, className) => {
        const span = document.createElement('span');
        if (className) span.className = className;
        span.textContent = text;
        return span;
    };

    if (!property) return createSpan('—', 'empty-value');

    switch (property.type) {
      case 'title':
        const strong = document.createElement('strong');
        strong.textContent = property.title?.[0]?.plain_text || '';
        return strong;
      case 'rich_text':
        return document.createTextNode(property.rich_text?.[0]?.plain_text || '');
      case 'number':
        return createSpan(property.number || 0, 'number-value');
      case 'select':
        const selectName = property.select?.name || '';
        return selectName ? createSpan(selectName, `select-tag select-${selectName.toLowerCase().replace(/\s+/g, '-')}`) : document.createTextNode('');
      case 'multi_select':
        const fragment = document.createDocumentFragment();
        (property.multi_select || []).forEach(s => {
            fragment.appendChild(createSpan(s.name, 'select-tag multi-select-tag'));
            fragment.appendChild(document.createTextNode(' '));
        });
        return fragment;
      case 'date':
        return property.date?.start ? createSpan(new Date(property.date.start).toLocaleDateString(), 'date-value') : document.createTextNode('');
      case 'checkbox':
        return property.checkbox ? createSpan('✅ Yes', 'checkbox-value checked') : createSpan('❌ No', 'checkbox-value unchecked');
      case 'url':
        if (!property.url) return document.createTextNode('');
        const a = document.createElement('a');
        if (property.url.startsWith('https://') || property.url.startsWith('http://')) {
            a.href = property.url;
        } else {
            a.href = '#';
            a.title = 'Invalid URL';
        }
        a.target = '_blank';
        a.className = 'url-link';
        a.textContent = '🔗 Link';
        return a;
      case 'email':
        if (!property.email) return document.createTextNode('');
        const mailLink = document.createElement('a');
        mailLink.href = `mailto:${property.email}`;
        mailLink.className = 'email-link';
        mailLink.textContent = property.email;
        return mailLink;
      case 'phone_number':
        if (!property.phone_number) return document.createTextNode('');
        const phoneLink = document.createElement('a');
        phoneLink.href = `tel:${property.phone_number}`;
        phoneLink.className = 'phone-link';
        phoneLink.textContent = property.phone_number;
        return phoneLink;
      case 'relation':
        return property.relation?.length > 0 ? createSpan(`${property.relation.length} relations`, 'relation-count') : document.createTextNode('');
      default:
        const jsonStr = JSON.stringify(property).substring(0, 50);
        return createSpan(`${jsonStr}...`, 'json-preview');
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
      container.textContent = '';
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';

      const iconDiv = document.createElement('div');
      iconDiv.className = 'error-icon';
      iconDiv.textContent = '⚠️';

      const textDiv = document.createElement('div');
      textDiv.className = 'error-text';
      textDiv.textContent = message;

      const button = document.createElement('button');
      button.className = 'retry-btn';
      button.textContent = 'Try Again';
      button.addEventListener('click', () => this.fetchDatabases());

      errorDiv.appendChild(iconDiv);
      errorDiv.appendChild(textDiv);
      errorDiv.appendChild(button);
      container.appendChild(errorDiv);
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