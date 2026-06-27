import type { ExerciseDefinition } from '../types';

/**
 * Reaction exercises focus on response time and reflex speed.
 * Players must react to stimulus as quickly as possible, training
 * the initial recognition-to-action pipeline.
 */
export const reactionExercises: ExerciseDefinition[] = [
  {
    id: 'reaction_flash',
    name: 'Flash Reflex',
    description:
      'A single target flashes on screen for a brief moment. Click it before it disappears. Tests pure reaction time with minimal aiming required.',
    category: 'reaction',
    difficulty: 2,
    duration: 30,
    mechanics: {
      targetSpawns: 1,
      targetSize: 6.0,
      targetStatic: true,
      reflexMode: true,
      reflexTime: 800,
      respawnDelay: 1.5,
      minDistance: 7,
      maxDistance: 18,
    },
    scoringRules: {
      hitReward: 100,
      misspenalty: 30,
      speedWeight: 0.6,
      accuracyWeight: 0.2,
      consistencyWeight: 0.2,
    },
    stats: ['averageReactionTime', 'fastestReaction', 'accuracy', 'totalHits'],
  },
  {
    id: 'reaction_pop_shot',
    name: 'Pop Shot',
    description:
      'Targets pop up from behind cover at unpredictable intervals, rising into view like an enemy peeking. React and fire during the brief exposure. Trains hold-angle reaction time.',
    category: 'reaction',
    difficulty: 3,
    duration: 45,
    mechanics: {
      targetSpawns: 1,
      targetSize: 4.0,
      targetStatic: true,
      popUp: true,
      reflexMode: true,
      reflexTime: 700,
      respawnDelay: 2.0,
      minDistance: 10,
      maxDistance: 22,
    },
    scoringRules: {
      hitReward: 150,
      misspenalty: 50,
      speedWeight: 0.55,
      accuracyWeight: 0.3,
      consistencyWeight: 0.15,
    },
    stats: ['averageReactionTime', 'fastestReaction', 'accuracy', 'missedTargets'],
  },
  {
    id: 'reaction_color_trigger',
    name: 'Color Trigger',
    description:
      'Multiple red targets appear spread across the screen. One randomly flashes green for a split second — shoot it before it turns red again. Clicking a red target is penalized. Trains selective reaction and impulse control.',
    category: 'reaction',
    difficulty: 3,
    duration: 45,
    mechanics: {
      targetSpawns: 5,
      targetSize: 3.5,
      targetStatic: true,
      colorTrigger: true,
      multiTarget: true,
      reflexTime: 800,
      respawnDelay: 0,
      minDistance: 12,
      maxDistance: 28,
    },
    scoringRules: {
      hitReward: 150,
      misspenalty: 80,
      speedWeight: 0.5,
      accuracyWeight: 0.35,
      consistencyWeight: 0.15,
    },
    stats: ['averageReactionTime', 'accuracy', 'falseClicks', 'totalHits'],
  },
  {
    id: 'reaction_wall_peek',
    name: 'Wall Peek',
    description:
      'A target slides out from behind a wall, holds its peek angle for a heartbeat, then retreats out of view. Punish the peek before it disappears. Trains angle-holding reflexes.',
    category: 'reaction',
    difficulty: 4,
    duration: 60,
    mechanics: {
      targetSpawns: 1,
      targetSize: 3.0,
      targetStatic: true,
      peek: true,
      reflexTime: 550,
      respawnDelay: 2.0,
      minDistance: 15,
      maxDistance: 23,
    },
    scoringRules: {
      hitReward: 180,
      misspenalty: 60,
      speedWeight: 0.6,
      accuracyWeight: 0.25,
      consistencyWeight: 0.15,
    },
    stats: ['averageReactionTime', 'fastestReaction', 'accuracy', 'hitsPerSecond'],
  },
  {
    id: 'reaction_speed_ladder',
    name: 'Speed Ladder',
    description:
      'Each target you hit makes the next one disappear faster. The display window keeps shrinking until you can no longer keep up — see how far up the ladder you can climb.',
    category: 'reaction',
    difficulty: 5,
    duration: 60,
    mechanics: {
      targetSpawns: 1,
      targetSize: 4.5,
      targetStatic: true,
      ladder: true,
      reflexTime: 1000,
      respawnDelay: 0.8,
      minDistance: 10,
      maxDistance: 21,
    },
    scoringRules: {
      hitReward: 200,
      misspenalty: 70,
      speedWeight: 0.6,
      accuracyWeight: 0.2,
      consistencyWeight: 0.2,
    },
    stats: ['averageReactionTime', 'fastestReaction', 'longestStreak', 'finalLevel'],
  },
];
