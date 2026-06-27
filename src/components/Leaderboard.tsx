'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  VALID_TIMEFRAMES,
  VALID_EXERCISE_IDS,
  type LeaderboardTimeframe,
} from '@/lib/leaderboard/constants';

/** Shape of a single leaderboard entry from the API */
interface LeaderboardEntry {
  position: number;
  name: string;
  score: number;
  accuracy: number | null;
}

/** Shape of the API response */
interface LeaderboardResponse {
  exerciseId: string;
  timeframe: LeaderboardTimeframe;
  entries: LeaderboardEntry[];
  total: number;
  error?: string;
}

/** Human-readable labels for exercise IDs */
const EXERCISE_LABELS: Record<string, string> = {
  static_grid: 'Static Grid',
  micro_adjust: 'Micro Adjustments',
  pop_up_reflex: 'Pop-Up Reflex',
  strafe_track: 'Strafe Tracking',
  dynamic_flicks: 'Dynamic Flicks',
};

/** Human-readable labels for timeframes */
const TIMEFRAME_LABELS: Record<LeaderboardTimeframe, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  'all-time': 'All Time',
};

export default function Leaderboard() {
  const [exerciseId, setExerciseId] = useState<string>(VALID_EXERCISE_IDS[0]);
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('all-time');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/leaderboard/get?exerciseId=${encodeURIComponent(exerciseId)}&timeframe=${encodeURIComponent(timeframe)}`
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch leaderboard (${res.status})`);
      }

      const data: LeaderboardResponse = await res.json();

      if (data.error) {
        setError(data.error);
        setEntries([]);
      } else {
        setEntries(data.entries);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [exerciseId, timeframe]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="leaderboard-container">
      {/* Header */}
      <div className="leaderboard-header">
        <h2 className="leaderboard-title">Leaderboard</h2>
        <p className="leaderboard-subtitle">Top 100 players per exercise</p>
      </div>

      {/* Timeframe Tabs */}
      <div className="leaderboard-tabs" role="tablist" aria-label="Leaderboard timeframe">
        {VALID_TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            role="tab"
            aria-selected={timeframe === tf}
            className={`leaderboard-tab ${timeframe === tf ? 'leaderboard-tab--active' : ''}`}
            onClick={() => setTimeframe(tf)}
          >
            {TIMEFRAME_LABELS[tf]}
          </button>
        ))}
      </div>

      {/* Exercise Selector */}
      <div className="leaderboard-filter">
        <label htmlFor="exercise-select" className="leaderboard-filter-label">
          Exercise:
        </label>
        <select
          id="exercise-select"
          className="leaderboard-select"
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
        >
          {VALID_EXERCISE_IDS.map((id) => (
            <option key={id} value={id}>
              {EXERCISE_LABELS[id] || id}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="leaderboard-content" role="tabpanel">
        {loading && (
          <div className="leaderboard-loading">
            <div className="leaderboard-spinner" aria-label="Loading" />
            <span>Loading leaderboard...</span>
          </div>
        )}

        {error && !loading && (
          <div className="leaderboard-error">
            <p>{error}</p>
            <button className="leaderboard-retry-btn" onClick={fetchLeaderboard}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div className="leaderboard-empty">
            <p>No scores yet for {EXERCISE_LABELS[exerciseId] || exerciseId} ({TIMEFRAME_LABELS[timeframe]}).</p>
            <p className="leaderboard-empty-hint">Complete the exercise to appear on the leaderboard!</p>
          </div>
        )}

        {!loading && !error && entries.length > 0 && (
          <div className="leaderboard-table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th className="leaderboard-th leaderboard-th--rank">Rank</th>
                  <th className="leaderboard-th leaderboard-th--name">Player</th>
                  <th className="leaderboard-th leaderboard-th--score">Score</th>
                  <th className="leaderboard-th leaderboard-th--accuracy">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={`${entry.position}-${entry.name}`}
                    className={`leaderboard-row ${entry.position <= 3 ? 'leaderboard-row--top' : ''}`}
                  >
                    <td className="leaderboard-td leaderboard-td--rank">
                      <span className="leaderboard-rank">
                        {entry.position <= 3 && (
                          <span className="leaderboard-medal">
                            {entry.position === 1 && '🥇'}
                            {entry.position === 2 && '🥈'}
                            {entry.position === 3 && '🥉'}
                          </span>
                        )}
                        {entry.position}
                      </span>
                    </td>
                    <td className="leaderboard-td leaderboard-td--name">
                      {entry.name}
                    </td>
                    <td className="leaderboard-td leaderboard-td--score">
                      {entry.score.toLocaleString()}
                    </td>
                    <td className="leaderboard-td leaderboard-td--accuracy">
                      {entry.accuracy != null ? `${entry.accuracy}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .leaderboard-container {
          max-width: 700px;
          margin: 0 auto;
          background: var(--bg-panel, rgba(20, 25, 35, 0.95));
          border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
          border-radius: 8px;
          overflow: hidden;
        }

        .leaderboard-header {
          padding: 24px 24px 16px;
          text-align: center;
        }

        .leaderboard-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--accent, #00f3ff);
        }

        .leaderboard-subtitle {
          margin: 4px 0 0;
          font-size: 0.8rem;
          color: var(--text-muted, #8b9bb4);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .leaderboard-tabs {
          display: flex;
          border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.08));
          padding: 0 16px;
        }

        .leaderboard-tab {
          flex: 1;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          color: var(--text-muted, #8b9bb4);
          padding: 12px 16px;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .leaderboard-tab:hover {
          color: white;
        }

        .leaderboard-tab--active {
          color: var(--accent, #00f3ff);
          border-bottom-color: var(--accent, #00f3ff);
        }

        .leaderboard-filter {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        }

        .leaderboard-filter-label {
          font-size: 0.8rem;
          color: var(--text-muted, #8b9bb4);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
          white-space: nowrap;
        }

        .leaderboard-select {
          flex: 1;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
          color: white;
          padding: 8px 12px;
          font-size: 0.9rem;
          border-radius: 4px;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .leaderboard-select:focus {
          border-color: var(--accent, #00f3ff);
          outline: none;
          box-shadow: 0 0 10px rgba(0, 243, 255, 0.15);
        }

        .leaderboard-select option {
          background: var(--bg-dark, #0f1217);
          color: white;
        }

        .leaderboard-content {
          padding: 16px 24px 24px;
          min-height: 200px;
        }

        .leaderboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 48px 0;
          color: var(--text-muted, #8b9bb4);
          font-size: 0.9rem;
        }

        .leaderboard-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid var(--border, rgba(255, 255, 255, 0.08));
          border-top-color: var(--accent, #00f3ff);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .leaderboard-error {
          text-align: center;
          padding: 32px 0;
          color: var(--primary, #ff4655);
        }

        .leaderboard-error p {
          margin: 0 0 12px;
        }

        .leaderboard-retry-btn {
          background: rgba(255, 70, 85, 0.1);
          border: 1px solid var(--primary, #ff4655);
          color: var(--primary, #ff4655);
          padding: 8px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.8rem;
          transition: all 0.2s;
        }

        .leaderboard-retry-btn:hover {
          background: var(--primary, #ff4655);
          color: white;
        }

        .leaderboard-empty {
          text-align: center;
          padding: 40px 16px;
          color: var(--text-muted, #8b9bb4);
        }

        .leaderboard-empty p {
          margin: 0 0 8px;
        }

        .leaderboard-empty-hint {
          font-size: 0.85rem;
          opacity: 0.7;
        }

        .leaderboard-table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .leaderboard-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .leaderboard-th {
          text-align: left;
          padding: 10px 8px;
          font-size: 0.75rem;
          color: var(--accent, #00f3ff);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
          border-bottom: 2px solid var(--accent, #00f3ff);
          white-space: nowrap;
        }

        .leaderboard-th--rank {
          width: 70px;
        }

        .leaderboard-th--score,
        .leaderboard-th--accuracy {
          text-align: right;
        }

        .leaderboard-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          transition: background 0.15s;
        }

        .leaderboard-row:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .leaderboard-row--top {
          background: rgba(0, 243, 255, 0.03);
        }

        .leaderboard-td {
          padding: 10px 8px;
          color: white;
        }

        .leaderboard-td--rank {
          font-weight: 700;
          color: var(--accent, #00f3ff);
        }

        .leaderboard-td--name {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .leaderboard-td--score {
          text-align: right;
          font-weight: 700;
          color: var(--accent, #00f3ff);
          font-variant-numeric: tabular-nums;
        }

        .leaderboard-td--accuracy {
          text-align: right;
          color: var(--text-muted, #8b9bb4);
          font-variant-numeric: tabular-nums;
        }

        .leaderboard-rank {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .leaderboard-medal {
          font-size: 1rem;
        }

        /* Mobile responsive */
        @media (max-width: 600px) {
          .leaderboard-header {
            padding: 16px 16px 12px;
          }

          .leaderboard-title {
            font-size: 1.2rem;
          }

          .leaderboard-tabs {
            padding: 0 8px;
          }

          .leaderboard-tab {
            padding: 10px 8px;
            font-size: 0.75rem;
          }

          .leaderboard-filter {
            padding: 12px 16px;
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .leaderboard-content {
            padding: 12px 16px 16px;
          }

          .leaderboard-table {
            font-size: 0.8rem;
          }

          .leaderboard-th,
          .leaderboard-td {
            padding: 8px 6px;
          }

          .leaderboard-td--name {
            max-width: 120px;
          }
        }
      `}</style>
    </div>
  );
}
