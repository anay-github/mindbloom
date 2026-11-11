import { BarTrend, Chip, MockCard, Sparkline } from "./ui-bits";

export function HeroMockup() {
  return (
    <div className="relative mx-auto mt-14 max-w-5xl">

      {/* Glow */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-10 -z-10 h-[70%] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--bloom) 28%, transparent), transparent 70%)",
        }}
      />

      {/* Browser-style frame */}
      <div className="relative mx-auto overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_30px_80px_-20px_rgba(60,50,120,0.45)] ring-1 ring-black/[0.04] backdrop-blur-xl">
        {/* Title bar */}
        <div className="relative flex items-center gap-3 border-b border-border/70 bg-gradient-to-b from-white to-surface-2 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
          </div>
        </div>

        {/* App content */}
        <div className="p-5 sm:p-7">
          <div className="grid gap-4 md:grid-cols-12">

          {/* Student check-in */}
          <MockCard className="md:col-span-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Today's check-in
              </div>
              <Chip tone="leaf">🌱 Streak 12</Chip>
            </div>
            <div className="text-lg font-semibold">How are you feeling, Sam?</div>
            <div className="mt-3 flex items-center justify-between text-2xl">
              {["😞", "😕", "😐", "🙂", "😄"].map((e, i) => (
                <button
                  key={i}
                  className={`grid h-11 w-11 cursor-pointer place-items-center rounded-full border transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    i === 3 ? "scale-110 border-bloom bg-bloom/10 shadow" : "border-border bg-white"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-border bg-surface-2 p-3 text-xs text-muted-foreground">
              One small thing you’re grateful for today?
            </div>
          </MockCard>

          {/* AI insight */}
          <MockCard className="md:col-span-7">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-bloom to-sky text-white shadow-md">
                ✦
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">MindBloom insight</span>
                </div>
                <p className="mt-1 text-sm text-foreground/80">
                  Participation has dropped <span className="font-semibold">3 weeks in a row</span>.
                  Combined with 2 missed activities, a supportive check-in is recommended.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border bg-white/70 p-2">
                    <div className="text-[10px] uppercase text-muted-foreground">Mood</div>
                    <Sparkline points={[7, 6, 6, 5, 5, 4, 4]} color="var(--coral)" height={28} />
                  </div>
                  <div className="rounded-lg border border-border bg-white/70 p-2">
                    <div className="text-[10px] uppercase text-muted-foreground">Participation</div>
                    <Sparkline points={[9, 8, 8, 6, 5, 4, 3]} color="var(--bloom)" height={28} />
                  </div>
                  <div className="rounded-lg border border-border bg-white/70 p-2">
                    <div className="text-[10px] uppercase text-muted-foreground">Activities</div>
                    <Sparkline points={[8, 9, 7, 6, 5, 5, 4]} color="var(--sky)" height={28} />
                  </div>
                </div>
              </div>
            </div>
          </MockCard>

          {/* Counselor priority alert */}
          <MockCard className="md:col-span-7">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold">Counselor priority</div>
              
            </div>
            <div className="space-y-2">
              {[
                { n: "Sam T.", t: "coral" as const, r: "Support recommended", note: "Participation ↓ 3 wks · 4 missed" },
                { n: "Jordan K.", t: "sky" as const, r: "Watch", note: "Check-ins declining · streak broken" },
                { n: "Alex P.", t: "leaf" as const, r: "On Track", note: "Consistent check-ins & activities" },
              ].map((s) => (
                <div
                  key={s.n}
                  className="flex items-center justify-between rounded-xl border border-border bg-white/80 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        background:
                          s.t === "coral" ? "var(--coral)" : s.t === "sky" ? "var(--sky)" : "var(--leaf)",
                      }}
                    />
                    <div>
                      <div className="text-sm font-medium">{s.n}</div>
                      <div className="text-[11px] text-muted-foreground">{s.note}</div>
                    </div>
                  </div>
                  <Chip tone={s.t}>{s.r}</Chip>
                </div>
              ))}
            </div>
          </MockCard>

          {/* Streak widget */}
          <MockCard className="md:col-span-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Bloom streak</div>
              <Chip tone="leaf">+1 today</Chip>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-leaf/30 to-bloom/20 text-2xl">
                🌿
              </div>
              <div>
                <div className="text-3xl font-bold leading-none brand-gradient-text">12</div>
                <div className="mt-1 text-xs text-muted-foreground">days in a row</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-md ${
                    i < 12
                      ? "bg-gradient-to-br from-leaf to-[color-mix(in_oklab,var(--leaf)_55%,white)] shadow-sm"
                      : "border border-dashed border-leaf/40 bg-leaf/5"
                  }`}
                  title={`Day ${i + 1}`}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Next badge: <span className="font-medium text-foreground">Steady Sprout</span></span>
            </div>
          </MockCard>

        </div>

        {/* Command bar */}
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-white/90 px-4 py-3 shadow-sm">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-bloom text-white">
            ✦
          </div>
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Ask MindBloom about this student's wellness trend…"
            defaultValue=""
          />
          <button className="cursor-pointer rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition-transform hover:scale-[1.03]">
            Ask
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

