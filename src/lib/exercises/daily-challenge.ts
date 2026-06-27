/**
 * Daily challenge rotation system.
 *
 * Provides a deterministic exercise selection based on the current UTC date.
 * All players see the same challenge on a given calendar day (UTC).
 * The challenge rotates at 00:00 UTC each day.
 */

import { getAllExercises } from './registry';
import type { ExerciseDefinition } from './types';

/**
 * Simple deterministic hash function for a date string.
 * Produces a consistent numeric value for a given input string.
 */
function hashDateString(dateString: string): number {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = (hash * 31 + char) | 0; // Keep as 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Returns the UTC date string in YYYY-MM-DD format for a given Date object.
 */
export function getUTCDateString(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the exercise ID for the daily challenge on a given UTC date.
 * The selection is deterministic — the same date always produces the same exercise.
 *
 * @param date - The date to get the daily challenge for. Defaults to the current date.
 * @returns The exercise ID selected for the given day.
 */
export function getDailyChallengeExerciseId(date: Date = new Date()): string {
  const exercises = getAllExercises();
  if (exercises.length === 0) {
    throw new Error('No exercises available in the registry');
  }

  const dateString = getUTCDateString(date);
  const hash = hashDateString(dateString);
  const index = hash % exercises.length;

  return exercises[index].id;
}

/**
 * Returns the full exercise definition for today's daily challenge.
 *
 * @param date - The date to get the daily challenge for. Defaults to the current date.
 * @returns The ExerciseDefinition for the daily challenge.
 */
export function getDailyChallenge(date: Date = new Date()): ExerciseDefinition {
  const exercises = getAllExercises();
  if (exercises.length === 0) {
    throw new Error('No exercises available in the registry');
  }

  const dateString = getUTCDateString(date);
  const hash = hashDateString(dateString);
  const index = hash % exercises.length;

  return exercises[index];
}

/**
 * Returns the number of milliseconds until the next daily challenge rotation (00:00 UTC).
 */
export function getMillisecondsUntilNextChallenge(): number {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return tomorrow.getTime() - now.getTime();
}
