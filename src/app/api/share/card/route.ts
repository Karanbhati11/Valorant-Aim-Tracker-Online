import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

/**
 * Generates a 1200x630px shareable results card image for social media / Open Graph.
 *
 * Query params:
 *  - score (required): Player's score (number)
 *  - accuracy (required): Accuracy percentage 0-100
 *  - exerciseName (required): Name of the exercise completed
 *  - playerName (required): Player's display name
 *  - leaderboardPosition (optional): Position on leaderboard (only shown if <= 10)
 */

const WIDTH = 1200;
const HEIGHT = 630;

// Branding colors matching globals.css
const COLORS = {
  bgDark: "#0f1217",
  bgPanel: "#141923",
  primary: "#ff4655",
  accent: "#00f3ff",
  textMain: "#ffffff",
  textMuted: "#8b9bb4",
  border: "rgba(255, 255, 255, 0.08)",
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSvgOverlay(params: {
  score: string;
  accuracy: string;
  exerciseName: string;
  playerName: string;
  leaderboardPosition?: number;
}): string {
  const { score, accuracy, exerciseName, playerName, leaderboardPosition } = params;

  const showLeaderboard = leaderboardPosition != null && leaderboardPosition >= 1 && leaderboardPosition <= 10;

  // Build leaderboard badge SVG section
  const leaderboardBadge = showLeaderboard
    ? `
    <g>
      <rect x="830" y="360" width="280" height="100" rx="8" fill="${COLORS.bgPanel}" stroke="${COLORS.accent}" stroke-width="2"/>
      <text x="970" y="400" text-anchor="middle" font-family="Segoe UI, Roboto, sans-serif" font-size="14" font-weight="700" fill="${COLORS.accent}" letter-spacing="2">#${leaderboardPosition} ON LEADERBOARD</text>
      <text x="970" y="440" text-anchor="middle" font-family="Segoe UI, Roboto, sans-serif" font-size="28" font-weight="800" fill="${COLORS.textMain}">TOP ${leaderboardPosition}</text>
    </g>`
    : "";

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.bgDark};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#1a1f2e;stop-opacity:1"/>
    </linearGradient>
    <linearGradient id="accentLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${COLORS.primary};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${COLORS.accent};stop-opacity:0.6"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgGrad)"/>

  <!-- Top accent line -->
  <rect x="0" y="0" width="${WIDTH}" height="4" fill="url(#accentLine)"/>

  <!-- Left accent bar -->
  <rect x="0" y="0" width="6" height="${HEIGHT}" fill="${COLORS.primary}" opacity="0.8"/>

  <!-- Subtle grid pattern for depth -->
  <g opacity="0.03">
    ${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 60}" y1="0" x2="${i * 60}" y2="${HEIGHT}" stroke="${COLORS.textMain}" stroke-width="1"/>`).join("")}
    ${Array.from({ length: 11 }, (_, i) => `<line x1="0" y1="${i * 63}" x2="${WIDTH}" y2="${i * 63}" stroke="${COLORS.textMain}" stroke-width="1"/>`).join("")}
  </g>

  <!-- Brand header -->
  <text x="80" y="80" font-family="Segoe UI, Roboto, sans-serif" font-size="28" font-weight="800" fill="${COLORS.textMain}" letter-spacing="3">AIMTRAINER<tspan fill="${COLORS.primary}">PRO</tspan></text>
  <text x="80" y="108" font-family="Segoe UI, Roboto, sans-serif" font-size="12" font-weight="600" fill="${COLORS.textMuted}" letter-spacing="2">TRAINING RESULTS</text>

  <!-- Exercise name -->
  <text x="80" y="175" font-family="Segoe UI, Roboto, sans-serif" font-size="20" font-weight="600" fill="${COLORS.textMuted}" letter-spacing="1">${escapeXml(exerciseName.toUpperCase())}</text>

  <!-- Player name -->
  <text x="80" y="220" font-family="Segoe UI, Roboto, sans-serif" font-size="36" font-weight="800" fill="${COLORS.textMain}">${escapeXml(playerName)}</text>

  <!-- Divider line -->
  <line x1="80" y1="250" x2="500" y2="250" stroke="${COLORS.primary}" stroke-width="2" opacity="0.6"/>

  <!-- Score card -->
  <g>
    <rect x="80" y="280" width="320" height="140" rx="8" fill="${COLORS.bgPanel}" stroke="${COLORS.primary}" stroke-width="2"/>
    <text x="240" y="320" text-anchor="middle" font-family="Segoe UI, Roboto, sans-serif" font-size="14" font-weight="700" fill="${COLORS.textMuted}" letter-spacing="2">SCORE</text>
    <text x="240" y="390" text-anchor="middle" font-family="Segoe UI, Roboto, sans-serif" font-size="64" font-weight="900" fill="${COLORS.primary}">${escapeXml(score)}</text>
  </g>

  <!-- Accuracy card -->
  <g>
    <rect x="440" y="280" width="320" height="140" rx="8" fill="${COLORS.bgPanel}" stroke="${COLORS.accent}" stroke-width="1"/>
    <text x="600" y="320" text-anchor="middle" font-family="Segoe UI, Roboto, sans-serif" font-size="14" font-weight="700" fill="${COLORS.textMuted}" letter-spacing="2">ACCURACY</text>
    <text x="600" y="390" text-anchor="middle" font-family="Segoe UI, Roboto, sans-serif" font-size="64" font-weight="900" fill="${COLORS.accent}">${escapeXml(accuracy)}%</text>
  </g>

  ${leaderboardBadge}

  <!-- Footer -->
  <line x1="80" y1="530" x2="1120" y2="530" stroke="${COLORS.textMuted}" stroke-width="1" opacity="0.2"/>
  <text x="80" y="575" font-family="Segoe UI, Roboto, sans-serif" font-size="14" font-weight="600" fill="${COLORS.textMuted}" letter-spacing="1">aimtrainerpro.online</text>
  <text x="1120" y="575" text-anchor="end" font-family="Segoe UI, Roboto, sans-serif" font-size="14" font-weight="600" fill="${COLORS.textMuted}" letter-spacing="1">CAN YOU BEAT THIS SCORE?</text>

  <!-- Bottom accent line -->
  <rect x="0" y="${HEIGHT - 4}" width="${WIDTH}" height="4" fill="url(#accentLine)"/>
</svg>`;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const score = url.searchParams.get("score");
    const accuracy = url.searchParams.get("accuracy");
    const exerciseName = url.searchParams.get("exerciseName");
    const playerName = url.searchParams.get("playerName");
    const leaderboardPositionStr = url.searchParams.get("leaderboardPosition");

    // Validate required params
    if (!score || !accuracy || !exerciseName || !playerName) {
      return NextResponse.json(
        { error: "Missing required parameters: score, accuracy, exerciseName, playerName" },
        { status: 400 }
      );
    }

    // Parse and validate numeric values
    const scoreNum = Number(score);
    const accuracyNum = Number(accuracy);

    if (isNaN(scoreNum) || isNaN(accuracyNum)) {
      return NextResponse.json(
        { error: "score and accuracy must be valid numbers" },
        { status: 400 }
      );
    }

    // Parse optional leaderboard position (only include if within top 10)
    let leaderboardPosition: number | undefined;
    if (leaderboardPositionStr) {
      const pos = Number(leaderboardPositionStr);
      if (!isNaN(pos) && pos >= 1 && pos <= 10) {
        leaderboardPosition = pos;
      }
    }

    // Format display values
    const displayScore = Math.round(scoreNum).toString();
    const displayAccuracy = Math.min(100, Math.max(0, accuracyNum)).toFixed(1);

    // Generate SVG overlay
    const svg = buildSvgOverlay({
      score: displayScore,
      accuracy: displayAccuracy,
      exerciseName,
      playerName,
      leaderboardPosition,
    });

    // Render to PNG using sharp
    const imageBuffer = await sharp({
      create: {
        width: WIDTH,
        height: HEIGHT,
        channels: 4,
        background: { r: 15, g: 18, b: 23, alpha: 1 },
      },
    })
      .composite([
        {
          input: Buffer.from(svg),
          top: 0,
          left: 0,
        },
      ])
      .png({ quality: 90 })
      .toBuffer();

    return new NextResponse(new Uint8Array(imageBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Content-Length": imageBuffer.length.toString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: `Failed to generate share card: ${message}` },
      { status: 500 }
    );
  }
}
