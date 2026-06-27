"use client";

import Link from "next/link";
import { useState } from "react";
import LanguageSelector from "./LanguageSelector";
import { useI18n } from "./I18nProvider";

/**
 * Site-wide header navigation component.
 * Provides category navigation, tools links, and key page links.
 * Labels are translated via the i18n context.
 */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useI18n();

  const linkStyle = {
    color: "var(--text-muted)",
    textDecoration: "none",
    fontSize: "0.85rem",
  } as const;

  const triggerStyle = {
    background: "none",
    border: "none",
    color: "var(--text-muted)",
    fontSize: "0.85rem",
    cursor: "pointer",
    padding: "8px 0",
    fontFamily: "inherit",
  } as const;

  const mobileLinkStyle = {
    color: "var(--text-muted)",
    textDecoration: "none",
    fontSize: "0.9rem",
    minHeight: "44px",
    display: "flex",
    alignItems: "center",
    padding: "8px 0",
  } as const;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "rgba(15, 18, 23, 0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 5%",
      }}
    >
      <nav
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "56px",
        }}
        aria-label="Main navigation"
      >
        {/* Logo / Brand */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "#fff",
            fontWeight: 700,
            fontSize: "1.1rem",
            letterSpacing: "0.5px",
          }}
        >
          AIMTRAINER<span style={{ color: "var(--primary)" }}>PRO</span>
        </Link>

        {/* Desktop Navigation */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "24px" }}
          className="header-desktop-nav"
        >
          {/* Direct Links */}
          <Link href="/" style={linkStyle}>
            {t("common.exercises")}
          </Link>
          <Link href="/crosshairs" style={linkStyle}>
            Crosshair Generator
          </Link>
          <Link href="/crosshair-database" style={linkStyle}>
            Crosshair Database
          </Link>

          {/* Tools Dropdown */}
          <div style={{ position: "relative" }} className="header-dropdown">
            <button
              style={triggerStyle}
              aria-haspopup="true"
              className="header-dropdown-trigger"
            >
              {t("nav.tools")} ▾
            </button>
            <div className="header-dropdown-menu" role="menu">
              <Link href="/tools/sensitivity-converter" role="menuitem">
                {t("tools.sensitivityConverter")}
              </Link>
              <Link href="/tools/dpi-analyzer" role="menuitem">
                {t("tools.dpiAnalyzer")}
              </Link>
              <Link href="/tools/edpi-calculator" role="menuitem">
                eDPI Calculator
              </Link>
              <Link href="/tools/fov-calculator" role="menuitem">
                FOV Calculator
              </Link>
            </div>
          </div>

          <Link href="/blog" style={linkStyle}>
            {t("common.blog")}
          </Link>
          <Link href="/about" style={linkStyle}>
            {t("common.about")}
          </Link>

          <LanguageSelector />
        </div>

        {/* Mobile Hamburger */}
        <button
          className="header-mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={t("nav.toggleMenu")}
          aria-expanded={menuOpen}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "1.5rem",
            cursor: "pointer",
            padding: "8px",
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="header-mobile-menu"
          style={{
            padding: "16px 5%",
            borderTop: "1px solid var(--border)",
            background: "rgba(15, 18, 23, 0.98)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Link href="/" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}>{t("common.exercises")}</Link>
            <Link href="/crosshairs" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}>Crosshair Generator</Link>
            <Link href="/crosshair-database" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}>Crosshair Database</Link>
            <Link href="/tools/sensitivity-converter" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}>{t("tools.sensitivityConverter")}</Link>
            <Link href="/tools/dpi-analyzer" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}>{t("tools.dpiAnalyzer")}</Link>
            <Link href="/tools/edpi-calculator" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}>eDPI Calculator</Link>
            <Link href="/tools/fov-calculator" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}>FOV Calculator</Link>
            <Link href="/blog" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}>{t("common.blog")}</Link>
            <Link href="/about" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}>{t("common.about")}</Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)} style={mobileLinkStyle}>{t("common.contact")}</Link>
          </div>
          <div style={{ paddingTop: "12px", borderTop: "1px solid var(--border)", marginTop: "12px" }}>
            <div
              style={{
                color: "var(--primary)",
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              {t("common.language")}
            </div>
            <LanguageSelector />
          </div>
        </div>
      )}
    </header>
  );
}
