/**
 * Hreflang tag generation for internationalization.
 * Generates hreflang link elements for all available language versions
 * of a page, integrating with next-intl's 'as-needed' locale prefix routing.
 *
 * Requirements: 7.6, 20.5
 */

import { supportedLocales, defaultLocale, type SupportedLocale } from '@/lib/i18n/config';

const BASE_URL = 'https://aimtrainerpro.online';

/**
 * Represents a single hreflang link element.
 */
export interface HreflangLink {
  rel: 'alternate';
  hreflang: string;
  href: string;
}

/**
 * Generates hreflang link elements for all available language versions of a page.
 *
 * Follows next-intl's 'as-needed' locale prefix convention:
 * - Default locale (en) has no prefix: /path
 * - Other locales are prefixed: /es/path, /de/path, etc.
 *
 * Includes:
 * - A self-referencing hreflang for the current language
 * - Entries for all other supported locales
 * - An x-default entry pointing to the English (default) version
 *
 * @param path - The page path without locale prefix (e.g., '/blog/aim-guide' or '/')
 * @param currentLocale - The current locale of the page
 * @returns Array of hreflang link objects for all supported locales plus x-default
 */
export function generateHreflangLinks(
  path: string,
  currentLocale: SupportedLocale
): HreflangLink[] {
  const normalizedPath = normalizePath(path);
  const links: HreflangLink[] = [];

  for (const locale of supportedLocales) {
    links.push({
      rel: 'alternate',
      hreflang: locale,
      href: buildLocalizedUrl(normalizedPath, locale),
    });
  }

  // Add x-default pointing to the default locale (English) version
  links.push({
    rel: 'alternate',
    hreflang: 'x-default',
    href: buildLocalizedUrl(normalizedPath, defaultLocale),
  });

  return links;
}

/**
 * Builds the full absolute URL for a given path and locale.
 * Default locale (en) uses no prefix; other locales get a prefix.
 *
 * @param path - Normalized path (e.g., '/blog/aim-guide' or '/')
 * @param locale - Target locale
 * @returns Absolute URL string
 */
function buildLocalizedUrl(path: string, locale: SupportedLocale): string {
  if (locale === defaultLocale) {
    // Default locale has no prefix (as-needed strategy)
    return `${BASE_URL}${path}`;
  }

  // Non-default locales get a prefix
  if (path === '/') {
    return `${BASE_URL}/${locale}`;
  }

  return `${BASE_URL}/${locale}${path}`;
}

/**
 * Normalizes a path by ensuring it starts with '/' and removing trailing slashes
 * (except for the root path '/').
 * Also strips any existing locale prefix from the path.
 *
 * @param path - Raw path input
 * @returns Normalized path starting with '/'
 */
function normalizePath(path: string): string {
  // Ensure leading slash
  let normalized = path.startsWith('/') ? path : `/${path}`;

  // Strip existing locale prefix if present
  normalized = stripLocalePrefix(normalized);

  // Remove trailing slash (except for root)
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

/**
 * Strips any locale prefix from a path.
 * E.g., '/es/blog' → '/blog', '/de' → '/'
 *
 * @param path - Path potentially containing a locale prefix
 * @returns Path without locale prefix
 */
function stripLocalePrefix(path: string): string {
  for (const locale of supportedLocales) {
    if (locale === defaultLocale) continue;

    const prefix = `/${locale}`;

    if (path === prefix) {
      return '/';
    }

    if (path.startsWith(`${prefix}/`)) {
      return path.slice(prefix.length);
    }
  }

  return path;
}
