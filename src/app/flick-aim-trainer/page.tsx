import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Flick Aim Trainer — Free Browser Flick Practice | AimTrainerPro",
  description:
    "Train your flick aim for free in the browser. Practice gridshot, micro flicks, wide flicks, and headshot flicks with responsive 3D targets. Works for Valorant, CS2, Apex, and any FPS.",
  keywords: [
    "flick aim trainer", "flick trainer", "aim trainer flick",
    "gridshot trainer", "flick practice", "flick aim practice",
    "micro flick trainer", "wide flick practice", "headshot flick trainer",
    "browser aim trainer", "free aim trainer",
  ],
  alternates: { canonical: "/flick-aim-trainer" },
  openGraph: {
    title: "Flick Aim Trainer — Free Browser Practice",
    description: "Train flick aim with 3D targets. Gridshot, micro flicks, wide flicks — all in your browser.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flick Aim Trainer | AimTrainerPro",
    description: "Free browser-based flick aim training. Gridshot, micro and wide flicks.",
  },
};

export default function FlickAimTrainerPage() {
  const modes = [
    { name: "Micro Flick", desc: "Tiny angle corrections — the bread and butter of headshot duels", icon: "🔬", difficulty: "Beginner" },
    { name: "Medium Flick", desc: "30–60° target acquisition at moderate distance", icon: "🎯", difficulty: "Intermediate" },
    { name: "Wide Flick", desc: "Large 90°+ snaps to peripheral targets", icon: "💥", difficulty: "Advanced" },
    { name: "Headshot Flick", desc: "Only head-level targets. Miss = zero points. Pure precision.", icon: "💀", difficulty: "Hard" },
    { name: "Gridshot", desc: "The classic: hit as many targets as possible in 30 seconds", icon: "⚡", difficulty: "All levels" },
    { name: "Sequential Elimination", desc: "Targets appear one at a time. Speed + accuracy combined.", icon: "🏃", difficulty: "Intermediate" },
  ];

  const tips = [
    "Start slow and focus on accuracy — speed comes naturally with muscle memory.",
    "Keep your crosshair at head height and let targets come to your crosshair.",
    "Use your arm for large flicks and your wrist for micro-adjustments.",
    "Warm up with micro flicks first before attempting wide flick drills.",
    "Practice for 5–10 minutes before gaming — short sessions beat marathon grind.",
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Flick Aim Trainer",
    applicationCategory: "GameApplication",
    operatingSystem: "Any (Browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free browser-based flick aim trainer with gridshot, micro, medium, and wide flick exercises.",
  };

  return (
    <div className="min-h-screen bg-[#0b0f17]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="border-b border-zinc-800 bg-gradient-to-b from-rose-950/20 to-transparent px-4 py-12 text-center sm:px-6 sm:py-16">
        <span className="mb-4 inline-block rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-rose-300">
          Free • No Download • Any FPS
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Flick <span className="text-rose-400">Aim Trainer</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Master flick shots with precision 3D exercises. From micro flicks to wide snaps and gridshot — train the skill that wins duels in every FPS game.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition-transform hover:scale-[1.03] hover:bg-rose-400"
          >
            Start Flick Training →
          </Link>
          <Link
            href="/valorant-aim-trainer"
            className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-5 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-rose-400/50"
          >
            Valorant Trainer
          </Link>
          <Link
            href="/cs2-aim-trainer"
            className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-5 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-rose-400/50"
          >
            CS2 Trainer
          </Link>
        </div>
      </section>

      {/* Modes */}
      <section className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
        <h2 className="mb-6 text-center text-xl font-bold text-white sm:text-2xl">
          Flick Training Modes
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modes.map((m) => (
            <Link key={m.name} href="/" className="group block">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 transition-colors group-hover:border-rose-400/40">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-2xl">{m.icon}</span>
                  <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">{m.difficulty}</span>
                </div>
                <h3 className="text-base font-semibold text-zinc-100">{m.name}</h3>
                <p className="mt-1 text-sm text-zinc-400">{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="mx-auto max-w-[800px] px-4 py-8 sm:px-6">
        <h2 className="mb-4 text-xl font-bold text-white">How to Improve Flick Aim</h2>
        <ul className="space-y-3">
          {tips.map((tip, i) => (
            <li key={i} className="flex gap-3 text-sm text-zinc-400">
              <span className="mt-0.5 shrink-0 text-rose-400">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* What is Flick Aim */}
      <section className="mx-auto max-w-[800px] px-4 py-8 sm:px-6">
        <h2 className="mb-4 text-xl font-bold text-white">What is Flick Aim?</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          Flick aim is the ability to rapidly snap your crosshair from one position to a target and land a precise shot. Unlike tracking (where you follow a moving target smoothly), flicking is a burst movement that requires explosive speed and pinpoint stopping accuracy. It&apos;s the dominant mechanic in tactical shooters like Valorant and CS2 where engagements are decided by whoever lands the first headshot. Training flick aim builds the neural pathways for fast, accurate target acquisition — the single most impactful mechanical skill in competitive FPS.
        </p>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800 px-4 py-10 text-center sm:px-6">
        <h2 className="text-lg font-bold text-white">Start improving your flick aim today</h2>
        <p className="mt-2 text-sm text-zinc-400">Free. Instant. No account needed.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition-transform hover:scale-[1.03] hover:bg-rose-400"
        >
          Launch Flick Trainer
        </Link>
      </section>
    </div>
  );
}
