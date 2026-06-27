/**
 * Unit System — Single source of truth for exercise mechanics units and ranges.
 *
 * All distances and sizes are expressed in world units.
 * Speed is expressed in world units per second.
 *
 * Consumed by: definitions, validator, bridge, and (via window.UNIT_SYSTEM) the engine.
 */

/** Inclusive numeric range. */
export interface UnitRange {
  min: number;
  max: number;
}

/**
 * The canonical unit system constant.
 * Defines documented units, valid inclusive ranges, and the reachable play area.
 */
export const UNIT_SYSTEM = {
  /** Documented measurement units for each mechanics field. */
  units: {
    spawnDistance: 'world-units',
    targetSize: 'world-units',
    pathSpeed: 'world-units-per-second',
  },
  /** Valid inclusive ranges for each mechanics field (Req 2.2). */
  ranges: {
    spawnDistance: { min: 0, max: 35 } as UnitRange,
    targetSize: { min: 0.25, max: 10 } as UnitRange,
    pathSpeed: { min: 0, max: 50 } as UnitRange,
  },
  /** Reachable play area bounds the engine must respect (Req 3). */
  playArea: {
    halfWidth: 35,
    halfHeight: 12,
    depth: -45,
    minHittableRadius: 0.25,
  },
} as const;

/** The mechanics fields governed by the unit system. */
export type MechanicsField = 'spawnDistance' | 'targetSize' | 'pathSpeed';

/**
 * Vertical compression factor used by the engine when converting
 * radial spawn distance to y-coordinate: y = sin(angle) * distance * VERTICAL_COMPRESSION.
 */
const VERTICAL_COMPRESSION = 0.45;

/**
 * Clamp a value to the nearest valid bound for a mechanics field (Req 2.7).
 *
 * - Values below the minimum are clamped to the minimum.
 * - Values above the maximum are clamped to the maximum.
 * - Values within the range are returned unchanged.
 */
export function clampToRange(field: MechanicsField, value: number): number {
  const range = UNIT_SYSTEM.ranges[field];
  if (value < range.min) return range.min;
  if (value > range.max) return range.max;
  return value;
}

/**
 * Returns true if and only if the value is within the inclusive range for the field (Req 7.1).
 */
export function isWithinRange(field: MechanicsField, value: number): boolean {
  const range = UNIT_SYSTEM.ranges[field];
  return value >= range.min && value <= range.max;
}

/**
 * Maximum spawn distance at which a target of the given size still fits
 * entirely inside the reachable play area (Req 3.1, 3.6).
 *
 * The engine spawns targets radially with a vertical compression factor of 0.45:
 *   x = cos(angle) * distance
 *   y = sin(angle) * distance * 0.45
 *
 * For the target (center + radius) to stay inside the play area at any angle:
 *   Horizontal constraint: distance + radius <= halfWidth   → distance <= halfWidth - radius
 *   Vertical constraint:   distance * 0.45 + radius <= halfHeight → distance <= (halfHeight - radius) / 0.45
 *
 * The result is clamped to the valid spawn distance range [0, 35].
 */
export function maxReachableDistance(targetSize: number): number {
  const { halfWidth, halfHeight } = UNIT_SYSTEM.playArea;
  const radius = targetSize / 2;

  const horizontalLimit = halfWidth - radius;
  const verticalLimit = (halfHeight - radius) / VERTICAL_COMPRESSION;

  const maxDistance = Math.min(horizontalLimit, verticalLimit);

  // Clamp to the spawn distance range
  return Math.max(
    UNIT_SYSTEM.ranges.spawnDistance.min,
    Math.min(UNIT_SYSTEM.ranges.spawnDistance.max, maxDistance),
  );
}

/**
 * Plain-data mirror of UNIT_SYSTEM suitable for serialization onto window.UNIT_SYSTEM.
 * Contains only the data (no functions) so it can be safely JSON-serialized by the bridge.
 */
export const UNIT_SYSTEM_DATA = {
  units: { ...UNIT_SYSTEM.units },
  ranges: {
    spawnDistance: { min: UNIT_SYSTEM.ranges.spawnDistance.min, max: UNIT_SYSTEM.ranges.spawnDistance.max },
    targetSize: { min: UNIT_SYSTEM.ranges.targetSize.min, max: UNIT_SYSTEM.ranges.targetSize.max },
    pathSpeed: { min: UNIT_SYSTEM.ranges.pathSpeed.min, max: UNIT_SYSTEM.ranges.pathSpeed.max },
  },
  playArea: {
    halfWidth: UNIT_SYSTEM.playArea.halfWidth,
    halfHeight: UNIT_SYSTEM.playArea.halfHeight,
    depth: UNIT_SYSTEM.playArea.depth,
    minHittableRadius: UNIT_SYSTEM.playArea.minHittableRadius,
  },
};
