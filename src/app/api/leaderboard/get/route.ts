import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongo";

// In-memory fallback leaderboard
let mockLeaderboard = [
  { name: "ProPlayer1", score: 8950, exerciseId: "static_grid" },
  { name: "AimMaster", score: 8420, exerciseId: "static_grid" },
  { name: "SpeedRunner", score: 7850, exerciseId: "micro_adjust" },
  { name: "FlickKing", score: 9200, exerciseId: "dynamic_flicks" },
];

export async function GET(request: NextRequest) {
  // CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const url = new URL(request.url);
    const exerciseId = url.searchParams.get("exerciseId") || "static_grid";

    // console.log(
    //   "[leaderboard-get] Fetching leaderboard for exercise:",
    //   exerciseId
    // );
    try {
      const db = await getDatabase();
      const col = db.collection("leaderboard");

      const top = await col
        .find(
          { exerciseId },
          { projection: { name: 1, score: 1, exerciseId: 1 } }
        )
        .sort({ score: -1, createdAt: 1 })
        .limit(10)
        .toArray();

      // console.log(
      //   "[leaderboard-get] Returned",
      //   top.length,
      //   "entries from MongoDB for",
      //   exerciseId
      // );
      return NextResponse.json(top, { headers });
    } catch (mongoError) {
      // console.warn(
      //   "[leaderboard-get] MongoDB connection failed, using mock data:",
      //   mongoError
      // );
      // Return mock data as fallback
      const mockForExercise = mockLeaderboard.filter(
        (e) => (e as any).exerciseId === exerciseId
      );
      return NextResponse.json(mockForExercise, { headers });
    }
  } catch (err: any) {
    // console.error("[leaderboard-get] Error:", err);
    return NextResponse.json(
      { error: err.message, details: err.toString() },
      { status: 500, headers }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
