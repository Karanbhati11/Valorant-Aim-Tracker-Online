export type SupportedLocale = 'en' | 'es' | 'pt' | 'de' | 'ja' | 'zh';

export const supportedLocales: SupportedLocale[] = ['en', 'es', 'pt', 'de', 'ja', 'zh'];
export const defaultLocale: SupportedLocale = 'en';

type Messages = Record<string, Record<string, string | Record<string, string>>>;

const messageCache = new Map<SupportedLocale, Messages>();

async function loadMessages(locale: SupportedLocale): Promise<Messages> {
  if (messageCache.has(locale)) {
    return messageCache.get(locale)!;
  }

  try {
    const messages = (await import(`@/messages/${locale}.json`)).default as Messages;
    messageCache.set(locale, messages);
    return messages;
  } catch {
    if (locale !== defaultLocale) {
      return loadMessages(defaultLocale);
    }
    return {};
  }
}

/**
 * Retrieves a translated string for the given dot-notation key and locale.
 * Falls back to English if the key is not found in the requested locale.
 *
 * @param key - Dot-notation key, e.g. "common.home" or "exercises.categories.flicking"
 * @param locale - The target locale
 * @returns The translated string, or the key itself if not found in any locale
 */
export async function getTranslation(key: string, locale: SupportedLocale): Promise<string> {
  const messages = await loadMessages(locale);
  const value = resolveKey(messages, key);

  if (value !== undefined) {
    return value;
  }

  // Fallback to English
  if (locale !== defaultLocale) {
    const fallbackMessages = await loadMessages(defaultLocale);
    const fallbackValue = resolveKey(fallbackMessages, key);
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
  }

  return key;
}

/**
 * Synchronous version of getTranslation for use when messages are already cached.
 * Returns the key if the locale hasn't been loaded yet.
 */
export function getTranslationSync(key: string, locale: SupportedLocale): string {
  const messages = messageCache.get(locale);
  if (messages) {
    const value = resolveKey(messages, key);
    if (value !== undefined) {
      return value;
    }
  }

  // Fallback to English cache
  if (locale !== defaultLocale) {
    const fallbackMessages = messageCache.get(defaultLocale);
    if (fallbackMessages) {
      const fallbackValue = resolveKey(fallbackMessages, key);
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
    }
  }

  return key;
}

function resolveKey(messages: Messages, key: string): string | undefined {
  const parts = key.split('.');
  let current: unknown = messages;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === 'string' ? current : undefined;
}

export function isValidLocale(locale: string): locale is SupportedLocale {
  return supportedLocales.includes(locale as SupportedLocale);
}
