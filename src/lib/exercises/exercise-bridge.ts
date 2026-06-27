/**
 * Exercise Bridge Module
 * 
 * Bridges the TypeScript exercise registry with the vanilla JS exercise engine.
 * Converts ExerciseDefinition objects to the format expected by exercise-definitions.js
 * and exposes them as a structured EXERCISES object grouped by category.
 *
 * Requirements: 1.4, 1.6, 1.7, 5.2
 */

import type { ExerciseCategory, ExerciseDefinition } from './types';
import { getAllExercises, getExercisesByCategory, getExerciseById } from './registry';
import { UNIT_SYSTEM_DATA } from './unit-system';

/**
 * Category metadata mapping for display in the UI.
 */
const CATEGORY_META: Record<ExerciseCategory, { label: string; icon: string }> = {
  flicking: { label: 'Flicking', icon: '🎯' },
  tracking: { label: 'Tracking', icon: '🔄' },
  speed: { label: 'Speed', icon: '⚡' },
  precision: { label: 'Precision', icon: '🔬' },
  reaction: { label: 'Reaction', icon: '⏱️' },
};

/**
 * All valid exercise categories.
 */
export const ALL_CATEGORIES: ExerciseCategory[] = [
  'flicking',
  'tracking',
  'speed',
  'precision',
  'reaction',
];

/**
 * Vanilla JS exercise format expected by exercise-engine.js and ui.js.
 */
export interface VanillaExercise {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  duration: number;
  mechanics: {
    targetSpawns: number;
    targetSize: number;
    targetStatic: boolean;
    gridBased?: boolean;
    reflexMode?: boolean;
    reflexTime?: number;
    pathSpeed?: number;
    pathPattern?: string;
    minDistance?: number;
    maxDistance?: number;
    respawnDelay: number;
    trackingMode?: boolean;
    trackingSampleRate?: number;
    headshotMode?: boolean;
    criticalZoneRatio?: number;
    multiTarget?: boolean;
    sequentialElimination?: boolean;
    colorTrigger?: boolean;
    shrinking?: boolean;
    popUp?: boolean;
    peek?: boolean;
    multiStimulus?: boolean;
    ladder?: boolean;
  };
  scoringRules: {
    hitReward: number;
    misspenalty: number;
    criticalMultiplier?: number;
  };
  stats: string[];
}

/**
 * Vanilla JS category format expected by the UI layer.
 */
export interface VanillaCategory {
  category: string;
  icon: string;
  exercises: VanillaExercise[];
}

/**
 * The full EXERCISES object structure used by the vanilla JS UI.
 */
export type VanillaExercisesMap = Record<string, VanillaCategory>;

/**
 * Converts a TypeScript ExerciseDefinition to the vanilla JS format.
 */
export function toVanillaExercise(def: ExerciseDefinition): VanillaExercise {
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    difficulty: def.difficulty,
    duration: def.duration,
    mechanics: {
      targetSpawns: def.mechanics.targetSpawns,
      targetSize: def.mechanics.targetSize,
      targetStatic: def.mechanics.targetStatic,
      gridBased: def.mechanics.gridBased,
      reflexMode: def.mechanics.reflexMode,
      reflexTime: def.mechanics.reflexTime,
      pathSpeed: def.mechanics.pathSpeed,
      pathPattern: def.mechanics.pathPattern,
      minDistance: def.mechanics.minDistance,
      maxDistance: def.mechanics.maxDistance,
      respawnDelay: def.mechanics.respawnDelay,
      trackingMode: def.mechanics.trackingMode,
      trackingSampleRate: def.mechanics.trackingSampleRate,
      headshotMode: def.mechanics.headshotMode,
      criticalZoneRatio: def.mechanics.criticalZoneRatio,
      multiTarget: def.mechanics.multiTarget,
      sequentialElimination: def.mechanics.sequentialElimination,
      colorTrigger: def.mechanics.colorTrigger,
      shrinking: def.mechanics.shrinking,
      popUp: def.mechanics.popUp,
      peek: def.mechanics.peek,
      multiStimulus: def.mechanics.multiStimulus,
      ladder: def.mechanics.ladder,
    },
    scoringRules: {
      hitReward: def.scoringRules.hitReward,
      misspenalty: def.scoringRules.misspenalty,
      criticalMultiplier: def.scoringRules.criticalMultiplier,
    },
    stats: def.stats,
  };
}

/**
 * Builds the full EXERCISES map grouped by category in the format expected by the UI.
 * Category keys are uppercase versions of the category name (e.g., 'FLICKING', 'TRACKING').
 */
export function buildExercisesMap(): VanillaExercisesMap {
  const map: VanillaExercisesMap = {};

  for (const category of ALL_CATEGORIES) {
    const exercises = getExercisesByCategory(category);
    const meta = CATEGORY_META[category];
    const key = category.toUpperCase().replace('-', '_');

    map[key] = {
      category: meta.label,
      icon: meta.icon,
      exercises: exercises.map(toVanillaExercise),
    };
  }

  return map;
}

/**
 * Gets a vanilla exercise by ID, searching all categories.
 * This replaces the global getExerciseById used by exercise-engine.js.
 */
export function getVanillaExerciseById(id: string): VanillaExercise | null {
  const def = getExerciseById(id);
  if (!def) return null;
  return toVanillaExercise(def);
}

/**
 * Gets all exercises in vanilla format for a given category.
 * Returns an empty array if no exercises exist in the category.
 */
export function getVanillaExercisesByCategory(category: ExerciseCategory): VanillaExercise[] {
  const exercises = getExercisesByCategory(category);
  return exercises.map(toVanillaExercise);
}

/**
 * Installs the bridge onto the window object, making TypeScript exercises
 * available to the vanilla JS engine. This should be called after the page loads.
 * 
 * It sets:
 * - window.EXERCISES: The full category map (replaces the one from exercise-definitions.js)
 * - window.getExerciseById: Function to look up any exercise by ID
 * - window.UNIT_SYSTEM: Plain-data mirror of the unit system constants for the engine
 * - window.ExerciseBridge: Reference to bridge utilities
 */
export function installBridge(): void {
  if (typeof window === 'undefined') return;

  const exercisesMap = buildExercisesMap();
  const win = window as any;

  // Override the global EXERCISES object with the expanded registry
  win.EXERCISES = exercisesMap;

  // Override getExerciseById to search the new registry
  win.getExerciseById = getVanillaExerciseById;

  // Expose the unit system data so the engine reads authoritative constants
  // instead of hardcoded magic numbers (Req 2.4, 2.5)
  win.UNIT_SYSTEM = UNIT_SYSTEM_DATA;

  // Expose bridge utilities for the pipeline
  win.ExerciseBridge = {
    getAllCategories: () => ALL_CATEGORIES,
    getCategoryMeta: (cat: ExerciseCategory) => CATEGORY_META[cat],
    getExercisesByCategory: getVanillaExercisesByCategory,
    getExerciseById: getVanillaExerciseById,
    buildExercisesMap,
  };
}
