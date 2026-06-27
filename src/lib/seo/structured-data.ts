/**
 * Structured data generators for Schema.org JSON-LD.
 * Generates WebApplication, BreadcrumbList, Article, and FAQPage schemas.
 */

import { StructuredDataBlock, BreadcrumbItem } from './types';

const SITE_URL = 'https://aimtrainerpro.online';
const SITE_NAME = 'AimTrainerPro';

/**
 * Generate enhanced WebApplication structured data for the home page.
 */
export function generateWebApplicationSchema(): StructuredDataBlock {
  return {
    type: 'WebApplication',
    data: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description:
        'A free 3D browser-based aim trainer to improve flicking, tracking, and micro-adjustments for FPS games like Valorant, CS2, and Apex Legends.',
      applicationCategory: 'GameApplication',
      genre: 'FPS Aim Trainer',
      operatingSystem: 'Web Browser',
      browserRequirements: 'Requires WebGL 2.0',
      inLanguage: 'en',
      isAccessibleForFree: true,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1250',
        bestRating: '5',
        worstRating: '1',
      },
      featureList: [
        'Flicking exercises',
        'Tracking exercises',
        'Speed training',
        'Precision drills',
        'Reaction time tests',
        'Global leaderboards',
        'Sensitivity converter',
        'Custom crosshair creator',
      ],
      screenshot: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/assets/preview-image.jpg`,
      },
      author: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: `${SITE_URL}/`,
      },
    },
  };
}

/**
 * Generate BreadcrumbList structured data from breadcrumb items.
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): StructuredDataBlock {
  return {
    type: 'BreadcrumbList',
    data: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: item.href.startsWith('http') ? item.href : `${SITE_URL}${item.href}`,
      })),
    },
  };
}

/**
 * Generate breadcrumb items from a URL path.
 * Includes the home page as the first item.
 */
export function generateBreadcrumbsFromPath(
  path: string,
  pageTitle?: string
): BreadcrumbItem[] {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return [];

  const items: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

  const labelMap: Record<string, string> = {
    blog: 'Blog',
    about: 'About',
    contact: 'Contact',
    tools: 'Tools',
    'sensitivity-converter': 'Sensitivity Converter',
    'dpi-analyzer': 'DPI Analyzer',
    'privacy-policy': 'Privacy Policy',
    terms: 'Terms of Use',
  };

  let currentPath = '';
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const isLast = i === segments.length - 1;
    const label = isLast && pageTitle ? pageTitle : labelMap[segments[i]] || segments[i];
    items.push({ label, href: currentPath });
  }

  return items;
}

export interface ArticleSchemaOptions {
  title: string;
  description: string;
  imageUrl?: string;
  authorName: string;
  datePublished: string;
  dateModified?: string;
  canonicalUrl: string;
  wordCount?: number;
}

/**
 * Generate Article structured data for blog posts.
 */
export function generateArticleSchema(options: ArticleSchemaOptions): StructuredDataBlock {
  return {
    type: 'Article',
    data: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: options.title,
      description: options.description,
      image: options.imageUrl ? [options.imageUrl] : undefined,
      author: {
        '@type': 'Person',
        name: options.authorName,
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/assets/favicon.png`,
        },
      },
      datePublished: options.datePublished,
      dateModified: options.dateModified || options.datePublished,
      mainEntityOfPage: options.canonicalUrl,
      wordCount: options.wordCount,
    },
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Generate FAQPage structured data.
 */
export function generateFAQSchema(items: FAQItem[]): StructuredDataBlock {
  return {
    type: 'FAQPage',
    data: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map((item) => ({
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
 * Generate a canonical URL for a given path.
 */
export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Remove trailing slash except for root
  const normalizedPath = cleanPath === '/' ? '/' : cleanPath.replace(/\/$/, '');
  return `${SITE_URL}${normalizedPath}`;
}
