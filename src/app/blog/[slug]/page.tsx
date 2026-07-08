import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getCanonicalBlogUrl,
  getSiteUrl,
} from "@/lib/blog-posts";
import { generateHreflangMetadata } from "@/lib/seo/hreflang-metadata";
import { generateAuthorPersonSchema } from "@/lib/blog/authors";
import { getCategoryBySlug } from "@/lib/blog/categories";
import {
  generateTableOfContents,
  injectHeadingIds,
} from "@/lib/blog/content-validation";
import InternalLinks from "@/components/InternalLink";
import { inferTagsFromTitle } from "@/lib/blog/internal-linking";
import type { TOCEntry } from "@/lib/content/types";
import { Breadcrumbs } from "@/components/Breadcrumbs";

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

  const hreflang = generateHreflangMetadata(`/blog/${params.slug}`);
  return {
    title: `${post.title} | AimTrainerPro Blog`,
    description: post.excerpt,
    alternates: {
      ...hreflang,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: getCanonicalBlogUrl(params.slug),
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

function TableOfContents({ entries }: { entries: TOCEntry[] }) {
  return (
    <nav className="toc" aria-label="Table of contents">
      <h2 className="toc-title">Table of Contents</h2>
      <ol className="toc-list">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className={entry.level === 3 ? "toc-item toc-item--nested" : "toc-item"}
          >
            <a href={`#${entry.id}`} className="toc-link">
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function WordCountBadge({ count }: { count: number }) {
  const readingTime = Math.ceil(count / 238); // Average reading speed
  return (
    <span className="word-count-badge">
      {count.toLocaleString()} words · {readingTime} min read
    </span>
  );
}

export default function BlogArticlePage({ params }: BlogArticlePageProps) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  // Generate table of contents for posts exceeding 2000 words (Requirement 9.2)
  const tableOfContents = generateTableOfContents(post.contentHtml, post.wordCount);

  // Inject heading IDs for anchor navigation
  const processedHtml = injectHeadingIds(post.contentHtml);

  const authorPersonSchema = generateAuthorPersonSchema(post.authorProfile);
  const categoryData = getCategoryBySlug(post.category);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: [`${getSiteUrl()}${post.thumbnail}`],
    author: {
      "@type": "Person",
      name: post.authorProfile.name,
      url: post.authorProfile.profileUrl,
      description: post.authorProfile.bio,
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
    articleSection: categoryData?.name ?? post.category,
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title, href: `/blog/${post.slug}` },
  ];

  return (
    <div className="blog-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorPersonSchema.data) }}
      />
      <Breadcrumbs items={breadcrumbItems} />

      <article className="article-view">
        <Link href="/blog" className="back-link" style={{ marginBottom: "20px" }}>
          Back to Articles
        </Link>

        <header className="article-header">
          <h1 className="article-title">{post.title}</h1>
          <div className="article-meta">
            <span>Published on {post.dateLabel}</span>
            <span>by {post.authorProfile.name}</span>
            <span>{categoryData?.name ?? post.category}</span>
            <WordCountBadge count={post.wordCount} />
          </div>
        </header>

        {tableOfContents && <TableOfContents entries={tableOfContents} />}

        <div className="article-body" dangerouslySetInnerHTML={{ __html: processedHtml }} />

        <InternalLinks
          category={post.category}
          currentSlug={post.slug}
          tags={inferTagsFromTitle(post.title)}
        />
      </article>
    </div>
  );
}
