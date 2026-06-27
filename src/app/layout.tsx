import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { generateWebApplicationSchema } from "@/lib/seo/structured-data";
import { generateHreflangMetadata } from "@/lib/seo/hreflang-metadata";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import OfflineIndicator from "@/components/OfflineIndicator";
import WebVitalsOptimizer from "@/components/WebVitalsOptimizer";
import { I18nProvider } from "@/components/I18nProvider";

/**
 * Next.js font optimization: preloads Inter font files, applies font-display: swap,
 * and generates optimized @font-face declarations to prevent FOUT/FOUC and CLS.
 * Requirements: 17.3
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aimtrainerpro.online"),
  title: "AimTrainerPro — Free 3D Browser Aim Trainer | No Download",
  description:
    "Free browser aim trainer with 3D exercises for Valorant, CS2, Apex, and every FPS. Practice flicking, tracking, gridshot, and reaction time. No download, no signup — just open and train.",
  keywords: [
    "aim trainer", "aim trainer online", "browser aim trainer",
    "free aim trainer", "aim trainer 3d", "aim practice online",
    "valorant aim trainer", "cs2 aim trainer online", "flick aim trainer",
    "gridshot trainer", "fps aim trainer", "fps trainer",
    "aim lab online", "kovaaks alternative", "aim training free",
    "tactical shooter aim trainer", "online aim practice",
  ],
  authors: [{ name: "AimTrainerPro" }],
  creator: "AimTrainerPro",
  publisher: "AimTrainerPro",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aimtrainerpro.online/",
    siteName: "AimTrainerPro",
    title: "AimTrainerPro — Free 3D Browser Aim Trainer",
    description:
      "Practice aim for Valorant, CS2, and any FPS in your browser. Free 3D exercises: Gridshot, Flicking, Tracking, Reaction. No download required.",
    images: [
      {
        url: "/assets/preview-image.jpg",
        width: 1200,
        height: 630,
        alt: "AimTrainerPro Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AimTrainerPro — Free 3D Browser Aim Trainer",
    description:
      "Free aim trainer for Valorant, CS2, Apex. No download, instant practice.",
    images: ["/assets/preview-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AimTrainerPro",
  },
  manifest: "/manifest.json",
  alternates: {
    ...generateHreflangMetadata('/'),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Apple PWA meta tags for Safari installability */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AimTrainerPro" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

        {/* Theme color for PWA */}
        <meta name="theme-color" content="#6366f1" />

        {/*
          Core Web Vitals Optimization - Requirements: 10.1, 17.1
          Google Analytics and AdSense are deferred to after page load via
          the WebVitalsOptimizer client component. This prevents these non-critical
          scripts from blocking LCP (Largest Contentful Paint).
          
          Three.js is loaded with async + low fetchpriority since it's needed for
          exercises but not for the initial content paint.
        */}

        {/* Three.js - loaded only on homepage via the exercise loader, not globally */}

        {/* Enhanced WebApplication Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebApplicationSchema().data),
          }}
        ></script>
      </head>
      <body className={`${inter.className} bg-primary text-white`}>
        <I18nProvider>
          {/* Skip navigation link for keyboard users - WCAG 2.4.1 */}
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>
          <WebVitalsOptimizer />
          <OfflineIndicator />
          <Header />
          <main id="main-content">
            {children}
          </main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
