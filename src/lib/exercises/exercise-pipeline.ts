/**
 * Exercise Completion Pipeline
 * 
 * Wires the exercise completion flow:
 * 1. Exercise completes → raw results from engine
 * 2. Score engine calculates normalized score (0-1000)
 * 3. Progression system updates skill rating
 * 4. Leaderboard submission (async, non-blocking)
 * 5. Results displayed within 2 seconds
 *
 * Requirements: 1.4, 1.7, 5.2
 */

import { calculateNormalizedScore } from '@/lib/scoring/score-engine';
import { calculateWeightedAverage, compositeSkillRating, getPlayerTier } from '@/lib/progression/skill-rating';
import type { ExerciseResult } from './types';
import type { NormalizedScoreInput } from '@/lib/scoring/types';

/**
 * Raw result data as returned by the vanilla JS exercise engine.
 */
export interface EngineRawResult {
  exerciseId: string;
  score: number;
  rawScore: number;
  accuracy: number;
  hits: number;
  misses: number;
  totalClicks: number;
  hitsPerSecond: number;
  duration: number;
  trackingAccuracy?: number;
  trackingSamples?: boolean[];
  timeToKills?: number[];
}

/**
 * Pipeline output containing normalized score and display data.
 */
export interface PipelineResult {
  exerciseId: string;
  normalizedScore: number;    // 0-1000
  rawScore: number;           // original engine score
  accuracy: number;           // 0.0-1.0
  accuracyPercent: string;    // "85.3%"
  hits: number;
  misses: number;
  totalClicks: number;
  hitsPerSecond: number;
  kps: string;                // formatted KPS string
  hitsDisplay: string;        // "24/30" formatted
  duration: number;
  skillRating?: number;       // 0-5000 (if progression data available)
  tier?: string;              // e.g., "Gold"
  leaderboardRank?: number;   // rank if submitted
  trackingAccuracy?: number;
}

/**
 * Local storage key for session history (used by progression).
 */
const SESSIONS_STORAGE_KEY = 'aim_exercise_sessions';
const MAX_STORED_SESSIONS = 100; // Keep last 100 sessions per exercise

/**
 * Main pipeline function: processes raw engine results into a full PipelineResult.
 * Designed to complete within 2 seconds including score calculation, progression
 * update, and leaderboard submission.
 */
export async function processExerciseCompletion(rawResult: EngineRawResult): Promise<PipelineResult> {
  const startTime = performance.now();

  // Step 1: Calculate normalized score (synchronous, <1ms)
  const reactionTimes = rawResult.timeToKills || [];
  const scoreInput: NormalizedScoreInput = {
    accuracy: rawResult.accuracy,
    hitsPerSecond: rawResult.hitsPerSecond,
    reactionTimes,
  };
  const normalizedScore = calculateNormalizedScore(scoreInput);

  // Step 2: Build the exercise result for storage
  const exerciseResult: ExerciseResult = {
    exerciseId: rawResult.exerciseId,
    score: normalizedScore,
    rawScore: rawResult.score,
    accuracy: rawResult.accuracy,
    hits: rawResult.hits,
    misses: rawResult.misses,
    totalClicks: rawResult.totalClicks,
    hitsPerSecond: rawResult.hitsPerSecond,
    reactionTimes,
    trackingAccuracy: rawResult.trackingAccuracy,
    timeToKills: rawResult.timeToKills,
    completedAt: new Date().toISOString(),
    duration: rawResult.duration,
  };

  // Step 3: Update progression (synchronous, uses localStorage)
  const progressionResult = updateProgression(exerciseResult);

  // Step 4: Submit to leaderboard (async, non-blocking)
  // Don't await - let it run in background so results display immediately
  const leaderboardPromise = submitToLeaderboard(rawResult.exerciseId, rawResult.score, rawResult.accuracy);

  // Step 5: Build pipeline result for display
  const pipelineResult: PipelineResult = {
    exerciseId: rawResult.exerciseId,
    normalizedScore,
    rawScore: rawResult.score,
    accuracy: rawResult.accuracy,
    accuracyPercent: rawResult.totalClicks > 0
      ? ((rawResult.hits / rawResult.totalClicks) * 100).toFixed(1) + '%'
      : '100%',
    hits: rawResult.hits,
    misses: rawResult.misses,
    totalClicks: rawResult.totalClicks,
    hitsPerSecond: rawResult.hitsPerSecond,
    kps: rawResult.hitsPerSecond.toFixed(2),
    hitsDisplay: `${rawResult.hits}/${rawResult.totalClicks}`,
    duration: rawResult.duration,
    skillRating: progressionResult.skillRating,
    tier: progressionResult.tier,
    trackingAccuracy: rawResult.trackingAccuracy,
  };

  // Optionally wait for leaderboard if we're within time budget
  const elapsed = performance.now() - startTime;
  if (elapsed < 1500) {
    try {
      const leaderboardResult = await Promise.race([
        leaderboardPromise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500 - elapsed)),
      ]);
      if (leaderboardResult && typeof leaderboardResult === 'object' && 'rank' in leaderboardResult) {
        pipelineResult.leaderboardRank = (leaderboardResult as any).rank;
      }
    } catch {
      // Leaderboard submission failed, non-critical
    }
  }

  return pipelineResult;
}

/**
 * Updates the local progression data with the new session.
 * Returns updated skill rating and tier.
 */
function updateProgression(result: ExerciseResult): { skillRating: number; tier: string } {
  try {
    // Load existing sessions from localStorage
    const storedSessions = loadSessionHistory();

    // Add new session
    if (!storedSessions[result.exerciseId]) {
      storedSessions[result.exerciseId] = [];
    }
    storedSessions[result.exerciseId].push(result);

    // Keep only last MAX_STORED_SESSIONS per exercise
    if (storedSessions[result.exerciseId].length > MAX_STORED_SESSIONS) {
      storedSessions[result.exerciseId] = storedSessions[result.exerciseId].slice(-MAX_STORED_SESSIONS);
    }

    // Save back
    saveSessionHistory(storedSessions);

    // Calculate skill rating from all exercises
    const exerciseRatings = new Map<string, number>();
    for (const [exerciseId, sessions] of Object.entries(storedSessions)) {
      if (sessions.length > 0) {
        const weightedAvg = calculateWeightedAverage(sessions, 20);
        exerciseRatings.set(exerciseId, weightedAvg);
      }
    }

    const skillRating = compositeSkillRating(exerciseRatings);
    const tier = getPlayerTier(skillRating);

    // Store the current rating for display elsewhere
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aim_skill_rating', String(skillRating));
      localStorage.setItem('aim_skill_tier', tier);
    }

    return { skillRating, tier };
  } catch {
    // Progression update is non-critical
    return { skillRating: 0, tier: 'Iron' };
  }
}

/**
 * Submits score to the leaderboard API.
 * Returns the response or null on failure.
 */
async function submitToLeaderboard(
  exerciseId: string,
  score: number,
  accuracy: number
): Promise<{ ok: boolean; rank?: number } | null> {
  try {
    const playerName = typeof localStorage !== 'undefined'
      ? localStorage.getItem('player_name')
      : null;

    if (!playerName) return null;

    const response = await fetch('/api/leaderboard/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: playerName,
        score: Math.floor(score),
        exerciseId,
        accuracy: accuracy * 100,
      }),
    });

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Loads session history from localStorage.
 */
function loadSessionHistory(): Record<string, ExerciseResult[]> {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Saves session history to localStorage.
 */
function saveSessionHistory(sessions: Record<string, ExerciseResult[]>): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Storage quota exceeded or unavailable - non-critical
  }
}

/**
 * Installs the pipeline onto the window object for use by the vanilla JS exercise engine.
 * 
 * The ExerciseController.finishExercise() in ui.js can call this pipeline
 * to get normalized scores, progression updates, and leaderboard submission.
 */
export function installPipeline(): void {
  if (typeof window === 'undefined') return;

  const win = window as any;

  win.ExercisePipeline = {
    processCompletion: processExerciseCompletion,
    getSkillRating: () => {
      try {
        return {
          rating: parseInt(localStorage.getItem('aim_skill_rating') || '0', 10),
          tier: localStorage.getItem('aim_skill_tier') || 'Iron',
        };
      } catch {
        return { rating: 0, tier: 'Iron' };
      }
    },
    getSessionHistory: loadSessionHistory,
  };
}
