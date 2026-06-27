import type { Metadata } from "next";
import {
  generateBreadcrumbSchema,
  generateBreadcrumbsFromPath,
  getCanonicalUrl,
} from "@/lib/seo/structured-data";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "DPI Analyzer — Measure Your Mouse DPI Online | AimTrainerPro",
  description:
    "Measure your actual mouse DPI with this free browser tool. Drag your mouse to get an accurate DPI reading — essential for calculating your eDPI and dialing in perfect FPS sensitivity.",
  keywords: [
    "dpi analyzer", "dpi tester", "mouse dpi test", "measure mouse dpi",
    "actual dpi test", "dpi checker online", "mouse dpi analyzer",
    "check my dpi", "mouse speed test",
  ],
  alternates: {
    canonical: getCanonicalUrl("/tools/dpi-analyzer"),
  },
  openGraph: {
    title: "DPI Analyzer — Measure Mouse DPI | AimTrainerPro",
    description: "Free browser DPI tester. Measure your actual mouse DPI for accurate sensitivity setup.",
  },
};

export default function DpiAnalyzerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbs = generateBreadcrumbsFromPath(
    "/tools/dpi-analyzer",
    "DPI Analyzer"
  );
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  return (
    <>
      <StructuredData blocks={[breadcrumbSchema]} />
      {children}
    </>
  );
}
