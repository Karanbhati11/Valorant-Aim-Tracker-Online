import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getCanonicalBlogUrl,
  getSiteUrl,
} from "@/lib/blog-posts";

type BlogArticlePageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: BlogArticlePageProps): Metadata {
  const post = getBlogPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Article Not Found | AimTrainerPro Blog",
      robots: { index: false, follow: false },
    };
  }

  const canonical = getCanonicalBlogUrl(post.slug);
  return {
    title: `${post.title} | AimTrainerPro Blog`,
    description: post.excerpt,
    alternates: {
      canonical,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: canonical,
      siteName: "AimTrainerPro",
      publishedTime: post.dateISO,
      authors: [post.author],
      images: [
        {
          url: `${getSiteUrl()}${post.thumbnail}`,
          width: 512,
          height: 512,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [`${getSiteUrl()}${post.thumbnail}`],
    },
  };
}

export default function BlogArticlePage({ params }: BlogArticlePageProps) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: [`${getSiteUrl()}${post.thumbnail}`],
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "AimTrainerPro",
      logo: {
        "@type": "ImageObject",
        url: `${getSiteUrl()}/assets/favicon.png`,
      },
    },
    datePublished: post.dateISO,
    dateModified: post.dateISO,
    mainEntityOfPage: getCanonicalBlogUrl(post.slug),
    wordCount: post.wordCount,
  };

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
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: getCanonicalBlogUrl(post.slug),
      },
    ],
  };

  return (
    <div className="blog-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
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
            <p className="blog-tagline">Practical aim guides and routines for FPS players</p>
          </div>

          <Link href="/" className="back-link blog-back-btn">
            Back to Trainer
          </Link>
        </div>

        <div className="blog-nav-links" role="navigation" aria-label="Blog quick links">
          <Link className="blog-pill" href="/blog">
            All Articles
          </Link>
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

      <article className="article-view">
        <Link href="/blog" className="back-link" style={{ marginBottom: "20px" }}>
          Back to Articles
        </Link>

        <header className="article-header">
          <h1 className="article-title">{post.title}</h1>
          <div className="article-meta">
            <span>Published on {post.dateLabel}</span>
            <span>by {post.author}</span>
            <span>{post.wordCount} words</span>
          </div>
        </header>

        <div className="article-body" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </article>

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
