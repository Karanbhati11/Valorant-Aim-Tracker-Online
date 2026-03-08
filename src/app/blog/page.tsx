import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "AimTrainerPro Blog | FPS Aim Training Guides",
  description:
    "Read practical FPS aim training guides for Valorant, CS2, and Fortnite. Improve flicks, tracking, sensitivity, and routines.",
  alternates: {
    canonical: "https://aimtrainerpro.online/blog",
  },
  openGraph: {
    title: "AimTrainerPro Blog | FPS Aim Training Guides",
    description:
      "Long-form guides on aim training routines, sensitivity setup, crosshair strategy, and in-game transfer.",
    url: "https://aimtrainerpro.online/blog",
    type: "website",
    siteName: "AimTrainerPro",
  },
};

type BlogIndexPageProps = {
  searchParams?: {
    id?: string;
  };
};

export default function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const legacyId = searchParams?.id;
  if (legacyId) {
    const post = getBlogPostBySlug(legacyId);
    if (post) {
      redirect(`/blog/${post.slug}`);
    }
  }

  const posts = getAllBlogPosts();
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://aimtrainerpro.online/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://aimtrainerpro.online/blog",
      },
    ],
  };

  return (
    <div className="blog-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <nav className="blog-nav" aria-label="Blog navigation">
        <div className="blog-nav-top">
          <div className="blog-brand-wrap">
            <h1 className="blog-logo">
              AIMTRAINERPRO <span style={{ color: "var(--primary)" }}>BLOG</span>
            </h1>
            <p className="blog-tagline">
              Practical aim guides and routines for FPS players
            </p>
          </div>

          <Link href="/" className="back-link blog-back-btn">
            Back to Trainer
          </Link>
        </div>

        <div className="blog-nav-links" role="navigation" aria-label="Blog quick links">
          <a
            className="blog-pill"
            href="https://valocrossdb.site/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Crosshairs
          </a>
        </div>
      </nav>

      <section className="blog-intro">
        <h2 style={{ marginBottom: "10px", fontSize: "2.3rem", letterSpacing: "1px" }}>
          Latest <span style={{ color: "var(--primary)" }}>Articles</span>
        </h2>
        <p style={{ margin: 0, color: "var(--text-muted)", maxWidth: "760px" }}>
          Improve aim with structured guides and then practice instantly in the trainer. <Link href="/" style={{ color: "var(--primary)", textDecoration: "underline" }}>Start training</Link>{" "}
          or{" "}
          <a
            href="https://valocrossdb.site/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--primary)", textDecoration: "underline" }}
          >
            explore crosshairs
          </a>
          .
        </p>
      </section>

      <div className="blog-content">
        <div className="blog-grid">
          {posts.map((post) => (
            <Link key={post.slug} className="blog-card-link" href={`/blog/${post.slug}`}>
              <article className="blog-card">
                <img
                  src={post.thumbnail}
                  className="card-img"
                  loading="lazy"
                  alt={post.title}
                />
                <div className="card-content">
                  <div className="card-date">{post.dateLabel}</div>
                  <h3 className="card-title">{post.title}</h3>
                  <p className="card-excerpt">{post.excerpt}</p>
                  <div className="read-more">Read Article →</div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      <footer
        style={{
          marginTop: "40px",
          padding: "18px 5% 30px",
          borderTop: "1px solid var(--border)",
          color: "var(--text-muted)",
          fontSize: "0.8rem",
          lineHeight: 1.4,
        }}
      >
        <div>
          AimTrainerPro is not affiliated with, endorsed, sponsored, or specifically approved by Riot Games, Inc.
          Valorant and Riot Games are trademarks or registered trademarks of Riot Games, Inc.
        </div>
        <div style={{ marginTop: "8px" }}>
          <a href="/about" style={{ color: "var(--text-muted)" }}>
            About
          </a>{" "}
          ·{" "}
          <a href="/privacy-policy" style={{ color: "var(--text-muted)" }}>
            Privacy Policy
          </a>{" "}
          ·{" "}
          <a href="/terms" style={{ color: "var(--text-muted)" }}>
            Terms
          </a>
        </div>
        <div style={{ marginTop: "8px" }}>© 2026 AimTrainerPro</div>
      </footer>
    </div>
  );
}
