'use client';

/**
 * ExerciseEmbed component.
 * Loads a specific exercise inline within landing pages and blog posts.
 * Players can start and complete a round without navigating away.
 *
 * Requirements: 8.4, 9.3
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { getExerciseById } from '@/lib/exercises/registry';
import { loadExerciseCore } from '@/lib/performance';
import type { ExerciseDefinition } from '@/lib/exercises/types';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ExerciseEmbedProps {
  /** The exercise ID to load */
  exerciseId: string;
}

type EmbedState = 'idle' | 'loading' | 'countdown' | 'playing' | 'finished';

interface ExerciseResults {
  score: number;
  accuracy: string;
  hits: number;
  clicks: number;
  kps: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ExerciseEmbed({ exerciseId }: ExerciseEmbedProps) {
  const [state, setState] = useState<EmbedState>('idle');
  const [results, setResults] = useState<ExerciseResults | null>(null);
  const [hudData, setHudData] = useState({ score: 0, time: '00:00', accuracy: '100%' });

  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const scriptsLoadedRef = useRef(false);

  // Lookup exercise definition from the TypeScript registry
  const exercise: ExerciseDefinition | undefined = getExerciseById(exerciseId);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (engineRef.current) {
        engineRef.current.stop?.();
        engineRef.current = null;
      }
    };
  }, []);

  /**
   * Load the exercise engine scripts if not already loaded globally.
   * Uses the centralized dynamic script loader for consistent caching.
   */
  const loadScripts = useCallback((): Promise<void> => {
    if (scriptsLoadedRef.current) return Promise.resolve();

    // If the global ExerciseEngine class is already available, skip loading
    if (typeof (window as any).ExerciseEngine !== 'undefined') {
      scriptsLoadedRef.current = true;
      return Promise.resolve();
    }

    return loadExerciseCore().then(() => {
      scriptsLoadedRef.current = true;
    });
  }, []);

  /**
   * Run countdown from 3 to 1
   */
  const runCountdown = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      setState('countdown');
      let count = 3;
      const interval = setInterval(() => {
        count--;
        if (count <= 0) {
          clearInterval(interval);
          resolve();
        }
      }, 700);
    });
  }, []);

  /**
   * Start the game loop
   */
  const startGameLoop = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !exercise) return;

    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (engine && engine.exerciseState.running && !engine.exerciseState.paused) {
        engine.update(dt);
        updateHUD(engine);

        if (engine.exerciseState.timeElapsed >= exercise.duration) {
          finishExercise();
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  }, [exercise]);

  /**
   * Update the in-game HUD data
   */
  const updateHUD = useCallback((engine: any) => {
    if (!engine || !exercise) return;
    const es = engine.exerciseState;
    const timeLeft = Math.max(0, exercise.duration - es.timeElapsed);
    const acc = es.clicks > 0 ? Math.round((es.hits / es.clicks) * 100) : 100;

    setHudData({
      score: Math.floor(es.score),
      time: `00:${Math.ceil(timeLeft).toString().padStart(2, '0')}`,
      accuracy: `${acc}%`,
    });
  }, [exercise]);

  /**
   * Handle exercise completion
   */
  const finishExercise = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const engine = engineRef.current;
    if (!engine || !exercise) return;

    const es = engine.exerciseState;
    const finalResults: ExerciseResults = {
      score: Math.floor(es.score),
      accuracy: es.clicks > 0 ? ((es.hits / es.clicks) * 100).toFixed(1) : '100.0',
      hits: es.hits,
      clicks: es.clicks,
      kps: (es.hits / exercise.duration).toFixed(2),
    };

    setResults(finalResults);
    setState('finished');

    // Cleanup the engine
    engine.stop?.();
    document.exitPointerLock?.();
    document.body.classList.remove('playing');
  }, [exercise]);

  /**
   * Start playing the exercise
   */
  const handleStart = useCallback(async () => {
    if (!exercise || !containerRef.current) return;

    setState('loading');
    await loadScripts();

    // Clear the container for the engine
    const gameArea = containerRef.current.querySelector('[data-game-area]') as HTMLDivElement;
    if (!gameArea) return;
    gameArea.innerHTML = '';

    // Create a new engine instance
    const EngineClass = (window as any).ExerciseEngine;
    if (!EngineClass) {
      setState('idle');
      return;
    }

    const engine = new EngineClass(gameArea);
    engineRef.current = engine;

    // Initialize the exercise using the global vanilla JS function
    const getExById = (window as any).getExerciseById;
    if (!getExById) {
      setState('idle');
      return;
    }

    if (!engine.initExercise(exerciseId)) {
      setState('idle');
      return;
    }

    // Run countdown then start
    await runCountdown();
    setState('playing');

    engine.spawnTargets();
    startGameLoop();

    // Request pointer lock for mouse control on desktop
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      navigator.userAgent.toLowerCase()
    ) || window.innerWidth < 900;

    if (!isMobile && gameArea.requestPointerLock) {
      gameArea.requestPointerLock();
    }
    if (!isMobile) {
      document.body.classList.add('playing');
    }
  }, [exercise, exerciseId, loadScripts, runCountdown, startGameLoop]);

  /**
   * Replay the exercise
   */
  const handleReplay = useCallback(() => {
    setResults(null);
    setHudData({ score: 0, time: '00:00', accuracy: '100%' });
    handleStart();
  }, [handleStart]);

  // ─── Render ─────────────────────────────────────────────────────────────

  if (!exercise) {
    return (
      <div className="exercise-embed-error" style={styles.errorContainer}>
        <p>Exercise not found: <code>{exerciseId}</code></p>
      </div>
    );
  }

  return (
    <div className="exercise-embed" style={styles.container} ref={containerRef}>
      {/* Exercise Info Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>{exercise.name}</h3>
          <p style={styles.description}>{exercise.description}</p>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.badge}>{exercise.category}</span>
        </div>
      </div>

      {/* Game Area */}
      <div style={styles.gameWrapper}>
        <div data-game-area style={styles.gameArea} />

        {/* Idle Overlay */}
        {state === 'idle' && (
          <div style={styles.overlay}>
            <div style={styles.overlayContent}>
              <p style={styles.overlayText}>
                Duration: {exercise.duration}s
              </p>
              <button onClick={handleStart} style={styles.startButton}>
                ▶ Start Exercise
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {state === 'loading' && (
          <div style={styles.overlay}>
            <div style={styles.overlayContent}>
              <p style={styles.overlayText}>Loading...</p>
            </div>
          </div>
        )}

        {/* Countdown Overlay */}
        {state === 'countdown' && (
          <div style={styles.overlay}>
            <div style={styles.overlayContent}>
              <p style={styles.countdownText}>Get Ready!</p>
            </div>
          </div>
        )}

        {/* Playing HUD */}
        {state === 'playing' && (
          <div style={styles.hud}>
            <div style={styles.hudStat}>
              <span style={styles.hudValue}>{hudData.score}</span>
              <span style={styles.hudLabel}>Score</span>
            </div>
            <div style={styles.hudStat}>
              <span style={styles.hudValue}>{hudData.time}</span>
              <span style={styles.hudLabel}>Time</span>
            </div>
            <div style={styles.hudStat}>
              <span style={styles.hudValue}>{hudData.accuracy}</span>
              <span style={styles.hudLabel}>Accuracy</span>
            </div>
          </div>
        )}

        {/* Results Overlay */}
        {state === 'finished' && results && (
          <div style={styles.overlay}>
            <div style={styles.resultsContent}>
              <h4 style={styles.resultsTitle}>Round Complete</h4>
              <div style={styles.resultsGrid}>
                <div style={styles.resultStat}>
                  <span style={styles.resultValue}>{results.score}</span>
                  <span style={styles.resultLabel}>Score</span>
                </div>
                <div style={styles.resultStat}>
                  <span style={styles.resultValue}>{results.accuracy}%</span>
                  <span style={styles.resultLabel}>Accuracy</span>
                </div>
                <div style={styles.resultStat}>
                  <span style={styles.resultValue}>{results.hits}/{results.clicks}</span>
                  <span style={styles.resultLabel}>Hits</span>
                </div>
                <div style={styles.resultStat}>
                  <span style={styles.resultValue}>{results.kps}</span>
                  <span style={styles.resultLabel}>KPS</span>
                </div>
              </div>
              <button onClick={handleReplay} style={styles.startButton}>
                ↻ Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    maxWidth: '800px',
    margin: '24px auto',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: '#1a1d23',
  },
  errorContainer: {
    padding: '24px',
    textAlign: 'center',
    color: '#ff4655',
    background: 'rgba(255, 70, 85, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 70, 85, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    background: 'rgba(0, 0, 0, 0.3)',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#ffffff',
  },
  description: {
    margin: '4px 0 0',
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    background: 'rgba(255, 70, 85, 0.2)',
    color: '#ff4655',
    letterSpacing: '0.5px',
  },
  difficultyBadge: {
    fontSize: '0.75rem',
    color: '#ffc107',
  },
  gameWrapper: {
    position: 'relative',
    width: '100%',
    height: '400px',
    background: '#181b21',
  },
  gameArea: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.75)',
    zIndex: 10,
  },
  overlayContent: {
    textAlign: 'center',
  },
  overlayText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.95rem',
    marginBottom: '16px',
  },
  countdownText: {
    color: '#ff4655',
    fontSize: '2rem',
    fontWeight: 700,
    letterSpacing: '2px',
  },
  startButton: {
    padding: '12px 32px',
    background: '#ff4655',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  hud: {
    position: 'absolute',
    top: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '24px',
    padding: '8px 20px',
    background: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '8px',
    zIndex: 5,
  },
  hudStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  hudValue: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#ffffff',
  },
  hudLabel: {
    fontSize: '0.65rem',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  resultsContent: {
    textAlign: 'center',
    padding: '24px',
  },
  resultsTitle: {
    margin: '0 0 16px',
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#ff4655',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '20px',
  },
  resultStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
  },
  resultValue: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#ffffff',
  },
  resultLabel: {
    fontSize: '0.7rem',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    marginTop: '4px',
  },
};
