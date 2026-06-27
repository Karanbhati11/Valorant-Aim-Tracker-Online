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
        disallow: ["/api/", "/_next/", "/admin/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
