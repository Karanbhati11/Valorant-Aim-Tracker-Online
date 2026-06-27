/**
 * Engine Helpers — Pure functions extracted from ExerciseEngine for testability.
 *
 * These helpers encode the core math for target sizing, spawn placement, movement,
 * and scoring. They accept a `unitSystem` parameter (matching the shape of
 * window.UNIT_SYSTEM) instead of reading globals, so they can be tested in Node
 * without a DOM/WebGL context.
 *
 * The exercise-engine.js renderer calls these same functions at runtime via
 * window.UNIT_SYSTEM, guaranteeing tested logic === rendered logic.
 */

/**
 * Vertical compression factor the engine applies when converting radial spawn
 * distance to a y-coordinate: y = sin(angle) * distance * VERTICAL_COMPRESSION.
 */
const VERTICAL_COMPRESSION = 0.45;

// ─── Clamping Utility ─────────────────────────────────────────────────────────

/**
 * Clamp a numeric value to [min, max].
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

// ─── Target Size ──────────────────────────────────────────────────────────────

/**
 * Resolve the final render size for a target.
 *
 * - Clamps the configured size to the unit-system targetSize range [min, max].
 * - Never collapses to a legacy 2.0 default.
 * - Guarantees the result is at least the minimum hittable radius.
 *
 * @param {number} configuredSize - The per-exercise targetSize value.
 * @param {{ ranges: { targetSize: { min: number, max: number } }, playArea: { minHittableRadius: number } }} unitSystem
 * @returns {number} The resolved target size (radius in world units).
 */
export function resolveTargetSize(configuredSize, unitSystem) {
  const { min, max } = unitSystem.ranges.targetSize;
  const minHittable = unitSystem.playArea.minHittableRadius;

  // Clamp to unit-system range
  let size = clamp(configuredSize, min, max);

  // Ensure at least minimum hittable radius
  if (size < minHittable) {
    size = minHittable;
  }

  return size;
}

// ─── Spawn Position ───────────────────────────────────────────────────────────

/**
 * Maximum reachable spawn distance for a target of the given size.
 * Mirrors the logic in unit-system.ts maxReachableDistance.
 *
 * @param {number} targetSize - Resolved target radius.
 * @param {{ ranges: { spawnDistance: { min: number, max: number } }, playArea: { halfWidth: number, halfHeight: number } }} unitSystem
 * @returns {number}
 */
function maxReachableDistance(targetSize, unitSystem) {
  const { halfWidth, halfHeight } = unitSystem.playArea;
  const radius = targetSize / 2;

  const horizontalLimit = halfWidth - radius;
  const verticalLimit = (halfHeight - radius) / VERTICAL_COMPRESSION;

  const maxDist = Math.min(horizontalLimit, verticalLimit);
  const { min, max } = unitSystem.ranges.spawnDistance;
  return Math.max(min, Math.min(max, maxDist));
}

/**
 * Compute a spawn position for a target using radial placement.
 *
 * Ensures the target center + radius stays within the reachable play area.
 *
 * @param {number} minDist - Configured minimum spawn distance.
 * @param {number} maxDist - Configured maximum spawn distance.
 * @param {number} targetSize - Resolved target size (radius).
 * @param {number} random - A random value in [0, 1) for angle selection.
 * @param {{ ranges: { spawnDistance: { min: number, max: number } }, playArea: { halfWidth: number, halfHeight: number } }} unitSystem
 * @returns {{ x: number, y: number }} Spawn position in world coordinates.
 */
export function computeSpawnPosition(minDist, maxDist, targetSize, random, unitSystem) {
  const { min: rangeMin, max: rangeMax } = unitSystem.ranges.spawnDistance;
  const { halfWidth, halfHeight } = unitSystem.playArea;

  // Clamp distances to unit-system range
  const clampedMin = clamp(minDist, rangeMin, rangeMax);
  let clampedMax = clamp(maxDist, rangeMin, rangeMax);

  // Cap at reachable distance for this target size
  const reachable = maxReachableDistance(targetSize, unitSystem);
  clampedMax = Math.min(clampedMax, reachable);

  // Ensure min <= max
  const effectiveMin = Math.min(clampedMin, clampedMax);
  const effectiveMax = Math.max(clampedMin, clampedMax);

  // Radial placement with random angle
  const angle = random * Math.PI * 2;
  const rad = effectiveMin + random * (effectiveMax - effectiveMin);

  let x = Math.cos(angle) * rad;
  let y = Math.sin(angle) * rad * VERTICAL_COMPRESSION;

  // Final safety clamp: ensure center + radius stays in play area
  const radius = targetSize / 2;
  x = clamp(x, -(halfWidth - radius), halfWidth - radius);
  y = clamp(y, -(halfHeight - radius), halfHeight - radius);

  return { x, y };
}

// ─── Movement / Bounce ────────────────────────────────────────────────────────

/**
 * Step a target's position by one time-step, bouncing at play-area edges.
 *
 * Accounts for target radius so the rendered extent (not just center) stays
 * inside the play area at every frame.
 *
 * @param {{ x: number, y: number }} position - Current target center.
 * @param {{ vx: number, vy: number }} velocity - Current velocity.
 * @param {number} targetRadius - The target's rendered radius.
 * @param {number} deltaTime - Time step (seconds). For simplicity, velocity is
 *   treated as position-units-per-step (matching the engine's frame-based movement).
 * @param {{ playArea: { halfWidth: number, halfHeight: number }, ranges: { pathSpeed: { min: number, max: number } } }} unitSystem
 * @returns {{ position: { x: number, y: number }, velocity: { vx: number, vy: number } }}
 */
export function stepMovement(position, velocity, targetRadius, deltaTime, unitSystem) {
  const { halfWidth, halfHeight } = unitSystem.playArea;

  // Effective bounds accounting for radius
  const boundX = halfWidth - targetRadius;
  const boundY = halfHeight - targetRadius;

  let { x, y } = position;
  let { vx, vy } = velocity;

  // Apply velocity (scaled by deltaTime)
  x += vx * deltaTime;
  y += vy * deltaTime;

  // Bounce at edges (accounting for radius)
  if (x > boundX) {
    x = boundX;
    vx = -Math.abs(vx);
  } else if (x < -boundX) {
    x = -boundX;
    vx = Math.abs(vx);
  }

  if (y > boundY) {
    y = boundY;
    vy = -Math.abs(vy);
  } else if (y < -boundY) {
    y = -boundY;
    vy = Math.abs(vy);
  }

  return {
    position: { x, y },
    velocity: { vx, vy },
  };
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

/**
 * Apply a hit: score increases by exactly hitReward.
 *
 * @param {number} currentScore - Current score (>= 0).
 * @param {number} hitReward - Points to add (>= 0).
 * @returns {number} New score.
 */
export function applyHit(currentScore, hitReward) {
  return currentScore + hitReward;
}

/**
 * Apply a miss: score decreases by penalty but never below zero.
 *
 * @param {number} currentScore - Current score (>= 0).
 * @param {number} missPenalty - Penalty to subtract (>= 0).
 * @returns {number} New score (>= 0).
 */
export function applyMiss(currentScore, missPenalty) {
  return Math.max(0, currentScore - missPenalty);
}

/**
 * Compute the final exercise result from hit/miss counts and score.
 *
 * - accuracy = hits / (hits + misses), in [0, 1].
 * - accuracy = 0 when both hits and misses are zero.
 *
 * @param {number} hits - Total hits (>= 0).
 * @param {number} misses - Total misses (>= 0).
 * @param {number} score - Final score (>= 0).
 * @returns {{ score: number, hits: number, misses: number, accuracy: number }}
 */
export function computeResult(hits, misses, score) {
  const total = hits + misses;
  const accuracy = total === 0 ? 0 : hits / total;

  return {
    score,
    hits,
    misses,
    accuracy,
  };
}

// ─── Headshot Scoring ─────────────────────────────────────────────────────────

/**
 * Compute the reward for a headshot-mode hit.
 *
 * The critical multiplier is applied only when the hit point lies inside
 * the critical zone (center radius * criticalZoneRatio). Otherwise the
 * base hitReward is returned.
 *
 * @param {{ x: number, y: number, z: number }} hitPoint - World-space hit location.
 * @param {{ x: number, y: number, z: number }} targetCenter - Target center position.
 * @param {number} targetRadius - Full target radius.
 * @param {number} criticalZoneRatio - Ratio of target radius that forms the critical zone (0–1).
 * @param {number} hitReward - Base hit reward.
 * @param {number} criticalMultiplier - Multiplier for critical-zone hits.
 * @returns {number} The awarded points.
 */
export function headshotReward(hitPoint, targetCenter, targetRadius, criticalZoneRatio, hitReward, criticalMultiplier) {
  const dx = hitPoint.x - targetCenter.x;
  const dy = hitPoint.y - targetCenter.y;
  const dz = (hitPoint.z || 0) - (targetCenter.z || 0);
  const distFromCenter = Math.sqrt(dx * dx + dy * dy + dz * dz);

  const criticalRadius = targetRadius * criticalZoneRatio;

  if (distFromCenter <= criticalRadius) {
    return hitReward * criticalMultiplier;
  }
  return hitReward;
}

// ─── Sequential Elimination ───────────────────────────────────────────────────

/**
 * Determine whether a target interaction counts as a hit in sequential mode.
 *
 * A hit is registered if and only if the player interacts with the target
 * whose order index matches the expected next index.
 *
 * @param {number} targetIndex - The order index of the target the player hit.
 * @param {number} expectedIndex - The next expected sequential index.
 * @returns {boolean} True if it's a hit, false if it's a miss.
 */
export function sequentialOutcome(targetIndex, expectedIndex) {
  return targetIndex === expectedIndex;
}

// ─── Tracking Accuracy ────────────────────────────────────────────────────────

/**
 * Compute tracking accuracy from a sample array.
 *
 * Each sample is a boolean indicating whether the cursor was on-target
 * during that sample interval. The result is the ratio of on-target
 * samples to total samples, in [0, 1]. Returns 0 for an empty array.
 *
 * @param {boolean[]} samples - Array of on-target boolean samples.
 * @returns {number} Tracking accuracy in [0, 1].
 */
export function trackingAccuracy(samples) {
  if (!samples || samples.length === 0) {
    return 0;
  }
  const onTarget = samples.filter(Boolean).length;
  return onTarget / samples.length;
}
