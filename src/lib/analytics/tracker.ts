/**
 * Analytics event tracking system.
 * Records page views, unique users, session duration (30-min inactivity timeout),
 * bounce rate per page, exercise completion rates, average scores, and player retention.
 *
 * Validates: Requirements 16.1, 16.2
 */

import { getDatabase } from '@/lib/mongo';
import { AnalyticsEvent, DashboardMetrics } from './types';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes in milliseconds
const METRICS_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Records an analytics event to the database.
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  const db = await getDatabase();
  await db.collection('analytics_events').insertOne({
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  });
}

/**
 * Generates a unique session ID for tracking.
 * Sessions expire after 30 minutes of inactivity.
 */
export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Determines if a session has expired based on the 30-minute inactivity timeout.
 */
export function isSessionExpired(lastActivityTimestamp: string): boolean {
  const lastActivity = new Date(lastActivityTimestamp).getTime();
  const now = Date.now();
  return now - lastActivity > SESSION_TIMEOUT_MS;
}

/**
 * Calculates session duration from first to last interaction within a session.
 * Returns duration in seconds.
 */
export async function calculateSessionDuration(sessionId: string): Promise<number> {
  const db = await getDatabase();
  const events = await db
    .collection('analytics_events')
    .find({ sessionId })
    .sort({ timestamp: 1 })
    .project({ timestamp: 1 })
    .toArray();

  if (events.length < 2) {
    return 0;
  }

  const firstEvent = new Date(events[0].timestamp).getTime();
  const lastEvent = new Date(events[events.length - 1].timestamp).getTime();
  return Math.floor((lastEvent - firstEvent) / 1000);
}

/**
 * Calculates bounce rate for a specific page.
 * Bounce = session with only a single page view.
 * Returns a value between 0.0 and 1.0.
 */
export async function calculateBounceRate(page?: string): Promise<number> {
  const db = await getDatabase();
  const collection = db.collection('analytics_events');

  // Get all unique sessions that have page_view events
  const matchFilter: Record<string, unknown> = { type: 'page_view' };
  if (page) {
    matchFilter['metadata.page'] = page;
  }

  const sessionPageCounts = await collection
    .aggregate<{ _id: string; pageViewCount: number; distinctPages: string[] }>([
      { $match: matchFilter },
      {
        $group: {
          _id: '$sessionId',
          pageViewCount: { $sum: 1 },
          distinctPages: { $addToSet: '$metadata.page' },
        },
      },
    ])
    .toArray();

  if (sessionPageCounts.length === 0) {
    return 0;
  }

  const bouncedSessions = sessionPageCounts.filter(
    (session) => session.distinctPages.length === 1 && session.pageViewCount === 1
  );

  return bouncedSessions.length / sessionPageCounts.length;
}

/**
 * Gets the count of unique users (distinct browser sessions) within a time range.
 */
export async function getUniqueUsers(startDate: Date, endDate: Date): Promise<number> {
  const db = await getDatabase();
  const result = await db
    .collection('analytics_events')
    .distinct('sessionId', {
      timestamp: {
        $gte: startDate.toISOString(),
        $lte: endDate.toISOString(),
      },
    });

  return result.length;
}

/**
 * Gets page view count within a time range, optionally filtered by page.
 */
export async function getPageViews(
  startDate: Date,
  endDate: Date,
  page?: string
): Promise<number> {
  const db = await getDatabase();
  const filter: Record<string, unknown> = {
    type: 'page_view',
    timestamp: {
      $gte: startDate.toISOString(),
      $lte: endDate.toISOString(),
    },
  };

  if (page) {
    filter['metadata.page'] = page;
  }

  return db.collection('analytics_events').countDocuments(filter);
}

/**
 * Calculates exercise completion rate.
 * Completion rate = exercises completed / exercises started.
 * Returns a value between 0.0 and 1.0.
 */
export async function calculateExerciseCompletionRate(
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  const db = await getDatabase();
  const collection = db.collection('analytics_events');

  const timeFilter: Record<string, unknown> = {};
  if (startDate && endDate) {
    timeFilter.timestamp = {
      $gte: startDate.toISOString(),
      $lte: endDate.toISOString(),
    };
  }

  const started = await collection.countDocuments({
    type: 'exercise_start',
    ...timeFilter,
  });

  if (started === 0) {
    return 0;
  }

  const completed = await collection.countDocuments({
    type: 'exercise_complete',
    ...timeFilter,
  });

  return completed / started;
}

/**
 * Calculates average score across all completed exercises.
 * Returns mean percentage score (0-1000 normalized to percentage).
 */
export async function calculateAverageScore(
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  const db = await getDatabase();
  const collection = db.collection('analytics_events');

  const timeFilter: Record<string, unknown> = {};
  if (startDate && endDate) {
    timeFilter.timestamp = {
      $gte: startDate.toISOString(),
      $lte: endDate.toISOString(),
    };
  }

  const result = await collection
    .aggregate<{ _id: null; avgScore: number }>([
      {
        $match: {
          type: 'exercise_complete',
          'metadata.score': { $exists: true },
          ...timeFilter,
        },
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: { $toDouble: '$metadata.score' } },
        },
      },
    ])
    .toArray();

  if (result.length === 0) {
    return 0;
  }

  return result[0].avgScore;
}

/**
 * Calculates player retention rates.
 * Retention = percentage of users who return and complete at least one exercise
 * within 1-day, 7-day, and 30-day intervals after their first visit.
 */
export async function calculateRetentionRates(): Promise<{
  day1: number;
  day7: number;
  day30: number;
}> {
  const db = await getDatabase();
  const collection = db.collection('analytics_events');

  // Get all users' first visit timestamps
  const firstVisits = await collection
    .aggregate<{ _id: string; firstVisit: string }>([
      { $match: { type: 'page_view' } },
      {
        $group: {
          _id: '$sessionId',
          userId: { $first: '$userId' },
          firstVisit: { $min: '$timestamp' },
        },
      },
      { $match: { userId: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$userId',
          firstVisit: { $min: '$firstVisit' },
        },
      },
    ])
    .toArray();

  if (firstVisits.length === 0) {
    return { day1: 0, day7: 0, day30: 0 };
  }

  let returnedDay1 = 0;
  let returnedDay7 = 0;
  let returnedDay30 = 0;
  let eligibleDay1 = 0;
  let eligibleDay7 = 0;
  let eligibleDay30 = 0;

  const now = new Date();

  for (const user of firstVisits) {
    const firstVisitDate = new Date(user.firstVisit);
    const daysSinceFirstVisit =
      (now.getTime() - firstVisitDate.getTime()) / (24 * 60 * 60 * 1000);

    // Check if user returned within specific windows and completed an exercise
    if (daysSinceFirstVisit >= 1) {
      eligibleDay1++;
      const day1Start = new Date(firstVisitDate.getTime() + 24 * 60 * 60 * 1000);
      const day1End = new Date(firstVisitDate.getTime() + 2 * 24 * 60 * 60 * 1000);

      const returned = await collection.countDocuments({
        userId: user._id,
        type: 'exercise_complete',
        timestamp: {
          $gte: day1Start.toISOString(),
          $lte: day1End.toISOString(),
        },
      });

      if (returned > 0) returnedDay1++;
    }

    if (daysSinceFirstVisit >= 7) {
      eligibleDay7++;
      const day7End = new Date(firstVisitDate.getTime() + 7 * 24 * 60 * 60 * 1000);

      const returned = await collection.countDocuments({
        userId: user._id,
        type: 'exercise_complete',
        timestamp: {
          $gte: new Date(firstVisitDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          $lte: day7End.toISOString(),
        },
      });

      if (returned > 0) returnedDay7++;
    }

    if (daysSinceFirstVisit >= 30) {
      eligibleDay30++;
      const day30End = new Date(firstVisitDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      const returned = await collection.countDocuments({
        userId: user._id,
        type: 'exercise_complete',
        timestamp: {
          $gte: new Date(firstVisitDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          $lte: day30End.toISOString(),
        },
      });

      if (returned > 0) returnedDay30++;
    }
  }

  return {
    day1: eligibleDay1 > 0 ? returnedDay1 / eligibleDay1 : 0,
    day7: eligibleDay7 > 0 ? returnedDay7 / eligibleDay7 : 0,
    day30: eligibleDay30 > 0 ? returnedDay30 / eligibleDay30 : 0,
  };
}

/**
 * Calculates average session duration across all sessions within a time range.
 * Returns duration in seconds.
 */
export async function calculateAverageSessionDuration(
  startDate: Date,
  endDate: Date
): Promise<number> {
  const db = await getDatabase();
  const collection = db.collection('analytics_events');

  const sessions = await collection
    .aggregate<{ _id: string; firstEvent: string; lastEvent: string; eventCount: number }>([
      {
        $match: {
          timestamp: {
            $gte: startDate.toISOString(),
            $lte: endDate.toISOString(),
          },
        },
      },
      {
        $group: {
          _id: '$sessionId',
          firstEvent: { $min: '$timestamp' },
          lastEvent: { $max: '$timestamp' },
          eventCount: { $sum: 1 },
        },
      },
      { $match: { eventCount: { $gte: 2 } } },
    ])
    .toArray();

  if (sessions.length === 0) {
    return 0;
  }

  const totalDuration = sessions.reduce(
    (sum, session) => {
      const first = new Date(session.firstEvent).getTime();
      const last = new Date(session.lastEvent).getTime();
      return sum + (last - first);
    },
    0
  );

  return Math.floor(totalDuration / sessions.length / 1000);
}

/**
 * Gets the top pages by unique visitors within a time range.
 */
export async function getTopPages(
  startDate: Date,
  endDate: Date,
  limit: number = 10
): Promise<{ path: string; visitors: number }[]> {
  const db = await getDatabase();
  const collection = db.collection('analytics_events');

  const result = await collection
    .aggregate<{ path: string; visitors: number }>([
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

  return result;
}

/**
 * Gets traffic sources breakdown within a time range.
 */
export async function getTrafficSources(
  startDate: Date,
  endDate: Date
): Promise<{ source: string; percentage: number }[]> {
  const db = await getDatabase();
  const collection = db.collection('analytics_events');

  const result = await collection
    .aggregate<{ _id: string; count: number }>([
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
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  const total = result.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return [];
  }

  return result
    .map((item) => ({
      source: item._id,
      percentage: item.count / total,
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

/**
 * Computes the full dashboard metrics.
 * This aggregates all tracking data into the DashboardMetrics format.
 * Designed to be called at most once per 24 hours (cached).
 */
export async function computeDashboardMetrics(): Promise<DashboardMetrics> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    mau,
    dau,
    bounceRate,
    avgSessionDuration,
    exerciseCompletionRate,
    retentionRates,
    topPages,
    trafficSources,
  ] = await Promise.all([
    getUniqueUsers(thirtyDaysAgo, now),
    getUniqueUsers(oneDayAgo, now),
    calculateBounceRate(),
    calculateAverageSessionDuration(thirtyDaysAgo, now),
    calculateExerciseCompletionRate(thirtyDaysAgo, now),
    calculateRetentionRates(),
    getTopPages(thirtyDaysAgo, now, 10),
    getTrafficSources(thirtyDaysAgo, now),
  ]);

  return {
    mau,
    dau,
    bounceRate,
    avgSessionDuration,
    exerciseCompletionRate,
    retentionRates,
    topPages,
    trafficSources,
  };
}

/**
 * Cached metrics store to ensure updates happen at most every 24 hours.
 */
let cachedMetrics: DashboardMetrics | null = null;
let lastMetricsUpdate: number = 0;

/**
 * Gets dashboard metrics, using a cache to ensure computation happens
 * at most every 24 hours.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const now = Date.now();

  if (cachedMetrics && now - lastMetricsUpdate < METRICS_CACHE_TTL_MS) {
    return cachedMetrics;
  }

  cachedMetrics = await computeDashboardMetrics();
  lastMetricsUpdate = now;

  return cachedMetrics;
}

/**
 * Forces a refresh of dashboard metrics regardless of cache.
 */
export async function refreshDashboardMetrics(): Promise<DashboardMetrics> {
  cachedMetrics = await computeDashboardMetrics();
  lastMetricsUpdate = Date.now();
  return cachedMetrics;
}
