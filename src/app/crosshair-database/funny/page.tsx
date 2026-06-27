import type { Metadata } from "next";
import Link from "next/link";
import { getDatabase } from "@/lib/mongo";
import CrosshairsGallery from "@/components/CrosshairsGallery";
import type { CrosshairCategory, CrosshairTag, CrosshairStyle } from "@/lib/crosshair/metadata";

export const metadata: Metadata = {
  title: "Funny Valorant Crosshairs — Meme & Fun Codes | AimTrainerPro",
  description:
    "The funniest Valorant crosshair codes. Meme crosshairs, troll setups, amogus, smiley face, glasses, and more weird crosshair codes to use in unrated.",
  keywords: [
    "funny valorant crosshairs", "funny crosshair valorant", "meme crosshair valorant",
    "troll crosshair valorant", "valorant funny crosshair codes",
    "amogus crosshair valorant", "weird valorant crosshairs",
  ],
  alternates: { canonical: "/crosshair-database/funny" },
  openGraph: {
    title: "Funny Valorant Crosshairs — Meme Codes",
    description: "Browse and copy the funniest and most creative Valorant meme crosshair codes.",
  },
};

type CrosshairRow = {
  _id: { toString(): string };
  name?: string; code?: string; createdAt?: Date | string;
  category?: CrosshairCategory; tags?: CrosshairTag[]; color?: string;
  style?: CrosshairStyle; likesCount?: number; viewsCount?: number;
};

async function getFunnyCrosshairs() {
  try {
    const db = await getDatabase();
    return (await db.collection("crosshairs")
      .find({ category: "Meme" })
      .sort({ likesCount: -1, createdAt: -1 })
      .limit(100)
      .toArray()) as CrosshairRow[];
  } catch { return []; }
}

export default async function FunnyCrosshairsPage() {
  const rows = await getFunnyCrosshairs();
  const items = rows.map((row) => ({
    id: row._id.toString(),
    name: (row.name || "Untitled").trim(),
    code: (row.code || "").trim(),
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : "",
    category: row.category || "Meme" as CrosshairCategory,
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
          Funny Valorant <span className="text-cyan-400">Crosshairs</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-400 sm:text-base">
          Meme crosshairs, troll codes, and creative designs. Perfect for unrated, spike rush, and confusing your teammates.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link href="/crosshair-database" className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-cyan-400/50 sm:text-sm">
            All Crosshairs
          </Link>
          <Link href="/crosshair-database/best" className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-cyan-400/50 sm:text-sm">
            Best Crosshairs
          </Link>
        </div>
      </div>
      <CrosshairsGallery items={items} initialCategory="Meme" initialQuery="" />
    </div>
  );
}
