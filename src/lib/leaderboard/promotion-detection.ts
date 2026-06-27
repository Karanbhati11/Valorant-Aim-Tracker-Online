/**
 * Leaderboard promotion detection utilities.
 *
 * Detects when a player:
 * - Enters the top 10 from outside
 * - Moves up a tier within the top 10 (positions 10–4 to positions 3–1)
 *
 * Requirements: 12.4
 */

export type LeaderboardTier = 'top3' | 'top10' | 'outside';

export interface PromotionEvent {
  /** Player display name */
  playerName: string;
  /** Exercise ID */
  exerciseId: string;
  /** Exercise display name */
  exerciseName: string;
  /** New leaderboard position (1-based) */
  newPosition: number;
  /** Previous leaderboard position (1-based), or null if outside top 100 */
  previousPosition: number | null;
  /** New tier the player is in */
  newTier: LeaderboardTier;
  /** Previous tier the player was in */
  previousTier: LeaderboardTier;
  /** Player's score */
  score: number;
}

/**
 * Maps a numeric leaderboard position to a tier.
 * - Positions 1–3: 'top3'
 * - Positions 4–10: 'top10'
 * - Positions 11+: 'outside'
 */
export function getPositionTier(position: number | null): LeaderboardTier {
  if (position === null || position > 10) {
    return 'outside';
  }
  if (position <= 3) {
    return 'top3';
  }
  return 'top10';
}

/**
 * Detects if a position change constitutes a promotion event.
 *
 * A promotion occurs when:
 * 1. Player enters top 10 from outside (previousPosition > 10 or null → newPosition <= 10)
 * 2. Player moves from positions 10–4 to positions 3–1
 */
export function detectPromotion(
  previousPosition: number | null,
  newPosition: number
): boolean {
  const previousTier = getPositionTier(previousPosition);
  const newTier = getPositionTier(newPosition);

  // No promotion if still outside top 10
  if (newTier === 'outside') {
    return false;
  }

  // Entered top 10 from outside
  if (previousTier === 'outside' && (newTier === 'top10' || newTier === 'top3')) {
    return true;
  }

  // Moved up a tier: from top10 (4–10) to top3 (1–3)
  if (previousTier === 'top10' && newTier === 'top3') {
    return true;
  }

  return false;
}

/**
 * Human-readable labels for exercise IDs.
 */
export const EXERCISE_DISPLAY_NAMES: Record<string, string> = {
  static_grid: 'Static Grid',
  micro_adjust: 'Micro Adjustments',
  pop_up_reflex: 'Pop-Up Reflex',
  strafe_track: 'Strafe Tracking',
  dynamic_flicks: 'Dynamic Flicks',
};

/**
 * Builds a share message for a promotion event.
 */
export function buildShareMessage(event: PromotionEvent): string {
  const tierLabel = event.newTier === 'top3' ? `#${event.newPosition}` : `Top ${event.newPosition}`;
  return `🎯 ${event.playerName} just reached ${tierLabel} on the ${event.exerciseName} leaderboard with a score of ${event.score.toLocaleString()}! Can you beat it?`;
}

/**
 * Builds a shareable URL with Open Graph share card image parameters.
 */
export function buildShareUrl(event: PromotionEvent): string {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_BASE_URL || 'https://aimtrainerpro.online');

  const params = new URLSearchParams({
    score: event.score.toString(),
    accuracy: '0',
    exerciseName: event.exerciseName,
    playerName: event.playerName,
    leaderboardPosition: event.newPosition.toString(),
  });

  return `${baseUrl}/?ref=share&exercise=${encodeURIComponent(event.exerciseId)}&position=${event.newPosition}&card=${encodeURIComponent(`${baseUrl}/api/share/card?${params.toString()}`)}`;
}

/**
 * Creates a PromotionEvent from raw data, or returns null if no promotion occurred.
 */
export function createPromotionEvent(params: {
  playerName: string;
  exerciseId: string;
  score: number;
  newPosition: number;
  previousPosition: number | null;
}): PromotionEvent | null {
  const { playerName, exerciseId, score, newPosition, previousPosition } = params;

  if (!detectPromotion(previousPosition, newPosition)) {
    return null;
  }

  const exerciseName = EXERCISE_DISPLAY_NAMES[exerciseId] || exerciseId;

  return {
    playerName,
    exerciseId,
    exerciseName,
    newPosition,
    previousPosition,
    newTier: getPositionTier(newPosition),
    previousTier: getPositionTier(previousPosition),
    score,
  };
}
