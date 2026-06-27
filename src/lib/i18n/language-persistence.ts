/**
 * Language preference persistence via localStorage.
 * Handles storing and retrieving the user's preferred locale.
 */

import { type SupportedLocale, defaultLocale, isValidLocale } from './config';

const LANGUAGE_STORAGE_KEY = 'aimtrainer-language';

/**
 * Persists the selected language preference in localStorage.
 */
export function persistLanguagePreference(locale: SupportedLocale): void {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
}

/**
 * Loads the persisted language preference from localStorage.
 * Returns the default locale (English) if:
 * - No preference is stored
 * - The stored value is not a valid supported locale
 */
export function loadLanguagePreference(): SupportedLocale {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && isValidLocale(stored)) {
    return stored;
  }
  return defaultLocale;
}

/**
 * Clears the stored language preference.
 * After clearing, loadLanguagePreference will return the default locale.
 */
export function clearLanguagePreference(): void {
  localStorage.removeItem(LANGUAGE_STORAGE_KEY);
}
