/**
 * RelatedExercises component.
 * Displays 3–5 related exercises from the same category as the current exercise.
 * If fewer than 3 exercises exist in the same category (excluding the current one),
 * supplements with exercises from related categories.
 *
 * Requirements: 18.4
 */

import React from 'react';
import Link from 'next/link';
import { getExerciseById, getExercisesByCategory, getAllExercises } from '@/lib/exercises/registry';
import type { ExerciseCategory, ExerciseDefinition } from '@/lib/exercises/types';

// ─── Types ──────────────────────────────────────────────────────────────────

interface RelatedExercisesProps {
  /** The current exercise ID to find related exercises for */
  exerciseId?: string;
  /** Alternatively, specify a category directly */
  category?: ExerciseCategory;
  /** Maximum number of related exercises to display (default: 5) */
  maxItems?: number;
}

// ─── Category Relationships ─────────────────────────────────────────────────

/**
 * Defines which categories are considered "related" for supplementation.
 * When a category has fewer than 3 exercises, we pull from these related categories.
 */
const RELATED_CATEGORIES: Record<ExerciseCategory, ExerciseCategory[]> = {
  flicking: ['precision', 'speed', 'reaction'],
  tracking: ['precision', 'speed', 'flicking'],
  speed: ['flicking', 'reaction', 'tracking'],
  precision: ['flicking', 'tracking', 'reaction'],
  reaction: ['speed', 'flicking', 'precision'],
};

// ─── Helper Functions ───────────────────────────────────────────────────────

/**
 * Get related exercises for a given exercise or category.
 * Returns 3–5 exercises, supplementing from related categories if needed.
 */
export function getRelatedExercises(
  currentId: string | undefined,
  category: ExerciseCategory,
  maxItems: number = 5
): ExerciseDefinition[] {
  const minItems = 3;
  const sameCategoryExercises = getExercisesByCategory(category)
    .filter((ex) => ex.id !== currentId);

  // Take up to maxItems from the same category
  let related = sameCategoryExercises.slice(0, maxItems);

  // If fewer than minItems, supplement from related categories
  if (related.length < minItems) {
    const relatedCategories = RELATED_CATEGORIES[category] || [];
    const existingIds = new Set(related.map((ex) => ex.id));
    if (currentId) existingIds.add(currentId);

    for (const relCategory of relatedCategories) {
      if (related.length >= minItems) break;

      const supplementExercises = getExercisesByCategory(relCategory)
        .filter((ex) => !existingIds.has(ex.id));

      for (const ex of supplementExercises) {
        if (related.length >= minItems) break;
        related.push(ex);
        existingIds.add(ex.id);
      }
    }
  }

  // Cap at maxItems
  return related.slice(0, maxItems);
}

// ─── Category Badge Color Mapping ───────────────────────────────────────────

const CATEGORY_COLORS: Record<ExerciseCategory, { bg: string; text: string }> = {
  flicking: { bg: 'rgba(255, 70, 85, 0.2)', text: '#ff4655' },
  tracking: { bg: 'rgba(0, 188, 212, 0.2)', text: '#00bcd4' },
  speed: { bg: 'rgba(255, 193, 7, 0.2)', text: '#ffc107' },
  precision: { bg: 'rgba(76, 175, 80, 0.2)', text: '#4caf50' },
  reaction: { bg: 'rgba(156, 39, 176, 0.2)', text: '#9c27b0' },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function RelatedExercises({
  exerciseId,
  category,
  maxItems = 5,
}: RelatedExercisesProps) {
  // Determine the category from the exercise ID or the direct category prop
  let resolvedCategory: ExerciseCategory | undefined = category;

  if (!resolvedCategory && exerciseId) {
    const currentExercise = getExerciseById(exerciseId);
    resolvedCategory = currentExercise?.category;
  }

  if (!resolvedCategory) {
    return null;
  }

  const relatedExercises = getRelatedExercises(exerciseId, resolvedCategory, maxItems);

  if (relatedExercises.length === 0) {
    return null;
  }

  return (
    <aside className="related-exercises" style={styles.container} aria-label="Related exercises">
      <h3 style={styles.heading}>Related Exercises</h3>
      <ul style={styles.list}>
        {relatedExercises.map((exercise) => {
          const categoryColor = CATEGORY_COLORS[exercise.category];
          return (
            <li key={exercise.id} style={styles.item}>
              <Link href={`/exercises/${exercise.id}`} style={styles.link}>
                <div style={styles.itemContent}>
                  <div style={styles.itemHeader}>
                    <span style={styles.exerciseName}>{exercise.name}</span>
                    <span
                      style={{
                        ...styles.categoryBadge,
                        background: categoryColor.bg,
                        color: categoryColor.text,
                      }}
                    >
                      {exercise.category}
                    </span>
                  </div>
                  <div style={styles.itemMeta}>
                    <span style={styles.duration}>{exercise.duration}s</span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    maxWidth: '400px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: '#1a1d23',
    padding: '20px',
  },
  heading: {
    margin: '0 0 16px',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: '0.3px',
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  item: {
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'background 0.2s',
  },
  link: {
    display: 'block',
    padding: '12px',
    textDecoration: 'none',
    color: 'inherit',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'background 0.2s, border-color 0.2s',
  },
  itemContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  exerciseName: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#ffffff',
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.65rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  },
  itemMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficulty: {
    fontSize: '0.75rem',
    color: '#ffc107',
  },
  duration: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
};
