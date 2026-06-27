import React from "react";

/**
 * Deterministic, unique SVG thumbnail for blog cards.
 *
 * Every post gets its own color scheme + scope motif derived from its slug,
 * so the listing looks varied and on-brand without needing per-post images.
 */

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function prettyLabel(s: string): string {
  return s
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function BlogThumb({
  seed,
  label,
  className,
}: {
  seed: string;
  label?: string;
  className?: string;
}) {
  const h = hashString(seed);
  const hue = h % 360;
  const hue2 = (hue + 48) % 360;
  const uid = `bt${(h % 1000000).toString(36)}`;
  const text = label ? prettyLabel(label) : "Aim Training";
  const blobX = 0.62 + ((h % 30) / 100); // 0.62–0.91
  const scopeX = 430 + (h % 90); // vary scope position

  return (
    <svg
      className={className}
      viewBox="0 0 640 360"
      role="img"
      aria-label={text}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0d1018" />
          <stop offset="1" stopColor="#11141d" />
        </linearGradient>
        <radialGradient id={`${uid}-blob`} cx={blobX} cy="0.22" r="0.95">
          <stop offset="0" stopColor={`hsl(${hue} 82% 60%)`} stopOpacity="0.95" />
          <stop offset="0.45" stopColor={`hsl(${hue2} 78% 48%)`} stopOpacity="0.5" />
          <stop offset="1" stopColor={`hsl(${hue2} 78% 48%)`} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="640" height="360" fill={`url(#${uid}-bg)`} />
      <rect width="640" height="360" fill={`url(#${uid}-blob)`} />

      {/* subtle grid */}
      <g stroke="rgba(255,255,255,0.05)" strokeWidth="1">
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={`v${i}`} x1={(i + 1) * 80} y1="0" x2={(i + 1) * 80} y2="360" />
        ))}
        {Array.from({ length: 4 }).map((_, i) => (
          <line key={`hl${i}`} x1="0" y1={(i + 1) * 72} x2="640" y2={(i + 1) * 72} />
        ))}
      </g>

      {/* scope / crosshair motif */}
      <g
        transform={`translate(${scopeX},148)`}
        fill="none"
        stroke={`hsl(${hue} 92% 72%)`}
        strokeOpacity="0.9"
      >
        <circle r="72" strokeWidth="3" />
        <circle r="46" strokeWidth="2" strokeOpacity="0.45" />
        <circle r="5" fill={`hsl(${hue} 92% 72%)`} stroke="none" />
        <line x1="-92" y1="0" x2="-80" y2="0" strokeWidth="3" />
        <line x1="80" y1="0" x2="92" y2="0" strokeWidth="3" />
        <line x1="0" y1="-92" x2="0" y2="-80" strokeWidth="3" />
        <line x1="0" y1="80" x2="0" y2="92" strokeWidth="3" />
      </g>

      {/* label */}
      <text
        x="40"
        y="300"
        fill="#ffffff"
        fontFamily="Inter, Segoe UI, sans-serif"
        fontSize="30"
        fontWeight="800"
        letterSpacing="0.3"
      >
        {text}
      </text>
      <text
        x="41"
        y="328"
        fill="rgba(255,255,255,0.55)"
        fontFamily="Inter, Segoe UI, sans-serif"
        fontSize="13"
        fontWeight="700"
        letterSpacing="3"
      >
        AIMTRAINERPRO
      </text>
    </svg>
  );
}
