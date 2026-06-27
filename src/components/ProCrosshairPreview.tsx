"use client";

import { useEffect, useRef } from "react";
import { drawCrosshair } from "@/lib/crosshair/builder/canvas";
import { BG_TILES } from "@/lib/crosshair/builder/config";
import { parseCode } from "@/lib/crosshair/builder/utils";

export default function ProCrosshairPreview({ code }: { code: string }) {
  const canvasRefs = useRef<Array<HTMLCanvasElement | null>>([]);

  useEffect(() => {
    try {
      const parsed = parseCode(code);
      for (const canvas of canvasRefs.current) {
        if (canvas) drawCrosshair(parsed, canvas, "primary", 1.5);
      }
    } catch {
      // invalid code — skip
    }
  }, [code]);

  return (
    <div className="grid grid-cols-2 gap-2">
      {BG_TILES.map((tile, idx) => (
        <div
          key={tile.label}
          className="rounded-md p-2"
          style={{ background: tile.color }}
        >
          <canvas
            ref={(el) => { canvasRefs.current[idx] = el; }}
            width={256}
            height={256}
            className="mx-auto block h-[80px] w-[80px] [image-rendering:pixelated]"
          />
        </div>
      ))}
    </div>
  );
}
