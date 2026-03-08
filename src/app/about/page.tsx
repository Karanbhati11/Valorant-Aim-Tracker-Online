import Link from "next/link";

export default function AboutPage() {
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
      <div className="panel" style={{ width: "100%", maxWidth: "920px" }}>
        <div className="panel-header">
          <h1>
            About <span className="brand-accent">AimTrainerPro</span>
          </h1>
          <div className="subtitle">Who we are and what this tool is for</div>
        </div>

        <div className="main-view" style={{ padding: "24px", lineHeight: 1.7 }}>
          <p>
            AimTrainerPro is a free browser-based FPS aim trainer built for players
            who want to improve flicking, tracking, and micro-adjustments without
            installing heavy software.
          </p>

          <h2 style={{ marginTop: "20px" }}>Our Mission</h2>
          <p>
            Our mission is to make high-quality aim practice accessible to everyone,
            including players on low-end PCs and laptops. We focus on clean drills,
            clear feedback, and consistent performance so players can build mechanics
            that transfer into real games.
          </p>

          <h2 style={{ marginTop: "20px" }}>What You Can Practice</h2>
          <ul>
            <li>Flick aim and target switching</li>
            <li>Tracking moving targets</li>
            <li>Micro-correction precision</li>
            <li>Reaction and warmup routines</li>
          </ul>

          <h2 style={{ marginTop: "20px" }}>Who It Is For</h2>
          <p>
            This platform is designed for FPS players across games like Valorant,
            CS2, and Fortnite who want practical training routines and measurable
            progress over time.
          </p>

          <h2 style={{ marginTop: "20px" }}>Contact</h2>
          <p>
            Questions, feedback, or business inquiries: visit our <Link href="/contact" style={{ color: "var(--primary)" }}>Contact page</Link>.
          </p>

          <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/" className="action-btn primary">Back to Trainer</Link>
            <Link href="/blog" className="action-btn">Read Blog</Link>
            <Link href="/privacy-policy" className="action-btn">Privacy Policy</Link>
            <Link href="/terms" className="action-btn">Terms</Link>
          </div>

          <div
            style={{
              marginTop: "24px",
              paddingTop: "14px",
              borderTop: "1px solid var(--border)",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
            }}
          >
            AimTrainerPro is not affiliated with, endorsed, sponsored, or specifically
            approved by Riot Games, Inc. Valorant and Riot Games are trademarks or
            registered trademarks of Riot Games, Inc.
          </div>
        </div>
      </div>
    </div>
  );
}
