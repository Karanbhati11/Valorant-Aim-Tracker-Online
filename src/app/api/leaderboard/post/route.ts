import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongo";

// In-memory fallback leaderboard
let mockLeaderboard = [
  { name: "ProPlayer1", score: 8950 },
  { name: "AimMaster", score: 8420 },
];

export async function POST(request: NextRequest) {
  // CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const payload = await request.json();
    const name = (payload.name || "Anonymous").toString().substring(0, 64);
    const score = parseInt(payload.score || 0, 10);

    if (!Number.isFinite(score) || score < 0) {
      return NextResponse.json(
        { error: "Invalid score" },
        { status: 400, headers }
      );
    }

    console.log("[leaderboard-post] Posting score:", { name, score });

    try {
      const db = await getDatabase();
      const col = db.collection("leaderboard");

      const count = await col.countDocuments();
      const now = new Date();

      if (count < 10) {
        await col.insertOne({ name, score, createdAt: now });
        return NextResponse.json({ ok: true }, { headers });
      }

      const lowest = await col.findOne(
        {},
        { sort: { score: 1, createdAt: 1 } }
      );
      if (!lowest) {
        await col.insertOne({ name, score, createdAt: now });
        return NextResponse.json({ ok: true }, { headers });
      }

      if (score > (lowest as any).score) {
        await col.insertOne({ name, score, createdAt: now });
        await col.deleteOne({ _id: (lowest as any)._id });
        return NextResponse.json({ ok: true, promoted: true }, { headers });
      }

      return NextResponse.json({ ok: true, promoted: false }, { headers });
    } catch (mongoError) {
      console.warn(
        "[leaderboard-post] MongoDB connection failed, using mock data"
      );
      // Fallback: add to mock leaderboard if not full
      if (mockLeaderboard.length < 10) {
        mockLeaderboard.push({ name, score });
        mockLeaderboard.sort((a, b) => b.score - a.score);
        return NextResponse.json({ ok: true }, { headers });
      }

      const lowest = mockLeaderboard[mockLeaderboard.length - 1];
      if (score > lowest.score) {
        mockLeaderboard.pop();
        mockLeaderboard.push({ name, score });
        mockLeaderboard.sort((a, b) => b.score - a.score);
        return NextResponse.json({ ok: true, promoted: true }, { headers });
      }

      return NextResponse.json({ ok: true, promoted: false }, { headers });
    }
  } catch (err: any) {
    console.error("[leaderboard-post] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500, headers });
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
