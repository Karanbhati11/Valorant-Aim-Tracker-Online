import "server-only";
import fs from "node:fs";
import path from "node:path";
import { getAuthorByName } from "@/lib/blog/authors";
import type { AuthorProfile } from "@/lib/blog/authors";
import { inferCategory } from "@/lib/blog/categories";
import { getPostCategory } from "@/lib/blog/post-categories";
import type { BlogCategorySlug } from "@/lib/blog/categories";

type RawPost = {
  id: string;
  aliases?: string[];
  title: string;
  date: string;
  author: string;
  category?: BlogCategorySlug;
  thumbnail?: string;
  excerpt: string;
  content: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  aliases: string[];
  title: string;
  excerpt: string;
  author: string;
  authorProfile: AuthorProfile;
  category: BlogCategorySlug;
  dateLabel: string;
  dateISO: string;
  thumbnail: string;
  contentHtml: string;
  wordCount: number;
};

const SITE_URL = "https://aimtrainerpro.online";

function countWordsFromHtml(html: string): number {
  const text = html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return 0;
  return text.split(" ").length;
}

function resolveThumbnail(path?: string): string {
  if (!path) return "/assets/favicon.png";
  if (/^assets\/blog\/thumb-\d+\.jpg$/i.test(path)) {
    return "/assets/favicon.png";
  }
  return path.startsWith("/") ? path : `/${path}`;
}

function toISODate(dateLabel: string): string {
  const parsed = new Date(dateLabel);
  if (Number.isNaN(parsed.getTime())) {
    return new Date("2026-03-07T00:00:00.000Z").toISOString();
  }
  return parsed.toISOString();
}

function normalizeLinks(html: string): string {
  return html
    .replace(/href=["']https:\/\/aimtrainerpro\.online\/blog\?id=([a-z0-9-]+)["']/gi, 'href="/blog/$1"')
    .replace(/href=["']\/blog\?id=([a-z0-9-]+)["']/gi, 'href="/blog/$1"')
    .replace(/target=["']_blank["']\s*(?=>)/gi, 'target="_blank" rel="noopener noreferrer" ');
}

function buildContent(post: RawPost): { html: string; words: number } {
  const html = normalizeLinks(post.content);
  return { html, words: countWordsFromHtml(html) };
}

let cachedPosts: BlogPost[] | null = null;
let cachedAliasMap: Map<string, string> | null = null;

function loadRawPosts(): RawPost[] {
  const sourcePath = path.join(
    process.cwd(),
    "src",
    "lib",
    "blog-posts.generated.json",
  );
  const raw = fs.readFileSync(sourcePath, "utf8");
  return JSON.parse(raw) as RawPost[];
}

/**
 * Returns hand-written, SEO-optimized long-form HTML for a post when an
 * override file exists at src/content/blog/<id>.html. These are unique,
 * keyword-targeted articles (1500+ words) and bypass the generic appendix
 * so there is no duplicate boilerplate across posts.
 */
function loadOverrideContent(id: string): string | null {
  try {
    const p = path.join(process.cwd(), "src", "content", "blog", `${id}.html`);
    if (fs.existsSync(p)) {
      const html = fs.readFileSync(p, "utf8").trim();
      return html.length > 0 ? html : null;
    }
  } catch {
    // ignore — fall back to generated content
  }
  return null;
}

function buildCache() {
  if (cachedPosts && cachedAliasMap) return;

  const posts = loadRawPosts()
    .map((post) => {
      const override = loadOverrideContent(post.id);
      const enriched = override
        ? { html: normalizeLinks(override), words: countWordsFromHtml(override) }
        : buildContent(post);
      const authorProfile = getAuthorByName(post.author);
      const category: BlogCategorySlug = post.category ?? getPostCategory(post.id) ?? inferCategory(post.title, post.content);
      return {
        id: post.id,
        slug: post.id,
        aliases: post.aliases ?? [],
        title: post.title,
        excerpt: post.excerpt,
        author: post.author,
        authorProfile,
        category,
        dateLabel: post.date,
        dateISO: toISODate(post.date),
        thumbnail: resolveThumbnail(post.thumbnail),
        contentHtml: enriched.html,
        wordCount: enriched.words,
      };
    })
    .sort((a, b) => +new Date(b.dateISO) - +new Date(a.dateISO));

  const aliasMap = new Map<string, string>();
  for (const post of posts) {
    aliasMap.set(post.slug, post.slug);
    for (const alias of post.aliases) aliasMap.set(alias, post.slug);
  }

  cachedPosts = posts;
  cachedAliasMap = aliasMap;
}

export function getAllBlogPosts(): BlogPost[] {
  buildCache();
  return cachedPosts ?? [];
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  buildCache();
  const normalized = cachedAliasMap?.get(slug) ?? slug;
  return (cachedPosts ?? []).find((post) => post.slug === normalized);
}

export function getCanonicalBlogUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}

export function getSiteUrl(): string {
  return SITE_URL;
}
