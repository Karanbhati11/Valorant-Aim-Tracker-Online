import Link from "next/link";

export default function PrivacyPolicyPage() {
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
            Privacy <span className="brand-accent">Policy</span>
          </h1>
          <div className="subtitle">Last updated: March 7, 2026</div>
        </div>

        <div className="main-view" style={{ padding: "24px", lineHeight: 1.7 }}>
          <p>
            This Privacy Policy explains how AimTrainerPro collects, uses, and protects
            information when you use our website.
          </p>

          <h2 style={{ marginTop: "20px" }}>Information We Collect</h2>
          <ul>
            <li>Basic usage analytics (such as page visits and interactions)</li>
            <li>Leaderboard submissions you choose to provide (e.g., username and score)</li>
            <li>Messages submitted through our contact form</li>
          </ul>

          <h2 style={{ marginTop: "20px" }}>How We Use Information</h2>
          <ul>
            <li>To operate and improve the trainer and blog content</li>
            <li>To prevent abuse and maintain fair leaderboard functionality</li>
            <li>To respond to support and contact requests</li>
          </ul>

          <h2 style={{ marginTop: "20px" }}>Cookies and Advertising</h2>
          <p>
            We may use cookies and similar technologies for analytics and advertising.
            Third-party advertising vendors, including Google, may use cookies to serve
            ads based on your prior visits to this and other websites.
          </p>

          <h2 style={{ marginTop: "20px" }}>Third-Party Services</h2>
          <p>
            We may use third-party services such as analytics, hosting, and advertising
            providers. These services may process data according to their own privacy
            policies.
          </p>

          <h2 style={{ marginTop: "20px" }}>Your Choices</h2>
          <p>
            You can control cookies through your browser settings. You may also choose
            not to submit optional information such as leaderboard names or contact form
            details.
          </p>

          <h2 style={{ marginTop: "20px" }}>Contact</h2>
          <p>
            If you have privacy questions, contact us via <Link href="/contact" style={{ color: "var(--primary)" }}>/contact</Link>.
          </p>

          <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/" className="action-btn primary">Back to Trainer</Link>
            <Link href="/about" className="action-btn">About</Link>
            <Link href="/terms" className="action-btn">Terms</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
