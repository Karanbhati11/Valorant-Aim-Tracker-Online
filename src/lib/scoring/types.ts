/**
 * Scoring system type definitions.
 * Defines input types for score normalization and tier calculation.
 */

import { PlayerTier } from '@/lib/progression/types';

export interface NormalizedScoreInput {
  accuracy: number;
  hitsPerSecond: number;
  reactionTimes: number[];
  weights?: { accuracy: number; speed: number; consistency: number };
}

export type { PlayerTier };
