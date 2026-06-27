/**
 * InternalLink component for contextual internal links within blog post bodies.
 * Generates 2–5 internal links pointing to exercise pages or guide pages
 * that share at least one category or tag with the blog post.
 *
 * Requirements: 18.2
 */

import React from "react";
import Link from "next/link";
import { getAllExercises } from "@/lib/exercises/registry";
import { getAllBlogPosts } from "@/lib/blog-posts";
import type { BlogCategorySlug } from "@/lib/blog/categories";
import type { ExerciseCategory, ExerciseDefinition } from "@/lib/exercises/types";
import type { BlogPost } from "@/lib/blog-posts";

export interface InternalLinksProps {
  /** The category of the current blog post */
  category: BlogCategorySlug;
  /** The slug of the current blog post (excluded from related posts) */
  currentSlug: string;
  /** Optional tags/keywords inferred from the post to improve relevance */
  tags?: string[];
}

interface LinkItem {
  text: string;
  href: string;
  title: string;
}

const MIN_LINKS = 2;
const MAX_LINKS = 5;

/**
 * Maps blog categories to related exercise categories for cross-linking.
 */
const CATEGORY_TO_EXERCISE_MAP: Record<BlogCategorySlug, ExerciseCategory[]> = {
  "training-guides": ["flicking", "tracking", "speed", "precision", "reaction"],
  "game-specific-tips": ["flicking", "tracking", "precision"],
  "settings-optimization": ["precision", "tracking"],
  "pro-player-analysis": ["flicking", "speed", "reaction"],
};

/**
 * Extracts game tags from a blog post category and tags for matching focusGames.
 */
function extractGameTags(tags?: string[]): string[] {
  if (!tags) return [];
  const gameKeywords = ["valorant", "cs2", "apex", "fortnite", "overwatch"];
  return tags.filter((tag) => gameKeywords.includes(tag.toLowerCase()));
}

/**
 * Finds exercises related to the blog post's category and tags.
 */
function getRelatedExercises(
  category: BlogCategorySlug,
  tags?: string[]
): ExerciseDefinition[] {
  const allExercises = getAllExercises();
  const relatedCategories = CATEGORY_TO_EXERCISE_MAP[category];
  const gameTags = extractGameTags(tags);

  // Score exercises by relevance
  const scored = allExercises.map((exercise) => {
    let score = 0;

    // Category match
    if (relatedCategories.includes(exercise.category)) {
      score += 2;
    }

    // Game tag match via focusGames
    if (exercise.focusGames && gameTags.length > 0) {
      const hasGameMatch = exercise.focusGames.some((game) =>
        gameTags.includes(game.toLowerCase())
      );
      if (hasGameMatch) {
        score += 3;
      }
    }

    return { exercise, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.exercise);
}

/**
 * Finds blog posts related to the current post's category (excluding current post).
 */
function getRelatedBlogPosts(
  category: BlogCategorySlug,
  currentSlug: string
): BlogPost[] {
  const allPosts = getAllBlogPosts();
  return allPosts.filter(
    (post) => post.category === category && post.slug !== currentSlug
  );
}

/**
 * Builds a balanced list of 2–5 internal links from exercises and related guides.
 */
function buildInternalLinks(
  category: BlogCategorySlug,
  currentSlug: string,
  tags?: string[]
): LinkItem[] {
  const links: LinkItem[] = [];
  const relatedExercises = getRelatedExercises(category, tags);
  const relatedPosts = getRelatedBlogPosts(category, currentSlug);

  // Add exercise links (up to 3)
  const exerciseLimit = Math.min(3, relatedExercises.length);
  for (let i = 0; i < exerciseLimit; i++) {
    const exercise = relatedExercises[i];
    links.push({
      text: `Try ${exercise.name} Exercise`,
      href: `/#exercise-${exercise.id}`,
      title: `Practice ${exercise.name} - ${exercise.description.slice(0, 80)}`,
    });
  }

  // Add blog guide links (up to 2)
  const guideLimit = Math.min(2, relatedPosts.length);
  for (let i = 0; i < guideLimit; i++) {
    const post = relatedPosts[i];
    links.push({
      text: post.title,
      href: `/blog/${post.slug}`,
      title: post.excerpt.slice(0, 100),
    });
  }

  // Ensure we have at least MIN_LINKS; if we don't have enough category matches,
  // pull from any available exercises or posts
  if (links.length < MIN_LINKS) {
    const allExercises = getAllExercises();
    for (const exercise of allExercises) {
      if (links.length >= MIN_LINKS) break;
      const alreadyLinked = links.some((l) => l.href.includes(exercise.id));
      if (!alreadyLinked) {
        links.push({
          text: `Try ${exercise.name} Exercise`,
          href: `/#exercise-${exercise.id}`,
          title: `Practice ${exercise.name} - ${exercise.description.slice(0, 80)}`,
        });
      }
    }
  }

  // Cap at MAX_LINKS
  return links.slice(0, MAX_LINKS);
}

/**
 * InternalLink component that renders contextual internal links
 * within blog post bodies, pointing to exercises or guides sharing
 * at least one category or tag with the blog post.
 *
 * Renders 2–5 links as per Requirement 18.2.
 */
export default function InternalLinks({
  category,
  currentSlug,
  tags,
}: InternalLinksProps) {
  const links = buildInternalLinks(category, currentSlug, tags);

  if (links.length < MIN_LINKS) {
    return null;
  }

  return (
    <nav
      className="internal-links"
      aria-label="Related exercises and guides"
    >
      <h3 className="internal-links__title">Related Training Resources</h3>
      <ul className="internal-links__list">
        {links.map((link) => (
          <li key={link.href} className="internal-links__item">
            <Link
              href={link.href}
              title={link.title}
              className="internal-links__link"
            >
              {link.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Utility function that returns the internal links data without rendering.
 * Useful for integrating link data into other contexts (e.g., structured data, sitemap).
 */
export function getInternalLinksForPost(
  category: BlogCategorySlug,
  currentSlug: string,
  tags?: string[]
): LinkItem[] {
  return buildInternalLinks(category, currentSlug, tags);
}
