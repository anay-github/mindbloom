import { useState } from "react";
import { Chip } from "./ui-bits";

const SIGNALS = [
  { l: "Mood", v: "5.2 / 10", d: "lower than usual", t: "bloom", highlight: false },
  { l: "Sleep", v: "6.1 hrs avg", d: "down 1.2 hrs this week", t: "sky", highlight: false },
  { l: "Stress", v: "Elevated", d: "3 of 5 days", t: "coral", highlight: false },
  { l: "Skills", v: "4 of 7 done", d: "routine missed", t: "leaf", highlight: false },
  { l: "Participation", v: "↓ 22%", d: "3-week change", t: "sky", highlight: false },
  
];

const TREND = [4.6, 5.4, 5.0, 5.9, 5.5, 6.4, 6.1, 7.0, 6.6, 7.5];

function MiniChart() {
  const [hover, setHover] = useState<number | null>(null);
  const w = 360;
  const h = 140;
  const padL = 28;
  const padR = 10;
  const padT = 12;
  const padB = 22;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const yMin = 4;
  const yMax = 8;
  const yTicks = [4, 5, 6, 7, 8];
  const step = innerW / (TREND.length - 1);
  const pts = TREND.map((p, i) => ({
    x: padL + i * step,
    y: padT + (1 - (p - yMin) / (yMax - yMin)) * innerH,
    v: p,
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${path} L${pts[pts.length - 1].x},${padT + innerH} L${pts[0].x},${padT + innerH} Z`;
  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        preserveAspectRatio="none"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="mb-trend-l" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--bloom)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--bloom)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((t) => {
          const y = padT + (1 - (t - yMin) / (yMax - yMin)) * innerH;
          return (
            <g key={t}>
              <line x1={padL} x2={w - padR} y1={y} y2={y} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="2 3" />
              <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="8" fill="currentColor" opacity="0.55">{t}</text>
            </g>
          );
        })}
        {pts.map((p, i) => (
          <text key={`xl-${i}`} x={p.x} y={h - 6} textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.55">W{i + 1}</text>
        ))}
        <path d={area} fill="url(#mb-trend-l)" />
        <path d={path} fill="none" stroke="var(--bloom)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={hover === i ? 4 : 2.5} fill="white" stroke="var(--bloom)" strokeWidth="1.5" className="transition-all" />
            <rect x={p.x - step / 2} y={padT} width={step} height={innerH} fill="transparent" onMouseEnter={() => setHover(i)} />
          </g>
        ))}
        <text x={8} y={padT + innerH / 2} fontSize="7" fill="currentColor" opacity="0.5" transform={`rotate(-90 8 ${padT + innerH / 2})`} textAnchor="middle">Mood</text>
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background shadow"
          style={{ left: `${(pts[hover].x / w) * 100}%`, top: `${(pts[hover].y / h) * 100}%` }}
        >
          Week {hover + 1}: Mood {pts[hover].v.toFixed(1)}/10
        </div>
      )}
    </div>
  );
}

export function DetectionFlow() {
  const [msg, setMsg] = useState("");
  const EXAMPLE_Q = "Which signals matter most?";
  const EXAMPLE_A =
    "The strongest signals are sleep, participation, and stress. Sleep is down 1.2 hours this week, participation has dropped 22% over 3 weeks, and stress has been elevated on 3 of the last 5 days. Because these changes are repeated across multiple signals, MindBloom suggests a supportive check-in.";
  const [userMsg, setUserMsg] = useState<string>(EXAMPLE_Q);
  const [reply, setReply] = useState<string>(EXAMPLE_A);
  const ask = () => {
    const q = msg.trim();
    if (!q) return;
    setUserMsg(q);
    setReply(
      "MindBloom noticed repeated changes across mood, sleep, and participation over several weeks. This is not based on one day, so a supportive check-in may be helpful."
    );
    setMsg("");
  };


  return (
    <div className="mx-auto max-w-6xl">
      <div
        className="glass-strong overflow-hidden rounded-3xl border border-border/60 p-4 sm:p-6"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--bloom) 7%, white), color-mix(in oklab, var(--sky) 6%, white))",
        }}
      >
        <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
          {/* LEFT 50% */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Live preview</div>
                <div className="text-base font-semibold">Student Wellness Snapshot</div>
              </div>
              
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {SIGNALS.map((s) => (
                <div
                  key={s.l}
                  className="rounded-xl p-3"
                  style={
                    s.highlight
                      ? {
                          background:
                            "linear-gradient(135deg, color-mix(in oklab, var(--coral) 18%, white), color-mix(in oklab, var(--coral) 8%, white))",
                          border: "1px solid color-mix(in oklab, var(--coral) 45%, transparent)",
                          boxShadow: "0 6px 18px -10px color-mix(in oklab, var(--coral) 50%, transparent)",
                        }
                      : {
                          background: "rgb(255 255 255 / 0.9)",
                          border: "1px solid color-mix(in oklab, var(--ink) 6%, transparent)",
                          boxShadow: "0 1px 2px -1px color-mix(in oklab, var(--ink) 10%, transparent)",
                        }
                  }
                >
                  <div
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: `color-mix(in oklab, var(--${s.t}) 75%, var(--ink))` }}
                  >
                    {s.l}
                  </div>
                  {s.v && <div className="mt-1 text-sm font-semibold tabular-nums">{s.v}</div>}
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{s.d}</div>
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl bg-white/90 p-4"
              style={{ border: "1px solid color-mix(in oklab, var(--ink) 6%, transparent)" }}
            >
              <MiniChart />
            </div>
          </div>


          {/* RIGHT 50% */}
          <div className="flex flex-col gap-4">
            <div
              className="rounded-2xl border p-3"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in oklab, var(--bloom) 10%, white), color-mix(in oklab, var(--sky) 8%, white))",
                borderColor: "color-mix(in oklab, var(--bloom) 25%, transparent)",
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px]"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in oklab, var(--bloom) 30%, white), color-mix(in oklab, var(--sky) 30%, white))",
                  }}
                >
                  ✨
                </div>
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-bloom">
                  MindBloom AI Recommendations
                </div>
              </div>

              <p className="mt-2 text-[12.5px] leading-snug text-foreground">
                Pattern noticed across multiple days. A supportive check-in may be helpful.
              </p>




              <div className="mt-2.5 border-t border-border/60 pt-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Recommended action
                </div>
                <div className="mt-0.5 text-[12.5px] leading-snug text-foreground">
                  Suggest <span className="font-semibold">Box Breathing</span> and a supportive counselor check-in.
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    className="rounded-full bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background transition hover:opacity-90"
                  >
                    🌬️ Start Box Breathing
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-border bg-white px-2.5 py-1 text-[11px] font-semibold text-foreground transition hover:bg-surface-2"
                  >
                    🤝 Recommend Check-In
                  </button>
                </div>
              </div>
            </div>



            <div className="mt-auto flex min-h-[320px] flex-1 flex-col rounded-2xl border border-border bg-white/90 p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="grid h-6 w-6 place-items-center rounded-full text-[11px]"
                    style={{
                      background:
                        "linear-gradient(135deg, color-mix(in oklab, var(--bloom) 35%, white), color-mix(in oklab, var(--sky) 35%, white))",
                    }}
                  >
                    ✦
                  </div>
                  <div className="text-[11px] font-semibold text-foreground">Chat with MindBloom</div>
                </div>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto rounded-xl bg-surface-2/40 p-2.5">
                {!userMsg && !reply && (
                  <div className="flex h-full items-center justify-center text-center text-[11px] text-muted-foreground">
                    Ask MindBloom about this student's trend.
                  </div>
                )}
                {userMsg && (
                  <div className="flex justify-end">
                    <div
                      className="max-w-[85%] rounded-2xl rounded-br-sm px-3 py-2 text-xs text-background shadow-sm"
                      style={{ background: "var(--ink)" }}
                    >
                      {userMsg}
                    </div>
                  </div>
                )}
                {reply && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-xs text-foreground shadow-sm">
                      <div className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-bloom">MindBloom</div>
                      {reply}
                    </div>
                  </div>
                )}
              </div>


              <div className="mt-2 flex items-center gap-2 rounded-full border border-border bg-white py-1.5 pl-3 pr-1.5">
                <input
                  type="text"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && ask()}
                  placeholder="Ask about this student's trend…"
                  className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => ask()}
                  className="rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition hover:opacity-90"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
