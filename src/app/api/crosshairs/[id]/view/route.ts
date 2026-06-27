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

    const body = (await request.json().catch(() => ({}))) as { anonId?: unknown };
    const anonId = parseAnonId(body.anonId);

    const db = await getDatabase();

    const filter = anonId
      ? { _id: new ObjectId(id), viewedByAnonIds: { $ne: anonId } }
      : { _id: new ObjectId(id) };

    const update = anonId
      ? {
          $inc: { viewsCount: 1 },
          $addToSet: { viewedByAnonIds: anonId },
          $set: { updatedAt: new Date() },
        }
      : {
          $inc: { viewsCount: 1 },
          $set: { updatedAt: new Date() },
        };

    const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
      filter,
      update,
      { returnDocument: "after", projection: { viewsCount: 1 } },
    );

    if (result) {
      const viewsCount = typeof result.viewsCount === "number" ? result.viewsCount : 0;
      return NextResponse.json({ ok: true, viewed: true, viewsCount });
    }

    const existing = await db.collection(COLLECTION_NAME).findOne(
      { _id: new ObjectId(id) },
      { projection: { viewsCount: 1 } },
    );
    if (!existing) {
      return NextResponse.json({ error: "Crosshair not found" }, { status: 404 });
    }
    const viewsCount = typeof existing.viewsCount === "number" ? existing.viewsCount : 0;
    return NextResponse.json({ ok: true, viewed: false, viewsCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to track view";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
