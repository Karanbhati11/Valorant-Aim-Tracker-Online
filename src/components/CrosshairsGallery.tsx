"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { drawCrosshair } from "@/lib/crosshair/builder/canvas";
import { BG_TILES } from "@/lib/crosshair/builder/config";
import { parseCode } from "@/lib/crosshair/builder/utils";
import type { Parsed } from "@/lib/crosshair/builder/types";
import {
  getLikedCrosshairIds,
  getOrCreateAnonId,
  markCrosshairLiked,
} from "@/lib/crosshair/likes-client";
import {
  CROSSHAIR_CATEGORIES,
  CROSSHAIR_STYLES,
  type CrosshairCategory,
  type CrosshairStyle,
  type CrosshairTag,
} from "@/lib/crosshair/metadata";

type CrosshairItem = {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  category: CrosshairCategory;
  tags: CrosshairTag[];
  color: string;
  style: CrosshairStyle;
  likesCount: number;
  viewsCount: number;
};

type SortKey = "newest" | "most-liked" | "most-viewed" | "name-asc";
const PAGE_SIZE = 36;
const CARD_CROSSHAIR_ZOOM = 1.35;

function getVisiblePages(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

function safeParsed(code: string): Parsed | null {
  try {
    return parseCode(code);
  } catch {
    return null;
  }
}

type CrosshairsGalleryProps = {
  items: CrosshairItem[];
  initialCategory?: string;
  initialQuery?: string;
};

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.9"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 20.2C9.6 18.2 2.5 13.1 2.5 8.3c0-2.5 2-4.5 4.5-4.5 1.9 0 3.5.9 5 2.8 1.5-1.9 3.1-2.8 5-2.8 2.5 0 4.5 2 4.5 4.5 0 4.8-7.1 9.9-9.5 11.9Z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </svg>
  );
}

function normalizeInitialCategory(value: string | undefined): string {
  if (!value) return "all";
  if (value.toLowerCase() === "all") return "all";
  const match = CROSSHAIR_CATEGORIES.find(
    (entry) => entry.toLowerCase() === value.toLowerCase(),
  );
  return match || "all";
}

export default function CrosshairsGallery({
  items,
  initialCategory,
  initialQuery,
}: CrosshairsGalleryProps) {
  const [query, setQuery] = useState<string>(initialQuery || "");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [categoryFilter, setCategoryFilter] = useState<string>(
    normalizeInitialCategory(initialCategory),
  );
  const [colorFilter, setColorFilter] = useState<string>("all");
  const [styleFilter, setStyleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [likesById, setLikesById] = useState<Record<string, number>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.likesCount])),
  );
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set<string>());
  const [likeStatus, setLikeStatus] = useState<string>("");
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set<string>());
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const [visibleCanvasIds, setVisibleCanvasIds] = useState<Set<string>>(
    new Set<string>(),
  );
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(initialQuery || "");
    setCategoryFilter(normalizeInitialCategory(initialCategory));
  }, [initialCategory, initialQuery]);

  useEffect(() => {
    setLikesById(
      Object.fromEntries(items.map((item) => [item.id, item.likesCount])),
    );
  }, [items]);

  useEffect(() => {
    setLikedIds(getLikedCrosshairIds());
  }, []);

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
    if (!likeStatus) return;
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => setLikeStatus(""), 1800);
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [likeStatus]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const colorOptions = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) set.add(item.color || "custom");
    return Array.from(set).sort();
  }, [items]);

  const likeCrosshair = async (id: string): Promise<void> => {
    if (likedIds.has(id)) {
      setLikeStatus("You already liked this crosshair");
      return;
    }

    if (likingIds.has(id)) return;

    setLikingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    try {
      const anonId = getOrCreateAnonId();
      const response = await fetch(`/api/crosshairs/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ anonId }),
      });

      const payload = (await response.json().catch(() => null)) as {
        liked?: boolean;
        likesCount?: number;
        error?: string;
      } | null;

      if (!response.ok) {
        setLikeStatus(payload?.error || "Unable to like crosshair");
        return;
      }

      const nextLikes =
        typeof payload?.likesCount === "number"
          ? payload.likesCount
          : likesById[id] || 0;
      setLikesById((prev) => ({ ...prev, [id]: nextLikes }));
      markCrosshairLiked(id);
      setLikedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      setLikeStatus(
        payload?.liked
          ? "Thanks for liking"
          : "You already liked this crosshair",
      );
    } catch {
      setLikeStatus("Unable to reach like API");
    } finally {
      setLikingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = items.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q));

      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      const matchesColor = colorFilter === "all" || item.color === colorFilter;
      const matchesStyle = styleFilter === "all" || item.style === styleFilter;

      return matchesSearch && matchesCategory && matchesColor && matchesStyle;
    });

    const next = [...base];
    if (sortBy === "name-asc") {
      next.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "most-liked") {
      next.sort(
        (a, b) =>
          (likesById[b.id] ?? b.likesCount) - (likesById[a.id] ?? a.likesCount),
      );
    } else if (sortBy === "most-viewed") {
      next.sort((a, b) => b.viewsCount - a.viewsCount);
    } else {
      next.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return next;
  }, [
    items,
    query,
    categoryFilter,
    colorFilter,
    styleFilter,
    sortBy,
    likesById,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visiblePages = useMemo(
    () => getVisiblePages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filtered.slice(start, end);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, sortBy, categoryFilter, colorFilter, styleFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleCanvasIds((prev) => {
          const next = new Set(prev);
          for (const entry of entries) {
            const id = (entry.target as HTMLElement).dataset.cardId;
            if (!id) continue;
            if (entry.isIntersecting) {
              next.add(id);
            }
          }
          return next;
        });
      },
      { rootMargin: "200px" },
    );

    for (const item of pagedItems) {
      const canvas = canvasRefs.current[item.id];
      if (canvas?.parentElement?.parentElement) {
        const host = canvas.parentElement.parentElement;
        host.dataset.cardId = item.id;
        observer.observe(host);
      }
    }

    return () => observer.disconnect();
  }, [pagedItems]);

  useEffect(() => {
    for (const item of pagedItems) {
      if (!visibleCanvasIds.has(item.id)) continue;
      const canvas = canvasRefs.current[item.id];
      if (!canvas) continue;

      const parsed = safeParsed(item.code);
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      if (!parsed) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        continue;
      }

      drawCrosshair(parsed, canvas, "primary", CARD_CROSSHAIR_ZOOM);
    }
  }, [pagedItems, visibleCanvasIds]);

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400 sm:text-sm">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/crosshairs"
            className="rounded-lg bg-cyan-400 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-900 transition-colors hover:bg-cyan-300 sm:text-xs"
          >
            Create Crosshair
          </Link>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg border border-zinc-800 bg-zinc-900/70 p-3 sm:grid-cols-3 lg:grid-cols-5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or tag..."
            className="col-span-2 w-full rounded-lg border border-zinc-700/60 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-400/50 focus:outline-none sm:col-span-3 lg:col-span-1"
          />

          <select
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-zinc-700/60 bg-zinc-950 px-2 py-2.5 text-xs text-zinc-100 focus:border-cyan-400/50 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {CROSSHAIR_CATEGORIES.map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>

          <select
            aria-label="Filter by color"
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
            className="rounded-lg border border-zinc-700/60 bg-zinc-950 px-2 py-2.5 text-xs text-zinc-100 focus:border-cyan-400/50 focus:outline-none"
          >
            <option value="all">All Colors</option>
            {colorOptions.map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>

          <select
            aria-label="Filter by style"
            value={styleFilter}
            onChange={(e) => setStyleFilter(e.target.value)}
            className="rounded-lg border border-zinc-700/60 bg-zinc-950 px-2 py-2.5 text-xs text-zinc-100 focus:border-cyan-400/50 focus:outline-none"
          >
            <option value="all">All Styles</option>
            {CROSSHAIR_STYLES.map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>

          <select
            aria-label="Sort crosshairs"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="rounded-lg border border-zinc-700/60 bg-zinc-950 px-2 py-2.5 text-xs text-zinc-100 focus:border-cyan-400/50 focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="most-liked">Most liked</option>
            <option value="most-viewed">Most viewed</option>
            <option value="name-asc">Name A-Z</option>
          </select>
        </div>

        <p className="sr-only" aria-live="polite">
          {likeStatus}
        </p>

        {filtered.length === 0 ? (
          <p className="text-sm text-slate-300">No crosshairs found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pagedItems.map((item) => {
                const isLiked = likedIds.has(item.id);
                const isLiking = likingIds.has(item.id);
                return (
                  <Link
                    key={item.id}
                    href={`/crosshair/${item.id}`}
                    className="block h-full"
                  >
                    <article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-700/60 bg-zinc-900/90 p-3 shadow-md transition-all duration-200 hover:-translate-y-[2px] hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-400/5 sm:p-4">
                      <div
                        className="relative flex h-[180px] items-center justify-center rounded-lg sm:h-[200px]"
                        style={{ background: BG_TILES[3].color }}
                      >
                        <canvas
                          ref={(el) => {
                            canvasRefs.current[item.id] = el;
                          }}
                          width={256}
                          height={256}
                          className="mx-auto block h-[120px] w-[120px] [image-rendering:pixelated] sm:h-[140px] sm:w-[140px]"
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <h2 className="truncate text-sm font-semibold text-zinc-100 sm:text-base">
                          {item.name || "Untitled"}
                        </h2>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            aria-label={isLiked ? "Already liked" : "Like crosshair"}
                            disabled={isLiked || isLiking}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              void likeCrosshair(item.id);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-400/20 bg-rose-500/10 text-rose-300 transition-colors hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <HeartIcon filled={isLiked} />
                          </button>
                          <button
                            type="button"
                            aria-label="Copy crosshair code"
                            onClick={async (event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              const ok = await copyTextToClipboard(item.code);
                              setLikeStatus(ok ? "Code copied to clipboard" : "Unable to copy code");
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 transition-colors hover:bg-cyan-400/20"
                          >
                            <CopyIcon />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-zinc-500">
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-medium">{item.category}</span>
                        <span>♥ {likesById[item.id] ?? item.likesCount}</span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 ? (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors ring-1 ring-slate-600/70 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-800"
                >
                  Previous
                </button>
                {visiblePages.map((entry, index) => {
                  if (entry === "ellipsis") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="select-none px-1 text-xs font-semibold text-slate-400"
                        aria-hidden="true"
                      >
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={entry}
                      type="button"
                      onClick={() => setCurrentPage(entry)}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                        entry === currentPage
                          ? "bg-cyan-300 text-slate-900"
                          : "bg-slate-900 text-slate-200 ring-1 ring-slate-600/70 hover:bg-slate-800"
                      }`}
                    >
                      {entry}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors ring-1 ring-slate-600/70 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-800"
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      {likeStatus ? (
        <div className="pointer-events-none fixed bottom-5 right-5 z-50">
          <div
            role="status"
            aria-live="polite"
            className={`rounded-md px-4 py-2 text-sm font-semibold shadow-lg ${
              /unable|failed|error/i.test(likeStatus)
                ? "bg-rose-500 text-white"
                : "bg-emerald-400 text-slate-950"
            }`}
          >
            {likeStatus}
          </div>
        </div>
      ) : null}
    </main>
  );
}
