"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  MESSAGES,
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
} from "@/lib/i18n/messages";

const STORAGE_KEY = "aimtrainerpro-locale";

type Translate = (key: string, vars?: Record<string, string | number>) => string;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translate;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/** Resolve a dot-notation key against a messages object. */
function resolveKey(messages: unknown, key: string): string | undefined {
  const parts = key.split(".");
  let current: unknown = messages;
  for (const part of parts) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Load the persisted preference after mount (avoids hydration mismatch).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isLocale(stored)) {
        setLocaleState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  // Keep <html lang> in sync for accessibility / SEO.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback<Translate>(
    (key, vars) => {
      let value =
        resolveKey(MESSAGES[locale], key) ??
        resolveKey(MESSAGES[DEFAULT_LOCALE], key) ??
        key;
      if (vars) {
        for (const k of Object.keys(vars)) {
          value = value.replace(`{${k}}`, String(vars[k]));
        }
      }
      return value;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Access the i18n context. Falls back to an identity translator when used
 * outside a provider (e.g. during isolated server rendering), so it never
 * throws.
 */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (key: string) => key,
    };
  }
  return ctx;
}
