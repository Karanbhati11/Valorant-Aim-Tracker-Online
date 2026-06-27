import type { Metadata } from "next";
import Link from "next/link";
import { getDatabase } from "@/lib/mongo";
import CrosshairsGallery from "@/components/CrosshairsGallery";
import type { CrosshairCategory, CrosshairTag, CrosshairStyle } from "@/lib/crosshair/metadata";

export const metadata: Metadata = {
  title: "Dot Crosshair Valorant — Best Dot Crosshair Codes | AimTrainerPro",
  description:
    "The best dot crosshairs for Valorant. Minimal, clean dot crosshair codes for precise headshot aiming. Copy with one click. Used by TenZ, Demon1, and more.",
  keywords: [
    "dot crosshair valorant", "valorant dot crosshair", "dot crosshair",
    "valorant dot crosshair code", "best dot crosshair valorant",
    "small crosshair valorant", "minimal crosshair valorant",
  ],
  alternates: { canonical: "/crosshair-database/dot" },
  openGraph: {
    title: "Dot Crosshair Valorant — Minimal Dot Codes",
    description: "Browse and copy the cleanest dot crosshair codes for Valorant.",
  },
};

type CrosshairRow = {
  _id: { toString(): string };
  name?: string; code?: string; createdAt?: Date | string;
  category?: CrosshairCategory; tags?: CrosshairTag[]; color?: string;
  style?: CrosshairStyle; likesCount?: number; viewsCount?: number;
};

async function getDotCrosshairs() {
  try {
    const db = await getDatabase();
    return (await db.collection("crosshairs")
      .find({ $or: [{ style: "dot" }, { tags: "dot" }] })
      .sort({ likesCount: -1, createdAt: -1 })
      .limit(100)
      .toArray()) as CrosshairRow[];
  } catch { return []; }
}

export default async function DotCrosshairsPage() {
  const rows = await getDotCrosshairs();
  const items = rows.map((row) => ({
    id: row._id.toString(),
    name: (row.name || "Untitled").trim(),
    code: (row.code || "").trim(),
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : "",
    category: row.category || "Classic" as CrosshairCategory,
    tags: Array.isArray(row.tags) ? row.tags as CrosshairTag[] : [],
    color: row.color || "custom",
    style: (row.style || "dot") as CrosshairStyle,
    likesCount: typeof row.likesCount === "number" ? row.likesCount : 0,
    viewsCount: typeof row.viewsCount === "number" ? row.viewsCount : 0,
  }));

  return (
    <div className="min-h-screen bg-[#0b0f17]">
      <div className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-transparent px-4 py-8 text-center sm:px-6 sm:py-12">
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Dot Crosshair <span className="text-cyan-400">Valorant</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-400 sm:text-base">
          Clean, minimal dot crosshairs for pixel-perfect headshots. The go-to style for pros like TenZ, Demon1, and Derke.
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
      <CrosshairsGallery items={items} initialCategory="all" initialQuery="dot" />
    </div>
  );
}
