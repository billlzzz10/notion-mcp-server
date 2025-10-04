// Dashboard Components for Interactive Database Statistics
// สำหรับแสดงกราฟสถานะและความสำคัญแบบ Interactive

// === DASHBOARD INITIALIZATION ===
let dashboardContainer: HTMLElement;
let dashboardData: Record<string, any> = {};
let updateInterval: number | null = null;

// === CHART.JS INTEGRATION ===
async function loadChartLibrary() {
    try {
        // Load Chart.js from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
        document.head.appendChild(script);
        
        return new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
        });
    } catch (error) {
        console.error('Failed to load Chart.js:', error);
        throw error;
    }
}

// === DASHBOARD DATA FETCHING ===
async function fetchDatabaseStats(databaseId: string, databaseName: string) {
    try {
        const schema = await getOrDetectSchema(databaseId);
        const response = await notionFetch(`databases/${databaseId}/query`, {
            method: 'POST',
            body: JSON.stringify({
                page_size: 100
            })
        });

        const pages = response.results;
        const stats = {
            name: databaseName,
            total: pages.length,
            statusStats: {},
            priorityStats: {},
            recentActivity: [],
            lastUpdated: new Date().toISOString()
        };

        // Count by status
        if (schema.detectedFields.statusField) {
            pages.forEach(page => {
                const status = page.properties[schema.detectedFields.statusField!]?.select?.name || 'Unknown';
                stats.statusStats[status] = (stats.statusStats[status] || 0) + 1;
            });
        }

        // Count by priority
        if (schema.detectedFields.priorityField) {
            pages.forEach(page => {
                const priority = page.properties[schema.detectedFields.priorityField!]?.select?.name || 'Medium';
                stats.priorityStats[priority] = (stats.priorityStats[priority] || 0) + 1;
            });
        }

        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        stats.recentActivity = pages
            .filter(page => new Date(page.last_edited_time) > sevenDaysAgo)
            .map(page => ({
                id: page.id,
                title: page.properties[schema.detectedFields.titleField!]?.title?.[0]?.text?.content || 'Untitled',
                updated: page.last_edited_time
            }))
            .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
            .slice(0, 5);

        return stats;
        
    } catch (error) {
        console.error(`Failed to fetch stats for ${databaseName}:`, error);
        return {
            name: databaseName,
            total: 0,
            statusStats: {},
            priorityStats: {},
            recentActivity: [],
            error: error.message,
            lastUpdated: new Date().toISOString()
        };
    }
}

// === CHART CREATION ===
function createStatusChart(canvasId: string, statusData: Record<string, number>) {
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!ctx) return null;

    const labels = Object.keys(statusData);
    const data = Object.values(statusData);
    
    // Color mapping for common status values
    const statusColors = {
        'Not started': '#ef4444',
        'To Do': '#ef4444',
        'In progress': '#f59e0b',
        'In Progress': '#f59e0b',
        'Done': '#10b981',
        'Completed': '#10b981',
        'On hold': '#6b7280',
        'Blocked': '#dc2626',
        'Review': '#8b5cf6'
    };

    const backgroundColors = labels.map(label => statusColors[label] || '#64748b');

    return new (window as any).Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 2,
                borderColor: '#1f2937'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e5e7eb',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createPriorityChart(canvasId: string, priorityData: Record<string, number>) {
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!ctx) return null;

    const labels = Object.keys(priorityData);
    const data = Object.values(priorityData);
    
    // Color mapping for priority levels
    const priorityColors = {
        'Low': '#10b981',
        'Medium': '#f59e0b',
        'High': '#f97316',
        'Critical': '#dc2626',
        'Urgent': '#ef4444'
    };

    const backgroundColors = labels.map(label => priorityColors[label] || '#64748b');

    return new (window as any).Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'จำนวน',
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1,
                borderColor: '#1f2937'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#e5e7eb',
                        stepSize: 1
                    },
                    grid: {
                        color: '#374151'
                    }
                },
                x: {
                    ticks: {
                        color: '#e5e7eb'
                    },
                    grid: {
                        color: '#374151'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed.y} รายการ`;
                        }
                    }
                }
            }
        }
    });
}

// === DASHBOARD UI CREATION ===
function createDashboardCard(stats: any) {
    const card = document.createElement('div');
    card.className = 'dashboard-card';
    card.dataset.database = stats.name; // For easier selection later

    const header = document.createElement('div');
    header.className = 'dashboard-card-header';

    const title = document.createElement('h3');
    title.className = 'dashboard-card-title';
    title.textContent = stats.name;
    header.appendChild(title);

    const total = document.createElement('div');
    total.className = 'dashboard-card-total';
    total.textContent = `${stats.total} รายการ`;
    header.appendChild(total);
    card.appendChild(header);

    const content = document.createElement('div');
    content.className = 'dashboard-card-content';

    if (stats.error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'dashboard-error';
        errorDiv.textContent = `❌ ${stats.error}`;
        content.appendChild(errorDiv);
    } else {
        const chartsDiv = document.createElement('div');
        chartsDiv.className = 'dashboard-charts';

        // Status Chart
        const statusContainer = document.createElement('div');
        statusContainer.className = 'chart-container';
        const statusH4 = document.createElement('h4');
        statusH4.textContent = 'สถานะ';
        const statusCanvas = document.createElement('canvas');
        statusCanvas.id = `status-${stats.name.toLowerCase().replace(/\s+/g, '-')}`;
        statusCanvas.width = 200;
        statusCanvas.height = 200;
        statusContainer.appendChild(statusH4);
        statusContainer.appendChild(statusCanvas);
        chartsDiv.appendChild(statusContainer);

        // Priority Chart
        const priorityContainer = document.createElement('div');
        priorityContainer.className = 'chart-container';
        const priorityH4 = document.createElement('h4');
        priorityH4.textContent = 'ความสำคัญ';
        const priorityCanvas = document.createElement('canvas');
        priorityCanvas.id = `priority-${stats.name.toLowerCase().replace(/\s+/g, '-')}`;
        priorityCanvas.width = 200;
        priorityCanvas.height = 150;
        priorityContainer.appendChild(priorityH4);
        priorityContainer.appendChild(priorityCanvas);
        chartsDiv.appendChild(priorityContainer);
        
        content.appendChild(chartsDiv);

        const activityDiv = document.createElement('div');
        activityDiv.className = 'recent-activity';
        const activityH4 = document.createElement('h4');
        activityH4.textContent = 'กิจกรรมล่าสุด (7 วัน)';
        activityDiv.appendChild(activityH4);

        const activityList = document.createElement('div');
        activityList.className = 'activity-list';
        if (stats.recentActivity.length > 0) {
            stats.recentActivity.forEach(item => {
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                
                const activityTitle = document.createElement('span');
                activityTitle.className = 'activity-title';
                activityTitle.textContent = item.title;

                const activityTime = document.createElement('span');
                activityTime.className = 'activity-time';
                activityTime.textContent = new Date(item.updated).toLocaleDateString('th-TH');

                activityItem.appendChild(activityTitle);
                activityItem.appendChild(activityTime);
                activityList.appendChild(activityItem);
            });
        } else {
            const noActivity = document.createElement('div');
            noActivity.className = 'no-activity';
            noActivity.textContent = 'ไม่มีกิจกรรมล่าสุด';
            activityList.appendChild(noActivity);
        }
        activityDiv.appendChild(activityList);
        content.appendChild(activityDiv);
    }
    card.appendChild(content);

    const footer = document.createElement('div');
    footer.className = 'dashboard-card-footer';

    const lastUpdated = document.createElement('span');
    lastUpdated.className = 'last-updated';
    lastUpdated.textContent = `อัปเดตล่าสุด: ${new Date(stats.lastUpdated).toLocaleString('th-TH')}`;
    footer.appendChild(lastUpdated);

    const refreshButton = document.createElement('button');
    refreshButton.className = 'refresh-button';
    refreshButton.textContent = '🔄';
    refreshButton.onclick = () => refreshDatabaseStats(stats.name);
    footer.appendChild(refreshButton);
    card.appendChild(footer);
    
    return card;
}

// === DASHBOARD MANAGEMENT ===
async function initializeDashboard() {
    console.log('🚀 Initializing Dashboard...');
    
    try {
        await loadChartLibrary();
        console.log('✅ Chart.js loaded successfully');
        
        // Create dashboard container if not exists
        dashboardContainer = document.getElementById('dashboard-container');
        if (!dashboardContainer) {
            dashboardContainer = document.createElement('div');
            dashboardContainer.id = 'dashboard-container';
            dashboardContainer.className = 'dashboard-container';
            
            // Add to main layout
            const appContainer = document.querySelector('.app-container');
            if (appContainer) {
                appContainer.insertBefore(dashboardContainer, appContainer.firstChild);
            }
        }
        
        await updateAllDashboards();
        setupAutoRefresh();
        
        showToast('📊 Dashboard พร้อมใช้งาน!', 'success');
        
    } catch (error) {
        console.error('❌ Failed to initialize dashboard:', error);
        showToast('❌ ไม่สามารถโหลด Dashboard ได้', 'error');
    }
}

async function updateAllDashboards() {
    console.log('🔄 Updating all dashboards...');
    
    const databases = [
        { id: settings.projectsDbId, name: 'Projects' },
        { id: settings.tasksDbId, name: 'Tasks' },
        { id: settings.aiPromptsDbId, name: 'AI Prompts' },
        { id: settings.charactersDbId, name: 'Characters' },
        { id: settings.scenesDbId, name: 'Scenes' },
        { id: settings.locationsDbId, name: 'Locations' }
    ].filter(db => db.id); // Only include databases with valid IDs

    // Clear existing dashboard
    dashboardContainer.textContent = ''; // Safe clear

    const header = document.createElement('div');
    header.className = 'dashboard-header';

    const h2 = document.createElement('h2');
    h2.textContent = '📊 Notion Database Dashboard';
    header.appendChild(h2);

    const toggleButton = document.createElement('button');
    toggleButton.className = 'dashboard-toggle';
    toggleButton.textContent = '▼';
    toggleButton.onclick = toggleDashboard;
    header.appendChild(toggleButton);

    dashboardContainer.appendChild(header);

    const dashboardGrid = document.createElement('div');
    dashboardGrid.id = 'dashboard-grid';
    dashboardGrid.className = 'dashboard-grid';

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-dashboard';
    loadingDiv.textContent = '🔄 กำลังโหลดข้อมูล...';
    dashboardGrid.appendChild(loadingDiv);

    dashboardContainer.appendChild(dashboardGrid);

    dashboardGrid.textContent = ''; // Safe clear before populating

    // Fetch and create cards for each database
    for (const db of databases) {
        try {
            const stats = await fetchDatabaseStats(db.id, db.name);
            dashboardData[db.name] = stats;
            
            const card = createDashboardCard(stats);
            dashboardGrid.appendChild(card);
            
            // Create charts after DOM is updated
            setTimeout(() => {
                if (!stats.error) {
                    const statusCanvasId = `status-${db.name.toLowerCase().replace(/\s+/g, '-')}`;
                    const priorityCanvasId = `priority-${db.name.toLowerCase().replace(/\s+/g, '-')}`;
                    
                    if (Object.keys(stats.statusStats).length > 0) {
                        createStatusChart(statusCanvasId, stats.statusStats);
                    }
                    
                    if (Object.keys(stats.priorityStats).length > 0) {
                        createPriorityChart(priorityCanvasId, stats.priorityStats);
                    }
                }
            }, 100);
            
        } catch (error) {
            console.error(`Failed to create dashboard for ${db.name}:`, error);
        }
    }
    
    console.log('✅ Dashboard updated successfully');
}

async function refreshDatabaseStats(databaseName: string) {
    console.log(`🔄 Refreshing ${databaseName}...`);
    
    // Find database ID by name
    const dbMap = {
        'Projects': settings.projectsDbId,
        'Tasks': settings.tasksDbId,
        'AI Prompts': settings.aiPromptsDbId,
        'Characters': settings.charactersDbId,
        'Scenes': settings.scenesDbId,
        'Locations': settings.locationsDbId
    };
    
    const databaseId = dbMap[databaseName];
    if (!databaseId) {
        showToast(`❌ ไม่พบ Database ID สำหรับ ${databaseName}`, 'error');
        return;
    }
    
    try {
        const stats = await fetchDatabaseStats(databaseId, databaseName);
        dashboardData[databaseName] = stats;
        
        // Update only this card
        const card = createDashboardCard(stats);
        const existingCard = document.querySelector(`[data-database="${databaseName}"]`);
        if (existingCard) {
            existingCard.replaceWith(card);
        }
        
        // Recreate charts
        setTimeout(() => {
            if (!stats.error) {
                const statusCanvasId = `status-${databaseName.toLowerCase().replace(/\s+/g, '-')}`;
                const priorityCanvasId = `priority-${databaseName.toLowerCase().replace(/\s+/g, '-')}`;
                
                if (Object.keys(stats.statusStats).length > 0) {
                    createStatusChart(statusCanvasId, stats.statusStats);
                }
                
                if (Object.keys(stats.priorityStats).length > 0) {
                    createPriorityChart(priorityCanvasId, stats.priorityStats);
                }
            }
        }, 100);
        
        showToast(`✅ อัปเดต ${databaseName} สำเร็จ!`, 'success');
        
    } catch (error) {
        console.error(`Failed to refresh ${databaseName}:`, error);
        showToast(`❌ ไม่สามารถอัปเดต ${databaseName} ได้`, 'error');
    }
}

function setupAutoRefresh() {
    // Auto-refresh every 5 minutes
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    updateInterval = setInterval(() => {
        console.log('🔄 Auto-refreshing dashboard...');
        updateAllDashboards();
    }, 5 * 60 * 1000); // 5 minutes
}

function toggleDashboard() {
    const dashboardGrid = document.getElementById('dashboard-grid');
    const toggleButton = document.querySelector('.dashboard-toggle');
    
    if (dashboardGrid && toggleButton) {
        const isVisible = dashboardGrid.style.display !== 'none';
        dashboardGrid.style.display = isVisible ? 'none' : 'grid';
        toggleButton.textContent = isVisible ? '▶' : '▼';
        
        localStorage.setItem('ashvalDashboardVisible', (!isVisible).toString());
    }
}

// === EXPORT FUNCTIONS ===
function exportDashboardData() {
    const exportData = {
        timestamp: new Date().toISOString(),
        databases: dashboardData
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notion-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('📥 ส่งออกข้อมูล Dashboard สำเร็จ!', 'success');
}

// === GLOBAL FUNCTIONS FOR HTML INTEGRATION ===
(window as any).refreshDatabaseStats = refreshDatabaseStats;
(window as any).toggleDashboard = toggleDashboard;
(window as any).exportDashboardData = exportDashboardData;
(window as any).initializeDashboard = initializeDashboard;

// === AUTO-INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    // console.log('🚀 Dashboard system initializing...');
    
    // Wait for Chart.js to load
    const checkChartJS = setInterval(() => {
        if (typeof (window as any).Chart !== 'undefined') {
            clearInterval(checkChartJS);
            // console.log('📊 Chart.js loaded successfully');
            
            // Setup dashboard button event listener
            const dashboardButton = document.getElementById('dashboard-button');
            if (dashboardButton) {
                dashboardButton.addEventListener('click', toggleDashboard);
                // console.log('🎛️ Dashboard button connected');
            }
            
            // Initialize dashboard if settings are available
            const getSettingsFunc = (window as any).getSettings;
            if (getSettingsFunc) {
                const settings = getSettingsFunc();
                if (settings.notionToken && settings.projectsDbId) {
                    initializeDashboard();
                } else {
                    // console.log('⚠️ Dashboard requires Notion settings to be configured');
                }
            }
        }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => {
        clearInterval(checkChartJS);
        if (typeof (window as any).Chart === 'undefined') {
            console.error('❌ Chart.js failed to load within 10 seconds');
        }
    }, 10000);
});