import Home from "@/app/page";

/**
 * Locale-prefixed homepage (e.g. /es, /pt, /de, /ja, /zh).
 *
 * Renders the same trainer as the root homepage so locale roots resolve
 * instead of returning 404. Invalid locale segments are rejected by the
 * [locale] layout via notFound().
 *
 * NOTE: Full UI translation of the trainer is a separate i18n task; for now
 * the localized homepage shares the English trainer so navigation/links and
 * the language selector work without dead ends.
 */
export default function LocaleHome() {
  return <Home />;
}
