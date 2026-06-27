"use client";

import React, { useEffect, useState } from "react";

/**
 * Offline indicator component that displays a visible banner within 3 seconds
 * of connectivity loss and remains visible until connectivity is restored.
 * Uses navigator.onLine and online/offline events to detect connectivity.
 * Non-blocking: positioned as a fixed top banner that doesn't obscure content.
 *
 * Requirements: 11.4
 */
export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Initialize based on current connectivity state
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
      setShowBanner(true);
    }

    const handleOffline = () => {
      setIsOffline(true);
      // Show the banner immediately on connectivity loss
      // (well within the 3-second requirement from 11.4)
      setShowBanner(true);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowBanner(false);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "linear-gradient(90deg, #ff4655, #cc3344)",
        color: "#ffffff",
        padding: "10px 20px",
        textAlign: "center",
        fontSize: "0.875rem",
        fontWeight: 600,
        letterSpacing: "0.5px",
        boxShadow: "0 2px 8px rgba(255, 70, 85, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        animation: "slideDown 0.3s ease-out",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#ffffff",
          animation: "blink 1.5s infinite",
        }}
        aria-hidden="true"
      />
      <span>You are offline — scores will be saved and synced when you reconnect</span>
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
