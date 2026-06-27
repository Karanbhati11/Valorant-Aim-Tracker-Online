"use client";

import React, { useState, useEffect } from "react";
import {
  type ColorVisionMode,
  getAvailablePalettes,
  loadPersistedPalette,
  applyColorPalette,
} from "@/lib/accessibility/color-palettes";

/**
 * Accessibility settings component that allows users to select
 * color palettes optimized for different color vision deficiencies.
 *
 * Requirements: 20.1, 20.2
 *
 * Renders as a settings panel with palette options for:
 * - Default (standard colors)
 * - Protanopia (red-blind)
 * - Deuteranopia (green-blind)
 * - Tritanopia (blue-blind)
 *
 * Persists selection to localStorage and applies CSS custom properties
 * and the Three.js target color immediately.
 */
export default function AccessibilitySettings() {
  const [selectedPalette, setSelectedPalette] = useState<ColorVisionMode>("default");
  const palettes = getAvailablePalettes();

  useEffect(() => {
    // Load saved preference on mount
    const saved = loadPersistedPalette();
    setSelectedPalette(saved);
    applyColorPalette(saved);
  }, []);

  const handlePaletteChange = (id: ColorVisionMode) => {
    setSelectedPalette(id);
    applyColorPalette(id);

    // Also update the exercise engine's target color in localStorage
    // The Three.js engine reads from localStorage.getItem('aim_target_color')
    const palette = palettes.find((p) => p.id === id);
    if (palette) {
      localStorage.setItem("aim_target_color", palette.colors.targetPrimary);
    }
  };

  return (
    <section
      aria-labelledby="a11y-settings-heading"
      style={{
        background: "rgba(0, 0, 0, 0.2)",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "20px",
      }}
    >
      <h3
        id="a11y-settings-heading"
        style={{
          color: "var(--accent)",
          marginTop: 0,
          marginBottom: "16px",
          fontSize: "1rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        Accessibility - Color Vision
      </h3>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.85rem",
          marginBottom: "16px",
          lineHeight: 1.5,
        }}
      >
        Select a color palette optimized for your color vision. This changes
        target colors in exercises and key UI accents.
      </p>

      <div
        role="radiogroup"
        aria-label="Color vision palette selection"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "12px",
        }}
      >
        {palettes.map((palette) => {
          const isSelected = selectedPalette === palette.id;
          return (
            <button
              key={palette.id}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${palette.name}: ${palette.description}`}
              onClick={() => handlePaletteChange(palette.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                padding: "14px",
                background: isSelected
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(0, 0, 0, 0.3)",
                border: isSelected
                  ? "2px solid var(--accent)"
                  : "2px solid var(--border)",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left",
                color: "inherit",
                fontFamily: "inherit",
                minHeight: "44px",
              }}
            >
              {/* Color swatches */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  alignItems: "center",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: palette.colors.targetPrimary,
                    border: "1px solid rgba(255,255,255,0.2)",
                    flexShrink: 0,
                  }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: palette.colors.targetSecondary,
                    border: "1px solid rgba(255,255,255,0.2)",
                    flexShrink: 0,
                  }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: palette.colors.targetHit,
                    border: "1px solid rgba(255,255,255,0.2)",
                    flexShrink: 0,
                  }}
                />
                {isSelected && (
                  <span
                    aria-hidden="true"
                    style={{
                      marginLeft: "auto",
                      color: "var(--accent)",
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    ✓
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                style={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                {palette.name}
              </span>
              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.75rem",
                  lineHeight: 1.4,
                }}
              >
                {palette.description}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
