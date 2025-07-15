/**
 * Database Optimizer Tool
 * เครื่องมือสำหรับอัปเดตข้อมูลที่ขาดหายและจัดการคอลัมน์ที่ไม่จำเป็น
 */

import { notion } from '../services/notion.js';

/**
 * ค้นหาและอัปเดตข้อมูลที่ยังไม่ครบถ้วนในฐานข้อมูล
 */
export const findAndFillMissingData = {
  name: 'findAndFillMissingData',
  description: 'ค้นหาและอัปเดตข้อมูลที่ยังไม่ครบถ้วนในฐานข้อมูล Notion',
  inputSchema: {
    type: 'object',
    properties: {
      databaseId: {
        type: 'string',
        description: 'Database ID ที่ต้องการตรวจสอบ (ถ้าไม่ระบุจะตรวจสอบทุกฐานข้อมูล)'
      },
      autoFill: {
        type: 'boolean',
        description: 'ให้ AI กรอกข้อมูลอัตโนมัติหรือไม่ (default: false)',
        default: false
      },
      fieldTypes: {
        type: 'array',
        items: { type: 'string' },
        description: 'ประเภทฟิลด์ที่ต้องการตรวจสอบ (title, text, select, date, number)',
        default: ['title', 'text', 'select']
      }
    }
  },

  async execute(args) {
    try {
      const { databaseId, autoFill = false, fieldTypes = ['title', 'text', 'select'] } = args;
      
      // รายการฐานข้อมูลที่จะตรวจสอบ
      const databases = databaseId ? [databaseId] : [
        process.env.NOTION_CHARACTERS_DB_ID,
        process.env.NOTION_SCENES_DB_ID,
        process.env.NOTION_LOCATIONS_DB_ID,
        process.env.NOTION_PROJECTS_DB_ID
      ].filter(Boolean);

      const results = [];

      for (const dbId of databases) {
        console.log(`🔍 กำลังตรวจสอบฐานข้อมูล: ${dbId}`);
        
        // ดึงข้อมูลฐานข้อมูล
        const dbInfo = await notion.databases.retrieve({ database_id: dbId });
        const dbName = dbInfo.title[0]?.plain_text || 'Unknown Database';
        
        // ดึงรายการหน้า
        const pages = await notion.databases.query({ database_id: dbId });
        
        const missingDataReport = {
          databaseId: dbId,
          databaseName: dbName,
          totalPages: pages.results.length,
          missingFields: [],
          updatedPages: []
        };

        // วิเคราะห์แต่ละหน้า
        for (const page of pages.results) {
          const pageTitle = page.properties[Object.keys(page.properties)[0]]?.title?.[0]?.plain_text || 'Untitled';
          const missingInPage = [];

          // ตรวจสอบแต่ละ property
          for (const [propName, propData] of Object.entries(page.properties)) {
            const propType = dbInfo.properties[propName]?.type;
            
            if (fieldTypes.includes(propType)) {
              let isEmpty = false;
              
              switch (propType) {
                case 'title':
                  isEmpty = !propData.title || propData.title.length === 0;
                  break;
                case 'rich_text':
                  isEmpty = !propData.rich_text || propData.rich_text.length === 0;
                  break;
                case 'select':
                  isEmpty = !propData.select;
                  break;
                case 'date':
                  isEmpty = !propData.date;
                  break;
                case 'number':
                  isEmpty = propData.number === null || propData.number === undefined;
                  break;
              }

              if (isEmpty) {
                missingInPage.push({
                  propertyName: propName,
                  propertyType: propType,
                  suggested: await generateSuggestedValue(propName, propType, pageTitle, dbName)
                });
              }
            }
          }

          if (missingInPage.length > 0) {
            missingDataReport.missingFields.push({
              pageId: page.id,
              pageTitle,
              missingFields: missingInPage
            });

            // อัปเดตอัตโนมัติถ้าเปิดใช้งาน
            if (autoFill) {
              const updateProperties = {};
              for (const missing of missingInPage) {
                updateProperties[missing.propertyName] = formatPropertyValue(
                  missing.propertyType, 
                  missing.suggested
                );
              }

              await notion.pages.update({
                page_id: page.id,
                properties: updateProperties
              });

              missingDataReport.updatedPages.push({
                pageId: page.id,
                pageTitle,
                updatedFields: Object.keys(updateProperties)
              });
            }
          }
        }

        results.push(missingDataReport);
      }

      return {
        success: true,
        summary: `✅ ตรวจสอบ ${results.length} ฐานข้อมูลเสร็จสิ้น`,
        autoFillEnabled: autoFill,
        databases: results,
        totalMissingFields: results.reduce((sum, db) => sum + db.missingFields.length, 0),
        totalUpdatedPages: autoFill ? results.reduce((sum, db) => sum + db.updatedPages.length, 0) : 0
      };

    } catch (error) {
      console.error('❌ Error in findAndFillMissingData:', error);
      return {
        success: false,
        error: error.message,
        details: 'ไม่สามารถตรวจสอบข้อมูลที่ขาดหายได้'
      };
    }
  }
};

/**
 * วิเคราะห์และลิสต์คอลัมน์ที่ไม่จำเป็นในฐานข้อมูล
 */
export const analyzeUnnecessaryColumns = {
  name: 'analyzeUnnecessaryColumns',
  description: 'วิเคราะห์และลิสต์คอลัมน์ที่ไม่จำเป็นในฐานข้อมูล Notion',
  inputSchema: {
    type: 'object',
    properties: {
      databaseId: {
        type: 'string',
        description: 'Database ID ที่ต้องการวิเคราะห์ (ถ้าไม่ระบุจะวิเคราะห์ทุกฐานข้อมูล)'
      },
      minimumUsageThreshold: {
        type: 'number',
        description: 'เปอร์เซ็นต์การใช้งานขั้นต่ำ (0-100) ที่ถือว่าคอลัมน์จำเป็น',
        default: 20
      }
    }
  },

  async execute(args) {
    try {
      const { databaseId, minimumUsageThreshold = 20 } = args;
      
      // รายการฐานข้อมูลที่จะวิเคราะห์
      const databases = databaseId ? [databaseId] : [
        process.env.NOTION_CHARACTERS_DB_ID,
        process.env.NOTION_SCENES_DB_ID,
        process.env.NOTION_LOCATIONS_DB_ID,
        process.env.NOTION_PROJECTS_DB_ID
      ].filter(Boolean);

      const results = [];

      for (const dbId of databases) {
        console.log(`📊 กำลังวิเคราะห์ฐานข้อมูล: ${dbId}`);
        
        // ดึงข้อมูลฐานข้อมูล
        const dbInfo = await notion.databases.retrieve({ database_id: dbId });
        const dbName = dbInfo.title[0]?.plain_text || 'Unknown Database';
        
        // ดึงรายการหน้า
        const pages = await notion.databases.query({ database_id: dbId });
        const totalPages = pages.results.length;
        
        const columnAnalysis = {
          databaseId: dbId,
          databaseName: dbName,
          totalPages,
          columnStats: [],
          unnecessaryColumns: [],
          recommendations: []
        };

        // วิเคราะห์แต่ละคอลัมน์
        for (const [propName, propConfig] of Object.entries(dbInfo.properties)) {
          let usedCount = 0;
          let emptyCount = 0;

          // นับการใช้งานในแต่ละหน้า
          for (const page of pages.results) {
            const propData = page.properties[propName];
            let hasValue = false;

            switch (propConfig.type) {
              case 'title':
                hasValue = propData.title && propData.title.length > 0;
                break;
              case 'rich_text':
                hasValue = propData.rich_text && propData.rich_text.length > 0;
                break;
              case 'select':
                hasValue = !!propData.select;
                break;
              case 'multi_select':
                hasValue = propData.multi_select && propData.multi_select.length > 0;
                break;
              case 'date':
                hasValue = !!propData.date;
                break;
              case 'number':
                hasValue = propData.number !== null && propData.number !== undefined;
                break;
              case 'checkbox':
                hasValue = propData.checkbox !== null;
                break;
              case 'relation':
                hasValue = propData.relation && propData.relation.length > 0;
                break;
              default:
                hasValue = true; // สำหรับประเภทอื่นๆ ถือว่ามีค่า
            }

            if (hasValue) {
              usedCount++;
            } else {
              emptyCount++;
            }
          }

          const usagePercentage = totalPages > 0 ? (usedCount / totalPages) * 100 : 0;
          
          const columnStat = {
            name: propName,
            type: propConfig.type,
            usedCount,
            emptyCount,
            usagePercentage: Math.round(usagePercentage * 100) / 100,
            isNecessary: usagePercentage >= minimumUsageThreshold
          };

          columnAnalysis.columnStats.push(columnStat);

          // ถ้าการใช้งานต่ำกว่าเกณฑ์
          if (usagePercentage < minimumUsageThreshold && propConfig.type !== 'title') {
            columnAnalysis.unnecessaryColumns.push({
              ...columnStat,
              reason: `ใช้งานเพียง ${usagePercentage.toFixed(1)}% ต่ำกว่าเกณฑ์ ${minimumUsageThreshold}%`
            });
          }
        }

        // สร้างคำแนะนำ
        if (columnAnalysis.unnecessaryColumns.length > 0) {
          columnAnalysis.recommendations.push(
            `💡 พบ ${columnAnalysis.unnecessaryColumns.length} คอลัมน์ที่ใช้งานน้อย ควรพิจารณาลบหรือรวมกับคอลัมน์อื่น`
          );
        }

        if (columnAnalysis.columnStats.some(col => col.emptyCount > totalPages * 0.8)) {
          columnAnalysis.recommendations.push(
            `📝 มีคอลัมน์ที่ว่างเปล่ามากกว่า 80% ควรเพิ่มข้อมูลหรือลบคอลัมน์`
          );
        }

        results.push(columnAnalysis);
      }

      return {
        success: true,
        summary: `📊 วิเคราะห์ ${results.length} ฐานข้อมูลเสร็จสิ้น`,
        threshold: `${minimumUsageThreshold}%`,
        databases: results,
        totalUnnecessaryColumns: results.reduce((sum, db) => sum + db.unnecessaryColumns.length, 0)
      };

    } catch (error) {
      console.error('❌ Error in analyzeUnnecessaryColumns:', error);
      return {
        success: false,
        error: error.message,
        details: 'ไม่สามารถวิเคราะห์คอลัมน์ได้'
      };
    }
  }
};

// Helper functions
async function generateSuggestedValue(propName, propType, pageTitle, dbName) {
  // สร้างค่าที่แนะนำตามชื่อ property และ context
  const suggestions = {
    'Description': `รายละเอียดของ ${pageTitle}`,
    'Status': 'Active',
    'Priority': 'Medium',
    'Type': 'General',
    'Category': 'Uncategorized',
    'Tags': ['New'],
    'Notes': `หมายเหตุสำหรับ ${pageTitle}`
  };

  return suggestions[propName] || `ข้อมูลที่สร้างโดย AI สำหรับ ${pageTitle}`;
}

function formatPropertyValue(propType, value) {
  switch (propType) {
    case 'title':
      return { title: [{ text: { content: value } }] };
    case 'rich_text':
      return { rich_text: [{ text: { content: value } }] };
    case 'select':
      return { select: { name: value } };
    case 'multi_select':
      return { multi_select: Array.isArray(value) ? value.map(v => ({ name: v })) : [{ name: value }] };
    case 'number':
      return { number: typeof value === 'number' ? value : 1 };
    case 'checkbox':
      return { checkbox: Boolean(value) };
    case 'date':
      return { date: { start: new Date().toISOString().split('T')[0] } };
    default:
      return { rich_text: [{ text: { content: String(value) } }] };
  }
}
