import "server-only";
import fs from "node:fs";
import path from "node:path";

type RawPost = {
  id: string;
  aliases?: string[];
  title: string;
  date: string;
  author: string;
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

function inferFocus(post: RawPost): string {
  const t = post.title.toLowerCase();
  if (t.includes("valorant")) return "Valorant";
  if (t.includes("cs2") || t.includes("counter-strike")) return "CS2";
  if (t.includes("fortnite")) return "Fortnite";
  if (t.includes("crosshair")) return "Crosshair optimization";
  if (t.includes("sensitivity") || t.includes("dpi")) return "Settings optimization";
  if (t.includes("tracking")) return "Tracking accuracy";
  if (t.includes("flick")) return "Flick consistency";
  return "FPS aim training";
}

function buildCoreAppendix(post: RawPost): string {
  const focus = inferFocus(post);
  return `
    <h2>Structured Implementation Plan</h2>
    <p>This ${focus.toLowerCase()} guide works best when you apply it in a weekly rhythm instead of isolated sessions. Build a repeatable block where each day has a clear objective, a measurable benchmark, and a transfer phase into real matches. Consistency is what turns isolated good runs into stable ranked performance.</p>
    <p>Start each session with one technical focus cue. Examples include relaxed grip pressure, smoother initial movement, or better stop timing before firing. Keeping one cue per session helps your brain reinforce movement quality while still producing measurable score progress.</p>

    <h2>Data Tracking Template</h2>
    <ul>
      <li>Record average accuracy from your primary benchmark scenario.</li>
      <li>Track the number of overflick corrections per run.</li>
      <li>Rate confidence from 1 to 10 after every ranked block.</li>
      <li>Review changes every 7 days, not every single session.</li>
    </ul>

    <h2>Transfer Checklist Before Queue</h2>
    <ol>
      <li>Complete at least one calm benchmark run with no panic speed.</li>
      <li>Lock settings for the day and avoid mid-session tweaks.</li>
      <li>Set one objective for live matches, such as first-shot discipline.</li>
      <li>After matches, review only the top 3 repeat mistakes.</li>
    </ol>

    <h2>FAQ</h2>
    <p><strong>How often should I train this routine?</strong> Five focused sessions per week is a strong baseline for measurable gains without burnout.</p>
    <p><strong>When should I change settings?</strong> Only after at least 10 to 14 days of consistent data, otherwise variance hides real progress.</p>
    <p><strong>How do I avoid plateaus?</strong> Rotate scenario emphasis while keeping your core benchmark stable so you can detect true improvement.</p>
  `;
}

function buildExtraSection(post: RawPost, index: number): string {
  const focus = inferFocus(post);
  const sessionLabel = `Session Block ${index + 1}`;
  return `
    <h2>${sessionLabel}: ${focus} Reinforcement</h2>
    <p>In ${sessionLabel.toLowerCase()}, focus on execution quality before score chasing. Run two controlled attempts where every shot is intentional, then one pressure attempt where you push pace while preserving technique. This pattern improves reliability and creates stronger carryover into matches.</p>
    <p>Use your post-session note to capture one mechanical improvement and one mistake pattern. Over time, this creates a practical feedback loop tailored to <strong>${post.title}</strong>, making your training uniquely relevant instead of generic.</p>
    <p>Finish with a short reset block in the trainer so your final reps are clean. Ending with stable movement quality helps retain better habits for the next day and reduces random variance between sessions.</p>
  `;
}

function ensureLongFormContent(post: RawPost): { html: string; words: number } {
  let html = normalizeLinks(post.content) + buildCoreAppendix(post);
  let words = countWordsFromHtml(html);
  let i = 0;

  // Bring short posts into long-form range while keeping each page unique by title/focus.
  while (words < 900 && i < 5) {
    html += buildExtraSection(post, i);
    words = countWordsFromHtml(html);
    i += 1;
  }

  return { html, words };
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

function buildCache() {
  if (cachedPosts && cachedAliasMap) return;

  const posts = loadRawPosts()
    .map((post) => {
      const enriched = ensureLongFormContent(post);
      return {
        id: post.id,
        slug: post.id,
        aliases: post.aliases ?? [],
        title: post.title,
        excerpt: post.excerpt,
        author: post.author,
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
