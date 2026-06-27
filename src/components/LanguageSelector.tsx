"use client";

import React, { useState } from "react";
import { useI18n } from "./I18nProvider";
import type { Locale } from "@/lib/i18n/messages";

/**
 * Language selector for the site header.
 *
 * Switching language is instant and client-side via the I18n context — it
 * updates the UI in place and persists to localStorage. It does NOT change the
 * URL, so there are no broken locale-prefixed routes.
 */
const LOCALE_OPTIONS: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

export default function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const current =
    LOCALE_OPTIONS.find((opt) => opt.code === locale) || LOCALE_OPTIONS[0];

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setIsOpen(false);
  };

  return (
    <div style={{ position: "relative" }} className="language-selector">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        aria-label={`${t("language_selector.current")}: ${current.label}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          background: "none",
          border: "1px solid var(--border, #333)",
          borderRadius: "6px",
          color: "var(--text-muted, #aaa)",
          fontSize: "0.8rem",
          cursor: "pointer",
          padding: "6px 10px",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          minHeight: "36px",
          transition: "border-color 0.2s, color 0.2s",
        }}
      >
        <span aria-hidden="true">{current.flag}</span>
        <span>{current.code.toUpperCase()}</span>
        <span
          aria-hidden="true"
          style={{
            fontSize: "0.6rem",
            transform: isOpen ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
          }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label={t("language_selector.label")}
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            background: "rgba(17, 22, 32, 0.98)",
            border: "1px solid var(--border, #333)",
            borderRadius: "8px",
            padding: "4px",
            listStyle: "none",
            margin: 0,
            minWidth: "160px",
            zIndex: 1000,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {LOCALE_OPTIONS.map((option) => {
            const active = option.code === locale;
            return (
              <li key={option.code}>
                <button
                  role="option"
                  aria-selected={active}
                  onMouseDown={(e) => {
                    // onMouseDown fires before the trigger's onBlur closes the list.
                    e.preventDefault();
                    handleSelect(option.code);
                  }}
                  style={{
                    width: "100%",
                    background: active
                      ? "rgba(99, 102, 241, 0.15)"
                      : "transparent",
                    border: "none",
                    borderRadius: "4px",
                    color: active ? "var(--primary, #6366f1)" : "var(--text-muted, #aaa)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    padding: "8px 12px",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    textAlign: "left",
                    minHeight: "44px",
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.color = "#fff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-muted, #aaa)";
                    }
                  }}
                >
                  <span aria-hidden="true" style={{ fontSize: "1.1rem" }}>
                    {option.flag}
                  </span>
                  <span>{option.label}</span>
                  {active && (
                    <span aria-hidden="true" style={{ marginLeft: "auto", fontSize: "0.7rem" }}>
                      ✓
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
