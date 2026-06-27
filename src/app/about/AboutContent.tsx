"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";

const card = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius, 12px)",
  padding: "22px",
} as const;

export default function AboutContent() {
  const { t } = useI18n();

  const skills = [
    { key: "flicking", icon: "🎯" },
    { key: "tracking", icon: "🔄" },
    { key: "speed", icon: "⚡" },
    { key: "precision", icon: "🔬" },
    { key: "reaction", icon: "⏱️" },
  ];

  const faqKeys = ["q1", "q2", "q3", "q4"];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "56px 24px 72px" }}>
      {/* Hero */}
      <section style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 48px" }}>
        <span
          style={{
            display: "inline-block",
            fontSize: "0.72rem",
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            fontWeight: 700,
            color: "var(--accent)",
            background: "rgba(34, 211, 238, 0.08)",
            border: "1px solid rgba(34, 211, 238, 0.25)",
            padding: "6px 14px",
            borderRadius: "999px",
            marginBottom: "18px",
          }}
        >
          {t("common.about")} AimTrainerPro
        </span>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            lineHeight: 1.08,
            letterSpacing: "-1px",
            textTransform: "none",
            margin: "0 0 16px",
          }}
        >
          AimTrainer<span className="brand-accent">Pro</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", lineHeight: 1.6, margin: 0 }}>
          {t("about.mission")}
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "26px" }}>
          <Link href="/" className="action-btn primary" style={{ flex: "none", padding: "12px 24px", textDecoration: "none" }}>
            {t("about.cta")}
          </Link>
          <Link href="/blog" className="action-btn" style={{ flex: "none", padding: "12px 24px", textDecoration: "none", background: "rgba(255,255,255,0.05)" }}>
            {t("common.blog")}
          </Link>
        </div>
      </section>

      {/* Skills */}
      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.5rem", letterSpacing: "-0.3px", marginBottom: "20px" }}>
          {t("about.whatYouCanPractice")}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "18px",
          }}
        >
          {skills.map((s) => (
            <Link key={s.key} href="/" style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ ...card, cursor: "pointer", transition: "border-color 0.2s, transform 0.2s" }} className="about-skill-card">
                <div style={{ fontSize: "1.6rem", marginBottom: "10px" }}>{s.icon}</div>
                <h3 style={{ margin: "0 0 6px", fontSize: "1.1rem" }}>
                  {t(`about.skills.${s.key}.title`)}
                </h3>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.5 }}>
                  {t(`about.skills.${s.key}.desc`)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Who / Why */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "18px",
          marginBottom: "32px",
        }}
      >
        <div style={card}>
          <h2 style={{ marginTop: 0, fontSize: "1.25rem" }}>
            {t("about.whoItIsFor").split("—")[0]}
          </h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            {t("about.whoItIsFor")}
          </p>
        </div>
        <div style={card}>
          <h2 style={{ marginTop: 0, fontSize: "1.25rem" }}>
            {t("about.whyBrowser").split(".")[0]}
          </h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            {t("about.whyBrowser")}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.5rem", letterSpacing: "-0.3px", marginBottom: "20px" }}>FAQ</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {faqKeys.map((k) => (
            <div key={k} style={card}>
              <h3 style={{ fontSize: "1.05rem", color: "var(--accent)", margin: "0 0 8px" }}>
                {t(`about.faq.${k}`)}
              </h3>
              <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.6 }}>
                {t(`about.faq.a${k.slice(1)}`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          ...card,
          textAlign: "center",
          padding: "36px 24px",
          background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(34,211,238,0.06))",
          borderColor: "rgba(99,102,241,0.3)",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: "1.5rem" }}>{t("about.cta")}</h2>
        <p style={{ color: "var(--text-muted)", margin: "0 0 22px", lineHeight: 1.6 }}>
          {t("about.whyBrowser")}
        </p>
        <Link href="/" className="action-btn primary" style={{ flex: "none", padding: "13px 28px", textDecoration: "none", display: "inline-block" }}>
          {t("about.cta")}
        </Link>
      </section>

      <p
        style={{
          marginTop: "28px",
          color: "var(--text-muted)",
          fontSize: "0.82rem",
          lineHeight: 1.6,
          textAlign: "center",
        }}
      >
        {t("about.disclaimer")}
      </p>
    </div>
  );
}
