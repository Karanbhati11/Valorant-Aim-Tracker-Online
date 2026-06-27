import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/StructuredData";
import {
  generateBreadcrumbSchema,
  generateBreadcrumbsFromPath,
  generateFAQSchema,
} from "@/lib/seo/structured-data";
import { generateHreflangMetadata } from "@/lib/seo/hreflang-metadata";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About AimTrainerPro — Free 3D Browser Aim Trainer for Every FPS",
  description:
    "AimTrainerPro is a free browser-based 3D aim trainer for Valorant, CS2, Apex Legends, and every FPS. Practice flicking, tracking, precision, speed, and reaction time — no download, no signup.",
  keywords: [
    "about aimtrainerpro", "free aim trainer", "browser aim trainer",
    "3d aim trainer free", "aim trainer no download", "online aim practice",
    "fps aim trainer", "valorant aim practice", "cs2 aim practice",
  ],
  alternates: {
    ...generateHreflangMetadata("/about"),
  },
  openGraph: {
    title: "About AimTrainerPro — Free Browser Aim Trainer",
    description: "Free 3D aim trainer for Valorant, CS2, Apex. No download needed.",
  },
};

const faqItems = [
  {
    question: "Is AimTrainerPro free to use?",
    answer:
      "Yes, AimTrainerPro is completely free. All exercises, settings, and features are available without any payment or subscription.",
  },
  {
    question: "Do I need to download anything to use AimTrainerPro?",
    answer:
      "No downloads required. AimTrainerPro runs entirely in your web browser using WebGL technology. Just open the site and start training.",
  },
  {
    question: "What games does AimTrainerPro help with?",
    answer:
      "AimTrainerPro helps improve aim for all FPS games including Valorant, CS2, Apex Legends, Fortnite, Overwatch 2, and more. The drills focus on universal mechanics like flicking, tracking, and precision.",
  },
  {
    question: "Can I use AimTrainerPro on a low-end PC?",
    answer:
      "Yes. AimTrainerPro is designed to run smoothly on low-end hardware. It uses adaptive quality and a 60fps target so it stays smooth on most modern computers and laptops.",
  },
];

export default function AboutPage() {
  const breadcrumbs = generateBreadcrumbsFromPath("/about", "About");
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  const faqSchema = generateFAQSchema(faqItems);

  return (
    <>
      <StructuredData blocks={[breadcrumbSchema, faqSchema]} />
      <AboutContent />
    </>
  );
}
