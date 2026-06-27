"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { drawCrosshair } from "@/lib/crosshair/builder/canvas";
import { BG_TILES } from "@/lib/crosshair/builder/config";
import { parseCode } from "@/lib/crosshair/builder/utils";
import {
  getLikedCrosshairIds,
  getOrCreateAnonId,
  getViewedCrosshairIds,
  markCrosshairLiked,
  markCrosshairViewed,
} from "@/lib/crosshair/likes-client";
import type { CrosshairCategory, CrosshairStyle, CrosshairTag } from "@/lib/crosshair/metadata";

type CrosshairDetail = {
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

function formatStableDate(value: string): string {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toISOString().slice(0, 10);
}

export default function CrosshairDetailView({ item }: { item: CrosshairDetail }) {
  const canvasesRef = useRef<Array<HTMLCanvasElement | null>>([]);
  const [likesCount, setLikesCount] = useState<number>(item.likesCount);
  const [viewsCount, setViewsCount] = useState<number>(item.viewsCount);
  const [liked, setLiked] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    setLikesCount(item.likesCount);
    setViewsCount(item.viewsCount);
  }, [item.likesCount, item.viewsCount]);

  useEffect(() => {
    const likedIds = getLikedCrosshairIds();
    setLiked(likedIds.has(item.id));
  }, [item.id]);

  useEffect(() => {
    const addView = async (): Promise<void> => {
      const viewedIds = getViewedCrosshairIds();
      if (viewedIds.has(item.id)) return;

      try {
        const anonId = getOrCreateAnonId();
        const response = await fetch(`/api/crosshairs/${item.id}/view`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ anonId }),
        });

        const payload = (await response.json().catch(() => null)) as
          | { viewed?: boolean; viewsCount?: number }
          | null;

        if (response.ok && typeof payload?.viewsCount === "number") {
          setViewsCount(payload.viewsCount);
          markCrosshairViewed(item.id);
        }
      } catch {
        // Ignore view tracking failures so the detail page remains usable.
      }
    };

    void addView();
  }, [item.id]);

  useEffect(() => {
    try {
      const parsed = parseCode(item.code);
      for (const canvas of canvasesRef.current) {
        if (canvas) {
          drawCrosshair(parsed, canvas, "primary", 1);
        }
      }
    } catch {
      for (const canvas of canvasesRef.current) {
        const ctx = canvas?.getContext("2d");
        if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [item.code]);

  const createdLabel = formatStableDate(item.createdAt);

  const likeCrosshair = async (): Promise<void> => {
    if (liked) {
      setStatus("You already liked this crosshair");
      return;
    }

    setIsLiking(true);
    try {
      const anonId = getOrCreateAnonId();
      const response = await fetch(`/api/crosshairs/${item.id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ anonId }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { liked?: boolean; likesCount?: number; error?: string }
        | null;

      if (!response.ok) {
        setStatus(payload?.error || "Unable to like crosshair");
        return;
      }

      if (typeof payload?.likesCount === "number") {
        setLikesCount(payload.likesCount);
      }

      markCrosshairLiked(item.id);
      setLiked(true);
      setStatus(payload?.liked ? "Thanks for liking" : "You already liked this crosshair");
    } catch {
      setStatus("Unable to reach like API");
    } finally {
      setIsLiking(false);
    }
  };

  const discordCopyLabel = "Copy Link for Discord";

  const openShareWindow = (platform: "twitter" | "reddit"): void => {
    if (typeof window === "undefined") return;
    const pageUrl = window.location.href;
    const encodedText = encodeURIComponent(`${item.name} crosshair`);
    const encodedUrl = encodeURIComponent(pageUrl);
    const target =
      platform === "twitter"
        ? `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        : `https://www.reddit.com/submit?title=${encodedText}&url=${encodedUrl}`;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: item.name,
    description: `${item.category} ${item.style} crosshair code`,
    dateCreated: item.createdAt,
    keywords: item.tags.join(", "),
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: likesCount,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/ViewAction",
        userInteractionCount: viewsCount,
      },
    ],
  };

  return (
    <main className="mx-auto w-full max-w-[1200px] p-4 sm:p-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mb-3">
        <Link
          href="/crosshairs"
          className="inline-flex items-center rounded-md border border-slate-600 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800"
        >
          ← Back
        </Link>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <article className="rounded-xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-800 p-4 shadow-2xl shadow-black/35">
          <h1 className="text-2xl font-extrabold uppercase tracking-[0.04em] text-slate-100 sm:text-3xl md:text-4xl">{item.name || "Untitled"}</h1>
          <p className="mt-1 text-sm text-slate-400">Added: {createdLabel}</p>
          <p className="mt-1 text-sm text-slate-300">Category: {item.category} | Style: {item.style} | Color: {item.color}</p>
          <p className="mt-1 text-sm text-slate-300">Tags: {item.tags.join(", ") || "none"}</p>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.08em] text-rose-300">Likes: {likesCount} | Views: {viewsCount}</p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {BG_TILES.map((tile, idx) => (
              <div key={idx} className="rounded-lg border border-slate-700 bg-slate-900/60 p-2">
                <div className="rounded-md border border-slate-600 p-2" style={{ background: tile.color }}>
                  <canvas
                    ref={(el) => {
                      canvasesRef.current[idx] = el;
                    }}
                    width={256}
                    height={256}
                    className="mx-auto block h-[100px] w-[100px] [image-rendering:pixelated] sm:h-[130px] sm:w-[130px]"
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="h-fit rounded-xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-800 p-4 shadow-2xl shadow-black/35">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-[0.08em] text-slate-200">Crosshair Code</h2>
          <div className="mb-3 break-all rounded-md border border-slate-700 bg-slate-950 px-2 py-2 font-mono text-xs text-slate-200">
            {item.code}
          </div>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(item.code);
            }}
            className="w-full rounded-md border border-rose-500 bg-rose-500 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-rose-400"
          >
            Copy Code
          </button>

          <button
            type="button"
            onClick={() => {
              void likeCrosshair();
            }}
            disabled={liked || isLiking}
            className="mt-2 w-full rounded-md border border-teal-500 bg-teal-500 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLiking ? "Liking..." : liked ? "Liked" : "Like Crosshair"}
          </button>

          <div className="mt-3 grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => openShareWindow("twitter")}
              className="rounded-md border border-sky-500 bg-sky-500 px-3 py-2 text-center text-sm font-bold text-white transition-colors hover:bg-sky-400"
            >
              Share on Twitter
            </button>
            <button
              type="button"
              onClick={() => openShareWindow("reddit")}
              className="rounded-md border border-orange-500 bg-orange-500 px-3 py-2 text-center text-sm font-bold text-white transition-colors hover:bg-orange-400"
            >
              Share on Reddit
            </button>
            <button
              type="button"
              onClick={async () => {
                if (typeof window !== "undefined") {
                  await navigator.clipboard.writeText(window.location.href);
                  setStatus("Link copied for Discord");
                }
              }}
              className="rounded-md border border-indigo-500 bg-indigo-500 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-indigo-400"
            >
              {discordCopyLabel}
            </button>
          </div>

          <p className="mt-2 min-h-[18px] text-xs text-teal-300">{status}</p>
        </aside>
      </section>
    </main>
  );
}
