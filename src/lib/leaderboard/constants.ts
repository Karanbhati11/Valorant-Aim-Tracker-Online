/**
 * Leaderboard constants and validation utilities.
 * Defines maximum scores per exercise, valid timeframes, and validation helpers.
 */

/**
 * Maximum achievable score per exercise.
 * Calculated as hitReward × maximum_possible_hits_in_duration.
 */
export const MAX_SCORE_PER_EXERCISE: Record<string, number> = {
  // Core exercises (from exercise-definitions.js)
  static_grid: 100 * 400,     // 100 reward × ~400 hits possible in 60s
  micro_adjust: 150 * 300,    // 150 reward × ~300 hits possible in 60s
  pop_up_reflex: 200 * 86,    // 200 reward × 60s/0.7s respawn ≈ 86
  strafe_track: 50 * 200,     // 50 reward × ~200 hits possible in 60s
  dynamic_flicks: 120 * 240,  // 120 reward × ~240 hits possible in 60s
};

/**
 * Valid leaderboard timeframe values.
 */
export const VALID_TIMEFRAMES = ['daily', 'weekly', 'all-time'] as const;
export type LeaderboardTimeframe = typeof VALID_TIMEFRAMES[number];

/**
 * Valid exercise IDs for leaderboard.
 */
export const VALID_EXERCISE_IDS = [
  'static_grid',
  'micro_adjust',
  'pop_up_reflex',
  'strafe_track',
  'dynamic_flicks',
] as const;

/**
 * Maximum number of leaderboard entries to return.
 */
export const LEADERBOARD_LIMIT = 20;

/**
 * Player name constraints.
 */
export const PLAYER_NAME_MIN_LENGTH = 1;
export const PLAYER_NAME_MAX_LENGTH = 64;

/**
 * Returns the start of the current UTC day (00:00 UTC).
 */
export function getDailyResetDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Returns the start of the current UTC week (Monday 00:00 UTC).
 */
export function getWeeklyResetDate(): Date {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday, ...
  // Calculate days since last Monday
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - daysSinceMonday,
    0, 0, 0, 0
  ));
  return monday;
}

/**
 * Get the time filter for a given timeframe.
 * Returns a Date representing the earliest allowed createdAt,
 * or null for all-time (no filter).
 */
export function getTimeframeFilter(timeframe: LeaderboardTimeframe): Date | null {
  switch (timeframe) {
    case 'daily':
      return getDailyResetDate();
    case 'weekly':
      return getWeeklyResetDate();
    case 'all-time':
      return null;
  }
}

/**
 * Validates a player name is between 1 and 64 characters.
 */
export function validatePlayerName(name: unknown): { valid: boolean; error?: string; sanitized?: string } {
  if (name === null || name === undefined || name === '') {
    return { valid: false, error: 'Player name is required and must be between 1 and 64 characters' };
  }

  const nameStr = String(name).trim();

  if (nameStr.length < PLAYER_NAME_MIN_LENGTH) {
    return { valid: false, error: 'Player name must be at least 1 character' };
  }

  if (nameStr.length > PLAYER_NAME_MAX_LENGTH) {
    return { valid: false, error: 'Player name must not exceed 64 characters' };
  }

  return { valid: true, sanitized: nameStr };
}

/**
 * Validates a score for a given exercise.
 * Score must be a non-negative integer not exceeding the maximum achievable score.
 */
export function validateScore(score: unknown, exerciseId: string): { valid: boolean; error?: string; value?: number } {
  const scoreNum = Number(score);

  if (!Number.isFinite(scoreNum)) {
    return { valid: false, error: 'Score must be a valid number' };
  }

  if (!Number.isInteger(scoreNum)) {
    return { valid: false, error: 'Score must be an integer' };
  }

  if (scoreNum < 0) {
    return { valid: false, error: 'Score must be non-negative' };
  }

  const maxScore = MAX_SCORE_PER_EXERCISE[exerciseId];
  if (maxScore !== undefined && scoreNum > maxScore) {
    return { valid: false, error: `Score exceeds maximum achievable score (${maxScore}) for exercise '${exerciseId}'` };
  }

  return { valid: true, value: scoreNum };
}

/**
 * Validates an exercise ID is recognized.
 */
export function validateExerciseId(exerciseId: unknown): { valid: boolean; error?: string; value?: string } {
  if (!exerciseId || typeof exerciseId !== 'string') {
    return { valid: false, error: 'Exercise ID is required' };
  }

  // Allow any exercise ID (supports both core and new exercises)
  // Only validate max score for known exercises
  return { valid: true, value: exerciseId };
}
