import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aimtrainerpro.online"),
  title: "AimTrainerPro - Free 3D Browser Aim Practice",
  description:
    "Free online aim trainer. Practice gridshot, flicking, and tracking with 3D exercises. No download needed.",
  keywords: [
    "aim trainer online",
    "aim trainer 3d",
    "browser aim trainer",
    "free aim trainer",
    "aim lab online",
    "aim practice online",
    "fps trainer",
    "fps aim trainer",
    "tactical shooter aim trainer",
    "gridshot trainer",
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
    title: "AimTrainerPro - Free 3D Browser Aim Practice",
    description:
      "Practice your aim in browser with this free 3D aim trainer. No download required. Features Gridshot, Strafing, and Micro-adjustments.",
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
    title: "AimTrainerPro - Free 3D",
    description:
      "Improve your aim instantly. Free 3D browser aim trainer.",
    images: ["/assets/preview-image.jpg"],
  },
  icons: {
    icon: "/assets/favicon.png",
    shortcut: "/assets/favicon.png",
    apple: "/assets/favicon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://aimtrainerpro.online/",
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

        {/* AdSense */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2970054316732906"
     crossOrigin="anonymous"></script>

        {/* Three.js */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "AimTrainerPro",
              url: "https://aimtrainerpro.online/",
              description:
                "A free 3D browser-based aim trainer to improve flicking, tracking, and micro-adjustments.",
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
