type Tone = "bloom" | "sky" | "leaf" | "coral";

type Card = {
  stat: string;
  title: string;
  text: string;
  source: string;
  tone: Tone;
  visual: "wave" | "arkansas" | "timeline" | "flow";
};

const CARDS: Card[] = [
  {
    stat: "40%",
    title: "Students Are Struggling",
    text: "of high school students reported persistent sadness or hopelessness in 2023.",
    source: "Source: CDC, 2023",
    tone: "bloom",
    visual: "wave",
  },
  {
    stat: "15%",
    title: "Arkansas Youth Need Earlier Help",
    text: "of Arkansas adolescents ages 12 to 17 experience a major depressive episode annually.",
    source: "Source: Challenge brief",
    tone: "sky",
    visual: "arkansas",
  },
  {
    stat: "10 Years",
    title: "Support Often Comes Too Late",
    text: "average delay between symptom onset and first treatment.",
    source: "Source: Challenge brief",
    tone: "leaf",
    visual: "timeline",
  },
  {
    stat: "Early Support",
    title: "MindBloom Helps Schools Act Sooner",
    text: "Daily check-ins, skill practice, and AI pattern detection help schools notice repeated changes earlier.",
    source: "Source: MindBloom MVP model",
    tone: "coral",
    visual: "flow",
  },
];

const TONE: Record<Tone, { grad: string; ring: string; accent: string; soft: string }> = {
  bloom: { grad: "from-bloom/15 via-bloom/5 to-transparent", ring: "ring-bloom/20", accent: "var(--bloom)", soft: "bg-bloom/10" },
  sky: { grad: "from-sky/20 via-sky/5 to-transparent", ring: "ring-sky/25", accent: "var(--sky)", soft: "bg-sky/10" },
  leaf: { grad: "from-leaf/20 via-leaf/5 to-transparent", ring: "ring-leaf/25", accent: "var(--leaf)", soft: "bg-leaf/10" },
  coral: { grad: "from-coral/15 via-coral/5 to-transparent", ring: "ring-coral/25", accent: "var(--coral)", soft: "bg-coral/10" },
};

function Visual({ kind, color }: { kind: Card["visual"]; color: string }) {
  if (kind === "wave") {
    return null;
  }
  if (kind === "arkansas") {
    // Accurate-ish Arkansas state outline (NE notch, wavy Mississippi east border)
    return (
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 60 60" className="h-16 w-16" aria-hidden>
          <path
            d="M7 9 L36 8 L36 12 L51 12 L50 20 L52 26 L49 32 L51 38 L48 44 L50 50 L46 53 L11 53 L10 46 L8 38 L7 28 L8 18 Z"
            fill={`color-mix(in oklab, ${color} 16%, white)`}
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx="28" cy="32" r="2.2" fill={color} />
        </svg>
      </div>
    );
  }
  if (kind === "timeline") {
    return (
      <div className="px-1 py-1">
        <div className="relative h-4">
          <div
            className="absolute inset-x-2 top-1/2 h-[2px] -translate-y-1/2 rounded-full"
            style={{ background: `color-mix(in oklab, ${color} 35%, white)` }}
          />
          <span
            className="absolute left-2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
            style={{ border: `2px solid ${color}` }}
          />
          <span
            className="absolute right-2 top-1/2 h-3 w-3 translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: color }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
          <span>First signs</span>
          <span style={{ color }}>~10 yrs</span>
          <span>Support</span>
        </div>
      </div>
    );

  }
  // flow
  const steps = ["Signals", "Patterns", "Support"];
  return (
    <div className="flex items-center justify-between gap-1.5">
      {steps.map((s, i) => (
        <div key={s} className="flex flex-1 items-center gap-1.5">
          <div
            className="flex flex-1 items-center justify-center rounded-full px-2 py-1 text-[10px] font-semibold"
            style={{
              background: `color-mix(in oklab, ${color} ${12 + i * 10}%, white)`,
              color: `color-mix(in oklab, ${color} 70%, black)`,
            }}
          >
            {s}
          </div>
          {i < steps.length - 1 && (
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path d="M2 5 H8 M5 2 L8 5 L5 8" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

export function WhyItMatters() {
  return (
    <section className="px-4 pt-28">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h2 id="why" className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.7rem]">
          Why Early Support Matters
        </h2>
        <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">
          Students need support before small concerns become bigger problems.
        </p>
      </div>
      <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
        {CARDS.map((c) => {
          const t = TONE[c.tone];
          return (
            <div
              key={c.title}
              className={`soft-card group relative flex flex-col overflow-hidden p-6 ring-1 ${t.ring} transition hover:shadow-xl`}
            >
              <div aria-hidden className={`absolute inset-0 -z-10 bg-gradient-to-br ${t.grad}`} />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-60 blur-2xl transition group-hover:opacity-80"
                style={{ background: `radial-gradient(closest-side, ${t.accent}33, transparent)` }}
              />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="brand-gradient-text text-3xl font-bold leading-none tracking-tight sm:text-4xl">
                    {c.stat}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-foreground">{c.title}</div>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">{c.text}</p>
              <div className="mt-auto pt-4 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                {c.source}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
