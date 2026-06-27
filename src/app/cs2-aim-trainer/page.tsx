import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CS2 Aim Trainer Online — Free Browser Practice | AimTrainerPro",
  description:
    "Free CS2 aim trainer that runs in your browser. Practice spray transfers, AWP flicks, and headshot accuracy with 3D exercises tuned for Counter-Strike 2. No download required.",
  keywords: [
    "cs2 aim trainer", "cs2 aim trainer online", "counter strike aim trainer",
    "cs2 aim practice", "free cs2 aim trainer", "cs2 flick trainer",
    "cs2 spray trainer", "cs go aim trainer online", "browser aim trainer cs2",
    "aim trainer cs2", "cs2 aim training",
  ],
  alternates: { canonical: "/cs2-aim-trainer" },
  openGraph: {
    title: "CS2 Aim Trainer Online — Free Browser Practice",
    description: "Practice CS2 aim with free 3D browser exercises. Spray control, AWP flicks, and headshots.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CS2 Aim Trainer Online | AimTrainerPro",
    description: "Free browser-based CS2 aim training. Spray transfers, flicks, and tracking.",
  },
};

export default function CS2AimTrainerPage() {
  const exercises = [
    { name: "Spray Transfer", desc: "Practice transferring spray between multiple targets — essential for CS2 rifle play", icon: "🔥" },
    { name: "AWP Flick", desc: "Train quick flick shots to simulate AWP duels at long range", icon: "🎯" },
    { name: "Headshot Precision", desc: "Lock onto head-level targets for clean one-tap kills with AK/M4", icon: "💀" },
    { name: "Strafe Tracking", desc: "Follow ADAD movement patterns common in CS2 engagements", icon: "🔄" },
    { name: "Peek & Prefire", desc: "Practice pre-aiming common angles and counter-strafing to a stop", icon: "⚡" },
    { name: "Reaction Drill", desc: "Build faster reaction times for holding angles and clutch moments", icon: "⏱️" },
  ];

  const faq = [
    {
      q: "Can I use my CS2 sensitivity here?",
      a: "Yes — use our sensitivity converter to calculate your exact CS2 sens and apply it in the trainer for 1:1 muscle memory.",
    },
    {
      q: "Is this better than CS2 workshop maps?",
      a: "It's complementary. Workshop maps are great for spray patterns, but our browser trainer loads instantly for quick warm-ups without launching Steam.",
    },
    {
      q: "Does this work for CS:GO too?",
      a: "Yes. CS2 and CS:GO share the same sensitivity system, so the exercises transfer directly.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CS2 Aim Trainer Online",
    applicationCategory: "GameApplication",
    operatingSystem: "Any (Browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free browser-based 3D aim trainer for Counter-Strike 2 mechanics.",
  };

  return (
    <div className="min-h-screen bg-[#0b0f17]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="border-b border-zinc-800 bg-gradient-to-b from-orange-950/20 to-transparent px-4 py-12 text-center sm:px-6 sm:py-16">
        <span className="mb-4 inline-block rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-orange-300">
          Free • No Download • Browser-Based
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          CS2 <span className="text-orange-400">Aim Trainer</span> Online
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Warm up your CS2 mechanics instantly — spray transfers, AWP flicks, and headshot precision in a free browser-based 3D trainer. No Steam, no download, just click and practice.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-transform hover:scale-[1.03] hover:bg-orange-400"
          >
            Start Training →
          </Link>
          <Link
            href="/tools/sensitivity-converter"
            className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-5 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-orange-400/50"
          >
            CS2 Sensitivity Converter
          </Link>
        </div>
      </section>

      {/* Exercise Grid */}
      <section className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
        <h2 className="mb-6 text-center text-xl font-bold text-white sm:text-2xl">
          Exercises Tuned for Counter-Strike 2
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.map((ex) => (
            <Link key={ex.name} href="/" className="group block">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 transition-colors group-hover:border-orange-400/40">
                <div className="mb-2 text-2xl">{ex.icon}</div>
                <h3 className="text-base font-semibold text-zinc-100">{ex.name}</h3>
                <p className="mt-1 text-sm text-zinc-400">{ex.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Section */}
      <section className="mx-auto max-w-[800px] px-4 py-8 sm:px-6">
        <h2 className="mb-4 text-xl font-bold text-white">Why Use a Browser Aim Trainer for CS2?</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          Launching CS2 just to warm up means waiting for Steam, loading maps, and dealing with VAC servers. A browser trainer removes all that friction — you can practice aim for 5 minutes during queue, on a break, or from any device. The exercises use 3D geometry that translates directly to in-game flick and tracking motions, building the same muscle memory without the overhead.
        </p>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[800px] px-4 py-8 sm:px-6">
        <h2 className="mb-5 text-xl font-bold text-white">FAQ</h2>
        <div className="space-y-4">
          {faq.map((item) => (
            <div key={item.q} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
              <h3 className="text-sm font-semibold text-cyan-400">{item.q}</h3>
              <p className="mt-1.5 text-sm text-zinc-400">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800 px-4 py-10 text-center sm:px-6">
        <h2 className="text-lg font-bold text-white">Ready to warm up for CS2?</h2>
        <p className="mt-2 text-sm text-zinc-400">Jump into exercises instantly — free, no account.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-transform hover:scale-[1.03] hover:bg-orange-400"
        >
          Launch Aim Trainer
        </Link>
      </section>
    </div>
  );
}
