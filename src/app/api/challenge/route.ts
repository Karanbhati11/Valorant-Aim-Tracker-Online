import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getDatabase } from "@/lib/mongo";
import { COLLECTIONS } from "@/lib/db/setup";
import crypto from "crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * Generates a unique alphanumeric URL code (8 characters).
 */
function generateUrlCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

/**
 * POST /api/challenge
 * Creates a challenge link for the "Challenge a Friend" feature.
 *
 * Body: { exerciseId: string, challengerId: string, challengerScore: number, challengerName?: string, challengerAccuracy?: number }
 * Returns: { ok: true, challengeUrl: string, urlCode: string }
 *
 * If the user is authenticated, their display name is used as challengerName
 * and their userId is used as challengerId (overriding body values).
 * Guests can still create challenges with a custom name.
 */
export async function POST(request: NextRequest) {
  const headers = {
    "Content-Type": "application/json",
    ...corsHeaders,
  };

  try {
    const payload = await request.json();

    // Check if user is authenticated — use their profile for challenge info
    let authenticatedUserId: string | null = null;
    let authenticatedDisplayName: string | null = null;
    try {
      const session = await getServerSession(authOptions);
      if (session?.user && (session.user as { id?: string }).id) {
        authenticatedUserId = (session.user as { id: string }).id;
        authenticatedDisplayName = session.user.name ?? null;
      }
    } catch {
      // Auth check failure is non-fatal; proceed as guest
    }

    const { exerciseId, challengerScore, challengerAccuracy } = payload;

    // Use authenticated user's ID if available, otherwise require from payload
    const challengerId = authenticatedUserId || payload.challengerId;
    // Use authenticated user's display name if available, fall back to payload
    const challengerName = authenticatedDisplayName || payload.challengerName;

    // Validate required fields
    if (!exerciseId || typeof exerciseId !== "string") {
      return NextResponse.json(
        { error: "exerciseId is required and must be a string" },
        { status: 400, headers }
      );
    }

    if (!challengerId || typeof challengerId !== "string") {
      return NextResponse.json(
        { error: "challengerId is required and must be a string" },
        { status: 400, headers }
      );
    }

    if (
      challengerScore == null ||
      typeof challengerScore !== "number" ||
      !Number.isFinite(challengerScore) ||
      challengerScore < 0
    ) {
      return NextResponse.json(
        { error: "challengerScore must be a non-negative number" },
        { status: 400, headers }
      );
    }

    try {
      const db = await getDatabase();
      const collection = db.collection(COLLECTIONS.CHALLENGE_LINKS);

      // Generate a unique URL code with retry logic for collisions
      let urlCode: string = "";
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        urlCode = generateUrlCode();
        const existing = await collection.findOne({ urlCode });
        if (!existing) break;
        attempts++;
      }

      if (attempts >= maxAttempts) {
        return NextResponse.json(
          { error: "Failed to generate unique challenge code. Please try again." },
          { status: 500, headers }
        );
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await collection.insertOne({
        urlCode,
        exerciseId,
        challengerId,
        challengerScore,
        ...(challengerName && typeof challengerName === "string" ? { challengerName: challengerName.slice(0, 64) } : {}),
        ...(typeof challengerAccuracy === "number" && Number.isFinite(challengerAccuracy) ? { challengerAccuracy: Math.min(100, Math.max(0, challengerAccuracy)) } : {}),
        createdAt: now,
        expiresAt,
      });

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://aimtrainerpro.online";
      const challengeUrl = `${baseUrl}/challenge/${urlCode}`;

      return NextResponse.json(
        {
          ok: true,
          challengeUrl,
          urlCode,
        },
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

export async function OPTIONS() {
  return NextResponse.json(null, {
    headers: corsHeaders,
  });
}
