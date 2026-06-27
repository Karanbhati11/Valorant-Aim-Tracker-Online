import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getDatabase } from "@/lib/mongo";

const DISPLAY_NAME_REGEX = /^[a-zA-Z0-9_]{3,16}$/;

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const db = await getDatabase();
  const user = await db.collection("users").findOne({ email: session.user.email });

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: user._id.toString(),
    email: user.email,
    displayName: user.displayName || null,
    provider: user.provider || "email",
    skillRating: user.skillRating ?? 0,
    tier: user.tier || "Iron",
    createdAt: user.createdAt || null,
    sensitivityProfiles: user.sensitivityProfiles || [],
    crosshairConfigs: user.crosshairConfigs || [],
  });
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const db = await getDatabase();
  const updateFields: Record<string, unknown> = {};

  // Validate and handle display name update
  if (body.displayName !== undefined) {
    const displayName = body.displayName as string;

    if (!DISPLAY_NAME_REGEX.test(displayName)) {
      return NextResponse.json(
        { error: "Display name must be 3–16 characters, alphanumeric and underscores only" },
        { status: 400 }
      );
    }

    // Check uniqueness (case-insensitive check against other users)
    const existingUser = await db.collection("users").findOne({
      displayName,
      email: { $ne: session.user.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Display name is unavailable" },
        { status: 409 }
      );
    }

    updateFields.displayName = displayName;
  }

  if (Object.keys(updateFields).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  updateFields.updatedAt = new Date().toISOString();

  await db.collection("users").updateOne(
    { email: session.user.email },
    { $set: updateFields }
  );

  // Return updated profile
  const updatedUser = await db.collection("users").findOne({ email: session.user.email });

  if (!updatedUser) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: updatedUser._id.toString(),
    email: updatedUser.email,
    displayName: updatedUser.displayName || null,
    provider: updatedUser.provider || "email",
    skillRating: updatedUser.skillRating ?? 0,
    tier: updatedUser.tier || "Iron",
    createdAt: updatedUser.createdAt || null,
    sensitivityProfiles: updatedUser.sensitivityProfiles || [],
    crosshairConfigs: updatedUser.crosshairConfigs || [],
  });
}
