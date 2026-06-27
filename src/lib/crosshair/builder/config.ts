import type { MapEntry, Parsed } from "./types";

export const COLORS = [
  "#FFFFFF",
  "#00FF00",
  "#7FFF00",
  "#DFFF00",
  "#FFFF00",
  "#00FFFF",
  "#FF00FF",
  "#FF0000",
];

export const LOGICAL_CANVAS_SIZE = 128;
export const PREVIEW_NUDGE_X = -1.5;
export const PREVIEW_NUDGE_Y = 0;
export const PREVIEW_ZOOM_MIN = 0.5;
export const PREVIEW_ZOOM_MAX = 3;
export const PREVIEW_ZOOM_STEP = 0.25;

export const BG_TILES = [
  { label: "Dark", color: "#1a1f28" },
  { label: "Light", color: "#f3f5f8" },
  { label: "Green", color: "#24523f" },
  { label: "Sand", color: "#8e7f59" },
];

function intToHex8(num: number): string {
  let s = Number(num).toString(16).toUpperCase();
  while (s.length < 8) s = `0${s}`;
  return s;
}

export const MAP: Record<string, MapEntry> = {
  "0:p": ["general.adsUsePrimary", 0, 1, true, (v) => v !== 0],
  "0:c": ["general.overwriteAllPrimary", 0, 1, true, (v) => v !== 0],
  "0:s": ["general.advancedOptions", 0, 1, true, (v) => v !== 0],
  "P:c": ["primary.color", 0, 8, true],
  "P:u": ["primary.hexColor.value", 0, 0xffffffff, true, (v) => intToHex8(v)],
  "P:h": ["primary.outlines.enabled", 0, 1, true, (v) => v !== 0],
  "P:t": ["primary.outlines.width", 1, 6, true],
  "P:o": ["primary.outlines.alpha", 0, 1, false],
  "P:d": ["primary.dot.enabled", 0, 1, true, (v) => v !== 0],
  "P:b": ["primary.hexColor.enabled", 0, 1, true, (v) => v !== 0],
  "P:z": ["primary.dot.width", 1, 6, true],
  "P:a": ["primary.dot.alpha", 0, 1, false],
  "P:f": ["general.hideOnFire", 0, 1, true, (v) => v !== 0],
  "P:s": ["general.followSpectating", 0, 1, true, (v) => v !== 0],
  "P:m": ["primary.overwriteFireMul", 0, 1, true, (v) => v !== 0],
  "P:0b": ["primary.inner.enabled", 0, 1, true, (v) => v !== 0],
  "P:0t": ["primary.inner.width", 0, 10, true],
  "P:0l": ["primary.inner.length", 0, 20, true],
  "P:0v": ["primary.inner.vertical.length", 0, 20, true],
  "P:0g": ["primary.inner.vertical.enabled", 0, 1, true, (v) => v !== 0],
  "P:0o": ["primary.inner.offset", 0, 20, true],
  "P:0a": ["primary.inner.alpha", 0, 1, false],
  "P:0m": ["primary.inner.moveMul.enabled", 0, 1, true, (v) => v !== 0],
  "P:0f": ["primary.inner.fireMul.enabled", 0, 1, true, (v) => v !== 0],
  "P:0s": ["primary.inner.moveMul.mul", 0, 3, false],
  "P:0e": ["primary.inner.fireMul.mul", 0, 3, false],
  "P:1b": ["primary.outer.enabled", 0, 1, true, (v) => v !== 0],
  "P:1t": ["primary.outer.width", 0, 10, true],
  "P:1l": ["primary.outer.length", 0, 10, true],
  "P:1v": ["primary.outer.vertical.length", 0, 20, true],
  "P:1g": ["primary.outer.vertical.enabled", 0, 1, true, (v) => v !== 0],
  "P:1o": ["primary.outer.offset", 0, 40, true],
  "P:1a": ["primary.outer.alpha", 0, 1, false],
  "P:1m": ["primary.outer.moveMul.enabled", 0, 1, true, (v) => v !== 0],
  "P:1f": ["primary.outer.fireMul.enabled", 0, 1, true, (v) => v !== 0],
  "P:1s": ["primary.outer.moveMul.mul", 0, 3, false],
  "P:1e": ["primary.outer.fireMul.mul", 0, 3, false],
  "A:c": ["ads.color", 0, 8, true],
  "A:u": ["ads.hexColor.value", 0, 0xffffffff, true, (v) => intToHex8(v)],
  "A:h": ["ads.outlines.enabled", 0, 1, true, (v) => v !== 0],
  "A:t": ["ads.outlines.width", 1, 6, true],
  "A:o": ["ads.outlines.alpha", 0, 1, false],
  "A:d": ["ads.dot.enabled", 0, 1, true, (v) => v !== 0],
  "A:b": ["ads.hexColor.enabled", 0, 1, true, (v) => v !== 0],
  "A:z": ["ads.dot.width", 1, 6, true],
  "A:a": ["ads.dot.alpha", 0, 1, false],
  "A:m": ["ads.overwriteFireMul", 0, 1, true, (v) => v !== 0],
  "A:0b": ["ads.inner.enabled", 0, 1, true, (v) => v !== 0],
  "A:0t": ["ads.inner.width", 0, 10, true],
  "A:0l": ["ads.inner.length", 0, 20, true],
  "A:0v": ["ads.inner.vertical.length", 0, 20, true],
  "A:0g": ["ads.inner.vertical.enabled", 0, 1, true, (v) => v !== 0],
  "A:0o": ["ads.inner.offset", 0, 20, true],
  "A:0a": ["ads.inner.alpha", 0, 1, false],
  "A:0m": ["ads.inner.moveMul.enabled", 0, 1, true, (v) => v !== 0],
  "A:0f": ["ads.inner.fireMul.enabled", 0, 1, true, (v) => v !== 0],
  "A:0s": ["ads.inner.moveMul.mul", 0, 3, false],
  "A:0e": ["ads.inner.fireMul.mul", 0, 3, false],
  "A:1b": ["ads.outer.enabled", 0, 1, true, (v) => v !== 0],
  "A:1t": ["ads.outer.width", 0, 10, true],
  "A:1l": ["ads.outer.length", 0, 10, true],
  "A:1v": ["ads.outer.vertical.length", 0, 20, true],
  "A:1g": ["ads.outer.vertical.enabled", 0, 1, true, (v) => v !== 0],
  "A:1o": ["ads.outer.offset", 0, 40, true],
  "A:1a": ["ads.outer.alpha", 0, 1, false],
  "A:1m": ["ads.outer.moveMul.enabled", 0, 1, true, (v) => v !== 0],
  "A:1f": ["ads.outer.fireMul.enabled", 0, 1, true, (v) => v !== 0],
  "A:1s": ["ads.outer.moveMul.mul", 0, 3, false],
  "A:1e": ["ads.outer.fireMul.mul", 0, 3, false],
  "S:b": ["sniper.hexColor.enabled", 0, 1, true, (v) => v !== 0],
  "S:c": ["sniper.color", 0, 8, true],
  "S:t": ["sniper.hexColor.value", 0, 0xffffffff, true, (v) => intToHex8(v)],
  "S:d": ["sniper.dot.enabled", 0, 1, true, (v) => v !== 0],
  "S:s": ["sniper.dot.width", 0, 4, false],
  "S:o": ["sniper.dot.alpha", 0, 1, false],
};

export const DEFAULTS: Parsed = {
  general: { advancedOptions: false, adsUsePrimary: true, overwriteAllPrimary: false, hideOnFire: true, followSpectating: true },
  primary: {
    color: 0,
    useCustomColor: false,
    hexColor: { enabled: false, value: "FFFFFFFF" },
    outlines: { enabled: true, width: 1, alpha: 0.5 },
    dot: { enabled: false, width: 2, alpha: 1 },
    overwriteFireMul: false,
    inner: { enabled: true, width: 2, length: 6, vertical: { enabled: false, length: 6 }, offset: 3, alpha: 0.8, moveMul: { enabled: false, mul: 1 }, fireMul: { enabled: true, mul: 1 } },
    outer: { enabled: true, width: 2, length: 2, vertical: { enabled: false, length: 2 }, offset: 10, alpha: 0.35, moveMul: { enabled: true, mul: 1 }, fireMul: { enabled: true, mul: 1 } },
  },
  ads: {
    color: 0,
    useCustomColor: false,
    hexColor: { enabled: false, value: "FFFFFFFF" },
    outlines: { enabled: true, width: 1, alpha: 0.5 },
    dot: { enabled: false, width: 2, alpha: 1 },
    overwriteFireMul: false,
    inner: { enabled: true, width: 2, length: 6, vertical: { enabled: false, length: 6 }, offset: 3, alpha: 0.8, moveMul: { enabled: false, mul: 1 }, fireMul: { enabled: true, mul: 1 } },
    outer: { enabled: true, width: 2, length: 2, vertical: { enabled: false, length: 2 }, offset: 10, alpha: 0.35, moveMul: { enabled: true, mul: 1 }, fireMul: { enabled: true, mul: 1 } },
  },
  sniper: { color: 7, useCustomColor: false, hexColor: { enabled: false, value: "FFFFFFFF" }, dot: { enabled: true, width: 1, alpha: 0.75 } },
};
