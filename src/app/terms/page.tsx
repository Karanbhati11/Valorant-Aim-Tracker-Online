import Link from "next/link";

export default function TermsPage() {
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
            Terms of <span className="brand-accent">Use</span>
          </h1>
          <div className="subtitle">Last updated: March 7, 2026</div>
        </div>

        <div className="main-view" style={{ padding: "24px", lineHeight: 1.7 }}>
          <p>
            By accessing or using AimTrainerPro, you agree to these Terms of Use. If
            you do not agree, please do not use the website.
          </p>

          <h2 style={{ marginTop: "20px" }}>Use of the Service</h2>
          <ul>
            <li>You may use the site for personal, non-commercial practice purposes.</li>
            <li>You agree not to abuse, disrupt, or attempt to exploit the platform.</li>
            <li>You are responsible for the information you submit (e.g., leaderboard names).</li>
          </ul>

          <h2 style={{ marginTop: "20px" }}>Intellectual Property</h2>
          <p>
            Site content, design elements, and training systems are owned by
            AimTrainerPro unless otherwise stated. Third-party trademarks are the
            property of their respective owners.
          </p>

          <h2 style={{ marginTop: "20px" }}>No Warranty</h2>
          <p>
            The service is provided "as is" and "as available" without warranties of
            any kind. We do not guarantee uninterrupted availability or specific
            performance outcomes.
          </p>

          <h2 style={{ marginTop: "20px" }}>Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, AimTrainerPro is not liable for any
            indirect, incidental, or consequential damages arising from your use of the
            site.
          </p>

          <h2 style={{ marginTop: "20px" }}>Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use after updates
            means you accept the revised terms.
          </p>

          <h2 style={{ marginTop: "20px" }}>Contact</h2>
          <p>
            For questions about these terms, use <Link href="/contact" style={{ color: "var(--primary)" }}>/contact</Link>.
          </p>

          <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/" className="action-btn primary">Back to Trainer</Link>
            <Link href="/about" className="action-btn">About</Link>
            <Link href="/privacy-policy" className="action-btn">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
