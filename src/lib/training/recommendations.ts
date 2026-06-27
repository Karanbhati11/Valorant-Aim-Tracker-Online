/**
 * Weakness-based exercise recommendations.
 * Analyzes a player's historical scores across exercises, identifies their
 * weakest areas (bottom 25th percentile of their own scores), and recommends
 * exercises to improve those areas.
 *
 * Requirement 14.4: Recommend at least 3 exercises where the player's average
 * score over their last 20 sessions ranks in the bottom 25th percentile of
 * their own exercise scores.
 */

import { ExerciseResult, ExerciseDefinition } from '@/lib/exercises/types';
import { getAllExercises, getExercisesByCategory } from '@/lib/exercises/registry';
import { calculateWeightedAverage } from '@/lib/progression/skill-rating';

/**
 * Minimum number of exercises to recommend.
 */
const MIN_RECOMMENDATIONS = 3;

/**
 * Maximum number of sessions to consider per exercise for the weighted average.
 */
const MAX_SESSIONS = 20;

/**
 * Percentile threshold for identifying weak exercises (bottom 25%).
 */
const WEAKNESS_PERCENTILE = 0.25;

/**
 * Minimum number of sessions required for an exercise to be
 * included in percentile analysis. Exercises with fewer sessions
 * are treated as untested and may be recommended separately.
 */
const MIN_SESSIONS_FOR_ANALYSIS = 1;

/**
 * Represents an exercise with its computed average score for recommendation purposes.
 */
export interface ExerciseScore {
  exerciseId: string;
  averageScore: number;
  sessionCount: number;
}

/**
 * Represents a recommended exercise with context about why it's recommended.
 */
export interface ExerciseRecommendation {
  exercise: ExerciseDefinition;
  averageScore: number;
  sessionCount: number;
  reason: 'weak_area' | 'untested';
}

/**
 * Groups exercise results by exercise ID.
 *
 * @param sessions - All exercise results for a player
 * @returns A map of exercise ID to array of results for that exercise
 */
export function groupSessionsByExercise(
  sessions: ExerciseResult[]
): Map<string, ExerciseResult[]> {
  const grouped = new Map<string, ExerciseResult[]>();

  for (const session of sessions) {
    const existing = grouped.get(session.exerciseId);
    if (existing) {
      existing.push(session);
    } else {
      grouped.set(session.exerciseId, [session]);
    }
  }

  return grouped;
}

/**
 * Calculates the average score for each exercise using recency-weighted averaging
 * over the last 20 sessions.
 *
 * @param sessionsByExercise - Map of exercise ID to array of results (oldest to newest)
 * @returns Array of exercise scores sorted by average score ascending (weakest first)
 */
export function calculateExerciseScores(
  sessionsByExercise: Map<string, ExerciseResult[]>
): ExerciseScore[] {
  const scores: ExerciseScore[] = [];

  for (const [exerciseId, sessions] of sessionsByExercise) {
    if (sessions.length < MIN_SESSIONS_FOR_ANALYSIS) {
      continue;
    }

    // Sort sessions by completedAt date (oldest first) for proper recency weighting
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );

    const averageScore = calculateWeightedAverage(sortedSessions, MAX_SESSIONS);

    scores.push({
      exerciseId,
      averageScore,
      sessionCount: sessions.length,
    });
  }

  // Sort by average score ascending (weakest first)
  scores.sort((a, b) => a.averageScore - b.averageScore);

  return scores;
}

/**
 * Identifies exercises in the bottom 25th percentile of the player's own scores.
 *
 * The 25th percentile threshold is calculated as the score at position
 * floor(count * 0.25) when scores are sorted ascending.
 *
 * @param exerciseScores - Array of exercise scores sorted ascending
 * @returns Array of exercise scores that fall at or below the 25th percentile
 */
export function identifyWeakExercises(
  exerciseScores: ExerciseScore[]
): ExerciseScore[] {
  if (exerciseScores.length === 0) {
    return [];
  }

  // Calculate how many exercises fall in the bottom 25th percentile
  const weakCount = Math.max(1, Math.floor(exerciseScores.length * WEAKNESS_PERCENTILE));

  // Return the weakest exercises (already sorted ascending)
  return exerciseScores.slice(0, weakCount);
}

/**
 * Gets exercises that the player has not attempted but exist in the registry.
 *
 * @param sessionsByExercise - Map of exercise IDs the player has attempted
 * @returns Array of exercise definitions the player hasn't tried
 */
export function getUntestedExercises(
  sessionsByExercise: Map<string, ExerciseResult[]>
): ExerciseDefinition[] {
  const allExercises = getAllExercises();
  return allExercises.filter((ex) => !sessionsByExercise.has(ex.id));
}

/**
 * Generates weakness-based exercise recommendations for a player.
 *
 * The algorithm:
 * 1. Groups sessions by exercise and calculates recency-weighted averages
 * 2. Identifies exercises in the bottom 25th percentile of the player's own scores
 * 3. Supplements with untested exercises if fewer than 3 weak exercises are found
 * 4. Returns at least 3 recommendations (or all available if fewer than 3 exist)
 *
 * @param playerSessions - All exercise results for the player (across all exercises)
 * @returns Array of at least 3 exercise recommendations (weak areas + untested)
 */
export function getRecommendations(
  playerSessions: ExerciseResult[]
): ExerciseRecommendation[] {
  const sessionsByExercise = groupSessionsByExercise(playerSessions);
  const exerciseScores = calculateExerciseScores(sessionsByExercise);
  const weakExercises = identifyWeakExercises(exerciseScores);
  const allExercises = getAllExercises();

  const recommendations: ExerciseRecommendation[] = [];

  // Add weak exercises as recommendations
  for (const weak of weakExercises) {
    const exercise = allExercises.find((ex) => ex.id === weak.exerciseId);
    if (exercise) {
      recommendations.push({
        exercise,
        averageScore: weak.averageScore,
        sessionCount: weak.sessionCount,
        reason: 'weak_area',
      });
    }
  }

  // If we don't have enough recommendations, supplement with untested exercises
  if (recommendations.length < MIN_RECOMMENDATIONS) {
    const untestedExercises = getUntestedExercises(sessionsByExercise);

    for (const exercise of untestedExercises) {
      if (recommendations.length >= MIN_RECOMMENDATIONS) {
        break;
      }
      recommendations.push({
        exercise,
        averageScore: 0,
        sessionCount: 0,
        reason: 'untested',
      });
    }
  }

  // If we still don't have enough (edge case: player has tried everything but few exercises),
  // just ensure we return what we have
  return recommendations;
}

/**
 * Generates recommendations focused on a specific exercise category.
 * Useful for players who want to focus on improving a specific skill.
 *
 * @param playerSessions - All exercise results for the player
 * @param category - The exercise category to focus on
 * @returns Array of recommendations filtered to the specified category
 */
export function getRecommendationsByCategory(
  playerSessions: ExerciseResult[],
  category: string
): ExerciseRecommendation[] {
  const allRecommendations = getRecommendations(playerSessions);
  const categoryRecommendations = allRecommendations.filter(
    (rec) => rec.exercise.category === category
  );

  // If no recommendations in the requested category, fall back to
  // exercises from that category sorted by difficulty
  if (categoryRecommendations.length === 0) {
    const categoryExercises = getExercisesByCategory(category as any);
    return categoryExercises.slice(0, MIN_RECOMMENDATIONS).map((exercise) => ({
      exercise,
      averageScore: 0,
      sessionCount: 0,
      reason: 'untested' as const,
    }));
  }

  return categoryRecommendations;
}
