/**
 * Offline score queue for PWA support.
 * Queues exercise scores when offline (max 50) and flushes them chronologically
 * when connectivity is restored, retrying up to 3 times before discarding.
 *
 * Requirements: 11.3, 11.6
 */

import { ExerciseResult } from '@/lib/exercises/types';

const QUEUE_KEY = 'offline_score_queue';
const MAX_QUEUE_SIZE = 50;
const MAX_RETRY_COUNT = 3;
const FLUSH_TIMEOUT_MS = 30_000;
const SUBMIT_ENDPOINT = '/api/leaderboard/post';

export interface QueuedScore {
  exerciseId: string;
  result: ExerciseResult;
  queuedAt: string;
  retryCount: number;
}

/**
 * Retrieves the current offline queue from localStorage.
 */
export function getOfflineQueue(): QueuedScore[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as QueuedScore[];
  } catch {
    return [];
  }
}

/**
 * Saves the queue to localStorage.
 */
function saveQueue(queue: QueuedScore[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

/**
 * Queues an exercise score for later submission.
 * Returns false if the queue is full (50 items max).
 *
 * Requirement 11.3: Queue the score in local storage (up to max 50 pending scores).
 */
export function queueOfflineScore(result: ExerciseResult): boolean {
  const queue = getOfflineQueue();

  if (queue.length >= MAX_QUEUE_SIZE) {
    return false;
  }

  const queuedScore: QueuedScore = {
    exerciseId: result.exerciseId,
    result,
    queuedAt: new Date().toISOString(),
    retryCount: 0,
  };

  queue.push(queuedScore);
  saveQueue(queue);
  return true;
}

/**
 * Submits a single queued score to the leaderboard API.
 * Returns true on success (2xx response), false otherwise.
 */
async function submitScore(entry: QueuedScore): Promise<boolean> {
  try {
    const response = await fetch(SUBMIT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exerciseId: entry.exerciseId,
        score: entry.result.score,
        name: 'Anonymous',
        accuracy: entry.result.accuracy,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Flushes the offline queue by submitting scores in chronological order.
 * Must complete within 30 seconds. Retries each failed submission up to 3 times
 * before discarding it.
 *
 * Requirement 11.6: Submit all queued offline scores in chronological order
 * within 30 seconds, retrying each failed submission up to 3 times before discarding.
 */
export async function flushOfflineQueue(): Promise<void> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  // Sort chronologically by queuedAt (oldest first)
  queue.sort(
    (a, b) => new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime()
  );

  const startTime = Date.now();
  const remaining: QueuedScore[] = [];

  for (const item of queue) {
    // Enforce 30-second flush window
    if (Date.now() - startTime >= FLUSH_TIMEOUT_MS) {
      remaining.push(item);
      continue;
    }

    // Retry each item up to MAX_RETRY_COUNT times within this flush
    let success = false;
    let attempts = item.retryCount;

    while (attempts < MAX_RETRY_COUNT) {
      if (Date.now() - startTime >= FLUSH_TIMEOUT_MS) break;

      success = await submitScore(item);
      attempts++;

      if (success) break;
    }

    if (success) {
      // Successfully submitted — remove from queue
      continue;
    }

    // All retries exhausted — discard
    // (item has been attempted MAX_RETRY_COUNT times total)
    if (attempts >= MAX_RETRY_COUNT) {
      continue;
    }

    // Timed out before completing retries — keep for next flush
    item.retryCount = attempts;
    remaining.push(item);
  }

  saveQueue(remaining);
}
