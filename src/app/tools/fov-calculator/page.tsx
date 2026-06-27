"use client";

import { useState } from "react";
import Link from "next/link";

const ASPECT_RATIOS = [
  { label: "16:9 (1920×1080)", w: 16, h: 9 },
  { label: "16:10 (1920×1200)", w: 16, h: 10 },
  { label: "21:9 (2560×1080)", w: 21, h: 9 },
  { label: "32:9 (5120×1440)", w: 32, h: 9 },
  { label: "4:3 (1280×960)", w: 4, h: 3 },
];

const GAME_FOVS = [
  { game: "Valorant", fov: 103, note: "Fixed, 16:9 only" },
  { game: "CS2", fov: 106.26, note: "Fixed (4:3 = 90°)" },
  { game: "Apex Legends", fov: 110, note: "Default (70–110 range)" },
  { game: "Overwatch 2", fov: 103, note: "Default (80–103 range)" },
  { game: "Fortnite", fov: 80, note: "Fixed" },
  { game: "Call of Duty", fov: 120, note: "Default (60–120 range)" },
];

function hfovToVfov(hfov: number, aspectW: number, aspectH: number): number {
  const hRad = (hfov * Math.PI) / 180;
  const vRad = 2 * Math.atan(Math.tan(hRad / 2) * (aspectH / aspectW));
  return Math.round((vRad * 180) / Math.PI * 100) / 100;
}

function vfovToHfov(vfov: number, aspectW: number, aspectH: number): number {
  const vRad = (vfov * Math.PI) / 180;
  const hRad = 2 * Math.atan(Math.tan(vRad / 2) * (aspectW / aspectH));
  return Math.round((hRad * 180) / Math.PI * 100) / 100;
}

export default function FovCalculatorPage() {
  const [fovInput, setFovInput] = useState("103");
  const [fovType, setFovType] = useState<"horizontal" | "vertical">("horizontal");
  const [fromAspect, setFromAspect] = useState(0);
  const [toAspect, setToAspect] = useState(4); // 4:3

  const fovNum = parseFloat(fovInput) || 0;
  const from = ASPECT_RATIOS[fromAspect];
  const to = ASPECT_RATIOS[toAspect];

  let result = 0;
  if (fovNum > 0 && from && to) {
    if (fovType === "horizontal") {
      const vfov = hfovToVfov(fovNum, from.w, from.h);
      result = vfovToHfov(vfov, to.w, to.h);
    } else {
      result = vfovToHfov(fovNum, to.w, to.h);
    }
  }

  const vfov = fovNum > 0 && from ? hfovToVfov(fovNum, from.w, from.h) : 0;

  return (
    <div className="min-h-screen bg-[#0b0f17]">
      {/* Hero */}
      <section className="border-b border-zinc-800 bg-gradient-to-b from-violet-950/20 to-transparent px-4 py-10 text-center sm:px-6 sm:py-14">
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
          FOV <span className="text-violet-400">Calculator</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400 sm:text-base">
          Calculate how your Field of View changes across different monitor aspect ratios. Convert between horizontal and vertical FOV for Valorant, CS2, Apex, and more.
        </p>
      </section>

      {/* Calculator */}
      <section className="mx-auto max-w-[640px] px-4 py-8 sm:px-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 sm:p-6">
          <div className="grid gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-zinc-400">
                FOV Value
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="number"
                  value={fovInput}
                  onChange={(e) => setFovInput(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-lg font-semibold text-white focus:border-violet-400/50 focus:outline-none sm:flex-1"
                  placeholder="103"
                />
                <select
                  value={fovType}
                  onChange={(e) => setFovType(e.target.value as "horizontal" | "vertical")}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-zinc-200 focus:border-violet-400/50 focus:outline-none sm:w-auto"
                >
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  From Aspect Ratio
                </label>
                <select
                  value={fromAspect}
                  onChange={(e) => setFromAspect(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-zinc-200 focus:border-violet-400/50 focus:outline-none"
                >
                  {ASPECT_RATIOS.map((ar, i) => (
                    <option key={i} value={i}>{ar.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  To Aspect Ratio
                </label>
                <select
                  value={toAspect}
                  onChange={(e) => setToAspect(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-zinc-200 focus:border-violet-400/50 focus:outline-none"
                >
                  {ASPECT_RATIOS.map((ar, i) => (
                    <option key={i} value={i}>{ar.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="mt-6 rounded-lg border border-violet-400/20 bg-violet-400/5 p-5 text-center">
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Equivalent Horizontal FOV on {to?.label.split(" ")[0]}
            </div>
            <div className="mt-1 text-4xl font-extrabold text-violet-400">
              {result > 0 ? `${result}°` : "—"}
            </div>
            {vfov > 0 && (
              <div className="mt-1 text-xs text-zinc-400">
                Vertical FOV: {vfov}°
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link href="/tools/edpi-calculator" className="text-xs font-semibold text-violet-400 hover:underline">
              eDPI Calculator →
            </Link>
            <Link href="/tools/sensitivity-converter" className="text-xs font-semibold text-violet-400 hover:underline">
              Sensitivity Converter →
            </Link>
          </div>
        </div>
      </section>

      {/* Game FOV Reference */}
      <section className="mx-auto max-w-[640px] px-4 py-6 sm:px-6">
        <h2 className="mb-4 text-lg font-bold text-white">Default FOV by Game</h2>
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/80">
          <table className="w-full min-w-[360px] text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs uppercase tracking-widest text-zinc-400">
                <th className="px-3 py-3 text-left sm:px-4">Game</th>
                <th className="px-3 py-3 text-right sm:px-4">HFOV</th>
                <th className="px-3 py-3 text-right sm:px-4">Note</th>
              </tr>
            </thead>
            <tbody>
              {GAME_FOVS.map((g) => (
                <tr key={g.game} className="border-b border-zinc-800/50">
                  <td className="px-3 py-2.5 font-semibold text-zinc-200 sm:px-4">{g.game}</td>
                  <td className="px-3 py-2.5 text-right text-violet-400 sm:px-4">{g.fov}°</td>
                  <td className="px-3 py-2.5 text-right text-zinc-400 text-xs sm:px-4">{g.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[640px] px-4 py-8 sm:px-6">
        <h2 className="mb-4 text-lg font-bold text-white">What is FOV?</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          FOV (Field of View) determines how much of the game world you can see on screen. A wider FOV shows more peripheral vision but makes targets appear smaller. A narrower FOV provides better target visibility but limits your awareness. Valorant uses a fixed 103° horizontal FOV at 16:9 — switching to a 4:3 resolution effectively narrows your view to ~90°, making targets appear larger.
        </p>
        <h3 className="mt-5 text-sm font-bold text-white">Why does aspect ratio matter?</h3>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">
          When you switch monitors or change resolution, your actual visible field changes even if the game&apos;s FOV setting stays the same. A 21:9 ultrawide at the same vertical FOV shows significantly more horizontal space than 16:9. This calculator helps you understand exactly what you&apos;ll see on different setups.
        </p>
      </section>
    </div>
  );
}
