/**
 * Blog content validation and table of contents generation.
 * Enforces heading hierarchy, word count minimums, and auto-generates
 * table of contents for long-form posts.
 *
 * Requirements: 9.1, 9.2, 9.7
 */

import { TOCEntry } from '@/lib/content/types';

export interface HeadingNode {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  id: string;
}

export interface ContentValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  wordCount: number;
  headings: HeadingNode[];
}

export interface ContentValidationOptions {
  minWordCount?: number;
  requireH1?: boolean;
  enforceHierarchy?: boolean;
}

const DEFAULT_OPTIONS: Required<ContentValidationOptions> = {
  minWordCount: 1500,
  requireH1: true,
  enforceHierarchy: true,
};

/**
 * Strips HTML tags and counts words in text content.
 */
export function countWords(html: string): number {
  const text = html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-zA-Z]+;/g, ' ')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return 0;
  return text.split(' ').filter((w) => w.length > 0).length;
}

/**
 * Extracts all headings from HTML content.
 */
export function extractHeadings(html: string): HeadingNode[] {
  const headings: HeadingNode[] = [];
  const headingRegex = /<h([1-6])(?:\s+[^>]*)?>([\s\S]*?)<\/h\1>/gi;

  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10) as 1 | 2 | 3 | 4 | 5 | 6;
    const rawText = match[2]
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Extract id from existing attribute or generate from text
    const idMatch = match[0].match(/id=["']([^"']+)["']/);
    const id = idMatch ? idMatch[1] : slugify(rawText);

    headings.push({ level, text: rawText, id });
  }

  return headings;
}

/**
 * Creates a URL-friendly slug from heading text.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Validates heading hierarchy in blog content.
 *
 * Rules (Requirement 9.1):
 * - Exactly one H1 (the post title)
 * - One or more H2 sections
 * - Optional H3 subsections nested within their parent H2
 * - No H3 before the first H2
 * - No H4-H6 (only H1, H2, H3 are valid in blog content)
 */
export function validateHeadingHierarchy(headings: HeadingNode[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Count H1 headings
  const h1Count = headings.filter((h) => h.level === 1).length;
  if (h1Count === 0) {
    errors.push('Missing H1 heading: blog posts must have exactly one H1 as the title');
  } else if (h1Count > 1) {
    errors.push(
      `Multiple H1 headings found (${h1Count}): blog posts must have exactly one H1`
    );
  }

  // Check for H2 sections
  const h2Count = headings.filter((h) => h.level === 2).length;
  if (h2Count === 0) {
    errors.push('No H2 headings found: blog posts must contain at least one H2 section');
  }

  // Check for invalid heading levels (H4-H6)
  const invalidHeadings = headings.filter((h) => h.level > 3);
  if (invalidHeadings.length > 0) {
    errors.push(
      `Invalid heading levels found: H${invalidHeadings[0].level} ("${invalidHeadings[0].text}"). Only H1, H2, and H3 are allowed in blog posts`
    );
  }

  // Check H3 nesting: no H3 before the first H2
  let foundH2 = false;
  for (const heading of headings) {
    if (heading.level === 1) continue;
    if (heading.level === 2) {
      foundH2 = true;
    } else if (heading.level === 3 && !foundH2) {
      errors.push(
        `H3 ("${heading.text}") appears before any H2: H3 headings must be nested within an H2 section`
      );
      break;
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates blog post content for publication readiness.
 *
 * Requirements: 9.1, 9.7
 */
export function validateBlogContent(
  html: string,
  options: ContentValidationOptions = {}
): ContentValidationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const errors: string[] = [];
  const warnings: string[] = [];

  // Count words
  const wordCount = countWords(html);

  // Word count validation (Requirement 9.7)
  if (wordCount < opts.minWordCount) {
    errors.push(
      `Word count ${wordCount} is below the minimum requirement of ${opts.minWordCount} words. Add ${opts.minWordCount - wordCount} more words before publishing.`
    );
  }

  // Extract and validate headings
  const headings = extractHeadings(html);

  if (opts.enforceHierarchy) {
    const hierarchyResult = validateHeadingHierarchy(headings);
    errors.push(...hierarchyResult.errors);
  }

  if (opts.requireH1 && !headings.some((h) => h.level === 1)) {
    // Already covered by hierarchy validation, but check explicitly if hierarchy is disabled
    if (!opts.enforceHierarchy) {
      errors.push('Missing H1 heading');
    }
  }

  // Warnings for content quality
  if (wordCount >= 1500 && wordCount < 2000) {
    warnings.push(
      'Post is between 1500-2000 words. Consider adding more content for better SEO performance.'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    wordCount,
    headings,
  };
}

/**
 * Generates a table of contents from HTML headings.
 * Only generates TOC for posts exceeding 2000 words (Requirement 9.2).
 *
 * Returns H2 and H3 headings as navigable anchor links.
 */
export function generateTableOfContents(
  html: string,
  wordCount?: number
): TOCEntry[] | null {
  const actualWordCount = wordCount ?? countWords(html);

  // Only generate TOC for posts exceeding 2000 words
  if (actualWordCount <= 2000) {
    return null;
  }

  const headings = extractHeadings(html);

  // Filter to only H2 and H3
  const tocEntries: TOCEntry[] = headings
    .filter((h) => h.level === 2 || h.level === 3)
    .map((h) => ({
      id: h.id,
      text: h.text,
      level: h.level as 2 | 3,
    }));

  return tocEntries.length > 0 ? tocEntries : null;
}

/**
 * Injects anchor IDs into heading tags in HTML content.
 * This enables the table of contents links to work properly.
 */
export function injectHeadingIds(html: string): string {
  return html.replace(
    /<h([2-3])(?:\s+[^>]*)?>([\s\S]*?)<\/h\1>/gi,
    (fullMatch, level, content) => {
      const text = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      const id = slugify(text);

      // If already has an id, keep it
      if (fullMatch.match(/id=["'][^"']+["']/)) {
        return fullMatch;
      }

      return `<h${level} id="${id}">${content}</h${level}>`;
    }
  );
}
