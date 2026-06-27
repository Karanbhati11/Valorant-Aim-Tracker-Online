/**
 * Blog author profiles with Schema.org Person markup.
 * Provides author data for blog posts and structured data generation.
 *
 * Requirements: 9.5
 */

import { StructuredDataBlock } from '@/lib/seo/types';

const SITE_URL = 'https://aimtrainerpro.online';

export interface AuthorProfile {
  /** Unique identifier for the author */
  id: string;
  /** Display name */
  name: string;
  /** URL-friendly slug for the author's profile page */
  slug: string;
  /** Short biography */
  bio: string;
  /** URL to the author's profile page on the site */
  profileUrl: string;
  /** URL to the author's avatar image */
  avatarUrl?: string;
  /** External social links */
  socials?: {
    twitter?: string;
    youtube?: string;
    twitch?: string;
  };
}

/**
 * Registered author profiles.
 */
export const AUTHORS: Record<string, AuthorProfile> = {
  'aim-pro-coach': {
    id: 'aim-pro-coach',
    name: 'Aim Pro Coach',
    slug: 'aim-pro-coach',
    bio: 'Professional FPS aim coach specializing in Valorant, CS2, and Apex Legends. Helps players build consistent mechanics through structured training routines.',
    profileUrl: `${SITE_URL}/blog/authors/aim-pro-coach`,
    avatarUrl: '/assets/favicon.png',
    socials: {
      twitter: 'https://twitter.com/aimtrainerpro',
    },
  },
  'system-admin': {
    id: 'system-admin',
    name: 'System Admin',
    slug: 'system-admin',
    bio: 'Technical writer covering aim trainer performance, hardware optimization, and browser-based gaming technology.',
    profileUrl: `${SITE_URL}/blog/authors/system-admin`,
    avatarUrl: '/assets/favicon.png',
  },
  'pro-analyst': {
    id: 'pro-analyst',
    name: 'Pro Analyst',
    slug: 'pro-analyst',
    bio: 'Esports analyst focused on pro player settings, meta strategies, and competitive FPS performance breakdowns.',
    profileUrl: `${SITE_URL}/blog/authors/pro-analyst`,
    avatarUrl: '/assets/favicon.png',
    socials: {
      twitter: 'https://twitter.com/aimtrainerpro',
      youtube: 'https://youtube.com/@aimtrainerpro',
    },
  },
  'settings-guru': {
    id: 'settings-guru',
    name: 'Settings Guru',
    slug: 'settings-guru',
    bio: 'Sensitivity and settings expert. Specializes in DPI optimization, crosshair design, and hardware configuration for competitive FPS players.',
    profileUrl: `${SITE_URL}/blog/authors/settings-guru`,
    avatarUrl: '/assets/favicon.png',
  },
  'valorant-coach': {
    id: 'valorant-coach',
    name: 'Valorant Coach',
    slug: 'valorant-coach',
    bio: 'Dedicated Valorant aim coach focused on crosshair placement, micro-corrections, and duel consistency for competitive ranked play.',
    profileUrl: `${SITE_URL}/blog/authors/valorant-coach`,
    avatarUrl: '/assets/favicon.png',
    socials: {
      twitter: 'https://twitter.com/aimtrainerpro',
    },
  },
  'cs2-coach': {
    id: 'cs2-coach',
    name: 'CS2 Coach',
    slug: 'cs2-coach',
    bio: 'Counter-Strike 2 training specialist. Covers first-bullet precision, angle discipline, and spray transfer for Premier and Faceit players.',
    profileUrl: `${SITE_URL}/blog/authors/cs2-coach`,
    avatarUrl: '/assets/favicon.png',
    socials: {
      twitter: 'https://twitter.com/aimtrainerpro',
    },
  },
  'fps-training-team': {
    id: 'fps-training-team',
    name: 'FPS Training Team',
    slug: 'fps-training-team',
    bio: 'The AimTrainerPro editorial team. Creates general FPS training content, hardware guides, and comparison articles for players across all titles.',
    profileUrl: `${SITE_URL}/blog/authors/fps-training-team`,
    avatarUrl: '/assets/favicon.png',
    socials: {
      twitter: 'https://twitter.com/aimtrainerpro',
      youtube: 'https://youtube.com/@aimtrainerpro',
    },
  },
};

/**
 * Look up an author profile by name (case-insensitive match).
 * Falls back to a default profile if not found.
 */
export function getAuthorByName(name: string): AuthorProfile {
  const normalized = name.toLowerCase().replace(/\s+/g, '-');
  const author = AUTHORS[normalized];
  if (author) return author;

  // Fallback: create a minimal profile from the name
  const slug = normalized;
  return {
    id: slug,
    name,
    slug,
    bio: `Contributing writer at AimTrainerPro.`,
    profileUrl: `${SITE_URL}/blog/authors/${slug}`,
    avatarUrl: '/assets/favicon.png',
  };
}

/**
 * Get an author profile by their unique ID.
 */
export function getAuthorById(id: string): AuthorProfile | undefined {
  return AUTHORS[id];
}

/**
 * Get all registered authors.
 */
export function getAllAuthors(): AuthorProfile[] {
  return Object.values(AUTHORS);
}

/**
 * Generate Schema.org Person structured data for an author.
 * Used in blog post pages to provide rich author information to search engines.
 *
 * Requirements: 9.5
 */
export function generateAuthorPersonSchema(author: AuthorProfile): StructuredDataBlock {
  const sameAs: string[] = [];
  if (author.socials?.twitter) sameAs.push(author.socials.twitter);
  if (author.socials?.youtube) sameAs.push(author.socials.youtube);
  if (author.socials?.twitch) sameAs.push(author.socials.twitch);

  return {
    type: 'Person',
    data: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: author.name,
      url: author.profileUrl,
      description: author.bio,
      image: author.avatarUrl
        ? (author.avatarUrl.startsWith('http') ? author.avatarUrl : `${SITE_URL}${author.avatarUrl}`)
        : undefined,
      sameAs: sameAs.length > 0 ? sameAs : undefined,
    },
  };
}
