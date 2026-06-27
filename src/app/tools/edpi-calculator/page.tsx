"use client";

import { useState } from "react";
import Link from "next/link";

const PRO_EDPIS = [
  { name: "TenZ", dpi: 800, sens: 0.4, edpi: 320 },
  { name: "aspas", dpi: 800, sens: 0.3, edpi: 240 },
  { name: "Demon1", dpi: 1600, sens: 0.17, edpi: 272 },
  { name: "yay", dpi: 800, sens: 0.27, edpi: 216 },
  { name: "s0m", dpi: 800, sens: 0.36, edpi: 288 },
  { name: "Derke", dpi: 400, sens: 0.55, edpi: 220 },
  { name: "cNed", dpi: 800, sens: 0.35, edpi: 280 },
  { name: "Chronicle", dpi: 800, sens: 0.32, edpi: 256 },
];

export default function EdpiCalculatorPage() {
  const [dpi, setDpi] = useState("800");
  const [sens, setSens] = useState("0.3");

  const dpiNum = parseFloat(dpi) || 0;
  const sensNum = parseFloat(sens) || 0;
  const edpi = Math.round(dpiNum * sensNum * 100) / 100;
  const cmPer360 = dpiNum > 0 && sensNum > 0 ? Math.round((2.54 * 360) / (dpiNum * sensNum * 0.07) * 100) / 100 : 0;

  const getRating = () => {
    if (edpi === 0) return { label: "—", color: "text-zinc-400" };
    if (edpi < 200) return { label: "Very Low (Arm player)", color: "text-blue-400" };
    if (edpi < 280) return { label: "Low (Most pros)", color: "text-green-400" };
    if (edpi < 400) return { label: "Medium", color: "text-yellow-400" };
    if (edpi < 600) return { label: "High", color: "text-orange-400" };
    return { label: "Very High (Wrist player)", color: "text-red-400" };
  };

  const rating = getRating();

  return (
    <div className="min-h-screen bg-[#0b0f17]">
      {/* Hero */}
      <section className="border-b border-zinc-800 bg-gradient-to-b from-emerald-950/20 to-transparent px-4 py-10 text-center sm:px-6 sm:py-14">
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
          eDPI <span className="text-emerald-400">Calculator</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400 sm:text-base">
          Calculate your effective DPI (eDPI) for Valorant. Multiply your mouse DPI by your in-game sensitivity to find your true aiming speed and compare it to pro players.
        </p>
      </section>

      {/* Calculator */}
      <section className="mx-auto max-w-[600px] px-4 py-8 sm:px-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Mouse DPI
              </label>
              <input
                type="number"
                value={dpi}
                onChange={(e) => setDpi(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-lg font-semibold text-white focus:border-emerald-400/50 focus:outline-none"
                placeholder="800"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-zinc-400">
                In-Game Sensitivity
              </label>
              <input
                type="number"
                step="0.01"
                value={sens}
                onChange={(e) => setSens(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-lg font-semibold text-white focus:border-emerald-400/50 focus:outline-none"
                placeholder="0.3"
              />
            </div>
          </div>

          {/* Result */}
          <div className="mt-6 rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-5 text-center">
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Your eDPI</div>
            <div className="mt-1 text-4xl font-extrabold text-emerald-400">{edpi || "—"}</div>
            <div className={`mt-1 text-sm font-semibold ${rating.color}`}>{rating.label}</div>
            {cmPer360 > 0 && (
              <div className="mt-2 text-xs text-zinc-400">
                ~{cmPer360} cm/360° (Valorant)
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link href="/tools/sensitivity-converter" className="text-xs font-semibold text-emerald-400 hover:underline">
              Sensitivity Converter →
            </Link>
            <Link href="/tools/fov-calculator" className="text-xs font-semibold text-emerald-400 hover:underline">
              FOV Calculator →
            </Link>
          </div>
        </div>
      </section>

      {/* Pro Comparison Table */}
      <section className="mx-auto max-w-[600px] px-4 py-6 sm:px-6">
        <h2 className="mb-4 text-lg font-bold text-white">Compare to Pro Players</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs uppercase tracking-widest text-zinc-400">
                <th className="px-4 py-3 text-left">Player</th>
                <th className="px-4 py-3 text-right">DPI</th>
                <th className="px-4 py-3 text-right">Sens</th>
                <th className="px-4 py-3 text-right">eDPI</th>
              </tr>
            </thead>
            <tbody>
              {PRO_EDPIS.map((pro) => (
                <tr key={pro.name} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 font-semibold text-zinc-200">
                    <Link href={`/crosshair-database/pro/${pro.name.toLowerCase()}`} className="text-zinc-100 hover:text-emerald-400">
                      {pro.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-right text-zinc-400">{pro.dpi}</td>
                  <td className="px-4 py-2.5 text-right text-zinc-400">{pro.sens}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-emerald-400">{pro.edpi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-zinc-400">
          Most Valorant pros play between 200–320 eDPI. Find what feels comfortable for you — there is no &quot;perfect&quot; eDPI.
        </p>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[600px] px-4 py-8 sm:px-6">
        <h2 className="mb-4 text-lg font-bold text-white">What is eDPI?</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          eDPI (effective Dots Per Inch) is the true measure of your aiming speed. It&apos;s calculated by multiplying your mouse DPI by your in-game sensitivity. Two players with different DPI/sens combos but the same eDPI will have identical cursor movement speed. This makes eDPI the universal metric for comparing sensitivity between players.
        </p>
        <h3 className="mt-5 text-sm font-bold text-white">Formula</h3>
        <div className="mt-2 rounded-md border border-zinc-700 bg-zinc-950 px-4 py-3 font-mono text-sm text-emerald-300">
          eDPI = Mouse DPI × In-Game Sensitivity
        </div>
      </section>
    </div>
  );
}
