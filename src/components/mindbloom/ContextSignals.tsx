import { useState } from "react";
import { toast } from "sonner";
import { Calendar, School, ShieldCheck, Sparkles } from "lucide-react";
import { Chip, MockCard } from "@/components/mindbloom/ui-bits";
import googleLogo from "@/assets/google.png.asset.json";
import appleLogo from "@/assets/apple.png.asset.json";
import outlookLogo from "@/assets/outlook.png.asset.json";

const SOURCES = [
  { id: "google", label: "Google Calendar", src: googleLogo.url, bg: "bg-white" },
  { id: "apple", label: "Apple Calendar", src: appleLogo.url, bg: "bg-white" },
  { id: "outlook", label: "Outlook Calendar", src: outlookLogo.url, bg: "bg-white" },
] as const;

export function CalendarSourceChips() {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {SOURCES.map((s) => (
        <div
          key={s.id}
          className={`inline-flex items-center gap-1.5 rounded-full border border-border ${s.bg} px-2.5 py-1 text-[11px] font-medium text-foreground/80 shadow-sm`}
        >
          <img src={s.src} alt={s.label} className="h-3.5 w-3.5 object-contain" />
          {s.label}
        </div>
      ))}
    </div>
  );
}

export function CalendarConnectButtons({ size = "md" }: { size?: "sm" | "md" }) {
  const [connected, setConnected] = useState<string[]>([]);
  const connect = (id: string, label: string) => {
    setConnected((arr) => (arr.includes(id) ? arr : [...arr, id]));
    toast.success(`${label} ready to connect 📅`, {
      description: "Demo: in production this opens a secure OAuth flow.",
    });
  };
  const pad = size === "sm" ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs";
  return (
    <div className="flex flex-wrap gap-2">
      {SOURCES.map((s) => {
        const isOn = connected.includes(s.id);
        return (
          <button
            key={s.id}
            onClick={() => connect(s.id, s.label)}
            className={`inline-flex items-center gap-2 rounded-xl border border-border bg-white font-semibold text-foreground/90 shadow-sm transition hover:border-bloom hover:bg-bloom/5 ${pad}`}
          >
            <img src={s.src} alt="" className="h-4 w-4 object-contain" />
            {isOn ? `Connected · ${s.label.split(" ")[0]}` : `Connect ${s.label.split(" ")[0]}`}
          </button>
        );
      })}
    </div>
  );
}

interface CalendarItem {
  label: string;
  when: string;
  tone?: "coral" | "sky" | "leaf" | "bloom" | "muted";
}

export function CalendarContextCard({
  title = "Calendar Context",
  subtitle = "Upcoming school events that may explain wellness pattern changes.",
  items,
  note,
  showConnect = true,
  showSources = true,
  showContextChip = true,
}: {
  title?: string;
  subtitle?: string;
  items: CalendarItem[];
  note?: string;
  showConnect?: boolean;
  showSources?: boolean;
  showContextChip?: boolean;
}) {
  return (
    <MockCard>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-gradient-to-br from-sky/15 to-bloom/15">
            <Calendar className="h-5 w-5 text-sky" />
          </div>
          <div>
            <div className="text-base font-semibold">{title}</div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {showContextChip && <Chip tone="sky">Context</Chip>}
      </div>

      {showSources && (
        <div className="mt-3">
          <CalendarSourceChips />
        </div>
      )}

      <ul className="mt-3 grid gap-1.5">
        {items.map((it) => (
          <li
            key={it.label + it.when}
            className="flex items-center justify-between rounded-xl border border-border bg-white/70 px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-surface-2 text-xs">📅</span>
              <span className="font-medium">{it.label}</span>
            </div>
            <Chip tone={it.tone ?? "muted"}>{it.when}</Chip>
          </li>
        ))}
      </ul>

      {showConnect && (
        <div className="mt-3">
          <CalendarConnectButtons size="sm" />
        </div>
      )}

      {note && (
        <div className="mt-3 rounded-xl border border-bloom/25 bg-bloom/5 p-3 text-[11px] text-foreground/80">
          {note}
        </div>
      )}
    </MockCard>
  );
}

interface SisMetric {
  label: string;
  value: string;
  sub?: string;
  tone?: "coral" | "sky" | "leaf" | "muted";
}

export function SISContextCard({
  title = "SIS / School Data",
  subtitle = "School signals that help explain changes when check-ins are missing.",
  metrics,
}: {
  title?: string;
  subtitle?: string;
  metrics: SisMetric[];
}) {
  return (
    <MockCard>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-gradient-to-br from-leaf/20 to-sky/15">
            <School className="h-5 w-5 text-leaf-foreground" />
          </div>
          <div>
            <div className="text-base font-semibold">{title}</div>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <Chip tone="leaf">Privacy-safe</Chip>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-border bg-white/70 p-3"
          >
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {m.label}
            </div>
            <div
              className={`mt-1 text-lg font-semibold tabular-nums ${
                m.tone === "coral"
                  ? "text-coral"
                  : m.tone === "sky"
                    ? "text-sky"
                    : m.tone === "leaf"
                      ? "text-leaf-foreground"
                      : "text-foreground"
              }`}
            >
              {m.value}
            </div>
            {m.sub && <div className="text-[11px] text-muted-foreground">{m.sub}</div>}
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip tone="leaf">FERPA-first</Chip>
        <Chip tone="sky">Privacy-safe summary</Chip>
        <Chip tone="bloom">School context</Chip>
        <Chip tone="muted">Human review</Chip>
      </div>

      <div className="mt-3 rounded-xl border border-border bg-surface-2 p-3 text-[11px] text-muted-foreground">
        <ShieldCheck className="mr-1 inline h-3.5 w-3.5 align-text-bottom text-leaf-foreground" />
        School data is used as context, not as a diagnosis. Access is role-based and privacy-safe.
      </div>
    </MockCard>
  );
}

export function ContextDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-bloom/25 bg-bloom/5 p-4 text-center text-xs text-foreground/80 ${className}`}
    >
      <Sparkles className="mr-1 inline h-3.5 w-3.5 align-text-bottom text-bloom" />
      Calendar and school data help <span className="font-semibold">explain</span> patterns, but{" "}
      <span className="font-semibold">humans decide</span> what support is needed. MindBloom does not diagnose students.
    </div>
  );
}
