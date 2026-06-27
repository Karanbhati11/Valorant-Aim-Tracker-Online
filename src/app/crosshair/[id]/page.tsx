import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import CrosshairDetailView from "@/components/CrosshairDetailView";
import { getDatabase } from "@/lib/mongo";
import type { CrosshairCategory, CrosshairTag, CrosshairStyle } from "@/lib/crosshair/metadata";

const COLLECTION_NAME = "crosshairs";

type CrosshairDoc = {
  _id: ObjectId;
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

async function getCrosshairById(id: string): Promise<CrosshairDoc | null> {
  if (!ObjectId.isValid(id)) return null;
  try {
    const db = await getDatabase();
    const row = (await db.collection(COLLECTION_NAME).findOne(
      { _id: new ObjectId(id) },
      { projection: { name: 1, code: 1, createdAt: 1, category: 1, tags: 1, color: 1, style: 1, likesCount: 1, viewsCount: 1 } },
    )) as CrosshairDoc | null;
    return row;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const row = await getCrosshairById(id);

  if (!row || !row.code) {
    return { title: "Crosshair Not Found | AimTrainerPro" };
  }

  const name = (row.name || "Untitled").trim();
  const category = row.category || "Classic";
  const tags = Array.isArray(row.tags) && row.tags.length > 0 ? row.tags.join(", ") : null;
  const tagsText = tags ? `with ${tags} tags` : `for ${category} style`;

  return {
    title: `${name} Crosshair Code | AimTrainerPro`,
    description: `${name} Valorant crosshair code ${tagsText}. Copy this crosshair instantly, preview accurately, and import directly into your game settings.`,
    alternates: { canonical: `/crosshair/${id}` },
    openGraph: {
      title: `${name} Crosshair Code`,
      description: tags ? `${category} crosshair with ${tags}` : `${category} style crosshair code`,
      type: "article",
    },
  };
}

export default async function CrosshairDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getCrosshairById(id);

  if (!row || !row.code) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--bg-dark)]">
      <CrosshairDetailView
        item={{
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
        }}
      />
    </div>
  );
}
