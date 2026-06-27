/**
 * Exercise registry module.
 * Provides centralized access to all exercise definitions with
 * lookup by ID and filtering by category.
 */

import type { ExerciseCategory, ExerciseDefinition } from './types';
import { trackingExercises } from './definitions/tracking';
import { flickingExercises } from './definitions/flicking';
import { speedExercises } from './definitions/speed';
import { precisionExercises } from './definitions/precision';
import { reactionExercises } from './definitions/reaction';

/**
 * All registered exercises across all categories.
 */
const allExercises: ExerciseDefinition[] = [
  ...flickingExercises,
  ...trackingExercises,
  ...speedExercises,
  ...precisionExercises,
  ...reactionExercises,
];

/**
 * Returns all registered exercises.
 */
export function getAllExercises(): ExerciseDefinition[] {
  return allExercises;
}

/**
 * Returns exercises filtered by category.
 */
export function getExercisesByCategory(category: ExerciseCategory): ExerciseDefinition[] {
  return allExercises.filter((ex) => ex.category === category);
}

/**
 * Returns a single exercise by ID, or undefined if not found.
 */
export function getExerciseById(id: string): ExerciseDefinition | undefined {
  return allExercises.find((ex) => ex.id === id);
}
