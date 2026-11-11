import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Lottie from "lottie-react";
import { Mic, Calendar, Sparkles, Wind, BookOpen, Moon, HandHeart, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Nav } from "@/components/mindbloom/Nav";
import { Footer } from "@/components/mindbloom/Footer";
import googleLogo from "@/assets/google.png.asset.json";
import appleLogo from "@/assets/apple.png.asset.json";
import outlookLogo from "@/assets/outlook.png.asset.json";
import appleWatchLogo from "@/assets/apple-logo.png.asset.json";
import whoopLogo from "@/assets/whoop-logo.png.asset.json";
import fitbitLogo from "@/assets/fitbit-logo.png.asset.json";
import { Chip, MockCard } from "@/components/mindbloom/ui-bits";
import { CalendarContextCard, ContextDisclaimer } from "@/components/mindbloom/ContextSignals";
import { BackButton } from "@/components/mindbloom/BackButton";
import { PixelAccent } from "@/components/mindbloom/PixelAccent";
import { useHistoryState } from "@/hooks/useHistoryState";
import { BuildSkillsSection } from "@/components/mindbloom/build-skills/BuildSkillsSection";
import { BuildSkillsPrefsEditor, BuildSkillsCategoriesEditor } from "@/components/mindbloom/build-skills/PrefsEditors";
import {
  usePrefs,
  THEMES,
  DIFFICULTIES,
  CATEGORIES as BS_CATEGORIES,
  CATEGORY_ICON,
  DEFAULT_PREFS,
  type Theme,
  type Difficulty,
  type Category,
} from "@/lib/build-skills/data";
import { requestCounselorCheckIn } from "@/lib/support-alerts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
  Cell,
  Legend,
} from "recharts";

export const Route = createFileRoute("/student-dashboard")({
  head: () => ({
    meta: [
      { title: "Student dashboard — MindBloom" },
      {
        name: "description",
        content:
          "A calm, positive daily wellness dashboard with check-ins, skill practice, streaks, and a personal Bloom garden.",
      },
      { property: "og:title", content: "Student dashboard — MindBloom" },
      {
        property: "og:description",
        content: "Daily check-ins, calming skills, private progress, and supportive resources for students.",
      },
    ],
  }),
  component: StudentDashboard,
});

type SkillCategory = "Breathing" | "Mindfulness" | "Relaxation" | "Grounding" | "Body Awareness";
type Audience = "Teen" | "Younger";
type SkillKind =
  | "box"
  | "balloon"
  | "take5"
  | "sensory"
  | "green"
  | "body"
  | "muscle"
  | "pizza"
  | "squeeze"
  | "yoga"
  | "color"
  | "glitter";

type Skill = {
  id: SkillKind;
  name: string;
  category: SkillCategory;
  audience: Audience;
  minutes: number;
  bestFor: string;
  xp: number;
  icon: string;
  short: string;
  steps: string[];
  video?: string;
  classroomFriendly?: boolean;
};

const SKILLS: Skill[] = [
  {
    id: "box",
    name: "Box Breathing",
    category: "Breathing",
    audience: "Teen",
    minutes: 3,
    bestFor: "",
    xp: 15,
    icon: "🟦",
    short: "Inhale 4 · Hold 4 · Exhale 4 · Hold 4",
    steps: [
      "Inhale slowly through your nose (4 sec)",
      "Hold gently (4 sec)",
      "Exhale through your mouth (4 sec)",
      "Hold (4 sec) — then repeat",
    ],
    video: "https://youtu.be/Dfkw9DF1KWE",
    classroomFriendly: true,
  },
  {
    id: "balloon",
    name: "Balloon Breathing",
    category: "Breathing",
    audience: "Teen",
    minutes: 2,
    bestFor: "Calm",
    xp: 15,
    icon: "🎈",
    short: "Imagine inflating a calm balloon.",
    steps: [
      "Place hands on your belly",
      "Inhale slowly — feel the balloon fill",
      "Pause for a moment",
      "Exhale gently — feel it shrink",
      "Repeat for a few slow breaths",
    ],
    video: "https://youtu.be/Aek1YycYG8Y",
  },
  {
    id: "take5",
    name: "Take Five Breathing",
    category: "Breathing",
    audience: "Younger",
    minutes: 2,
    bestFor: "Calm",
    xp: 10,
    icon: "🖐️",
    short: "Trace your hand with slow breaths.",
    steps: [
      "Thumb — breathe in, then out",
      "Index — breathe in, then out",
      "Middle — breathe in, then out",
      "Ring — breathe in, then out",
      "Pinky — breathe in, then out",
    ],
    video: "https://youtu.be/aXSOXrcM584",
    classroomFriendly: true,
  },
  {
    id: "pizza",
    name: "Pizza Breathing",
    category: "Breathing",
    audience: "Younger",
    minutes: 2,
    bestFor: "Calm",
    xp: 10,
    icon: "🍕",
    short: "Smell the pizza · cool the pizza.",
    steps: [
      "Imagine a warm slice of pizza",
      "Smell it — slow breath in through your nose",
      "Cool it — gentle breath out through your mouth",
      "Smell again — slow in",
      "Cool again — slow out",
    ],
    video: "https://youtu.be/x9-BhnEcr6c",
  },
  {
    id: "sensory",
    name: "Sensory Countdown",
    category: "Grounding",
    audience: "Teen",
    minutes: 3,
    bestFor: "Grounding",
    xp: 20,
    icon: "🌈",
    short: "5–4–3–2–1 to find the present.",
    steps: [
      "5 things you can see",
      "4 things you can feel",
      "3 things you can hear",
      "2 things you can smell",
      "1 thing you notice about yourself",
    ],
    video: "https://youtu.be/G9ecRiwtqWM",
    classroomFriendly: true,
  },
  {
    id: "green",
    name: "Look for Green",
    category: "Grounding",
    audience: "Teen",
    minutes: 2,
    bestFor: "Grounding",
    xp: 15,
    icon: "🍃",
    short: "Spot every green thing nearby.",
    steps: [
      "Find a green object",
      "Find another green object",
      "Find a third green object",
      "Find a fourth green object",
      "Find one more — take a slow breath",
    ],
    video: "https://youtu.be/TPvLRIYdoj0",
    classroomFriendly: true,
  },
  {
    id: "color",
    name: "Color Quest",
    category: "Grounding",
    audience: "Younger",
    minutes: 2,
    bestFor: "Grounding",
    xp: 10,
    icon: "🎨",
    short: "Find a calming color around you.",
    steps: [
      "Find something blue",
      "Find something green",
      "Find something soft and warm",
      "Find your favorite color",
      "Take one slow breath",
    ],
    video: "https://youtu.be/atX4qLoM9Fk",
  },
  {
    id: "body",
    name: "Body Scan",
    category: "Body Awareness",
    audience: "Teen",
    minutes: 5,
    bestFor: "Sleep & calm",
    xp: 25,
    icon: "🧘",
    short: "Notice each part of your body.",
    steps: [
      "Notice your feet",
      "Notice your legs",
      "Notice your belly and chest",
      "Notice your arms and hands",
      "Notice your shoulders, neck, and face",
    ],
    video: "https://youtu.be/fNDwzi20d2Q",
    classroomFriendly: true,
  },
  {
    id: "muscle",
    name: "Muscle Tension & Release",
    category: "Relaxation",
    audience: "Teen",
    minutes: 4,
    bestFor: "Stress reset",
    xp: 20,
    icon: "💪",
    short: "Tense and release each muscle group.",
    steps: [
      "Squeeze your fists — then release",
      "Tense your shoulders — then release",
      "Tense your legs — then release",
      "Scrunch your face — then release",
      "One long calming exhale",
    ],
    video: "https://youtu.be/OKRVAtLVwKQ",
    classroomFriendly: true,
  },
  {
    id: "squeeze",
    name: "Muscle Squeeze",
    category: "Relaxation",
    audience: "Younger",
    minutes: 2,
    bestFor: "Stress reset",
    xp: 10,
    icon: "🤲",
    short: "Squeeze and let go — like a soft sponge.",
    steps: [
      "Squeeze both hands tight",
      "Let go and shake them out",
      "Squeeze your shoulders up",
      "Drop them down slowly",
      "One big calming breath",
    ],
    video: "https://youtu.be/gDvdYt5DTZw",
  },
  {
    id: "yoga",
    name: "Animal Yoga",
    category: "Body Awareness",
    audience: "Younger",
    minutes: 3,
    bestFor: "Focus",
    xp: 15,
    icon: "🐢",
    short: "Move like calm animals.",
    steps: [
      "Stand tall like a flamingo",
      "Stretch up like a cat",
      "Curl small like a turtle",
      "Reach wide like a butterfly",
      "Stand still like a tree",
    ],
    video: "https://youtu.be/-aYBvZ03B6I",
  },
  {
    id: "glitter",
    name: "Glitter Jar",
    category: "Mindfulness",
    audience: "Younger",
    minutes: 2,
    bestFor: "Calm",
    xp: 10,
    icon: "✨",
    short: "Let your thoughts settle like glitter.",
    steps: [
      "Imagine shaking a glitter jar",
      "Watch the glitter swirl",
      "Take a slow breath",
      "Watch the glitter slowly settle",
      "Notice how still you feel",
    ],
    video: "https://youtu.be/0iFFboIWzh4",
  },
];

const SKILL_BY_ID: Record<SkillKind, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s])) as Record<
  SkillKind,
  Skill
>;

type ResourceGroup = "Teen Relaxation" | "Teen Mindfulness" | "Younger Student Skills" | "More Support";

type Resource = {
  t: string;
  d: string;
  url: string;
  group: ResourceGroup;
  icon: string;
};

const RESOURCES: Resource[] = [
  // Teen Relaxation
  {
    t: "Relaxation Overview",
    d: "What relaxation is and why it helps.",
    url: "https://youtu.be/xV9ad9Sh3W0",
    group: "Teen Relaxation",
    icon: "🌿",
  },
  {
    t: "Balloon Breathing",
    d: "A gentle starter breath practice.",
    url: "https://youtu.be/Aek1YycYG8Y",
    group: "Teen Relaxation",
    icon: "🎈",
  },
  {
    t: "Look for Green",
    d: "A simple grounding exercise.",
    url: "https://youtu.be/TPvLRIYdoj0",
    group: "Teen Relaxation",
    icon: "🍃",
  },
  {
    t: "Muscle Tension & Release",
    d: "A short body-based reset.",
    url: "https://youtu.be/OKRVAtLVwKQ",
    group: "Teen Relaxation",
    icon: "💪",
  },
  // Teen Mindfulness
  {
    t: "Mindfulness Overview",
    d: "Bringing attention to right now.",
    url: "https://youtu.be/cGAblOQY7iw",
    group: "Teen Mindfulness",
    icon: "🧠",
  },
  {
    t: "Box Breathing",
    d: "Four-count breath for focus.",
    url: "https://youtu.be/Dfkw9DF1KWE",
    group: "Teen Mindfulness",
    icon: "🟦",
  },
  {
    t: "Sensory Countdown",
    d: "5-4-3-2-1 grounding.",
    url: "https://youtu.be/G9ecRiwtqWM",
    group: "Teen Mindfulness",
    icon: "🌈",
  },
  {
    t: "Body Scan",
    d: "Notice your body, head to toe.",
    url: "https://youtu.be/fNDwzi20d2Q",
    group: "Teen Mindfulness",
    icon: "🧘",
  },
  // Younger
  {
    t: "Pizza Breathing",
    d: "Smell the pizza, cool the pizza.",
    url: "https://youtu.be/x9-BhnEcr6c",
    group: "Younger Student Skills",
    icon: "🍕",
  },
  {
    t: "Take Five Breathing",
    d: "Trace your hand and breathe.",
    url: "https://youtu.be/aXSOXrcM584",
    group: "Younger Student Skills",
    icon: "🖐️",
  },
  {
    t: "Muscle Squeeze",
    d: "Squeeze and let go.",
    url: "https://youtu.be/gDvdYt5DTZw",
    group: "Younger Student Skills",
    icon: "🤲",
  },
  {
    t: "Animal Yoga",
    d: "Calm poses for steady focus.",
    url: "https://youtu.be/-aYBvZ03B6I",
    group: "Younger Student Skills",
    icon: "🐢",
  },
  {
    t: "Color Quest",
    d: "Find calming colors nearby.",
    url: "https://youtu.be/atX4qLoM9Fk",
    group: "Younger Student Skills",
    icon: "🎨",
  },
  {
    t: "Glitter Jar",
    d: "Watch thoughts settle.",
    url: "https://youtu.be/0iFFboIWzh4",
    group: "Younger Student Skills",
    icon: "✨",
  },
  // More Support
  {
    t: "AR ConnectNow",
    d: "Mental health info for students & families.",
    url: "https://uamshealth.com/ar-connectnow/",
    group: "More Support",
    icon: "🌿",
  },
  {
    t: "AR ConnectNow Build Skills",
    d: "Full library of skill videos.",
    url: "https://uamshealth.com/ar-connectnow/build-skills/",
    group: "More Support",
    icon: "🎥",
  },
  {
    t: "Fight Mental Health Stigma",
    d: "Read and learn.",
    url: "https://uamshealth.com/ar-connectnow/learn-more/fight-mental-health-stigma/",
    group: "More Support",
    icon: "💬",
  },
  {
    t: "Mental Health Q&A",
    d: "Common questions, gentle answers.",
    url: "https://uamshealth.com/ar-connectnow/learn-more/qa/",
    group: "More Support",
    icon: "❓",
  },
  {
    t: "Screeners",
    d: "Self-reflection tools.",
    url: "https://uamshealth.com/ar-connectnow/learn-more/screeners/",
    group: "More Support",
    icon: "📋",
  },
];

const SKILL_CATEGORIES: ("All" | SkillCategory)[] = [
  "All",
  "Breathing",
  "Mindfulness",
  "Relaxation",
  "Grounding",
  "Body Awareness",
];

const QUICK_RESETS: { skill: SkillKind; label: string }[] = [
  { skill: "box", label: "2-Minute Box Breathing" },
  { skill: "sensory", label: "3-Minute Sensory Countdown" },
  { skill: "green", label: "2-Minute Look for Green" },
  { skill: "body", label: "5-Minute Body Scan" },
  { skill: "muscle", label: "3-Minute Muscle Tense & Release" },
];

type BadgeDef = { id: string; t: string; icon: string; hint: string };
const BADGES: BadgeDef[] = [
  { id: "first", t: "First Check-In", icon: "🌱", hint: "Complete your first check-in." },
  { id: "streak3", t: "3-Day Bloom Streak", icon: "🔥", hint: "Check in 3 days in a row." },
  { id: "streak7", t: "7-Day Bloom Streak", icon: "🌟", hint: "Check in 7 days in a row." },
  { id: "breath", t: "Breathing Beginner", icon: "🌬️", hint: "Try a breathing skill." },
  { id: "mind", t: "Mindfulness Explorer", icon: "🧭", hint: "Try 3 mindfulness skills." },
  { id: "ground", t: "Grounding Starter", icon: "🌎", hint: "Try a grounding skill." },
  { id: "reset", t: "Relaxation Rookie", icon: "💆", hint: "Finish a relaxation skill." },
  { id: "stress", t: "Stress Reset", icon: "🌬️", hint: "Use a skill on a higher-stress day." },
  { id: "weekly", t: "Weekly Wellness Champion", icon: "🏆", hint: "Finish the weekly challenge." },
  { id: "support", t: "Support Seeker", icon: "🤝", hint: "Reach out for support — brave step." },
];

type LevelDef = { name: string; threshold: number };
const LEVELS: LevelDef[] = [
  { name: "First Sprout", threshold: 0 },
  { name: "Calm Starter", threshold: 60 },
  { name: "Breathing Builder", threshold: 130 },
  { name: "Mindful Mover", threshold: 220 },
  { name: "Resilience Builder", threshold: 330 },
  { name: "Bloom Champion", threshold: 460 },
  { name: "Steady Grower", threshold: 600 },
  { name: "Wellness Guide", threshold: 760 },
  { name: "Garden Keeper", threshold: 940 },
  { name: "Bloom Master", threshold: 1140 },
];

function levelFromXp(xp: number) {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].threshold) idx = i;
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1];
  const start = current.threshold;
  const end = next ? next.threshold : start + 100;
  const into = xp - start;
  const span = end - start;
  return {
    level: idx + 1,
    name: current.name,
    nextName: next?.name ?? "Max",
    into,
    span,
    pct: Math.min(100, Math.round((into / span) * 100)),
    isMax: !next,
  };
}

const MOOD_LABELS = ["Stressed", "Tired", "Okay", "Calm", "Great"];
const STRESS_LABELS = ["Calm", "Low", "Some", "High", "Lots"];
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Mock baseline for the past 6 days (1-5 scale); today is appended live.
const MOCK_MOOD_PAST = [3, 2, 3, 4, 3, 4];
const MOCK_STRESS_PAST = [2, 3, 3, 2, 4, 2];
const MOCK_SLEEP_PAST = [3, 3, 2, 4, 3, 4];
const MOCK_ENERGY_PAST = [3, 2, 3, 3, 4, 3];
const MOCK_SKILLS_PAST = [1, 2, 2, 1, 2, 3];

function StudentDashboard() {
  const router = useRouter();
  // Check-in state
  const [mood, setMood] = useState(-1);
  const [stress, setStress] = useState(-1);
  const [energy, setEnergy] = useState(-1);
  const [sleep, setSleep] = useState(-1);
  const [reflection, setReflection] = useState("");
  const [checkedInToday, setCheckedInToday] = useState(false);

  // Progress
  const [checkinsThisWeek, setCheckinsThisWeek] = useState(3);
  const [completedSkills, setCompletedSkills] = useState<string[]>([]);
  const [xp, setXp] = useState(120);
  const [streak, setStreak] = useState(2);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set(["breath"]));

  const [reminderOn, setReminderOn] = useState(true);
  const [reminderTime, setReminderTime] = useState("16:00");

  // Gamification state
  const [bestStreak, setBestStreak] = useState(5);
  const [streakFreezes, setStreakFreezes] = useState(2);
  // Weekly bloom days (Mon..Sun) — true if completed
  const [weekDays, setWeekDays] = useState<boolean[]>([true, true, false, true, false, false, false]);
  // Streak goal (settable)
  const [streakGoal, setStreakGoal] = useState(30);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [goalDraft, setGoalDraft] = useState("30");
  const [xpGoal, setXpGoal] = useState(500);
  const [xpGoalDialogOpen, setXpGoalDialogOpen] = useState(false);
  const [xpGoalDraft, setXpGoalDraft] = useState("500");
  // Weekly challenge
  const weeklyChallengeGoal = 3;
  const [weeklyChallengeProgress, setWeeklyChallengeProgress] = useState(1);
  // Mindfulness count for "Mindfulness Explorer" badge
  const [mindCount, setMindCount] = useState(0);
  // Level tracking — used to detect level-ups
  const [lastLevel, setLastLevel] = useState(1);

  // Daily skill practice state
  const dailySkillGoal = 2;
  const [skillsToday, setSkillsToday] = useState(0);
  const [skillXp, setSkillXp] = useState(45);
  const [skillStreak, setSkillStreak] = useState(2);
  const [skillFilter, setSkillFilter] = useState<"All" | SkillCategory>("All");

  // Modals & tabs
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [resourceTab, setResourceTab] = useState<ResourceGroup>("Teen Relaxation");
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportRequested, setSupportRequested] = useState(false);
  const [aiExplainOpen, setAiExplainOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [reflectedToday, setReflectedToday] = useState(false);
  const [section, setSection, sectionBack, canSectionBack] = useHistoryState<
    "today" | "skills" | "journal" | "progress" | "resources" | "settings"
  >("journal");

  // Resilience Garden — Lottie plant gamification
  const [plantAnim, setPlantAnim] = useState<any>(null);
  const lottieRef = useRef<any>(null);
  const prevTasksRef = useRef(0);

  useEffect(() => {
    fetch("/plant-anim.json")
      .then((res) => res.json())
      .then(setPlantAnim);
  }, []);

  const tasksCompleted = Math.min(3, (checkedInToday ? 1 : 0) + (skillsToday >= 1 ? 1 : 0) + (reflectedToday ? 1 : 0));

  useEffect(() => {
    const anim = lottieRef.current;
    if (!anim || !plantAnim || section !== "journal") return;

    const timer = setTimeout(() => {
      const totalFrames = anim.getDuration(true);
      if (!totalFrames) return;

      // Map tasks directly to frame percentages
      let targetFrame = 1;
      if (tasksCompleted === 1) targetFrame = totalFrames * 0.33;
      else if (tasksCompleted === 2) targetFrame = totalFrames * 0.66;
      else if (tasksCompleted === 3) targetFrame = totalFrames - 2;

      const prevTasks = prevTasksRef.current;
      let prevTargetFrame = 1;
      if (prevTasks === 1) prevTargetFrame = totalFrames * 0.33;
      else if (prevTasks === 2) prevTargetFrame = totalFrames * 0.66;
      else if (prevTasks === 3) prevTargetFrame = totalFrames - 2;

      if (tasksCompleted > prevTasks) {
        anim.playSegments([prevTargetFrame, targetFrame], true);
      } else {
        anim.goToAndStop(targetFrame, true);
      }

      prevTasksRef.current = tasksCompleted;
    }, 50);

    return () => clearTimeout(timer);
  }, [tasksCompleted, plantAnim, section]);

  // Shield the UI from keystroke re-renders
  const gardenWidget = useMemo(
    () => (
      <div className="w-full bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/50 flex flex-col items-center justify-center">
        <h3 className="text-xl font-bold tracking-tight text-slate-800 mb-2">Your Resilience Garden</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Complete your check-in, skills, and journal to help it bloom.
        </p>
        <div className="h-48 w-48">
          {plantAnim && <Lottie lottieRef={lottieRef} animationData={plantAnim} loop={false} autoplay={false} />}
        </div>
      </div>
    ),
    [plantAnim],
  );

  const [selectedSkillId, setSelectedSkillId] = useState<SkillKind | null>(null);

  // Auto-open check-in on first entry per session if not yet checked in
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "mb-checkin-seen";
    if (!sessionStorage.getItem(key) && !checkedInToday) {
      setCheckInOpen(true);
      sessionStorage.setItem(key, "1");
    }
  }, [checkedInToday]);

  const weeklyGoal = 5;
  const weeklyPct = Math.min(100, Math.round((checkinsThisWeek / weeklyGoal) * 100));
  const bloomCount = Math.min(7, checkinsThisWeek + Math.floor(completedSkills.length / 2));

  // Derived level info — recalculated every render
  const levelInfo = levelFromXp(xp);

  // Watch for level-ups
  useEffect(() => {
    if (levelInfo.level > lastLevel) {
      toast.success(`You leveled up to ${levelInfo.name}! 🌷`, {
        description: "Your Bloom is growing. Keep going at your own pace.",
      });
      setLastLevel(levelInfo.level);
    }
  }, [levelInfo.level, levelInfo.name, lastLevel]);

  const todayIndex = (() => {
    const js = new Date().getDay(); // 0 Sun..6 Sat
    return (js + 6) % 7; // 0 Mon..6 Sun
  })();

  const markTodayDone = () => {
    setWeekDays((d) => {
      if (d[todayIndex]) return d;
      const n = [...d];
      n[todayIndex] = true;
      return n;
    });
  };

  const unlock = (id: string) =>
    setUnlocked((s) => {
      if (s.has(id)) return s;
      const n = new Set(s);
      n.add(id);
      const badge = BADGES.find((b) => b.id === id);
      if (badge) {
        toast.success(`Badge unlocked: ${badge.t}`, { description: badge.hint });
      }
      return n;
    });

  // Reflection task toggle
  const toggleReflection = () => {
    if (reflectedToday) return;
    setReflectedToday(true);
    setXp((n) => n + 5);
    markTodayDone();
    toast.success("Reflection logged", { description: "+5 XP · Small steps count 🌿" });
  };

  const submitCheckIn = (opts?: {
    reflectionText?: string;
    reflectionPrompt?: string;
    reflectionMood?: 1 | 2 | 3 | 4 | 5;
  }) => {
    if (checkedInToday) {
      toast("You've already checked in today 🌿");
      setCheckInOpen(false);
      return;
    }
    setCheckedInToday(true);
    setCheckinsThisWeek((n) => n + 1);
    setStreak((n) => {
      const next = n + 1;
      setBestStreak((b) => Math.max(b, next));
      if (next >= 3) unlock("streak3");
      if (next >= 7) unlock("streak7");
      return next;
    });
    setXp((n) => n + 25);
    markTodayDone();
    unlock("first");
    if (checkinsThisWeek + 1 >= 5) unlock("weekly");

    // Optional reflection saves into the journal too
    const rText = (opts?.reflectionText ?? reflection).trim();
    if (rText) {
      const prompt = opts?.reflectionPrompt ?? "Today's check-in reflection";
      const moodValue =
        opts?.reflectionMood ?? (mood >= 0 ? (Math.min(5, Math.max(1, mood + 1)) as 1 | 2 | 3 | 4 | 5) : 3);
      setJournalEntries((prev) => [
        { id: `j${Date.now()}`, date: "Just now", prompt, text: rText, mood: moodValue },
        ...prev,
      ]);
      setReflectedToday(true);
      setXp((n) => n + 5);
    }
    setReflection("");
    setCheckInOpen(false);
    toast.success("Check-in saved · Your Bloom Streak grew!", { description: "+25 XP 🌷" });
  };

  const completeSkill = (s: Skill) => {
    const alreadyDone = completedSkills.includes(s.id);
    setCompletedSkills((prev) => (prev.includes(s.id) ? prev : [...prev, s.id]));
    setXp((n) => n + s.xp);
    setSkillXp((n) => n + s.xp);
    markTodayDone();
    const nextToday = skillsToday + 1;
    setSkillsToday(nextToday);
    if (nextToday >= dailySkillGoal && skillsToday < dailySkillGoal) {
      setSkillStreak((n) => n + 1);
    }
    if (s.category === "Breathing") {
      unlock("breath");
      setWeeklyChallengeProgress((n) => {
        const next = Math.min(weeklyChallengeGoal, n + 1);
        if (next >= weeklyChallengeGoal) unlock("weekly");
        return next;
      });
      if (stress >= 3) unlock("stress");
    }
    if (s.category === "Mindfulness") {
      setMindCount((n) => {
        const next = n + 1;
        if (next >= 3) unlock("mind");
        return next;
      });
    }
    if (s.category === "Relaxation") unlock("reset");
    if (s.category === "Grounding") unlock("ground");
    if (checkinsThisWeek >= 5) unlock("weekly");
    setActiveSkill(null);
    toast.success(`Nice work — you finished ${s.name}`, {
      description: `+${s.xp} XP 🌟 ${alreadyDone ? "Practice again tomorrow." : ""}`,
    });
  };

  const useStreakFreeze = () => {
    if (streakFreezes <= 0) {
      toast("No streak freezes left right now 🌿", {
        description: "They refill over time. Your progress is safe.",
      });
      return;
    }
    setStreakFreezes((n) => n - 1);
    markTodayDone();
    toast.success("Streak freeze used 🧊", {
      description: "Your Bloom Streak is protected today. Be kind to yourself.",
    });
  };

  // AI suggestion: pick based on check-in
  const aiSuggestion = useMemo<{ skill: Skill; reason: string }>(() => {
    if (stress >= 3)
      return {
        skill: SKILL_BY_ID.box,
        reason: "Stress feels higher today — Box Breathing can help you reset and feel more steady.",
      };
    if (energy <= 1)
      return { skill: SKILL_BY_ID.balloon, reason: "Energy is low — Balloon Breathing is a soft way to refill." };
    if (sleep <= 1) return { skill: SKILL_BY_ID.body, reason: "Lighter sleep — a short Body Scan can ease tension." };
    if (mood <= 1) return { skill: SKILL_BY_ID.green, reason: "A grounding moment can help — try Look for Green." };
    return { skill: SKILL_BY_ID.take5, reason: "A small Take Five Breathing keeps your day calm and steady." };
  }, [mood, stress, energy, sleep]);

  const weekData = useMemo(
    () =>
      WEEK_DAYS.map((d, i) => ({
        day: d,
        dayName: WEEK_DAY_NAMES[i],
        mood: i < 6 ? MOCK_MOOD_PAST[i] : mood >= 0 ? mood + 1 : 3,
        stress: i < 6 ? MOCK_STRESS_PAST[i] : stress >= 0 ? stress + 1 : 3,
        sleep: i < 6 ? MOCK_SLEEP_PAST[i] : sleep >= 0 ? sleep + 1 : 3,
        energy: i < 6 ? MOCK_ENERGY_PAST[i] : energy >= 0 ? energy + 1 : 3,
        skills: i < 6 ? MOCK_SKILLS_PAST[i] : Math.max(1, Math.min(skillsToday, dailySkillGoal + 2)),
      })),
    [mood, stress, sleep, energy, skillsToday],
  );

  const todayProgressPct = Math.min(
    100,
    Math.round(((checkedInToday ? 1 : 0) + Math.min(skillsToday, dailySkillGoal) / dailySkillGoal) * 50),
  );

  // ===== Settings state (mock/demo, persisted in-memory) =====
  const [settings, setSettings] = useState({
    preferredName: "John",
    age: 15,
    grade: "10th",
    school: "Bloom High School",
    wellnessGoal: "build consistency",
    checkInFrequency: "daily" as "daily" | "school-days" | "3x-week" | "weekly",
    checkInTime: "08:00",
    checkInReminder: true,
    journalReminder: true,
    skillsReminder: false,
    calendars: { google: false, apple: false, outlook: false },
    wearables: { appleWatch: false, whoop: false, fitbit: false },
    privacy: {
      shareTrends: true,
      shareConcernAlerts: true,
      journalPrivate: true,
      calendarContext: true,
    },
    theme: "calm" as "calm" | "focus" | "bloom",
    bloomBirdEncouragement: true,
    difficulty: "standard" as "light" | "standard" | "challenge",
    activityTypes: {
      breathing: true,
      mindfulness: true,
      grounding: false,
      journaling: true,
      stressReset: false,
      emotionalRegulation: true,
    },
    email: "maya@bloomhigh.edu",
  });
  const updateSettings = <K extends keyof typeof settings>(k: K, v: (typeof settings)[K]) =>
    setSettings((s) => ({ ...s, [k]: v }));
  const toggleCalendar = (k: keyof typeof settings.calendars) => {
    setSettings((s) => ({ ...s, calendars: { ...s.calendars, [k]: !s.calendars[k] } }));
    toast.success(`${settings.calendars[k] ? "Disconnected" : "Connected"} (demo)`);
  };
  const toggleWearable = (k: keyof typeof settings.wearables) => {
    setSettings((s) => ({ ...s, wearables: { ...s.wearables, [k]: !s.wearables[k] } }));
    toast.success(`${settings.wearables[k] ? "Disconnected" : "Connected"} (demo)`);
  };
  const filteredSkills = SKILLS.filter((s) => skillFilter === "All" || s.category === skillFilter);
  const featuredSkill = aiSuggestion.skill;

  // Journal state — private by default, mock-local for demo
  const JOURNAL_PROMPTS = [
    "One small thing that went well today…",
    "Something on my mind right now…",
    "A person, place, or moment I'm grateful for…",
    "If today had a color or weather, it would be…",
    "One tiny step I can take tomorrow…",
  ];
  type JournalEntry = { id: string; date: string; prompt: string; text: string; mood: 1 | 2 | 3 | 4 | 5 };
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    {
      id: "j1",
      date: "Yesterday",
      prompt: JOURNAL_PROMPTS[0],
      text: "Made it through the math quiz — felt proud after.",
      mood: 4,
    },
    {
      id: "j2",
      date: "2 days ago",
      prompt: JOURNAL_PROMPTS[1],
      text: "Tired. Group project felt heavy but I asked for help.",
      mood: 3,
    },
  ]);
  const [journalPrompt, setJournalPrompt] = useState(JOURNAL_PROMPTS[0]);
  const [journalDraft, setJournalDraft] = useState("");
  const [journalMood, setJournalMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [morePromptsOpen, setMorePromptsOpen] = useState(false);

  const saveJournal = () => {
    if (!journalDraft.trim()) {
      toast("Write a few words first 🌿");
      return;
    }
    setJournalEntries((prev) => [
      { id: `j${Date.now()}`, date: "Just now", prompt: journalPrompt, text: journalDraft.trim(), mood: journalMood },
      ...prev,
    ]);
    setJournalDraft("");
    setReflectedToday(true);
    setXp((n) => n + 10);
    markTodayDone();
    toast.success("Saved to your private journal", { description: "+10 XP · Only you can see this." });
  };

  const sections = [
    { id: "journal", label: "Check-In" },
    { id: "skills", label: "Build Skills" },
    { id: "progress", label: "My Week" },
    { id: "resources", label: "Resources" },
    { id: "settings", label: "Settings" },
  ] as const;

  return (
    <div className="min-h-screen">
      <Nav />
      <PixelAccent className="-mb-10" />
      <main className="mx-auto max-w-6xl px-4 pt-8 pb-12">
        {/* Welcome — compact */}
        <div className="glass-strong rounded-3xl p-6 md:px-10 md:py-8">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Welcome Back, John!</h1>
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-baseline gap-1.5 rounded-full border border-orange-200/60 bg-orange-50 px-3 py-1.5 text-xl font-bold tracking-tight shadow-sm transition hover:bg-orange-100 md:text-2xl"
                  >
                    <span aria-hidden>🔥</span>
                    <span>
                      12 <span className="text-sm font-semibold text-muted-foreground md:text-base">DAYS</span>
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={10}
                  style={{ animation: "none", transition: "none" }}
                  className="w-[360px] rounded-2xl border border-border bg-white p-0 shadow-[0_20px_50px_-12px_rgba(60,50,120,0.35)]"
                >
                  <MockCard className="border-0 shadow-none">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold">Bloom Streak</div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-sky/30 bg-sky/15 px-3 py-1 text-sm font-semibold text-[oklch(0.42_0.13_230)]">
                        🧊 {streakFreezes} Streak Freezes Left
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-2xl">🔥</span>
                      <span className="text-2xl font-bold tracking-tight">12 days</span>
                    </div>

                    <div className="mt-3">
                      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        June 2026
                      </div>
                      <div className="grid grid-cols-7 gap-1.5">
                        {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
                          <div
                            key={`dow-${idx}`}
                            className="grid h-5 place-items-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            {d}
                          </div>
                        ))}
                        {Array.from({ length: 30 }).map((_, i) => {
                          const slot = i + 1;
                          const day = slot === 1 ? null : slot;
                          if (day === null) {
                            return <div key={`empty-${slot}`} className="h-7 w-7" />;
                          }
                          const isFreeze = day === 4 || day === 6;
                          const done = day <= 12 && !isFreeze;
                          const isToday = day === 13;
                          return (
                            <div
                              key={day}
                              className={`grid h-7 w-7 place-items-center rounded-full text-[11px] leading-none ${
                                done
                                  ? "bg-gradient-to-br from-coral/25 to-bloom/15"
                                  : isFreeze
                                    ? "bg-gradient-to-br from-sky/30 to-sky/15"
                                    : isToday
                                      ? "border border-bloom/40 bg-bloom/5"
                                      : "bg-surface-2"
                              }`}
                              title={
                                done
                                  ? `Day ${day} — Completed`
                                  : isFreeze
                                    ? `Day ${day} — Streak Freeze`
                                    : isToday
                                      ? `Day ${day} — Today`
                                      : `Day ${day}`
                              }
                            >
                              {done ? "🔥" : isFreeze ? "🧊" : ""}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {(() => {
                      const current = 12;
                      const reward = streakGoal * 5;
                      const pct = Math.min(100, Math.round((current / streakGoal) * 100));
                      return (
                        <div className="mt-4 rounded-xl border border-border bg-gradient-to-br from-bloom/5 to-sky/5 p-3.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-semibold text-foreground">Goal: {streakGoal} days</div>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full border border-bloom/30 bg-bloom/10 px-2.5 py-1 text-xs font-semibold text-foreground">
                                +{reward} XP reward
                              </span>
                              <button
                                onClick={() => {
                                  setGoalDraft(String(streakGoal));
                                  setGoalDialogOpen(true);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-bloom/40 bg-white px-3 py-1 text-xs font-semibold text-foreground shadow-sm transition hover:border-bloom hover:bg-bloom/5"
                              >
                                Set goal
                              </button>
                            </div>
                          </div>
                          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </MockCard>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-baseline gap-1.5 rounded-full border border-amber-200/60 bg-amber-50 px-3 py-1.5 text-xl font-bold tracking-tight shadow-sm transition hover:bg-amber-100 md:text-2xl"
                  >
                    <span aria-hidden>⭐</span>
                    <span>
                      {xp} <span className="text-sm font-semibold text-muted-foreground md:text-base">XP</span>
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={10}
                  style={{ animation: "none", transition: "none" }}
                  className="w-[380px] rounded-2xl border border-border bg-white p-0 shadow-[0_20px_50px_-12px_rgba(60,50,120,0.35)]"
                >
                  <MockCard className="border-0 shadow-none">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Your Level
                      </div>
                      <Chip tone="bloom">Lvl {levelInfo.level}</Chip>
                    </div>
                    <div className="mt-2 text-lg font-bold">{levelInfo.name}</div>
                    <div className="mt-3">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-bloom to-sky transition-all"
                          style={{ width: `${levelInfo.pct}%` }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                        <span>{xp} XP</span>
                        <span>{levelInfo.isMax ? "Max" : `${LEVELS[levelInfo.level].threshold} XP`}</span>
                      </div>
                    </div>

                    {(() => {
                      const reward = Math.round(xpGoal * 0.2);
                      const pct = Math.min(100, Math.round((xp / xpGoal) * 100));
                      return (
                        <div className="mt-4 rounded-xl border border-border bg-gradient-to-br from-bloom/5 to-sky/5 p-3.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-semibold text-foreground">Goal: {xpGoal} XP</div>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full border border-bloom/30 bg-bloom/10 px-2.5 py-1 text-xs font-semibold text-foreground">
                                +{reward} XP bonus
                              </span>
                              <button
                                onClick={() => {
                                  setXpGoalDraft(String(xpGoal));
                                  setXpGoalDialogOpen(true);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-bloom/40 bg-white px-3 py-1 text-xs font-semibold text-foreground shadow-sm transition hover:border-bloom hover:bg-bloom/5"
                              >
                                Set goal
                              </button>
                            </div>
                          </div>
                          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-bloom to-sky transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}

                    <div className="my-5 h-px w-full bg-border" />

                    <div className="flex items-center justify-between">
                      <div className="font-semibold">Badges</div>
                      <Chip tone="bloom">
                        {unlocked.size}/{BADGES.length}
                      </Chip>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {BADGES.map((b) => {
                        const got = unlocked.has(b.id);
                        return (
                          <div
                            key={b.id}
                            className={`rounded-xl border p-2 text-center transition-all ${got ? "border-bloom/40 bg-gradient-to-b from-bloom/10 to-sky/10 shadow-sm" : "border-border bg-surface-2 opacity-55"}`}
                            title={b.hint}
                          >
                            <div className="text-2xl">{b.icon}</div>
                            <div className="mt-0.5 text-[10px] font-semibold leading-tight">{b.t}</div>
                          </div>
                        );
                      })}
                    </div>
                  </MockCard>
                </PopoverContent>
              </Popover>

              <button
                onClick={() => setCheckInOpen(true)}
                className="rounded-2xl bg-sky px-6 py-3.5 text-base font-semibold text-white shadow"
              >
                Open Check-In
              </button>
            </div>
          </div>
        </div>

        {/* Section nav */}
        <div className="mt-5 flex flex-wrap gap-1.5 rounded-2xl border border-border bg-white/70 p-1.5 backdrop-blur">
          {sections.map((t) => (
            <button
              key={t.id}
              onClick={() => setSection(t.id)}
              className={`flex-1 min-w-[88px] rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 will-change-transform ${
                section === t.id
                  ? "bg-sky text-white shadow"
                  : "text-muted-foreground hover:-translate-y-0.5 hover:bg-white hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TODAY */}
        {section === "today" && (
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {/* Quests */}
            <MockCard className="lg:col-span-3 bg-gradient-to-br from-bloom/5 via-white to-sky/5">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold">Quests</div>
                <div className="text-sm font-semibold text-foreground/80">
                  {(() => {
                    const done = (checkedInToday ? 1 : 0) + (skillsToday >= 1 ? 1 : 0) + (reflectedToday ? 1 : 0);
                    return done >= 3 ? "Daily Bloom Complete! 🌷" : `${done} of 3 complete`;
                  })()}
                </div>
              </div>

              <div className="mt-3 grid gap-2">
                <GoalRow
                  done={checkedInToday}
                  title="Complete today's check-in"
                  xp={10}
                  onAction={() => setCheckInOpen(true)}
                  actionLabel="Open"
                />
                <GoalRow
                  done={skillsToday >= 1}
                  title="Practice 1 Build Skill"
                  xp={15}
                  onAction={() => setSection("skills")}
                  actionLabel="Browse"
                />
                <GoalRow
                  done={reflectedToday}
                  title="Reflect or request support if needed"
                  xp={5}
                  onAction={toggleReflection}
                  actionLabel="Reflect"
                />
              </div>
            </MockCard>

            {/* AI Suggestion */}
            <MockCard className="lg:col-span-3">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 flex-none place-items-center rounded-full bg-gradient-to-br from-bloom to-sky text-lg text-white shadow">
                  ✨
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold">MindBloom AI Suggestion</div>
                    <Chip tone="bloom">Personal · private</Chip>
                  </div>
                  <div className="mt-2 rounded-2xl rounded-tl-sm border border-border bg-gradient-to-br from-bloom/5 to-sky/5 p-4">
                    <div className="text-sm font-semibold">
                      Based on {checkedInToday ? "today's check-in" : "your recent patterns"}
                    </div>
                    <p className="mt-1 text-sm text-foreground/80">{aiSuggestion.reason}</p>
                    <div className="mt-3 rounded-xl border border-border bg-white p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{featuredSkill.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">{featuredSkill.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {featuredSkill.category} · {featuredSkill.minutes} min
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setActiveSkill(featuredSkill)}
                        className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-xs font-semibold text-background"
                      >
                        Start Suggested Skill
                      </button>
                      <button
                        onClick={() => setWhyOpen((v) => !v)}
                        className="rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold hover:border-bloom hover:bg-bloom/5"
                      >
                        {whyOpen ? "Hide" : "Why this was suggested"}
                      </button>
                      <button
                        onClick={() => setAiExplainOpen(true)}
                        className="text-xs font-semibold text-bloom hover:underline"
                      >
                        How MindBloom AI works →
                      </button>
                    </div>
                    {whyOpen && (
                      <div className="mt-3 rounded-xl border border-border bg-white/70 p-3 text-xs text-muted-foreground">
                        MindBloom looks at your check-ins over time and picks a short skill that often helps with how
                        you're feeling. It only compares you to your own patterns.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </MockCard>

            {/* Bloom Garden Progress */}
            <MockCard className="lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Bloom Garden Progress</div>
                <Chip tone="leaf">Private</Chip>
              </div>
              <div className="mt-3 grid grid-cols-7 gap-1.5 rounded-2xl bg-gradient-to-b from-sky/10 to-leaf/10 p-3">
                {["🌱", "🌿", "🌸", "🌼", "🌷", "🌻", "✨"].map((f, i) => (
                  <div
                    key={i}
                    className="grid aspect-square place-items-center rounded-lg bg-white/70 text-2xl shadow-sm transition-all"
                    style={{ opacity: i < bloomCount ? 1 : 0.3 }}
                  >
                    {i < bloomCount ? f : "·"}
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-3">
                <Stat label="Streak" value={`${streak} 🔥`} />
                <Stat label="This week" value={`${checkinsThisWeek}/${weeklyGoal}`} />
                <Stat label="Skills done" value={`${completedSkills.length}`} />
                <Stat label="Skills today" value={`${Math.min(skillsToday, dailySkillGoal)}/${dailySkillGoal}`} />
                <Stat label="Skill streak" value={`${skillStreak} 🔥`} />
                <Stat label="Total XP" value={`${xp}`} />
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>Weekly goal</span>
                  <span>{weeklyPct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-leaf to-sky transition-all"
                    style={{ width: `${weeklyPct}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">Check-ins and skills help your garden bloom 🌷</p>
              </div>
            </MockCard>

            {/* Badges */}
            <MockCard>
              <div className="flex items-center justify-between">
                <div className="font-semibold">Badges</div>
                <Chip tone="bloom">
                  {unlocked.size}/{BADGES.length}
                </Chip>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {BADGES.map((b) => {
                  const got = unlocked.has(b.id);
                  return (
                    <div
                      key={b.id}
                      className={`rounded-xl border p-2 text-center transition-all ${got ? "border-bloom/40 bg-gradient-to-b from-bloom/10 to-sky/10 shadow-sm" : "border-border bg-surface-2 opacity-55"}`}
                      title={b.hint}
                    >
                      <div className="text-2xl">{b.icon}</div>
                      <div className="mt-0.5 text-[10px] font-semibold leading-tight">{b.t}</div>
                    </div>
                  );
                })}
              </div>
            </MockCard>
          </div>
        )}

        {/* SKILLS */}
        {section === "skills" && <BuildSkillsSection onXpEarned={(amount: number) => setXp((n) => n + amount)} />}

        {/* MY WEEK — week at a glance + week ahead */}
        {section === "progress" && (
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {/* Week at a glance — interactive graphs */}
            <MockCard className="lg:col-span-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">My Week at a Glance</div>
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <MoodChart data={weekData} />
                <StressChart data={weekData} />
                <SleepEnergyChart data={weekData} />
                <SkillsChart data={weekData} />
              </div>
            </MockCard>

            {/* My Week Ahead */}
            <MockCard className="lg:col-span-3 !p-6">
              {(() => {
                type Dir = "up" | "down";
                type StatTone = "warn" | "good" | "muted";
                type Stat = { label: string; dir: Dir; tone: StatTone };
                const statClass: Record<StatTone, string> = {
                  warn: "bg-coral/10 text-[oklch(0.45_0.14_30)] border-coral/25",
                  good: "bg-leaf/15 text-[oklch(0.4_0.13_165)] border-leaf/30",
                  muted: "bg-muted text-muted-foreground border-border",
                };
                const StatPill = ({ s }: { s: Stat }) => (
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statClass[s.tone]}`}
                  >
                    {s.label} {s.dir === "up" ? "↑" : "↓"}
                  </span>
                );

                const events: { name: string; day: string; stats: Stat[] }[] = [
                  {
                    name: "Science quiz",
                    day: "Mon",
                    stats: [
                      { label: "Stress", dir: "up", tone: "warn" },
                      { label: "Focus", dir: "down", tone: "warn" },
                      { label: "Confidence", dir: "down", tone: "warn" },
                    ],
                  },
                  {
                    name: "State testing",
                    day: "Wed",
                    stats: [
                      { label: "Stress", dir: "up", tone: "warn" },
                      { label: "Energy", dir: "down", tone: "warn" },
                      { label: "Sleep", dir: "down", tone: "warn" },
                    ],
                  },
                  {
                    name: "Project due",
                    day: "Thu",
                    stats: [
                      { label: "Stress", dir: "up", tone: "warn" },
                      { label: "Sleep", dir: "down", tone: "warn" },
                      { label: "Mood", dir: "down", tone: "warn" },
                    ],
                  },
                  {
                    name: "Assembly",
                    day: "Fri",
                    stats: [
                      { label: "Energy", dir: "down", tone: "muted" },
                      { label: "Focus", dir: "down", tone: "muted" },
                    ],
                  },
                ];

                const dayChipClass =
                  "inline-flex shrink-0 items-center rounded-full border border-sky/30 bg-sky/10 px-2.5 py-0.5 text-[11px] font-semibold text-[oklch(0.4_0.13_240)]";

                const actions: { name: string; icon: typeof Wind; recFor: string; stats: Stat[] }[] = [
                  {
                    name: "Try box breathing before testing",
                    icon: Wind,
                    recFor: "State testing",
                    stats: [
                      { label: "Stress", dir: "down", tone: "good" },
                      { label: "Focus", dir: "up", tone: "good" },
                    ],
                  },
                  {
                    name: "Journal about what feels heavy",
                    icon: BookOpen,
                    recFor: "Project due",
                    stats: [
                      { label: "Stress", dir: "down", tone: "good" },
                      { label: "Mood", dir: "up", tone: "good" },
                    ],
                  },
                  {
                    name: "Set a sleep goal for finals week",
                    icon: Moon,
                    recFor: "Science quiz & Project due",
                    stats: [
                      { label: "Sleep", dir: "up", tone: "good" },
                      { label: "Energy", dir: "up", tone: "good" },
                      { label: "Focus", dir: "up", tone: "good" },
                    ],
                  },
                  {
                    name: "Ask for help if workload feels too much",
                    icon: HandHeart,
                    recFor: "Project due",
                    stats: [
                      { label: "Stress", dir: "down", tone: "good" },
                      { label: "Support", dir: "up", tone: "good" },
                      { label: "Mood", dir: "up", tone: "good" },
                    ],
                  },
                ];

                return (
                  <div>
                    {/* Header */}
                    <div className="border-b border-border/60 pb-4">
                      <h2 className="flex items-center gap-2 text-lg font-semibold">
                        My Week Ahead by MindBloom AI
                        <Sparkles className="h-4 w-4 text-bloom" />
                      </h2>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-2">
                      {/* Upcoming Events */}
                      <section>
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 text-sky" />
                          Upcoming Events
                        </div>
                        <ul className="mt-2 space-y-2">
                          {events.map((ev) => (
                            <li key={ev.name} className="rounded-xl border border-border/70 bg-white/70 p-3 shadow-sm">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-2">
                                  <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  <span className="truncate text-[15px] font-semibold">{ev.name}</span>
                                </div>
                                <span className={dayChipClass}>{ev.day}</span>
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                {ev.stats.map((s) => (
                                  <StatPill key={s.label} s={s} />
                                ))}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </section>

                      {/* AI Suggested Actions */}
                      <section>
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <Sparkles className="h-3.5 w-3.5 text-bloom" />
                          AI Suggested Actions
                        </div>
                        <div className="mt-2 grid gap-2">
                          {actions.map((a) => {
                            const Icon = a.icon;
                            return (
                              <button
                                key={a.name}
                                onClick={() => toast.success(`Saved: ${a.name}`)}
                                className="group block w-full rounded-xl border border-border/70 bg-white/70 p-3 text-left shadow-sm transition hover:border-bloom hover:bg-bloom/5"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <Icon className="h-4 w-4 shrink-0 text-bloom" />
                                    <span className="truncate text-[15px] font-semibold">{a.name}</span>
                                  </div>
                                  <span className={dayChipClass}>{a.recFor}</span>
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                  {a.stats.map((s) => (
                                    <StatPill key={s.label} s={s} />
                                  ))}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    </div>
                  </div>
                );
              })()}
            </MockCard>
          </div>
        )}

        {/* SUPPORT */}

        {/* DAILY CHECK-IN & JOURNAL */}
        {section === "journal" && (
          <div className="mt-6 flex flex-col gap-6">
            {gardenWidget}

            <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
              {/* 1. Today's Check-In */}
              <MockCard className="bg-gradient-to-br from-bloom/5 via-white to-sky/5">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <h2 className="text-lg font-semibold">Today's Check-In</h2>
                  {checkedInToday && (
                    <span className="rounded-full bg-leaf/15 px-2.5 py-0.5 text-[11px] font-semibold text-[oklch(0.4_0.13_165)]">
                      ✓ Checked in
                    </span>
                  )}
                </div>

                <div className="mt-3 grid gap-3">
                  <Scale
                    label="Mood"
                    options={["Very low", "Low", "Okay", "Good", "Great"]}
                    value={mood}
                    onChange={setMood}
                  />
                  <Scale
                    label="Stress"
                    options={["None", "Low", "Some", "High", "Lots"]}
                    value={stress}
                    onChange={setStress}
                  />
                  <Scale
                    label="Energy"
                    options={["Drained", "Low", "Okay", "High", "Buzzing"]}
                    value={energy}
                    onChange={setEnergy}
                  />
                  <Scale
                    label="Sleep"
                    options={["Poor", "Restless", "Okay", "Good", "Great"]}
                    value={sleep}
                    onChange={setSleep}
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      if (mood < 0 || stress < 0 || energy < 0 || sleep < 0) {
                        toast("Set mood, stress, energy & sleep first 🌿");
                        return;
                      }
                      submitCheckIn();
                    }}
                    className="rounded-xl bg-sky px-4 py-2 text-xs font-semibold text-white shadow hover:opacity-95"
                  >
                    {checkedInToday ? "Update check-in" : "Save check-in"}
                  </button>
                </div>
              </MockCard>

              {/* 2. Journal + Recent Reflections (right column) */}
              <div className="grid gap-5 lg:h-full lg:grid-rows-[auto_1fr]">
                <MockCard>
                  <h3 className="text-base font-semibold">Journal</h3>

                  <div className="mt-3 rounded-2xl border border-border bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-ink-soft">Write anything you want to add context to your check-in.</p>
                      <MicButton onTranscribed={(t) => setJournalDraft((prev) => (prev ? prev + " " : "") + t)} />
                    </div>
                    <textarea
                      value={journalDraft}
                      onChange={(e) => setJournalDraft(e.target.value)}
                      placeholder="Write or speak a few words..."
                      rows={4}
                      className="mt-2 w-full resize-none rounded-xl border border-border bg-surface-2/60 p-3 text-sm outline-none focus:border-bloom focus:bg-white"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span
                      className="inline-flex items-center gap-1 rounded-full border border-leaf/30 bg-leaf/10 px-2 py-1 text-[11px] font-semibold"
                      style={{ color: "oklch(0.38 0.13 165)" }}
                    >
                      🔒 End-to-End Encrypted
                    </span>
                    <button
                      onClick={() => {
                        if (mood < 0 || stress < 0 || energy < 0 || sleep < 0) {
                          toast("Set mood, stress, energy & sleep first 🌿");
                          return;
                        }
                        const text = journalDraft.trim();
                        if (!checkedInToday) {
                          submitCheckIn({
                            reflectionText: text,
                            reflectionPrompt: journalPrompt,
                            reflectionMood: journalMood,
                          });
                        } else if (text) {
                          saveJournal();
                        } else {
                          toast("Add a few words or update your check-in above 🌿");
                          return;
                        }
                        setJournalDraft("");
                      }}
                      className="rounded-xl bg-bloom px-4 py-2 text-xs font-semibold text-white shadow"
                    >
                      Add to Today's Check-In
                    </button>
                  </div>
                </MockCard>

                {/* 3. Recent Reflections (under Journal) */}
                <MockCard>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Recent reflections</h3>
                    <button
                      onClick={() =>
                        toast(
                          "🔒 End-to-End Encrypted. MindBloom utilizes zero-retention semantic analysis. Your exact words are never stored or read by humans.",
                        )
                      }
                      className="text-[11px] font-semibold text-bloom hover:underline"
                    >
                      View all →
                    </button>
                  </div>
                  <div className="mt-3 divide-y divide-border/60 rounded-xl border border-border bg-white">
                    {journalEntries.slice(0, 3).map((e) => (
                      <div key={e.id} className="flex items-start gap-3 px-4 py-4">
                        <span className="text-2xl leading-none">{["😔", "🙁", "😐", "🙂", "😊"][e.mood - 1]}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">{e.date}</span>
                          </div>
                          <p className="mt-1 truncate text-sm text-foreground/90">{e.text}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-bloom/10 px-2.5 py-1 text-[11px] font-semibold text-foreground/70">
                          🔒 Private
                        </span>
                      </div>
                    ))}
                  </div>
                </MockCard>
              </div>
            </div>
          </div>
        )}

        {/* RESOURCES */}
        {section === "resources" && (
          <div className="mt-6 grid gap-5">
            {/* Need support? — request counselor check-in */}
            <MockCard className="bg-gradient-to-br from-sky/10 via-white to-bloom/10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <Chip tone="sky">Need support?</Chip>
                  <div className="mt-1.5 text-sm font-semibold">You are not in trouble.</div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Privately ask your counselor for a check-in — shared only with them.
                  </p>
                  {supportRequested && (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-leaf/40 bg-leaf/10 px-2.5 py-1 text-[11px] text-foreground/85">
                      <span>🌿</span> Request shared — they'll reach out soon.
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (supportRequested) {
                        toast("Your request is already shared 🌿", {
                          description: "A trusted school support adult will reach out soon.",
                        });
                        return;
                      }
                      requestCounselorCheckIn("John D.");
                      setSupportRequested(true);
                      unlock("support");
                      toast.success("Your request has been shared", {
                        description: "A trusted school support adult will reach out soon.",
                      });
                    }}
                    className="rounded-xl bg-sky px-3 py-2 text-xs font-semibold text-white shadow hover:opacity-95"
                  >
                    🤝 Request Counselor Check-In
                  </button>
                </div>
              </div>
            </MockCard>

            {/* 2. Featured Resource Hubs */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Featured Resource Hubs</h3>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  {
                    title: "AR ConnectNow",
                    desc: "Arkansas mental health info and support for students.",
                    cta: "Open ↗",
                    href: "https://uamshealth.com/ar-connectnow/",
                    icon: "🌿",
                    tone: "bloom" as const,
                  },
                  {
                    title: "Build Skills",
                    desc: "Video-guided breathing, mindfulness, and grounding.",
                    cta: "Explore ↗",
                    href: "https://uamshealth.com/ar-connectnow/build-skills/",
                    icon: "🌬️",
                    tone: "sky" as const,
                  },
                  {
                    title: "TRIS Support",
                    desc: "Trauma-responsive support across Arkansas schools.",
                    cta: "Open ↗",
                    href: "https://www.tris-ar.org/",
                    icon: "🏫",
                    tone: "leaf" as const,
                  },
                ].map((c) => (
                  <div key={c.title} className="soft-card p-4">
                    <div className="flex items-center gap-2">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-bloom/15 to-sky/15 text-lg">
                        {c.icon}
                      </div>
                    </div>
                    <h4 className="mt-2 text-sm font-semibold">{c.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 rounded-lg bg-sky px-2.5 py-1.5 text-[11px] font-semibold text-white shadow"
                    >
                      {c.cta}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Video Library */}
            <MockCard>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold">Build Skills Video Library</h3>
                </div>
                <a
                  href="https://uamshealth.com/ar-connectnow/build-skills/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground hover:border-bloom hover:text-foreground"
                >
                  Explore Library ↗
                </a>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {(["Teen Relaxation", "Teen Mindfulness", "Younger Student Skills"] as ResourceGroup[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setResourceTab(g)}
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${
                      resourceTab === g
                        ? "border-bloom bg-bloom/10 text-foreground"
                        : "border-border bg-white text-muted-foreground hover:bg-surface-2"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {RESOURCES.filter((r) => r.group === resourceTab)
                  .slice(0, 4)
                  .map((r) => (
                    <a
                      key={r.url}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-border bg-white p-2.5 text-left transition-all hover:border-bloom hover:bg-bloom/5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-base">{r.icon}</div>
                        <span className="text-[10px] font-semibold text-bloom">Watch ↗</span>
                      </div>
                      <div className="mt-1 text-xs font-semibold leading-tight">{r.t}</div>
                    </a>
                  ))}
              </div>
            </MockCard>

            {/* 4. More Support */}
            <MockCard>
              <h3 className="text-base font-semibold">More Support</h3>
              <div className="mt-2 divide-y divide-border/60 rounded-xl border border-border bg-white">
                {[
                  {
                    t: "Fight Mental Health Stigma",
                    d: "Why stigma hurts and how to push back.",
                    url: "https://uamshealth.com/ar-connectnow/learn-more/fight-mental-health-stigma/",
                  },
                  {
                    t: "Mental Health Q&A",
                    d: "Plain-language answers to common questions.",
                    url: "https://uamshealth.com/ar-connectnow/learn-more/qa/",
                  },
                  {
                    t: "Screeners",
                    d: "Self-check tools to understand how you're feeling.",
                    url: "https://uamshealth.com/ar-connectnow/learn-more/screeners/",
                  },
                ].map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 px-3 py-2.5 text-xs hover:bg-bloom/5"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold">{l.t}</div>
                      <div className="text-[11px] text-muted-foreground">{l.d}</div>
                    </div>
                    <span className="text-muted-foreground">↗</span>
                  </a>
                ))}
              </div>
            </MockCard>
          </div>
        )}

        {/* SETTINGS */}
        {section === "settings" && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {/* Profile & Account */}
            <MockCard>
              <h3 className="text-base font-semibold">Profile & Account</h3>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                <Field label="Preferred name">
                  <input
                    value={settings.preferredName}
                    onChange={(e) => updateSettings("preferredName", e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-1.5 text-sm outline-none focus:border-sky"
                  />
                </Field>
                <Field label="Age">
                  <input
                    type="number"
                    min={5}
                    max={22}
                    value={settings.age}
                    onChange={(e) => updateSettings("age", Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-white px-3 py-1.5 text-sm outline-none focus:border-sky"
                  />
                </Field>
                <Field label="Grade">
                  <select
                    value={settings.grade}
                    onChange={(e) => updateSettings("grade", e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-1.5 text-sm outline-none focus:border-sky"
                  >
                    {["6th", "7th", "8th", "9th", "10th", "11th", "12th"].map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <Field label="Email">
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSettings("email", e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-1.5 text-sm outline-none focus:border-sky"
                  />
                </Field>
                <Field label="Password">
                  <input
                    type="password"
                    value="••••••••"
                    readOnly
                    className="w-full rounded-xl border border-border bg-white px-3 py-1.5 text-sm outline-none focus:border-sky"
                  />
                </Field>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => router.navigate({ to: "/" })}
                  className="rounded-xl border border-border bg-white px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-surface-2"
                >
                  Sign out
                </button>
              </div>
            </MockCard>

            {/* Reminders */}
            <MockCard>
              <h3 className="text-base font-semibold">Reminders</h3>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <Field label="Frequency">
                  <select
                    value={settings.checkInFrequency}
                    onChange={(e) =>
                      updateSettings("checkInFrequency", e.target.value as typeof settings.checkInFrequency)
                    }
                    className="w-full rounded-xl border border-border bg-white px-3 py-1.5 text-sm outline-none focus:border-sky"
                  >
                    <option value="daily">Daily</option>
                    <option value="school-days">School days only</option>
                    <option value="3x-week">3 times per week</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </Field>
                <Field label="Time">
                  <input
                    type="time"
                    value={settings.checkInTime}
                    onChange={(e) => updateSettings("checkInTime", e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-1.5 text-sm outline-none focus:border-sky"
                  />
                </Field>
              </div>
              <div className="mt-3 divide-y divide-border/60 rounded-xl border border-border bg-white">
                {[
                  { k: "checkInReminder" as const, label: "Check-in reminder" },
                  { k: "journalReminder" as const, label: "Journal reminder" },
                  { k: "skillsReminder" as const, label: "Build Skills reminder" },
                ].map((r) => (
                  <label key={r.k} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span>{r.label}</span>
                    <Switch
                      checked={settings[r.k] as boolean}
                      onCheckedChange={(v: boolean) => updateSettings(r.k, v as never)}
                    />
                  </label>
                ))}
              </div>
            </MockCard>

            {/* Connect Data */}
            <MockCard className="lg:col-span-2">
              <h3 className="text-base font-semibold">Connect Data</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Optional connections that help MindBloom give better, more timely support.
              </p>

              <div className="mt-4 space-y-4">
                {/* Calendar row */}
                <div className="grid gap-3 md:grid-cols-12 md:items-start">
                  <div className="md:col-span-5">
                    <div className="text-sm font-semibold">Calendar</div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Notice upcoming stress periods like finals, testing weeks, breaks, and major events.
                    </p>
                  </div>
                  <div className="md:col-span-7 grid gap-2 sm:grid-cols-3">
                    {[
                      { k: "google" as const, label: "Google Calendar", logo: googleLogo.url },
                      { k: "apple" as const, label: "Apple Calendar", logo: appleLogo.url },
                      { k: "outlook" as const, label: "Microsoft Outlook", logo: outlookLogo.url },
                    ].map((c) => {
                      const connected = settings.calendars[c.k];
                      return (
                        <button
                          key={c.k}
                          onClick={() => toggleCalendar(c.k)}
                          className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left text-xs font-medium transition-all ${
                            connected ? "border-leaf bg-leaf/10" : "border-border bg-white hover:border-sky"
                          }`}
                        >
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white p-0.5 shadow-sm ring-1 ring-black/[0.04]">
                            <img src={c.logo} alt="" className="h-full w-full object-contain" />
                          </span>
                          <span className="min-w-0 flex-1 truncate">{c.label}</span>
                          <span
                            className={`text-[10px] font-semibold ${connected ? "text-leaf" : "text-muted-foreground"}`}
                          >
                            {connected ? "✓" : "Connect"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-border/70" />

                {/* Wearables row */}
                <div className="grid gap-3 md:grid-cols-12 md:items-start">
                  <div className="md:col-span-5">
                    <div className="text-sm font-semibold">Wearables</div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Gently factor in sleep, heart rate, and activity patterns when suggesting skills and check-ins.
                    </p>
                  </div>
                  <div className="md:col-span-7 grid gap-2 sm:grid-cols-3">
                    {[
                      { k: "appleWatch" as const, label: "Apple Watch", logo: appleWatchLogo.url },
                      { k: "whoop" as const, label: "WHOOP", logo: whoopLogo.url },
                      { k: "fitbit" as const, label: "Fitbit", logo: fitbitLogo.url },
                    ].map((w) => {
                      const connected = settings.wearables[w.k];
                      return (
                        <button
                          key={w.k}
                          onClick={() => toggleWearable(w.k)}
                          className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left text-xs font-medium transition-all ${
                            connected ? "border-leaf bg-leaf/10" : "border-border bg-white hover:border-sky"
                          }`}
                        >
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white p-0.5 shadow-sm ring-1 ring-black/[0.04]">
                            <img src={w.logo} alt="" className="h-full w-full object-contain" />
                          </span>
                          <span className="min-w-0 flex-1 truncate">{w.label}</span>
                          <span
                            className={`text-[10px] font-semibold ${connected ? "text-leaf" : "text-muted-foreground"}`}
                          >
                            {connected ? "✓" : "Connect"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </MockCard>
          </div>
        )}
      </main>
      <Footer />

      {/* Check-In popup */}
      <Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Today's Check-In</DialogTitle>
          </DialogHeader>
          <Scale label="Mood" options={["Very low", "Low", "Okay", "Good", "Great"]} value={mood} onChange={setMood} />
          <Scale label="Stress" options={["None", "Low", "Some", "High", "Lots"]} value={stress} onChange={setStress} />
          <Scale
            label="Energy"
            options={["Drained", "Low", "Okay", "High", "Buzzing"]}
            value={energy}
            onChange={setEnergy}
          />
          <Scale
            label="Sleep"
            options={["Poor", "Restless", "Okay", "Good", "Great"]}
            value={sleep}
            onChange={setSleep}
          />

          <div className="mt-4 flex items-center justify-between gap-2">
            <label className="block text-xs font-medium text-muted-foreground">Journal reflection (optional)</label>
            <MicButton
              onTranscribed={(t) => setReflection((prev) => (prev ? prev + " " : "") + t)}
              delayMs={2000}
              fixedText="I want to do great today"
            />
          </div>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Write or speak a few words. No pressure, no grading."
            className="mt-1 h-20 w-full rounded-xl border border-border bg-white p-3 text-sm outline-none focus:border-bloom"
          />

          <DialogFooter>
            <button
              onClick={() => setCheckInOpen(false)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold"
            >
              Do later
            </button>
            <button
              onClick={() => submitCheckIn()}
              disabled={mood < 0 || stress < 0 || energy < 0 || sleep < 0}
              className="rounded-lg bg-sky px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save check-in
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interactive Skill modal */}
      <SkillActivityDialog skill={activeSkill} onClose={() => setActiveSkill(null)} onComplete={completeSkill} />

      {/* Support resources modal */}
      <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Support resources</DialogTitle>
            <DialogDescription>Caring people and places that can help you feel better.</DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 text-sm">
            <li className="rounded-xl border border-border bg-white p-3">🧑‍🏫 Talk to a trusted adult at school.</li>
            <li className="rounded-xl border border-border bg-white p-3">
              📞 Call or text a youth support line in your area.
            </li>
            <li className="rounded-xl border border-border bg-white p-3">
              💌 Send a private message to your school counselor.
            </li>
            <li className="rounded-xl border border-border bg-white p-3">🌿 Try a calming skill while you wait.</li>
          </ul>
          <DialogFooter>
            <button
              onClick={() => setSupportOpen(false)}
              className="rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MindBloom AI explain modal (student) */}
      <Dialog open={aiExplainOpen} onOpenChange={setAiExplainOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-bloom to-sky text-xs text-white">
                ✨
              </span>
              How MindBloom AI works
            </DialogTitle>
            <DialogDescription>A supportive tool — not a diagnosis tool.</DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 text-sm text-foreground/85">
            <li className="rounded-xl border border-border bg-white p-3">
              ✓ MindBloom looks for gentle changes over time — not single bad days.
            </li>
            <li className="rounded-xl border border-border bg-white p-3">
              ✓ It combines a few wellness signals (mood, stress, sleep, energy, activities).
            </li>
            <li className="rounded-xl border border-border bg-white p-3">
              ✓ It compares you only to your own usual patterns.
            </li>
            <li className="rounded-xl border border-border bg-white p-3">
              ✓ It suggests small skills you can try — and offers support when patterns repeat.
            </li>
            <li className="rounded-xl border border-border bg-white p-3">
              ✓ It does not diagnose anything. A trusted adult always makes the final decision.
            </li>
          </ul>
          <div className="rounded-xl border border-border bg-surface-2 p-3 text-[11px] text-muted-foreground">
            🔒 Your progress is private. Small steps count.
          </div>
          <DialogFooter>
            <button
              onClick={() => setAiExplainOpen(false)}
              className="rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background"
            >
              Got it
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set XP Goal */}
      <Dialog open={xpGoalDialogOpen} onOpenChange={setXpGoalDialogOpen}>
        <DialogContent className="max-w-2xl p-5 bg-gradient-to-br from-bloom/5 via-sky/5 to-white border-bloom/30">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base">Set an XP goal</DialogTitle>
            <DialogDescription className="sr-only">Choose your XP goal</DialogDescription>
          </DialogHeader>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {[
              { x: 250, bonus: 50 },
              { x: 500, bonus: 100 },
              { x: 1000, bonus: 250 },
              { x: 2000, bonus: 600 },
              { x: 5000, bonus: 1500 },
            ].map(({ x, bonus }) => {
              const selected = xpGoalDraft === String(x);
              return (
                <button
                  key={x}
                  onClick={() => setXpGoalDraft(String(x))}
                  className={`relative flex flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-3 text-center shadow-sm transition ${
                    selected
                      ? "border-bloom bg-bloom/10 ring-1 ring-bloom"
                      : "border-border bg-white hover:border-bloom/60 hover:bg-bloom/5"
                  }`}
                >
                  {selected && (
                    <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-bloom text-[10px] font-bold text-white">
                      ✓
                    </span>
                  )}
                  <span className="whitespace-nowrap text-base font-bold text-foreground">{x.toLocaleString()} XP</span>
                  <span className="text-[11px] font-semibold text-bloom">+{bonus.toLocaleString()} bonus</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Reach your XP goal to earn a bonus reward.
          </p>
          <DialogFooter className="mt-3 flex-row items-center justify-end gap-2 sm:gap-2">
            <button
              onClick={() => setXpGoalDialogOpen(false)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const n = Math.max(50, Math.min(100000, parseInt(xpGoalDraft, 10) || xpGoal));
                setXpGoal(n);
                setXpGoalDialogOpen(false);
                toast.success(`XP goal set to ${n.toLocaleString()} ✨`);
              }}
              className="rounded-lg bg-bloom px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90"
            >
              Save goal
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Streak Goal */}
      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent className="max-w-2xl p-5 bg-gradient-to-br from-[oklch(0.97_0.05_70)] via-[oklch(0.98_0.03_70)] to-white border-[oklch(0.85_0.12_60)]/40">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base">Set a streak goal</DialogTitle>
            <DialogDescription className="sr-only">Choose your streak goal</DialogDescription>
          </DialogHeader>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {[
              { d: 7, xp: 50 },
              { d: 14, xp: 125 },
              { d: 30, xp: 300 },
              { d: 60, xp: 700 },
              { d: 100, xp: 1200 },
            ].map(({ d, xp }) => {
              const selected = goalDraft === String(d);
              return (
                <button
                  key={d}
                  onClick={() => setGoalDraft(String(d))}
                  className={`relative flex flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-3 text-center shadow-sm transition ${
                    selected
                      ? "border-[oklch(0.7_0.16_55)] bg-[oklch(0.95_0.08_70)] ring-1 ring-[oklch(0.7_0.16_55)]"
                      : "border-border bg-white hover:border-[oklch(0.75_0.14_60)]/60 hover:bg-[oklch(0.97_0.05_70)]"
                  }`}
                >
                  {selected && (
                    <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-[oklch(0.7_0.16_55)] text-[10px] font-bold text-white">
                      ✓
                    </span>
                  )}
                  <span className="whitespace-nowrap text-base font-bold text-foreground">{d} days</span>
                  <span className="text-[11px] font-semibold text-[oklch(0.55_0.16_50)]">
                    +{xp.toLocaleString()} XP
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Keep your streak going to earn the full XP reward.
          </p>
          <DialogFooter className="mt-3 flex-row items-center justify-end gap-2 sm:gap-2">
            <button
              onClick={() => setGoalDialogOpen(false)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const n = Math.max(1, Math.min(365, parseInt(goalDraft, 10) || streakGoal));
                setStreakGoal(n);
                setGoalDialogOpen(false);
                toast.success(`Goal set to ${n} days 🌷`);
              }}
              className="rounded-lg bg-[oklch(0.7_0.16_55)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[oklch(0.65_0.17_55)]"
            >
              Save goal
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ───────────── Interactive Skill Dialog ───────────── */

function SkillActivityDialog({
  skill,
  onClose,
  onComplete,
}: {
  skill: Skill | null;
  onClose: () => void;
  onComplete: (s: Skill) => void;
}) {
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0); // 0..1 progress for current step
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isExiting, setIsExiting] = useState(false);

  const EXIT_MS = 300;

  useEffect(() => {
    setStep(0);
    setChecked(skill ? new Array(skill.steps.length).fill(false) : []);
    setPaused(false);
    setDirection(1);
    setIsExiting(false);
  }, [skill?.id]);

  // Per-step duration: longer for breathing/balloon, shorter otherwise.
  const stepDurationMs = useMemo(() => {
    if (!skill) return 6000;
    if (["box", "balloon", "take5"].includes(skill.id)) return 8000;
    if (skill.id === "sensory" || skill.id === "green") return 7000;
    return 6000;
  }, [skill?.id]);

  // Reset countdown when step changes
  useEffect(() => {
    setTick(0);
    setIsExiting(false);
  }, [step, skill?.id]);

  // Tween the countdown and auto-advance with smooth exit transition
  useEffect(() => {
    if (!skill || paused || isExiting) return;
    const start = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / stepDurationMs);
      setTick(p);
      if (p >= 1) {
        const isLastStep = step === skill.steps.length - 1;
        // Trigger exit animation, then advance/complete
        setDirection(1);
        setIsExiting(true);
        window.setTimeout(() => {
          if (isLastStep) {
            onComplete(skill);
          } else {
            setStep((n) => n + 1);
          }
        }, EXIT_MS);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, skill?.id, paused, stepDurationMs, isExiting]);

  if (!skill) return null;
  const total = skill.steps.length;
  const progressPct = Math.round(((step + 1) / total) * 100);

  const toggle = (i: number) => setChecked((arr) => arr.map((v, idx) => (idx === i ? !v : v)));

  return (
    <Dialog open={!!skill} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{skill.icon}</span> {skill.name}
          </DialogTitle>
          <DialogDescription>
            {skill.category} · about {skill.minutes} min — {skill.short}
          </DialogDescription>
        </DialogHeader>

        {/* progress */}
        <div>
          <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
            <span>
              Step {step + 1} of {total}
            </span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-bloom to-sky transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Breathing circle — persists across steps so scaling stays fluid,
            decoupled from the step-advance/exit animations */}
        <BreathingCircle skill={skill} step={step} />

        {/* step visual + content (auto-advancing) */}
        <div
          key={`${skill.id}-${step}`}
          className="space-y-3"
          style={{
            animation: isExiting
              ? `${direction === 1 ? "skill-slide-out-left" : "skill-slide-out-right"} 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both`
              : `${direction === 1 ? "skill-slide-in-right" : "skill-slide-in-left"} 380ms cubic-bezier(0.34, 1.56, 0.64, 1) both`,
          }}
        >
          <ActivityStepVisual skill={skill} step={step} />

          <div className="rounded-2xl border border-border bg-gradient-to-br from-bloom/5 to-sky/5 p-4 text-center text-sm font-medium">
            {skill.steps[step]}
          </div>

          {/* interactive checklist for grounding/look-for-green/sensory */}
          {(skill.id === "sensory" || skill.id === "green") && (
            <div className="flex items-center justify-center">
              <button
                onClick={() => toggle(step)}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
                  checked[step]
                    ? "border-leaf bg-leaf/15 text-[oklch(0.4_0.13_165)]"
                    : "border-border bg-white hover:bg-surface-2"
                }`}
              >
                {checked[step] ? "✓ Marked" : "Mark complete"}
              </button>
            </div>
          )}
        </div>

        {skill.video && (
          <div className="text-center">
            <a
              href={skill.video}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-bloom hover:underline"
            >
              ▶ Watch resource video (AR ConnectNow)
            </a>
          </div>
        )}

        {/* Auto-advance countdown */}
        <div className="space-y-1.5">
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              key={`countdown-${skill.id}-${step}`}
              className="h-full rounded-full bg-gradient-to-r from-sun to-leaf"
              style={{
                width: `${Math.round(tick * 100)}%`,
                transition: tick === 0 ? "none" : "width 120ms linear",
              }}
            />
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
            <span>{paused ? "Paused" : step === total - 1 ? "Finishing in a moment…" : "Next step in a moment…"}</span>
            <button
              onClick={() => setPaused((p) => !p)}
              className="rounded-full border border-border bg-white px-2 py-0.5 text-[10px] font-semibold hover:bg-surface-2"
            >
              {paused ? "Resume" : "Pause"}
            </button>
          </div>
        </div>

        <DialogFooter className="!justify-between">
          <button
            onClick={() => {
              if (step === 0 || isExiting) return;
              setDirection(-1);
              setIsExiting(true);
              window.setTimeout(() => {
                setStep((n) => Math.max(0, n - 1));
              }, EXIT_MS);
            }}
            disabled={step === 0 || isExiting}
            className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold disabled:opacity-40"
          >
            Back
          </button>

          <button
            onClick={() => onComplete(skill)}
            className="rounded-lg bg-sky px-3 py-2 text-xs font-semibold text-white"
          >
            Finish now
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BreathingCircle({ skill, step }: { skill: Skill; step: number }) {
  if (skill.id !== "box" && skill.id !== "balloon" && skill.id !== "take5") return null;
  const phase = skill.steps[step]?.toLowerCase() ?? "";
  const isInhale = phase.includes("inhale") || phase.includes("breathe in");
  const isExhale = phase.includes("exhale") || phase.includes("breathe out");
  // Per user spec: exhale → expand, inhale → shrink, hold/other → mid.
  const scale = isExhale ? 1.35 : isInhale ? 0.7 : 1.0;
  const opacity = isExhale ? 1 : isInhale ? 0.8 : 0.9;
  return (
    <div className="grid place-items-center py-2">
      <div
        className="h-28 w-28 rounded-full bg-gradient-to-br from-bloom to-sky shadow-lg"
        style={{
          transform: `scale(${scale})`,
          opacity,
          transition: "transform 3200ms cubic-bezier(0.45, 0, 0.55, 1), opacity 3200ms ease-in-out",
          willChange: "transform, opacity",
        }}
      />
    </div>
  );
}

function ActivityStepVisual({ skill, step }: { skill: Skill; step: number }) {
  // Breathing visual is rendered by <BreathingCircle> outside the step-keyed wrapper
  // so its scale animation doesn't get reset on every step transition.
  if (skill.id === "box" || skill.id === "balloon" || skill.id === "take5") return null;
  if (skill.id === "body" || skill.id === "muscle") {
    const parts = ["🦶", "🦵", "🫀", "💪", "🙂"];
    return (
      <div className="grid place-items-center py-2 text-5xl">
        <span>{parts[step] ?? "🧘"}</span>
      </div>
    );
  }
  if (skill.id === "sensory") {
    const icons = ["👀", "✋", "👂", "👃", "🌟"];
    return (
      <div className="grid place-items-center py-2 text-5xl">
        <span>{icons[step] ?? "🌈"}</span>
      </div>
    );
  }
  if (skill.id === "green") {
    return (
      <div className="grid place-items-center py-2 text-5xl">
        <span>🍃</span>
      </div>
    );
  }
  return null;
}

/* ───────────── Small bits ───────────── */

const MOCK_REFLECTIONS = [
  "Felt a little tired after lunch but practice went okay. Trying to focus on small wins.",
  "Pretty calm today. Talked to a friend during break and that helped a lot.",
  "Stressful start, but the breathing exercise helped me reset before class.",
  "Grateful for a quiet morning. Going to try to sleep earlier tonight.",
];

function MicButton({
  onTranscribed,
  delayMs,
  fixedText,
}: {
  onTranscribed: (text: string) => void;
  delayMs?: number;
  fixedText?: string;
}) {
  const [listening, setListening] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const start = () => {
    if (listening) return;
    setListening(true);
    timer.current = window.setTimeout(() => {
      const pick = fixedText ?? MOCK_REFLECTIONS[Math.floor(Math.random() * MOCK_REFLECTIONS.length)];
      onTranscribed(pick);
      setListening(false);
    }, delayMs ?? 1800);
  };

  return (
    <button
      type="button"
      onClick={start}
      aria-label={listening ? "Listening" : "Start speech to text"}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
        listening
          ? "border-bloom bg-bloom/10 text-bloom animate-pulse"
          : "border-border bg-white text-muted-foreground hover:border-bloom/50 hover:text-bloom"
      }`}
    >
      <Mic size={12} />
      {listening ? "Listening…" : "Speak"}
    </button>
  );
}

function Scale({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: number;
  onChange: (n: number) => void;
}) {
  // Gentle per-step tint: soft sky → leaf → bloom across the 5 options
  const tints = [
    { bg: "bg-sky/10", border: "border-sky/50", num: "text-sky", ring: "ring-sky/30" },
    { bg: "bg-leaf/10", border: "border-leaf/50", num: "text-leaf", ring: "ring-leaf/30" },
    { bg: "bg-bloom/10", border: "border-bloom/50", num: "text-bloom", ring: "ring-bloom/30" },
    { bg: "bg-coral/10", border: "border-coral/50", num: "text-coral", ring: "ring-coral/30" },
    { bg: "bg-bloom/15", border: "border-bloom/60", num: "text-bloom", ring: "ring-bloom/40" },
  ];
  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        {value >= 0 && <span className={`text-[11px] font-medium ${tints[value].num}`}>{options[value]}</span>}
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {options.map((opt, i) => {
          const selected = value === i;
          const t = tints[i];
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              aria-pressed={selected}
              className={`flex h-14 flex-col items-center justify-center gap-1 rounded-xl border px-1 text-[10px] font-medium leading-tight transition-all ${
                selected
                  ? `${t.border} ${t.bg} text-foreground shadow-sm ring-2 ${t.ring}`
                  : "border-border bg-white text-foreground/70 hover:border-bloom/40 hover:bg-surface-2"
              }`}
            >
              <span className={`text-[11px] font-semibold ${selected ? t.num : "text-muted-foreground"}`}>{i + 1}</span>
              <span className="text-center">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-base font-bold">{value}</div>
    </div>
  );
}

function GoalRow({
  done,
  title,
  xp,
  onAction,
  actionLabel,
}: {
  done: boolean;
  title: string;
  xp: number;
  onAction: () => void;
  actionLabel: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
        done ? "border-leaf/50 bg-leaf/10 animate-fade-in" : "border-border bg-white hover:border-bloom"
      }`}
    >
      <div
        className={`grid h-7 w-7 flex-none place-items-center rounded-full text-xs transition-all ${
          done
            ? "bg-gradient-to-br from-leaf to-sky text-white shadow"
            : "border border-border bg-white text-muted-foreground"
        }`}
      >
        {done ? "✓" : ""}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-sm font-medium ${done ? "text-foreground/70 line-through" : ""}`}>{title}</div>
        <div className="text-[10px] uppercase tracking-wide text-bloom">+{xp} XP</div>
      </div>
      {!done && (
        <button
          onClick={onAction}
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-[11px] font-semibold hover:border-bloom hover:bg-bloom/5"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ───────────── Week graphs ───────────── */

type WeekDatum = {
  day: string;
  dayName: string;
  mood: number;
  stress: number;
  sleep: number;
  energy: number;
  skills: number;
};

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ payload: WeekDatum }>;
  label?: string;
  formatter: (d: WeekDatum) => ReactNode;
}) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <div className="font-semibold text-foreground">{d.dayName ?? label}</div>
      <div className="mt-0.5 text-muted-foreground">{formatter(d)}</div>
    </div>
  );
}

function ChartShell({
  title,
  caption,
  footer,
  children,
}: {
  title: string;
  caption?: string;
  footer?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold">{title}</div>
        {caption && <span className="text-[10px] text-muted-foreground">{caption}</span>}
      </div>
      <div className="mt-2 h-[130px] w-full">{children}</div>
      {footer && <p className="mt-1 text-[10px] text-muted-foreground">{footer}</p>}
    </div>
  );
}

function MoodChart({ data }: { data: WeekDatum[] }) {
  return (
    <ChartShell title="Mood">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid stroke="oklch(0.94 0.01 280)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "oklch(0.55 0.02 280)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 3, 5]}
            tick={{ fontSize: 10, fill: "oklch(0.55 0.02 280)" }}
            axisLine={false}
            tickLine={false}
          />
          <RTooltip
            cursor={{ stroke: "oklch(0.85 0.03 280)" }}
            content={(p: any) => (
              <ChartTooltip {...p} formatter={(d) => `${MOOD_LABELS[d.mood - 1] ?? "Okay"} (${d.mood}/5)`} />
            )}
          />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="var(--bloom)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--bloom)" }}
            activeDot={{ r: 5 }}
            animationDuration={400}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

function StressChart({ data }: { data: WeekDatum[] }) {
  return (
    <ChartShell title="Stress">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid stroke="oklch(0.94 0.01 280)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "oklch(0.55 0.02 280)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[0, 2, 5]}
            tick={{ fontSize: 10, fill: "oklch(0.55 0.02 280)" }}
            axisLine={false}
            tickLine={false}
          />
          <RTooltip
            cursor={{ fill: "oklch(0.95 0.02 280 / 0.5)" }}
            content={(p: any) => (
              <ChartTooltip
                {...p}
                formatter={(d) => `${STRESS_LABELS[d.stress - 1] ?? "Some"} · stress ${d.stress} of 5`}
              />
            )}
          />
          <Bar dataKey="stress" radius={[6, 6, 0, 0]} animationDuration={400} animationEasing="ease-out">
            {data.map((_, i) => (
              <Cell key={i} fill="var(--coral)" fillOpacity={0.55 + (i / data.length) * 0.45} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

function SleepEnergyChart({ data }: { data: WeekDatum[] }) {
  return (
    <ChartShell title="Sleep & Energy">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid stroke="oklch(0.94 0.01 280)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "oklch(0.55 0.02 280)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 3, 5]}
            tick={{ fontSize: 10, fill: "oklch(0.55 0.02 280)" }}
            axisLine={false}
            tickLine={false}
          />
          <RTooltip
            cursor={{ stroke: "oklch(0.85 0.03 280)" }}
            content={(p: any) => (
              <ChartTooltip {...p} formatter={(d) => `Sleep ${d.sleep} of 5 · Energy ${d.energy} of 5`} />
            )}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
          <Line
            type="monotone"
            dataKey="sleep"
            name="Sleep"
            stroke="var(--sky)"
            strokeWidth={2.5}
            dot={{ r: 2.5 }}
            animationDuration={400}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="energy"
            name="Energy"
            stroke="var(--leaf)"
            strokeWidth={2.5}
            dot={{ r: 2.5 }}
            animationDuration={400}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

function SkillsChart({ data }: { data: WeekDatum[] }) {
  return (
    <ChartShell title="Skills completed">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid stroke="oklch(0.94 0.01 280)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "oklch(0.55 0.02 280)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: "oklch(0.55 0.02 280)" }}
            axisLine={false}
            tickLine={false}
          />
          <RTooltip
            cursor={{ fill: "oklch(0.95 0.02 280 / 0.5)" }}
            content={(p: any) => (
              <ChartTooltip {...p} formatter={(d) => `${d.skills} skill${d.skills === 1 ? "" : "s"} completed`} />
            )}
          />
          <Bar dataKey="skills" radius={[6, 6, 0, 0]} animationDuration={400} animationEasing="ease-out">
            {data.map((_, i) => (
              <Cell key={i} fill="var(--leaf)" fillOpacity={0.55 + (i / data.length) * 0.45} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-white px-3 py-2.5 text-left transition-colors hover:border-sky"
    >
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="text-[11px] text-muted-foreground">{desc}</div>}
      </div>
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-sky" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
