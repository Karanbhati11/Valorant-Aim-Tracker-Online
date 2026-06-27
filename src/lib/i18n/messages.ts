import en from "@/messages/en.json";
import es from "@/messages/es.json";
import pt from "@/messages/pt.json";
import de from "@/messages/de.json";
import ja from "@/messages/ja.json";
import zh from "@/messages/zh.json";

export const LOCALES = ["en", "es", "pt", "de", "ja", "zh"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** All translation message bundles, keyed by locale. */
export const MESSAGES: Record<Locale, Record<string, unknown>> = {
  en,
  es,
  pt,
  de,
  ja,
  zh,
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
