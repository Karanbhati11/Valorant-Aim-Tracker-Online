/**
 * Content system type definitions.
 * Defines landing page and blog post schema interfaces.
 */

import { ExerciseCategory } from '@/lib/exercises/types';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface AuthorProfile {
  name: string;
  slug: string;
  bio?: string;
  profileUrl: string;
}

export interface InternalLink {
  text: string;
  href: string;
  title?: string;
}

export interface TOCEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface LandingPage {
  slug: string;
  title: string;
  targetKeyword: string;
  game?: string;
  category?: ExerciseCategory;
  content: string;
  faqItems: FAQItem[];
  linkedExercises: string[];
  linkedBlogPosts: string[];
  embeddedExercise: string;
}

export interface BlogPostSchema {
  slug: string;
  title: string;
  content: string;
  wordCount: number;
  category: 'training-guides' | 'game-specific-tips' | 'settings-optimization' | 'pro-player-analysis';
  author: AuthorProfile;
  publishedAt: string;
  internalLinks: InternalLink[];
  embeddedExercises?: string[];
  tableOfContents?: TOCEntry[];
}
