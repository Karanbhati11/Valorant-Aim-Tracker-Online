import { parseCode } from "./builder/utils";

export const CROSSHAIR_CATEGORIES = ["Pro", "Meme", "Competitive", "Classic"] as const;
export const CROSSHAIR_TAGS = ["dot", "plus", "thin", "thick", "sniper", "pixel"] as const;
export const CROSSHAIR_STYLES = ["dot", "plus", "box"] as const;

export type CrosshairCategory = (typeof CROSSHAIR_CATEGORIES)[number];
export type CrosshairTag = (typeof CROSSHAIR_TAGS)[number];
export type CrosshairStyle = (typeof CROSSHAIR_STYLES)[number];

export type CrosshairMetadata = {
  category: CrosshairCategory;
  tags: CrosshairTag[];
  color: string;
  style: CrosshairStyle;
};

const COLOR_BY_INDEX: Record<number, string> = {
  0: "white",
  1: "green",
  2: "lime",
  3: "yellow-green",
  4: "yellow",
  5: "cyan",
  6: "pink",
  7: "red",
  8: "custom",
};

export function normalizeCategory(value: unknown): CrosshairCategory {
  if (typeof value !== "string") return "Classic";
  const normalized = value.trim().toLowerCase();
  if (normalized === "pro") return "Pro";
  if (normalized === "meme" || normalized === "fun") return "Meme";
  if (normalized === "competitive") return "Competitive";
  if (normalized === "classic") return "Classic";
  return "Classic";
}

export function normalizeTags(value: unknown): CrosshairTag[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set<string>(CROSSHAIR_TAGS);
  const out = new Set<CrosshairTag>();
  for (const item of value) {
    if (typeof item !== "string") continue;
    const next = item.trim().toLowerCase();
    if (allowed.has(next)) out.add(next as CrosshairTag);
  }
  return Array.from(out);
}

function inferStyleFromCode(code: string): CrosshairStyle {
  try {
    const parsed = parseCode(code);
    const p = parsed.primary;
    if (p.dot.enabled && !p.inner.enabled && !p.outer.enabled) return "dot";
    if (p.outer.enabled && p.outer.length > 3 && p.inner.length <= 2) return "box";
    if (p.inner.enabled) return "plus";
    return p.dot.enabled ? "dot" : "plus";
  } catch {
    return "plus";
  }
}

function inferColorFromCode(code: string): string {
  try {
    const parsed = parseCode(code);
    return COLOR_BY_INDEX[parsed.primary.color] || "custom";
  } catch {
    return "custom";
  }
}

export function buildCrosshairMetadata(
  code: string,
  categoryInput: unknown,
  tagsInput: unknown,
): CrosshairMetadata {
  const category = normalizeCategory(categoryInput);
  const normalizedTags = normalizeTags(tagsInput);
  const style = inferStyleFromCode(code);
  const color = inferColorFromCode(code);
  const tags = new Set<CrosshairTag>(normalizedTags);
  tags.add(style === "box" ? "plus" : style);
  if (category === "Competitive" || category === "Pro") tags.add("thin");
  if (category === "Meme") tags.add("pixel");
  return { category, tags: Array.from(tags), color, style };
}
