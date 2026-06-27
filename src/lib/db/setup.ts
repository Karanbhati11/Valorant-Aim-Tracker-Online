import { getDatabase } from "../mongo";

/**
 * Collection name constants for consistent reference across the application.
 */
export const COLLECTIONS = {
  USERS: "users",
  SESSIONS: "sessions",
  LEADERBOARD: "leaderboard",
  MATCHES: "matches",
  ANALYTICS_EVENTS: "analytics_events",
  CHALLENGE_LINKS: "challenge_links",
  MILESTONES: "milestones",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/**
 * Ensures all required MongoDB indexes exist for the application.
 * This function is idempotent — safe to call multiple times.
 * MongoDB's createIndex is a no-op if the index already exists with the same specification.
 */
export async function ensureIndexes(): Promise<void> {
  const db = await getDatabase();

  // --- users ---
  const users = db.collection(COLLECTIONS.USERS);
  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ displayName: 1 }, { unique: true });
  await users.createIndex({ provider: 1, email: 1 });

  // --- sessions ---
  const sessions = db.collection(COLLECTIONS.SESSIONS);
  await sessions.createIndex({ userId: 1, exerciseId: 1, completedAt: -1 });
  await sessions.createIndex({ exerciseId: 1, completedAt: -1 });

  // --- leaderboard ---
  const leaderboard = db.collection(COLLECTIONS.LEADERBOARD);
  await leaderboard.createIndex({ exerciseId: 1, timeframe: 1, score: -1 });
  await leaderboard.createIndex({ userId: 1, exerciseId: 1, timeframe: 1 });

  // --- matches ---
  const matches = db.collection(COLLECTIONS.MATCHES);
  await matches.createIndex({ roomCode: 1 }, { unique: true });
  await matches.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  // --- analytics_events ---
  const analyticsEvents = db.collection(COLLECTIONS.ANALYTICS_EVENTS);
  await analyticsEvents.createIndex({ type: 1, timestamp: -1 });
  await analyticsEvents.createIndex({ sessionId: 1, timestamp: 1 });

  // --- challenge_links ---
  const challengeLinks = db.collection(COLLECTIONS.CHALLENGE_LINKS);
  await challengeLinks.createIndex({ urlCode: 1 }, { unique: true });
  await challengeLinks.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}
