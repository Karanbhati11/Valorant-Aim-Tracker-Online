import type { Metadata } from "next";
import Link from "next/link";
import { getDatabase } from "@/lib/mongo";
import { COLLECTIONS } from "@/lib/db/setup";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getCanonicalUrl } from "@/lib/seo/structured-data";

interface ChallengeData {
  urlCode: string;
  exerciseId: string;
  challengerId: string;
  challengerScore: number;
  challengerName?: string;
  challengerAccuracy?: number;
  createdAt: Date;
  expiresAt: Date;
}

interface ChallengePageProps {
  params: { code: string };
}

async function getChallengeData(code: string): Promise<ChallengeData | null> {
  try {
    const db = await getDatabase();
    const collection = db.collection(COLLECTIONS.CHALLENGE_LINKS);

    const challenge = await collection.findOne({ urlCode: code });

    if (!challenge) {
      return null;
    }

    // Check if expired
    const now = new Date();
    if (new Date(challenge.expiresAt) < now) {
      return null;
    }

    return {
      urlCode: challenge.urlCode,
      exerciseId: challenge.exerciseId,
      challengerId: challenge.challengerId,
      challengerScore: challenge.challengerScore,
      challengerName: challenge.challengerName || undefined,
      challengerAccuracy: challenge.challengerAccuracy ?? undefined,
      createdAt: challenge.createdAt,
      expiresAt: challenge.expiresAt,
    };
  } catch {
    return null;
  }
}

/** Maps exercise IDs to human-readable names */
function getExerciseName(exerciseId: string): string {
  const names: Record<string, string> = {
    static_grid: "Gridshot",
    micro_adjust: "Micro Adjust",
    pop_up_reflex: "Pop-up Reflex",
    strafe_track: "Strafe Track",
    dynamic_flicks: "Dynamic Flicks",
    valorant_jiggle_peek: "Valorant: Jiggle Peek",
    valorant_sheriff_headshot: "Valorant: Sheriff Headshot",
    valorant_vandal_spray: "Valorant: Vandal Spray",
    cs2_spray_transfer: "CS2: Spray Transfer",
    cs2_awp_flick: "CS2: AWP Flick",
    apex_strafe_tracking: "Apex: Strafe Tracking",
    apex_wingman_flick: "Apex: Wingman Flick",
    apex_close_range_tracking: "Apex: Close Range Tracking",
  };
  return names[exerciseId] || exerciseId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ params }: ChallengePageProps): Promise<Metadata> {
  const challenge = await getChallengeData(params.code);

  if (!challenge) {
    return {
      title: "Challenge Unavailable - AimTrainerPro",
      description: "This challenge link has expired or is no longer available.",
      alternates: {
        canonical: getCanonicalUrl(`/challenge/${params.code}`),
      },
    };
  }

  const exerciseName = getExerciseName(challenge.exerciseId);
  const playerName = challenge.challengerName || "A Friend";
  const ogTitle = `Beat ${challenge.challengerScore} on ${exerciseName} - AimTrainerPro Challenge`;
  const ogDescription = `${playerName} challenged you to beat their score of ${challenge.challengerScore} on ${exerciseName}. Can you do it?`;

  // Build share card image URL with available data
  const shareCardParams = new URLSearchParams({
    score: String(challenge.challengerScore),
    accuracy: String(challenge.challengerAccuracy ?? 0),
    exerciseName,
    playerName,
  });
  const ogImageUrl = `/api/share/card?${shareCardParams.toString()}`;

  return {
    title: ogTitle,
    description: ogDescription,
    alternates: {
      canonical: getCanonicalUrl(`/challenge/${params.code}`),
    },
    openGraph: {
      title: `Challenge: Beat ${challenge.challengerScore} on ${exerciseName}`,
      description: `Can you beat a score of ${challenge.challengerScore} on ${exerciseName}? Accept the challenge now!`,
      type: "website",
      url: `/challenge/${params.code}`,
      siteName: "AimTrainerPro",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${playerName} scored ${challenge.challengerScore} on ${exerciseName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Challenge: Beat ${challenge.challengerScore} on ${exerciseName}`,
      description: `${playerName} scored ${challenge.challengerScore} on ${exerciseName}. Think you can beat it?`,
      images: [ogImageUrl],
    },
  };
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  const challenge = await getChallengeData(params.code);

  // Challenge unavailable - expired or invalid
  if (!challenge) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        <div className="panel" style={{ width: "100%", maxWidth: "600px", marginTop: "80px" }}>
          <div className="panel-header">
            <h1>Challenge Unavailable</h1>
            <div className="subtitle">This challenge link has expired or is invalid</div>
          </div>
          <div className="main-view" style={{ padding: "24px", lineHeight: 1.7 }}>
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
              The challenge you&apos;re looking for is no longer available. This can happen if:
            </p>
            <ul style={{ color: "var(--text-muted)", marginBottom: "24px", paddingLeft: "20px" }}>
              <li>The challenge link has expired (links are valid for 30 days)</li>
              <li>The link is incorrect or has been modified</li>
              <li>The exercise referenced no longer exists</li>
            </ul>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href="/" className="action-btn primary">
                Browse Exercises
              </Link>
              <Link href="/blog" className="action-btn">
                Read Training Guides
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Valid challenge - show benchmark
  const exerciseName = getExerciseName(challenge.exerciseId);
  const expiresDate = new Date(challenge.expiresAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Challenge", href: `/challenge/${params.code}` },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        width: "100%",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <Breadcrumbs items={breadcrumbItems} />
      <div className="panel" style={{ width: "100%", maxWidth: "600px", marginTop: "80px" }}>
        <div className="panel-header">
          <h1>
            <span className="brand-accent">Challenge</span> Accepted?
          </h1>
          <div className="subtitle">A friend thinks you can&apos;t beat their score</div>
        </div>
        <div className="main-view" style={{ padding: "24px", lineHeight: 1.7 }}>
          {/* Benchmark Score Card */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "24px",
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              Score to Beat
            </div>
            <div
              style={{
                fontSize: "3rem",
                fontWeight: "bold",
                color: "var(--primary)",
                lineHeight: 1.1,
              }}
            >
              {challenge.challengerScore.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: "1.1rem",
                color: "var(--accent)",
                marginTop: "8px",
              }}
            >
              {exerciseName}
            </div>
          </div>

          {/* Challenge Info */}
          <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
            Your friend scored <strong style={{ color: "var(--text-main)" }}>{challenge.challengerScore.toLocaleString()}</strong> on{" "}
            <strong style={{ color: "var(--accent)" }}>{exerciseName}</strong>.
            Think you can do better? Jump into the exercise and prove it.
          </p>

          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              marginBottom: "24px",
            }}
          >
            Challenge expires: {expiresDate}
          </p>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href={`/?exercise=${challenge.exerciseId}`} className="action-btn primary">
              Accept Challenge
            </Link>
            <Link href="/" className="action-btn">
              Browse All Exercises
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
