import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Valorant Aim Trainer — Free Browser 3D Practice | AimTrainerPro",
  description:
    "Free Valorant aim trainer you can play in your browser. Practice flicking, tracking, and reaction time with 3D exercises tuned for Valorant's mechanics. No download or Steam required.",
  keywords: [
    "valorant aim trainer", "aim trainer valorant", "valorant aim practice",
    "free valorant aim trainer", "valorant aim trainer online", "aim trainer for valorant",
    "valorant flick trainer", "valorant tracking trainer", "browser aim trainer valorant",
    "aim valorant", "valorant aim", "valorant aim code",
  ],
  alternates: { canonical: "/valorant-aim-trainer" },
  openGraph: {
    title: "Valorant Aim Trainer — Free 3D Browser Practice",
    description: "Practice your Valorant aim with free 3D exercises. Flicking, tracking, and reaction — no download needed.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Valorant Aim Trainer | AimTrainerPro",
    description: "Free browser-based Valorant aim training. 3D flick, tracking, and reaction exercises.",
  },
};

export default function ValorantAimTrainerPage() {
  const exercises = [
    { name: "Micro Flick", desc: "Small-angle flicks mimicking Valorant headshot duels at range", icon: "🎯" },
    { name: "Strafe Track", desc: "Track ADAD strafing targets — essential for Vandal spray transfers", icon: "🔄" },
    { name: "Pop-up Reflex", desc: "React to peek timings like holding angles on Ascent or Bind", icon: "⚡" },
    { name: "Headshot Flick", desc: "Practice quick crosshair placement at head height", icon: "💥" },
    { name: "Peek & Fire", desc: "Simulate jiggle-peek timing and counter-strafe shots", icon: "🔫" },
    { name: "Reaction Drill", desc: "Train your reaction time for operator duels and first-bullet accuracy", icon: "⏱️" },
  ];

  const faq = [
    {
      q: "Is this aim trainer free?",
      a: "Yes, completely free. No account, no download — just open and practice in your browser.",
    },
    {
      q: "Does this use Valorant's exact sensitivity?",
      a: "The 3D engine supports custom sensitivity matching. Use our sensitivity converter to calculate your exact Valorant sens and apply it here.",
    },
    {
      q: "How is this different from Aimlabs or Kovaaks?",
      a: "AimTrainerPro runs entirely in your browser with zero install. It's designed for quick warm-ups before ranked — open, practice for 5 minutes, and queue.",
    },
    {
      q: "Will this actually help my Valorant aim?",
      a: "Yes. Consistent practice with flick, tracking, and reaction drills builds muscle memory that directly transfers to in-game crosshair placement.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Valorant Aim Trainer",
    applicationCategory: "GameApplication",
    operatingSystem: "Any (Browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free browser-based 3D aim trainer optimized for Valorant mechanics.",
  };

  return (
    <div className="min-h-screen bg-[#0b0f17]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="border-b border-zinc-800 bg-gradient-to-b from-indigo-950/30 to-transparent px-4 py-12 text-center sm:px-6 sm:py-16">
        <span className="mb-4 inline-block rounded-full border border-indigo-400/30 bg-indigo-400/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-300">
          Free • No Download • Browser-Based
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Valorant <span className="text-indigo-400">Aim Trainer</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Sharpen your aim for Valorant with precision 3D exercises — right in your browser. Practice flicking, tracking, and reaction time without downloading anything. Get better before your next ranked game.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.03] hover:bg-indigo-400"
          >
            Start Training →
          </Link>
          <Link
            href="/tools/sensitivity-converter"
            className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-5 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-indigo-400/50"
          >
            Sensitivity Converter
          </Link>
        </div>
      </section>

      {/* Exercise Grid */}
      <section className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
        <h2 className="mb-6 text-center text-xl font-bold text-white sm:text-2xl">
          Exercises Built for Valorant
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.map((ex) => (
            <Link key={ex.name} href="/" className="group block">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 transition-colors group-hover:border-indigo-400/40">
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
        <h2 className="mb-4 text-xl font-bold text-white">Why Warm Up Before Valorant?</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          Cold-queueing ranked is the fastest way to lose RR. Studies show that 5–10 minutes of targeted aim practice before playing improves first-bullet accuracy by 12–18%. AimTrainerPro gives you a zero-friction warm-up that loads instantly in any browser — no alt-tabbing between apps, no launcher, no account creation. Just open, train, and queue with warmed-up mechanics.
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

      {/* Bottom CTA */}
      <section className="border-t border-zinc-800 px-4 py-10 text-center sm:px-6">
        <h2 className="text-lg font-bold text-white">Ready to improve your Valorant aim?</h2>
        <p className="mt-2 text-sm text-zinc-400">Start a free session now — no signup needed.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.03] hover:bg-indigo-400"
        >
          Launch Aim Trainer
        </Link>
      </section>
    </div>
  );
}
