import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { saveCrosshair } from "@/lib/crosshair/actions";

const CrosshairBuilder = dynamic(() => import("@/components/CrosshairBuilder"), {
  loading: () => (
    <section className="mx-auto grid w-full max-w-[2320px] grid-cols-1 gap-3 p-4 sm:p-5 xl:grid-cols-[0.72fr_1.28fr]">
      <div className="min-h-[600px] animate-pulse rounded-lg bg-zinc-900/80" />
      <div className="min-h-[600px] animate-pulse rounded-lg bg-zinc-900/80" />
    </section>
  ),
});

export const metadata: Metadata = {
  title: "Valorant Crosshair Generator — Create & Export Codes | AimTrainerPro",
  description:
    "Create and preview Valorant crosshair codes with live backgrounds. Build dot, plus, and pro-style crosshairs with accurate preview, randomize, and one-click copy. No download required.",
  keywords: [
    "valorant crosshair generator", "crosshair generator", "crosshair valorant",
    "valorant crosshair codes", "crosshair code valorant", "make crosshair valorant",
    "custom crosshair valorant", "crosshair creator valorant",
  ],
  openGraph: {
    title: "Valorant Crosshair Generator | AimTrainerPro",
    description: "Generate Valorant crosshair codes with live preview. Customize every detail and export instantly.",
  },
};

export default function CrosshairsPage() {
  return (
    <div className="min-h-screen bg-[#0b0f17]">
      {/* Hero Header */}
      <div className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-transparent px-4 py-8 text-center sm:px-6 sm:py-12">
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Crosshair <span className="text-cyan-400">Generator</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-400 sm:text-base">
          Build, preview, and export Valorant crosshair codes. Customize every detail with live preview on multiple backgrounds.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link
            href="/crosshair-database"
            className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-cyan-400/50 hover:bg-zinc-700 sm:text-sm"
          >
            Browse Database →
          </Link>
        </div>
      </div>

      {/* Builder */}
      <CrosshairBuilder onSaveCrosshair={saveCrosshair} />
    </div>
  );
}
