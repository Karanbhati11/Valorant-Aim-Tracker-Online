/**
 * Training plan system.
 * Provides pre-built plans for beginner, intermediate, and advanced levels,
 * playlist creation logic, completion tracking, and skip/abandon handling.
 *
 * Requirements: 14.1, 14.2, 14.3, 14.6
 */

import { getExerciseById } from '@/lib/exercises/registry';

// ─── Types ──────────────────────────────────────────────────────────────────

export type PlanLevel = 'beginner' | 'intermediate' | 'advanced';

export type ExerciseStatus = 'pending' | 'completed' | 'skipped' | 'active';

export interface PlanExerciseEntry {
  exerciseId: string;
  /** Duration override in seconds (15–180). Falls back to exercise default. */
  durationOverride?: number;
  status: ExerciseStatus;
  /** Score achieved if completed */
  score?: number;
}

export interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  level: PlanLevel;
  exercises: PlanExerciseEntry[];
}

export interface PlaylistSession {
  planId: string;
  exercises: PlanExerciseEntry[];
  currentIndex: number;
  startedAt: string;
}

export interface CompletionStats {
  /** Percentage of completed exercises out of non-skipped exercises (0–100) */
  completionPercentage: number;
  /** Estimated remaining time in seconds based on pending exercise durations */
  estimatedRemainingSeconds: number;
  /** Total exercises in the plan */
  totalExercises: number;
  /** Number of completed exercises */
  completedCount: number;
  /** Number of skipped exercises */
  skippedCount: number;
  /** Number of pending exercises (including active) */
  pendingCount: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const MIN_PLAYLIST_SIZE = 2;
const MAX_PLAYLIST_SIZE = 20;
const MIN_DURATION = 15;
const MAX_DURATION = 180;

// ─── Pre-built Training Plans ───────────────────────────────────────────────

/**
 * Beginner plan: Introduces fundamental aim skills with easier exercises.
 * 7 exercises covering basics of each category.
 */
const beginnerPlan: TrainingPlan = {
  id: 'plan_beginner_fundamentals',
  name: 'Beginner Fundamentals',
  description:
    'Build your aim foundation with easy-to-moderate exercises covering flicking, tracking, speed, precision, and reaction basics.',
  level: 'beginner',
  exercises: [
    { exerciseId: 'reaction_flash', status: 'pending' },
    { exerciseId: 'speed_blitz', status: 'pending' },
    { exerciseId: 'flick_micro', status: 'pending' },
    { exerciseId: 'tracking_linear_strafe', status: 'pending' },
    { exerciseId: 'precision_steady_hand', status: 'pending' },
    { exerciseId: 'speed_switch', status: 'pending' },
    { exerciseId: 'flick_multi_target_easy', status: 'pending' },
  ],
};

/**
 * Intermediate plan: Builds on fundamentals with moderate-difficulty exercises.
 * 10 exercises with varied mechanics across all categories.
 */
const intermediatePlan: TrainingPlan = {
  id: 'plan_intermediate_progression',
  name: 'Intermediate Progression',
  description:
    'Step up your training with mid-difficulty exercises including sinusoidal tracking, medium flicks, precision drills, and game-specific scenarios.',
  level: 'intermediate',
  exercises: [
    { exerciseId: 'reaction_pop_shot', status: 'pending' },
    { exerciseId: 'tracking_sinusoidal', status: 'pending' },
    { exerciseId: 'flick_medium', status: 'pending' },
    { exerciseId: 'speed_frenzy', status: 'pending' },
    { exerciseId: 'precision_dot_drill', status: 'pending' },
    { exerciseId: 'reaction_color_trigger', status: 'pending' },
    { exerciseId: 'tracking_random_direction', status: 'pending' },
    { exerciseId: 'speed_gridshot', status: 'pending' },
  ],
};

/**
 * Advanced plan: Challenges experienced players with the hardest exercises.
 * 12 exercises focusing on high-difficulty mechanics and game-specific scenarios.
 */
const advancedPlan: TrainingPlan = {
  id: 'plan_advanced_mastery',
  name: 'Advanced Mastery',
  description:
    'Push your limits with the most demanding exercises: acceleration tracking, headshot flicks, spray transfers, and speed bursts.',
  level: 'advanced',
  exercises: [
    { exerciseId: 'reaction_wall_peek', status: 'pending' },
    { exerciseId: 'tracking_acceleration', status: 'pending' },
    { exerciseId: 'flick_wide', status: 'pending' },
    { exerciseId: 'flick_headshot', status: 'pending' },
    { exerciseId: 'precision_pixel_hunt', status: 'pending' },
    { exerciseId: 'speed_burst', status: 'pending' },
    { exerciseId: 'flick_multi_target_hard', status: 'pending' },
    { exerciseId: 'reaction_speed_ladder', status: 'pending' },
  ],
};

/** All pre-built training plans indexed by level. */
const PRE_BUILT_PLANS: Record<PlanLevel, TrainingPlan> = {
  beginner: beginnerPlan,
  intermediate: intermediatePlan,
  advanced: advancedPlan,
};

// ─── Plan Access ────────────────────────────────────────────────────────────

/**
 * Returns all pre-built training plans.
 */
export function getPreBuiltPlans(): TrainingPlan[] {
  return Object.values(PRE_BUILT_PLANS);
}

/**
 * Returns a pre-built plan by level.
 */
export function getPlanByLevel(level: PlanLevel): TrainingPlan {
  return PRE_BUILT_PLANS[level];
}

/**
 * Returns a pre-built plan by ID.
 */
export function getPlanById(id: string): TrainingPlan | undefined {
  return Object.values(PRE_BUILT_PLANS).find((plan) => plan.id === id);
}

// ─── Playlist Creation ──────────────────────────────────────────────────────

/**
 * Creates a custom playlist from a list of exercise IDs.
 * Validates that:
 * - Between 2 and 20 exercises are provided
 * - All exercise IDs reference valid exercises in the registry
 *
 * @param exerciseIds - Array of exercise IDs (2–20 items)
 * @param name - Custom name for the playlist
 * @param description - Optional description
 * @returns The created TrainingPlan or an error message
 */
export function createPlaylist(
  exerciseIds: string[],
  name: string,
  description: string = ''
): { success: true; plan: TrainingPlan } | { success: false; error: string } {
  if (exerciseIds.length < MIN_PLAYLIST_SIZE) {
    return {
      success: false,
      error: `Playlist must contain at least ${MIN_PLAYLIST_SIZE} exercises.`,
    };
  }

  if (exerciseIds.length > MAX_PLAYLIST_SIZE) {
    return {
      success: false,
      error: `Playlist cannot contain more than ${MAX_PLAYLIST_SIZE} exercises.`,
    };
  }

  // Validate all exercise IDs exist
  const invalidIds: string[] = [];
  for (const id of exerciseIds) {
    if (!getExerciseById(id)) {
      invalidIds.push(id);
    }
  }

  if (invalidIds.length > 0) {
    return {
      success: false,
      error: `Invalid exercise IDs: ${invalidIds.join(', ')}`,
    };
  }

  const plan: TrainingPlan = {
    id: `playlist_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    description,
    level: 'intermediate', // Custom playlists default to intermediate
    exercises: exerciseIds.map((exerciseId) => ({
      exerciseId,
      status: 'pending' as ExerciseStatus,
    })),
  };

  return { success: true, plan };
}

// ─── Playlist Session Management ────────────────────────────────────────────

/**
 * Starts a new playlist session from a training plan.
 * Resets all exercise statuses to 'pending' and sets the first exercise as 'active'.
 */
export function startSession(plan: TrainingPlan): PlaylistSession {
  const exercises: PlanExerciseEntry[] = plan.exercises.map((ex) => ({
    ...ex,
    status: 'pending' as ExerciseStatus,
    score: undefined,
  }));

  // Mark first exercise as active
  if (exercises.length > 0) {
    exercises[0].status = 'active';
  }

  return {
    planId: plan.id,
    exercises,
    currentIndex: 0,
    startedAt: new Date().toISOString(),
  };
}

/**
 * Marks the current exercise as completed with a score and advances to the next.
 * Returns the updated session, or null if no active exercise exists.
 */
export function completeExercise(
  session: PlaylistSession,
  score: number
): PlaylistSession | null {
  if (session.currentIndex >= session.exercises.length) {
    return null;
  }

  const updated = { ...session, exercises: [...session.exercises] };
  updated.exercises[session.currentIndex] = {
    ...updated.exercises[session.currentIndex],
    status: 'completed',
    score,
  };

  // Advance to next exercise
  const nextIndex = session.currentIndex + 1;
  updated.currentIndex = nextIndex;

  if (nextIndex < updated.exercises.length) {
    updated.exercises[nextIndex] = {
      ...updated.exercises[nextIndex],
      status: 'active',
    };
  }

  return updated;
}

/**
 * Skips or abandons the current exercise.
 * Marks it as incomplete (skipped), excludes from completion percentage,
 * and advances to the next exercise.
 *
 * Requirement 14.6: Mark incomplete, exclude from percentage, advance to next.
 */
export function skipExercise(session: PlaylistSession): PlaylistSession | null {
  if (session.currentIndex >= session.exercises.length) {
    return null;
  }

  const updated = { ...session, exercises: [...session.exercises] };
  updated.exercises[session.currentIndex] = {
    ...updated.exercises[session.currentIndex],
    status: 'skipped',
  };

  // Advance to next exercise
  const nextIndex = session.currentIndex + 1;
  updated.currentIndex = nextIndex;

  if (nextIndex < updated.exercises.length) {
    updated.exercises[nextIndex] = {
      ...updated.exercises[nextIndex],
      status: 'active',
    };
  }

  return updated;
}

/**
 * Returns whether the session is complete (all exercises handled).
 */
export function isSessionComplete(session: PlaylistSession): boolean {
  return session.currentIndex >= session.exercises.length;
}

// ─── Completion Tracking ────────────────────────────────────────────────────

/**
 * Calculates completion percentage and estimated remaining time for a session.
 *
 * Completion percentage is calculated as:
 *   (completed exercises) / (total exercises - skipped exercises) * 100
 *
 * Skipped exercises are excluded from both numerator and denominator per Req 14.6.
 * Estimated remaining time is the sum of durations for pending/active exercises.
 *
 * @param session - The current playlist session
 * @returns Completion stats including percentage and time remaining
 */
export function getCompletionStats(session: PlaylistSession): CompletionStats {
  let completedCount = 0;
  let skippedCount = 0;
  let pendingCount = 0;
  let estimatedRemainingSeconds = 0;

  for (const entry of session.exercises) {
    switch (entry.status) {
      case 'completed':
        completedCount++;
        break;
      case 'skipped':
        skippedCount++;
        break;
      case 'pending':
      case 'active':
        pendingCount++;
        // Use duration override if set, otherwise look up exercise default
        const duration = getExerciseDuration(entry);
        estimatedRemainingSeconds += duration;
        break;
    }
  }

  const eligibleExercises = session.exercises.length - skippedCount;
  const completionPercentage =
    eligibleExercises > 0 ? Math.round((completedCount / eligibleExercises) * 100) : 0;

  return {
    completionPercentage,
    estimatedRemainingSeconds,
    totalExercises: session.exercises.length,
    completedCount,
    skippedCount,
    pendingCount,
  };
}

// ─── Duration Configuration ─────────────────────────────────────────────────

/**
 * Validates a duration value is within the allowed range (15–180 seconds).
 */
export function isValidDuration(duration: number): boolean {
  return (
    Number.isInteger(duration) && duration >= MIN_DURATION && duration <= MAX_DURATION
  );
}

/**
 * Sets a duration override for a specific exercise in a session.
 * Duration must be between 15 and 180 seconds (integer).
 *
 * @returns Updated session or null if validation fails
 */
export function setExerciseDuration(
  session: PlaylistSession,
  exerciseIndex: number,
  duration: number
): PlaylistSession | null {
  if (!isValidDuration(duration)) {
    return null;
  }

  if (exerciseIndex < 0 || exerciseIndex >= session.exercises.length) {
    return null;
  }

  const updated = { ...session, exercises: [...session.exercises] };
  updated.exercises[exerciseIndex] = {
    ...updated.exercises[exerciseIndex],
    durationOverride: duration,
  };

  return updated;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Gets the effective duration for a plan exercise entry.
 * Uses durationOverride if set, otherwise falls back to the exercise definition's duration.
 */
function getExerciseDuration(entry: PlanExerciseEntry): number {
  if (entry.durationOverride !== undefined) {
    return entry.durationOverride;
  }

  const exercise = getExerciseById(entry.exerciseId);
  return exercise?.duration ?? 60; // Default to 60s if exercise not found
}
