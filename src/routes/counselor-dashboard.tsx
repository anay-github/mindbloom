import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Sparkles, Send, X, Mail, Calendar as CalendarIcon, Wind, BookOpen, Moon, HandHelping, ArrowUp, ArrowDown, ShieldCheck } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Nav } from "@/components/mindbloom/Nav";
import { Footer } from "@/components/mindbloom/Footer";
import { Avatar, Chip, MockCard, Sparkline } from "@/components/mindbloom/ui-bits";
import { AssignResources } from "@/components/mindbloom/AssignResources";
import { PixelAccent } from "@/components/mindbloom/PixelAccent";
import treesBg from "@/assets/trees.png.asset.json";
import {
  CalendarContextCard,
  
  ContextDisclaimer,
} from "@/components/mindbloom/ContextSignals";
import { BackButton } from "@/components/mindbloom/BackButton";
import { useHistoryState } from "@/hooks/useHistoryState";
import {
  useSupportAlerts,
  type SupportAlert,
  type AlertStatus,
} from "@/lib/support-alerts";


export const Route = createFileRoute("/counselor-dashboard")({
  head: () => ({
    meta: [
      { title: "Counselor dashboard — MindBloom" },
      { name: "description", content: "A calm command center for school counselors: prioritized students, explainable signals, and suggested supportive actions." },
      { property: "og:title", content: "Counselor dashboard — MindBloom" },
      { property: "og:description", content: "Prioritize who may need support first — with explainable, privacy-aware signals." },
    ],
  }),
  component: CounselorDashboard,
});

type Status = "Support" | "Watch" | "On Track";
type Student = {
  name: string;
  status: Status;
  reason: string;
  mood: number[];
  participation: number[];
  activities: number[];
  signals: string[];
  notes: string;
  confidence: number;
};

const STUDENTS: Student[] = [
  {
    name: "John D.",
    status: "Support",
    reason: "Participation down 3 weeks, missed 4 activities, mood trending lower.",
    mood: [7, 7, 6, 6, 5, 5, 4, 4],
    participation: [9, 8, 8, 6, 5, 4, 4, 3],
    activities: [8, 9, 7, 6, 5, 5, 4, 4],
    signals: ["Mood ↓", "Participation ↓ 28%", "4 missed routines", "Streak broken"],
    notes: "Quiet in homeroom last Tuesday. Mentioned 'tired' twice this week.",
    confidence: 0.87,
  },
  {
    name: "Jordan K.",
    status: "Watch",
    reason: "Mood check-ins declining; streak broken after 18 days.",
    mood: [8, 7, 7, 6, 6, 5, 5, 5],
    participation: [8, 8, 7, 7, 6, 6, 6, 6],
    activities: [7, 7, 8, 6, 6, 7, 6, 6],
    signals: ["Mood ↓ gentle", "Streak broken", "Reflection shorter"],
    notes: "Recently changed friend group. Soccer season ended.",
    confidence: 0.64,
  },
  {
    name: "Priya N.",
    status: "Watch",
    reason: "Reflection sentiment shifting toward 'overwhelmed.'",
    mood: [7, 7, 6, 6, 6, 5, 6, 5],
    participation: [8, 8, 8, 7, 7, 7, 7, 7],
    activities: [9, 9, 8, 8, 7, 7, 7, 6],
    signals: ["Sentiment shift", "Sleep mentions ↑", "Activities ↓ slight"],
    notes: "Midterms this week.",
    confidence: 0.58,
  },
  {
    name: "Sam T.",
    status: "On Track",
    reason: "Consistent check-ins and activity completion.",
    mood: [7, 7, 7, 8, 7, 8, 8, 8],
    participation: [8, 8, 8, 9, 9, 9, 9, 9],
    activities: [8, 8, 9, 9, 9, 9, 9, 9],
    signals: ["Mood steady", "Streak 21", "All routines met"],
    notes: "—",
    confidence: 0.12,
  },
  {
    name: "Alex P.",
    status: "On Track",
    reason: "Consistent across signals; no concern patterns.",
    mood: [7, 8, 8, 8, 7, 8, 8, 9],
    participation: [9, 9, 9, 9, 9, 9, 9, 10],
    activities: [9, 9, 9, 9, 10, 9, 9, 10],
    signals: ["Steady mood", "Streak 30+", "Active in clubs"],
    notes: "—",
    confidence: 0.08,
  },
];

const STATUS_TONE: Record<Status, "coral" | "sky" | "leaf"> = {
  Support: "coral",
  Watch: "sky",
  "On Track": "leaf",
};

const clamp = (n: number, min = 0, max = 10) => Math.max(min, Math.min(max, n));




function CounselorDashboard() {
  const router = useRouter();
  const [tab, setTab, tabBack, canTabBack] = useHistoryState<"overview" | "queue" | "alerts" | "resources">("overview");
  const [selected, setSelected] = useState(0);
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [range, setRange] = useState<7 | 14>(7);
  const [showWhy, setShowWhy] = useState(false);
  const [activeAlert, setActiveAlert] = useState<SupportAlert | null>(null);
  const [trisOpen, setTrisOpen] = useState(false);
  const [urgentAlertOpen, setUrgentAlertOpen] = useState(false);
  const [studentStatus, setStudentStatus] = useState<"Support Recommended" | "Action Taken">("Support Recommended");
  const trisDefault = `Hi Mr. Davis (Homeroom),\n\nJohn is having a tough week. Instead of singling him out, MindBloom recommends running a 3-minute Sensory Countdown for the entire class today.\n\nThis aligns with our TRIS trauma-informed practices and allows him to regulate alongside his peers. He can lead the exercise on the Smartboard using his dashboard.\n\nThanks,\nCounselor's Office`;
  const { alerts, updateStatus } = useSupportAlerts();
  const s = STUDENTS[selected];

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("mindbloom-urgent-alert")) {
      const timer = setTimeout(() => setUrgentAlertOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);




  const filteredStudents = useMemo(
    () => STUDENTS.map((st, i) => ({ st, i })).filter(({ st }) => statusFilter === "All" || st.status === statusFilter),
    [statusFilter],
  );

  // Per-student mock series, deterministic from student name
  const { studentTrend, studentActivity } = useMemo(() => {
    const seed = s.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const rand = (i: number) => {
      const x = Math.sin(seed + i) * 10000;
      return x - Math.floor(x);
    };
    const days = range === 7
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : Array.from({ length: 14 }, (_, i) => `D${i + 1}`);
    const baseMood = s.mood[s.mood.length - 1];
    const baseStress = s.status === "Support" ? 7 : s.status === "Watch" ? 5 : 3;
    const baseSleep = s.status === "Support" ? 4 : s.status === "Watch" ? 6 : 8;
    const baseEnergy = s.status === "Support" ? 4 : s.status === "Watch" ? 6 : 8;
    const trend = days.map((d, i) => {
      const drift = (i - days.length / 2) * (s.status === "Support" ? -0.2 : s.status === "Watch" ? -0.1 : 0.05);
      return {
        day: d,
        Mood: +clamp(baseMood + drift + (rand(i) - 0.5) * 1.2).toFixed(1),
        Stress: +clamp(baseStress - drift + (rand(i + 1) - 0.5) * 1.2).toFixed(1),
        Sleep: +clamp(baseSleep + drift + (rand(i + 2) - 0.5) * 1.2).toFixed(1),
        Energy: +clamp(baseEnergy + drift + (rand(i + 3) - 0.5) * 1.2).toFixed(1),
      };
    });
    // Varied, realistic skills/day pattern (low–mid–high mix)
    const skillsPattern7 =
      s.status === "Support"
        ? [0, 1, 2, 1, 0, 1, 0]
        : s.status === "Watch"
          ? [1, 2, 1, 2, 1, 3, 2]
          : [2, 1, 3, 2, 3, 2, 3];
    const activity = days.map((d, i) => ({
      day: d,
      "Check-ins": Math.round(rand(i + 10)) === 0 && s.status === "Support" ? 0 : 1,
      Skills:
        range === 7
          ? skillsPattern7[i]
          : Math.max(0, Math.round((s.status === "Support" ? 1 : s.status === "Watch" ? 1.6 : 2.4) + (rand(i + 20) - 0.5) * 2.5)),
    }));
    return { studentTrend: trend, studentActivity: activity };
  }, [s, range]);


  return (
    <div className="min-h-screen">
      <Nav />
      <PixelAccent className="-mb-10" imageUrl={treesBg.url} />
      <main className="mx-auto max-w-7xl px-4 pt-8 pb-12">
        {/* Welcome — matches student dashboard hero */}
        <div className="glass-strong rounded-3xl p-6 md:px-10 md:py-8">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Welcome Back, Mr. Chen!
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div className="inline-flex items-baseline gap-1.5 rounded-full border border-coral/40 bg-coral/10 px-3 py-1 text-base font-bold tracking-tight shadow-sm md:text-lg">
                <span>1 <span className="text-xs font-semibold text-muted-foreground md:text-sm">SUPPORT</span></span>
              </div>
              <div className="inline-flex items-baseline gap-1.5 rounded-full border border-sky/40 bg-sky/10 px-3 py-1 text-base font-bold tracking-tight shadow-sm md:text-lg">
                <span>2 <span className="text-xs font-semibold text-muted-foreground md:text-sm">WATCH</span></span>
              </div>
              <div className="inline-flex items-baseline gap-1.5 rounded-full border border-leaf/40 bg-leaf/15 px-3 py-1 text-base font-bold tracking-tight shadow-sm md:text-lg">
                <span>2 <span className="text-xs font-semibold text-muted-foreground md:text-sm">ON TRACK</span></span>
              </div>
              <button
                onClick={() => setTab("alerts")}
                className="rounded-2xl bg-sky px-6 py-3.5 text-base font-semibold text-white shadow"
              >
                Review Alerts
              </button>
            </div>
          </div>
        </div>

        {/* Section nav — matches student dashboard */}
        <div className="mt-5 flex flex-wrap gap-1.5 rounded-2xl border border-border bg-white/70 p-1.5 backdrop-blur">
          {([
            { id: "overview", label: "Overview" },
            { id: "queue", label: "Priority Queue" },
            { id: "alerts", label: "Support Alerts" },
            { id: "resources", label: "Resources" },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[88px] rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 will-change-transform ${
                tab === t.id ? "bg-sky text-white shadow" : "text-muted-foreground hover:-translate-y-0.5 hover:bg-white hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>


        {tab === "overview" && (<>
        {/* School snapshot removed */}

        {/* 2 · Student Insight — one unified card */}
        <section className="mt-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase text-muted-foreground">Student</span>
            {STUDENTS.map((st, i) => (
              <button
                key={st.name}
                onClick={() => setSelected(i)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected === i
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-white text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background:
                      st.status === "Support" ? "var(--coral)" : st.status === "Watch" ? "var(--sky)" : "var(--leaf)",
                  }}
                />
                {st.name}
              </button>
            ))}
          </div>

          <MockCard className="bg-gradient-to-br from-bloom/5 via-white to-sky/5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar
                  name={s.name}
                  color={s.status === "Support" ? "var(--coral)" : s.status === "Watch" ? "var(--sky)" : "var(--leaf)"}
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-lg font-semibold">{s.name}</div>
                    <TooltipProvider delayDuration={100}>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <span
                            tabIndex={0}
                            className="inline-flex items-center gap-1 rounded-full border border-sky/30 bg-sky/10 px-2 py-0.5 text-[11px] font-semibold text-sky cursor-help outline-none focus-visible:ring-2 focus-visible:ring-sky/40"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          align="start"
                          className="max-w-xs rounded-xl border border-border bg-white p-3 text-left shadow-lg"
                        >
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                            <ShieldCheck className="h-3.5 w-3.5 text-sky" />
                            System Compliance
                          </div>
                          <div className="mt-2 space-y-1 text-[11px] text-slate-700">
                            <div className="flex items-center justify-between gap-2">
                              <span>FERPA (Educational):</span>
                              <span className="font-semibold text-leaf">Compliant</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span>COPPA (Minors):</span>
                              <span className="font-semibold text-leaf">Compliant</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span>HIPAA (Health)*:</span>
                              <span className="font-semibold text-leaf">Compliant</span>
                            </div>
                          </div>
                          <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
                            *Covered under BAA with regional health partners. Zero-retention semantic analysis is active. No raw identifiable text is stored.
                          </p>
                        </TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                    {studentStatus === "Support Recommended" ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-coral/30 bg-coral/10 px-2.5 py-0.5 text-xs font-semibold text-coral">
                        Support Recommended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-leaf/30 bg-leaf/10 px-2.5 py-0.5 text-xs font-semibold text-leaf">
                        ✓ Action Taken
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Grade 10</div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-12">
              {/* Section 1 — Graphs */}
              <div className="flex flex-col gap-6 lg:col-span-5">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-base font-semibold">Wellness trend</div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <LegendDot color="var(--bloom)" label="Mood" />
                      <LegendDot color="var(--coral)" label="Stress" />
                      <LegendDot color="var(--sky)" label="Sleep" />
                      <LegendDot color="var(--leaf)" label="Energy" />
                    </div>
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={studentTrend} margin={{ top: 8, right: 12, left: -10, bottom: 4 }}>
                        <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} opacity={0.7} />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" tickMargin={8} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 10]} ticks={[0, 5, 10]} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" width={30} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }} />
                        <ReferenceLine y={5} stroke="var(--border)" strokeDasharray="4 4" />
                        <Line type="monotone" dataKey="Mood" stroke="var(--bloom)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Stress" stroke="var(--coral)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Sleep" stroke="var(--sky)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Energy" stroke="var(--leaf)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-base font-semibold">Build Skills completed</div>
                    <div className="text-xs text-muted-foreground">Skills / day</div>
                  </div>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={studentActivity} margin={{ top: 4, right: 12, left: -10, bottom: 4 }}>
                        <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} opacity={0.7} />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" tickMargin={8} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" width={30} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }} />
                        <Bar dataKey="Skills" fill="var(--leaf)" radius={[6, 6, 0, 0]} maxBarSize={26} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Section 2 — Stats + baseline */}
              <div className="flex flex-col gap-2.5 lg:col-span-3">
                <SignalStat
                  label="Current mood"
                  value={s.mood[s.mood.length - 1].toFixed(1)}
                  sub={`${delta(s.mood) >= 0 ? "+" : ""}${delta(s.mood).toFixed(1)} vs baseline`}
                  tone={delta(s.mood) < -0.5 ? "coral" : delta(s.mood) > 0.5 ? "leaf" : "muted"}
                />
                <SignalStat
                  label="Participation"
                  value={`${Math.round((s.participation[s.participation.length - 1] / 10) * 100)}%`}
                  sub={`${delta(s.participation) >= 0 ? "+" : ""}${delta(s.participation).toFixed(1)} vs baseline`}
                  tone={delta(s.participation) < -1 ? "coral" : "muted"}
                />
                <SignalStat
                  label="Missed activities"
                  value={s.status === "Support" ? "4" : s.status === "Watch" ? "1" : "0"}
                  sub="last 7 days"
                  tone={s.status === "Support" ? "coral" : "muted"}
                />
                <SignalStat
                  label="Days observed"
                  value={`${s.mood.length}`}
                  sub="pattern over time"
                  tone="coral"
                />
              </div>

              {/* Section 3 — MindBloom AI Chat */}
              <div className="lg:col-span-4">
                <MindBloomMiniChat studentName={s.name.split(" ")[0]} onActionTaken={() => setStudentStatus("Action Taken")} />
              </div>
            </div>
          </MockCard>
        </section>


        <Dialog open={trisOpen} onOpenChange={setTrisOpen}>
          <DialogContent className="max-w-xl bg-white/95 backdrop-blur">
            <DialogHeader>
              <DialogTitle>TRIS Classroom Recommendation</DialogTitle>
              <DialogDescription>
                Send a trauma-informed classroom activity to the homeroom teacher.
              </DialogDescription>
            </DialogHeader>
            <Textarea rows={7} defaultValue={trisDefault} className="text-sm" />
            <DialogFooter>
              <Button variant="outline" onClick={() => setTrisOpen(false)}>Cancel</Button>
              <Button
                className="bg-sky text-white hover:bg-sky/90"
                onClick={() => {
                  toast.success("TRIS recommendation sent to Homeroom teacher.");
                  setStudentStatus("Action Taken");
                  setTrisOpen(false);
                }}
              >
                Send to Teacher
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 4 · Week Ahead */}
        <section className="mt-6">
          <MockCard className="bg-gradient-to-br from-white via-white to-bloom/5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-sky" />
              <h3 className="text-base font-semibold">{s.name.split(" ")[0]}&apos;s week ahead</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Upcoming events</div>
                <ul className="grid gap-2">
                  {[
                    { label: "Science quiz", day: "Mon", chips: [["Stress","up"],["Focus","down"]] as const },
                    { label: "State testing", day: "Wed", chips: [["Stress","up"],["Sleep","down"]] as const },
                    { label: "Project due", day: "Thu", chips: [["Stress","up"],["Mood","down"]] as const },
                    { label: "Assembly", day: "Fri", chips: [["Energy","down"]] as const },
                  ].map((e) => (
                    <li key={e.label} className="rounded-xl border border-border bg-white px-3 py-2.5 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-semibold">{e.label}</div>
                        <span className="rounded-full border border-sky/30 bg-sky/10 px-2 py-0.5 text-[11px] font-medium text-[oklch(0.42_0.13_230)]">{e.day}</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {e.chips.map(([l, dir]) => (
                          <span key={l} className="inline-flex items-center gap-1 rounded-full border border-coral/30 bg-coral/10 px-2 py-0.5 text-[11px] font-medium text-[oklch(0.45_0.14_30)]">
                            {l} {dir === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Suggested support actions</div>
                <ul className="grid gap-2">
                  {[
                    { icon: Wind, label: "Box breathing before testing", tag: "State testing", benefit: "Stress ↓" },
                    { icon: BookOpen, label: "Journal about what feels heavy", tag: "Project due", benefit: "Mood ↑" },
                    { icon: Moon, label: "Set a sleep goal for the week", tag: "Science quiz", benefit: "Energy ↑" },
                    { icon: HandHelping, label: "Offer help if workload feels too much", tag: "Project due", benefit: "Support ↑" },
                  ].map((a) => (
                    <li key={a.label} className="rounded-xl border border-border bg-white px-3 py-2.5 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <a.icon className="h-3.5 w-3.5 text-bloom" />
                          {a.label}
                        </div>
                        <span className="rounded-full border border-leaf/30 bg-leaf/15 px-2 py-0.5 text-[11px] font-medium text-[oklch(0.4_0.13_165)] whitespace-nowrap">{a.benefit}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">For: {a.tag}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground">
              Calendar and school context help explain patterns, while the counselor decides what support is needed.
            </p>
          </MockCard>
        </section>

        </>)}


        {tab === "queue" && (
        <div className="mt-6 grid gap-5 lg:grid-cols-12">

          <MockCard className="lg:col-span-8">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-semibold">
                Wellness priority queue
                {statusFilter !== "All" && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    · filtered by {statusFilter === "Support" ? "Support Recommended" : statusFilter}
                    <button onClick={() => setStatusFilter("All")} className="ml-2 underline">clear</button>
                  </span>
                )}
              </div>
              <Chip tone="muted">Sorted by signal weight</Chip>
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface-2 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Student</th>
                    <th className="px-3 py-2">Reason</th>
                    <th className="px-3 py-2">Confidence</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(({ st: row, i }) => (
                    <tr
                      key={row.name}
                      onClick={() => setSelected(i)}
                      className={`cursor-pointer border-t border-border transition-colors ${
                        selected === i ? "bg-bloom/5" : "hover:bg-surface-2"
                      }`}
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            name={row.name}
                            color={
                              row.status === "Support"
                                ? "var(--coral)"
                                : row.status === "Watch"
                                  ? "var(--sky)"
                                  : "var(--leaf)"
                            }
                          />
                          <div className="font-medium">{row.name}</div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{row.reason}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-1.5 rounded-full bg-gradient-to-r from-leaf via-sky to-bloom"
                              style={{ width: `${row.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {row.confidence.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Chip tone={STATUS_TONE[row.status]}>{row.status}</Chip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </MockCard>

          <MockCard className="lg:col-span-4">
            <div className="text-sm font-semibold">Counselor notes · {s.name}</div>
            <textarea
              key={s.name}
              defaultValue={s.notes}
              placeholder="Private notes for follow-up…"
              className="mt-2 h-40 w-full rounded-xl border border-border bg-white p-3 text-sm outline-none focus:border-bloom"
            />
            <p className="mt-2 text-[11px] text-muted-foreground">
              MindBloom highlights repeated patterns to support your judgment — it does not diagnose students.
            </p>
          </MockCard>
        </div>
        )}

        {tab === "alerts" && (
        <section className="mt-6">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Support Alerts</h2>
              <p className="text-sm text-muted-foreground">
                Students who may need a supportive check-in.
              </p>
            </div>
            <div className="flex gap-2">
              <Chip tone="coral">
                {alerts.filter((a) => a.status === "New").length} New
              </Chip>
              <Chip tone="sky">
                {alerts.filter((a) => a.status === "Reviewed").length} Reviewed
              </Chip>
              <Chip tone="leaf">
                {alerts.filter((a) => a.status === "Scheduled").length} Scheduled
              </Chip>
            </div>
          </div>

          {alerts.length === 0 ? (
            <MockCard>
              <div className="py-6 text-center text-sm text-muted-foreground">
                No support alerts right now — students' patterns look steady.
              </div>
            </MockCard>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {alerts.map((a) => (
                <SupportAlertCard
                  key={a.id}
                  alert={a}
                  onReview={() => setActiveAlert(a)}
                  onMarkReviewed={() => {
                    updateStatus(a.id, "Reviewed");
                  }}
                  onSchedule={() => {
                    updateStatus(a.id, "Scheduled");
                  }}
                />
              ))}
            </div>
          )}
        </section>
        )}

        {tab === "resources" && (
        <div className="mt-6 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-xl font-semibold">Resources</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Assign trusted tools, videos, and skill-building resources to support students.
            </p>
          </div>

          {/* Featured Resource Hubs */}
          <section className="rounded-2xl border border-border bg-gradient-to-br from-leaf/10 via-white to-sky/10 p-5 shadow-sm">
            <h3 className="mb-4 text-base font-semibold">Featured Resource Hubs</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  t: "AR ConnectNow",
                  d: "Arkansas mental health info and support for students.",
                  icon: "🌱",
                  iconBg: "bg-leaf/15",
                  cta: "Open",
                  url: "https://uamshealth.com/ar-connectnow/",
                },
                {
                  t: "Build Skills",
                  d: "Video-guided breathing, mindfulness, and grounding.",
                  icon: "🧩",
                  iconBg: "bg-sky/15",
                  cta: "Explore",
                  url: "https://uamshealth.com/ar-connectnow/build-skills/",
                },
                {
                  t: "TRIS Support",
                  d: "Trauma-responsive support across Arkansas schools.",
                  icon: "🏫",
                  iconBg: "bg-bloom/15",
                  cta: "Open",
                  url: "https://www.tris-ar.org/",
                },
              ].map((h) => (
                <div key={h.t} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${h.iconBg} text-lg`}>
                    {h.icon}
                  </div>
                  <div className="text-sm font-semibold">{h.t}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{h.d}</p>
                  <a
                    href={h.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-sky px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-sky/90"
                  >
                    {h.cta} ↗
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Suggestions, library, assigned */}
          <AssignResources studentName={s.name} studentStatus={s.status} />

        </div>
        )}




        {showWhy && <WhyModal student={s} onClose={() => setShowWhy(false)} />}
        {activeAlert && (
          <AlertDetailModal
            alert={activeAlert}
            onClose={() => setActiveAlert(null)}
            onActionTaken={() => setStudentStatus("Action Taken")}
            onMarkReviewed={() => {
              updateStatus(activeAlert.id, "Reviewed");
              setActiveAlert(null);
            }}
            onSchedule={() => {
              updateStatus(activeAlert.id, "Scheduled");
              setActiveAlert(null);
            }}
          />
        )}

        <Dialog
          open={urgentAlertOpen}
          onOpenChange={(open) => {
            // Require explicit acknowledgment — ignore outside clicks / ESC closures
            if (!open) return;
            setUrgentAlertOpen(open);
          }}
        >
          <DialogContent
            className="max-w-sm p-6 overflow-hidden [&>button]:hidden border-none shadow-2xl bg-white/95 backdrop-blur-md"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <div className="flex flex-col items-center text-center space-y-4">

              {/* Top Label */}
              <div className="text-[10px] font-bold uppercase tracking-widest text-coral mt-2">
                MindBloom AI Early Warning
              </div>

              {/* Icon */}
              <div className="h-16 w-16 rounded-full bg-coral/10 flex items-center justify-center">
                <span className="text-3xl leading-none">⚠️</span>
              </div>

              {/* Header & Badge */}
              <div className="space-y-3 w-full">
                <DialogTitle className="text-2xl font-bold tracking-tight text-slate-800">
                  Priority Pattern Noticed
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Support signal flagged by MindBloom AI requiring counselor review.
                </DialogDescription>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                  Student: <span className="text-coral">John D.</span>
                </div>
              </div>

              {/* Message Body */}
              <div className="text-sm text-slate-600 leading-relaxed px-2 pb-2">
                <span className="font-bold text-slate-800">MindBloom AI</span> noticed a sustained pattern of elevated stress signals and a ~40% drop in class participation over the last 4 days.
              </div>

              {/* Action Button */}
              <div className="w-full">
                <button
                  onClick={() => {
                    sessionStorage.setItem("mindbloom-urgent-alert", "acknowledged");
                    setUrgentAlertOpen(false);
                    toast.success("Case acknowledged. Added to your priority queue.");
                  }}
                  className="w-full rounded-xl bg-coral px-4 py-3.5 text-sm font-bold text-white shadow-md hover:bg-coral/90 transition-all"
                >
                  Acknowledge & Review Case
                </button>
              </div>

            </div>
          </DialogContent>
        </Dialog>

      </main>
      <Footer />
    </div>
  );
}

function TrendBox({ label, pts, color }: { label: string; pts: number[]; color: string }) {
  const delta = pts[pts.length - 1] - pts[0];
  const data = pts.map((v, i) => ({ i: `D${i + 1}`, [label]: v } as Record<string, string | number>));
  const gid = `tb-${label.replace(/\s+/g, "")}`;
  return (
    <div className="rounded-xl border border-border bg-white p-3 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
        <div className={`text-[11px] font-semibold ${delta < 0 ? "text-coral" : delta > 0 ? "text-leaf-foreground" : "text-muted-foreground"}`}>
          {delta > 0 ? "↑" : delta < 0 ? "↓" : "·"} {Math.abs(delta).toFixed(0)}
        </div>
      </div>
      <div className="mt-1 h-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              cursor={{ stroke: color, strokeOpacity: 0.3, strokeWidth: 1 }}
              contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", fontSize: 11, padding: "4px 8px" }}
              labelStyle={{ display: "none" }}
              formatter={(v: number) => [v, label]}
            />
            <Area
              type="monotone"
              dataKey={label}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gid})`}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


function BaselineStat({
  label,
  value,
  sub,
  tone = "muted",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "muted" | "coral" | "leaf";
}) {
  const subClass =
    tone === "coral"
      ? "text-coral"
      : tone === "leaf"
        ? "text-leaf-foreground"
        : "text-muted-foreground";
  return (
    <div className="rounded-xl border border-border bg-white p-3">
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
      <div className={`text-[11px] ${subClass}`}>{sub}</div>
    </div>
  );
}

function SchoolStat({
  label,
  value,
  sub,
  tone = "muted",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "muted" | "coral" | "leaf";
}) {
  const subClass =
    tone === "coral"
      ? "text-coral"
      : tone === "leaf"
        ? "text-leaf-foreground"
        : "text-muted-foreground";
  return (
    <div className="rounded-xl border border-border bg-white p-3">
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
      <div className={`text-[11px] ${subClass}`}>{sub}</div>
    </div>
  );
}

function SignalStat({
  label,
  value,
  sub,
  tone = "muted",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "muted" | "coral" | "leaf";
}) {
  const subClass =
    tone === "coral" ? "text-coral" : tone === "leaf" ? "text-leaf-foreground" : "text-muted-foreground";
  return (
    <div className="flex flex-1 flex-col justify-between rounded-xl border border-border bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-3xl font-bold leading-tight">{value}</div>
      <div className={`text-sm ${subClass}`}>{sub}</div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function MindBloomMiniChat({ studentName, onActionTaken }: { studentName: string; onActionTaken?: () => void }) {
  type Msg = { role: "user" | "ai"; text: string };
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [concern, setConcern] = useState("Elevated Stress");
  const [recommendation, setRecommendation] = useState("Box Breathing");


  const patternReply = `${studentName}'s recent check-ins and activity patterns suggest a sustained drop from his usual baseline. Mood and participation are lower than expected, while missed activities have increased. This may be a good time for a brief supportive check-in.`;
  const nextStepReply = `Consider a short, low-pressure 1:1 with ${studentName} this week — start by listening, then suggest one calming skill (Box Breathing or Body Scan). Share a gentle, privacy-safe note with family, and revisit the pattern in 1–2 weeks.`;

  const replyFor = (q: string) =>
    /next|do/i.test(q) ? nextStepReply : patternReply;

  const send = (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    setMessages((m) => [...m, { role: "user", text: t }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai", text: replyFor(t) }]);
      setLoading(false);
    }, 2000);
  };

  const suggestions = ["What does this pattern mean?", "What should I do next?"];

  return (
    <div className="flex h-full min-h-[24rem] flex-col rounded-2xl border border-border bg-white">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-bloom/15 to-sky/15">
          <Sparkles className="h-4 w-4 text-bloom" />
        </div>
        <div className="text-sm font-semibold">Ask MindBloom AI</div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-xs">
        {messages.length === 0 && !loading && (
          <div className="space-y-2">
            {suggestions.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="w-full rounded-xl border border-bloom/20 bg-bloom/5 px-3 py-2 text-left text-xs text-foreground/80 transition-colors hover:bg-bloom/10"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[90%] rounded-2xl px-3 py-2 leading-relaxed ${
              m.role === "user"
                ? "ml-auto bg-foreground text-background"
                : "bg-bloom/5 text-foreground/90"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="inline-flex items-center gap-1.5 rounded-2xl bg-bloom/5 px-3 py-2 text-bloom">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bloom" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bloom [animation-delay:120ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bloom [animation-delay:240ms]" />
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-border p-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this data..."
          className="flex-1 rounded-full border border-border bg-surface px-3 py-1.5 text-xs outline-none placeholder:text-muted-foreground focus:border-bloom/40"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="grid h-8 w-8 flex-none place-items-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

      <div className="px-3 pb-3">
        <div className="mt-3 flex flex-col gap-2">
          <button
            onClick={() => setEmailModalOpen(true)}
            className="w-full rounded-xl bg-sky px-4 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95 transition-all flex items-center justify-center gap-2 border border-bloom/30"
          >
            ✨ Draft Parent Update
          </button>
          <button onClick={() => setTeacherModalOpen(true)} className="w-full rounded-xl bg-leaf px-4 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95 transition-all flex items-center justify-center gap-2 border border-leaf/30">🏫 TRIS Classroom Rec</button>
        </div>
      </div>

      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Parent Communication</DialogTitle>
            <DialogDescription>
              Review and edit the update before sending.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="ai-draft" className="w-full mt-2">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="ai-draft">AI Draft</TabsTrigger>
              <TabsTrigger value="custom">Custom Message</TabsTrigger>
            </TabsList>

            <TabsContent value="ai-draft" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Concern</label>
                  <select value={concern} onChange={(e) => setConcern(e.target.value)} className="w-full mt-1.5 rounded-xl border border-border bg-white p-2.5 text-sm outline-none">
                    <option value="Elevated Stress">Elevated Stress</option>
                    <option value="Low Participation">Low Participation</option>
                    <option value="Decreased Mood">Decreased Mood</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Recommendation</label>
                  <select value={recommendation} onChange={(e) => setRecommendation(e.target.value)} className="w-full mt-1.5 rounded-xl border border-border bg-white p-2.5 text-sm outline-none">
                    <option value="Box Breathing">Box Breathing</option>
                    <option value="Sensory Countdown">Sensory Countdown</option>
                    <option value="Take Five Breathing">Take Five Breathing</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Message Draft</label>
                <textarea
                  rows={7}
                  className="w-full mt-1.5 rounded-xl border border-border bg-surface-2/50 p-3 text-sm outline-none resize-none text-foreground/90 focus:border-sky transition-colors"
                  value={`Dear Parent/Guardian,\n\nI am reaching out to share a quick update regarding ${studentName}. We noticed ${studentName} has been experiencing some ${concern.toLowerCase()} this week.\n\nAs a proactive step, we recommend practicing ${recommendation} together this weekend. It is an excellent, evidence-based tool to build emotional resilience.\n\nLet me know if you would like to schedule a brief check-in call.\n\nBest,\nCounselor's Office`}
                  onChange={() => {}}
                />
              </div>
            </TabsContent>

            <TabsContent value="custom">
              <textarea
                rows={10}
                placeholder="Write a direct message to the guardians..."
                className="w-full rounded-xl border border-border bg-surface-2/50 p-3 text-sm outline-none resize-none text-foreground/90 focus:border-sky transition-colors"
              />
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <button
              onClick={() => setEmailModalOpen(false)}
              className="rounded-lg border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-2"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setEmailModalOpen(false);
                toast.success("Email successfully sent to guardians.");
                onActionTaken?.();
              }}
              className="rounded-lg bg-sky px-4 py-2 text-xs font-semibold text-white shadow hover:opacity-95"
            >
              Send Message
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={teacherModalOpen} onOpenChange={setTeacherModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>TRIS Classroom Recommendation</DialogTitle>
            <DialogDescription>
              Send a trauma-informed classroom activity to Sam's homeroom teacher.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Message Draft</label>
            <textarea
              rows={8}
              className="w-full rounded-xl border border-border bg-surface-2/50 p-3 text-sm outline-none resize-none text-foreground/90 focus:border-leaf transition-colors"
              defaultValue={"Hi Mr. Davis (Homeroom),\n\nSam is having a tough week. Instead of singling him out, MindBloom recommends running a 3-minute Sensory Countdown for the entire class today.\n\nThis aligns with our TRIS trauma-informed practices and allows him to regulate alongside his peers. He can lead the exercise on the Smartboard using his dashboard.\n\nThanks,\nCounselor's Office"}
            />
            <p className="text-[11px] text-muted-foreground">
              This will be sent via the district's standard email protocol. The text is fully editable before sending.
            </p>
          </div>

          <DialogFooter className="mt-4">
            <button
              onClick={() => setTeacherModalOpen(false)}
              className="rounded-lg border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-2"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setTeacherModalOpen(false);
                toast.success("TRIS recommendation sent to Homeroom teacher.");
                onActionTaken?.();
              }}
              className="rounded-lg bg-leaf px-4 py-2 text-xs font-semibold text-white shadow hover:opacity-95"
            >
              Send to Teacher
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


/* ───────── AI helpers (mock, no backend) ───────── */

function delta(arr: number[]) {
  if (arr.length < 4) return 0;
  const half = Math.floor(arr.length / 2);
  const a = arr.slice(0, half).reduce((s, n) => s + n, 0) / half;
  const b = arr.slice(half).reduce((s, n) => s + n, 0) / (arr.length - half);
  return b - a;
}

function aiSummary(st: Student): string {
  const first = st.name.split(" ")[0];
  const moodD = delta(st.mood);
  const partD = delta(st.participation);
  const actD = delta(st.activities);
  if (st.status === "Support") {
    return `${first}'s patterns have shifted across several signals over the last ${st.mood.length} check-ins — compared to their own usual baseline. A supportive check-in this week may be helpful.`;
  }
  if (st.status === "Watch") {
    return `${first} is showing a gentle change across ${st.signals.length} signal${st.signals.length === 1 ? "" : "s"} (mood ${moodD >= 0 ? "+" : ""}${moodD.toFixed(1)}, participation ${partD >= 0 ? "+" : ""}${partD.toFixed(1)}). Light-touch monitoring suggested — not a single bad day.`;
  }
  return `${first}'s patterns look steady compared to their usual baseline. Mood ${moodD >= 0 ? "+" : ""}${moodD.toFixed(1)}, activities ${actD >= 0 ? "+" : ""}${actD.toFixed(1)}. Keep encouraging current habits.`;
}

function nextStep(st: Student): string {
  if (st.status === "Support") return `Schedule a supportive check-in with ${st.name.split(" ")[0]} and suggest a short calming activity.`;
  if (st.status === "Watch") return `Send a brief encouraging note; recommend a calming skill (Box Breathing or Body Scan).`;
  return `No action needed — keep encouraging steady habits.`;
}

function WhyModal({ student, onClose }: { student: Student; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-bloom" />
            <h3 className="text-lg font-semibold">Why this suggestion?</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-surface-2">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <div>
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">What changed</div>
            <p className="mt-1 text-muted-foreground">{student.reason}</p>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">Signals used</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {student.signals.map((sig) => <Chip key={sig} tone="bloom">{sig}</Chip>)}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">Pattern length</div>
            <p className="mt-1 text-muted-foreground">Observed across the last {student.mood.length} check-ins — not a single bad day.</p>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">Recommended next step</div>
            <p className="mt-1 text-muted-foreground">{nextStep(student)}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface-2 p-3 text-xs text-muted-foreground">
            MindBloom AI uses wellness pattern data to support students. It does not diagnose students or replace counselor judgment.
          </div>
        </div>
      </div>
    </div>
  );
}

type ChatMsg = { role: "ai" | "user"; text: string };

function answerFor(student: Student, q: string): string {
  const ql = q.toLowerCase();
  const first = student.name.split(" ")[0];
  const sigs = student.signals.join(", ");
  if (/one bad day|single|once/.test(ql)) {
    return `No — this is based on repeated changes across ${student.mood.length} check-ins, not a single bad day. The pattern shows up in multiple signals (${sigs}).`;
  }
  if (/why.*(watch|support|stable)|status|marked/.test(ql)) {
    return `${first} is marked ${student.status} because MindBloom noticed: ${sigs}. Compared to ${first}'s own baseline, these have shifted over the last ${student.mood.length} check-ins.`;
  }
  if (/changed|week|recent/.test(ql)) {
    const md = delta(student.mood).toFixed(1);
    const pd = delta(student.participation).toFixed(1);
    return `Recent shift vs ${first}'s baseline — mood ${md}, participation ${pd}. Most-changed signals: ${sigs}.`;
  }
  if (/signal|matter|most/.test(ql)) {
    return `The most meaningful signals here are: ${sigs}. They repeat across multiple days, which is more useful than a single check-in.`;
  }
  if (/do|next|action|help/.test(ql)) {
    return `Suggested next step: ${nextStep(student)} This is a supportive starting point — your judgment leads the conversation.`;
  }
  return `MindBloom AI noticed repeated changes across several signals for ${first} (${sigs}). ${nextStep(student)}`;
}

const SUGGESTED = [
  "Why is this student marked this status?",
  "What changed this week?",
  "Which signals matter most?",
  "Is this based on more than one bad day?",
];

function StudentAIChat({ student }: { student: Student }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");

  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }, { role: "ai", text: answerFor(student, q) }]);
    setInput("");
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-gradient-to-br from-bloom/10 via-white to-sky/10 p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-bloom to-sky text-white">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="text-sm font-semibold">MindBloom AI</div>
      </div>

      {/* Always-visible insight */}
      <div className="rounded-xl border border-border bg-white/70 p-3">
        <p className="text-xs text-muted-foreground">{aiSummary(student)}</p>
        <div className="mt-2 rounded-lg bg-bloom/5 px-2.5 py-1.5 text-[11px]">
          <span className="font-semibold">Next step: </span>
          <span className="text-muted-foreground">{nextStep(student)}</span>
        </div>
      </div>

      {/* Chat thread */}
      {messages.length > 0 && (
        <div className="mt-3 max-h-44 space-y-2 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${m.role === "user" ? "bg-foreground text-background" : "bg-white/80 text-foreground border border-border"}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SUGGESTED.slice(0, 3).map((q) => (
          <button key={q} onClick={() => send(q)} className="rounded-full border border-border bg-white/70 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground">
            {q}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-3 flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${student.name.split(" ")[0]}…`}
          className="flex-1 bg-transparent text-sm outline-none"
        />
        <button type="submit" className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-background">
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

      <div className="mt-3">
        <ParentCommButton studentName={student.name.split(" ")[0]} />
      </div>



      <p className="mt-2 text-[10px] text-muted-foreground">
        MindBloom AI supports counselor decision-making. It does not diagnose or replace your judgment.
      </p>
    </div>
  );
}

/* ───────── Support Alerts ───────── */

const ALERT_STATUS_TONE: Record<AlertStatus, "coral" | "sky" | "leaf"> = {
  New: "coral",
  Reviewed: "sky",
  Scheduled: "leaf",
};

function SupportAlertCard({
  alert,
  onReview,
  onMarkReviewed,
  onSchedule,
}: {
  alert: SupportAlert;
  onReview: () => void;
  onMarkReviewed: () => void;
  onSchedule: () => void;
}) {
  const isStudent = alert.source === "student";
  const sourceLabel = isStudent ? "Student Requested Check-In" : "MindBloom AI · Early Detection";
  const sourceIcon = isStudent ? "🙋" : "✨";
  const visibleSignals = alert.signals.slice(0, 3);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
        isStudent ? "border-bloom/35" : "border-sky/30"
      }`}
    >
      {/* Source ribbon — distinct color per origin */}
      <div
        className={`flex items-center justify-between px-4 py-2 text-[11px] font-semibold ${
          isStudent
            ? "bg-gradient-to-r from-bloom/15 to-bloom/5 text-[oklch(0.45_0.18_305)]"
            : "bg-gradient-to-r from-sky/15 to-sky/5 text-[oklch(0.42_0.13_230)]"
        }`}
      >
        <span className="inline-flex items-center gap-1.5">
          <span>{sourceIcon}</span>
          {sourceLabel}
        </span>
        {alert.status === "New" ? (
          <Chip tone="coral">New</Chip>
        ) : (
          <Chip tone={alert.status === "Scheduled" ? "leaf" : "sky"}>{alert.status}</Chip>
        )}
      </div>

      <div className="p-5">
        {/* Student */}
        <div className="flex items-center gap-3">
          <Avatar
            name={alert.studentName}
            color={isStudent ? "var(--bloom)" : "var(--sky)"}
          />
          <div className="min-w-0">
            <div className="truncate text-base font-semibold">{alert.studentName}</div>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {alert.reason}
            </p>
          </div>
        </div>

        {/* Signal chips (max 3) */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleSignals.map((sig) => (
            <span
              key={sig}
              className="rounded-full border border-border bg-surface-2/60 px-2.5 py-0.5 text-[11px] font-medium text-foreground/80"
            >
              {sig}
            </span>
          ))}
        </div>

        {/* Recommended next step */}
        <div className="mt-3 rounded-xl border border-leaf/25 bg-leaf/5 px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.4_0.13_165)]">
            Next step
          </div>
          <div className="mt-0.5 text-sm text-foreground/85">{alert.nextStep}</div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={onSchedule}
            disabled={alert.status === "Scheduled"}
            className="rounded-lg bg-sky px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            🤝 Schedule Check-In
          </button>
          <button
            onClick={onReview}
            className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold transition hover:bg-surface-2"
          >
            View details
          </button>
          <button
            onClick={onMarkReviewed}
            disabled={alert.status !== "New"}
            className="ml-auto rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mark reviewed
          </button>
        </div>
      </div>
    </div>
  );
}

function AlertDetailModal({
  alert,
  onClose,
  onMarkReviewed,
  onSchedule,
  onActionTaken,
}: {
  alert: SupportAlert;
  onClose: () => void;
  onMarkReviewed: () => void;
  onSchedule: () => void;
  onActionTaken?: () => void;
}) {
  const [scheduled, setScheduled] = useState(false);
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-bloom" />
            <h3 className="text-lg font-semibold">Support Alert Details</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-surface-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{alert.studentName}</div>
            <div className="flex gap-1.5">
              <Chip tone={alert.source === "student" ? "bloom" : "sky"}>
                {alert.alertType}
              </Chip>
              <Chip tone={ALERT_STATUS_TONE[alert.status]}>{alert.status}</Chip>
            </div>
          </div>

          <Section label="Pattern noticed" text={alert.reason} />
          <div>
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">
              Signals used
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {alert.signals.map((sig) => (
                <Chip key={sig} tone="bloom">
                  {sig}
                </Chip>
              ))}
            </div>
          </div>
          <Section label="Time period" text={alert.timePeriod} />
          <Section
            label="Why this was recommended"
            text={
              alert.source === "student"
                ? `${alert.studentName.split(" ")[0]} asked directly to connect with a trusted adult. Student-initiated requests always create a support alert.`
                : `MindBloom noticed repeated changes across multiple signals, not just one check-in. ${alert.signals.join("; ")}. This pattern repeats across several days compared to this student's usual pattern.`
            }
          />
          <Section label="Recommended next step" text={alert.nextStep} />

          <div className="rounded-xl border border-border bg-surface-2 p-3 text-xs text-muted-foreground">
            🔒 MindBloom shares only the information needed to support the
            student. It does not diagnose students or replace counselor
            judgment.
          </div>

          {scheduled && (
            <div className="rounded-xl border border-leaf/40 bg-leaf/10 p-3 text-xs text-foreground/85">
              ✓ A supportive check-in has been scheduled with{" "}
              {alert.studentName}.
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            onClick={onMarkReviewed}
            disabled={alert.status === "Reviewed" || alert.status === "Scheduled"}
            className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mark as Reviewed
          </button>
          <button
            onClick={() => {
              setScheduled(true);
              setTimeout(onSchedule, 900);
            }}
            disabled={alert.status === "Scheduled" || scheduled}
            className="rounded-lg bg-sky px-4 py-2 text-xs font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
          >
            🤝 Schedule Check-In
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase text-muted-foreground">
        {label}
      </div>
      <p className="mt-1 text-foreground/85">{text}</p>
    </div>
  );
}

const CONCERNS = ["Elevated Stress", "Low Participation", "Decreased Mood"] as const;
const RECOMMENDATIONS = ["Box Breathing", "Sensory Countdown", "Take Five Breathing"] as const;

function buildParentDraft(concern: string, recommendation: string, studentName: string) {
  return `Hi [Parent Name],\n\nI am reaching out from the counselor's office. We noticed ${studentName} has been experiencing some ${concern} this week.\n\nAs a proactive step, we recommend practicing ${recommendation} together this weekend. It is an excellent, evidence-based tool from AR ConnectNow to build emotional resilience.\n\nLet me know if you would like to schedule a brief check-in call.\n\nBest,\n[Counselor Name]`;
}

function ParentCommButton({ studentName }: { studentName: string }) {
  const [open, setOpen] = useState(false);
  const [concern, setConcern] = useState<string>(CONCERNS[0]);
  const [recommendation, setRecommendation] = useState<string>(RECOMMENDATIONS[0]);
  const [aiDraft, setAiDraft] = useState<string>(() =>
    buildParentDraft(CONCERNS[0], RECOMMENDATIONS[0], studentName),
  );
  const [customMsg, setCustomMsg] = useState("");
  const [tab, setTab] = useState("ai");

  function updateConcern(v: string) {
    setConcern(v);
    setAiDraft(buildParentDraft(v, recommendation, studentName));
  }
  function updateRecommendation(v: string) {
    setRecommendation(v);
    setAiDraft(buildParentDraft(concern, v, studentName));
  }

  function handleSend() {
    toast.success("Email successfully sent to guardians.");
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-bloom/60 bg-gradient-to-r from-bloom/10 to-sky/10 px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:from-bloom/20 hover:to-sky/20 hover:shadow-[0_0_22px_-6px_var(--bloom)]"
      >
        <Sparkles className="h-4 w-4 text-bloom" />
        Draft Parent Update
      </button>


      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl bg-white/95 backdrop-blur">
          <DialogHeader>
            <DialogTitle>Parent Communication</DialogTitle>
          </DialogHeader>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ai">AI Draft</TabsTrigger>
              <TabsTrigger value="custom">Custom Message</TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Concern
                  </label>
                  <Select value={concern} onValueChange={updateConcern}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONCERNS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Recommendation
                  </label>
                  <Select value={recommendation} onValueChange={updateRecommendation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RECOMMENDATIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Textarea
                rows={7}
                value={aiDraft}
                onChange={(e) => setAiDraft(e.target.value)}
              />
            </TabsContent>

            <TabsContent value="custom">
              <Textarea
                rows={9}
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Write a direct message to the guardians..."
              />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend}>Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


