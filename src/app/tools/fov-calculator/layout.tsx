import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Valorant FOV Calculator — Field of View Converter | AimTrainerPro",
  description:
    "Calculate how FOV changes between different aspect ratios and resolutions. Convert horizontal and vertical FOV for Valorant, CS2, Apex Legends, and more. See exactly what you'll see on 4:3, 16:9, or ultrawide.",
  keywords: [
    "valorant fov calculator", "fov calculator", "field of view calculator",
    "fov converter", "aspect ratio fov calculator", "valorant fov",
    "cs2 fov calculator", "4:3 fov valorant", "ultrawide fov calculator",
    "horizontal fov to vertical fov",
  ],
  alternates: { canonical: "/tools/fov-calculator" },
  openGraph: {
    title: "FOV Calculator — Field of View Converter | AimTrainerPro",
    description: "Calculate FOV across aspect ratios. See how Valorant, CS2, and Apex FOV translates between monitors.",
  },
  twitter: {
    card: "summary",
    title: "FOV Calculator | AimTrainerPro",
    description: "Convert FOV between aspect ratios for Valorant, CS2, and more.",
  },
};

export default function FovLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FOV Calculator",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any (Browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Calculate how Field of View (FOV) changes between different monitor aspect ratios for FPS games.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
