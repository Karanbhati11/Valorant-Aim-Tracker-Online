/**
 * LazyComponent wrapper that defers rendering until the element
 * scrolls within 200px of the viewport.
 * Used for below-fold sections that contain heavy components.
 *
 * Requirements: 17.2 (lazy-load scripts below initial viewport,
 *   triggered within 200px of scroll position)
 */

'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';

interface LazyComponentProps {
  /** Content to render once visible */
  children: ReactNode;
  /** Placeholder shown while not yet visible */
  fallback?: ReactNode;
  /** Root margin for triggering load (default: 200px) */
  rootMargin?: string;
  /** Minimum height for the placeholder to reserve layout space */
  minHeight?: string | number;
  /** Optional className for the wrapper */
  className?: string;
}

export default function LazyComponent({
  children,
  fallback,
  rootMargin = '200px',
  minHeight = '100px',
  className,
}: LazyComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin, threshold: 0 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? (
        children
      ) : (
        fallback || (
          <div
            style={{
              minHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        )
      )}
    </div>
  );
}
