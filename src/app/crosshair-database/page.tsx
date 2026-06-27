import type { Metadata } from "next";
import Link from "next/link";
import { getDatabase } from "@/lib/mongo";
import CrosshairsGallery from "@/components/CrosshairsGallery";
import type { CrosshairCategory, CrosshairTag, CrosshairStyle } from "@/lib/crosshair/metadata";
import { PRO_PLAYERS } from "@/lib/crosshair/pro-players";

export const metadata: Metadata = {
  title: "Valorant Crosshair Database — Codes, Pro Settings & Presets | AimTrainerPro",
  description:
    "Browse the largest Valorant crosshair database. Copy crosshair codes instantly — pro player presets, dot crosshairs, competitive styles, funny memes, and more. Updated daily.",
  keywords: [
    "valorant crosshair codes", "valorant crosshairs", "crosshair valorant",
    "valorant crosshair database", "crosshair", "best valorant crosshair",
    "dot crosshair valorant", "tenz crosshair", "val crosshairs",
    "valorant crosshair code", "best crosshair valorant", "valo crosshair",
    "pro crosshair valorant", "funny valorant crosshairs",
  ],
  openGraph: {
    title: "Valorant Crosshair Database | AimTrainerPro",
    description: "Search and copy Valorant crosshair codes. Pro presets, dot crosshairs, meme codes, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Valorant Crosshair Database — Copy Codes Instantly",
    description: "The largest collection of Valorant crosshair codes. Pro settings, dot, competitive, and funny crosshairs.",
  },
};

const COLLECTION_NAME = "crosshairs";

type CrosshairRow = {
  _id: { toString(): string };
  name?: string;
  code?: string;
  createdAt?: Date | string;
  category?: CrosshairCategory;
  tags?: CrosshairTag[];
  color?: string;
  style?: CrosshairStyle;
  likesCount?: number;
  viewsCount?: number;
};

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

async function getCrosshairs(): Promise<CrosshairRow[]> {
  try {
    const db = await getDatabase();
    const rows = (await db
      .collection(COLLECTION_NAME)
      .find({}, {
        projection: {
          name: 1, code: 1, createdAt: 1, category: 1,
          tags: 1, color: 1, style: 1, likesCount: 1, viewsCount: 1,
        },
      })
      .sort({ createdAt: -1 })
      .toArray()) as CrosshairRow[];
    return rows;
  } catch {
    return [];
  }
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CrosshairDatabasePage({ searchParams }: PageProps) {
  const params = (await searchParams) || {};
  const initialCategory = typeof params.category === "string" ? params.category : "all";
  const initialTag = typeof params.tag === "string" ? params.tag : "";
  const initialQuery = typeof params.q === "string" ? params.q : initialTag;

  const rows = await getCrosshairs();

  const items: CrosshairItem[] = rows.map((row) => ({
    id: row._id.toString(),
    name: (row.name || "Untitled").trim(),
    code: (row.code || "").trim(),
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : "",
    category: row.category || "Classic",
    tags: Array.isArray(row.tags) ? row.tags : [],
    color: row.color || "custom",
    style: row.style || "plus",
    likesCount: typeof row.likesCount === "number" ? row.likesCount : 0,
    viewsCount: typeof row.viewsCount === "number" ? row.viewsCount : 0,
  }));

  return (
    <div className="min-h-screen bg-[#0b0f17]">
      {/* Hero Header */}
      <div className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-transparent px-4 py-8 text-center sm:px-6 sm:py-12">
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Valorant Crosshair <span className="text-cyan-400">Database</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-400 sm:text-base">
          Copy Valorant crosshair codes instantly. Pro player presets, dot crosshairs, competitive styles, and community favorites — all in one place.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Link href="/crosshair-database/best" className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-cyan-400/50 sm:text-sm">
            🏆 Best Crosshairs
          </Link>
          <Link href="/crosshair-database/dot" className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-cyan-400/50 sm:text-sm">
            ⊙ Dot Crosshairs
          </Link>
          <Link href="/crosshair-database/funny" className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-cyan-400/50 sm:text-sm">
            😂 Funny Crosshairs
          </Link>
          <Link href="/crosshairs" className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition-colors hover:border-cyan-400 hover:bg-cyan-400/20 sm:text-sm">
            + Create Your Own
          </Link>
        </div>

        {/* Pro Player Quick Links */}
        <div className="mt-5">
          <p className="mb-2 text-xs uppercase tracking-widest text-zinc-400">Pro Player Crosshairs</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {PRO_PLAYERS.slice(0, 8).map((pro) => (
              <Link
                key={pro.slug}
                href={`/crosshair-database/pro/${pro.slug}`}
                className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-300 transition-colors hover:border-cyan-400/40 hover:text-cyan-300"
              >
                {pro.name}
              </Link>
            ))}
          </div>
        </div>

        {items.length > 0 && (
          <p className="mt-3 text-xs text-zinc-400">
            {items.length} crosshair{items.length !== 1 ? "s" : ""} in database
          </p>
        )}
      </div>

      {/* Gallery */}
      <CrosshairsGallery items={items} initialCategory={initialCategory} initialQuery={initialQuery} />
    </div>
  );
}
