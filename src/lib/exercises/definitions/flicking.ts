/**
 * Flicking exercise definitions.
 * Covers micro-flick, medium-flick, wide-flick distance presets,
 * headshot-only mode, and multi-target sequential elimination mode.
 */

import type { ExerciseDefinition } from '../types';

export const flickingExercises: ExerciseDefinition[] = [
  // --- Distance Preset Exercises ---
  {
    id: 'flick_micro',
    name: 'Micro Flick',
    description:
      'Train precise small-angle flicks between 5° and 15°. Targets spawn close to your crosshair, demanding pixel-perfect adjustments typical of holding tight angles.',
    category: 'flicking',
    difficulty: 2,
    duration: 60,
    mechanics: {
      targetSpawns: 1,
      targetSize: 3.5,
      targetStatic: true,
      minDistance: 1,
      maxDistance: 3,
      reflexMode: true,
      reflexTime: 5000,
      respawnDelay: 0.3,
    },
    scoringRules: {
      hitReward: 120,
      misspenalty: 30,
      accuracyWeight: 0.5,
      speedWeight: 0.3,
      consistencyWeight: 0.2,
    },
    stats: ['accuracy', 'avgTimeToKill', 'hitsPerSecond', 'reactionTime'],
  },
  {
    id: 'flick_medium',
    name: 'Medium Flick',
    description:
      'Practice standard-distance flicks between 16° and 90°. Simulates common FPS engagements where enemies appear at moderate angles from your crosshair.',
    category: 'flicking',
    difficulty: 3,
    duration: 60,
    mechanics: {
      targetSpawns: 1,
      targetSize: 4.0,
      targetStatic: true,
      minDistance: 3,
      maxDistance: 14,
      reflexMode: true,
      reflexTime: 5000,
      respawnDelay: 0.4,
    },
    scoringRules: {
      hitReward: 150,
      misspenalty: 35,
      accuracyWeight: 0.5,
      speedWeight: 0.3,
      consistencyWeight: 0.2,
    },
    stats: ['accuracy', 'avgTimeToKill', 'hitsPerSecond', 'reactionTime'],
  },
  {
    id: 'flick_wide',
    name: 'Wide Flick',
    description:
      'Master extreme-angle flicks between 91° and 180°. Targets appear behind or to the side, training the fast 180° snaps needed when caught off-guard.',
    category: 'flicking',
    difficulty: 4,
    duration: 60,
    mechanics: {
      targetSpawns: 1,
      targetSize: 4.5,
      targetStatic: true,
      minDistance: 14,
      maxDistance: 21,
      reflexMode: true,
      reflexTime: 5000,
      respawnDelay: 0.5,
    },
    scoringRules: {
      hitReward: 200,
      misspenalty: 40,
      accuracyWeight: 0.5,
      speedWeight: 0.3,
      consistencyWeight: 0.2,
    },
    stats: ['accuracy', 'avgTimeToKill', 'hitsPerSecond', 'reactionTime'],
  },

  // --- Multi-Target Sequential Elimination ---
  {
    id: 'flick_multi_target',
    name: 'Sequential Elimination',
    description:
      'Multiple targets spawn simultaneously with numeric labels. Eliminate them in order — hitting out of sequence counts as a miss. Trains target prioritization and flick sequencing.',
    category: 'flicking',
    difficulty: 4,
    duration: 60,
    mechanics: {
      targetSpawns: 4,
      targetSize: 4.0,
      targetStatic: true,
      minDistance: 3,
      maxDistance: 18,
      reflexMode: true,
      reflexTime: 5000,
      multiTarget: true,
      sequentialElimination: true,
      respawnDelay: 0.8,
    },
    scoringRules: {
      hitReward: 180,
      misspenalty: 45,
      accuracyWeight: 0.5,
      speedWeight: 0.3,
      consistencyWeight: 0.2,
    },
    stats: ['accuracy', 'avgTimeToKill', 'sequenceAccuracy', 'hitsPerSecond', 'reactionTime'],
  },
  {
    id: 'flick_multi_target_easy',
    name: 'Sequential Elimination (Easy)',
    description:
      'A beginner-friendly version with only 2 targets per wave. Learn to read numeric labels and eliminate in order before scaling up.',
    category: 'flicking',
    difficulty: 2,
    duration: 60,
    mechanics: {
      targetSpawns: 2,
      targetSize: 5.0,
      targetStatic: true,
      minDistance: 2,
      maxDistance: 9,
      reflexMode: true,
      reflexTime: 5000,
      multiTarget: true,
      sequentialElimination: true,
      respawnDelay: 1.0,
    },
    scoringRules: {
      hitReward: 140,
      misspenalty: 30,
      accuracyWeight: 0.5,
      speedWeight: 0.3,
      consistencyWeight: 0.2,
    },
    stats: ['accuracy', 'avgTimeToKill', 'sequenceAccuracy', 'hitsPerSecond', 'reactionTime'],
  },
  {
    id: 'flick_multi_target_hard',
    name: 'Sequential Elimination (Hard)',
    description:
      'The ultimate test — 6 targets spawn at wide angles with small hitboxes. Rapid sequenced flicks under time pressure separate the good from the great.',
    category: 'flicking',
    difficulty: 5,
    duration: 60,
    mechanics: {
      targetSpawns: 6,
      targetSize: 3.0,
      targetStatic: true,
      minDistance: 5,
      maxDistance: 22,
      reflexMode: true,
      reflexTime: 5000,
      multiTarget: true,
      sequentialElimination: true,
      respawnDelay: 0.6,
    },
    scoringRules: {
      hitReward: 220,
      misspenalty: 55,
      accuracyWeight: 0.5,
      speedWeight: 0.3,
      consistencyWeight: 0.2,
    },
    stats: ['accuracy', 'avgTimeToKill', 'sequenceAccuracy', 'hitsPerSecond', 'reactionTime'],
  },
];
