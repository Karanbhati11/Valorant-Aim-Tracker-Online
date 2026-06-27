import type { MetadataRoute } from "next";
import { getAllBlogPosts, getCanonicalBlogUrl, getSiteUrl } from "@/lib/blog-posts";
import { getAllExercises } from "@/lib/exercises/registry";
import type { ExerciseCategory } from "@/lib/exercises/types";
import { getAllProSlugs } from "@/lib/crosshair/pro-players";

/**
 * Generates a comprehensive XML sitemap including all exercise pages,
 * blog posts, category pages, landing pages, and tools.
 *
 * - Regenerates on each build (Next.js static generation)
 * - Uses revalidate = 3600 (1 hour) to support new blog posts updating
 *   the sitemap within 1 hour of publication
 *
 * Validates: Requirements 7.2, 9.4
 */

/** Force ISR with 1-hour revalidation so new blog posts appear within 1 hour */
export const revalidate = 3600;

const EXERCISE_CATEGORIES: ExerciseCategory[] = [
  "flicking",
  "tracking",
  "speed",
  "precision",
  "reaction",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  // --- Static pages ---
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // --- Tools pages ---
  const toolsRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/tools/sensitivity-converter`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/tools/dpi-analyzer`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/tools/edpi-calculator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/tools/fov-calculator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // --- Game-specific aim trainer landing pages ---
  const landingRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/valorant-aim-trainer`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/cs2-aim-trainer`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/flick-aim-trainer`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // --- Crosshair Database pages ---
  const crosshairRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/crosshairs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/crosshair-database`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${siteUrl}/crosshair-database/best`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/crosshair-database/dot`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/crosshair-database/funny`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];

  // --- Pro player crosshair pages ---
  const proPlayerRoutes: MetadataRoute.Sitemap = getAllProSlugs().map((slug) => ({
    url: `${siteUrl}/crosshair-database/pro/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // --- Exercise pages (one per exercise) ---
  const exercises = getAllExercises();
  const exerciseRoutes: MetadataRoute.Sitemap = exercises.map((exercise) => ({
    url: `${siteUrl}/exercises/${exercise.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // --- Category pages ---
  const categoryRoutes: MetadataRoute.Sitemap = EXERCISE_CATEGORIES.map(
    (category) => ({
      url: `${siteUrl}/exercises/category/${category}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  // --- Blog posts ---
  const blogPosts = getAllBlogPosts();
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: getCanonicalBlogUrl(post.slug),
    lastModified: post.dateISO,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...toolsRoutes,
    ...landingRoutes,
    ...crosshairRoutes,
    ...proPlayerRoutes,
    ...exerciseRoutes,
    ...categoryRoutes,
    ...blogRoutes,
  ];
}
