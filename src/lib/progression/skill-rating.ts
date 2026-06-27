/**
 * Skill rating and progression system.
 * Pure functions for calculating recency-weighted skill ratings,
 * composite ratings across exercises, and tier assignments.
 */

import { ExerciseResult } from '@/lib/exercises/types';
import { PlayerTier, TIER_THRESHOLDS } from './types';

/**
 * Default exponential decay factor for recency weighting.
 * A value of 0.85 means each older session carries 85% of the
 * weight of the next more recent session.
 */
const DEFAULT_DECAY = 0.85;

/**
 * Default maximum number of sessions to consider for the weighted average.
 */
const DEFAULT_MAX_SESSIONS = 20;

/**
 * Maximum possible normalized score per session (from ExerciseResult.score).
 */
const MAX_SESSION_SCORE = 1000;

/**
 * Calculates a recency-weighted average of session scores using exponential decay.
 *
 * The most recent session gets the highest weight. Weight for session at index i
 * (where 0 = oldest) is: decay^(n - i - 1), where n = number of sessions considered.
 *
 * Uses the last `maxSessions` sessions, or all available if fewer than `maxSessions`.
 *
 * @param sessions - Array of exercise results ordered from oldest to newest
 * @param maxSessions - Maximum number of recent sessions to consider (default: 20)
 * @param decay - Exponential decay factor (default: 0.85)
 * @returns A weighted average score in the range [0, 1000]
 */
export function calculateWeightedAverage(
  sessions: ExerciseResult[],
  maxSessions: number = DEFAULT_MAX_SESSIONS,
  decay: number = DEFAULT_DECAY
): number {
  if (sessions.length === 0) {
    return 0;
  }

  // Take the last maxSessions sessions (or all if fewer)
  const recentSessions = sessions.slice(-maxSessions);
  const n = recentSessions.length;

  let weightedSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < n; i++) {
    // i = 0 is oldest, i = n-1 is most recent
    // weight_i = decay^(n - i - 1)
    // Most recent (i = n-1): decay^0 = 1
    // Oldest (i = 0): decay^(n-1)
    const weight = Math.pow(decay, n - i - 1);
    weightedSum += recentSessions[i].score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  return weightedSum / totalWeight;
}

/**
 * Calculates a composite skill rating across all exercises.
 *
 * Takes a map of exercise IDs to their individual weighted average ratings (0–1000),
 * computes a weighted average across all exercises, and scales to the 0–5000 range.
 *
 * All exercises are weighted equally in the composite calculation.
 *
 * @param exerciseRatings - Map of exercise ID to weighted average score (0–1000)
 * @returns A composite skill rating in the range [0, 5000]
 */
export function compositeSkillRating(
  exerciseRatings: Map<string, number>
): number {
  if (exerciseRatings.size === 0) {
    return 0;
  }

  let totalRating = 0;
  let count = 0;

  for (const rating of exerciseRatings.values()) {
    // Clamp each rating to [0, 1000]
    totalRating += Math.min(MAX_SESSION_SCORE, Math.max(0, rating));
    count++;
  }

  // Average across exercises, then scale from 0–1000 to 0–5000
  const averageRating = totalRating / count;
  const scaledRating = (averageRating / MAX_SESSION_SCORE) * 5000;

  // Clamp to [0, 5000] and round to nearest integer
  return Math.min(5000, Math.max(0, Math.round(scaledRating)));
}

/**
 * Maps a skill rating to a player tier based on TIER_THRESHOLDS.
 *
 * @param rating - A skill rating from 0 to 5000
 * @returns The player's tier (Iron through Radiant)
 */
export function getPlayerTier(rating: number): PlayerTier {
  // Clamp rating to valid range
  const clampedRating = Math.min(5000, Math.max(0, Math.round(rating)));

  for (const [tier, [min, max]] of Object.entries(TIER_THRESHOLDS) as [PlayerTier, [number, number]][]) {
    if (clampedRating >= min && clampedRating <= max) {
      return tier;
    }
  }

  // Fallback (shouldn't happen with valid thresholds covering 0–5000)
  return 'Iron';
}
