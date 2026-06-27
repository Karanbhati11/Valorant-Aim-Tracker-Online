import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/blog-posts";

/**
 * Generates robots.txt with crawl directives.
 * Allows all crawlers access to public content while blocking
 * API routes and internal paths.
 *
 * Validates: Requirements 7.2
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // NOTE: Do NOT block /_next/ — Googlebot needs the JS/CSS/font assets
        // under /_next/static/ to render pages. Blocking them breaks rendering
        // and hurts indexing. Only non-public paths are disallowed here.
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
