import {
  COLORS,
  LOGICAL_CANVAS_SIZE,
  PREVIEW_NUDGE_X,
  PREVIEW_NUDGE_Y,
} from "./config";
import type { CrosshairSection, Mode, Parsed } from "./types";

export function drawCrosshair(parsed: Parsed, canvas: HTMLCanvasElement, mode: Mode, zoom: number): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = canvas.width;
  const center = LOGICAL_CANVAS_SIZE / 2;
  const baseScale = size / LOGICAL_CANVAS_SIZE;
  const physicalCenter = size / 2;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(physicalCenter, physicalCenter);
  ctx.translate(PREVIEW_NUDGE_X, PREVIEW_NUDGE_Y);
  ctx.scale(baseScale * zoom, baseScale * zoom);
  ctx.translate(-center, -center);

  const section = mode === "ads" && !parsed.general.adsUsePrimary ? parsed.ads : parsed.primary;
  const color = section.color === 8 ? `#${section.hexColor.value.substring(0, 6)}` : COLORS[section.color] || COLORS[0];
  const outline = section.outlines;
  const outlineOffset = { xy: 0.5 * outline.width, wh: Number(outline.width) };

  const drawRect = (x: number, y: number, w: number, h: number, alpha: number): void => {
    if (w <= 0 || h <= 0) return;
    if (alpha > 0) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    }
    if (outline.enabled) {
      ctx.globalAlpha = outline.alpha;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = outline.width;
      ctx.strokeRect(x - outlineOffset.xy, y - outlineOffset.xy, w + outlineOffset.wh, h + outlineOffset.wh);
    }
    ctx.globalAlpha = 1;
  };

  if (mode === "sniper") {
    const s = parsed.sniper;
    const sniperColor = s.color === 8 ? `#${s.hexColor.value.substring(0, 6)}` : COLORS[s.color] || COLORS[7];
    if (s.dot.enabled) {
      const w = Math.max(1, s.dot.width);
      const p = center - Math.ceil(w / 2);
      ctx.fillStyle = sniperColor;
      ctx.globalAlpha = s.dot.alpha;
      ctx.fillRect(p, p, w, w);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    return;
  }

  if (section.dot.enabled) {
    const w = Math.max(1, section.dot.width);
    const p = center - Math.ceil(w / 2);
    drawRect(p, p, w, w, section.dot.alpha);
  }

  const drawLineGroup = (lines: CrosshairSection["inner"]): void => {
    if (!lines.enabled) return;

    const lineW = Math.max(1, lines.width);
    const lenH = lines.length;
    const lenV = lines.vertical.enabled ? lines.vertical.length : lines.length;
    const addFireGap = lines.fireMul.enabled && !section.overwriteFireMul;
    const off = lines.offset + (addFireGap ? 4 : 0);
    const parityShift = lineW % 2;
    const axis = Math.floor(center - lineW / 2);

    drawRect(center + off, axis, lenH, lineW, lines.alpha);
    drawRect(center - off - lenH - parityShift, axis, lenH, lineW, lines.alpha);
    drawRect(axis, center + off, lineW, lenV, lines.alpha);
    drawRect(axis, center - off - lenV - parityShift, lineW, lenV, lines.alpha);
  };

  drawLineGroup(section.inner);
  drawLineGroup(section.outer);
  ctx.restore();
}
