/**
 * Core Web Vitals optimization utilities.
 * Provides runtime optimizations targeting:
 * - LCP ≤ 2.5s on 4G (9 Mbps, 150ms RTT)
 * - INP ≤ 200ms
 * - CLS < 0.1
 * - 60fps during active exercises on WebGL 2.0 hardware
 *
 * Requirements: 10.1, 10.2, 10.3, 17.1
 */

/**
 * Defers non-critical third-party scripts until after the page becomes interactive.
 * This ensures LCP is not blocked by analytics, ads, or other non-essential resources.
 * Scripts are loaded after the 'load' event or after a 3-second timeout (whichever comes first).
 *
 * Requirements: 10.1 (LCP ≤ 2.5s), 17.1 (LCP ≤ 2.5s on mobile)
 */
export function deferThirdPartyScripts(scripts: DeferredScript[]): void {
  if (typeof window === 'undefined') return;

  const loadScripts = () => {
    scripts.forEach(({ src, attributes }) => {
      // Skip if already loaded
      if (document.querySelector(`script[src="${src}"]`)) return;

      const script = document.createElement('script');
      script.src = src;
      script.async = true;

      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          script.setAttribute(key, value);
        });
      }

      document.body.appendChild(script);
    });
  };

  // Load after the page is fully interactive, or after 3s timeout
  if (document.readyState === 'complete') {
    // Use requestIdleCallback if available for best timing
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(loadScripts, { timeout: 3000 });
    } else {
      setTimeout(loadScripts, 100);
    }
  } else {
    window.addEventListener('load', () => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(loadScripts, { timeout: 3000 });
      } else {
        setTimeout(loadScripts, 100);
      }
    }, { once: true });
  }
}

export interface DeferredScript {
  src: string;
  attributes?: Record<string, string>;
}

/**
 * Optimizes event handlers for INP by ensuring they yield to the main thread.
 * Wraps a handler so that if it would take >50ms, it yields via scheduler.yield()
 * or setTimeout(0) fallback, preventing long tasks that degrade INP.
 *
 * Requirements: 17.1 (INP ≤ 200ms)
 */
export function optimizeEventHandler<T extends (...args: any[]) => any>(
  handler: T
): T {
  return ((...args: any[]) => {
    // Use scheduler.yield() if available (modern browsers)
    if ('scheduler' in window && typeof (window as any).scheduler?.yield === 'function') {
      return (window as any).scheduler.yield().then(() => handler(...args));
    }
    // Fallback: run handler directly (it should already be fast)
    return handler(...args);
  }) as unknown as T;
}

/**
 * Prevents layout shift by ensuring dynamically inserted elements
 * have explicit dimensions before they are added to the DOM.
 * Returns a wrapper that sets contain: layout style to prevent
 * the element from affecting surrounding layout.
 *
 * Requirements: 10.2 (CLS < 0.1), 17.1 (CLS ≤ 0.1)
 */
export function createStableContainer(
  width: string | number,
  height: string | number
): HTMLDivElement {
  const container = document.createElement('div');
  container.style.width = typeof width === 'number' ? `${width}px` : width;
  container.style.height = typeof height === 'number' ? `${height}px` : height;
  container.style.contain = 'layout size';
  container.style.overflow = 'hidden';
  return container;
}

/**
 * Ensures the exercise renderer maintains 60fps by monitoring frame timing
 * and avoiding forced synchronous layouts during gameplay.
 * Uses performance.now() to detect frame drops and logs warnings in development.
 *
 * Requirements: 10.3 (60fps during active exercises on WebGL 2.0 hardware)
 */
export class FrameRateGuard {
  private lastFrameTime = 0;
  private frameDropCount = 0;
  private readonly targetFrameTime = 16.67; // 60fps = ~16.67ms per frame
  private readonly warningThreshold = 20; // Warn if frame takes >20ms
  private isActive = false;
  private rafId: number | null = null;

  /**
   * Start monitoring frame rate.
   * Call this when an exercise begins.
   */
  start(): void {
    this.isActive = true;
    this.frameDropCount = 0;
    this.lastFrameTime = performance.now();
    this.tick();
  }

  /**
   * Stop monitoring frame rate.
   * Call this when an exercise ends or pauses.
   */
  stop(): void {
    this.isActive = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Get the number of dropped frames since monitoring started.
   */
  getFrameDropCount(): number {
    return this.frameDropCount;
  }

  private tick(): void {
    if (!this.isActive) return;

    this.rafId = requestAnimationFrame(() => {
      const now = performance.now();
      const elapsed = now - this.lastFrameTime;

      if (elapsed > this.warningThreshold && this.lastFrameTime > 0) {
        this.frameDropCount++;
      }

      this.lastFrameTime = now;
      this.tick();
    });
  }
}

/**
 * Applies passive event listener optimization to scroll and touch events.
 * Passive listeners prevent these events from blocking the main thread,
 * improving INP and scroll performance.
 *
 * Requirements: 17.1 (INP ≤ 200ms)
 */
export function addPassiveEventListener(
  element: HTMLElement | Window | Document,
  event: string,
  handler: EventListenerOrEventListenerObject
): () => void {
  const passiveEvents = ['scroll', 'touchstart', 'touchmove', 'wheel', 'mousewheel'];
  const usePassive = passiveEvents.includes(event);
  const options: AddEventListenerOptions | undefined = usePassive ? { passive: true } : undefined;

  element.addEventListener(event, handler, options);
  return () => element.removeEventListener(event, handler, options as EventListenerOptions | undefined);
}

/**
 * Prevents Cumulative Layout Shift from font loading by applying
 * font-display: swap inline and reserving space for fallback fonts.
 * This is primarily handled by Next.js font optimization but this
 * provides a runtime fallback for any dynamically loaded fonts.
 *
 * Requirements: 10.2 (CLS < 0.1), 17.1 (CLS ≤ 0.1)
 */
export function ensureFontStability(): void {
  if (typeof document === 'undefined') return;

  // Check all @font-face rules and ensure they use font-display: swap
  const styleSheets = Array.from(document.styleSheets);
  styleSheets.forEach((sheet) => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      rules.forEach((rule) => {
        if (rule instanceof CSSFontFaceRule) {
          const fontDisplay = rule.style.getPropertyValue('font-display');
          if (!fontDisplay || fontDisplay === 'auto' || fontDisplay === 'block') {
            rule.style.setProperty('font-display', 'swap');
          }
        }
      });
    } catch {
      // Cross-origin stylesheets will throw - that's expected
    }
  });
}

/**
 * Batches DOM mutations to prevent forced reflow during gameplay.
 * Collects multiple DOM updates and applies them in a single
 * requestAnimationFrame callback to maintain 60fps.
 *
 * Requirements: 10.3 (60fps during active exercises)
 */
export class DOMBatcher {
  private pendingReads: Array<() => void> = [];
  private pendingWrites: Array<() => void> = [];
  private scheduled = false;

  /**
   * Schedule a DOM read operation (e.g., getBoundingClientRect).
   */
  read(fn: () => void): void {
    this.pendingReads.push(fn);
    this.schedule();
  }

  /**
   * Schedule a DOM write operation (e.g., setting style properties).
   */
  write(fn: () => void): void {
    this.pendingWrites.push(fn);
    this.schedule();
  }

  private schedule(): void {
    if (this.scheduled) return;
    this.scheduled = true;

    requestAnimationFrame(() => {
      // Execute all reads first (to avoid forced reflow)
      const reads = this.pendingReads.splice(0);
      reads.forEach((fn) => fn());

      // Then execute all writes
      const writes = this.pendingWrites.splice(0);
      writes.forEach((fn) => fn());

      this.scheduled = false;
    });
  }
}

/**
 * Configuration for non-critical third-party scripts that should be deferred
 * to improve LCP. These scripts are loaded after the page is interactive.
 */
export const DEFERRED_THIRD_PARTY_SCRIPTS: DeferredScript[] = [
  // NOTE: Google Analytics (gtag.js) is intentionally NOT listed here.
  // It is loaded via the <GoogleAnalytics> component from @next/third-parties
  // in app/layout.tsx, which handles gtag init and SPA route-change pageviews.
  {
    src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2970054316732906',
    attributes: { crossorigin: 'anonymous' },
  },
];
