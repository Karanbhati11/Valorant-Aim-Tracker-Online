/**
 * Blog category system.
 * Each blog post is assigned exactly one category.
 *
 * Requirements: 9.6
 */

export type BlogCategorySlug =
  | 'training-guides'
  | 'game-specific-tips'
  | 'settings-optimization'
  | 'pro-player-analysis';

export interface BlogCategory {
  /** URL-friendly slug */
  slug: BlogCategorySlug;
  /** Display name */
  name: string;
  /** Description for category listing pages and meta descriptions */
  description: string;
}

/**
 * All available blog categories.
 * Each post must be assigned exactly one of these categories.
 */
export const BLOG_CATEGORIES: Record<BlogCategorySlug, BlogCategory> = {
  'training-guides': {
    slug: 'training-guides',
    name: 'Training Guides',
    description:
      'Step-by-step aim training routines, practice plans, and improvement strategies for FPS players of all skill levels.',
  },
  'game-specific-tips': {
    slug: 'game-specific-tips',
    name: 'Game-Specific Tips',
    description:
      'Targeted aim advice and techniques for specific FPS titles including Valorant, CS2, Apex Legends, and Fortnite.',
  },
  'settings-optimization': {
    slug: 'settings-optimization',
    name: 'Settings Optimization',
    description:
      'Guides on sensitivity, DPI, crosshair design, mouse settings, and hardware configuration for optimal FPS performance.',
  },
  'pro-player-analysis': {
    slug: 'pro-player-analysis',
    name: 'Pro Player Analysis',
    description:
      'Breakdowns of professional FPS player settings, routines, techniques, and what makes their aim effective.',
  },
};

/**
 * Get a blog category by its slug.
 */
export function getCategoryBySlug(slug: string): BlogCategory | undefined {
  return BLOG_CATEGORIES[slug as BlogCategorySlug];
}

/**
 * Get all blog categories as an array.
 */
export function getAllCategories(): BlogCategory[] {
  return Object.values(BLOG_CATEGORIES);
}

/**
 * Infer the most appropriate category for a blog post based on its title and content.
 * Used as a fallback when no explicit category is assigned.
 */
export function inferCategory(title: string, content: string): BlogCategorySlug {
  const text = `${title} ${content}`.toLowerCase();

  // Check for pro player analysis indicators
  if (
    text.includes('pro player') ||
    text.includes('pro settings') ||
    text.includes('pro routine') ||
    (text.includes('pro') && (text.includes('analysis') || text.includes('breakdown')))
  ) {
    return 'pro-player-analysis';
  }

  // Check for settings/optimization indicators
  if (
    text.includes('sensitivity') ||
    text.includes('dpi') ||
    text.includes('edpi') ||
    text.includes('crosshair') ||
    text.includes('mouse settings') ||
    text.includes('polling rate')
  ) {
    return 'settings-optimization';
  }

  // Check for game-specific indicators
  if (
    text.includes('valorant') ||
    text.includes('cs2') ||
    text.includes('counter-strike') ||
    text.includes('apex legends') ||
    text.includes('fortnite') ||
    text.includes('overwatch')
  ) {
    return 'game-specific-tips';
  }

  // Default to training guides
  return 'training-guides';
}
