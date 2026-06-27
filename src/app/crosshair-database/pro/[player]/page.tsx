import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProPlayer, getAllProSlugs, type ProPlayer } from "@/lib/crosshair/pro-players";
import dynamic from "next/dynamic";

const ProCrosshairPreview = dynamic(() => import("@/components/ProCrosshairPreview"), { ssr: false });

export async function generateStaticParams() {
  return getAllProSlugs().map((player) => ({ player }));
}

export async function generateMetadata({ params }: { params: Promise<{ player: string }> }): Promise<Metadata> {
  const { player: slug } = await params;
  const pro = getProPlayer(slug);
  if (!pro) return { title: "Player Not Found | AimTrainerPro" };

  return {
    title: `${pro.name} Crosshair Code & Settings (${new Date().getFullYear()}) | AimTrainerPro`,
    description: `Copy ${pro.name}'s Valorant crosshair code: ${pro.crosshairCode}. ${pro.name} plays for ${pro.team} at ${pro.dpi} DPI / ${pro.sensitivity} sens (eDPI ${pro.edpi}). Full settings breakdown.`,
    keywords: [...pro.keywords, "valorant crosshair codes", "pro crosshair valorant", "valorant pro settings"],
    alternates: { canonical: `/crosshair-database/pro/${slug}` },
    openGraph: {
      title: `${pro.name} Crosshair Code & Settings`,
      description: `${pro.name} (${pro.team}) — ${pro.crosshairCode}. eDPI: ${pro.edpi}, Mouse: ${pro.mouse}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${pro.name} Crosshair Code | AimTrainerPro`,
      description: `Get ${pro.name}'s exact crosshair code, DPI, sensitivity, and gear.`,
    },
  };
}

function SettingRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 py-3 text-sm">
      <span className="text-zinc-400">{label}</span>
      <span className="font-semibold text-zinc-100">{value}</span>
    </div>
  );
}

export default async function ProPlayerPage({ params }: { params: Promise<{ player: string }> }) {
  const { player: slug } = await params;
  const pro = getProPlayer(slug);
  if (!pro) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: pro.name,
    description: pro.description,
    memberOf: { "@type": "SportsTeam", name: pro.team },
    knowsAbout: ["Valorant", "FPS", "Esports"],
  };

  return (
    <div className="min-h-screen bg-[#0b0f17]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 text-xs text-zinc-300">
          <Link href="/crosshair-database" className="text-zinc-300 hover:text-cyan-400">Crosshair Database</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <Link href="/crosshair-database?category=Pro" className="text-zinc-300 hover:text-cyan-400">Pro Players</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <span className="text-zinc-100">{pro.name}</span>
        </nav>

        {/* Hero */}
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {pro.name}
            </h1>
            <span className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-300">
              {pro.team}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-400">
            {pro.role} • {pro.region}
          </p>
          <p className="mt-3 text-base leading-relaxed text-zinc-300">
            {pro.description}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Crosshair Code Card */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-zinc-400">
              Crosshair Code
            </h2>
            <div className="mb-4 break-all rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 font-mono text-sm text-cyan-300">
              {pro.crosshairCode}
            </div>
            <ProCrosshairPreview code={pro.crosshairCode} />
            <p className="mt-3 text-xs text-zinc-400">
              Copy the code above and paste it in Valorant → Settings → Crosshair → Import Profile Code.
            </p>
          </section>

          {/* Settings Card */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-zinc-400">
              Mouse & Settings
            </h2>
            <SettingRow label="DPI" value={pro.dpi} />
            <SettingRow label="In-Game Sensitivity" value={pro.sensitivity} />
            <SettingRow label="eDPI" value={pro.edpi} />
            <SettingRow label="Scoped Sensitivity" value={pro.scopedSensitivity} />
            <SettingRow label="Resolution" value={pro.resolution} />

            <h2 className="mb-3 mt-6 text-sm font-bold uppercase tracking-widest text-zinc-400">
              Gear
            </h2>
            <SettingRow label="Mouse" value={pro.mouse} />
            <SettingRow label="Mousepad" value={pro.mousepad} />
            <SettingRow label="Monitor" value={pro.monitor} />
          </section>
        </div>

        {/* Other Pros */}
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-white">More Pro Crosshairs</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {getAllProSlugs()
              .filter((s) => s !== slug)
              .slice(0, 8)
              .map((s) => {
                const p = getProPlayer(s)!;
                return (
                  <Link
                    key={s}
                    href={`/crosshair-database/pro/${s}`}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-center transition-colors hover:border-cyan-400/40"
                  >
                    <div className="text-sm font-semibold text-zinc-100">{p.name}</div>
                    <div className="text-[10px] text-zinc-400">{p.team}</div>
                  </Link>
                );
              })}
          </div>
        </section>
      </div>
    </div>
  );
}
