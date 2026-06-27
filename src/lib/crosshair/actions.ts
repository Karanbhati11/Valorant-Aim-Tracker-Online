"use server";

import { buildCrosshairMetadata, type CrosshairCategory, type CrosshairTag } from "./metadata";
import { getDatabase } from "@/lib/mongo";

const COLLECTION_NAME = "crosshairs";

export type SaveCrosshairInput = {
  name: string;
  code: string;
  category: CrosshairCategory;
  tags: CrosshairTag[];
};

export type SaveCrosshairResult = {
  ok: boolean;
  id?: string;
  error?: string;
};

export async function saveCrosshair(input: SaveCrosshairInput): Promise<SaveCrosshairResult> {
  try {
    const name = input.name.trim();
    const code = input.code.trim();
    const metadata = buildCrosshairMetadata(code, input.category, input.tags);

    if (!name) return { ok: false, error: "Name is required" };
    if (!code) return { ok: false, error: "Code is required" };

    const db = await getDatabase();
    const result = await db.collection(COLLECTION_NAME).insertOne({
      name,
      code,
      category: metadata.category,
      tags: metadata.tags,
      color: metadata.color,
      style: metadata.style,
      likesCount: 0,
      viewsCount: 0,
      likedByAnonIds: [],
      createdAt: new Date(),
    });

    return { ok: true, id: String(result.insertedId) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save crosshair";
    return { ok: false, error: message };
  }
}
