
# 🚀 Performance Integration Guide

## การใช้งานระบบปรับปรุงประสิทธิภาพ

### 1. Smart Cache

```javascript
import { smartCache } from './build/performance/smartCacheSystem.js';

// ใช้ cache
const data = await smartCache.get('key', async () => {
  return await fetchDataFromAPI();
});

// ล้าง cache
smartCache.clear();
```

### 2. Batch Processing

```javascript
import { performanceOptimizer } from './build/performance/performanceOptimizer.js';

const operations = [
  { type: 'create', data: {...} },
  { type: 'update', pageId: '123', properties: {...} }
];

const results = await performanceOptimizer.batchOperations(operations);
```

### 3. High-Speed Project Manager

```javascript
import { highSpeedProjectManager } from './build/performance/highSpeedProjectManager.js';

// สร้างโครงการด้วยความเร็วสูง
const result = await highSpeedProjectManager.createProjectFast(projectData);

// อัปเดตหลายโครงการ
const updateResults = await highSpeedProjectManager.bulkUpdateProjects(updates);
```

### 4. Performance Monitoring

- ระบบจะติดตามประสิทธิภาพอัตโนมัติ
- รายงานจะถูกสร้างทุก 5 นาที
- ดูสถิติได้จาก performance-demo.js

### 5. การปรับแต่ง

แก้ไขได้ที่ `./build/config/performanceConfig.js`
