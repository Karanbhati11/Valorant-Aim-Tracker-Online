/**
 * Engine Helpers — TypeScript re-export of the pure engine helper functions.
 *
 * This module imports the pure JS helpers from public/assets/js/exercises/engine-helpers.js
 * so they can be used in Vitest property tests without a DOM/WebGL context.
 *
 * The actual runtime engine (exercise-engine.js) calls the same functions from the
 * JS module directly, ensuring tested logic === rendered logic.
 */

// Re-export all helpers from the JS module for use in tests
export {
  resolveTargetSize,
  computeSpawnPosition,
  stepMovement,
  applyHit,
  applyMiss,
  computeResult,
  headshotReward,
  sequentialOutcome,
  trackingAccuracy,
} from '../../../public/assets/js/exercises/engine-helpers.js';

/**
 * Type for the unit system parameter accepted by all engine helpers.
 * Matches the shape of window.UNIT_SYSTEM / UNIT_SYSTEM_DATA from unit-system.ts.
 */
export interface EngineUnitSystem {
  units: {
    spawnDistance: string;
    targetSize: string;
    pathSpeed: string;
  };
  ranges: {
    spawnDistance: { min: number; max: number };
    targetSize: { min: number; max: number };
    pathSpeed: { min: number; max: number };
  };
  playArea: {
    halfWidth: number;
    halfHeight: number;
    depth: number;
    minHittableRadius: number;
  };
}

/**
 * Type for a 3D point used by headshotReward.
 */
export interface Point3D {
  x: number;
  y: number;
  z?: number;
}

/**
 * Type for a 2D position.
 */
export interface Position2D {
  x: number;
  y: number;
}

/**
 * Type for a 2D velocity.
 */
export interface Velocity2D {
  vx: number;
  vy: number;
}

/**
 * Result from computeResult.
 */
export interface ExerciseResultData {
  score: number;
  hits: number;
  misses: number;
  accuracy: number;
}

/**
 * Result from stepMovement.
 */
export interface MovementResult {
  position: Position2D;
  velocity: Velocity2D;
}
