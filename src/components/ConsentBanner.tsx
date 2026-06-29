'use client';

import { useEffect, useState } from 'react';

// Key used to remember the visitor's choice across sessions.
const STORAGE_KEY = 'cookie_consent';

declare global {
  interface Window {
    // `dataLayer` is already declared globally by @next/third-parties as
    // `Object[]`, so we don't redeclare it here to avoid a type conflict.
    // gtag is injected by the consent init script in the root layout.
    gtag?: (...args: unknown[]) => void;
  }
}

// Fires the Consent Mode v2 update to "granted" and signals GTM. Safe to call
// on every page load — it re-applies the visitor's stored choice so the
// container doesn't fall back to the denied default after a reload.
function applyGrantedConsent() {
  // Guard against SSR / hydration: window and gtag must exist on the client.
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('consent', 'update', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
  });

  // Signal GTM to instantly fire any tags waiting behind consent.
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'consent_updated' });
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'granted') {
        // Visitor already accepted — re-apply granted consent on this load
        // (the head script reset the default back to denied).
        applyGrantedConsent();
      } else if (!stored) {
        // No choice made yet — show the banner.
        setVisible(true);
      }
    } catch {
      // localStorage may be unavailable (private mode, etc.) — show the banner.
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    applyGrantedConsent();

    // Persist the choice and hide the banner.
    try {
      window.localStorage.setItem(STORAGE_KEY, 'granted');
    } catch {
      // Ignore storage failures; the banner still closes for this session.
    }
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '1rem 1.25rem',
        background: '#16161f',
        borderTop: '1px solid #2a2a3a',
        color: '#fff',
        fontSize: '0.9rem',
      }}
    >
      <p style={{ margin: 0, maxWidth: '60ch' }}>
        We use cookies to analyze traffic and improve your experience. By
        clicking &quot;Accept&quot;, you consent to analytics and advertising
        cookies.
      </p>
      <button
        type="button"
        onClick={handleAccept}
        style={{
          padding: '0.5rem 1.25rem',
          borderRadius: '0.5rem',
          border: 'none',
          background: '#6366f1',
          color: '#fff',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Accept
      </button>
    </div>
  );
}
