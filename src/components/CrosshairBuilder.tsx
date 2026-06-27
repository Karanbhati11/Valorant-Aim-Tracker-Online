"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BG_TILES,
  DEFAULTS,
  PREVIEW_ZOOM_MAX,
  PREVIEW_ZOOM_MIN,
  PREVIEW_ZOOM_STEP,
} from "@/lib/crosshair/builder/config";
import FieldRow from "@/lib/crosshair/builder/FieldRow";
import { drawCrosshair } from "@/lib/crosshair/builder/canvas";
import type { Mode, Parsed } from "@/lib/crosshair/builder/types";
import {
  clone,
  convertToCode,
  parseCode,
  randomizePrimary,
} from "@/lib/crosshair/builder/utils";
import {
  CROSSHAIR_CATEGORIES,
  CROSSHAIR_TAGS,
  type CrosshairCategory,
  type CrosshairTag,
} from "@/lib/crosshair/metadata";
import type {
  SaveCrosshairInput,
  SaveCrosshairResult,
} from "@/lib/crosshair/actions";

type CrosshairBuilderProps = {
  onSaveCrosshair: (input: SaveCrosshairInput) => Promise<SaveCrosshairResult>;
};

export default function CrosshairBuilder({
  onSaveCrosshair,
}: CrosshairBuilderProps) {
  const [model, setModel] = useState<Parsed>(clone(DEFAULTS));
  const [mode, setMode] = useState<Mode>("primary");
  const [zoom, setZoom] = useState<number>(1);
  const [status, setStatus] = useState<string>("");
  const [codeInput, setCodeInput] = useState<string>(convertToCode(DEFAULTS));
  const [crosshairName, setCrosshairName] = useState<string>("");
  const [category, setCategory] = useState<CrosshairCategory>("Classic");
  const [selectedTags, setSelectedTags] = useState<CrosshairTag[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const canvasesRef = useRef<Array<HTMLCanvasElement | null>>([]);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copiedAction, setCopiedAction] = useState<"code" | "share" | null>(
    null,
  );
  const [clipboardNotice, setClipboardNotice] = useState<string>("");
  const [clipboardNoticeError, setClipboardNoticeError] =
    useState<boolean>(false);

  const p = model.primary;
  const innerLinked = !p.inner.vertical.enabled;
  const outerLinked = !p.outer.vertical.enabled;

  const computedCode = useMemo(() => convertToCode(model), [model]);
  const baseActionButtonClass =
    "inline-flex items-center justify-center rounded-md px-3 py-2.5 text-sm font-semibold text-zinc-100 transition-colors";
  const copyButtonClass = `${baseActionButtonClass} bg-zinc-700 hover:bg-zinc-600`;
  const pasteButtonClass = `${baseActionButtonClass} bg-zinc-700 hover:bg-zinc-600`;
  const shareButtonClass = `${baseActionButtonClass} bg-zinc-700 hover:bg-zinc-600`;
  const zoomButtonClass =
    "rounded-md bg-zinc-700 px-2.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-600";
  const toggleButtonClass = (enabled: boolean): string =>
    `inline-flex w-full items-center justify-center border p-2 text-xs font-bold uppercase tracking-[0.13em] transition-colors ${
      enabled
        ? "border-cyan-300 bg-cyan-400 text-slate-950"
        : "border-zinc-600 bg-zinc-900 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800"
    }`;
  const modeButtonClass = (value: Mode): string =>
    `inline-flex min-w-[88px] items-center justify-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
      mode === value
        ? "bg-cyan-400 text-slate-950"
        : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
    }`;
  const inactiveTabClass =
    "bg-zinc-800 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500";
  const sectionHeaderClass =
    "mb-0 mt-3 bg-zinc-800/80 px-2.5 py-2 text-sm font-bold uppercase tracking-[0.12em] text-zinc-100 ring-1 ring-zinc-700/80 first:mt-0";
  const chapterHeaderClass =
    "mb-0 mt-3 bg-zinc-800/80 px-2.5 py-2 text-sm font-bold uppercase tracking-[0.12em] text-zinc-100 ring-1 ring-zinc-700/80";

  const renderToggleControl = (
    enabled: boolean,
    onChange: (next: boolean) => void,
  ) => (
    <div className="grid w-full grid-cols-2 gap-1 rounded-md bg-zinc-700/40 p-1">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${enabled ? "bg-zinc-500 text-white" : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"}`}
      >
        On
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${!enabled ? "bg-zinc-500 text-white" : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"}`}
      >
        Off
      </button>
    </div>
  );

  const renderSliderControl = (
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (next: number) => void,
    formatter?: (n: number) => string,
  ) => (
    <div className="grid w-full grid-cols-[56px_1fr] items-center gap-2">
      <span className="text-center text-sm font-semibold text-zinc-200">
        {formatter ? formatter(value) : value}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-zinc-200"
      />
    </div>
  );

  const saveToDatabase = async (): Promise<void> => {
    const name = crosshairName.trim();
    const code = codeInput.trim();
    if (!name) {
      setStatus("Enter a crosshair name");
      return;
    }
    if (!code) {
      setStatus("Crosshair code is empty");
      return;
    }

    setIsSaving(true);
    try {
      const result = await onSaveCrosshair({
        name,
        code,
        category,
        tags: selectedTags,
      });
      if (!result.ok) {
        setStatus(result.error || "Failed to save crosshair");
        return;
      }

      setStatus("Saved to database");
      setCrosshairName("");
      setSelectedTags([]);
      setCategory("Classic");
    } catch {
      setStatus("Unable to save right now");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setCodeInput(computedCode);
  }, [computedCode]);

  useEffect(() => {
    for (const canvas of canvasesRef.current) {
      if (canvas) drawCrosshair(model, canvas, mode, zoom);
    }
  }, [model, mode, zoom]);

  const updatePrimary = (updater: (draft: Parsed) => void): void => {
    setModel((prev) => {
      const next = clone(prev);
      updater(next);
      return next;
    });
    setStatus("Updated");
  };

  const loadCode = (): void => {
    try {
      const next = parseCode(codeInput);
      setModel(next);
      setStatus("Code loaded");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Invalid code");
    }
  };

  const randomize = (): void => {
    setModel((prev) => randomizePrimary(prev));
    setStatus("Randomized");
  };

  const toggleTag = (tag: CrosshairTag): void => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const showCopiedState = (action: "code" | "share"): void => {
    setCopiedAction(action);
    setClipboardNoticeError(false);
    setClipboardNotice(
      action === "code"
        ? "Code copied to clipboard"
        : "Share link copied to clipboard",
    );
    if (copiedTimeoutRef.current) {
      clearTimeout(copiedTimeoutRef.current);
    }
    copiedTimeoutRef.current = setTimeout(() => {
      setCopiedAction(null);
      setClipboardNotice("");
      setClipboardNoticeError(false);
    }, 1600);
  };

  const showCopyError = (message: string): void => {
    setCopiedAction(null);
    setClipboardNoticeError(true);
    setClipboardNotice(message);
    if (copiedTimeoutRef.current) {
      clearTimeout(copiedTimeoutRef.current);
    }
    copiedTimeoutRef.current = setTimeout(() => {
      setClipboardNotice("");
      setClipboardNoticeError(false);
    }, 2000);
  };

  const copyTextToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        return ok;
      } catch {
        return false;
      }
    }
  };

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  return (
    <main className="mx-auto grid w-full max-w-[2320px] grid-cols-1 gap-3 p-4 sm:p-5 xl:grid-cols-[0.72fr_1.28fr]">
      <section className="rounded-lg bg-zinc-900/95 p-4 shadow-[0_8px_28px_rgba(0,0,0,0.35)] ring-1 ring-zinc-700/80 xl:sticky xl:top-20 xl:h-fit">
        <h1 className="mb-3 text-sm font-extrabold uppercase tracking-[0.14em] text-zinc-200">
          Builder Settings
        </h1>

        <div className="mb-3 rounded-md bg-zinc-800/40 p-2.5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-zinc-400">
            Preview
          </div>
          <div className="grid grid-cols-2 gap-2">
            {BG_TILES.map((tile, idx) => (
              <div
                key={tile.label}
                className="rounded-sm p-1.5"
                style={{ background: tile.color }}
              >
                <div className="mb-1 mx-auto w-fit bg-black/55 px-1.5 py-0.5 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-50">
                  {tile.label}
                </div>
                <canvas
                  ref={(el) => {
                    canvasesRef.current[idx] = el;
                  }}
                  width={256}
                  height={256}
                  className="mx-auto block h-[150px] w-[150px] [image-rendering:pixelated] sm:h-[168px] sm:w-[168px]"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3 rounded-md bg-zinc-800/40 px-2.5 py-2">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-zinc-400">
            Preview Size
          </div>
          <div className="mx-auto flex w-full max-w-[420px] items-center gap-2">
            <span className="mr-auto text-[11px] font-semibold uppercase tracking-[0.13em] text-zinc-300">
              Scale
            </span>
            <button
              className={zoomButtonClass}
              type="button"
              onClick={() =>
                setZoom((z) =>
                  Math.max(PREVIEW_ZOOM_MIN, z - PREVIEW_ZOOM_STEP),
                )
              }
            >
              -
            </button>
            <button
              className={zoomButtonClass}
              type="button"
              onClick={() => setZoom(1)}
            >
              Reset
            </button>
            <button
              className={zoomButtonClass}
              type="button"
              onClick={() =>
                setZoom((z) =>
                  Math.min(PREVIEW_ZOOM_MAX, z + PREVIEW_ZOOM_STEP),
                )
              }
            >
              +
            </button>
            <span className="min-w-11 text-right text-xs font-semibold text-zinc-200">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        <div className="mb-3 rounded-md bg-zinc-800/40 p-2.5">
          <label className="mb-2 block text-sm text-zinc-300">
            <span className="text-[11px] font-semibold uppercase tracking-[0.13em] text-zinc-400">
              Crosshair Code
            </span>
            <input
              className="mt-1 w-full rounded-md bg-zinc-800 px-3 py-2 text-zinc-100"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              onBlur={loadCode}
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              className={`${copyButtonClass} ${copiedAction === "code" ? "bg-emerald-400 text-slate-950" : ""}`}
              type="button"
              onClick={async () => {
                const ok = await copyTextToClipboard(codeInput);
                if (ok) {
                  showCopiedState("code");
                  setStatus("Code copied");
                } else {
                  showCopyError(
                    "Unable to copy. Check browser clipboard permissions.",
                  );
                  setStatus("Clipboard copy failed");
                }
              }}
            >
              {copiedAction === "code" ? "Copied!" : "Copy Code"}
            </button>
            <button
              className={pasteButtonClass}
              type="button"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setCodeInput(text);
                  const next = parseCode(text);
                  setModel(next);
                  setStatus("Code pasted");
                } catch {
                  setStatus("Clipboard parse failed");
                }
              }}
            >
              Paste Code
            </button>
            <button
              className="inline-flex items-center justify-center rounded-md px-3 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.03]"
              style={{
                background: "linear-gradient(90deg, #a855f7 0%, #ec4899 50%, #fb923c 100%)",
                boxShadow: "0 4px 14px rgba(236, 72, 153, 0.35)",
              }}
              type="button"
              onClick={randomize}
            >
              🎲 Randomize
            </button>
            <button
              className={`${shareButtonClass} ${copiedAction === "share" ? "bg-emerald-400 text-slate-950" : ""}`}
              type="button"
              onClick={async () => {
                const url = `${window.location.origin}${window.location.pathname}?c=${encodeURIComponent(codeInput)}`;
                const ok = await copyTextToClipboard(url);
                if (ok) {
                  showCopiedState("share");
                  setStatus("Share URL copied");
                } else {
                  showCopyError(
                    "Unable to copy link. Check browser clipboard permissions.",
                  );
                  setStatus("Clipboard copy failed");
                }
              }}
            >
              {copiedAction === "share" ? "Copied!" : "Share Link"}
            </button>
          </div>

          {clipboardNotice ? (
            <p
              className={`mt-2 text-xs font-semibold uppercase tracking-[0.12em] ${clipboardNoticeError ? "text-rose-300" : "text-emerald-300"}`}
            >
              {clipboardNotice}
            </p>
          ) : null}
        </div>

        <div className="mb-3 rounded-md bg-zinc-800/40 p-2.5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-zinc-400">
            Save Loadout
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
            <input
              type="text"
              placeholder="Crosshair name"
              value={crosshairName}
              onChange={(e) => setCrosshairName(e.target.value)}
              className="w-full rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
            />
            <select
              aria-label="Crosshair category"
              value={category}
              onChange={(e) => setCategory(e.target.value as CrosshairCategory)}
              className="w-full rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
            >
              {CROSSHAIR_CATEGORIES.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2 rounded-md bg-zinc-800 px-3 py-2">
            <div className="mb-1 text-xs font-semibold uppercase tracking-[0.11em] text-zinc-400">
              Tags
            </div>
            <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto pr-1">
              {CROSSHAIR_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-sm px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.11em] ${
                      active
                        ? "bg-cyan-400 text-slate-950"
                        : "bg-zinc-700 text-zinc-200"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            className="mt-2 inline-flex w-fit items-center justify-center rounded-md px-3 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: "linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
            }}
            type="button"
            disabled={isSaving}
            onClick={saveToDatabase}
          >
            {isSaving ? "Saving..." : "💾 Save to DB"}
          </button>
        </div>

        <p className="min-h-[18px] text-sm text-cyan-300">{status}</p>
      </section>

      <section className="bg-zinc-900/95 p-4 shadow-[0_8px_28px_rgba(0,0,0,0.35)] ring-1 ring-zinc-700/80">
        {/* <div className="mb-3">
          <div className="border border-zinc-700 bg-zinc-900/80 px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">SETTINGS / CROSSHAIR</div>
            <h2 className="mt-1 text-sm font-bold uppercase tracking-[0.14em] text-zinc-100">EDIT PROFILE</h2>
          </div>
        </div> */}

        <div className="mb-3 flex flex-wrap gap-2">
          {/* <button type="button" className={inactiveTabClass}>General</button> */}
          <button
            type="button"
            onClick={() => setMode("primary")}
            className={modeButtonClass("primary")}
          >
            Primary
          </button>
          <button
            type="button"
            onClick={() => setMode("ads")}
            className={modeButtonClass("ads")}
          >
            ADS
          </button>
          <button
            type="button"
            onClick={() => setMode("sniper")}
            className={modeButtonClass("sniper")}
          >
            Sniper
          </button>
        </div>

        <div className="overflow-hidden">
          <div className={sectionHeaderClass}>Crosshair</div>
          <FieldRow name="Crosshair Color" alt={false}>
            <select
              aria-label="Crosshair color"
              value={p.color}
              onChange={(e) =>
                updatePrimary((d) => {
                  d.primary.color = Number(e.target.value);
                  d.primary.hexColor.enabled = d.primary.color === 8;
                })
              }
              className="w-full bg-zinc-800 px-2 py-1.5 text-xs uppercase tracking-[0.1em] text-zinc-100 ring-1 ring-zinc-600/80"
            >
              <option value={0}>White</option>
              <option value={1}>Green</option>
              <option value={2}>Yellow Green</option>
              <option value={3}>Green Yellow</option>
              <option value={4}>Yellow</option>
              <option value={5}>Cyan</option>
              <option value={6}>Pink</option>
              <option value={7}>Red</option>
              <option value={8}>Custom</option>
            </select>
          </FieldRow>

          <FieldRow name="Custom Color" alt={true}>
            <div className="grid w-full grid-cols-[56px_1fr] items-center gap-2">
              <input
                type="color"
                value={`#${p.hexColor.value.slice(-6)}`}
                onChange={(e) =>
                  updatePrimary((d) => {
                    d.primary.hexColor.value = `FF${e.target.value.replace("#", "").toUpperCase()}`;
                  })
                }
                className="h-10 w-full bg-zinc-800 p-0 ring-1 ring-zinc-600/80"
              />
              <input
                type="text"
                readOnly
                value={`#${p.hexColor.value.slice(-6)}`}
                className="h-10 w-full bg-zinc-800 px-2 text-center text-sm font-semibold uppercase text-zinc-100 ring-1 ring-zinc-600/80"
              />
            </div>
          </FieldRow>

          <FieldRow name="Outlines" alt={false}>
            {renderToggleControl(p.outlines.enabled, (next) =>
              updatePrimary((d) => {
                d.primary.outlines.enabled = next;
              }),
            )}
          </FieldRow>

          <FieldRow name="Outline Opacity" alt={true}>
            {renderSliderControl(
              p.outlines.alpha,
              0,
              1,
              0.001,
              (next) =>
                updatePrimary((d) => {
                  d.primary.outlines.alpha = next;
                }),
              (n) => n.toFixed(3).replace(/0+$/, "").replace(/\.$/, ""),
            )}
          </FieldRow>
          <FieldRow name="Outline Thickness" alt={false}>
            {renderSliderControl(p.outlines.width, 1, 6, 1, (next) =>
              updatePrimary((d) => {
                d.primary.outlines.width = next;
              }),
            )}
          </FieldRow>

          <FieldRow name="Center Dot" alt={true}>
            {renderToggleControl(p.dot.enabled, (next) =>
              updatePrimary((d) => {
                d.primary.dot.enabled = next;
              }),
            )}
          </FieldRow>
          <FieldRow name="Center Dot Opacity" alt={false}>
            {renderSliderControl(
              p.dot.alpha,
              0,
              1,
              0.001,
              (next) =>
                updatePrimary((d) => {
                  d.primary.dot.alpha = next;
                }),
              (n) => n.toFixed(3).replace(/0+$/, "").replace(/\.$/, ""),
            )}
          </FieldRow>
          <FieldRow name="Center Dot Thickness" alt={true}>
            {renderSliderControl(p.dot.width, 1, 6, 1, (next) =>
              updatePrimary((d) => {
                d.primary.dot.width = next;
              }),
            )}
          </FieldRow>

          <FieldRow
            name="Override Firing Error Offset With Crosshair Offset"
            alt={false}
          >
            {renderToggleControl(p.overwriteFireMul, (next) =>
              updatePrimary((d) => {
                d.primary.overwriteFireMul = next;
              }),
            )}
          </FieldRow>

          <div className={chapterHeaderClass}>Inner Lines</div>
          <FieldRow name="Show Inner Lines" alt={false}>
            {renderToggleControl(p.inner.enabled, (next) =>
              updatePrimary((d) => {
                d.primary.inner.enabled = next;
              }),
            )}
          </FieldRow>
          <FieldRow name="Inner Line Opacity" alt={true}>
            {renderSliderControl(
              p.inner.alpha,
              0,
              1,
              0.001,
              (next) =>
                updatePrimary((d) => {
                  d.primary.inner.alpha = next;
                }),
              (n) => n.toFixed(3).replace(/0+$/, "").replace(/\.$/, ""),
            )}
          </FieldRow>

          <FieldRow name="Inner Line Length" alt={false}>
            <div className="grid w-full grid-cols-[28px_1fr_30px_28px_1fr] items-center gap-2">
              <span className="text-center text-sm font-semibold text-zinc-200">
                {p.inner.length}
              </span>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={p.inner.length}
                onChange={(e) =>
                  updatePrimary((d) => {
                    const v = Number(e.target.value);
                    d.primary.inner.length = v;
                    if (!d.primary.inner.vertical.enabled)
                      d.primary.inner.vertical.length = v;
                  })
                }
                className="w-full accent-zinc-200"
              />
              <button
                type="button"
                title={
                  innerLinked ? "Unlink inner lengths" : "Link inner lengths"
                }
                aria-label={
                  innerLinked ? "Unlink inner lengths" : "Link inner lengths"
                }
                onClick={() =>
                  updatePrimary((d) => {
                    d.primary.inner.vertical.enabled =
                      !d.primary.inner.vertical.enabled;
                    if (!d.primary.inner.vertical.enabled)
                      d.primary.inner.vertical.length = d.primary.inner.length;
                  })
                }
                className={`h-[34px] w-[34px] p-0 ring-1 ${innerLinked ? "bg-zinc-300 ring-zinc-500" : "bg-zinc-200 ring-zinc-600"}`}
                style={{
                  backgroundImage: `url(${innerLinked ? "/img/unlink.png" : "/img/link.png"})`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "18px 18px",
                }}
              />
              <span className="text-center text-sm font-semibold text-zinc-200">
                {innerLinked ? p.inner.length : p.inner.vertical.length}
              </span>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                disabled={innerLinked}
                value={innerLinked ? p.inner.length : p.inner.vertical.length}
                onChange={(e) =>
                  updatePrimary((d) => {
                    d.primary.inner.vertical.length = Number(e.target.value);
                  })
                }
                className="w-full accent-zinc-200"
              />
            </div>
          </FieldRow>

          <FieldRow name="Inner Line Thickness" alt={true}>
            {renderSliderControl(p.inner.width, 0, 10, 1, (next) =>
              updatePrimary((d) => {
                d.primary.inner.width = next;
              }),
            )}
          </FieldRow>
          <FieldRow name="Inner Line Offset" alt={false}>
            {renderSliderControl(p.inner.offset, 0, 20, 1, (next) =>
              updatePrimary((d) => {
                d.primary.inner.offset = next;
              }),
            )}
          </FieldRow>
          <FieldRow name="Firing Error" alt={true}>
            {renderToggleControl(p.inner.fireMul.enabled, (next) =>
              updatePrimary((d) => {
                d.primary.inner.fireMul.enabled = next;
              }),
            )}
          </FieldRow>
          <FieldRow name="Firing Error Multiplier" alt={false}>
            {renderSliderControl(
              p.inner.fireMul.mul,
              0,
              3,
              0.1,
              (next) =>
                updatePrimary((d) => {
                  d.primary.inner.fireMul.mul = next;
                }),
              (n) => n.toFixed(1),
            )}
          </FieldRow>

          <div className={chapterHeaderClass}>Outer Lines</div>
          <FieldRow name="Show Outer Lines" alt={false}>
            {renderToggleControl(p.outer.enabled, (next) =>
              updatePrimary((d) => {
                d.primary.outer.enabled = next;
              }),
            )}
          </FieldRow>
          <FieldRow name="Outer Line Opacity" alt={true}>
            {renderSliderControl(
              p.outer.alpha,
              0,
              1,
              0.001,
              (next) =>
                updatePrimary((d) => {
                  d.primary.outer.alpha = next;
                }),
              (n) => n.toFixed(3).replace(/0+$/, "").replace(/\.$/, ""),
            )}
          </FieldRow>

          <FieldRow name="Outer Line Length" alt={false}>
            <div className="grid w-full grid-cols-[28px_1fr_30px_28px_1fr] items-center gap-2">
              <span className="text-center text-sm font-semibold text-zinc-200">
                {p.outer.length}
              </span>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={p.outer.length}
                onChange={(e) =>
                  updatePrimary((d) => {
                    const v = Number(e.target.value);
                    d.primary.outer.length = v;
                    if (!d.primary.outer.vertical.enabled)
                      d.primary.outer.vertical.length = v;
                  })
                }
                className="w-full accent-zinc-200"
              />
              <button
                type="button"
                title={
                  outerLinked ? "Unlink outer lengths" : "Link outer lengths"
                }
                aria-label={
                  outerLinked ? "Unlink outer lengths" : "Link outer lengths"
                }
                onClick={() =>
                  updatePrimary((d) => {
                    d.primary.outer.vertical.enabled =
                      !d.primary.outer.vertical.enabled;
                    if (!d.primary.outer.vertical.enabled)
                      d.primary.outer.vertical.length = d.primary.outer.length;
                  })
                }
                className={`h-[34px] w-[34px] p-0 ring-1 ${outerLinked ? "bg-zinc-300 ring-zinc-500" : "bg-zinc-200 ring-zinc-600"}`}
                style={{
                  backgroundImage: `url(${outerLinked ? "/img/unlink.png" : "/img/link.png"})`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "18px 18px",
                }}
              />
              <span className="text-center text-sm font-semibold text-zinc-200">
                {outerLinked ? p.outer.length : p.outer.vertical.length}
              </span>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                disabled={outerLinked}
                value={outerLinked ? p.outer.length : p.outer.vertical.length}
                onChange={(e) =>
                  updatePrimary((d) => {
                    d.primary.outer.vertical.length = Number(e.target.value);
                  })
                }
                className="w-full accent-zinc-200"
              />
            </div>
          </FieldRow>

          <FieldRow name="Outer Line Thickness" alt={true}>
            {renderSliderControl(p.outer.width, 0, 10, 1, (next) =>
              updatePrimary((d) => {
                d.primary.outer.width = next;
              }),
            )}
          </FieldRow>
          <FieldRow name="Outer Line Offset" alt={false}>
            {renderSliderControl(p.outer.offset, 0, 40, 1, (next) =>
              updatePrimary((d) => {
                d.primary.outer.offset = next;
              }),
            )}
          </FieldRow>
          <FieldRow name="Firing Error" alt={true}>
            {renderToggleControl(p.outer.fireMul.enabled, (next) =>
              updatePrimary((d) => {
                d.primary.outer.fireMul.enabled = next;
              }),
            )}
          </FieldRow>
          <FieldRow name="Firing Error Multiplier" alt={false}>
            {renderSliderControl(
              p.outer.fireMul.mul,
              0,
              3,
              0.1,
              (next) =>
                updatePrimary((d) => {
                  d.primary.outer.fireMul.mul = next;
                }),
              (n) => n.toFixed(1),
            )}
          </FieldRow>
        </div>
      </section>

      {clipboardNotice ? (
        <div className="pointer-events-none fixed bottom-5 right-5 z-50">
          <div
            role="status"
            aria-live="polite"
            className={`rounded-md px-4 py-2 text-sm font-semibold shadow-lg ${
              clipboardNoticeError
                ? "bg-rose-500 text-white"
                : "bg-emerald-400 text-slate-950"
            }`}
          >
            {clipboardNotice}
          </div>
        </div>
      ) : null}
    </main>
  );
}
