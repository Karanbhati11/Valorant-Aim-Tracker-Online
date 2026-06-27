import type { Metadata } from "next";
import { StructuredData } from "@/components/StructuredData";
import {
  generateBreadcrumbSchema,
  generateBreadcrumbsFromPath,
} from "@/lib/seo/structured-data";
import { generateHreflangMetadata } from "@/lib/seo/hreflang-metadata";

export const metadata: Metadata = {
  title: "Contact AimTrainerPro — Questions, Feedback & Business",
  description:
    "Get in touch with the AimTrainerPro team. Questions about the aim trainer, crosshair database, sensitivity tools, or business inquiries — we respond within 24 hours.",
  alternates: {
    ...generateHreflangMetadata("/contact"),
  },
};

export default function ContactPage() {
  const breadcrumbs = generateBreadcrumbsFromPath("/contact", "Contact");
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  return (
    <>
      <StructuredData blocks={[breadcrumbSchema]} />
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "56px 24px 72px" }}>
        <header style={{ textAlign: "center", marginBottom: "40px" }}>
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
            Get in Touch
          </span>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", letterSpacing: "-0.5px", margin: "0 0 8px", textTransform: "none" }}>
            Contact <span className="brand-accent">Us</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1.6, margin: 0 }}>
            Have a question, feedback, or business inquiry? We would love to hear from you.
          </p>
        </header>

        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius, 12px)",
            padding: "32px",
          }}
        >
          <form
            action="https://formspree.io/f/mkonbeag"
            method="POST"
            style={{ display: "grid", gap: "20px" }}
          >
            <div className="setting-group" style={{ marginBottom: 0 }}>
              <label className="setting-label" htmlFor="email">
                Your email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                style={{ width: "100%", userSelect: "text", borderRadius: "8px" }}
              />
            </div>

            <div className="setting-group" style={{ marginBottom: 0 }}>
              <label className="setting-label" htmlFor="subject">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                name="subject"
                placeholder="What is this about?"
                style={{ width: "100%", userSelect: "text", borderRadius: "8px" }}
              />
            </div>

            <div className="setting-group" style={{ marginBottom: 0 }}>
              <label className="setting-label" htmlFor="message">
                Your message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                placeholder="Tell us what's on your mind..."
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid var(--border)",
                  color: "white",
                  padding: "12px 15px",
                  borderRadius: "8px",
                  fontFamily: "inherit",
                  fontSize: "1rem",
                  userSelect: "text",
                  resize: "vertical",
                }}
              ></textarea>
            </div>

            <button
              type="submit"
              className="action-btn primary"
              style={{ padding: "14px 28px", fontSize: "1rem", justifySelf: "start" }}
            >
              Send Message
            </button>
          </form>
        </div>

        <p
          style={{
            marginTop: "24px",
            color: "var(--text-muted)",
            fontSize: "0.82rem",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          We typically respond within 24–48 hours. For urgent matters, please include
          &quot;Urgent&quot; in your subject line.
        </p>
      </div>
    </>
  );
}
