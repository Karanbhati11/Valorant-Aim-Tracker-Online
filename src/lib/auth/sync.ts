/**
 * Local-to-server data sync module.
 *
 * On authentication, reads local progress from localStorage and pushes it
 * to the server. Server-side data takes precedence on conflicts.
 * On sync failure, local data is retained for retry on the next auth success.
 */

import type { ExerciseResult } from "@/lib/exercises/types";
import type { SensitivityProfile, CrosshairConfig } from "@/lib/auth/types";

// localStorage keys (aligned with public/assets/js/storage.js)
const STORAGE_KEYS = {
  EXERCISE_RESULTS: "aim_exercise_results",
  SENSITIVITY: "aim_sensitivity",
  CROSSHAIR_CONFIG: "aim_active_crosshair",
  SAVED_CROSSHAIRS: "aim_saved_crosshairs",
  SYNC_PENDING: "aim_sync_pending",
} as const;

/**
 * Shape of the local progress payload sent to the server during sync.
 */
export interface LocalProgress {
  exerciseResults: ExerciseResult[];
  sensitivityProfiles: SensitivityProfile[];
  crosshairConfigs: CrosshairConfig[];
}

/**
 * Reads all local progress data from localStorage.
 * Returns a structured object containing exercise results,
 * sensitivity profiles, and crosshair configurations.
 */
export function getLocalProgress(): LocalProgress {
  if (typeof window === "undefined") {
    return { exerciseResults: [], sensitivityProfiles: [], crosshairConfigs: [] };
  }

  const exerciseResults = parseJSON<ExerciseResult[]>(
    localStorage.getItem(STORAGE_KEYS.EXERCISE_RESULTS),
    []
  );

  // Build a sensitivity profile from the stored raw sensitivity value
  const rawSensitivity = localStorage.getItem(STORAGE_KEYS.SENSITIVITY);
  const sensitivityProfiles: SensitivityProfile[] = [];
  if (rawSensitivity) {
    sensitivityProfiles.push({
      id: "local-default",
      game: "trainer",
      sensitivity: parseFloat(rawSensitivity) || 0.314,
      dpi: 800, // default DPI when not explicitly stored
      trainerSensitivity: parseFloat(rawSensitivity) || 0.314,
    });
  }

  // Build crosshair configs from saved crosshairs
  const savedCrosshairs = parseJSON<Array<{
    name?: string;
    color?: string;
    size?: number;
    style?: string;
    opacity?: number;
  }>>(localStorage.getItem(STORAGE_KEYS.SAVED_CROSSHAIRS), []);

  const crosshairConfigs: CrosshairConfig[] = savedCrosshairs.map(
    (ch, index) => ({
      id: `local-${index}`,
      name: ch.name || `Crosshair ${index + 1}`,
      color: ch.color || "#00ff00",
      size: ch.size || 6,
      thickness: 2,
      gap: 0,
      outline: false,
      dot: false,
    })
  );

  return { exerciseResults, sensitivityProfiles, crosshairConfigs };
}

/**
 * Syncs local progress data to the server.
 *
 * Behavior:
 * - Reads local data via getLocalProgress()
 * - Sends it to the server sync endpoint
 * - Server-side data takes precedence on conflicts (server decides what to keep)
 * - On success, marks sync as complete (clears pending flag)
 * - On failure, retains local data unchanged and marks sync as pending for retry
 *
 * @returns true if sync succeeded, false otherwise
 */
export async function syncLocalToServer(): Promise<boolean> {
  const localProgress = getLocalProgress();

  // Nothing to sync if there's no local data
  const hasData =
    localProgress.exerciseResults.length > 0 ||
    localProgress.sensitivityProfiles.length > 0 ||
    localProgress.crosshairConfigs.length > 0;

  if (!hasData) {
    markSyncComplete();
    return true;
  }

  try {
    const response = await fetch("/api/user/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(localProgress),
    });

    if (!response.ok) {
      markSyncPending();
      return false;
    }

    markSyncComplete();
    return true;
  } catch {
    // Network error or other failure — retain local data, mark for retry
    markSyncPending();
    return false;
  }
}

/**
 * Clears all local progress data from localStorage.
 * Typically called after a successful sync when the user explicitly
 * wants to reset local state (e.g., on sign-out from a shared device).
 */
export function clearLocalProgress(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORAGE_KEYS.EXERCISE_RESULTS);
  localStorage.removeItem(STORAGE_KEYS.SYNC_PENDING);
}

/**
 * Returns whether there is a pending sync that failed previously.
 */
export function hasPendingSync(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.SYNC_PENDING) === "true";
}

// --- Internal helpers ---

function markSyncPending(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.SYNC_PENDING, "true");
}

function markSyncComplete(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.SYNC_PENDING);
}

function parseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
