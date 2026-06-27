/**
 * SEO metadata generation system.
 * Generates page metadata, breadcrumbs, and structured data
 * compatible with Next.js Metadata API.
 *
 * Requirements: 7.1, 7.3, 7.4, 7.7
 */

import type {
  PageSEO,
  StructuredDataBlock,
  BreadcrumbItem,
} from './types';

const BASE_URL = 'https://aimtrainerpro.online';

const TITLE_MIN_LENGTH = 30;
const TITLE_MAX_LENGTH = 60;
const DESCRIPTION_MIN_LENGTH = 120;
const DESCRIPTION_MAX_LENGTH = 160;

/**
 * Configuration for a page to generate metadata for.
 */
export interface PageConfig {
  /** URL path (e.g., '/blog/aim-guide') */
  path: string;
  /** Target keyword for the page */
  keyword?: string;
  /** Explicit title (will be validated/adjusted for length) */
  title?: string;
  /** Explicit meta description */
  description?: string;
  /** Page heading text (H1), used as fallback for title */
  headingText?: string;
  /** First body content of the page, used as fallback for description */
  bodyContent?: string;
  /** Page type for structured data generation */
  pageType?: 'home' | 'blog-post' | 'landing' | 'exercise' | 'tool' | 'category' | 'static';
  /** Additional structured data config */
  structuredDataConfig?: StructuredDataPageConfig;
}

export interface StructuredDataPageConfig {
  /** Article-specific fields */
  article?: {
    headline: string;
    author: string;
    authorUrl?: string;
    datePublished: string;
    dateModified?: string;
    image?: string;
    description?: string;
  };
  /** FAQ items for FAQPage schema */
  faqItems?: Array<{ question: string; answer: string }>;
  /** HowTo steps */
  howToSteps?: Array<{ name: string; text: string; image?: string }>;
  /** HowTo metadata */
  howTo?: {
    name: string;
    description: string;
    totalTime?: string;
  };
  /** WebApplication overrides */
  webApplication?: {
    name?: string;
    description?: string;
    applicationCategory?: string;
    operatingSystem?: string;
    offers?: { price: string; priceCurrency: string };
    aggregateRating?: { ratingValue: string; ratingCount: string };
  };
}

/**
 * Generates complete page metadata including title, description, canonical URL,
 * breadcrumbs, and structured data.
 *
 * Title: 30-60 chars, must contain keyword if provided.
 * Description: 120-160 chars.
 * Falls back to heading text (truncated 60 chars) for title,
 * and first 160 chars of body for description.
 */
export function generatePageMetadata(page: PageConfig): PageSEO {
  const title = generateTitle(page);
  const description = generateDescription(page);
  const canonical = generateCanonicalUrl(page.path);
  const breadcrumbs = generateBreadcrumbs(page.path);
  const structuredData = generateStructuredData(page);
  const keywords = page.keyword ? [page.keyword] : [];

  return {
    title,
    description,
    canonical,
    keywords,
    structuredData,
    breadcrumbs: breadcrumbs.length > 1 ? breadcrumbs : undefined,
  };
}

/**
 * Generates a title between 30-60 characters.
 * If keyword is provided, ensures it appears in the title.
 * Falls back to heading text truncated to 60 characters.
 */
function generateTitle(page: PageConfig): string {
  const { title, keyword, headingText } = page;

  // Try explicit title first
  if (title) {
    let result = title;

    // If keyword is provided and not already in title, try to append it
    if (keyword && !result.toLowerCase().includes(keyword.toLowerCase())) {
      const withKeyword = `${result} | ${keyword}`;
      if (withKeyword.length <= TITLE_MAX_LENGTH) {
        result = withKeyword;
      }
    }

    // Ensure title is within bounds
    result = constrainTitle(result);
    return result;
  }

  // Fallback: use heading text
  if (headingText) {
    let result = headingText;

    // If keyword provided and not in heading, try to append
    if (keyword && !result.toLowerCase().includes(keyword.toLowerCase())) {
      const withKeyword = `${result} | ${keyword}`;
      if (withKeyword.length <= TITLE_MAX_LENGTH) {
        result = withKeyword;
      }
    }

    // Truncate to 60 chars max
    result = truncateText(result, TITLE_MAX_LENGTH);
    return result;
  }

  // Last resort: use keyword with site name
  if (keyword) {
    return constrainTitle(`${keyword} | AimTrainerPro`);
  }

  return 'AimTrainerPro - Free Aim Trainer Online';
}

/**
 * Ensures a title fits within 30-60 character bounds.
 * Truncates if too long, pads with site name if too short.
 */
function constrainTitle(title: string): string {
  if (title.length > TITLE_MAX_LENGTH) {
    return truncateText(title, TITLE_MAX_LENGTH);
  }

  if (title.length < TITLE_MIN_LENGTH) {
    const padded = `${title} | AimTrainerPro`;
    if (padded.length <= TITLE_MAX_LENGTH) {
      return padded;
    }
    // If padding makes it too long, pad with shorter suffix
    const shortPadded = `${title} - Aim Trainer`;
    if (shortPadded.length <= TITLE_MAX_LENGTH) {
      return shortPadded;
    }
  }

  return title;
}

/**
 * Generates a description between 120-160 characters.
 * Falls back to first 160 chars of body content.
 */
function generateDescription(page: PageConfig): string {
  const { description, bodyContent } = page;

  if (description) {
    return constrainDescription(description);
  }

  // Fallback: use first 160 chars of body content
  if (bodyContent) {
    const cleaned = cleanBodyContent(bodyContent);
    return constrainDescription(cleaned);
  }

  // Last resort default
  return 'Practice your aim with free 3D browser exercises. Train flicking, tracking, and precision skills. No download required. Improve your FPS aim today.';
}

/**
 * Ensures description fits within 120-160 character bounds.
 */
function constrainDescription(text: string): string {
  const cleaned = cleanBodyContent(text);

  if (cleaned.length > DESCRIPTION_MAX_LENGTH) {
    return truncateText(cleaned, DESCRIPTION_MAX_LENGTH);
  }

  if (cleaned.length < DESCRIPTION_MIN_LENGTH) {
    // Pad with generic aim trainer text if too short
    const padded = `${cleaned} Train your aim with AimTrainerPro's free 3D browser exercises.`;
    if (padded.length <= DESCRIPTION_MAX_LENGTH) {
      return padded;
    }
    // Return as-is if padding makes it too long - shorter is acceptable for fallback
    return cleaned;
  }

  return cleaned;
}

/**
 * Generates breadcrumb items from a URL path.
 * Always starts with Home. Segments are title-cased.
 *
 * Example: '/blog/aim-guide' → [Home, Blog, Aim Guide]
 */
export function generateBreadcrumbs(path: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
  ];

  // Clean the path
  const cleanPath = path.replace(/^\/|\/$/g, '');
  if (!cleanPath) {
    return breadcrumbs;
  }

  const segments = cleanPath.split('/');
  let currentPath = '';

  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = formatBreadcrumbLabel(segment);
    breadcrumbs.push({ label, href: currentPath });
  }

  return breadcrumbs;
}

/**
 * Generates structured data blocks appropriate for the page type.
 * Supports: WebApplication, BreadcrumbList, Article, FAQPage, HowTo.
 */
export function generateStructuredData(page: PageConfig): StructuredDataBlock[] {
  const blocks: StructuredDataBlock[] = [];
  const { pageType, path, structuredDataConfig } = page;

  // BreadcrumbList for pages with depth >= 2
  const breadcrumbs = generateBreadcrumbs(path);
  if (breadcrumbs.length >= 2) {
    blocks.push(generateBreadcrumbListSchema(breadcrumbs));
  }

  // Type-specific structured data
  switch (pageType) {
    case 'home':
      blocks.push(generateWebApplicationSchema(structuredDataConfig?.webApplication));
      break;
    case 'blog-post':
      if (structuredDataConfig?.article) {
        blocks.push(generateArticleSchema(structuredDataConfig.article));
      }
      break;
    case 'landing':
    case 'exercise':
    case 'category':
      // Landing/exercise/category pages may have FAQ or HowTo
      break;
    case 'tool':
    case 'static':
    default:
      break;
  }

  // FAQ structured data if FAQ items are provided
  if (structuredDataConfig?.faqItems && structuredDataConfig.faqItems.length > 0) {
    blocks.push(generateFAQPageSchema(structuredDataConfig.faqItems));
  }

  // HowTo structured data if steps are provided
  if (structuredDataConfig?.howToSteps && structuredDataConfig.howToSteps.length > 0) {
    blocks.push(
      generateHowToSchema(
        structuredDataConfig.howTo || { name: 'Guide', description: '' },
        structuredDataConfig.howToSteps
      )
    );
  }

  return blocks;
}

/**
 * Generates a WebApplication structured data block.
 */
function generateWebApplicationSchema(
  config?: StructuredDataPageConfig['webApplication']
): StructuredDataBlock {
  return {
    type: 'WebApplication',
    data: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: config?.name || 'AimTrainerPro',
      url: BASE_URL,
      description: config?.description || 'A free 3D browser-based aim trainer to improve flicking, tracking, and micro-adjustments.',
      applicationCategory: config?.applicationCategory || 'Game',
      operatingSystem: config?.operatingSystem || 'Web Browser',
      browserRequirements: 'Requires WebGL',
      offers: config?.offers || {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      ...(config?.aggregateRating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ...config.aggregateRating,
        },
      }),
    },
  };
}

/**
 * Generates a BreadcrumbList structured data block.
 */
function generateBreadcrumbListSchema(breadcrumbs: BreadcrumbItem[]): StructuredDataBlock {
  return {
    type: 'BreadcrumbList',
    data: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.label,
        item: `${BASE_URL}${crumb.href}`,
      })),
    },
  };
}

/**
 * Generates an Article structured data block.
 */
function generateArticleSchema(
  article: NonNullable<StructuredDataPageConfig['article']>
): StructuredDataBlock {
  return {
    type: 'Article',
    data: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.headline,
      author: {
        '@type': 'Person',
        name: article.author,
        ...(article.authorUrl && { url: article.authorUrl }),
      },
      datePublished: article.datePublished,
      ...(article.dateModified && { dateModified: article.dateModified }),
      ...(article.image && { image: article.image }),
      ...(article.description && { description: article.description }),
      publisher: {
        '@type': 'Organization',
        name: 'AimTrainerPro',
        url: BASE_URL,
      },
    },
  };
}

/**
 * Generates a FAQPage structured data block.
 */
function generateFAQPageSchema(
  faqItems: Array<{ question: string; answer: string }>
): StructuredDataBlock {
  return {
    type: 'FAQPage',
    data: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  };
}

/**
 * Generates a HowTo structured data block.
 */
function generateHowToSchema(
  howTo: { name: string; description: string; totalTime?: string },
  steps: Array<{ name: string; text: string; image?: string }>
): StructuredDataBlock {
  return {
    type: 'HowTo',
    data: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: howTo.name,
      description: howTo.description,
      ...(howTo.totalTime && { totalTime: howTo.totalTime }),
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.name,
        text: step.text,
        ...(step.image && { image: step.image }),
      })),
    },
  };
}

/**
 * Generates the canonical URL for a page path.
 */
function generateCanonicalUrl(path: string): string {
  const cleanPath = path.replace(/\/+$/, '') || '/';
  return `${BASE_URL}${cleanPath}`;
}

/**
 * Truncates text to a maximum length, breaking at the last word boundary
 * and appending an ellipsis if truncated.
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Reserve space for ellipsis
  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.5) {
    return `${truncated.substring(0, lastSpace)}...`;
  }

  return `${truncated}...`;
}

/**
 * Cleans body content for use in descriptions by removing extra whitespace,
 * HTML tags, and normalizing spaces.
 */
function cleanBodyContent(content: string): string {
  return content
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/\s+/g, ' ')   // Normalize whitespace
    .trim();
}

/**
 * Formats a URL segment into a readable breadcrumb label.
 * Converts kebab-case to Title Case.
 */
function formatBreadcrumbLabel(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
