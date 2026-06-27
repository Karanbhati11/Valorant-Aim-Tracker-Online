/**
 * Exercise Validator — Validates exercise definitions against the Unit System.
 *
 * Checks every definition's spawnDistance, targetSize, and pathSpeed against
 * unit-system ranges, and flags unreachable spawn distances.
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { type MechanicsField, UNIT_SYSTEM, isWithinRange, maxReachableDistance } from './unit-system';
import type { ExerciseDefinition } from './types';

export interface ValidationFailure {
  exerciseId: string;
  field: MechanicsField;
  value: number;
  reason: 'out-of-range' | 'unreachable';
}

export interface ValidationReport {
  ok: boolean;
  failures: ValidationFailure[];
}

/**
 * Validate every definition against the Unit_System and reachability.
 *
 * - Checks minDistance, maxDistance against spawnDistance range (Req 7.1)
 * - Checks targetSize against targetSize range (Req 7.1, 7.3)
 * - Checks pathSpeed against pathSpeed range (Req 7.1)
 * - Flags maxDistance > maxReachableDistance(targetSize) as unreachable (Req 7.2)
 * - Aggregates all failures across all definitions (Req 7.4)
 * - Returns ok: true with empty failures when no violations found (Req 7.5)
 */
export function validateRegistry(registry: ExerciseDefinition[]): ValidationReport {
  const failures: ValidationFailure[] = [];

  for (const definition of registry) {
    const { mechanics } = definition;

    // Check minDistance against spawnDistance range
    if (mechanics.minDistance !== undefined) {
      if (!isWithinRange('spawnDistance', mechanics.minDistance)) {
        failures.push({
          exerciseId: definition.id,
          field: 'spawnDistance',
          value: mechanics.minDistance,
          reason: 'out-of-range',
        });
      }
    }

    // Check maxDistance against spawnDistance range
    if (mechanics.maxDistance !== undefined) {
      if (!isWithinRange('spawnDistance', mechanics.maxDistance)) {
        failures.push({
          exerciseId: definition.id,
          field: 'spawnDistance',
          value: mechanics.maxDistance,
          reason: 'out-of-range',
        });
      }
    }

    // Check targetSize against targetSize range
    if (!isWithinRange('targetSize', mechanics.targetSize)) {
      failures.push({
        exerciseId: definition.id,
        field: 'targetSize',
        value: mechanics.targetSize,
        reason: 'out-of-range',
      });
    }

    // Check pathSpeed against pathSpeed range
    if (mechanics.pathSpeed !== undefined) {
      if (!isWithinRange('pathSpeed', mechanics.pathSpeed)) {
        failures.push({
          exerciseId: definition.id,
          field: 'pathSpeed',
          value: mechanics.pathSpeed,
          reason: 'out-of-range',
        });
      }
    }

    // Check reachability: maxDistance must not exceed maxReachableDistance(targetSize)
    // Only check if maxDistance is defined and within the spawnDistance range
    // (out-of-range is already reported above)
    if (mechanics.maxDistance !== undefined) {
      const reachableLimit = maxReachableDistance(mechanics.targetSize);
      if (mechanics.maxDistance > reachableLimit) {
        failures.push({
          exerciseId: definition.id,
          field: 'spawnDistance',
          value: mechanics.maxDistance,
          reason: 'unreachable',
        });
      }
    }
  }

  return {
    ok: failures.length === 0,
    failures,
  };
}
