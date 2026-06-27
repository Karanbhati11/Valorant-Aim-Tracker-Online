import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongo";
import {
  LEADERBOARD_LIMIT,
  VALID_TIMEFRAMES,
  getTimeframeFilter,
  type LeaderboardTimeframe,
} from "@/lib/leaderboard/constants";

// CORS headers shared across responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(request: NextRequest) {
  const headers = {
    "Content-Type": "application/json",
    ...corsHeaders,
  };

  try {
    const url = new URL(request.url);
    const exerciseId = url.searchParams.get("exerciseId") || "static_grid";
    const timeframe = (url.searchParams.get("timeframe") || "all-time") as LeaderboardTimeframe;
    const difficulty = url.searchParams.get("difficulty") || null;

    // Validate timeframe
    if (!VALID_TIMEFRAMES.includes(timeframe)) {
      return NextResponse.json(
        { error: `Invalid timeframe. Must be one of: ${VALID_TIMEFRAMES.join(", ")}` },
        { status: 400, headers }
      );
    }

    // Validate difficulty
    const VALID_DIFFICULTIES = ["easy", "medium", "hard"];
    if (difficulty && !VALID_DIFFICULTIES.includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty. Must be one of: easy, medium, hard" },
        { status: 400, headers }
      );
    }

    try {
      const db = await getDatabase();
      const col = db.collection("leaderboard");

      // --- Overall ranking: aggregate each player's best score per exercise,
      // then sum them for a single global leaderboard (no exercise selection). ---
      if (exerciseId === "overall") {
        const matchStage: Record<string, unknown> = {};
        if (difficulty) matchStage.difficulty = difficulty;

        const pipeline: object[] = [];
        if (Object.keys(matchStage).length > 0) {
          pipeline.push({ $match: matchStage });
        }
        pipeline.push(
          {
            $group: {
              _id: { name: "$name", exerciseId: "$exerciseId" },
              best: { $max: "$score" },
            },
          },
          {
            $group: {
              _id: "$_id.name",
              score: { $sum: "$best" },
              exercises: { $sum: 1 },
            },
          },
          { $sort: { score: -1, _id: 1 } },
          { $limit: LEADERBOARD_LIMIT },
        );

        const agg = await col.aggregate(pipeline).toArray();

        const overall = agg.map((e, index) => ({
          position: index + 1,
          name: e._id,
          score: e.score,
          exercises: e.exercises,
          accuracy: null,
          exerciseId: "overall",
        }));

        return NextResponse.json(
          { exerciseId, timeframe, difficulty, entries: overall, total: overall.length },
          { headers }
        );
      }

      // Build query filter
      const filter: Record<string, unknown> = { exerciseId };

      // Apply difficulty filter
      if (difficulty) {
        filter.difficulty = difficulty;
      }

      // Apply timeframe filter
      const resetDate = getTimeframeFilter(timeframe);
      if (resetDate !== null) {
        filter.createdAt = { $gte: resetDate };
      }

      // Fetch top 100 entries sorted by score descending, with tie-breaking by earliest submission
      const entries = await col
        .find(filter, {
          projection: {
            name: 1,
            score: 1,
            accuracy: 1,
            exerciseId: 1,
            createdAt: 1,
          },
        })
        .sort({ score: -1, createdAt: 1 })
        .limit(LEADERBOARD_LIMIT)
        .toArray();

      // Map entries to include position number and format accuracy
      const leaderboard = entries.map((entry, index) => ({
        position: index + 1,
        name: entry.name,
        score: entry.score,
        accuracy: entry.accuracy != null ? Math.round(entry.accuracy * 100) / 100 : null,
        exerciseId: entry.exerciseId,
      }));

      return NextResponse.json(
        {
          exerciseId,
          timeframe,
          entries: leaderboard,
          total: leaderboard.length,
        },
        { headers }
      );
    } catch (mongoError) {
      // Return empty result on DB failure rather than mock data
      return NextResponse.json(
        {
          exerciseId,
          timeframe,
          entries: [],
          total: 0,
          error: "Database temporarily unavailable",
        },
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
