'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { syncLocalToServer, hasPendingSync } from '@/lib/auth/sync';

/**
 * Auth state for use across components that need to know whether
 * the user is authenticated (leaderboard submissions, multiplayer,
 * progression tracking, social sharing).
 *
 * - Authenticated: uses server-side storage, userId tied to submissions
 * - Guest: uses localStorage only, no userId on submissions
 *
 * Requirements: 4.3, 4.4
 */
export interface AuthState {
  /** Whether the session is still loading */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** The authenticated user's ID (null for guests) */
  userId: string | null;
  /** The authenticated user's display name (null for guests) */
  displayName: string | null;
  /** The authenticated user's email (null for guests) */
  email: string | null;
}

/**
 * Hook that provides the current authentication state to any client component.
 *
 * On first authentication, triggers syncLocalToServer() to push any
 * localStorage data to the server. For guests, all features work locally
 * without authentication.
 *
 * Requirements: 4.3, 4.4
 */
export function useAuthState(): AuthState {
  const { data: session, status } = useSession();
  const hasSyncedRef = useRef(false);

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session?.user;

  const userId = isAuthenticated
    ? (session?.user as { id?: string })?.id ?? null
    : null;

  const displayName = isAuthenticated
    ? session?.user?.name ?? null
    : null;

  const email = isAuthenticated
    ? session?.user?.email ?? null
    : null;

  // On authentication, trigger sync of local data to server
  useEffect(() => {
    if (isAuthenticated && !hasSyncedRef.current) {
      hasSyncedRef.current = true;

      // Sync local progress to server (non-blocking)
      if (hasPendingSync() || typeof window !== 'undefined') {
        syncLocalToServer().catch(() => {
          // Sync failure is non-fatal; will retry on next auth
        });
      }
    }

    // Reset sync flag when user logs out
    if (!isAuthenticated && status !== 'loading') {
      hasSyncedRef.current = false;
    }
  }, [isAuthenticated, status]);

  return {
    isLoading,
    isAuthenticated,
    userId,
    displayName,
    email,
  };
}

/**
 * Returns a guest-compatible player name.
 * - Authenticated users: returns their display name
 * - Guests: returns the name from localStorage or a default
 */
export function getGuestPlayerName(): string {
  if (typeof window === 'undefined') return 'Guest';

  const stored = localStorage.getItem('aim_player_name');
  return stored || 'Guest';
}
