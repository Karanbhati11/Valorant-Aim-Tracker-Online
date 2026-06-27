import { DEFAULTS, MAP } from "./config";
import type { Parsed } from "./types";

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

function setByPath(obj: unknown, path: string, value: unknown): void {
  const parts = path.split(".");
  let cur = obj as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i += 1) {
    cur = cur[parts[i]] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

export function parseCode(input: string): Parsed {
  const code = String(input || "").trim();
  if (!/^0[a-zA-Z0-9;.]*$/.test(code) || !code.startsWith("0")) {
    throw new Error("Invalid crosshair code");
  }

  const out = clone(DEFAULTS);
  const chunks = code.split(";");
  let section = "0";

  for (let i = 1; i < chunks.length; i += 2) {
    const token = chunks[i];
    if (!token) continue;

    if (["P", "A", "S"].includes(token)) {
      section = token;
      i -= 1;
      continue;
    }

    if (i + 1 >= chunks.length) continue;
    const raw = chunks[i + 1];
    const key = `${section}:${token}`;
    const mapEntry = MAP[key];
    if (!mapEntry) continue;

    let value: number;
    if (/^[0-9A-F]{6,8}$/i.test(raw)) {
      value = parseInt(raw.length === 6 ? `FF${raw}` : raw, 16);
    } else {
      value = Number.parseFloat(raw);
    }
    if (!Number.isFinite(value)) continue;

    const [path, min, max, integer, transform] = mapEntry;
    let next: unknown = Math.max(min, Math.min(max, value));
    if (integer) next = Math.round(next as number);
    if (typeof transform === "function") next = transform(next as number);
    setByPath(out, path, next);
  }

  return out;
}

export function convertToCode(parsed: Parsed): string {
  let code = "0";
  let currentSection = "0";

  for (const tokenKey of Object.keys(MAP)) {
    const [path] = MAP[tokenKey];
    const section = tokenKey.charAt(0);
    const key = tokenKey.split(":")[1];
    const now = getByPath(parsed, path);
    const def = getByPath(DEFAULTS, path);
    if (JSON.stringify(now) === JSON.stringify(def)) continue;

    if (section !== currentSection) {
      currentSection = section;
      code += `;${section}`;
    }

    const outValue = typeof now === "boolean" ? (now ? 1 : 0) : now;
    code += `;${key};${outValue}`;
  }

  return code;
}

export function randomizePrimary(parsed: Parsed): Parsed {
  const next = clone(parsed);
  const t = next.primary;
  t.color = Math.floor(Math.random() * 9);
  t.hexColor.value = `FF${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")
    .toUpperCase()}`;
  t.hexColor.enabled = t.color === 8;
  t.outlines.enabled = Math.random() > 0.2;
  t.outlines.width = 1 + Math.floor(Math.random() * 3);
  t.outlines.alpha = Number((0.2 + Math.random() * 0.8).toFixed(3));
  t.dot.enabled = Math.random() > 0.5;
  t.dot.width = 1 + Math.floor(Math.random() * 4);
  t.dot.alpha = Number((0.2 + Math.random() * 0.8).toFixed(3));
  t.inner.enabled = Math.random() > 0.1;
  t.inner.width = Math.floor(Math.random() * 6);
  t.inner.length = Math.floor(Math.random() * 11);
  t.inner.vertical.enabled = Math.random() > 0.5;
  t.inner.vertical.length = t.inner.vertical.enabled ? Math.floor(Math.random() * 11) : t.inner.length;
  t.inner.offset = Math.floor(Math.random() * 12);
  t.inner.alpha = Number((0.2 + Math.random() * 0.8).toFixed(3));
  t.overwriteFireMul = Math.random() > 0.5;
  t.inner.fireMul.enabled = Math.random() > 0.3;
  t.inner.fireMul.mul = Number((Math.random() * 3).toFixed(1));
  t.outer.enabled = Math.random() > 0.2;
  t.outer.width = Math.floor(Math.random() * 6);
  t.outer.length = Math.floor(Math.random() * 8);
  t.outer.vertical.enabled = Math.random() > 0.5;
  t.outer.vertical.length = t.outer.vertical.enabled ? Math.floor(Math.random() * 11) : t.outer.length;
  t.outer.offset = 6 + Math.floor(Math.random() * 18);
  t.outer.alpha = Number((0.2 + Math.random() * 0.8).toFixed(3));
  t.outer.fireMul.enabled = Math.random() > 0.3;
  t.outer.fireMul.mul = Number((Math.random() * 3).toFixed(1));
  return next;
}
