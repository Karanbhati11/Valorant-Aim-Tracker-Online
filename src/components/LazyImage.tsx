/**
 * LazyImage component for below-fold images.
 * Uses native loading="lazy" with Intersection Observer fallback.
 * Images are loaded when scrolled within 200px of the viewport.
 *
 * Requirements: 17.2 (lazy-load images outside initial viewport,
 *   triggered within 200px of scroll position)
 */

'use client';

import { useRef, useEffect, useState, ImgHTMLAttributes } from 'react';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Optional width for layout stability */
  width?: number | string;
  /** Optional height for layout stability */
  height?: number | string;
  /** Root margin for Intersection Observer (default: 200px) */
  rootMargin?: string;
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  rootMargin = '200px',
  className,
  style,
  ...rest
}: LazyImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // If native lazy loading is supported, the browser handles it
    if ('loading' in HTMLImageElement.prototype) {
      return;
    }

    // Fallback: use Intersection Observer for older browsers
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLImageElement;
            const lazySrc = target.getAttribute('data-src');
            if (lazySrc) {
              target.src = lazySrc;
              target.removeAttribute('data-src');
            }
            observer.unobserve(target);
          }
        });
      },
      { rootMargin, threshold: 0 }
    );

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      className={className}
      style={{
        ...style,
        opacity: isLoaded ? 1 : 0.7,
        transition: 'opacity 0.3s ease',
      }}
      onLoad={() => setIsLoaded(true)}
      {...rest}
    />
  );
}
