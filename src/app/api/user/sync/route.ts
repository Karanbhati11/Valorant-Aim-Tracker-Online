/**
 * POST /api/user/sync
 *
 * Receives local progress data from the client and merges it with
 * the authenticated user's server-side profile.
 *
 * Conflict resolution: server-side data takes precedence.
 * - Exercise results: only results not already on the server (by exerciseId + completedAt) are added.
 * - Sensitivity profiles: server profiles are kept; local-only profiles are appended.
 * - Crosshair configs: server configs are kept; local-only configs are appended.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getDatabase } from "@/lib/mongo";
import type { LocalProgress } from "@/lib/auth/sync";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as { id?: string }).id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;

  let body: LocalProgress;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { exerciseResults, sensitivityProfiles, crosshairConfigs } = body;

  try {
    const db = await getDatabase();
    const usersCollection = db.collection("users");

    // Fetch existing server-side data for this user
    const user = await usersCollection.findOne({ _id: userId as unknown as import("mongodb").ObjectId });

    // Server-side exercise results (keyed by exerciseId + completedAt to detect duplicates)
    const serverResults: Array<{ exerciseId: string; completedAt: string }> =
      user?.exerciseResults || [];
    const serverResultKeys = new Set(
      serverResults.map((r) => `${r.exerciseId}::${r.completedAt}`)
    );

    // Only add local results that don't already exist on the server
    const newResults = (exerciseResults || []).filter(
      (r) => !serverResultKeys.has(`${r.exerciseId}::${r.completedAt}`)
    );

    // Server sensitivity profiles take precedence; append local-only ones
    const serverProfiles: Array<{ id: string }> =
      user?.sensitivityProfiles || [];
    const serverProfileIds = new Set(serverProfiles.map((p) => p.id));
    const newProfiles = (sensitivityProfiles || []).filter(
      (p) => !serverProfileIds.has(p.id)
    );

    // Server crosshair configs take precedence; append local-only ones
    const serverCrosshairs: Array<{ id: string; name: string }> =
      user?.crosshairConfigs || [];
    const serverCrosshairNames = new Set(serverCrosshairs.map((c) => c.name));
    const newCrosshairs = (crosshairConfigs || []).filter(
      (c) => !serverCrosshairNames.has(c.name)
    );

    // Update the user document, pushing only non-conflicting local data
    const updateOps: Record<string, unknown> = {};
    const pushOps: Record<string, unknown> = {};

    if (newResults.length > 0) {
      pushOps.exerciseResults = { $each: newResults };
    }
    if (newProfiles.length > 0) {
      pushOps.sensitivityProfiles = { $each: newProfiles };
    }
    if (newCrosshairs.length > 0) {
      pushOps.crosshairConfigs = { $each: newCrosshairs };
    }

    if (Object.keys(pushOps).length > 0) {
      updateOps.$push = pushOps;
    }

    if (Object.keys(updateOps).length > 0) {
      await usersCollection.updateOne(
        { _id: userId as unknown as import("mongodb").ObjectId },
        updateOps
      );
    }

    return NextResponse.json({
      synced: true,
      added: {
        exerciseResults: newResults.length,
        sensitivityProfiles: newProfiles.length,
        crosshairConfigs: newCrosshairs.length,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Sync failed due to server error" },
      { status: 500 }
    );
  }
}
