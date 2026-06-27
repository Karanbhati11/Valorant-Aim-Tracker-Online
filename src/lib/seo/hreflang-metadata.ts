/**
 * Hreflang metadata integration for Next.js pages.
 * Generates the `alternates.languages` metadata object for Next.js Metadata API,
 * ensuring all pages emit proper hreflang link tags for all supported locales.
 *
 * Requirements: 7.6, 20.5
 */

import { supportedLocales, defaultLocale, type SupportedLocale } from '@/lib/i18n/config';

const BASE_URL = 'https://aimtrainerpro.online';

/**
 * Generates the `alternates` object for Next.js Metadata API.
 * This produces hreflang link elements in the page head for all supported locales.
 *
 * Usage in page/layout metadata:
 * ```
 * export const metadata = {
 *   alternates: generateHreflangMetadata('/blog')
 * }
 * ```
 *
 * @param path - The page path without locale prefix (e.g., '/blog' or '/')
 * @returns Object suitable for Next.js `metadata.alternates`
 */
export function generateHreflangMetadata(path: string): {
  canonical: string;
  languages: Record<string, string>;
} {
  const normalizedPath = normalizePath(path);

  const languages: Record<string, string> = {};

  for (const locale of supportedLocales) {
    languages[locale] = buildLocalizedUrl(normalizedPath, locale);
  }

  // x-default points to English (default locale)
  languages['x-default'] = buildLocalizedUrl(normalizedPath, defaultLocale);

  return {
    canonical: buildLocalizedUrl(normalizedPath, defaultLocale),
    languages,
  };
}

/**
 * Generates hreflang metadata for a specific locale's page.
 * Used when generating metadata for locale-prefixed routes (e.g., /es/blog).
 *
 * @param path - The page path without locale prefix
 * @param currentLocale - The locale of the current page
 * @returns Object suitable for Next.js `metadata.alternates`
 */
export function generateHreflangMetadataForLocale(
  path: string,
  currentLocale: SupportedLocale
): {
  canonical: string;
  languages: Record<string, string>;
} {
  const normalizedPath = normalizePath(path);

  const languages: Record<string, string> = {};

  for (const locale of supportedLocales) {
    languages[locale] = buildLocalizedUrl(normalizedPath, locale);
  }

  // x-default points to English (default locale)
  languages['x-default'] = buildLocalizedUrl(normalizedPath, defaultLocale);

  return {
    canonical: buildLocalizedUrl(normalizedPath, currentLocale),
    languages,
  };
}

function buildLocalizedUrl(path: string, locale: SupportedLocale): string {
  if (locale === defaultLocale) {
    return `${BASE_URL}${path}`;
  }

  if (path === '/') {
    return `${BASE_URL}/${locale}`;
  }

  return `${BASE_URL}/${locale}${path}`;
}

function normalizePath(path: string): string {
  let normalized = path.startsWith('/') ? path : `/${path}`;

  // Strip existing locale prefix if present
  for (const locale of supportedLocales) {
    if (locale === defaultLocale) continue;
    const prefix = `/${locale}`;
    if (normalized === prefix) {
      normalized = '/';
      break;
    }
    if (normalized.startsWith(`${prefix}/`)) {
      normalized = normalized.slice(prefix.length);
      break;
    }
  }

  // Remove trailing slash (except for root)
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}
