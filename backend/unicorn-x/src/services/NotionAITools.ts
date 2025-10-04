/**
 * Notion AI Tools - เครื่องมือพิเศษสำหรับ Notion ที่ขับเคลื่อนด้วย AI
 * มุ่งเน้นการสร้างแดชบอร์ดและระบบอัตโนมัติที่สวยงามใน Notion
 */

import { Client } from '@notionhq/client';

export interface DatabaseConfig {
  id: string;
  name: string;
  filter?: any;
  sorts?: any[];
  propertyMappings?: Record<string, string>;
}

export interface DashboardConfig {
  title: string;
  description?: string;
  databases: DatabaseConfig[];
  layout: 'grid' | 'list' | 'gallery' | 'timeline';
  visualizations: Array<{
    type: 'chart' | 'table' | 'summary' | 'kpi';
    title: string;
    dataSource: string;
    chartType?: 'bar' | 'line' | 'pie' | 'area';
    groupBy?: string;
    aggregation?: 'count' | 'sum' | 'average' | 'max' | 'min';
  }>;
  updateFrequency?: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  permissions?: {
    viewers: string[];
    editors: string[];
  };
}

export interface NotificationConfig {
  name: string;
  description?: string;
  triggers: Array<{
    database: string;
    conditions: Array<{
      property: string;
      operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
      value: any;
    }>;
    frequency: 'immediate' | 'daily' | 'weekly';
  }>;
  channels: Array<{
    type: 'notion' | 'telegram' | 'email' | 'webhook';
    config: Record<string, any>;
  }>;
  template: {
    title: string;
    message: string;
    includeData: boolean;
  };
}

export interface VisualizationPlan {
  sections: Array<{
    id: string;
    title: string;
    type: 'chart' | 'table' | 'summary' | 'callout' | 'divider';
    data?: any;
    chartConfig?: {
      type: 'bar' | 'line' | 'pie';
      xAxis?: string;
      yAxis?: string;
      groupBy?: string;
    };
    mermaidCode?: string;
    content?: string;
    style?: {
      backgroundColor?: string;
      textColor?: string;
      icon?: string;
    };
  }>;
  metadata: {
    totalSections: number;
    estimatedRenderTime: number;
    requiredPermissions: string[];
  };
}

export class NotionAITools {
  private notion: Client;
  private dbCache: Map<string, { data: any[]; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(notionToken: string) {
    this.notion = new Client({ auth: notionToken });
  }

  /**
   * สร้างแดชบอร์ดอัตโนมัติจากหลายฐานข้อมูล
   */
  async createIntelligentDashboard(config: DashboardConfig): Promise<{
    status: 'success' | 'error';
    message: string;
    pageId?: string;
    pageUrl?: string;
    errors?: string[];
  }> {
    try {
      console.log('🎨 Creating intelligent dashboard:', config.title);

      // 1. ดึงข้อมูลจากฐานข้อมูลต่างๆ
      const databasesData = await this.fetchDataFromMultipleDatabases(config.databases);
      
      // 2. วิเคราะห์ข้อมูลและสร้างแผนการแสดงผล
      const visualizationPlan = await this.generateIntelligentVisualization(
        databasesData, 
        config.visualizations,
        config.layout
      );

      // 3. สร้างหน้า Notion ใหม่
      const page = await this.notion.pages.create({
        parent: { type: "workspace", workspace: true },
        properties: {
          title: [{ type: "text", text: { content: config.title } }]
        },
        children: [
          {
            object: "block",
            type: "heading_1",
            heading_1: {
              rich_text: [{ 
                type: "text", 
                text: { content: config.title },
                annotations: { bold: true, color: "purple" }
              }]
            }
          },
          ...(config.description ? [{
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{ 
                type: "text", 
                text: { content: config.description } 
              }]
            }
          }] : []),
          {
            object: "block",
            type: "callout",
            callout: {
              rich_text: [{ 
                type: "text", 
                text: { content: `🤖 แดชบอร์ดนี้สร้างโดย UnicornX AI • อัปเดตล่าสุด: ${new Date().toLocaleString('th-TH')}` } 
              }],
              icon: { type: "emoji", emoji: "🦄" },
              color: "purple_background"
            }
          },
          {
            object: "block",
            type: "divider",
            divider: {}
          }
        ] as any
      });

      // 4. สร้างและเพิ่มบล็อกต่างๆ
      const dashboardBlocks = await this.createDashboardBlocks(visualizationPlan, databasesData);
      
      if (dashboardBlocks.length > 0) {
        await this.notion.blocks.children.append({
          block_id: page.id,
          children: dashboardBlocks
        });
      }

      // 5. ตั้งค่าการอัปเดตอัตโนมัติ
      if (config.updateFrequency && config.updateFrequency !== 'realtime') {
        await this.setupAutomaticUpdate(page.id, config);
      }

      console.log('✅ Dashboard created successfully:', page.id);

      return {
        status: 'success',
        message: 'สร้างแดชบอร์ดเรียบร้อยแล้ว',
        pageId: page.id,
        pageUrl: page.url
      };

    } catch (error) {
      console.error('❌ Error creating dashboard:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * ดึงข้อมูลจากหลายฐานข้อมูลพร้อมแคชอัจฉริยะ
   */
  async fetchDataFromMultipleDatabases(databases: DatabaseConfig[]): Promise<Record<string, any[]>> {
    const results: Record<string, any[]> = {};
    
    for (const db of databases) {
      try {
        // ตรวจสอบแคช
        const cacheKey = `${db.id}_${JSON.stringify(db.filter)}_${JSON.stringify(db.sorts)}`;
        const cached = this.dbCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log(`📦 Using cached data for database: ${db.name}`);
          results[db.id] = cached.data;
          continue;
        }

        console.log(`🔍 Fetching data from database: ${db.name}`);

        // ดึงข้อมูลจาก Notion
        let hasMore = true;
        let startCursor: string | undefined = undefined;
        const allResults: any[] = [];

        // Get data source ID
        const dbResponse = await this.notion.databases.retrieve({ database_id: db.id });
        const dataSource = dbResponse.data_sources?.[0];
        if (!dataSource) {
          throw new Error(`No data source found for database: ${db.name}`);
        }

        while (hasMore) {
          const response = await this.notion.request({
            path: `data_sources/${dataSource.id}/query`,
            method: 'post',
            body: {
              filter: db.filter,
              sorts: db.sorts,
              start_cursor: startCursor,
              page_size: 100
            }
          }) as any;

          allResults.push(...response.results);
          hasMore = response.has_more;
          startCursor = response.next_cursor || undefined;
        }

        // ประมวลผลและจัดรูปแบบข้อมูล
        const processedData = allResults.map(item => this.processNotionPage(item, db.propertyMappings));
        
        // เก็บในแคช
        this.dbCache.set(cacheKey, {
          data: processedData,
          timestamp: Date.now()
        });

        results[db.id] = processedData;
        console.log(`✅ Fetched ${processedData.length} items from ${db.name}`);

      } catch (error) {
        console.error(`❌ Error fetching database ${db.name}:`, error);
        results[db.id] = [];
      }
    }

    return results;
  }

  /**
   * ประมวลผลหน้า Notion และแปลงเป็นรูปแบบที่ใช้งานง่าย
   */
  private processNotionPage(page: any, propertyMappings?: Record<string, string>): Record<string, any> {
    const result: Record<string, any> = {
      id: page.id,
      url: page.url,
      created_time: page.created_time,
      last_edited_time: page.last_edited_time
    };

    // ประมวลผล properties
    for (const [key, property] of Object.entries(page.properties || {})) {
      const mappedKey = propertyMappings?.[key] || key;
      result[mappedKey] = this.extractPropertyValue(property as any);
    }

    return result;
  }

  /**
   * ดึงค่าจาก Notion property ตามประเภท
   */
  private extractPropertyValue(property: any): any {
    if (!property || !property.type) return null;

    switch (property.type) {
      case 'title':
        return property.title?.[0]?.plain_text || '';
      case 'rich_text':
        return property.rich_text?.map((text: any) => text.plain_text).join('') || '';
      case 'number':
        return property.number;
      case 'select':
        return property.select?.name || null;
      case 'multi_select':
        return property.multi_select?.map((option: any) => option.name) || [];
      case 'date':
        return property.date?.start || null;
      case 'checkbox':
        return property.checkbox;
      case 'url':
        return property.url;
      case 'email':
        return property.email;
      case 'phone_number':
        return property.phone_number;
      case 'formula':
        return this.extractPropertyValue(property.formula);
      case 'relation':
        return property.relation?.map((rel: any) => rel.id) || [];
      case 'rollup':
        return property.rollup?.array?.map((item: any) => this.extractPropertyValue(item)) || [];
      case 'people':
        return property.people?.map((person: any) => person.name || person.id) || [];
      case 'files':
        return property.files?.map((file: any) => file.name || file.external?.url || file.file?.url) || [];
      case 'created_time':
      case 'last_edited_time':
        return property[property.type];
      case 'created_by':
      case 'last_edited_by':
        return property[property.type]?.name || property[property.type]?.id;
      default:
        return property[property.type] || null;
    }
  }

  /**
   * สร้างแผนการแสดงผลอัจฉริยะ
   */
  async generateIntelligentVisualization(
    databasesData: Record<string, any[]>,
    requestedVisualizations: DashboardConfig['visualizations'],
    layout: DashboardConfig['layout']
  ): Promise<VisualizationPlan> {
    const sections: VisualizationPlan['sections'] = [];

    // สร้างสรุปภาพรวม
    sections.push({
      id: 'overview',
      title: '📊 ภาพรวมข้อมูล',
      type: 'summary',
      content: this.generateOverviewSummary(databasesData),
      style: {
        backgroundColor: 'blue_background',
        icon: '📊'
      }
    });

    // สร้าง visualizations ตามที่ร้องขอ
    for (const viz of requestedVisualizations) {
      const data = databasesData[viz.dataSource];
      if (!data || data.length === 0) continue;

      switch (viz.type) {
        case 'chart':
          sections.push(this.createChartSection(viz, data));
          break;
        case 'table':
          sections.push(this.createTableSection(viz, data));
          break;
        case 'kpi':
          sections.push(this.createKPISection(viz, data));
          break;
        case 'summary':
          sections.push(this.createSummarySection(viz, data));
          break;
      }
    }

    // เพิ่ม divider ระหว่างส่วน
    const sectionsWithDividers: VisualizationPlan['sections'] = [];
    sections.forEach((section, index) => {
      sectionsWithDividers.push(section);
      if (index < sections.length - 1) {
        sectionsWithDividers.push({
          id: `divider_${index}`,
          title: '',
          type: 'divider'
        });
      }
    });

    return {
      sections: sectionsWithDividers,
      metadata: {
        totalSections: sectionsWithDividers.length,
        estimatedRenderTime: sectionsWithDividers.length * 2, // 2 seconds per section
        requiredPermissions: ['notion:read', 'notion:write']
      }
    };
  }

  /**
   * สร้างสรุปภาพรวม
   */
  private generateOverviewSummary(databasesData: Record<string, any[]>): string {
    const dbNames = Object.keys(databasesData);
    const totalRecords = Object.values(databasesData).reduce((sum, data) => sum + data.length, 0);
    
    let summary = `รวมข้อมูลจาก ${dbNames.length} ฐานข้อมูล ทั้งหมด ${totalRecords} รายการ\n\n`;
    
    Object.entries(databasesData).forEach(([dbId, data]) => {
      summary += `• ฐานข้อมูล ${dbId}: ${data.length} รายการ\n`;
    });

    summary += `\n🕐 อัปเดตล่าสุด: ${new Date().toLocaleString('th-TH')}`;
    
    return summary;
  }

  /**
   * สร้างส่วนแสดงกราฟ
   */
  private createChartSection(viz: any, data: any[]): VisualizationPlan['sections'][0] {
    // สร้าง Mermaid chart code
    const mermaidCode = this.generateMermaidChart(viz, data);
    
    return {
      id: `chart_${viz.title.replace(/\s+/g, '_')}`,
      title: viz.title,
      type: 'chart',
      data: data,
      chartConfig: {
        type: viz.chartType || 'bar',
        groupBy: viz.groupBy
      },
      mermaidCode: mermaidCode
    };
  }

  /**
   * สร้างส่วนแสดงตาราง
   */
  private createTableSection(viz: any, data: any[]): VisualizationPlan['sections'][0] {
    return {
      id: `table_${viz.title.replace(/\s+/g, '_')}`,
      title: viz.title,
      type: 'table',
      data: {
        headers: Object.keys(data[0] || {}),
        rows: data.slice(0, 10).map(item => Object.values(item)) // แสดง 10 รายการแรก
      }
    };
  }

  /**
   * สร้างส่วน KPI
   */
  private createKPISection(viz: any, data: any[]): VisualizationPlan['sections'][0] {
    const value = this.calculateKPI(data, viz.aggregation || 'count', viz.groupBy);
    
    return {
      id: `kpi_${viz.title.replace(/\s+/g, '_')}`,
      title: viz.title,
      type: 'callout',
      content: `${value}`,
      style: {
        backgroundColor: 'green_background',
        icon: '📈'
      }
    };
  }

  /**
   * สร้างส่วนสรุป
   */
  private createSummarySection(viz: any, data: any[]): VisualizationPlan['sections'][0] {
    const summary = this.generateDataSummary(data, viz.groupBy);
    
    return {
      id: `summary_${viz.title.replace(/\s+/g, '_')}`,
      title: viz.title,
      type: 'summary',
      content: summary,
      style: {
        backgroundColor: 'gray_background',
        icon: '📝'
      }
    };
  }

  /**
   * สร้าง Mermaid chart code
   */
  private generateMermaidChart(viz: any, data: any[]): string {
    if (viz.chartType === 'pie') {
      return this.generateMermaidPieChart(data, viz.groupBy);
    } else {
      return this.generateMermaidBarChart(data, viz.groupBy);
    }
  }

  /**
   * สร้าง Mermaid pie chart
   */
  private generateMermaidPieChart(data: any[], groupBy?: string): string {
    if (!groupBy || data.length === 0) return 'pie title ไม่มีข้อมูล\n    "ไม่มีข้อมูล" : 1';

    const grouped = this.groupDataBy(data, groupBy);
    const chartData = Object.entries(grouped)
      .map(([key, items]) => `    "${key}" : ${items.length}`)
      .join('\n');

    return `pie title การแจกแจงตาม ${groupBy}\n${chartData}`;
  }

  /**
   * สร้าง Mermaid bar chart (ใช้ xychart-beta)
   */
  private generateMermaidBarChart(data: any[], groupBy?: string): string {
    if (!groupBy || data.length === 0) {
      return 'xychart-beta\n    title "ไม่มีข้อมูล"\n    x-axis []\n    y-axis "จำนวน"\n    bar []';
    }

    const grouped = this.groupDataBy(data, groupBy);
    const labels = Object.keys(grouped).slice(0, 10); // แสดงไม่เกิน 10 กลุ่ม
    const values = labels.map(label => grouped[label].length);

    return `xychart-beta
    title "กราฟแสดงจำนวนตาม ${groupBy}"
    x-axis [${labels.map(l => `"${l}"`).join(', ')}]
    y-axis "จำนวน"
    bar [${values.join(', ')}]`;
  }

  /**
   * จัดกลุ่มข้อมูลตาม field
   */
  private groupDataBy(data: any[], field: string): Record<string, any[]> {
    return data.reduce((groups, item) => {
      const key = String(item[field] || 'ไม่ระบุ');
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {} as Record<string, any[]>);
  }

  /**
   * คำนวณ KPI
   */
  private calculateKPI(data: any[], aggregation: string, field?: string): string {
    if (data.length === 0) return '0';

    switch (aggregation) {
      case 'count':
        return data.length.toLocaleString('th-TH');
      case 'sum':
        if (!field) return '0';
        const sum = data.reduce((total, item) => total + (Number(item[field]) || 0), 0);
        return sum.toLocaleString('th-TH');
      case 'average':
        if (!field) return '0';
        const numbers = data.map(item => Number(item[field]) || 0);
        const avg = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
        return avg.toFixed(2);
      case 'max':
        if (!field) return '0';
        const max = Math.max(...data.map(item => Number(item[field]) || 0));
        return max.toLocaleString('th-TH');
      case 'min':
        if (!field) return '0';
        const min = Math.min(...data.map(item => Number(item[field]) || 0));
        return min.toLocaleString('th-TH');
      default:
        return data.length.toLocaleString('th-TH');
    }
  }

  /**
   * สร้างสรุปข้อมูล
   */
  private generateDataSummary(data: any[], groupBy?: string): string {
    if (data.length === 0) return 'ไม่มีข้อมูล';

    let summary = `รวม ${data.length} รายการ\n\n`;

    if (groupBy) {
      const grouped = this.groupDataBy(data, groupBy);
      summary += `การแจกแจงตาม ${groupBy}:\n`;
      Object.entries(grouped)
        .sort(([,a], [,b]) => b.length - a.length)
        .slice(0, 5)
        .forEach(([key, items]) => {
          summary += `• ${key}: ${items.length} รายการ\n`;
        });
    }

    return summary;
  }

  /**
   * สร้างบล็อกสำหรับแดชบอร์ด
   */
  async createDashboardBlocks(plan: VisualizationPlan, databasesData: Record<string, any[]>): Promise<any[]> {
    const blocks: any[] = [];

    for (const section of plan.sections) {
      switch (section.type) {
        case 'summary':
        case 'callout':
          blocks.push({
            object: "block",
            type: "callout",
            callout: {
              rich_text: [{ type: "text", text: { content: section.content || '' } }],
              icon: { type: "emoji", emoji: section.style?.icon || "📊" },
              color: section.style?.backgroundColor || "default"
            }
          });
          break;

        case 'chart':
          blocks.push({
            object: "block",
            type: "heading_2",
            heading_2: {
              rich_text: [{ type: "text", text: { content: section.title } }]
            }
          });
          
          if (section.mermaidCode) {
            blocks.push({
              object: "block",
              type: "code",
              code: {
                language: "mermaid",
                rich_text: [{ type: "text", text: { content: section.mermaidCode } }]
              }
            });
          }
          break;

        case 'table':
          blocks.push({
            object: "block",
            type: "heading_2",
            heading_2: {
              rich_text: [{ type: "text", text: { content: section.title } }]
            }
          });
          
          if (section.data?.headers && section.data?.rows) {
            blocks.push(this.createTableBlock(section.data));
          }
          break;

        case 'divider':
          blocks.push({
            object: "block",
            type: "divider",
            divider: {}
          });
          break;
      }
    }

    return blocks;
  }

  /**
   * สร้างบล็อกตาราง
   */
  private createTableBlock(tableData: { headers: string[]; rows: any[][] }): any {
    const { headers, rows } = tableData;
    
    const tableBlock = {
      object: "block",
      type: "table",
      table: {
        table_width: headers.length,
        has_column_header: true,
        has_row_header: false,
        children: []
      }
    };

    // สร้างแถวส่วนหัว
    const headerRow = {
      object: "block",
      type: "table_row",
      table_row: {
        cells: headers.map(header => [{ 
          type: "text", 
          text: { content: String(header) },
          annotations: { bold: true }
        }])
      }
    };
    tableBlock.table.children.push(headerRow);

    // สร้างแถวข้อมูล (สูงสุด 10 แถว)
    for (const row of rows.slice(0, 10)) {
      const rowBlock = {
        object: "block",
        type: "table_row",
        table_row: {
          cells: row.map(cell => [{
            type: "text",
            text: { content: String(cell || '') }
          }])
        }
      };
      tableBlock.table.children.push(rowBlock);
    }

    return tableBlock;
  }

  /**
   * ตั้งค่าการอัปเดตอัตโนมัติ
   */
  async setupAutomaticUpdate(pageId: string, config: DashboardConfig): Promise<void> {
    // สำหรับ demo เพียง log
    console.log(`⏰ Setting up automatic update for page ${pageId} with frequency: ${config.updateFrequency}`);
    
    // ในระบบจริงจะบันทึกการตั้งค่าลงในฐานข้อมูลและสร้าง cron job
    const updateJob = {
      pageId,
      config,
      schedule: this.parseUpdateFrequency(config.updateFrequency || 'daily'),
      nextUpdate: this.calculateNextUpdate(config.updateFrequency || 'daily')
    };

    console.log('📅 Update job created:', updateJob);
  }

  /**
   * แปลงความถี่การอัปเดตเป็นรูปแบบ cron
   */
  private parseUpdateFrequency(frequency: string): string {
    switch (frequency) {
      case 'hourly':
        return '0 * * * *';
      case 'daily':
        return '0 9 * * *'; // 09:00 ทุกวัน
      case 'weekly':
        return '0 9 * * 1'; // 09:00 ทุกวันจันทร์
      case 'monthly':
        return '0 9 1 * *'; // 09:00 วันที่ 1 ของทุกเดือน
      default:
        return '0 9 * * *';
    }
  }

  /**
   * คำนวณเวลาอัปเดตครั้งถัดไป
   */
  private calculateNextUpdate(frequency: string): Date {
    const now = new Date();
    const next = new Date(now);

    switch (frequency) {
      case 'hourly':
        next.setHours(next.getHours() + 1, 0, 0, 0);
        break;
      case 'daily':
        next.setDate(next.getDate() + 1);
        next.setHours(9, 0, 0, 0);
        break;
      case 'weekly':
        const daysUntilMonday = (8 - next.getDay()) % 7 || 7;
        next.setDate(next.getDate() + daysUntilMonday);
        next.setHours(9, 0, 0, 0);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1, 1);
        next.setHours(9, 0, 0, 0);
        break;
      default:
        next.setDate(next.getDate() + 1);
        next.setHours(9, 0, 0, 0);
    }

    return next;
  }

  /**
   * ล้างแคช
   */
  clearCache(): void {
    this.dbCache.clear();
    console.log('🧹 Cache cleared');
  }

  /**
   * รับสถิติการใช้งานแคช
   */
  getCacheStats(): { size: number; entries: Array<{ key: string; timestamp: number; dataSize: number }> } {
    const entries = Array.from(this.dbCache.entries()).map(([key, value]) => ({
      key,
      timestamp: value.timestamp,
      dataSize: value.data.length
    }));

    return {
      size: this.dbCache.size,
      entries
    };
  }
}
