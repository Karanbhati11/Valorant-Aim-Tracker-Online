'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PromotionEvent,
  buildShareMessage,
  buildShareUrl,
} from '@/lib/leaderboard/promotion-detection';

interface LeaderboardPromotionShareProps {
  /** The promotion event to display. Null means no promotion to show. */
  promotion: PromotionEvent | null;
  /** Duration in ms to show the prompt (default 8000ms). */
  displayDuration?: number;
  /** Callback when the prompt is dismissed (auto or manual). */
  onDismiss?: () => void;
}

/**
 * Displays a non-blocking, auto-dismissing share prompt when a player
 * enters the top 10 or moves up a tier on the leaderboard.
 *
 * Requirements: 12.4
 * - Appears briefly (5-10 seconds) after the event without blocking gameplay
 * - Provides one-click share with player name, tier, exercise name, and score
 * - Generates a URL that includes the share card image for OG previews
 */
export default function LeaderboardPromotionShare({
  promotion,
  displayDuration = 8000,
  onDismiss,
}: LeaderboardPromotionShareProps) {
  const [visible, setVisible] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);

  const dismiss = useCallback(() => {
    setAnimatingOut(true);
    setTimeout(() => {
      setVisible(false);
      setAnimatingOut(false);
      onDismiss?.();
    }, 300);
  }, [onDismiss]);

  useEffect(() => {
    if (!promotion) {
      setVisible(false);
      return;
    }

    setVisible(true);
    setAnimatingOut(false);

    const timer = setTimeout(() => {
      dismiss();
    }, displayDuration);

    return () => clearTimeout(timer);
  }, [promotion, displayDuration, dismiss]);

  const handleShare = useCallback(async () => {
    if (!promotion) return;

    const message = buildShareMessage(promotion);
    const url = buildShareUrl(promotion);

    // Use Web Share API if available, otherwise copy to clipboard
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `AimTrainerPro - ${promotion.exerciseName} Leaderboard`,
          text: message,
          url,
        });
      } catch {
        // User cancelled share or API unavailable - fall back to clipboard
        await copyToClipboard(message + '\n' + url);
      }
    } else {
      await copyToClipboard(message + '\n' + url);
    }
  }, [promotion]);

  const handleShareTwitter = useCallback(() => {
    if (!promotion) return;
    const message = buildShareMessage(promotion);
    const url = buildShareUrl(promotion);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=550,height=420');
  }, [promotion]);

  if (!visible || !promotion) {
    return null;
  }

  const tierLabel = promotion.newTier === 'top3'
    ? `#${promotion.newPosition}`
    : `Top ${promotion.newPosition}`;

  return (
    <div
      className={`promotion-share ${animatingOut ? 'promotion-share--out' : 'promotion-share--in'}`}
      role="alert"
      aria-live="polite"
    >
      <div className="promotion-share__content">
        <div className="promotion-share__icon">🏆</div>
        <div className="promotion-share__info">
          <p className="promotion-share__title">
            {promotion.newTier === 'top3' ? 'Podium Finish!' : 'Top 10!'}
          </p>
          <p className="promotion-share__detail">
            <strong>{promotion.playerName}</strong> reached{' '}
            <span className="promotion-share__tier">{tierLabel}</span> on{' '}
            <span className="promotion-share__exercise">{promotion.exerciseName}</span>{' '}
            with <span className="promotion-share__score">{promotion.score.toLocaleString()}</span> pts
          </p>
        </div>
        <div className="promotion-share__actions">
          <button
            className="promotion-share__btn promotion-share__btn--share"
            onClick={handleShare}
            aria-label="Share your achievement"
            title="Share"
          >
            📤 Share
          </button>
          <button
            className="promotion-share__btn promotion-share__btn--twitter"
            onClick={handleShareTwitter}
            aria-label="Share on Twitter"
            title="Share on Twitter"
          >
            𝕏
          </button>
          <button
            className="promotion-share__btn promotion-share__btn--close"
            onClick={dismiss}
            aria-label="Dismiss"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>

      <style jsx>{`
        .promotion-share {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          max-width: 440px;
          width: calc(100vw - 48px);
          pointer-events: auto;
        }

        .promotion-share--in {
          animation: slideInUp 0.3s ease-out forwards;
        }

        .promotion-share--out {
          animation: slideOutDown 0.3s ease-in forwards;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideOutDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(20px);
          }
        }

        .promotion-share__content {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: linear-gradient(135deg, rgba(20, 25, 35, 0.98), rgba(30, 35, 50, 0.98));
          border: 1px solid var(--accent, #00f3ff);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 243, 255, 0.15), 0 4px 16px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
        }

        .promotion-share__icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .promotion-share__info {
          flex: 1;
          min-width: 0;
        }

        .promotion-share__title {
          margin: 0 0 4px;
          font-size: 0.9rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--accent, #00f3ff);
        }

        .promotion-share__detail {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-muted, #8b9bb4);
          line-height: 1.4;
        }

        .promotion-share__tier {
          color: var(--primary, #ff4655);
          font-weight: 700;
        }

        .promotion-share__exercise {
          color: white;
          font-weight: 600;
        }

        .promotion-share__score {
          color: var(--accent, #00f3ff);
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .promotion-share__actions {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }

        .promotion-share__btn {
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.75rem;
          transition: all 0.2s ease;
          min-width: 44px;
          min-height: 44px;
          padding: 8px 12px;
        }

        .promotion-share__btn--share {
          background: var(--accent, #00f3ff);
          color: #0f1217;
        }

        .promotion-share__btn--share:hover {
          background: #33f5ff;
          transform: scale(1.05);
        }

        .promotion-share__btn--twitter {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1rem;
          font-weight: 900;
        }

        .promotion-share__btn--twitter:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .promotion-share__btn--close {
          background: transparent;
          color: var(--text-muted, #8b9bb4);
          font-size: 0.9rem;
          min-width: 32px;
          padding: 4px 8px;
        }

        .promotion-share__btn--close:hover {
          color: white;
        }

        @media (max-width: 480px) {
          .promotion-share {
            bottom: 16px;
            right: 16px;
            left: 16px;
            max-width: none;
            width: auto;
          }

          .promotion-share__content {
            flex-wrap: wrap;
            gap: 8px;
            padding: 12px;
          }

          .promotion-share__actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Copy text to clipboard with fallback for older browsers.
 */
async function copyToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  } catch {
    // Silently fail - not critical
  }
}
