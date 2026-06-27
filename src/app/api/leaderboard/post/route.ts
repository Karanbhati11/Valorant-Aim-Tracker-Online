import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongo";
import {
  validatePlayerName,
  validateScore,
  validateExerciseId,
} from "@/lib/leaderboard/constants";

// CORS headers shared across responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function POST(request: NextRequest) {
  const headers = {
    "Content-Type": "application/json",
    ...corsHeaders,
  };

  try {
    const payload = await request.json();

    // Validate exercise ID
    const exerciseValidation = validateExerciseId(payload.exerciseId);
    if (!exerciseValidation.valid) {
      return NextResponse.json(
        { error: exerciseValidation.error },
        { status: 400, headers }
      );
    }
    const exerciseId = exerciseValidation.value!;

    // Validate player name (1–64 chars)
    const nameValidation = validatePlayerName(payload.name);
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400, headers }
      );
    }
    const name = nameValidation.sanitized!;

    // Validate score against MAX_SCORE_PER_EXERCISE
    const scoreValidation = validateScore(payload.score, exerciseId);
    if (!scoreValidation.valid) {
      return NextResponse.json(
        { error: scoreValidation.error },
        { status: 400, headers }
      );
    }
    const score = scoreValidation.value!;

    // Extract optional accuracy (0.0–1.0 as percentage of hits)
    let accuracy: number | null = null;
    if (payload.accuracy != null) {
      const accNum = Number(payload.accuracy);
      if (Number.isFinite(accNum) && accNum >= 0 && accNum <= 100) {
        accuracy = accNum;
      } else if (Number.isFinite(accNum) && accNum >= 0 && accNum <= 1) {
        accuracy = accNum * 100;
      }
    }

    // Extract difficulty (easy, medium, hard)
    const VALID_DIFFICULTIES = ["easy", "medium", "hard"];
    let difficulty: string = "medium";
    if (payload.difficulty && typeof payload.difficulty === "string") {
      const d = payload.difficulty.toLowerCase().trim();
      if (VALID_DIFFICULTIES.includes(d)) difficulty = d;
    }

    try {
      const db = await getDatabase();
      const col = db.collection("leaderboard");
      const now = new Date();

      await col.insertOne({
        name,
        score,
        accuracy,
        exerciseId,
        difficulty,
        createdAt: now,
      });

      // Get the player's rank for this exercise (all-time)
      const rank = await col.countDocuments({
        exerciseId,
        score: { $gt: score },
      }) + 1;

      return NextResponse.json(
        { ok: true, rank, exerciseId, score, name },
        { headers }
      );
    } catch (mongoError) {
      return NextResponse.json(
        { error: "Database temporarily unavailable" },
        { status: 503, headers }
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500, headers }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    headers: corsHeaders,
  });
}
