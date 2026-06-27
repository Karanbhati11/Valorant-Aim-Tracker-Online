/**
 * Score calculation engine.
 * Pure functions for calculating normalized scores, tracking accuracy,
 * standard deviation, and score validation.
 */

import { NormalizedScoreInput } from './types';

/**
 * Maximum achievable score per exercise: hitReward × maximum possible hits in duration.
 */
export const MAX_SCORE_PER_EXERCISE: Record<string, number> = {
  static_grid: 100 * 400,
  micro_adjust: 150 * 300,
  pop_up_reflex: 200 * 86,
  strafe_track: 50 * 200,
  dynamic_flicks: 120 * 240,
};

/**
 * Default weights for normalized score calculation.
 */
const DEFAULT_WEIGHTS = {
  accuracy: 0.5,
  speed: 0.3,
  consistency: 0.2,
};

/**
 * Calculates a normalized score from 0–1000 based on weighted combination of
 * accuracy (50%), speed (30%), and consistency (20%).
 *
 * - Accuracy component: accuracy ratio (0–1) scaled to 0–1000
 * - Speed component: hitsPerSecond capped at a reasonable max (10 HPS = perfect)
 * - Consistency component: lower std dev of reaction times = higher score
 */
export function calculateNormalizedScore(input: NormalizedScoreInput): number {
  const weights = input.weights ?? DEFAULT_WEIGHTS;

  // Clamp accuracy to [0, 1]
  const accuracyScore = Math.min(Math.max(input.accuracy, 0), 1);

  // Speed: normalize hitsPerSecond. Cap at 10 HPS for max score.
  const maxHPS = 10;
  const speedScore = Math.min(Math.max(input.hitsPerSecond, 0), maxHPS) / maxHPS;

  // Consistency: based on standard deviation of reaction times.
  // Lower std dev = more consistent = higher score.
  // Use inverse mapping: 0ms std dev = 1.0, 500ms+ std dev = 0.0
  let consistencyScore: number;
  if (input.reactionTimes.length < 2) {
    // With fewer than 2 reaction times, consistency is neutral (0.5)
    consistencyScore = 0.5;
  } else {
    const stdDev = calculateStandardDeviation(input.reactionTimes);
    const maxStdDev = 500; // 500ms std dev maps to 0 consistency
    consistencyScore = Math.max(0, 1 - stdDev / maxStdDev);
  }

  // Weighted sum, scaled to 0–1000
  const rawScore =
    accuracyScore * weights.accuracy +
    speedScore * weights.speed +
    consistencyScore * weights.consistency;

  // Round to nearest integer, clamp to [0, 1000]
  return Math.min(1000, Math.max(0, Math.round(rawScore * 1000)));
}

/**
 * Calculates tracking accuracy as the ratio of "in hitbox" samples to total samples.
 *
 * @param samples - Array of booleans where true means cursor was in the target hitbox
 * @param sampleRateHz - The sampling rate in Hz (must be > 0)
 * @returns A value between 0.0 and 1.0 representing tracking accuracy
 */
export function calculateTrackingAccuracy(
  samples: boolean[],
  sampleRateHz: number
): number {
  if (samples.length === 0 || sampleRateHz <= 0) {
    return 0;
  }

  const hitCount = samples.filter((s) => s).length;
  return hitCount / samples.length;
}

/**
 * Calculates the standard deviation of a set of numeric values (reaction times).
 * Uses population standard deviation (N denominator).
 *
 * @param values - Array of numeric values (e.g., reaction times in ms)
 * @returns The standard deviation. Returns 0 for empty or single-element arrays.
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * Validates a score submission for a given exercise.
 *
 * @param score - The score to validate
 * @param exerciseId - The exercise ID to check max score against
 * @returns An object indicating validity and optional error message
 */
export function validateScore(
  score: number,
  exerciseId: string
): { valid: boolean; error?: string } {
  // Must be a non-negative integer
  if (!Number.isInteger(score) || score < 0) {
    return { valid: false, error: 'Score must be a non-negative integer' };
  }

  // Check against max achievable score for the exercise
  const maxScore = MAX_SCORE_PER_EXERCISE[exerciseId];
  if (maxScore !== undefined && score > maxScore) {
    return {
      valid: false,
      error: `Score ${score} exceeds maximum achievable score of ${maxScore} for exercise ${exerciseId}`,
    };
  }

  return { valid: true };
}
