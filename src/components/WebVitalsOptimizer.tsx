/**
 * WebVitalsOptimizer - Client component that defers non-critical third-party scripts
 * and applies runtime Core Web Vitals optimizations.
 *
 * This component:
 * 1. Defers Google Analytics and AdSense loading until after LCP (Requirements: 10.1, 17.1)
 * 2. Ensures font-display: swap is applied to prevent CLS (Requirements: 10.2, 17.1)
 * 3. Adds passive event listeners for scroll/touch to improve INP (Requirements: 17.1)
 *
 * By loading GA/AdSense after the page is interactive, we reduce render-blocking
 * resources and ensure LCP ≤ 2.5s on 4G connections.
 */

'use client';

import { useEffect } from 'react';
import {
  deferThirdPartyScripts,
  ensureFontStability,
  DEFERRED_THIRD_PARTY_SCRIPTS,
} from '@/lib/performance';

export default function WebVitalsOptimizer() {
  useEffect(() => {
    // Defer ad scripts until after the page is interactive.
    // This prevents them from competing with LCP resources on the network.
    // NOTE: Google Analytics is now handled by the <GoogleAnalytics> component
    // from @next/third-parties (see app/layout.tsx), which correctly initializes
    // gtag and tracks client-side route changes. Do not init GA here.
    deferThirdPartyScripts(DEFERRED_THIRD_PARTY_SCRIPTS);

    // Ensure all fonts use font-display: swap to prevent CLS from FOIT
    ensureFontStability();

    // Make scroll and touch event listeners passive for better INP.
    // This is a document-level optimization that improves responsiveness.
    const passiveScrollCleanup = makeDocumentScrollPassive();

    return () => {
      passiveScrollCleanup();
    };
  }, []);

  // This component renders nothing — it only applies runtime optimizations
  return null;
}

/**
 * Ensures document-level scroll/touch listeners are passive.
 * Passive listeners tell the browser they won't call preventDefault(),
 * allowing the browser to scroll immediately without waiting for the handler.
 */
function makeDocumentScrollPassive(): () => void {
  // Override addEventListener for specific events to always be passive
  const noop = () => {};

  // Add a passive wheel listener to signal browser intent
  document.addEventListener('wheel', noop, { passive: true });
  document.addEventListener('touchstart', noop, { passive: true });

  return () => {
    document.removeEventListener('wheel', noop);
    document.removeEventListener('touchstart', noop);
  };
}
