import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/StructuredData";
import {
  generateBreadcrumbSchema,
  generateBreadcrumbsFromPath,
} from "@/lib/seo/structured-data";
import { generateHreflangMetadata } from "@/lib/seo/hreflang-metadata";

export const metadata: Metadata = {
  title: "Terms of Service - AimTrainerPro",
  description:
    "Read the AimTrainerPro terms of service. Understand the rules and guidelines for using our free browser-based aim training platform.",
  alternates: {
    ...generateHreflangMetadata("/terms"),
  },
};

const card = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius, 12px)",
  padding: "24px",
  marginBottom: "20px",
} as const;

export default function TermsPage() {
  const breadcrumbs = generateBreadcrumbsFromPath("/terms", "Terms of Service");
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
            Terms of <span className="brand-accent">Service</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            Last updated: March 7, 2026
          </p>
        </header>

        <div style={card}>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            By accessing or using AimTrainerPro, you agree to these Terms of Service. If you do not agree, please do not use the website.
          </p>
        </div>

        <div style={card}>
          <h2 style={{ marginTop: 0, fontSize: "1.2rem", marginBottom: "12px" }}>Use of the Service</h2>
          <ul style={{ color: "var(--text-muted)", lineHeight: 1.8, paddingLeft: "20px", margin: 0 }}>
            <li>You may use the site for personal, non-commercial practice purposes.</li>
            <li>You agree not to abuse, disrupt, or attempt to exploit the platform.</li>
            <li>You are responsible for the information you submit (e.g., leaderboard names).</li>
          </ul>
        </div>

        <div style={card}>
          <h2 style={{ marginTop: 0, fontSize: "1.2rem", marginBottom: "12px" }}>Intellectual Property</h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            Site content, design elements, and training systems are owned by AimTrainerPro unless otherwise stated. Third-party trademarks are the property of their respective owners.
          </p>
        </div>

        <div style={card}>
          <h2 style={{ marginTop: 0, fontSize: "1.2rem", marginBottom: "12px" }}>No Warranty</h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            The service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. We do not guarantee uninterrupted availability or specific performance outcomes.
          </p>
        </div>

        <div style={card}>
          <h2 style={{ marginTop: 0, fontSize: "1.2rem", marginBottom: "12px" }}>Limitation of Liability</h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            To the maximum extent permitted by law, AimTrainerPro is not liable for any indirect, incidental, or consequential damages arising from your use of the site.
          </p>
        </div>

        <div style={card}>
          <h2 style={{ marginTop: 0, fontSize: "1.2rem", marginBottom: "12px" }}>Changes to Terms</h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            We may update these terms from time to time. Continued use after updates means you accept the revised terms.
          </p>
        </div>

        <div style={{ ...card, marginBottom: 0 }}>
          <h2 style={{ marginTop: 0, fontSize: "1.2rem", marginBottom: "12px" }}>Contact</h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            For questions about these terms, use our{" "}
            <Link href="/contact" style={{ color: "var(--primary)" }}>contact page</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
