import { fetchForecastAgent } from '@/agents/ForecastAgent';

const result = await fetchForecastAgent({
  userId: currentUserId,
  forecastType: 'project_timeline',
  timeRange: { start: '2025-07-07', end: '2025-08-15' },
  dataSource: 'bigquery://unicornx.project.tasks',
  projectId: 'unicornX',
  modelType: 'gemini',
  taskCategories: ['UI/UX', 'testing'],
  milestoneTracking: true,
  graphFormat: 'mermaid',
  cacheStrategy: 'vector',
});
