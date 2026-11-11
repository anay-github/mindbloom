import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Pencil, Sparkles, Lock, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Chip, MockCard } from "@/components/mindbloom/ui-bits";
import {
  ACTIVITIES,
  Activity,
  Category,
  CATEGORIES,
  CATEGORY_ICON,
  DIFFICULTIES,
  Difficulty,
  Prefs,
  Theme,
  THEMES,
  advanceQuests,
  buildPathway,
  emptyQuestProgress,
  levelInfo,
  pickDailyQuests,
  prioritize,
  QuestProgress,
  STORAGE_KEYS,
  useLocalState,
  usePrefs,
  DEFAULT_PREFS,
} from "@/lib/build-skills/data";

/* ───────── Personalization Dialog ───────── */

function PrefsPill<T extends string>({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
        active
          ? "border-bloom bg-bloom/15 text-[oklch(0.4_0.18_305)] shadow-sm"
          : "border-border bg-white text-muted-foreground hover:border-bloom/40 hover:bg-bloom/5"
      }`}
    >
      {children}
    </button>
  );
}

export function PersonalizationDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: Prefs | null;
  onSave: (p: Prefs) => void;
}) {
  const [draft, setDraft] = useState<Prefs>(initial ?? DEFAULT_PREFS);
  useEffect(() => {
    if (open) setDraft(initial ?? DEFAULT_PREFS);
  }, [open, initial]);

  const toggle = <K extends keyof Prefs>(key: K, value: Prefs[K][number]) => {
    setDraft((d) => {
      const list = d[key] as string[];
      const next = list.includes(value as string)
        ? list.filter((v) => v !== value)
        : [...list, value as string];
      return { ...d, [key]: next } as Prefs;
    });
  };

  const canSave =
    draft.themes.length > 0 &&
    draft.difficulties.length > 0 &&
    draft.categories.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto !bg-white border border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-bloom" />
            Personalize Your Build Skills Path
          </DialogTitle>
          <DialogDescription className="sr-only">Personalize your Build Skills path</DialogDescription>

        </DialogHeader>

        <div className="mt-2 space-y-5">
          <div>
            <h4 className="mb-2 text-sm font-semibold">Theme</h4>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((t) => (
                <PrefsPill key={t} active={draft.themes.includes(t)} onClick={() => toggle("themes", t)}>
                  {t}
                </PrefsPill>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">Activity Difficulty</h4>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((d) => (
                <PrefsPill
                  key={d}
                  active={draft.difficulties.includes(d)}
                  onClick={() => toggle("difficulties", d)}
                >
                  {d}
                </PrefsPill>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">Preferred Activities</h4>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <PrefsPill
                  key={c}
                  active={draft.categories.includes(c)}
                  onClick={() => toggle("categories", c)}
                >
                  <span className="mr-1">{CATEGORY_ICON[c]}</span>
                  {c}
                </PrefsPill>
              ))}
            </div>
          </div>

          <button
            disabled={!canSave}
            onClick={() => {
              onSave(draft);
              onOpenChange(false);
              toast.success("Your Build Skills path is ready 🌱");
            }}
            className="w-full rounded-xl bg-gradient-to-r from-bloom to-sky px-4 py-3 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
          >
            Build My Path
          </button>
          {!canSave && (
            <p className="text-center text-xs text-muted-foreground">
              Pick at least one option in every section.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── Interactive players ───────── */

function BreathingPlayer({
  minutes,
  onComplete,
  activityId,
}: {
  minutes: number;
  onComplete: () => void;
  activityId?: string;
}) {
  const isCountedExhale = activityId === "counted-exhale";
  type Phase = "in" | "hold" | "out" | "hold2";
  const SEQUENCE: Phase[] = isCountedExhale ? ["in", "hold", "out"] : ["in", "hold", "out", "hold2"];
  const PHASE_DUR: Record<Phase, number> = isCountedExhale
    ? { in: 4, hold: 2, out: 6, hold2: 0 }
    : { in: 4, hold: 4, out: 4, hold2: 4 };
  const PHASE_LABEL: Record<Phase, string> = {
    in: "Breathe in",
    hold: "Hold",
    out: "Breathe out",
    hold2: "Hold",
  };
  const totalCycles = isCountedExhale ? 1 : Math.max(3, Math.round((minutes * 60) / 16));
  const cycleDur = SEQUENCE.reduce((s, p) => s + PHASE_DUR[p], 0);
  const totalDur = cycleDur * totalCycles;

  const [cycle, setCycle] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const phase: Phase = SEQUENCE[stepIdx];

  useEffect(() => {
    if (cycle >= totalCycles) return;
    const id = setTimeout(() => {
      setStepIdx((i) => {
        const next = i + 1;
        if (next >= SEQUENCE.length) {
          setCycle((c) => c + 1);
          return 0;
        }
        return next;
      });
    }, PHASE_DUR[phase] * 1000);
    return () => clearTimeout(id);
  }, [stepIdx, cycle, totalCycles, phase]);

  useEffect(() => {
    if (cycle >= totalCycles) {
      setElapsed(totalDur);
      onComplete();
      return;
    }
    const start = Date.now();
    const base = elapsed;
    const id = setInterval(() => {
      const e = Math.min(totalDur, base + (Date.now() - start) / 1000);
      setElapsed(e);
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx, cycle]);

  const targetScale = phase === "in" ? 1.3 : phase === "out" ? 0.7 : phase === "hold" ? 1.3 : 0.7;
  const [scale, setScale] = useState(0.7);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setScale(targetScale));
    return () => cancelAnimationFrame(raf);
  }, [targetScale]);

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="relative grid h-44 w-44 place-items-center">
        <div
          className="h-32 w-32 rounded-full bg-gradient-to-br from-bloom/40 to-sky/40 shadow-inner transition-transform"
          style={{ transform: `scale(${scale})`, transitionDuration: `${PHASE_DUR[phase]}s`, transitionTimingFunction: "ease-in-out" }}
        />
        <div className="absolute text-base font-semibold text-foreground">{PHASE_LABEL[phase]}</div>
      </div>
      <div className="text-xs text-muted-foreground">
        Cycle {Math.min(cycle + 1, totalCycles)} of {totalCycles}
      </div>
      <Progress value={Math.min(100, (elapsed / totalDur) * 100)} className="w-full" />
    </div>
  );
}

function MindfulnessPlayer({ steps, onComplete }: { steps: string[]; onComplete: () => void }) {
  const [i, setI] = useState(0);
  return (
    <div className="space-y-4 py-2">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-sky/10 to-bloom/5 p-6 text-center">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Step {i + 1} of {steps.length}</div>
        <p className="mt-2 text-base font-medium">{steps[i]}</p>
      </div>
      <Progress value={((i + 1) / steps.length) * 100} />
      <button
        onClick={() => {
          if (i + 1 >= steps.length) onComplete();
          else setI(i + 1);
        }}
        className="w-full rounded-xl bg-bloom px-4 py-2.5 text-sm font-semibold text-white shadow"
      >
        {i + 1 >= steps.length ? "I'm done" : "Next"}
      </button>
    </div>
  );
}

function GroundingPlayer({ prompts, onComplete }: { prompts: string[]; onComplete: () => void }) {
  const [done, setDone] = useState<boolean[]>(prompts.map(() => false));
  const allDone = done.every(Boolean);
  useEffect(() => {
    if (allDone) onComplete();
  }, [allDone, onComplete]);
  return (
    <div className="space-y-3 py-2">
      <ul className="space-y-2">
        {prompts.map((p, i) => (
          <li key={i}>
            <button
              onClick={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                done[i] ? "border-leaf bg-leaf/10" : "border-border bg-white hover:border-sky/50"
              }`}
            >
              <span
                className={`grid h-6 w-6 flex-none place-items-center rounded-full border-2 ${
                  done[i] ? "border-leaf bg-leaf text-white" : "border-border bg-white"
                }`}
              >
                {done[i] && <Check className="h-4 w-4" />}
              </span>
              <span className={done[i] ? "line-through text-muted-foreground" : ""}>{p}</span>
            </button>
          </li>
        ))}
      </ul>
      <Progress value={(done.filter(Boolean).length / done.length) * 100} />
    </div>
  );
}

function JournalingPlayer({ prompt, onComplete }: { prompt: string; onComplete: () => void }) {
  const [text, setText] = useState("");
  return (
    <div className="space-y-3 py-2">
      <div className="rounded-xl border border-border bg-gradient-to-br from-bloom/10 to-white p-4 text-sm">
        <span className="font-semibold">Prompt:</span> {prompt}
      </div>
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write whatever feels right. Only you can see this."
          className="h-32 w-full resize-none rounded-xl border border-border bg-white p-3 pr-10 text-sm outline-none focus:border-bloom"
        />
        <button
          type="button"
          onClick={() => toast("🎤 Voice journaling — coming soon")}
          className="absolute right-2 top-2 rounded-full border border-border bg-white p-1.5 text-muted-foreground hover:text-bloom"
          aria-label="Voice journal"
        >
          <Mic className="h-4 w-4" />
        </button>
      </div>
      <button
        disabled={text.trim().length < 5}
        onClick={onComplete}
        className="w-full rounded-xl bg-bloom px-4 py-2.5 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
      >
        Save entry
      </button>
    </div>
  );
}

function StressResetPlayer({ minutes, onComplete }: { minutes: number; onComplete: () => void }) {
  const steps = ["Breathe in slowly", "Move and release tension", "Soften your shoulders", "Notice how you feel"];
  const [i, setI] = useState(0);
  const [secs, setSecs] = useState(Math.max(15, Math.round((minutes * 60) / steps.length)));
  useEffect(() => {
    if (i >= steps.length) return;
    if (secs <= 0) {
      if (i + 1 >= steps.length) onComplete();
      else {
        setI(i + 1);
        setSecs(Math.max(15, Math.round((minutes * 60) / steps.length)));
      }
      return;
    }
    const id = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secs, i, minutes, onComplete]);
  return (
    <div className="space-y-3 py-2">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-coral/10 to-bloom/5 p-6 text-center">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Step {i + 1} of {steps.length}</div>
        <p className="mt-2 text-base font-medium">{steps[i]}</p>
        <div className="mt-3 text-2xl font-bold text-bloom">{secs}s</div>
      </div>
      <Progress value={(i / steps.length) * 100 + ((1 - secs / 30) / steps.length) * 100} />
    </div>
  );
}

function EmotionRegPlayer({ onComplete }: { onComplete: () => void }) {
  const emotions = ["😌 Calm", "😟 Worried", "😤 Frustrated", "😢 Sad", "😊 Glad", "😴 Tired"];
  const strategies = ["Take 3 slow breaths", "Talk to a trusted person", "Move your body", "Write it out", "Listen to music"];
  const [emotion, setEmotion] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [strategy, setStrategy] = useState<string | null>(null);
  const ready = emotion && strategy;
  return (
    <div className="space-y-4 py-2">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">How are you feeling?</div>
        <div className="flex flex-wrap gap-2">
          {emotions.map((e) => (
            <PrefsPill key={e} active={emotion === e} onClick={() => setEmotion(e)}>
              {e}
            </PrefsPill>
          ))}
        </div>
      </div>
      {emotion && (
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Intensity</span>
            <span className="text-bloom">{intensity}/10</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={intensity}
            onChange={(e) => setIntensity(+e.target.value)}
            className="w-full accent-[oklch(0.65_0.18_305)]"
          />
        </div>
      )}
      {emotion && (
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pick a coping step</div>
          <div className="flex flex-wrap gap-2">
            {strategies.map((s) => (
              <PrefsPill key={s} active={strategy === s} onClick={() => setStrategy(s)}>
                {s}
              </PrefsPill>
            ))}
          </div>
        </div>
      )}
      <button
        disabled={!ready}
        onClick={onComplete}
        className="w-full rounded-xl bg-bloom px-4 py-2.5 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
      >
        Try this step
      </button>
    </div>
  );
}

/* ───────── Activity Dialog ───────── */

function getInteractive(act: Activity, onComplete: () => void) {
  switch (act.category) {
    case "Breathing":
      return <BreathingPlayer minutes={act.minutes} onComplete={onComplete} activityId={act.id} />;
    case "Mindfulness":
      return (
        <MindfulnessPlayer
          steps={[
            "Settle in and take one slow breath",
            act.description,
            "Notice without judgment",
            "Take one more slow breath before ending",
          ]}
          onComplete={onComplete}
        />
      );
    case "Grounding":
      return (
        <GroundingPlayer
          prompts={[
            "Notice 3 things you can see",
            "Notice 2 things you can hear",
            "Notice 1 thing you can feel",
            "Take one slow breath",
          ]}
          onComplete={onComplete}
        />
      );
    case "Journaling":
      return <JournalingPlayer prompt={act.description} onComplete={onComplete} />;
    case "Stress Reset":
      return <StressResetPlayer minutes={act.minutes} onComplete={onComplete} />;
    case "Emotional Regulation":
      return <EmotionRegPlayer onComplete={onComplete} />;
  }
}

function ActivityDialog({
  activity,
  open,
  onClose,
  onFinish,
}: {
  activity: Activity | null;
  open: boolean;
  onClose: () => void;
  onFinish: (a: Activity) => void;
}) {
  const [completed, setCompleted] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (open) {
      setCompleted(false);
      setCelebrate(false);
    }
  }, [open, activity?.id]);

  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        {celebrate ? (
          <div className="py-6 text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-leaf/30 to-bloom/30 text-4xl shadow-inner">
              🌟
            </div>
            <h3 className="mt-4 text-lg font-bold">Skill complete!</h3>
            <p className="mt-1 text-sm text-muted-foreground">You earned {activity.xp} XP.</p>
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-xl bg-bloom px-4 py-2.5 text-sm font-semibold text-white shadow"
            >
              Continue
            </button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{CATEGORY_ICON[activity.category]} {activity.category}</span>
                <span>·</span>
                <span>{activity.theme}</span>
                <span>·</span>
                <span>{activity.difficulty}</span>
                <span>·</span>
                <span>{activity.minutes} min</span>
              </div>
              <DialogTitle className="mt-1">{activity.title}</DialogTitle>
              <DialogDescription>{activity.description}</DialogDescription>
            </DialogHeader>

            {getInteractive(activity, () => setCompleted(true))}

            <button
              disabled={!completed}
              onClick={() => {
                onFinish(activity);
                setCelebrate(true);
              }}
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-bloom to-sky px-4 py-3 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
            >
              Finish and Earn {activity.xp} XP
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ───────── Pathway ───────── */

type NodeState = "completed" | "current" | "available" | "locked";

function PathNode({
  state,
  icon,
  label,
  onClick,
  offset,
}: {
  state: NodeState;
  icon: string;
  label?: string;
  onClick: () => void;
  offset: number;
}) {
  const ring =
    state === "current"
      ? "ring-4 ring-bloom/30 border-bloom bg-gradient-to-br from-bloom/30 to-sky/20"
      : state === "completed"
        ? "border-leaf bg-gradient-to-br from-leaf/30 to-leaf/10"
        : state === "available"
          ? "border-sky bg-gradient-to-br from-sky/20 to-white hover:scale-105"
          : "border-border bg-surface-2 opacity-60";

  return (
    <div className="relative flex flex-col items-center" style={{ transform: `translateX(${offset}px)` }}>
      {state === "current" && label && (
        <div className="mb-1.5 rounded-md bg-foreground px-2.5 py-1 text-xs font-bold tracking-wider text-background shadow-sm">
          {label}
        </div>
      )}
      <button
        onClick={onClick}
        disabled={state === "locked"}
        className={`grid h-24 w-24 place-items-center rounded-full border-2 text-4xl shadow-md transition-all ${ring}`}
        aria-label={state === "locked" ? "Locked activity" : "Open activity"}
      >
        {state === "completed" ? (
          <Check className="h-11 w-11 text-leaf" strokeWidth={3} />
        ) : state === "locked" ? (
          <Lock className="h-8 w-8 text-muted-foreground" />
        ) : (
          <span>{icon}</span>
        )}
      </button>

    </div>
  );
}

function ChestNode({ unlocked }: { unlocked: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`grid h-20 w-28 place-items-center rounded-xl border-2 text-4xl shadow ${
          unlocked
            ? "border-[oklch(0.75_0.15_70)] bg-gradient-to-br from-[oklch(0.92_0.12_75)] to-[oklch(0.82_0.13_55)]"
            : "border-border bg-surface-2 opacity-60"
        }`}
      >
        🎁
      </div>
      <span className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Bloom reward
      </span>

    </div>
  );
}

/* ───────── Right rail ───────── */

function LevelCard({ xp }: { xp: number }) {
  const info = levelInfo(xp);
  return (
    <MockCard className="bg-gradient-to-br from-bloom/10 via-white to-sky/10">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Level</div>
        <Chip tone="bloom">Lvl {info.level}</Chip>
      </div>
      <div className="mt-2 text-lg font-bold">{info.name}</div>
      <div className="mt-3">
        <Progress value={info.pct} />
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>{xp} XP</span>
          <span>{info.isMax ? "Max" : `${info.nextThreshold} XP`}</span>
        </div>
      </div>
    </MockCard>
  );
}

function QuestRow({ quest, progress }: { quest: ReturnType<typeof pickDailyQuests>[0]; progress: number }) {
  const capped = Math.min(progress, quest.goal);
  const done = capped >= quest.goal;
  return (
    <li>
      <div
        className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${
          done ? "border-bloom/30 bg-bloom/5" : "border-border bg-white"
        }`}
      >
        <div
          className={`grid h-9 w-9 flex-none place-items-center rounded-full text-base ${
            done ? "bg-bloom/15" : "bg-surface-2"
          }`}
        >
          {done ? <Check className="h-4 w-4 text-bloom" /> : quest.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={`truncate text-sm font-semibold ${
              done ? "text-muted-foreground line-through" : ""
            }`}
          >
            {quest.title}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Progress value={(capped / quest.goal) * 100} className="h-1.5 flex-1" />
            <span className="flex-none text-[10px] text-muted-foreground">
              {capped}/{quest.goal}
            </span>
          </div>
        </div>
        <span className="flex-none rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
          +25 XP
        </span>
      </div>
    </li>
  );
}

function QuestsCard({ progress }: { progress: QuestProgress }) {
  const quests = useMemo(() => pickDailyQuests(new Date().toDateString()), []);
  const completedNum = quests.filter((q) => (progress[q.id]?.progress ?? 0) >= q.goal).length;
  return (
    <MockCard>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weekly Quests</div>
        <Chip tone="sky">
          {completedNum}/{quests.length}
        </Chip>
      </div>
      <ul className="mt-3 space-y-2.5">
        {quests.map((q) => (
          <QuestRow key={q.id} quest={q} progress={progress[q.id]?.progress ?? 0} />
        ))}
      </ul>
    </MockCard>
  );
}


type DailyQuest = { id: string; title: string; xp: number; icon: string };
const DAILY_QUESTS: DailyQuest[] = [
  { id: "checkin", title: "Complete today's check-in", xp: 10, icon: "✅" },
  { id: "journal", title: "Complete a Journal Entry", xp: 15, icon: "📓" },
  { id: "first-reward", title: "Reach the first Bloom Reward", xp: 5, icon: "🎁" },
];

function DailyQuestsCard({
  completedCount,
  onXpEarned,
}: {
  completedCount: number;
  onXpEarned?: (xp: number) => void;
}) {
  const todayKey = `mb_daily_quests_${new Date().toDateString()}`;
  const [done, setDone] = useLocalState<string[]>(todayKey, []);
  const doneSet = new Set(done);

  useEffect(() => {
    if (completedCount >= 5 && !doneSet.has("first-reward")) {
      const quest = DAILY_QUESTS.find((q) => q.id === "first-reward")!;
      setDone([...done, "first-reward"]);
      onXpEarned?.(quest.xp);
      toast(`+${quest.xp} XP — ${quest.title} 🎉`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedCount]);

  const toggle = (q: DailyQuest) => {
    if (doneSet.has(q.id)) return;
    if (q.id === "first-reward") {
      toast("Unlock the first chest on your path to earn this 🌱");
      return;
    }
    setDone([...done, q.id]);
    onXpEarned?.(q.xp);
    toast(`+${q.xp} XP — ${q.title} 🌸`);
  };

  const completedNum = done.filter((id) => DAILY_QUESTS.some((q) => q.id === id)).length;

  return (
    <MockCard>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Daily Quests
        </div>
        <Chip tone="bloom">
          {completedNum}/{DAILY_QUESTS.length}
        </Chip>
      </div>
      <ul className="mt-3 space-y-2.5">
        {DAILY_QUESTS.map((q) => {
          const isDone = doneSet.has(q.id);
          return (
            <li key={q.id}>
              <button
                type="button"
                onClick={() => toggle(q)}
                disabled={isDone}
                className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                  isDone
                    ? "border-bloom/30 bg-bloom/5"
                    : "border-border bg-white hover:border-bloom/40 hover:bg-bloom/[0.03]"
                }`}
              >
                <div
                  className={`grid h-9 w-9 flex-none place-items-center rounded-full text-base ${
                    isDone ? "bg-bloom/15" : "bg-surface-2"
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4 text-bloom" /> : q.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`truncate text-sm font-semibold ${
                      isDone ? "text-muted-foreground line-through" : ""
                    }`}
                  >
                    {q.title}
                  </div>
                </div>
                <span className="flex-none rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  +{q.xp} XP
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </MockCard>
  );
}

/* ───────── Main section ───────── */

export function BuildSkillsSection({
  onXpEarned,
}: {
  onXpEarned?: (xp: number) => void;
}) {
  const { prefs, setPrefs, hasPrefs } = usePrefs();
  const [completed, setCompleted] = useLocalState<string[]>(STORAGE_KEYS.COMPLETED, []);
  const [xp, setXp] = useLocalState<number>(STORAGE_KEYS.XP, 120);
  const [quests, setQuests] = useLocalState<QuestProgress>(STORAGE_KEYS.QUESTS, emptyQuestProgress());

  const [prefsOpen, setPrefsOpen] = useState(false);
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  const pathRef = useRef<HTMLDivElement>(null);

  // Open personalization on first visit
  useEffect(() => {
    if (!hasPrefs) setPrefsOpen(true);
  }, [hasPrefs]);

  const orderedActivities = useMemo(
    () => prioritize(ACTIVITIES, prefs ?? DEFAULT_PREFS),
    [prefs],
  );
  const pathway = useMemo(() => buildPathway(orderedActivities), [orderedActivities]);

  const completedSet = useMemo(() => new Set(completed), [completed]);

  const currentIndex = useMemo(() => {
    for (let i = 0; i < orderedActivities.length; i++) {
      if (!completedSet.has(orderedActivities[i].id)) return i;
    }
    return orderedActivities.length;
  }, [orderedActivities, completedSet]);

  // Merge persisted quest progress with current quest shape so any newly added
  // quest IDs (or older saved data missing keys) don't break tracking.
  const safeQuests = useMemo<QuestProgress>(
    () => ({ ...emptyQuestProgress(), ...quests }),
    [quests],
  );

  const handleFinish = (act: Activity) => {
    if (!completedSet.has(act.id)) {
      const dailyQuests = pickDailyQuests(new Date().toDateString());
      const nextQuests = advanceQuests(safeQuests, act);
      let bonusXp = 0;
      for (const q of dailyQuests) {
        const before = safeQuests[q.id]?.progress ?? 0;
        const after = nextQuests[q.id]?.progress ?? 0;
        if (before < q.goal && after >= q.goal) {
          bonusXp += 25;
          toast(`+25 XP — Weekly Quest complete! ${q.icon}`);
        }
      }
      setCompleted([...completed, act.id]);
      setXp(xp + act.xp + bonusXp);
      setQuests(nextQuests);
      onXpEarned?.(act.xp + bonusXp);
    }
  };



  const nodeState = (act: Activity, idx: number): NodeState => {
    if (completedSet.has(act.id)) return "completed";
    if (idx === currentIndex) return "current";
    if (idx < currentIndex) return "available";
    return "locked";
  };

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-5">
      {/* Pathway */}
      <div className="lg:col-span-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Build Skills Path</h2>
            <p className="text-xs text-muted-foreground">
              One skill at a time. Personalized to what you picked.
            </p>
          </div>
          <button
            onClick={() => setPrefsOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-bloom/50 hover:text-bloom"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Preferences
          </button>
        </div>

        <MockCard className="bg-gradient-to-b from-white via-bloom/[0.03] to-sky/5">
          <div ref={pathRef} className="relative py-4">
            <div className="flex flex-col items-center gap-6">
              {pathway.map((item, i) => {
                if (item.kind === "chest") {
                  return (
                    <div key={`chest-${item.chestIndex}`} className="flex flex-col items-center">
                      <ChestNode unlocked={currentIndex > (item.chestIndex + 1) * 5 - 1} />
                    </div>
                  );
                }
                const offset = Math.sin(item.activityIndex * 0.9) * 70;
                const state = nodeState(item.activity, item.activityIndex);
                return (
                  <div key={item.activity.id} className="flex w-full flex-col items-center">
                    <PathNode
                      state={state}
                      icon={CATEGORY_ICON[item.activity.category]}
                      label={state === "current" ? "START" : undefined}
                      offset={offset}
                      onClick={() => {
                        if (state === "locked") {
                          toast("Finish the current activity first 🌱");
                          return;
                        }
                        setActiveActivity(item.activity);
                      }}
                    />
                    <div
                      className="mt-2 max-w-[200px] text-center text-sm font-semibold text-foreground"
                      style={{ transform: `translateX(${offset}px)` }}
                    >
                      {item.activity.title}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </MockCard>
      </div>

      {/* Right rail */}
      <div className="space-y-4 lg:col-span-2">
        <div className="lg:sticky lg:top-24 space-y-4">
          <LevelCard xp={xp} />
          <DailyQuestsCard completedCount={completed.length} onXpEarned={(amt) => { setXp(xp + amt); onXpEarned?.(amt); }} />
          <QuestsCard progress={safeQuests} />

        </div>
      </div>

      <PersonalizationDialog
        open={prefsOpen}
        onOpenChange={setPrefsOpen}
        initial={prefs}
        onSave={setPrefs}
      />

      <ActivityDialog
        activity={activeActivity}
        open={!!activeActivity}
        onClose={() => setActiveActivity(null)}
        onFinish={handleFinish}
      />
    </div>
  );
}
