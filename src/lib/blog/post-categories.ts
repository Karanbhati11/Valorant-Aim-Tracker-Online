/**
 * Explicit blog post category assignments.
 * Each post is assigned exactly one category as required by Requirement 9.6.
 *
 * Categories:
 * - training-guides: Step-by-step routines, practice plans, improvement strategies
 * - game-specific-tips: Targeted advice for specific FPS titles
 * - settings-optimization: Sensitivity, DPI, crosshair, hardware configuration
 * - pro-player-analysis: Pro player settings, routines, and performance breakdowns
 *
 * Requirements: 9.6
 */

import type { BlogCategorySlug } from './categories';

/**
 * Maps blog post IDs to their assigned category.
 * Each post must have exactly one category.
 */
export const POST_CATEGORY_MAP: Record<string, BlogCategorySlug> = {
  // Training Guides
  'fps-aim-routine-2025': 'training-guides',
  'improve-aim-fps-complete-guide-2026': 'training-guides',
  'best-aim-training-routine-daily-plan': 'training-guides',
  'flick-aim-vs-tracking-aim-guide': 'training-guides',
  'how-long-does-it-take-to-improve-aim-fps': 'training-guides',
  'aim-trainer-vs-real-game-practice': 'training-guides',
  'free-browser-aim-trainer-for-beginners': 'training-guides',
  'ten-best-aim-training-drills-accuracy-fast': 'training-guides',
  'best-free-aim-trainers-online-2026': 'training-guides',

  // Game-Specific Tips
  'best-aim-training-for-valorant': 'game-specific-tips',
  'how-to-improve-aim-valorant-fast': 'game-specific-tips',
  'best-aim-training-for-cs2': 'game-specific-tips',
  'best-aim-training-for-fortnite': 'game-specific-tips',
  'browser-aim-trainer-benefits-low-end-pc': 'game-specific-tips',

  // Settings Optimization
  'sensitivity-guide-edpi-calculator': 'settings-optimization',
  'best-sensitivity-settings-valorant-guide': 'settings-optimization',
  'best-crosshair-settings-valorant-guide': 'settings-optimization',
  'best-sensitivity-settings-cs2-guide': 'settings-optimization',
  'best-dpi-settings-fps-games': 'settings-optimization',
  'low-vs-high-sensitivity-fps': 'settings-optimization',
};

/**
 * Get the explicit category for a blog post by ID.
 * Returns undefined if the post has no explicit category assignment.
 */
export function getPostCategory(postId: string): BlogCategorySlug | undefined {
  return POST_CATEGORY_MAP[postId];
}

/**
 * Get all post IDs assigned to a specific category.
 */
export function getPostsByCategory(category: BlogCategorySlug): string[] {
  return Object.entries(POST_CATEGORY_MAP)
    .filter(([, cat]) => cat === category)
    .map(([id]) => id);
}

/**
 * Check if a post has an explicit category assignment.
 */
export function hasExplicitCategory(postId: string): boolean {
  return postId in POST_CATEGORY_MAP;
}
