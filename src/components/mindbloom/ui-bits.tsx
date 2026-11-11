// Reusable mock-UI building blocks used across landing + dashboards.
import { type ReactNode } from "react";

export function MockCard({
  children,
  className = "",
  tone = "white",
}: {
  children: ReactNode;
  className?: string;
  tone?: "white" | "glass";
}) {
  return (
    <div
      className={`${tone === "glass" ? "glass-strong" : "soft-card"} rounded-2xl p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function Sparkline({
  points,
  color = "var(--bloom)",
  height = 40,
}: {
  points: number[];
  color?: string;
  height?: number;
}) {
  const w = 120;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = height - ((p - min) / range) * (height - 6) - 3;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `${path} L${w},${height} L0,${height} Z`;
  let h = 0;
  const seed = color + points.join(",");
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const gid = `spg-${Math.abs(h)}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BarTrend({
  values,
  color = "var(--primary)",
}: {
  values: number[];
  color?: string;
}) {
  const max = Math.max(...values);
  return (
    <div className="flex h-14 items-end gap-1.5">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-md transition-all"
          style={{
            height: `${(v / max) * 100}%`,
            background: `linear-gradient(180deg, ${color}, color-mix(in oklab, ${color} 40%, white))`,
            opacity: 0.55 + (i / values.length) * 0.45,
          }}
        />
      ))}
    </div>
  );
}

export function Chip({
  children,
  tone = "bloom",
}: {
  children: ReactNode;
  tone?: "bloom" | "leaf" | "sky" | "coral" | "muted";
}) {
  const tones: Record<string, string> = {
    bloom: "bg-bloom/10 text-[oklch(0.45_0.18_305)] border-bloom/20",
    leaf: "bg-leaf/15 text-[oklch(0.4_0.13_165)] border-leaf/30",
    sky: "bg-sky/15 text-[oklch(0.42_0.13_230)] border-sky/30",
    coral: "bg-coral/15 text-[oklch(0.45_0.14_30)] border-coral/30",
    muted: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Avatar({ name, color = "var(--bloom)" }: { name: string; color?: string }) {
  const initials = name
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("");
  return (
    <div
      className="grid h-8 w-8 place-items-center rounded-full text-xs font-semibold text-white"
      style={{ background: `linear-gradient(135deg, ${color}, color-mix(in oklab, ${color} 55%, white))` }}
    >
      {initials}
    </div>
  );
}
