/**
 * Tracking exercise definitions.
 * Covers linear strafing, sinusoidal movement, random direction changes,
 * and acceleration/deceleration movement patterns.
 *
 * All tracking exercises use:
 * - trackingMode: true
 * - trackingSampleRate: 30 Hz (minimum)
 * - duration: 60 seconds
 */

import { ExerciseDefinition } from '../types';

export const trackingExercises: ExerciseDefinition[] = [
  {
    id: 'tracking_linear_strafe',
    name: 'Linear Strafing',
    description:
      'Track a target moving at constant velocity in a straight line. Builds fundamental tracking muscle memory for predictable lateral movement common in FPS strafing engagements.',
    category: 'tracking',
    difficulty: 2,
    duration: 60,
    mechanics: {
      targetSpawns: 1,
      targetSize: 4.5,
      targetStatic: false,
      pathSpeed: 28,
      pathPattern: 'linear',
      respawnDelay: 0,
      trackingMode: true,
      trackingSampleRate: 30,
    },
    scoringRules: {
      hitReward: 50,
      misspenalty: 0,
      accuracyWeight: 0.6,
      speedWeight: 0.1,
      consistencyWeight: 0.3,
    },
    stats: ['trackingAccuracy', 'averageDeviation', 'longestStreak', 'score'],
  },
  {
    id: 'tracking_sinusoidal',
    name: 'Sinusoidal Movement',
    description:
      'Track a target following a smooth sinusoidal curve. Trains your ability to predict and follow non-linear movement paths that mimic crouch-strafe and wave-like patterns.',
    category: 'tracking',
    difficulty: 3,
    duration: 60,
    mechanics: {
      targetSpawns: 1,
      targetSize: 4.0,
      targetStatic: false,
      pathSpeed: 22,
      pathPattern: 'sinusoidal',
      respawnDelay: 0,
      trackingMode: true,
      trackingSampleRate: 30,
    },
    scoringRules: {
      hitReward: 60,
      misspenalty: 0,
      accuracyWeight: 0.6,
      speedWeight: 0.1,
      consistencyWeight: 0.3,
    },
    stats: ['trackingAccuracy', 'averageDeviation', 'longestStreak', 'score'],
  },
  {
    id: 'tracking_random_direction',
    name: 'Random Direction Changes',
    description:
      'Track a target that changes direction unpredictably at intervals between 500ms and 2000ms. Develops reactive tracking ability for opponents with erratic movement.',
    category: 'tracking',
    difficulty: 4,
    duration: 60,
    mechanics: {
      targetSpawns: 1,
      targetSize: 4.0,
      targetStatic: false,
      pathSpeed: 25,
      pathPattern: 'random',
      minDistance: 8,
      maxDistance: 20,
      respawnDelay: 0,
      trackingMode: true,
      trackingSampleRate: 30,
    },
    scoringRules: {
      hitReward: 70,
      misspenalty: 0,
      accuracyWeight: 0.5,
      speedWeight: 0.2,
      consistencyWeight: 0.3,
    },
    stats: ['trackingAccuracy', 'averageDeviation', 'reactionTime', 'longestStreak', 'score'],
  },
  {
    id: 'tracking_acceleration',
    name: 'Acceleration & Deceleration',
    description:
      'Track a target that varies its speed between 25% and 100% of base movement speed. Trains your ability to adjust tracking speed dynamically as targets speed up and slow down.',
    category: 'tracking',
    difficulty: 5,
    duration: 60,
    mechanics: {
      targetSpawns: 1,
      targetSize: 3.0,
      targetStatic: false,
      pathSpeed: 35,
      pathPattern: 'acceleration',
      respawnDelay: 0,
      trackingMode: true,
      trackingSampleRate: 30,
    },
    scoringRules: {
      hitReward: 80,
      misspenalty: 0,
      accuracyWeight: 0.5,
      speedWeight: 0.2,
      consistencyWeight: 0.3,
    },
    stats: ['trackingAccuracy', 'averageDeviation', 'speedAdaptation', 'longestStreak', 'score'],
  },
];
