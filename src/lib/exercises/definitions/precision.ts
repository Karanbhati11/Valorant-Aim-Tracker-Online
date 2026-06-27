import type { ExerciseDefinition } from '../types';

/**
 * Precision exercises focus on pixel-perfect accuracy and controlled movements.
 * Players must carefully aim at small or distant targets, prioritizing accuracy
 * over speed.
 */
export const precisionExercises: ExerciseDefinition[] = [
  {
    id: 'precision_pixel_hunt',
    name: 'Pixel Hunt',
    description:
      'Tiny targets appear at random positions. Take your time and land every shot. Trains fine motor control and crosshair placement.',
    category: 'precision',
    difficulty: 4,
    duration: 60,
    mechanics: {
      targetSpawns: 1,
      targetSize: 0.5,
      targetStatic: true,
      respawnDelay: 0.5,
      minDistance: 15,
      maxDistance: 25,
    },
    scoringRules: {
      hitReward: 200,
      misspenalty: 80,
      accuracyWeight: 0.6,
      speedWeight: 0.2,
      consistencyWeight: 0.2,
    },
    stats: ['accuracy', 'hitsPerSecond', 'averageReactionTime', 'missStreak'],
  },
  {
    id: 'precision_dot_drill',
    name: 'Dot Drill',
    description:
      'Small dots appear on a grid. Hit each dot precisely without clicking outside. Accuracy is paramount—missed clicks are heavily penalized.',
    category: 'precision',
    difficulty: 3,
    duration: 45,
    mechanics: {
      targetSpawns: 1,
      targetSize: 0.8,
      targetStatic: true,
      gridBased: true,
      respawnDelay: 0.6,
      minDistance: 10,
      maxDistance: 22,
    },
    scoringRules: {
      hitReward: 150,
      misspenalty: 100,
      accuracyWeight: 0.65,
      speedWeight: 0.2,
      consistencyWeight: 0.15,
    },
    stats: ['accuracy', 'totalHits', 'averageReactionTime', 'perfectStreaks'],
  },
  {
    id: 'precision_micro_correct',
    name: 'Micro Correction',
    description:
      'After each shot, the next target spawns very close to the previous position. Trains micro-adjustments and prevents overshooting.',
    category: 'precision',
    difficulty: 3,
    duration: 45,
    mechanics: {
      targetSpawns: 1,
      targetSize: 1.5,
      targetStatic: true,
      respawnDelay: 0.3,
      minDistance: 2,
      maxDistance: 12,
    },
    scoringRules: {
      hitReward: 120,
      misspenalty: 60,
      accuracyWeight: 0.55,
      speedWeight: 0.25,
      consistencyWeight: 0.2,
    },
    stats: ['accuracy', 'hitsPerSecond', 'averageReactionTime', 'consistency'],
  },
  {
    id: 'precision_shrinking_targets',
    name: 'Shrinking Targets',
    description:
      'Targets start large and shrink over time. Click before they disappear. Earlier clicks on bigger targets score less—wait for maximum precision bonus.',
    category: 'precision',
    difficulty: 5,
    duration: 60,
    mechanics: {
      targetSpawns: 1,
      targetSize: 6.0,
      targetStatic: true,
      shrinking: true,
      respawnDelay: 1.2,
      reflexTime: 3000,
      minDistance: 15,
      maxDistance: 20,
    },
    scoringRules: {
      hitReward: 180,
      misspenalty: 90,
      accuracyWeight: 0.5,
      speedWeight: 0.3,
      consistencyWeight: 0.2,
    },
    stats: ['accuracy', 'averageTargetSize', 'averageReactionTime', 'totalHits'],
  },
];
