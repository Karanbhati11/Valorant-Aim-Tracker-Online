"use client";

import Link from "next/link";
import { useI18n } from "./I18nProvider";

const headingStyle = {
  color: "var(--primary)",
  fontSize: "0.75rem",
  textTransform: "uppercase" as const,
  letterSpacing: "1.5px",
  fontWeight: 700,
  marginBottom: "12px",
  marginTop: 0,
};

const linkStyle = {
  color: "var(--text-muted)",
  textDecoration: "none",
};

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer
      className="site-footer"
      style={{
        marginTop: "40px",
        padding: "32px 5% 40px",
        borderTop: "1px solid var(--border)",
        background: "rgba(0, 0, 0, 0.2)",
        color: "var(--text-muted)",
        fontSize: "0.85rem",
        lineHeight: 1.6,
      }}
    >
      <div
        className="footer-grid"
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Exercises */}
        <div>
          <h4 style={headingStyle}>{t("footer.exercises")}</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/" style={linkStyle}>{t("footer.allExercises")}</Link>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/valorant-aim-trainer" style={linkStyle}>Valorant Aim Trainer</Link>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/cs2-aim-trainer" style={linkStyle}>CS2 Aim Trainer</Link>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/flick-aim-trainer" style={linkStyle}>Flick Aim Trainer</Link>
            </li>
          </ul>
        </div>

        {/* Crosshairs */}
        <div>
          <h4 style={headingStyle}>Crosshairs</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/crosshairs" style={linkStyle}>Crosshair Generator</Link>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/crosshair-database" style={linkStyle}>Crosshair Database</Link>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/crosshair-database/best" style={linkStyle}>Best Crosshairs</Link>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/crosshair-database/pro/tenz" style={linkStyle}>TenZ Crosshair</Link>
            </li>
          </ul>
        </div>

        {/* Tools */}
        <div>
          <h4 style={headingStyle}>{t("footer.tools")}</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/tools/sensitivity-converter" style={linkStyle}>{t("tools.sensitivityConverter")}</Link>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/tools/dpi-analyzer" style={linkStyle}>{t("tools.dpiAnalyzer")}</Link>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/tools/edpi-calculator" style={linkStyle}>eDPI Calculator</Link>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/tools/fov-calculator" style={linkStyle}>FOV Calculator</Link>
            </li>
          </ul>
        </div>

        {/* Content */}
        <div>
          <h4 style={headingStyle}>{t("footer.content")}</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/blog" style={linkStyle}>{t("footer.blog")}</Link>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/about" style={linkStyle}>{t("footer.about")}</Link>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/contact" style={linkStyle}>{t("footer.contact")}</Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 style={headingStyle}>{t("footer.legal")}</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/privacy-policy" style={linkStyle}>{t("footer.privacyPolicy")}</Link>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/terms" style={linkStyle}>{t("footer.termsOfService")}</Link>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <Link href="/contact" style={linkStyle}>{t("footer.contact")}</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Disclaimer and copyright */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "24px auto 0",
          paddingTop: "20px",
          borderTop: "1px solid var(--border)",
          fontSize: "0.78rem",
          color: "var(--text-muted)",
        }}
      >
        <p style={{ margin: "0 0 8px 0" }}>{t("footer.disclaimer")}</p>
        <p style={{ margin: 0 }}>
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
