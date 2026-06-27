import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "eDPI Calculator Valorant — Find Your Effective DPI | AimTrainerPro",
  description:
    "Calculate your Valorant eDPI instantly. Multiply DPI × sensitivity to find your effective DPI, compare to pro players like TenZ (320 eDPI), and understand if your sens is optimal.",
  keywords: [
    "edpi calculator", "edpi calculator valorant", "valorant edpi",
    "effective dpi calculator", "edpi valorant", "dpi calculator valorant",
    "valorant sensitivity calculator", "what is my edpi",
    "valorant edpi calculator", "pro edpi valorant",
  ],
  alternates: { canonical: "/tools/edpi-calculator" },
  openGraph: {
    title: "eDPI Calculator Valorant | AimTrainerPro",
    description: "Calculate your effective DPI and compare to Valorant pro players.",
  },
  twitter: {
    card: "summary",
    title: "eDPI Calculator — Valorant",
    description: "Find your eDPI and compare to pros. DPI × Sens = eDPI.",
  },
};

export default function EdpiLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "eDPI Calculator",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any (Browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Calculate your Valorant eDPI (DPI × Sensitivity) and compare to pro players.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
