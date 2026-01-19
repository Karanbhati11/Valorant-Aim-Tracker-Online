export default function ContactPage() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
        padding: "20px",
      }}
    >
      <div
        className="panel"
        style={{
          width: "100%",
          maxWidth: "800px",
          height: "auto",
          maxHeight: "none",
        }}
      >
        <div className="panel-header">
          <h1>
            Contact <span className="brand-accent">Us</span>
          </h1>
          <div className="subtitle">We'd love to hear from you</div>
        </div>
        <div className="main-view" style={{ padding: "24px" }}>
          <form
            action="https://formspree.io/f/mkonbeag"
            method="POST"
            style={{ display: "grid", gap: "16px" }}
          >
            <label className="setting-label" htmlFor="email">
              Your email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              style={{ userSelect: "text" }}
            />

            <label className="setting-label" htmlFor="message">
              Your message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              placeholder="Tell us what's up..."
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid var(--border)",
                color: "white",
                padding: "12px 15px",
                borderRadius: 4,
                fontFamily: "inherit",
                fontSize: "1rem",
                userSelect: "text",
              }}
            ></textarea>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button type="submit" className="action-btn primary">
                Send
              </button>
              <a
                href="/"
                className="action-btn"
                style={{ textAlign: "center", display: "inline-block" }}
              >
                Back to Home
              </a>
            </div>
          </form>

          <div
            style={{
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid var(--border)",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              lineHeight: 1.4,
            }}
          >
            <div>
              AimTrainerPro is not affiliated with, endorsed, sponsored, or
              specifically approved by Riot Games, Inc. Valorant and Riot Games
              are trademarks or registered trademarks of Riot Games, Inc.
            </div>
            <div style={{ marginTop: "8px" }}>© 2026 AimTrainerPro</div>
          </div>
        </div>
      </div>
    </div>
  );
}
