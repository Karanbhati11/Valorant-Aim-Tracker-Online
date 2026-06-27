import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog-posts";
import { generateHreflangMetadata } from "@/lib/seo/hreflang-metadata";
import BlogThumb from "@/components/BlogThumb";

export const metadata: Metadata = {
  title: "AimTrainerPro Blog — FPS Aim Training Guides & Tips",
  description:
    "In-depth FPS aim training guides for Valorant, CS2, and Apex Legends. Learn flick aim, tracking, sensitivity optimization, crosshair strategy, and daily routines that transfer to ranked.",
  keywords: [
    "aim training guide", "valorant aim guide", "how to improve aim",
    "flick aim guide", "tracking aim guide", "fps training routine",
    "sensitivity guide valorant", "aim tips valorant", "cs2 aim tips",
    "best aim routine", "aim trainer blog",
  ],
  alternates: {
    ...generateHreflangMetadata('/blog'),
  },
  openGraph: {
    title: "AimTrainerPro Blog — FPS Aim Guides",
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
  const featured = posts[0];
  const rest = posts.slice(1);
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

      <header className="blog-hero">
        <span className="blog-eyebrow">AimTrainerPro Blog</span>
        <h1 className="blog-hero-title">
          Aim guides that actually <span className="blog-accent">transfer in-game</span>
        </h1>
        <p className="blog-hero-sub">
          Practical, no-fluff guides on flicking, tracking, sensitivity, and
          training routines — then put them into practice instantly in the
          browser trainer.
        </p>
        <div className="blog-hero-cta">
          <Link href="/" className="blog-btn blog-btn--primary">
            Start training
          </Link>
          <a
            href="https://valocrossdb.site/"
            target="_blank"
            rel="noopener noreferrer"
            className="blog-btn"
          >
            Explore crosshairs
          </a>
        </div>
      </header>

      {featured && (
        <Link className="blog-featured" href={`/blog/${featured.slug}`}>
          <div className="blog-featured-media">
            <BlogThumb seed={featured.slug} label={featured.category} />
            <span className="blog-chip">Featured</span>
          </div>
          <div className="blog-featured-body">
            <div className="card-date">{featured.dateLabel}</div>
            <h2 className="blog-featured-title">{featured.title}</h2>
            <p className="blog-featured-excerpt">{featured.excerpt}</p>
            <span className="read-more">Read article →</span>
          </div>
        </Link>
      )}

      <h2 className="blog-section-title">Latest articles</h2>

      <div className="blog-content">
        <div className="blog-grid">
          {rest.map((post) => (
            <Link key={post.slug} className="blog-card-link" href={`/blog/${post.slug}`}>
              <article className="blog-card">
                <div className="card-media">
                  <BlogThumb
                    seed={post.slug}
                    label={post.category}
                    className="card-img"
                  />
                </div>
                <div className="card-content">
                  <div className="card-date">{post.dateLabel}</div>
                  <h3 className="card-title">{post.title}</h3>
                  <p className="card-excerpt">{post.excerpt}</p>
                  <div className="read-more">Read article →</div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
