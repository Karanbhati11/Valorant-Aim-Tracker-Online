import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongo";

const COLLECTION_NAME = "crosshairs";

function parseAnonId(value: unknown): string {
  if (typeof value !== "string") return "";
  const next = value.trim();
  if (next.length < 8 || next.length > 128) return "";
  return next;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid crosshair id" }, { status: 400 });
    }

    const body = (await request.json()) as { anonId?: unknown };
    const anonId = parseAnonId(body.anonId);
    if (!anonId) {
      return NextResponse.json({ error: "anonId is required" }, { status: 400 });
    }

    const db = await getDatabase();
    const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id), likedByAnonIds: { $ne: anonId } },
      {
        $inc: { likesCount: 1 },
        $addToSet: { likedByAnonIds: anonId },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after", projection: { likesCount: 1 } },
    );

    if (result) {
      const likesCount = typeof result.likesCount === "number" ? result.likesCount : 0;
      return NextResponse.json({ ok: true, liked: true, likesCount });
    }

    const existing = await db.collection(COLLECTION_NAME).findOne(
      { _id: new ObjectId(id) },
      { projection: { likesCount: 1 } },
    );
    if (!existing) {
      return NextResponse.json({ error: "Crosshair not found" }, { status: 404 });
    }
    const likesCount = typeof existing.likesCount === "number" ? existing.likesCount : 0;
    return NextResponse.json({ ok: true, liked: false, likesCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to like crosshair";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
