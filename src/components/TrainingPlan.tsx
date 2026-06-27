'use client';

/**
 * Training Plan UI component.
 * Provides plan selection, progress tracking, exercise queue display,
 * and configurable exercise duration (15–180 seconds in 1-second increments).
 *
 * Requirements: 14.1–14.6
 */

import { useState, useCallback, useMemo } from 'react';
import {
  TrainingPlan as TrainingPlanType,
  PlaylistSession,
  PlanExerciseEntry,
  CompletionStats,
  getPreBuiltPlans,
  startSession,
  completeExercise,
  skipExercise,
  getCompletionStats,
  setExerciseDuration,
  isValidDuration,
} from '@/lib/training/plans';
import {
  ExerciseRecommendation,
  getRecommendations,
} from '@/lib/training/recommendations';
import { getExerciseById } from '@/lib/exercises/registry';
import { ExerciseResult } from '@/lib/exercises/types';

// ─── Types ──────────────────────────────────────────────────────────────────

type ViewMode = 'selection' | 'active';

interface TrainingPlanProps {
  /** Player's historical sessions for generating recommendations */
  playerSessions?: ExerciseResult[];
  /** Callback when an exercise should be launched */
  onStartExercise?: (exerciseId: string, duration: number) => void;
  /** Callback when the training session is complete */
  onSessionComplete?: (stats: CompletionStats) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function TrainingPlan({
  playerSessions = [],
  onStartExercise,
  onSessionComplete,
}: TrainingPlanProps) {
  const [view, setView] = useState<ViewMode>('selection');
  const [session, setSession] = useState<PlaylistSession | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlanType | null>(null);

  // Get pre-built plans
  const plans = useMemo(() => getPreBuiltPlans(), []);

  // Get recommendations based on player sessions (Req 14.4)
  const recommendations: ExerciseRecommendation[] = useMemo(
    () => getRecommendations(playerSessions),
    [playerSessions]
  );

  // Compute completion stats for active session
  const stats: CompletionStats | null = useMemo(() => {
    if (!session) return null;
    return getCompletionStats(session);
  }, [session]);

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleSelectPlan = useCallback((plan: TrainingPlanType) => {
    setSelectedPlan(plan);
    const newSession = startSession(plan);
    setSession(newSession);
    setView('active');
  }, []);

  const handleCompleteExercise = useCallback(
    (score: number) => {
      if (!session) return;
      const updated = completeExercise(session, score);
      if (updated) {
        setSession(updated);
        // Check if all exercises are done
        const updatedStats = getCompletionStats(updated);
        if (updatedStats.pendingCount === 0) {
          onSessionComplete?.(updatedStats);
        }
      }
    },
    [session, onSessionComplete]
  );

  const handleSkipExercise = useCallback(() => {
    if (!session) return;
    const updated = skipExercise(session);
    if (updated) {
      setSession(updated);
      // Check if all exercises are done
      const updatedStats = getCompletionStats(updated);
      if (updatedStats.pendingCount === 0) {
        onSessionComplete?.(updatedStats);
      }
    }
  }, [session, onSessionComplete]);

  const handleDurationChange = useCallback(
    (exerciseIndex: number, duration: number) => {
      if (!session) return;
      const updated = setExerciseDuration(session, exerciseIndex, duration);
      if (updated) {
        setSession(updated);
      }
    },
    [session]
  );

  const handleStartCurrentExercise = useCallback(() => {
    if (!session) return;
    const currentEntry = session.exercises[session.currentIndex];
    if (!currentEntry) return;
    const exercise = getExerciseById(currentEntry.exerciseId);
    const duration = currentEntry.durationOverride ?? exercise?.duration ?? 60;
    onStartExercise?.(currentEntry.exerciseId, duration);
  }, [session, onStartExercise]);

  const handleBackToSelection = useCallback(() => {
    setView('selection');
    setSession(null);
    setSelectedPlan(null);
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────────

  if (view === 'selection') {
    return (
      <PlanSelectionView
        plans={plans}
        recommendations={recommendations}
        onSelectPlan={handleSelectPlan}
      />
    );
  }

  return (
    <ActiveSessionView
      session={session!}
      stats={stats!}
      planName={selectedPlan?.name ?? 'Training Plan'}
      onComplete={handleCompleteExercise}
      onSkip={handleSkipExercise}
      onDurationChange={handleDurationChange}
      onStartExercise={handleStartCurrentExercise}
      onBack={handleBackToSelection}
    />
  );
}

// ─── Plan Selection View ────────────────────────────────────────────────────

interface PlanSelectionViewProps {
  plans: TrainingPlanType[];
  recommendations: ExerciseRecommendation[];
  onSelectPlan: (plan: TrainingPlanType) => void;
}

function PlanSelectionView({ plans, recommendations, onSelectPlan }: PlanSelectionViewProps) {
  const levelColors: Record<string, string> = {
    beginner: '#4caf50',
    intermediate: '#ff9800',
    advanced: '#f44336',
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--accent)', marginBottom: '8px' }}>Training Plans</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
        Choose a structured training plan to improve your aim systematically.
      </p>

      {/* Recommendations Section (Req 14.4) */}
      {recommendations.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '12px' }}>
            Recommended Exercises
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '12px' }}>
            Based on your weakest areas — focus on these to improve fastest.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {recommendations.slice(0, 5).map((rec) => (
              <div
                key={rec.exercise.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  minWidth: '180px',
                  flex: '1 1 180px',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  {rec.exercise.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {rec.reason === 'weak_area'
                    ? `Avg: ${Math.round(rec.averageScore)} / 1000`
                    : 'Not yet attempted'}
                </div>
                <div
                  style={{
                    marginTop: '6px',
                    fontSize: '0.7rem',
                    color: rec.reason === 'weak_area' ? '#ff9800' : '#4caf50',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  {rec.reason === 'weak_area' ? 'Needs work' : 'Try it'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan Cards (Req 14.1) */}
      <h3 style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '12px' }}>
        Pre-built Plans
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => onSelectPlan(plan)}
            role="button"
            tabIndex={0}
            aria-label={`Start ${plan.name} training plan`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectPlan(plan);
              }
            }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '16px 20px',
              cursor: 'pointer',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor =
                levelColors[plan.level] ?? 'var(--accent)';
              (e.currentTarget as HTMLDivElement).style.background =
                'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>
                  {plan.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {plan.description}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: levelColors[plan.level] ?? 'var(--text-muted)',
                    marginBottom: '4px',
                  }}
                >
                  {plan.level}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {plan.exercises.length} exercises
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Active Session View ────────────────────────────────────────────────────

interface ActiveSessionViewProps {
  session: PlaylistSession;
  stats: CompletionStats;
  planName: string;
  onComplete: (score: number) => void;
  onSkip: () => void;
  onDurationChange: (exerciseIndex: number, duration: number) => void;
  onStartExercise: () => void;
  onBack: () => void;
}

function ActiveSessionView({
  session,
  stats,
  planName,
  onComplete,
  onSkip,
  onDurationChange,
  onStartExercise,
  onBack,
}: ActiveSessionViewProps) {
  const isComplete = stats.pendingCount === 0;
  const currentExercise =
    session.currentIndex < session.exercises.length
      ? session.exercises[session.currentIndex]
      : null;
  const currentExerciseDef = currentExercise
    ? getExerciseById(currentExercise.exerciseId)
    : null;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ color: 'var(--accent)', margin: 0 }}>{planName}</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {isComplete ? 'Session Complete!' : `Exercise ${session.currentIndex + 1} of ${stats.totalExercises}`}
          </div>
        </div>
        <button
          onClick={onBack}
          aria-label="Back to plan selection"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-main)',
            padding: '8px 14px',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
      </div>

      {/* Progress Bar (Req 14.3) */}
      <ProgressBar stats={stats} />

      {/* Current Exercise Card */}
      {!isComplete && currentExercise && currentExerciseDef && (
        <CurrentExerciseCard
          entry={currentExercise}
          exercise={currentExerciseDef}
          exerciseIndex={session.currentIndex}
          onDurationChange={onDurationChange}
          onStart={onStartExercise}
          onSkip={onSkip}
        />
      )}

      {/* Session Complete */}
      {isComplete && (
        <div
          style={{
            textAlign: 'center',
            padding: '32px',
            background: 'var(--bg-card)',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎯</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
            Training Complete!
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Completed {stats.completedCount} of {stats.totalExercises - stats.skippedCount} exercises
            ({stats.completionPercentage}%)
          </div>
          {stats.skippedCount > 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
              {stats.skippedCount} exercise{stats.skippedCount > 1 ? 's' : ''} skipped
            </div>
          )}
        </div>
      )}

      {/* Exercise Queue (Req 14.2, auto-advance) */}
      <ExerciseQueue exercises={session.exercises} currentIndex={session.currentIndex} />
    </div>
  );
}

// ─── Progress Bar ───────────────────────────────────────────────────────────

interface ProgressBarProps {
  stats: CompletionStats;
}

function ProgressBar({ stats }: ProgressBarProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {stats.completionPercentage}% Complete
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {stats.estimatedRemainingSeconds > 0
            ? `~${formatTime(stats.estimatedRemainingSeconds)} remaining`
            : 'Done'}
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
        role="progressbar"
        aria-valuenow={stats.completionPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Training progress: ${stats.completionPercentage}% complete`}
      >
        <div
          style={{
            width: `${stats.completionPercentage}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--accent), #00d4ff)',
            borderRadius: '4px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {stats.completedCount} completed
        </span>
        {stats.skippedCount > 0 && (
          <span style={{ fontSize: '0.7rem', color: '#ff9800' }}>
            {stats.skippedCount} skipped
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Current Exercise Card ──────────────────────────────────────────────────

interface CurrentExerciseCardProps {
  entry: PlanExerciseEntry;
  exercise: { id: string; name: string; description: string; category: string; difficulty: number; duration: number };
  exerciseIndex: number;
  onDurationChange: (exerciseIndex: number, duration: number) => void;
  onStart: () => void;
  onSkip: () => void;
}

function CurrentExerciseCard({
  entry,
  exercise,
  exerciseIndex,
  onDurationChange,
  onStart,
  onSkip,
}: CurrentExerciseCardProps) {
  const effectiveDuration = entry.durationOverride ?? exercise.duration;

  const handleDurationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && isValidDuration(value)) {
      onDurationChange(exerciseIndex, value);
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--accent)',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
            Now Playing
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>
            {exercise.name}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            {exercise.description}
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>{exercise.category}</span>
          </div>
        </div>
      </div>

      {/* Duration Config (Req 14.5: 15–180 seconds, 1-second increments) */}
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <label
          htmlFor="duration-input"
          style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
        >
          Duration:
        </label>
        <input
          id="duration-input"
          type="number"
          min={15}
          max={180}
          step={1}
          value={effectiveDuration}
          onChange={handleDurationInput}
          aria-label="Exercise duration in seconds (15 to 180)"
          style={{
            width: '70px',
            padding: '6px 8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            textAlign: 'center',
          }}
        />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>seconds</span>
        <input
          type="range"
          min={15}
          max={180}
          step={1}
          value={effectiveDuration}
          onChange={handleDurationInput}
          aria-label="Exercise duration slider"
          style={{ flex: 1, minWidth: '100px' }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
        <button
          onClick={onStart}
          aria-label={`Start ${exercise.name}`}
          style={{
            flex: 1,
            padding: '12px',
            background: 'var(--primary)',
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
        >
          Start Exercise
        </button>
        <button
          onClick={onSkip}
          aria-label={`Skip ${exercise.name}`}
          style={{
            padding: '12px 20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.12)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.08)'; }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}

// ─── Exercise Queue ─────────────────────────────────────────────────────────

interface ExerciseQueueProps {
  exercises: PlanExerciseEntry[];
  currentIndex: number;
}

function ExerciseQueue({ exercises, currentIndex }: ExerciseQueueProps) {
  return (
    <div>
      <h3 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '10px' }}>
        Exercise Queue
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {exercises.map((entry, index) => {
          const exerciseDef = getExerciseById(entry.exerciseId);
          const isActive = index === currentIndex && entry.status === 'active';

          const statusStyles: Record<string, { color: string; icon: string }> = {
            completed: { color: '#4caf50', icon: '✓' },
            skipped: { color: '#ff9800', icon: '—' },
            active: { color: 'var(--accent)', icon: '▶' },
            pending: { color: 'var(--text-muted)', icon: '○' },
          };

          const { color, icon } = statusStyles[entry.status] ?? statusStyles.pending;

          return (
            <div
              key={`${entry.exerciseId}-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                background: isActive ? 'rgba(0, 243, 255, 0.05)' : 'transparent',
                borderRadius: '6px',
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
              }}
            >
              <span style={{ color, fontSize: '0.85rem', width: '16px', textAlign: 'center' }}>
                {icon}
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: '0.8rem',
                  color: entry.status === 'completed' || entry.status === 'skipped'
                    ? 'var(--text-muted)'
                    : 'var(--text-main)',
                  textDecoration: entry.status === 'skipped' ? 'line-through' : 'none',
                }}
              >
                {exerciseDef?.name ?? entry.exerciseId}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {entry.durationOverride
                  ? `${entry.durationOverride}s`
                  : exerciseDef
                  ? `${exerciseDef.duration}s`
                  : ''}
              </span>
              {entry.status === 'completed' && entry.score !== undefined && (
                <span style={{ fontSize: '0.7rem', color: '#4caf50', fontWeight: 600 }}>
                  {entry.score}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
