// Enhanced Tools Index - Updated with new AI capabilities
// รายการเครื่องมือขั้นสูง - อัปเดตด้วยความสามารถ AI ใหม่

// Core MCP Tools (existing)
export * from './pages.js';
export * from './database.js';
export * from './blocks.js';

// Enhanced AI Tools (new)
export * from './enhancedVectorSearch.js';
export * from './realtimeCollaboration.js';
export * from './aiContentIntelligence.js';
export * from './performanceMonitoring.js';

// Import tool handlers
import { enhancedVectorSearch, handleEnhancedVectorSearch } from './enhancedVectorSearch.js';
import { realtimeCollaboration, handleRealtimeCollaboration } from './realtimeCollaboration.js';
import { aiContentIntelligence, handleAiContentIntelligence } from './aiContentIntelligence.js';
import { performanceMonitoring, handlePerformanceMonitoring } from './performanceMonitoring.js';

// Enhanced tool registry
export const enhancedTools = [
  enhancedVectorSearch,
  realtimeCollaboration,
  aiContentIntelligence,
  performanceMonitoring
];

export const enhancedHandlers = {
  enhanced_vector_search: handleEnhancedVectorSearch,
  realtime_collaboration: handleRealtimeCollaboration,
  ai_content_intelligence: handleAiContentIntelligence,
  performance_monitoring: handlePerformanceMonitoring
};

console.log('🚀 Enhanced tools loaded:', enhancedTools.length);
console.log('เครื่องมือขั้นสูงโหลดแล้ว:', enhancedTools.length);
