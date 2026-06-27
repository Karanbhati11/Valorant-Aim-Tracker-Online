/**
 * Breadcrumb navigation component.
 * Displays a visual breadcrumb trail with clickable links and includes
 * BreadcrumbList Schema.org structured data (JSON-LD) for SEO.
 *
 * Requirements: 18.1, 7.3
 */

import React from 'react';
import Link from 'next/link';
import { BreadcrumbItem } from '@/lib/seo/types';
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data';

export interface BreadcrumbsProps {
  /** Array of breadcrumb items from root to current page */
  items: BreadcrumbItem[];
  /** Delimiter character between breadcrumb links. Defaults to ">" */
  delimiter?: string;
}

export function Breadcrumbs({ items, delimiter = '>' }: BreadcrumbsProps) {
  if (items.length < 2) return null;

  const structuredData = generateBreadcrumbSchema(items);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.data) }}
      />
      <nav aria-label="Breadcrumb" className="breadcrumbs">
        <ol className="breadcrumbs__list">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.href} className="breadcrumbs__item">
                {!isLast ? (
                  <>
                    <Link href={item.href} className="breadcrumbs__link">
                      {item.label}
                    </Link>
                    <span className="breadcrumbs__delimiter" aria-hidden="true">
                      {delimiter}
                    </span>
                  </>
                ) : (
                  <span className="breadcrumbs__current" aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
