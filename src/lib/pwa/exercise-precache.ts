/**
 * Pre-caching logic for the 5 most recently played exercises.
 * Tracks recently played exercises in localStorage and uses the Cache API
 * to pre-cache their assets (engine script, definitions, CSS, audio).
 *
 * Requirements: 11.5
 */

const RECENTLY_PLAYED_KEY = "aimtrainerpro_recently_played";
const MAX_RECENT_EXERCISES = 5;
const PRECACHE_CACHE_NAME = "exercise-precache-v1";

/** Asset paths that should be pre-cached for each exercise */
const EXERCISE_ASSETS = [
  "/assets/js/exercises/exercise-engine.js",
  "/assets/js/exercises/exercise-definitions.js",
  "/assets/css/styles.css",
  "/assets/js/audio.js",
];

export interface RecentExercise {
  id: string;
  playedAt: string; // ISO timestamp
}

/**
 * Retrieves the list of recently played exercises from localStorage.
 * Returns up to 5 exercises, sorted by most recently played first.
 */
export function getRecentlyPlayedExercises(): RecentExercise[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(RECENTLY_PLAYED_KEY);
    if (!stored) return [];
    const exercises: RecentExercise[] = JSON.parse(stored);
    return exercises.slice(0, MAX_RECENT_EXERCISES);
  } catch {
    return [];
  }
}

/**
 * Records an exercise as recently played.
 * Maintains a list of up to 5 most recent exercises (deduped by ID).
 * Triggers pre-caching of exercise assets after recording.
 */
export function recordExercisePlayed(exerciseId: string): void {
  if (typeof window === "undefined") return;

  try {
    const existing = getRecentlyPlayedExercises();

    // Remove existing entry for this exercise (if any) to avoid duplicates
    const filtered = existing.filter((e) => e.id !== exerciseId);

    // Add the new exercise at the front (most recent)
    const updated: RecentExercise[] = [
      { id: exerciseId, playedAt: new Date().toISOString() },
      ...filtered,
    ].slice(0, MAX_RECENT_EXERCISES);

    localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(updated));

    // Trigger pre-caching in background
    precacheExerciseAssets().catch(() => {
      // Silently fail - pre-caching is best-effort
    });
  } catch {
    // localStorage unavailable - silently fail
  }
}

/**
 * Pre-caches the exercise assets using the Cache API.
 * Caches engine script, definitions, CSS, and audio files
 * for all recently played exercises.
 */
export async function precacheExerciseAssets(): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;

  try {
    const cache = await caches.open(PRECACHE_CACHE_NAME);

    // Check which assets are already cached to avoid redundant fetches
    const existingKeys = await cache.keys();
    const cachedUrls = new Set(existingKeys.map((req) => new URL(req.url).pathname));

    const assetsToCache = EXERCISE_ASSETS.filter(
      (asset) => !cachedUrls.has(asset)
    );

    if (assetsToCache.length === 0) return;

    // Fetch and cache assets that aren't already cached
    const fetchPromises = assetsToCache.map(async (assetPath) => {
      try {
        const response = await fetch(assetPath);
        if (response.ok) {
          await cache.put(assetPath, response);
        }
      } catch {
        // Individual asset cache failure is non-fatal
      }
    });

    await Promise.allSettled(fetchPromises);
  } catch {
    // Cache API unavailable or failed - silently fail
  }
}

/**
 * Clears the exercise pre-cache.
 * Useful for cache management or debugging.
 */
export async function clearExercisePrecache(): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;

  try {
    await caches.delete(PRECACHE_CACHE_NAME);
  } catch {
    // Silently fail
  }
}
