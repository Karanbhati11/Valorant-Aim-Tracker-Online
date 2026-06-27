/**
 * SEO system type definitions.
 * Defines page metadata, structured data, and hreflang interfaces.
 */

export interface HreflangEntry {
  locale: string;
  url: string;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface StructuredDataBlock {
  type: 'WebApplication' | 'Article' | 'BreadcrumbList' | 'FAQPage' | 'HowTo' | 'Person';
  data: Record<string, unknown>;
}

export interface PageSEO {
  title: string;
  description: string;
  canonical: string;
  keywords: string[];
  structuredData: StructuredDataBlock[];
  hreflang?: HreflangEntry[];
  breadcrumbs?: BreadcrumbItem[];
}
