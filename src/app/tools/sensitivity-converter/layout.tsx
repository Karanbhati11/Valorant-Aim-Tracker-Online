import type { Metadata } from "next";
import {
  generateBreadcrumbSchema,
  generateBreadcrumbsFromPath,
  getCanonicalUrl,
} from "@/lib/seo/structured-data";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Mouse Sensitivity Converter — Valorant, CS2, Apex & 16+ Games | AimTrainerPro",
  description:
    "Convert your mouse sensitivity between Valorant, CS2, Apex Legends, Fortnite, Overwatch 2, and 16+ FPS games. Free, accurate sensitivity calculator with cm/360 calculation and eDPI display.",
  keywords: [
    "sensitivity converter", "valorant sens converter", "mouse sensitivity converter",
    "cs2 to valorant sens", "valorant to cs2 sensitivity", "sens converter",
    "fps sensitivity calculator", "mouse sensitivity calculator",
    "cm per 360 calculator", "convert sensitivity between games",
  ],
  alternates: {
    canonical: getCanonicalUrl("/tools/sensitivity-converter"),
  },
  openGraph: {
    title: "Mouse Sensitivity Converter | AimTrainerPro",
    description: "Convert sensitivity between Valorant, CS2, Apex, Fortnite, and 16+ games instantly.",
  },
};

export default function SensitivityConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbs = generateBreadcrumbsFromPath(
    "/tools/sensitivity-converter",
    "Sensitivity Converter"
  );
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  return (
    <>
      <StructuredData blocks={[breadcrumbSchema]} />
      {children}
    </>
  );
}
