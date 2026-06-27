/**
 * Dynamic script loader for exercise-specific code.
 * Loads scripts on demand when a player selects an exercise,
 * ensuring initial page load doesn't include exercise engine code.
 *
 * Requirements: 10.4 (exercise code loads on demand, begins within 1 second on 4G)
 * Requirements: 10.8 (initial JS bundle ≤ 200 KB compressed)
 */

type ScriptLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface ScriptState {
  status: ScriptLoadStatus;
  promise: Promise<void> | null;
}

// Track loaded scripts to avoid duplicate loads
const scriptRegistry = new Map<string, ScriptState>();

/**
 * Load a single script dynamically with caching.
 * Returns immediately if the script is already loaded.
 */
export function loadScript(src: string): Promise<void> {
  const existing = scriptRegistry.get(src);

  if (existing?.status === 'loaded') {
    return Promise.resolve();
  }

  if (existing?.status === 'loading' && existing.promise) {
    return existing.promise;
  }

  // Check if script is already in the DOM (e.g., loaded by another component)
  const domScript = document.querySelector(`script[src="${src}"]`);
  if (domScript) {
    scriptRegistry.set(src, { status: 'loaded', promise: null });
    return Promise.resolve();
  }

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    script.onload = () => {
      scriptRegistry.set(src, { status: 'loaded', promise: null });
      resolve();
    };

    script.onerror = () => {
      scriptRegistry.set(src, { status: 'error', promise: null });
      reject(new Error(`Failed to load script: ${src}`));
    };

    document.body.appendChild(script);
  });

  scriptRegistry.set(src, { status: 'loading', promise });
  return promise;
}

/**
 * Exercise script groups that are loaded together on demand.
 * Core scripts are required for any exercise to run.
 * Additional scripts can be loaded for specific features.
 */
const EXERCISE_CORE_SCRIPTS = [
  '/assets/js/storage.js',
  '/assets/js/audio.js',
  '/assets/js/exercises/exercise-definitions.js',
  '/assets/js/exercises/exercise-engine.js',
];

const EXERCISE_UI_SCRIPTS = [
  '/assets/js/ui.js',
  '/assets/js/leaderboard.js',
];

let exerciseCoreLoaded = false;
let exerciseUILoaded = false;

/**
 * Load the exercise engine core scripts on demand.
 * This is triggered when a player selects an exercise to play.
 * On 4G (9 Mbps), these scripts should load within ~500ms,
 * well within the 1-second budget.
 */
export async function loadExerciseCore(): Promise<void> {
  if (exerciseCoreLoaded) return;

  // Load scripts sequentially to maintain dependency order
  for (const src of EXERCISE_CORE_SCRIPTS) {
    await loadScript(src);
  }

  exerciseCoreLoaded = true;
}

/**
 * Load UI scripts (tabs, leaderboard display) on demand.
 * These are loaded after core scripts when the main menu is shown.
 */
export async function loadExerciseUI(): Promise<void> {
  if (exerciseUILoaded) return;

  // Ensure core is loaded first
  await loadExerciseCore();

  for (const src of EXERCISE_UI_SCRIPTS) {
    await loadScript(src);
  }

  exerciseUILoaded = true;
}

/**
 * Preload exercise scripts using link rel="preload" hints.
 * This starts downloading scripts early but doesn't execute them,
 * reducing perceived latency when the player starts an exercise.
 */
export function preloadExerciseScripts(): void {
  const allScripts = [...EXERCISE_CORE_SCRIPTS, ...EXERCISE_UI_SCRIPTS];

  allScripts.forEach((src) => {
    // Skip if already loaded or preloaded
    if (scriptRegistry.has(src)) return;
    if (document.querySelector(`link[href="${src}"][rel="preload"]`)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;
    document.head.appendChild(link);
  });
}

/**
 * Check if the exercise engine is ready (scripts loaded and global available).
 */
export function isExerciseEngineReady(): boolean {
  return exerciseCoreLoaded && typeof (window as any).ExerciseEngine !== 'undefined';
}

/**
 * Reset the script registry (useful for testing).
 */
export function resetScriptRegistry(): void {
  scriptRegistry.clear();
  exerciseCoreLoaded = false;
  exerciseUILoaded = false;
}
