import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/StructuredData";
import {
  generateBreadcrumbSchema,
  generateBreadcrumbsFromPath,
} from "@/lib/seo/structured-data";
import { generateHreflangMetadata } from "@/lib/seo/hreflang-metadata";

export const metadata: Metadata = {
  title: "Privacy Policy - AimTrainerPro",
  description:
    "Read the AimTrainerPro privacy policy. Learn how we collect, use, and protect your information when using our free aim trainer.",
  alternates: {
    ...generateHreflangMetadata("/privacy-policy"),
  },
};

const card = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius, 12px)",
  padding: "24px",
  marginBottom: "20px",
} as const;

export default function PrivacyPolicyPage() {
  const breadcrumbs = generateBreadcrumbsFromPath("/privacy-policy", "Privacy Policy");
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  return (
    <>
      <StructuredData blocks={[breadcrumbSchema]} />
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "56px 24px 72px" }}>
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
            Legal
          </span>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", letterSpacing: "-0.5px", margin: "0 0 8px", textTransform: "none" }}>
            Privacy <span className="brand-accent">Policy</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            Last updated: March 7, 2026
          </p>
        </header>

        <div style={card}>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            This Privacy Policy explains how AimTrainerPro collects, uses, and protects information when you use our website.
          </p>
        </div>

        <div style={card}>
          <h2 style={{ marginTop: 0, fontSize: "1.2rem", marginBottom: "12px" }}>Information We Collect</h2>
          <ul style={{ color: "var(--text-muted)", lineHeight: 1.8, paddingLeft: "20px", margin: 0 }}>
            <li>Basic usage analytics (page visits and interactions)</li>
            <li>Leaderboard submissions you choose to provide (e.g., username and score)</li>
            <li>Messages submitted through our contact form</li>
          </ul>
        </div>

        <div style={card}>
          <h2 style={{ marginTop: 0, fontSize: "1.2rem", marginBottom: "12px" }}>How We Use Information</h2>
          <ul style={{ color: "var(--text-muted)", lineHeight: 1.8, paddingLeft: "20px", margin: 0 }}>
            <li>To operate and improve the trainer and blog content</li>
            <li>To prevent abuse and maintain fair leaderboard functionality</li>
            <li>To respond to support and contact requests</li>
          </ul>
        </div>

        <div style={card}>
          <h2 style={{ marginTop: 0, fontSize: "1.2rem", marginBottom: "12px" }}>Cookies and Advertising</h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            We may use cookies and similar technologies for analytics and advertising. Third-party advertising vendors, including Google, may use cookies to serve ads based on your prior visits to this and other websites.
          </p>
        </div>

        <div style={card}>
          <h2 style={{ marginTop: 0, fontSize: "1.2rem", marginBottom: "12px" }}>Third-Party Services</h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            We may use third-party services such as analytics, hosting, and advertising providers. These services may process data according to their own privacy policies.
          </p>
        </div>

        <div style={card}>
          <h2 style={{ marginTop: 0, fontSize: "1.2rem", marginBottom: "12px" }}>Your Choices</h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            You can control cookies through your browser settings. You may also choose not to submit optional information such as leaderboard names or contact form details.
          </p>
        </div>

        <div style={{ ...card, marginBottom: 0 }}>
          <h2 style={{ marginTop: 0, fontSize: "1.2rem", marginBottom: "12px" }}>Contact</h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            If you have privacy questions, contact us via our{" "}
            <Link href="/contact" style={{ color: "var(--primary)" }}>contact page</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
