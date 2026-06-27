import type { Metadata } from "next";
import Link from "next/link";
import { getDatabase } from "@/lib/mongo";
import CrosshairsGallery from "@/components/CrosshairsGallery";
import type { CrosshairCategory, CrosshairTag, CrosshairStyle } from "@/lib/crosshair/metadata";

export const metadata: Metadata = {
  title: "Best Valorant Crosshairs 2025 — Top Rated Codes | AimTrainerPro",
  description:
    "The best Valorant crosshairs voted by the community. Copy the most liked crosshair codes used by pro and competitive players. Updated regularly.",
  keywords: [
    "best valorant crosshair", "best valorant crosshairs", "best crosshair valorant",
    "best crosshair for valorant", "valorant best crosshair", "top valorant crosshairs",
    "best crosshair codes valorant", "valorant crosshair codes",
  ],
  alternates: { canonical: "/crosshair-database/best" },
  openGraph: {
    title: "Best Valorant Crosshairs — Most Liked Codes",
    description: "Browse and copy the top-rated Valorant crosshair codes from our community database.",
  },
};

type CrosshairRow = {
  _id: { toString(): string };
  name?: string; code?: string; createdAt?: Date | string;
  category?: CrosshairCategory; tags?: CrosshairTag[]; color?: string;
  style?: CrosshairStyle; likesCount?: number; viewsCount?: number;
};

async function getTopCrosshairs() {
  try {
    const db = await getDatabase();
    return (await db.collection("crosshairs")
      .find({})
      .sort({ likesCount: -1, viewsCount: -1 })
      .limit(100)
      .toArray()) as CrosshairRow[];
  } catch { return []; }
}

export default async function BestCrosshairsPage() {
  const rows = await getTopCrosshairs();
  const items = rows.map((row) => ({
    id: row._id.toString(),
    name: (row.name || "Untitled").trim(),
    code: (row.code || "").trim(),
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : "",
    category: row.category || "Classic" as CrosshairCategory,
    tags: Array.isArray(row.tags) ? row.tags as CrosshairTag[] : [],
    color: row.color || "custom",
    style: (row.style || "plus") as CrosshairStyle,
    likesCount: typeof row.likesCount === "number" ? row.likesCount : 0,
    viewsCount: typeof row.viewsCount === "number" ? row.viewsCount : 0,
  }));

  return (
    <div className="min-h-screen bg-[#0b0f17]">
      <div className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-transparent px-4 py-8 text-center sm:px-6 sm:py-12">
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Best Valorant <span className="text-cyan-400">Crosshairs</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-400 sm:text-base">
          The most liked and used crosshair codes from our community. Copy any code with one click and import directly into Valorant.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link href="/crosshair-database" className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-cyan-400/50 sm:text-sm">
            All Crosshairs
          </Link>
          <Link href="/crosshair-database/dot" className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-cyan-400/50 sm:text-sm">
            Dot Crosshairs
          </Link>
          <Link href="/crosshair-database/funny" className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-cyan-400/50 sm:text-sm">
            Funny Crosshairs
          </Link>
        </div>
      </div>
      <CrosshairsGallery items={items} initialCategory="all" initialQuery="" />
    </div>
  );
}
