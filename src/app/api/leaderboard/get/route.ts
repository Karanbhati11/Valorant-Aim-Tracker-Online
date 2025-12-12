import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongo";

// In-memory fallback leaderboard
let mockLeaderboard = [
  { name: "ProPlayer1", score: 8950 },
  { name: "AimMaster", score: 8420 },
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
    console.log("[leaderboard-get] Fetching leaderboard...");
    try {
      const db = await getDatabase();
      const col = db.collection("leaderboard");

      const top = await col
        .find({}, { projection: { name: 1, score: 1 } })
        .sort({ score: -1, createdAt: 1 })
        .limit(10)
        .toArray();

      console.log(
        "[leaderboard-get] Returned",
        top.length,
        "entries from MongoDB"
      );
      return NextResponse.json(top, { headers });
    } catch (mongoError) {
      console.warn(
        "[leaderboard-get] MongoDB connection failed, using mock data:",
        mongoError
      );
      // Return mock data as fallback
      return NextResponse.json(mockLeaderboard, { headers });
    }
  } catch (err: any) {
    console.error("[leaderboard-get] Error:", err);
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
