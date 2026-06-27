'use client';

import React, { useState, useEffect } from 'react';
import { PlayerTier, TIER_THRESHOLDS } from '@/lib/progression/types';
import { getPlayerTier } from '@/lib/progression/skill-rating';

/**
 * Color mapping for each player tier.
 */
const TIER_COLORS: Record<PlayerTier, string> = {
  Iron: '#6b7280',
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#ffd700',
  Platinum: '#00cec9',
  Diamond: '#6c5ce7',
  Immortal: '#e84393',
  Radiant: '#fdcb6e',
};

export interface ProgressionDisplayProps {
  /** The player's current skill rating (0–5000) */
  skillRating: number;
  /** Whether to show a personal best notification */
  showPersonalBest?: boolean;
  /** The exercise name for the personal best notification */
  personalBestExercise?: string;
  /** Callback when the personal best notification expires */
  onPersonalBestDismiss?: () => void;
}

/**
 * Displays the player's skill rating, current tier, and tier progress bar.
 * Also shows a personal best notification (5-second display) when a new
 * high score is achieved.
 *
 * Validates: Requirements 5.5, 5.7
 */
export function ProgressionDisplay({
  skillRating,
  showPersonalBest = false,
  personalBestExercise,
  onPersonalBestDismiss,
}: ProgressionDisplayProps) {
  const [personalBestVisible, setPersonalBestVisible] = useState(false);

  const tier = getPlayerTier(skillRating);
  const [tierMin, tierMax] = TIER_THRESHOLDS[tier];
  const tierRange = tierMax - tierMin;
  const progressInTier = skillRating - tierMin;
  const progressPercent = tierRange > 0 ? Math.min(100, Math.max(0, (progressInTier / tierRange) * 100)) : 100;
  const tierColor = TIER_COLORS[tier];

  // Handle personal best notification (5-second display)
  useEffect(() => {
    if (showPersonalBest) {
      setPersonalBestVisible(true);
      const timer = setTimeout(() => {
        setPersonalBestVisible(false);
        onPersonalBestDismiss?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showPersonalBest, onPersonalBestDismiss]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Personal Best Notification */}
      {personalBestVisible && (
        <div
          className="absolute -top-16 left-0 right-0 flex items-center justify-center animate-bounce"
          role="alert"
          aria-live="polite"
        >
          <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-300 px-4 py-2 rounded-lg text-sm font-semibold">
            🏆 New Personal Best{personalBestExercise ? ` — ${personalBestExercise}` : ''}!
          </div>
        </div>
      )}

      {/* Skill Rating and Tier */}
      <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Skill Rating</p>
            <p className="text-2xl font-bold text-white">{skillRating}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Tier</p>
            <p
              className="text-2xl font-bold"
              style={{ color: tierColor }}
            >
              {tier}
            </p>
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{tierMin}</span>
            <span>{tierMax}</span>
          </div>
          <div
            className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700"
            role="progressbar"
            aria-valuenow={skillRating}
            aria-valuemin={tierMin}
            aria-valuemax={tierMax}
            aria-label={`Tier progress: ${Math.round(progressPercent)}%`}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: tierColor,
                boxShadow: `0 0 8px ${tierColor}40`,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            {progressInTier} / {tierRange} to next tier
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProgressionDisplay;
