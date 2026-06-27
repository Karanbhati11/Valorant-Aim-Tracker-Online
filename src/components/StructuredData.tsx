/**
 * Reusable component for injecting JSON-LD structured data into pages.
 * Renders one or more Schema.org JSON-LD script tags.
 */

import { StructuredDataBlock } from '@/lib/seo/types';

interface StructuredDataProps {
  blocks: StructuredDataBlock[];
}

export function StructuredData({ blocks }: StructuredDataProps) {
  return (
    <>
      {blocks.map((block, index) => (
        <script
          key={`${block.type}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block.data) }}
        />
      ))}
    </>
  );
}
