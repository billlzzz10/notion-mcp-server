// Simple mock for NotionAITools
export class NotionAITools {
  constructor(token: string) {
    console.log('NotionAITools initialized with token:', token ? 'provided' : 'missing');
  }

  async createIntelligentDashboard(config: any) {
    return {
      status: 'success',
      pageId: 'mock-page-id',
      url: 'https://notion.so/mock-dashboard',
      timestamp: new Date()
    };
  }

  getCacheStats() {
    return {
      hits: 0,
      misses: 0,
      size: 0
    };
  }

  clearCache() {
    console.log('Cache cleared');
  }
}
