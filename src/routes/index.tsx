import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Nav } from "@/components/mindbloom/Nav";
import { Footer } from "@/components/mindbloom/Footer";
import { HeroMockup } from "@/components/mindbloom/HeroMockup";
import { DetectionFlow } from "@/components/mindbloom/DetectionFlow";
import { BarTrend, Chip, MockCard, Sparkline } from "@/components/mindbloom/ui-bits";
import { WhyItMatters } from "@/components/mindbloom/WhyItMatters";
import { Reveal } from "@/components/Reveal";
import summer5 from "@/assets/summer5.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindBloom — AI-powered student wellness support" },
      {
        name: "description",
        content:
          "MindBloom helps schools notice wellness changes early by combining student check-ins, participation, and weekly signals — so counselors can support students sooner.",
      },
      { property: "og:title", content: "MindBloom — AI-powered student wellness support" },
      {
        property: "og:description",
        content:
          "Notice wellness patterns early. Help counselors prioritize supportive check-ins, with privacy-aware, explainable AI.",
      },
    ],
  }),
  component: Landing,
});

function SectionHeading({ id, eyebrow: _eyebrow, title, subtitle }: { id?: string; eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <Reveal variant="up" className="mx-auto mb-12 max-w-2xl text-center">
      <h2 id={id} className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.7rem]">{title}</h2>
      {subtitle && <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">{subtitle}</p>}
    </Reveal>
  );
}

function Landing() {
  return (
    <div className="min-h-screen">
      <div className="hero_bgx" style={{ backgroundImage: `url(${summer5.url})` }}>
        <div className="fade_bgx"></div>
      </div>
      <Nav />

      {/* HERO */}
      <section className="relative px-4 pt-8 sm:pt-12 lg:pt-16">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl font-sans text-center">
            Spot the <span className="italic brand-gradient-text">Signs.</span>
            <br />
            Build the <span className="italic brand-gradient-text">Skills.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-base text-white/90 sm:text-lg">
            {" "}
          </p>
        </div>

        <Reveal variant="up" delay={150} className="mt-[3.6rem] sm:mt-[4.5rem] lg:mt-[5.4rem] block">
          <HeroMockup />
        </Reveal>
      </section>




      <Reveal variant="up"><WhyItMatters /></Reveal>


      {/* HOW IT WORKS */}
      <section className="px-4 pt-28">
        <SectionHeading
          id="how"
          eyebrow="How It Works"
          title="Three calm steps, from check-in to care"
          subtitle="MindBloom turns small daily signals into clear, humane recommendations."
        />
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {/* Step 1 */}
          <Reveal variant="up" delay={0}>
          <StepCard
            step="01"
            title="Students check in"
            desc="Quick daily mood check-ins, weekly quizzes, and positive activities."
          >
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-surface-2 p-3">
                <div className="text-[11px] uppercase text-muted-foreground">Mood today</div>
                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-coral via-sun to-leaf"
                    style={{ width: "70%" }}
                  />
                </div>
              </div>
              <div className="rounded-xl border border-border bg-white p-3">
                <div className="text-xs font-semibold">Weekly wellness</div>
                <div className="mt-1 text-[11px] text-muted-foreground">I feel supported at school</div>
                <div className="mt-2 flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className={`h-7 flex-1 rounded-md border ${n <= 4 ? "border-leaf bg-leaf/30" : "border-border bg-white"}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-white p-3">
                <div className="flex items-center gap-2 text-sm">
                  <span>🌿</span>
                  <span className="font-medium">2-min breathing</span>
                </div>
                <Chip tone="leaf">+10 XP</Chip>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Streak</span>
                <span className="font-semibold text-foreground">12 days 🔥</span>
              </div>
            </div>
          </StepCard>
          </Reveal>

          {/* Step 2 */}
          <Reveal variant="up" delay={120}>
          <StepCard
            step="02"
            title="MindBloom notices patterns"
            desc="AI looks for changes over time across multiple wellness signals."
          >
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-white p-3">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold">8-week trend</span>
                  <Chip tone="bloom">Pattern noticed</Chip>
                </div>
                <Sparkline points={[8, 8, 7, 7, 6, 5, 5, 4]} color="var(--bloom)" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border bg-surface-2 p-2">
                  <div className="text-[10px] text-muted-foreground">Participation</div>
                  <div className="text-sm font-semibold text-coral">↓ 28%</div>
                </div>
                <div className="rounded-lg border border-border bg-surface-2 p-2">
                  <div className="text-[10px] text-muted-foreground">Routines missed</div>
                  <div className="text-sm font-semibold">4 of 7</div>
                </div>
                <div className="rounded-lg border border-border bg-surface-2 p-2">
                  <div className="text-[10px] text-muted-foreground">Streak change</div>
                  <div className="text-sm font-semibold">12 → broken</div>
                </div>
                <div className="rounded-lg border border-border bg-surface-2 p-2">
                  <div className="text-[10px] text-muted-foreground">Confidence</div>
                  <div className="text-sm font-semibold text-bloom">High · 0.87</div>
                </div>
              </div>
            </div>
          </StepCard>
          </Reveal>

          {/* Step 3 */}
          <Reveal variant="up" delay={240}>
          <StepCard
            step="03"
            title="Counselors take action"
            desc="Prioritized, explainable recommendations for supportive outreach."
          >
            <div className="space-y-2">
              {[
                { n: "Sam T.", t: "coral", r: "Support recommended" },
                { n: "Jordan K.", t: "sky", r: "Watch" },
                { n: "Alex P.", t: "leaf", r: "On Track" },
              ].map((s) => (
                <div
                  key={s.n}
                  className="flex items-center justify-between rounded-xl border border-border bg-white p-2.5"
                >
                  <div className="text-sm font-medium">{s.n}</div>
                  <Chip tone={s.t as "coral" | "sky" | "leaf"}>{s.r}</Chip>
                </div>
              ))}
              <div className="mt-2 rounded-xl border border-bloom/30 bg-bloom/5 p-3 text-xs">
                <div className="font-semibold text-foreground">Suggested action</div>
                <div className="text-muted-foreground">Schedule a supportive check-in with John D. this week.</div>
              </div>
              <div className="rounded-xl border border-border bg-surface-2 p-3 text-[11px] text-muted-foreground">
                Why: repeated changes across mood, participation, and routines over 3 weeks.
              </div>
            </div>
          </StepCard>
          </Reveal>
        </div>
      </section>

      {/* DETECTION */}
      <section className="px-4 pt-28">
        <SectionHeading
          id="detection"
          eyebrow="How Detection Works"
          title="How Detection Works"
          subtitle="From small daily signals to early support, MindBloom turns patterns into action."
        />
        <Reveal variant="up"><DetectionFlow /></Reveal>
      </section>

      {/* SKILL BUILDING PATH */}
      <section className="px-4 pt-28">
        <SectionHeading
          id="skills"
          title="Build Skills, One Step at a Time"
          subtitle="Students grow daily mental wellness habits through short guided activities, visible progress, and encouraging feedback."
        />
        <Reveal variant="scale"><SkillPath /></Reveal>
      </section>




      {/* COUNSELOR DASHBOARD PREVIEW */}
      <section className="px-4 pt-28">
        <SectionHeading
          id="counselors"
          eyebrow="For counselors"
          title="Clear priorities for busy counselors."
          subtitle="A calm command center for the people supporting students every day."
        />
        <Reveal variant="up" className="mx-auto max-w-6xl">
          <div
            className="glass-strong overflow-hidden rounded-3xl border border-border/60 p-4 sm:p-6"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--bloom) 7%, white), color-mix(in oklab, var(--sky) 6%, white))",
            }}
          >
            <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
              {/* LEFT — main feature: priority queue */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Counselor view
                    </div>
                    <div className="text-base font-semibold">Wellness priority queue</div>
                  </div>
                  
                </div>

                <div
                  className="overflow-hidden rounded-2xl bg-white/95"
                  style={{ border: "1px solid color-mix(in oklab, var(--ink) 6%, transparent)" }}
                >
                  <table className="w-full text-sm">
                    <thead className="bg-surface-2/70 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-semibold">#</th>
                        <th className="px-3 py-2 font-semibold">Student</th>
                        <th className="px-3 py-2 font-semibold">Signal</th>
                        <th className="px-3 py-2 font-semibold">Confidence</th>
                        <th className="px-3 py-2 text-center font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { n: "John D.", s: "Participation ↓ 3 wks · 4 missed", t: "coral", r: "Support", c: 0.86, focus: true },
                        { n: "Jordan K.", s: "Mood declining · streak broken", t: "sky", r: "Watch", c: 0.62, focus: false },
                        { n: "Priya N.", s: "Reflection sentiment shifting", t: "sky", r: "Watch", c: 0.55, focus: false },
                        { n: "John D.", s: "Steady check-ins", t: "leaf", r: "On Track", c: 0.18, focus: false },
                        { n: "Alex P.", s: "Consistent across signals", t: "leaf", r: "On Track", c: 0.14, focus: false },
                      ].map((row, i) => (
                        <tr
                          key={row.n}
                          className={`border-t border-border/70 ${
                            row.focus
                              ? "relative bg-leaf/10 shadow-[inset_3px_0_0_0_var(--leaf)]"
                              : ""
                          }`}
                        >
                          <td className="px-3 py-2.5 text-xs font-semibold text-muted-foreground">{i + 1}</td>
                          <td className="px-3 py-2.5 font-medium">
                            <span className="inline-flex items-center gap-1.5">
                              {row.n}
                              {row.focus && null}

                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-muted-foreground">{row.s}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${row.c * 100}%`,
                                    background: `color-mix(in oklab, var(--${row.t}) 75%, white)`,
                                  }}
                                />
                              </div>
                              <span className="text-[11px] tabular-nums text-muted-foreground">
                                {row.c.toFixed(2)}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-center">
                            <Chip tone={row.t as "coral" | "sky" | "leaf"}>{row.r}</Chip>
                          </td>


                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { l: "Support", v: "1", d: "needs check-in", t: "coral" },
                    { l: "Watch", v: "2", d: "light monitoring", t: "sky" },
                    { l: "On Track", v: "24", d: "steady patterns", t: "leaf" },
                  ].map((s) => (
                    <div
                      key={s.l}
                      className="rounded-xl bg-white/90 p-3"
                      style={{
                        border: "1px solid color-mix(in oklab, var(--ink) 6%, transparent)",
                        boxShadow: "0 1px 2px -1px color-mix(in oklab, var(--ink) 10%, transparent)",
                      }}
                    >
                      <div
                        className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: `color-mix(in oklab, var(--${s.t}) 75%, var(--ink))` }}
                      >
                        {s.l}
                      </div>
                      <div className="mt-1 text-xl font-semibold tabular-nums">{s.v}</div>
                      <div className="text-[11px] text-muted-foreground">{s.d}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — AI insight + next step */}
              <div className="flex flex-col gap-4">

                <TrendSummaryCard />
              </div>
            </div>
          </div>
        </Reveal>
      </section>





      {/* CONTEXT MAKES PATTERNS CLEARER */}
      <section className="px-4 pt-28">
        <SectionHeading
          id="context"
          eyebrow="Context"
          title="Context Makes Patterns Clearer"
          subtitle="Calendar and school data help explain patterns, but humans decide what support is needed. MindBloom does not diagnose students."
        />
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {[
            {
              icon: "📅",
              t: "Calendar Context",
              d: "Finals, testing weeks, holidays, project deadlines, and school events from Google, Apple, and Outlook Calendar.",
              chip: "Explainable",
              tone: "sky" as const,
            },
            {
              icon: "🏫",
              t: "School Data Context",
              d: "Absences, tardies, assignment participation, and classroom participation — used as context, never as a diagnosis.",
              chip: "Privacy-safe",
              tone: "leaf" as const,
            },
            {
              icon: "🤝",
              t: "Student Context",
              d: "Check-ins and journal entries provide important context behind patterns, helping create a more complete picture of student well-being.",
              chip: "Personal insights",
              tone: "bloom" as const,
            },
          ].map((c, i) => (
            <Reveal key={c.t} variant="up" delay={i * 120}>
              <div className="soft-card p-6 h-full">
                <div className="text-2xl">{c.icon}</div>
                <div className="mt-2 flex items-center gap-2">
                  <h3 className="text-base font-semibold">{c.t}</h3>
                  <Chip tone={c.tone}>{c.chip}</Chip>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-xs text-muted-foreground">
          MindBloom uses calendar and school data as context only. Sensitive information is shown through role-based,
          privacy-safe summaries, and human adults decide what support is appropriate.
        </p>
      </section>



      {/* FINAL CTA */}
      <section className="px-4 pt-28">
        <Reveal variant="scale" className="mx-auto max-w-5xl block">
          <div className="glass-strong relative overflow-hidden rounded-3xl p-10 text-center md:p-14">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 opacity-50"
              style={{
                background:
                  "radial-gradient(600px 300px at 20% 0%, color-mix(in oklab, var(--bloom) 30%, transparent), transparent), radial-gradient(600px 300px at 100% 100%, color-mix(in oklab, var(--leaf) 30%, transparent), transparent)",
              }}
            />
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Support students earlier — with signals that are
              <br className="hidden sm:block" />{" "}
              <span className="brand-gradient-text">clear, humane, and actionable.</span>
            </h2>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}

function StepCard({
  step,
  title,
  desc,
  children,
}: {
  step: string;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="soft-card relative overflow-hidden p-6">
      <div className="mb-3 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-bloom text-xs font-bold text-white">
          {step}
        </div>
        <div>
          <div className="text-base font-semibold">{title}</div>
        </div>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{desc}</p>
      <div className="rounded-2xl bg-surface-2 p-3">{children}</div>
    </div>
  );
}

const COUNSELOR_SIGNALS = [
  { l: "Mood", v: "7.4 / 10", d: "steady 4 wks", t: "leaf" },
  { l: "Sleep", v: "8.1 hrs avg", d: "on target", t: "sky" },
  { l: "Stress", v: "Low", d: "1 of 5 days", t: "leaf" },
  { l: "Participation", v: "↑ 4%", d: "2-week change", t: "leaf" },
  { l: "Streak", v: "21 days", d: "longest this term", t: "leaf" },
  { l: "Check-ins", v: "5 of 5", d: "completed all week", t: "bloom" },
];

const COUNSELOR_TREND = [7.0, 7.1, 7.2, 7.3, 7.2, 7.3, 7.4, 7.4];

function CounselorMiniChart() {
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
  const step = innerW / (COUNSELOR_TREND.length - 1);
  const pts = COUNSELOR_TREND.map((p, i) => ({
    x: padL + i * step,
    y: padT + (1 - (p - yMin) / (yMax - yMin)) * innerH,
    v: p,
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${path} L${pts[pts.length - 1].x},${padT + innerH} L${pts[0].x},${padT + innerH} Z`;
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="mb-counselor-trend" x1="0" x2="0" y1="0" y2="1">
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
        <path d={area} fill="url(#mb-counselor-trend)" />
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

function TrendSummaryCard() {
  return (
    <div className="mt-auto flex flex-1 flex-col gap-4 rounded-2xl border border-border bg-white/90 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pattern review</div>
          <div className="text-base font-semibold">Trend Snapshot — John D.</div>
        </div>
        
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {COUNSELOR_SIGNALS.map((s) => (
          <div
            key={s.l}
            className="rounded-xl p-3"
            style={{
              background: "rgb(255 255 255 / 0.9)",
              border: "1px solid color-mix(in oklab, var(--ink) 6%, transparent)",
              boxShadow: "0 1px 2px -1px color-mix(in oklab, var(--ink) 10%, transparent)",
            }}
          >
            <div
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: `color-mix(in oklab, var(--${s.t}) 75%, var(--ink))` }}
            >
              {s.l}
            </div>
            <div className="mt-1 text-sm font-semibold tabular-nums">{s.v}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{s.d}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white/90 p-3" style={{ border: "1px solid color-mix(in oklab, var(--ink) 6%, transparent)" }}>
        <CounselorMiniChart />
      </div>

    </div>
  );
}

function SkillPath() {
  const steps = [
    { name: "Breathing", icon: "🫁", status: "done", desc: "4-7-8 calm breath", mins: "2 min" },
    { name: "Mindfulness", icon: "🌸", status: "done", desc: "Notice 5 senses", mins: "3 min" },
    { name: "Grounding", icon: "🌿", status: "done", desc: "Feet on the floor", mins: "2 min" },
    { name: "Journal Check-In", icon: "📓", status: "active", desc: "One small win today", mins: "3 min" },
    { name: "Stress Reset", icon: "💧", status: "upcoming", desc: "Shake it out", mins: "2 min" },
    { name: "Emotional Regulation", icon: "💗", status: "upcoming", desc: "Name it to tame it", mins: "4 min" },
  ];
  const completed = steps.filter((s) => s.status === "done").length;
  const pct = Math.round((completed / steps.length) * 100);

  return (
    <div className="mx-auto grid max-w-4xl items-center gap-6 md:grid-cols-12">
      {/* Left: copy */}
      <div className="md:col-span-6">

        <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Small steps, every day, that <span className="brand-gradient-text">actually stick</span>.
        </h3>

        <ul className="mt-5 space-y-2.5 text-sm">
          {[
            { i: "✨", t: "Short guided activities, 2–4 minutes each" },
            { i: "🌿", t: "Visible streaks and a personal Bloom garden" },
            { i: "💬", t: "Encouraging feedback after every step" },
          ].map((x) => (
            <li key={x.t} className="flex items-start gap-3">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-gradient-to-br from-leaf/30 to-bloom/20 text-sm">
                {x.i}
              </span>
              <span className="text-foreground/85">{x.t}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right: mock student interface */}
      <div className="md:col-span-6">
        <div className="relative w-full">
          {/* Glow */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--leaf) 22%, transparent), transparent 70%)",
            }}
          />
          <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-5 shadow-[0_30px_80px_-25px_rgba(60,50,120,0.35)] ring-1 ring-black/[0.04] backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Sam's path
                </div>
                <div className="text-lg font-bold">Today's Path</div>
              </div>
              <Chip tone="leaf">🌱 3-day streak</Chip>
            </div>

            {/* Progress line */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-leaf/15">

              <div
                className="h-full rounded-full bg-gradient-to-r from-leaf via-bloom to-sky transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* Path */}
            <div className="relative mt-5">
              <ul className="relative space-y-2.5">
                {steps.map((s, i) => {
                  const done = s.status === "done";
                  const active = s.status === "active";
                  // gentle winding offset: sine-like sway
                  const sway = [0, 22, -22, 0, 22, -22][i] ?? 0;
                  return (
                    <li
                      key={s.name}
                      className="relative flex items-center justify-center gap-3"
                      style={{ transform: `translateX(${sway}px)` }}
                    >

                      {/* checkpoint dot */}
                      <div
                        className={`relative grid h-11 w-11 flex-none place-items-center rounded-full text-lg shadow-sm transition-all ${
                          done
                            ? "bg-gradient-to-br from-leaf to-[color-mix(in_oklab,var(--leaf)_60%,white)] text-white"
                            : active
                              ? "bg-gradient-to-br from-bloom to-sky text-white ring-4 ring-bloom/20"
                              : "bg-white text-muted-foreground ring-1 ring-border"
                        }`}
                      >
                        <span>{done ? "✓" : s.icon}</span>
                      </div>


                      {/* label */}
                      <div className="w-[288px] max-w-full rounded-xl px-3 py-2"
                        style={{
                          background: active
                            ? "linear-gradient(90deg, color-mix(in oklab, var(--bloom) 8%, white), color-mix(in oklab, var(--sky) 8%, white))"
                            : done
                              ? "color-mix(in oklab, var(--leaf) 8%, white)"
                              : "white",
                          border: "1px solid color-mix(in oklab, var(--ink) 6%, transparent)",
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className={`text-sm font-semibold ${done ? "text-foreground/70 line-through decoration-leaf/60" : "text-foreground"}`}>
                            {s.name}
                          </div>
                          {done && <Chip tone="leaf">+10 ✨</Chip>}
                          {active && <Chip tone="bloom">Start now</Chip>}
                          {s.status === "upcoming" && (
                            <span className="text-[11px] text-muted-foreground">{s.mins}</span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{s.desc}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Celebration footer */}
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-leaf/20 bg-gradient-to-r from-leaf/10 via-bloom/5 to-sky/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-lg shadow-sm">🌼</div>
                <div>
                  <div className="text-sm font-semibold">Steady Sprout unlocking</div>
                  <div className="text-[11px] text-muted-foreground">Finish 1 more skill to bloom today</div>
                </div>
              </div>
              <span className="text-xl" aria-hidden>🎉</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
