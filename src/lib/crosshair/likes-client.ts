const ANON_ID_KEY = "crosshairBuilderAnonId";
const LIKED_IDS_KEY = "crosshairBuilderLikedIds";
const VIEWED_IDS_KEY = "crosshairBuilderViewedIds";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getOrCreateAnonId(): string {
  if (!isBrowser()) return "";
  const existing = window.localStorage.getItem(ANON_ID_KEY);
  if (existing) return existing;
  const next = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(ANON_ID_KEY, next);
  return next;
}

export function getLikedCrosshairIds(): Set<string> {
  if (!isBrowser()) return new Set<string>();
  const raw = window.localStorage.getItem(LIKED_IDS_KEY);
  if (!raw) return new Set<string>();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set<string>();
    return new Set<string>(parsed.filter((v): v is string => typeof v === "string" && v.length > 0));
  } catch {
    return new Set<string>();
  }
}

export function markCrosshairLiked(id: string): void {
  if (!isBrowser() || !id) return;
  const ids = getLikedCrosshairIds();
  ids.add(id);
  window.localStorage.setItem(LIKED_IDS_KEY, JSON.stringify(Array.from(ids)));
}

export function getViewedCrosshairIds(): Set<string> {
  if (!isBrowser()) return new Set<string>();
  const raw = window.localStorage.getItem(VIEWED_IDS_KEY);
  if (!raw) return new Set<string>();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set<string>();
    return new Set<string>(parsed.filter((v): v is string => typeof v === "string" && v.length > 0));
  } catch {
    return new Set<string>();
  }
}

export function markCrosshairViewed(id: string): void {
  if (!isBrowser() || !id) return;
  const ids = getViewedCrosshairIds();
  ids.add(id);
  window.localStorage.setItem(VIEWED_IDS_KEY, JSON.stringify(Array.from(ids)));
}
