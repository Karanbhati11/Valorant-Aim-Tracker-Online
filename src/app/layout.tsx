import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valorant Aim Trainer Online - Free 3D Browser Aim Practice",
  description:
    "The best free Valorant Aim Trainer Online. Improve your raw aim with 3D browser-based exercises for flicking, tracking, and micro-adjustments. No download required. Optimized for low-end PCs.",
  keywords: [
    "valorant aim trainer online",
    "valorant aim trainer",
    "aim trainer online",
    "online aim trainer valorant",
    "valorant online trainer",
    "aim trainer 3d",
    "browser aim trainer",
    "free aim trainer",
    "aim lab online",
    "valorant warmup",
    "aim practice online",
    "fps trainer",
    "valorant practice",
    "gridshot trainer",
  ],
  authors: [{ name: "Aim Pro 3D" }],
  creator: "Aim Pro 3D",
  publisher: "Aim Pro 3D",
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
    url: "https://valorantaimtrainer.online/",
    siteName: "Valorant Aim Trainer Online",
    title: "Valorant Aim Trainer Online - Free 3D Browser Aim Practice",
    description:
      "Practice your aim in browser with this 3D Valorant Trainer. No download required. Features Gridshot, Strafing, and Micro-adjustments.",
    images: [
      {
        url: "/assets/preview-image.jpg",
        width: 1200,
        height: 630,
        alt: "Valorant Aim Trainer Online Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Valorant Aim Trainer Online - Free 3D",
    description:
      "Improve your aim instantly. Free 3D browser aim trainer for Valorant.",
    images: ["/assets/preview-image.jpg"],
  },
  icons: {
    icon: "/assets/favicon.png",
    shortcut: "/assets/favicon.png",
    apple: "/assets/favicon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://valorantaimtrainer.online/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-RW21VMXTMF"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-RW21VMXTMF');`,
          }}
        ></script>

        {/* Three.js */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Valorant Aim Trainer Online",
              url: "https://valorantaimtrainer.online/",
              description:
                "A free 3D browser-based aim trainer designed for Valorant players to improve flicking, tracking, and micro-adjustments.",
              applicationCategory: "Game",
              genre: "FPS Trainer",
              operatingSystem: "Web Browser",
              browserRequirements: "Requires WebGL",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1250",
              },
            }),
          }}
        ></script>
      </head>
      <body className="bg-primary text-white">{children}</body>
    </html>
  );
}
