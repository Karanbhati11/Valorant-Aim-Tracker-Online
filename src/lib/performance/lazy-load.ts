/**
 * Lazy loading utilities for below-fold content.
 * Uses Intersection Observer to load images and scripts
 * when they scroll within 200px of the viewport.
 *
 * Requirements: 17.2 (lazy-load images/scripts outside initial viewport,
 *   triggered within 200px of scroll position)
 */

/**
 * Default root margin for triggering lazy loads.
 * 200px means content starts loading when within 200px of the viewport.
 */
const LAZY_LOAD_ROOT_MARGIN = '200px';

/**
 * Observe elements with data-lazy-src attribute and load them when
 * they scroll within 200px of the viewport.
 * Works for images (sets src from data-lazy-src) and iframes.
 */
export function initLazyLoadObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // Fallback: load all lazy elements immediately
    loadAllLazyElements();
    return null;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          loadLazyElement(element);
          observer.unobserve(element);
        }
      });
    },
    {
      rootMargin: LAZY_LOAD_ROOT_MARGIN,
      threshold: 0,
    }
  );

  // Observe all elements with data-lazy-src
  const lazyElements = document.querySelectorAll('[data-lazy-src]');
  lazyElements.forEach((el) => observer.observe(el));

  return observer;
}

/**
 * Load a single lazy element by transferring data-lazy-src to src.
 */
function loadLazyElement(element: HTMLElement): void {
  const lazySrc = element.getAttribute('data-lazy-src');
  if (!lazySrc) return;

  if (element instanceof HTMLImageElement) {
    element.src = lazySrc;
  } else if (element instanceof HTMLIFrameElement) {
    element.src = lazySrc;
  }

  element.removeAttribute('data-lazy-src');
  element.setAttribute('data-loaded', 'true');
}

/**
 * Fallback: load all lazy elements immediately (for browsers without IO).
 */
function loadAllLazyElements(): void {
  const lazyElements = document.querySelectorAll('[data-lazy-src]');
  lazyElements.forEach((el) => loadLazyElement(el as HTMLElement));
}

/**
 * Create an Intersection Observer that triggers a callback
 * when an element scrolls within 200px of the viewport.
 * Useful for lazy-loading scripts or components.
 */
export function observeElement(
  element: HTMLElement,
  onVisible: () => void,
  options?: { rootMargin?: string; once?: boolean }
): IntersectionObserver {
  const rootMargin = options?.rootMargin ?? LAZY_LOAD_ROOT_MARGIN;
  const once = options?.once ?? true;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onVisible();
          if (once) {
            observer.unobserve(entry.target);
          }
        }
      });
    },
    {
      rootMargin,
      threshold: 0,
    }
  );

  observer.observe(element);
  return observer;
}

/**
 * React hook-compatible function that returns whether native lazy loading
 * is supported. Use loading="lazy" on images below fold as the primary
 * mechanism, with Intersection Observer as enhancement.
 */
export function supportsNativeLazyLoading(): boolean {
  if (typeof window === 'undefined') return false;
  return 'loading' in HTMLImageElement.prototype;
}
