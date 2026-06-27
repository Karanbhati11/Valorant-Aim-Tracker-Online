/**
 * Analytics dashboard data fetching utilities.
 * Provides aggregation queries for traffic sources, top pages,
 * and conversion paths (visitor → exercise completion).
 *
 * Validates: Requirements 16.5
 */

import { getDatabase } from '@/lib/mongo';

export interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
}

export interface TopPage {
  path: string;
  visitors: number;
}

export interface ConversionStep {
  label: string;
  count: number;
  percentage: number;
}

export interface ConversionPath {
  steps: ConversionStep[];
}

export interface AnalyticsDashboardData {
  trafficSources: TrafficSource[];
  topPages: TopPage[];
  conversionPath: ConversionPath;
  dateRange: { from: string; to: string };
}

/**
 * Gets traffic sources with visitor counts and percentages.
 * Aggregates page_view events by metadata.source field.
 */
export async function getTrafficSourcesBreakdown(
  startDate: Date,
  endDate: Date
): Promise<TrafficSource[]> {
  const db = await getDatabase();
  const collection = db.collection('analytics_events');

  const result = await collection
    .aggregate([
      {
        $match: {
          type: 'page_view',
          timestamp: {
            $gte: startDate.toISOString(),
            $lte: endDate.toISOString(),
          },
        },
      },
      {
        $group: {
          _id: { $ifNull: ['$metadata.source', 'direct'] },
          visitors: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          _id: 0,
          source: '$_id',
          visitors: { $size: '$visitors' },
        },
      },
      { $sort: { visitors: -1 } },
    ])
    .toArray();

  const totalVisitors = result.reduce((sum, item) => sum + item.visitors, 0);

  return result.map((item) => ({
    source: item.source as string,
    visitors: item.visitors as number,
    percentage: totalVisitors > 0 ? (item.visitors as number) / totalVisitors : 0,
  }));
}

/**
 * Gets top 10 pages by unique visitors (distinct sessionIds).
 */
export async function getTopPagesByVisitors(
  startDate: Date,
  endDate: Date,
  limit: number = 10
): Promise<TopPage[]> {
  const db = await getDatabase();
  const collection = db.collection('analytics_events');

  const result = await collection
    .aggregate([
      {
        $match: {
          type: 'page_view',
          timestamp: {
            $gte: startDate.toISOString(),
            $lte: endDate.toISOString(),
          },
        },
      },
      {
        $group: {
          _id: '$metadata.page',
          visitors: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          _id: 0,
          path: '$_id',
          visitors: { $size: '$visitors' },
        },
      },
      { $sort: { visitors: -1 } },
      { $limit: limit },
    ])
    .toArray();

  return result as TopPage[];
}

/**
 * Calculates conversion paths: visitor → exercise completion funnel.
 * A conversion is defined as a visitor completing at least one exercise during their session.
 *
 * Steps:
 * 1. Total unique visitors (sessions with page_view)
 * 2. Visitors who viewed an exercise page
 * 3. Visitors who started an exercise (exercise_start event)
 * 4. Visitors who completed an exercise (exercise_complete event) — this is the conversion
 */
export async function getConversionPath(
  startDate: Date,
  endDate: Date
): Promise<ConversionPath> {
  const db = await getDatabase();
  const collection = db.collection('analytics_events');

  const timeFilter = {
    timestamp: {
      $gte: startDate.toISOString(),
      $lte: endDate.toISOString(),
    },
  };

  // Step 1: Total unique visitors (distinct sessions with any page_view)
  const totalVisitorSessions = await collection.distinct('sessionId', {
    type: 'page_view',
    ...timeFilter,
  });
  const totalVisitors = totalVisitorSessions.length;

  // Step 2: Visitors who viewed an exercise page (page contains '/exercises' or is the trainer)
  const exerciseViewerSessions = await collection.distinct('sessionId', {
    type: 'page_view',
    $or: [
      { 'metadata.page': { $regex: '/exercise' } },
      { 'metadata.page': '/' },
    ],
    ...timeFilter,
  });
  const exerciseViewers = exerciseViewerSessions.length;

  // Step 3: Visitors who started an exercise
  const exerciseStartSessions = await collection.distinct('sessionId', {
    type: 'exercise_start',
    ...timeFilter,
  });
  const exerciseStarters = exerciseStartSessions.length;

  // Step 4: Visitors who completed an exercise (conversion)
  const exerciseCompleteSessions = await collection.distinct('sessionId', {
    type: 'exercise_complete',
    ...timeFilter,
  });
  const exerciseCompleters = exerciseCompleteSessions.length;

  const steps: ConversionStep[] = [
    {
      label: 'All Visitors',
      count: totalVisitors,
      percentage: 100,
    },
    {
      label: 'Viewed Exercise',
      count: exerciseViewers,
      percentage: totalVisitors > 0 ? (exerciseViewers / totalVisitors) * 100 : 0,
    },
    {
      label: 'Started Exercise',
      count: exerciseStarters,
      percentage: totalVisitors > 0 ? (exerciseStarters / totalVisitors) * 100 : 0,
    },
    {
      label: 'Completed Exercise',
      count: exerciseCompleters,
      percentage: totalVisitors > 0 ? (exerciseCompleters / totalVisitors) * 100 : 0,
    },
  ];

  return { steps };
}

/**
 * Fetches all analytics dashboard data for the admin view.
 */
export async function getAnalyticsDashboardData(): Promise<AnalyticsDashboardData> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [trafficSources, topPages, conversionPath] = await Promise.all([
    getTrafficSourcesBreakdown(thirtyDaysAgo, now),
    getTopPagesByVisitors(thirtyDaysAgo, now, 10),
    getConversionPath(thirtyDaysAgo, now),
  ]);

  return {
    trafficSources,
    topPages,
    conversionPath,
    dateRange: {
      from: thirtyDaysAgo.toISOString().split('T')[0],
      to: now.toISOString().split('T')[0],
    },
  };
}
