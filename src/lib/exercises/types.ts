/**
 * Exercise system type definitions.
 * Defines the core interfaces for exercise mechanics, scoring, and results.
 */

export interface ExerciseMechanics {
  targetSpawns: number;
  targetSize: number;
  targetStatic: boolean;
  gridBased?: boolean;
  reflexMode?: boolean;
  reflexTime?: number;
  pathSpeed?: number;
  pathPattern?: 'linear' | 'sinusoidal' | 'random' | 'acceleration';
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
}

export interface ScoringRules {
  hitReward: number;
  misspenalty: number;
  criticalMultiplier?: number;
  accuracyWeight?: number;
  speedWeight?: number;
  consistencyWeight?: number;
}

export type DifficultyRating = 1 | 2 | 3 | 4 | 5;

export type ExerciseCategory =
  | 'flicking'
  | 'tracking'
  | 'speed'
  | 'precision'
  | 'reaction';

export interface ExerciseDefinition {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  difficulty: DifficultyRating;
  duration: number;
  mechanics: ExerciseMechanics;
  scoringRules: ScoringRules;
  stats: string[];
  focusGames?: string[];
}

export interface ExerciseResult {
  exerciseId: string;
  score: number;
  rawScore: number;
  accuracy: number;
  hits: number;
  misses: number;
  totalClicks: number;
  hitsPerSecond: number;
  reactionTimes: number[];
  trackingAccuracy?: number;
  timeToKills?: number[];
  completedAt: string;
  duration: number;
}
