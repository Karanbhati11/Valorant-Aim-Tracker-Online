"use client";

import React, { useEffect, useState } from "react";

/**
 * Non-blocking banner that recommends desktop or landscape mode when
 * the exercise page is viewed on a mobile device (≤768px) in portrait orientation.
 *
 * - Only shown on the exercise page (not blog, tools, landing, etc.)
 * - Dismissible: user can close it and continue using the page
 * - Uses matchMedia to detect portrait orientation + narrow viewport
 *
 * Requirements: 15.3
 */
export default function MobileExerciseRecommendation() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem("exercise-mobile-rec-dismissed") === "true") {
      setDismissed(true);
      return;
    }

    const checkViewport = () => {
      const isNarrow = window.innerWidth <= 768;
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      setVisible(isNarrow && isPortrait);
    };

    // Initial check
    checkViewport();

    // Listen for resize and orientation changes
    window.addEventListener("resize", checkViewport);
    const orientationMql = window.matchMedia("(orientation: portrait)");
    orientationMql.addEventListener("change", checkViewport);

    return () => {
      window.removeEventListener("resize", checkViewport);
      orientationMql.removeEventListener("change", checkViewport);
    };
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("exercise-mobile-rec-dismissed", "true");
  };

  if (!visible || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mobile-exercise-recommendation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9998,
        background: "linear-gradient(135deg, rgba(15, 18, 23, 0.97), rgba(25, 30, 40, 0.97))",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(255, 70, 85, 0.4)",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        boxShadow: "0 -4px 16px rgba(0, 0, 0, 0.5)",
        animation: "slideUp 0.3s ease-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
        <span
          style={{
            fontSize: "1.5rem",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          🖥️
        </span>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#fff",
              lineHeight: 1.3,
            }}
          >
            For the best aim training experience
          </p>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "0.75rem",
              color: "var(--text-muted, #999)",
              lineHeight: 1.3,
            }}
          >
            Rotate to landscape or use a desktop device
          </p>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss recommendation"
        style={{
          background: "none",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "6px",
          color: "#fff",
          fontSize: "0.75rem",
          padding: "6px 12px",
          cursor: "pointer",
          flexShrink: 0,
          fontFamily: "inherit",
          transition: "border-color 0.2s",
        }}
      >
        Got it
      </button>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
