import type { ReactNode } from "react";

export default function FieldRow({
  name,
  children,
  alt,
}: {
  name: string;
  children: ReactNode;
  alt: boolean;
}) {
  return (
    <div
      className={`grid min-h-[50px] grid-cols-1 border-b border-zinc-700/70 sm:grid-cols-[1.2fr_1fr] ${
        alt ? "bg-[#212734]" : "bg-[#1a202d]"
      }`}
    >
      <div className="flex min-h-[46px] items-center px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300 sm:min-h-[50px] sm:px-4 sm:text-xs">
        {name}
      </div>
      <div className="flex min-h-[50px] items-center p-2.5">{children}</div>
    </div>
  );
}
