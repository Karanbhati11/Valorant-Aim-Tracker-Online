'use client';

import { useAuthState, getGuestPlayerName } from './useAuthState';

/**
 * Provides auth-aware utilities for features that behave differently
 * for authenticated users vs. guests.
 *
 * - Leaderboard: authenticated users get userId attached; guests use localStorage only
 * - Progression: authenticated users track server-side; guests track in localStorage
 * - Multiplayer: both can play, but authenticated users have persistent profiles
 * - Social sharing: authenticated users include their display name
 *
 * Requirements: 4.3, 4.4
 */
export function useAuthFeatures() {
  const auth = useAuthState();

  /**
   * Returns the player name to display (authenticated display name or localStorage guest name).
   */
  function getPlayerName(): string {
    if (auth.isAuthenticated && auth.displayName) {
      return auth.displayName;
    }
    return getGuestPlayerName();
  }

  /**
   * Builds the payload for a leaderboard submission.
   * Authenticated users have their name set from their profile.
   * Guests provide their own name (from localStorage or input).
   */
  function buildLeaderboardPayload(data: {
    exerciseId: string;
    score: number;
    accuracy?: number;
    guestName?: string;
  }) {
    const name = auth.isAuthenticated && auth.displayName
      ? auth.displayName
      : data.guestName || getGuestPlayerName();

    return {
      exerciseId: data.exerciseId,
      score: data.score,
      accuracy: data.accuracy,
      name,
    };
  }

  /**
   * Builds the payload for creating a challenge link.
   * Authenticated users get their userId and display name attached automatically.
   * Guests must provide a challengerId (e.g., a session-local ID).
   */
  function buildChallengePayload(data: {
    exerciseId: string;
    challengerScore: number;
    challengerAccuracy?: number;
    guestId?: string;
    guestName?: string;
  }) {
    return {
      exerciseId: data.exerciseId,
      challengerScore: data.challengerScore,
      challengerAccuracy: data.challengerAccuracy,
      // For authenticated users, the server will override these from the session
      challengerId: auth.isAuthenticated && auth.userId
        ? auth.userId
        : data.guestId || generateGuestId(),
      challengerName: auth.isAuthenticated && auth.displayName
        ? auth.displayName
        : data.guestName || getGuestPlayerName(),
    };
  }

  /**
   * Returns the userId for multiplayer rooms.
   * Authenticated users use their server userId.
   * Guests get a session-persistent ID from localStorage.
   */
  function getMultiplayerUserId(): string {
    if (auth.isAuthenticated && auth.userId) {
      return auth.userId;
    }
    return getOrCreateGuestSessionId();
  }

  /**
   * Returns the display name for multiplayer.
   */
  function getMultiplayerDisplayName(): string {
    return getPlayerName();
  }

  /**
   * Whether to persist progression data server-side.
   * Only authenticated users get server-side progression tracking.
   * Guests rely on localStorage.
   */
  function shouldPersistServerSide(): boolean {
    return auth.isAuthenticated;
  }

  return {
    ...auth,
    getPlayerName,
    buildLeaderboardPayload,
    buildChallengePayload,
    getMultiplayerUserId,
    getMultiplayerDisplayName,
    shouldPersistServerSide,
  };
}

/**
 * Generates a random guest ID for challenge links (non-authenticated users).
 */
function generateGuestId(): string {
  if (typeof window === 'undefined') return 'guest-ssr';
  return `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Gets or creates a persistent guest session ID in localStorage.
 * Used for multiplayer so the same guest can reconnect.
 */
function getOrCreateGuestSessionId(): string {
  if (typeof window === 'undefined') return 'guest-ssr';

  const STORAGE_KEY = 'aim_guest_session_id';
  let sessionId = localStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    sessionId = `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
}
