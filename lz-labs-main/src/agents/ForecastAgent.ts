import { ForecastResult } from '../types/forecast';
import { AGENT_FORECAST_API_URL } from '../constants/api';

/**
 * ฟังก์ชันหลักสำหรับเรียก Forecasting Agent ที่ Hugging Face หรือ REST API
 * @param payload ข้อมูลที่ใช้ในการพยากรณ์ (Full Payload)
 * @returns Promise<ForecastResult>
 */
export async function fetchForecastAgent(payload: {
  userId: string;
  forecastType: 'project_timeline' | 'resource_allocation' | 'task_completion';
  timeRange: { start: string; end: string };
  dataSource: string;
  projectId?: string;
  modelType?: string;
  taskCategories?: string[];
  milestoneTracking?: boolean;
  graphFormat?: string;
  cacheStrategy?: 'vector' | 'none' | 'semantic';
  options?: Record<string, any>;
}): Promise<ForecastResult> {
  const res = await fetch(AGENT_FORECAST_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error(`[ForecastAgent] API error: ${res.status} ${res.statusText}`);
    throw new Error('Forecast Agent API error');
  }

  const data = await res.json();

  // รูปแบบ response สมมุติจาก agent:
  // {
  //   summary: string;
  //   timeline: [{ label, date, confidence }];
  //   risks: [{ description, probability }];
  //   recommendedActions: string[];
  //   visualization: string;
  // }

  return {
    summary: data.summary,
    timeline: data.timeline ?? [],
    risks: data.risks ?? [],
    recommendedActions: data.recommendedActions ?? [],
    visualization: data.visualization ?? '',
  };
}
