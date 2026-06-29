import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/StructuredData";
import {
  generateBreadcrumbSchema,
  generateBreadcrumbsFromPath,
} from "@/lib/seo/structured-data";
import { generateHreflangMetadata } from "@/lib/seo/hreflang-metadata";

export const metadata: Metadata = {
  title: "Terms and Conditions - AimTrainerPro",
  description:
    "Terms and Conditions of aimtrainerpro.online. Understand how you can use our services and what you can expect from us.",
  alternates: {
    ...generateHreflangMetadata("/terms"),
  },
};

const OWNER_EMAIL = "kbnoname1.1@gmail.com";

const card = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius, 12px)",
  padding: "24px",
  marginBottom: "20px",
} as const;

const heading = {
  marginTop: 0,
  fontSize: "1.2rem",
  marginBottom: "12px",
} as const;

const subHeading = {
  fontSize: "1.02rem",
  margin: "20px 0 8px",
  color: "var(--text)",
} as const;

const para = {
  color: "var(--text-muted)",
  lineHeight: 1.7,
  margin: "0 0 12px",
} as const;

const list = {
  color: "var(--text-muted)",
  lineHeight: 1.8,
  paddingLeft: "20px",
  margin: "0 0 12px",
} as const;

export default function TermsPage() {
  const breadcrumbs = generateBreadcrumbsFromPath("/terms", "Terms and Conditions");
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
            Terms and Conditions of <span className="brand-accent">aimtrainerpro.online</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: "0 auto 8px", maxWidth: "60ch", lineHeight: 1.6 }}>
            Welcome to the Terms &amp; Conditions page of aimtrainerpro.online. This document will help you
            understand how you can use our services and what you can expect from us.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            Latest update: June 29, 2026
          </p>
        </header>

        {/* Table of contents */}
        <div style={card}>
          <h2 style={heading}>Table of contents</h2>
          <ul style={{ ...list, margin: 0 }}>
            <li><a href="#introduction" style={{ color: "var(--primary)" }}>Introduction</a></li>
            <li><a href="#terms-of-use" style={{ color: "var(--primary)" }}>Terms of use</a></li>
            <li><a href="#common-provisions" style={{ color: "var(--primary)" }}>Common provisions</a></li>
            <li><a href="#definitions" style={{ color: "var(--primary)" }}>Definitions and legal references</a></li>
          </ul>
        </div>

        {/* Introduction */}
        <div style={card} id="introduction">
          <h2 style={heading}>Introduction</h2>
          <p style={para}>These Terms govern:</p>
          <ul style={list}>
            <li>the use of this Application, and,</li>
            <li>any other related Agreement or legal relationship with the Owner</li>
          </ul>
          <p style={para}>
            in a legally binding way. Capitalized words are defined in the relevant dedicated section of this document.
          </p>
          <p style={para}>The User must read this document carefully.</p>
          <p style={para}>This Application is provided by:</p>
          <p style={para}>
            AimTrainerPro -<br />
            Owner contact email:{" "}
            <a href={`mailto:${OWNER_EMAIL}`} style={{ color: "var(--primary)" }}>{OWNER_EMAIL}</a>
          </p>
        </div>

        {/* Terms of use */}
        <div style={card} id="terms-of-use">
          <h2 style={heading}>TERMS OF USE</h2>
          <p style={para}>
            Unless otherwise specified, the terms of use detailed in this section apply generally when using this Application.
          </p>
          <p style={para}>
            Single or additional conditions of use or access may apply in specific scenarios and in such cases are
            additionally indicated within this document.
          </p>

          <h3 style={subHeading}>Content on this Application</h3>
          <p style={para}>
            Unless where otherwise specified or clearly recognizable, all content available on this Application is owned
            or provided by the Owner or its licensors.
          </p>
          <p style={para}>
            The Owner undertakes its utmost effort to ensure that the content provided on this Application infringes no
            applicable legal provisions or third-party rights. However, it may not always be possible to achieve such a
            result. In such cases, without prejudice to any legal prerogatives of Users to enforce their rights, Users are
            kindly asked to preferably report related complaints using the contact details provided in this document.
          </p>

          <h3 style={subHeading}>Access to external resources</h3>
          <p style={para}>
            Through this Application Users may have access to external resources provided by third parties. Users
            acknowledge and accept that the Owner has no control over such resources and is therefore not responsible for
            their content and availability.
          </p>
          <p style={para}>
            Conditions applicable to any resources provided by third parties, including those applicable to any possible
            grant of rights in content, result from each such third parties&rsquo; terms and conditions or, in the absence
            of those, applicable statutory law.
          </p>

          <h3 style={subHeading}>Acceptable use</h3>
          <p style={para}>
            This Application and the Service may only be used within the scope of what they are provided for, under these
            Terms and applicable law.
          </p>
          <p style={{ ...para, marginBottom: 0 }}>
            Users are solely responsible for making sure that their use of this Application and/or the Service violates no
            applicable law, regulations or third-party rights.
          </p>
        </div>

        {/* Common provisions */}
        <div style={card} id="common-provisions">
          <h2 style={heading}>Common provisions</h2>

          <h3 style={subHeading}>No Waiver</h3>
          <p style={para}>
            The Owner&rsquo;s failure to assert any right or provision under these Terms shall not constitute a waiver of
            any such right or provision. No waiver shall be considered a further or continuing waiver of such term or any
            other term.
          </p>

          <h3 style={subHeading}>Service interruption</h3>
          <p style={para}>
            To ensure the best possible service level, the Owner reserves the right to interrupt the Service for
            maintenance, system updates or any other changes, informing the Users appropriately.
          </p>
          <p style={para}>
            Within the limits of law, the Owner may also decide to suspend or discontinue the Service altogether. If the
            Service is discontinued, the Owner will cooperate with Users to enable them to withdraw personal data or
            information and will respect Users&rsquo; rights relating to continued product use and/or compensation, as
            provided for by applicable law.
          </p>
          <p style={para}>
            Additionally, the Service might not be available due to reasons outside the Owner&rsquo;s reasonable control,
            such as &ldquo;force majeure&rdquo; events (infrastructural breakdowns or blackouts etc.).
          </p>

          <h3 style={subHeading}>Service reselling</h3>
          <p style={para}>
            Users may not reproduce, duplicate, copy, sell, resell or exploit any portion of this Application and of its
            Service without the Owner&rsquo;s express prior written permission, granted either directly or through a
            legitimate reselling program.
          </p>

          <h3 style={subHeading}>Intellectual property rights</h3>
          <p style={para}>
            Without prejudice to any more specific provision of these Terms, any intellectual property rights, such as
            copyrights, trademark rights, patent rights and design rights related to this Application are the exclusive
            property of the Owner or its licensors and are subject to the protection granted by applicable laws or
            international treaties relating to intellectual property.
          </p>
          <p style={para}>
            All trademarks &mdash; nominal or figurative &mdash; and all other marks, trade names, service marks, word
            marks, illustrations, images, or logos appearing in connection with this Application are, and remain, the
            exclusive property of the Owner or its licensors and are subject to the protection granted by applicable laws
            or international treaties related to intellectual property.
          </p>

          <h3 style={subHeading}>Changes to these Terms</h3>
          <p style={para}>
            The Owner reserves the right to amend or otherwise modify these Terms at any time. In such cases, the Owner
            will appropriately inform the User of these changes.
          </p>
          <p style={para}>
            Such changes will only affect the relationship with the User from the date communicated to Users onwards.
          </p>
          <p style={para}>
            The continued use of the Service will signify the User&rsquo;s acceptance of the revised Terms. If Users do not
            wish to be bound by the changes, they must stop using the Service and may terminate the Agreement.
          </p>
          <p style={para}>
            The applicable previous version will govern the relationship prior to the User&rsquo;s acceptance. The User can
            obtain any previous version from the Owner.
          </p>

          <h3 style={subHeading}>Assignment of contract</h3>
          <p style={para}>
            The Owner reserves the right to transfer, assign, dispose of by novation, or subcontract any or all rights or
            obligations under these Terms, taking the User&rsquo;s legitimate interests into account. Provisions regarding
            changes of these Terms will apply accordingly.
          </p>
          <p style={para}>
            Users may not assign or transfer their rights or obligations under these Terms in any way, without the written
            permission of the Owner.
          </p>

          <h3 style={subHeading}>Contacts</h3>
          <p style={para}>
            All communications relating to the use of this Application must be sent using the contact information stated in
            this document.
          </p>

          <h3 style={subHeading}>Severability</h3>
          <p style={{ ...para, marginBottom: 0 }}>
            Should any provision of these Terms be deemed or become invalid or unenforceable under applicable law, the
            invalidity or unenforceability of such provision shall not affect the validity of the remaining provisions,
            which shall remain in full force and effect.
          </p>
        </div>

        {/* Definitions */}
        <div style={card} id="definitions">
          <h2 style={heading}>Definitions and legal references</h2>

          <h3 style={subHeading}>This Application (or this Application)</h3>
          <p style={para}>The property that enables the provision of the Service.</p>

          <h3 style={subHeading}>Agreement</h3>
          <p style={para}>
            Any legally binding or contractual relationship between the Owner and the User, governed by these Terms.
          </p>

          <h3 style={subHeading}>Owner (or We)</h3>
          <p style={para}>
            Indicates the natural person(s) or legal entity that provides this Application and/or the Service to Users.
          </p>

          <h3 style={subHeading}>Service</h3>
          <p style={para}>
            The service provided by this Application as described in these Terms and on this Application.
          </p>

          <h3 style={subHeading}>Terms</h3>
          <p style={para}>
            All provisions applicable to the use of this Application and/or the Service as described in this document,
            including any other related documents or agreements, and as updated from time to time.
          </p>

          <h3 style={subHeading}>User (or You)</h3>
          <p style={{ ...para, marginBottom: 0 }}>
            Indicates any natural person or legal entity using this Application.
          </p>
        </div>

        {/* How can we help */}
        <div style={card}>
          <h2 style={heading}>How can we help?</h2>

          <h3 style={subHeading}>What you can do — Your data</h3>
          <ul style={list}>
            <li>Ask us to know and access the information we hold on you</li>
            <li>Ask us to correct information we hold on you</li>
            <li>Ask us to be forgotten (delete the information we hold on you)</li>
            <li>Ask to port your data to another service</li>
          </ul>

          <h3 style={subHeading}>In case of issues</h3>
          <p style={{ ...para, marginBottom: 0 }}>
            While we strive to create a positive user experience, we understand that issues may occasionally arise between
            us and our users. If this is the case, please feel free to{" "}
            <Link href="/contact" style={{ color: "var(--primary)" }}>contact us</Link>.
          </p>
        </div>

        {/* Footer / Owner info */}
        <div style={{ ...card, marginBottom: 0 }}>
          <h2 style={heading}>aimtrainerpro.online</h2>
          <p style={{ ...para, marginBottom: 0 }}>
            AimTrainerPro -<br />
            Owner contact email:{" "}
            <a href={`mailto:${OWNER_EMAIL}`} style={{ color: "var(--primary)" }}>{OWNER_EMAIL}</a>
          </p>
        </div>
      </div>
    </>
  );
}
