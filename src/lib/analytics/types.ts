/**
 * Analytics system type definitions.
 * Defines event tracking and dashboard metrics interfaces.
 */

export interface AnalyticsEvent {
  type: 'page_view' | 'exercise_start' | 'exercise_complete' | 'score_submit' | 'signup' | 'share';
  userId?: string;
  sessionId: string;
  timestamp: string;
  metadata: Record<string, string | number>;
}

export interface DashboardMetrics {
  mau: number;
  dau: number;
  bounceRate: number;
  avgSessionDuration: number;
  exerciseCompletionRate: number;
  retentionRates: { day1: number; day7: number; day30: number };
  topPages: { path: string; visitors: number }[];
  trafficSources: { source: string; percentage: number }[];
}
