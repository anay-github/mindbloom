// Build Skills — shared types, activity library, prioritization, levels, quests, prefs hook.
import { useEffect, useState } from "react";

export type Theme = "Calm" | "Focus" | "Bloom";
export type Difficulty = "Light" | "Standard" | "Challenging";
export type Category =
  | "Breathing"
  | "Mindfulness"
  | "Grounding"
  | "Journaling"
  | "Stress Reset"
  | "Emotional Regulation";

export const THEMES: Theme[] = ["Calm", "Focus", "Bloom"];
export const DIFFICULTIES: Difficulty[] = ["Light", "Standard", "Challenging"];
export const CATEGORIES: Category[] = [
  "Breathing",
  "Mindfulness",
  "Grounding",
  "Journaling",
  "Stress Reset",
  "Emotional Regulation",
];

export type Activity = {
  id: string;
  title: string;
  category: Category;
  theme: Theme;
  minutes: number;
  difficulty: Difficulty;
  xp: number;
  description: string;
};

export type Prefs = {
  themes: Theme[];
  difficulties: Difficulty[];
  categories: Category[];
};

const a = (
  title: string,
  category: Category,
  theme: Theme,
  minutes: number,
  difficulty: Difficulty,
  xp: number,
  description: string,
): Activity => ({
  id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  title,
  category,
  theme,
  minutes,
  difficulty,
  xp,
  description,
});

export const ACTIVITIES: Activity[] = [
  // Breathing
  a("Box Breathing", "Breathing", "Calm", 3, "Standard", 15, "Breathe evenly through four counts"),
  a("Balloon Breathing", "Breathing", "Calm", 2, "Light", 10, "Slowly inflate an imaginary balloon"),
  a("Take Five Breathing", "Breathing", "Focus", 2, "Light", 10, "Trace fingers while breathing slowly"),
  a("Pizza Breathing", "Breathing", "Calm", 2, "Light", 5, "Smell pizza, gently cool it"),
  a("Star Breathing", "Breathing", "Focus", 2, "Light", 10, "Trace a star while breathing"),
  a("Rainbow Breathing", "Breathing", "Calm", 3, "Standard", 15, "Breathe while tracing rainbow arcs"),
  a("Finger Trace Breathing", "Breathing", "Focus", 2, "Light", 10, "Follow each finger with breath"),
  a("Candle Breathing", "Breathing", "Calm", 2, "Light", 5, "Gently blow out imaginary candles"),
  a("Ocean Wave Breathing", "Breathing", "Calm", 3, "Standard", 15, "Match breathing to ocean waves"),
  a("Bumblebee Breathing", "Breathing", "Calm", 2, "Standard", 10, "Hum softly during each exhale"),
  a("4–6 Calm Breathing", "Breathing", "Calm", 3, "Standard", 15, "Inhale four, exhale for six"),
  a("Counted Exhale", "Breathing", "Focus", 2, "Standard", 10, "Extend each exhale using counts"),
  a("Shoulder Drop Breathing", "Breathing", "Calm", 2, "Light", 10, "Release shoulders with each exhale"),
  a("Calm Wave Breathing", "Breathing", "Calm", 3, "Standard", 15, "Follow a slow breathing rhythm"),
  a("Square Walk Breathing", "Breathing", "Focus", 4, "Challenging", 20, "Walk slowly using square breathing"),
  // Mindfulness
  a("Glitter Jar", "Mindfulness", "Calm", 2, "Light", 10, "Watch thoughts slowly settle down"),
  a("Body Scan", "Mindfulness", "Focus", 5, "Challenging", 25, "Notice sensations throughout your body"),
  a("Animal Yoga", "Mindfulness", "Calm", 3, "Standard", 15, "Move through playful animal poses"),
  a("Mindful Listening", "Mindfulness", "Focus", 3, "Standard", 15, "Focus closely on nearby sounds"),
  a("Five Senses Pause", "Mindfulness", "Focus", 3, "Standard", 15, "Notice each sense one-by-one"),
  a("Sound Safari", "Mindfulness", "Focus", 2, "Light", 10, "Search quietly for different sounds"),
  a("Mindful Drawing", "Mindfulness", "Focus", 4, "Standard", 20, "Draw slowly and notice details"),
  a("Thought Clouds", "Mindfulness", "Bloom", 3, "Standard", 15, "Watch thoughts pass without judgment"),
  a("Slow-Motion Minute", "Mindfulness", "Focus", 2, "Light", 10, "Move slowly and notice sensations"),
  a("Mindful Bite", "Mindfulness", "Focus", 3, "Standard", 15, "Notice taste, texture, and smell"),
  a("Hand Awareness", "Mindfulness", "Focus", 2, "Light", 10, "Observe sensations within your hands"),
  a("Quiet Observation", "Mindfulness", "Focus", 3, "Standard", 15, "Study one object without distraction"),
  a("Gratitude Minute", "Mindfulness", "Bloom", 2, "Light", 10, "Notice something you appreciate today"),
  a("One-Minute Stillness", "Mindfulness", "Calm", 1, "Light", 5, "Sit quietly and observe yourself"),
  a("Cloud Watching", "Mindfulness", "Calm", 4, "Standard", 20, "Observe clouds without naming them"),
  // Grounding
  a("Sensory Countdown", "Grounding", "Focus", 3, "Standard", 15, "Identify sights, sounds, and sensations"),
  a("Look for Green", "Grounding", "Focus", 2, "Light", 10, "Find green objects around you"),
  a("Color Quest", "Grounding", "Focus", 2, "Light", 10, "Search your surroundings for colors"),
  a("Feet on the Floor", "Grounding", "Calm", 2, "Light", 5, "Notice pressure beneath your feet"),
  a("Name Five Things", "Grounding", "Focus", 3, "Standard", 15, "Identify five things you see"),
  a("Texture Hunt", "Grounding", "Focus", 3, "Standard", 15, "Explore several safe nearby textures"),
  a("Object Detective", "Grounding", "Focus", 3, "Standard", 15, "Study one object in detail"),
  a("Alphabet Grounding", "Grounding", "Focus", 4, "Challenging", 20, "Find objects from A onward"),
  a("Room Scan", "Grounding", "Focus", 2, "Light", 10, "Slowly observe your immediate surroundings"),
  a("Temperature Check", "Grounding", "Focus", 2, "Light", 10, "Notice warm and cool sensations"),
  a("Find the Corners", "Grounding", "Focus", 2, "Light", 10, "Locate every corner around you"),
  a("Shape Search", "Grounding", "Focus", 3, "Standard", 15, "Find different shapes nearby"),
  a("Focus Point", "Grounding", "Focus", 2, "Standard", 10, "Focus attention on one spot"),
  a("Safe Place Snapshot", "Grounding", "Calm", 4, "Challenging", 20, "Picture a calm, secure place"),
  a("Here and Now", "Grounding", "Calm", 3, "Standard", 15, "Reconnect with the present moment"),
  // Journaling
  a("Three-Word Check-In", "Journaling", "Bloom", 2, "Light", 10, "Describe today using three words"),
  a("Mood Weather Report", "Journaling", "Bloom", 3, "Standard", 15, "Compare your mood to weather"),
  a("One Good Thing", "Journaling", "Bloom", 2, "Light", 10, "Record one positive moment today"),
  a("Stress Dump", "Journaling", "Calm", 4, "Standard", 20, "Write down everything causing stress"),
  a("What I Can Control", "Journaling", "Bloom", 4, "Challenging", 20, "Separate controllable and uncontrollable concerns"),
  a("Small Win Reflection", "Journaling", "Bloom", 3, "Standard", 15, "Reflect on one recent success"),
  a("Name the Feeling", "Journaling", "Bloom", 3, "Standard", 15, "Identify and describe one emotion"),
  a("Three Things I Appreciate", "Journaling", "Bloom", 3, "Standard", 15, "List three things you value"),
  a("My Support Circle", "Journaling", "Bloom", 4, "Challenging", 20, "Identify people who support you"),
  a("Before and After", "Journaling", "Bloom", 4, "Standard", 20, "Compare feelings before and after"),
  a("Thought Reframe", "Journaling", "Bloom", 5, "Challenging", 25, "Rewrite an unhelpful thought positively"),
  a("Letter to Future Me", "Journaling", "Bloom", 5, "Challenging", 25, "Write encouragement to future yourself"),
  a("Unsent Letter", "Journaling", "Bloom", 5, "Challenging", 25, "Express feelings without sending anything"),
  a("Tomorrow's Intention", "Journaling", "Focus", 3, "Standard", 15, "Set one goal for tomorrow"),
  a("Voice Journal", "Journaling", "Bloom", 3, "Standard", 15, "Record your thoughts aloud privately"),
  // Stress Reset
  a("Muscle Tension & Release", "Stress Reset", "Calm", 4, "Standard", 20, "Tighten and relax muscle groups"),
  a("Muscle Squeeze", "Stress Reset", "Calm", 2, "Light", 10, "Squeeze muscles, then gently release"),
  a("Desk Stretch", "Stress Reset", "Calm", 3, "Standard", 15, "Stretch safely beside your desk"),
  a("Shake It Out", "Stress Reset", "Calm", 2, "Light", 10, "Shake away built-up body tension"),
  a("Wall Push Reset", "Stress Reset", "Calm", 2, "Standard", 10, "Push firmly against a wall"),
  a("Shoulder Roll Reset", "Stress Reset", "Calm", 2, "Light", 10, "Roll shoulders slowly and gently"),
  a("Tense and Melt", "Stress Reset", "Calm", 3, "Standard", 15, "Create tension, then let go"),
  a("Quick Walk Reset", "Stress Reset", "Calm", 4, "Standard", 20, "Walk briefly to reset focus"),
  a("Calm Countdown", "Stress Reset", "Focus", 3, "Standard", 15, "Count backward while relaxing gradually"),
  a("Palm Press", "Stress Reset", "Calm", 2, "Light", 10, "Press palms together, then release"),
  a("Posture Reset", "Stress Reset", "Focus", 2, "Light", 10, "Adjust posture and relax tension"),
  a("Mini Dance Break", "Stress Reset", "Bloom", 3, "Standard", 15, "Move freely to release stress"),
  a("Brain Break Puzzle", "Stress Reset", "Focus", 4, "Challenging", 20, "Solve a quick focus puzzle"),
  a("Quiet Corner Reset", "Stress Reset", "Calm", 4, "Standard", 20, "Pause quietly in a calm space"),
  a("Two-Minute Reset Routine", "Stress Reset", "Calm", 2, "Light", 10, "Breathe, stretch, and refocus quickly"),
  // Emotional Regulation
  a("Emotion Naming", "Emotional Regulation", "Bloom", 3, "Standard", 15, "Identify the emotion you feel"),
  a("Feelings Thermometer", "Emotional Regulation", "Bloom", 3, "Standard", 15, "Rate how strongly you feel"),
  a("Pause, Plan, Choose", "Emotional Regulation", "Focus", 4, "Challenging", 20, "Pause before choosing your response"),
  a("Traffic Light Check", "Emotional Regulation", "Focus", 3, "Standard", 15, "Stop, think, then move forward"),
  a("Size of the Problem", "Emotional Regulation", "Bloom", 4, "Challenging", 20, "Match reactions to problem size"),
  a("Emotion-to-Need Match", "Emotional Regulation", "Bloom", 4, "Challenging", 20, "Connect your feeling to needs"),
  a("Coping Card Match", "Emotional Regulation", "Bloom", 3, "Standard", 15, "Choose a helpful coping strategy"),
  a("Kind Self-Talk", "Emotional Regulation", "Bloom", 3, "Standard", 15, "Replace criticism with supportive words"),
  a("Reframe the Thought", "Emotional Regulation", "Bloom", 5, "Challenging", 25, "Find a more balanced perspective"),
  a("Worry Container", "Emotional Regulation", "Calm", 4, "Challenging", 20, "Set worries aside temporarily"),
  a("Anger Cooldown", "Emotional Regulation", "Calm", 4, "Challenging", 20, "Lower anger before taking action"),
  a("Ask for Help Practice", "Emotional Regulation", "Bloom", 3, "Standard", 15, "Practice requesting support clearly"),
  a("Boundary Builder", "Emotional Regulation", "Bloom", 4, "Challenging", 20, "Practice setting respectful personal boundaries"),
  a("Opposite Action Mini-Step", "Emotional Regulation", "Bloom", 4, "Challenging", 25, "Choose a healthier opposite action"),
  a("Emotion Charades", "Emotional Regulation", "Bloom", 3, "Standard", 15, "Act out and identify emotions"),
];

export const CATEGORY_ICON: Record<Category, string> = {
  Breathing: "🌬️",
  Mindfulness: "🧘",
  Grounding: "🌿",
  Journaling: "📓",
  "Stress Reset": "💆",
  "Emotional Regulation": "💗",
};

const DIFFICULTY_RANK: Record<Difficulty, number> = { Light: 1, Standard: 2, Challenging: 3 };

/** Score + reorder so prefs come earlier and no >2 same-category in a row. */
export function prioritize(activities: Activity[], prefs: Prefs): Activity[] {
  const scored = activities.map((act) => {
    let score = 0;
    if (prefs.themes.includes(act.theme)) score += 6;
    if (prefs.categories.includes(act.category)) score += 4;
    if (prefs.difficulties.includes(act.difficulty)) score += 2;
    score -= DIFFICULTY_RANK[act.difficulty] * 0.5;
    score -= act.minutes * 0.15;
    return { act, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const ordered = scored.map((s) => s.act);
  // Break runs of same category > 2
  for (let i = 2; i < ordered.length; i++) {
    if (
      ordered[i].category === ordered[i - 1].category &&
      ordered[i - 1].category === ordered[i - 2].category
    ) {
      // find next item with different category to swap
      for (let j = i + 1; j < ordered.length; j++) {
        if (ordered[j].category !== ordered[i].category) {
          const tmp = ordered[i];
          ordered[i] = ordered[j];
          ordered[j] = tmp;
          break;
        }
      }
    }
  }
  return ordered;
}

/** Pathway item — activity or milestone chest. */
export type PathItem =
  | { kind: "activity"; activity: Activity; activityIndex: number }
  | { kind: "chest"; chestIndex: number };

export function buildPathway(activities: Activity[]): PathItem[] {
  const items: PathItem[] = [];
  activities.forEach((activity, i) => {
    items.push({ kind: "activity", activity, activityIndex: i });
    if ((i + 1) % 5 === 0) items.push({ kind: "chest", chestIndex: Math.floor(i / 5) });
  });
  return items;
}

/* ───────── Levels ───────── */

export type LevelDef = { name: string; threshold: number };
export const LEVELS: LevelDef[] = [
  { name: "New Sprout", threshold: 0 },
  { name: "Growing Learner", threshold: 100 },
  { name: "Steady Practicer", threshold: 250 },
  { name: "Calm Builder", threshold: 450 },
  { name: "Bloom Cultivator", threshold: 700 },
  { name: "Mindful Mentor", threshold: 1000 },
  { name: "Wellness Guide", threshold: 1350 },
  { name: "Garden Keeper", threshold: 1750 },
  { name: "Bloom Master", threshold: 2200 },
  { name: "Bloom Sage", threshold: 2700 },
];

export function levelInfo(xp: number) {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].threshold) idx = i;
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1];
  const start = current.threshold;
  const end = next ? next.threshold : start + 500;
  return {
    level: idx + 1,
    name: current.name,
    into: xp - start,
    span: end - start,
    pct: Math.min(100, Math.round(((xp - start) / (end - start)) * 100)),
    isMax: !next,
    nextThreshold: end,
  };
}

/* ───────── Daily quests ───────── */

export type QuestKind =
  | "complete-1"
  | "earn-25"
  | "minutes-10"
  | "category-calm"
  | "category-focus"
  | "category-bloom"
  | "category-journal"
  | "two-categories";

export type Quest = {
  id: QuestKind;
  title: string;
  goal: number;
  icon: string;
  measure: "count" | "xp" | "minutes" | "categories";
};

const QUEST_POOL: Quest[] = [
  { id: "complete-1", title: "Complete 1 Build Skill", goal: 1, icon: "🎯", measure: "count" },
  { id: "earn-25", title: "Earn 25 XP This Week", goal: 25, icon: "⚡", measure: "xp" },
  { id: "minutes-10", title: "Practice for 10 minutes", goal: 10, icon: "⏱️", measure: "minutes" },
  { id: "category-calm", title: "Complete one Calm activity", goal: 1, icon: "🌊", measure: "count" },
  { id: "category-focus", title: "Complete one Focus activity", goal: 1, icon: "🎯", measure: "count" },
  { id: "category-bloom", title: "Complete one Bloom activity", goal: 1, icon: "🌸", measure: "count" },
  { id: "category-journal", title: "Complete one Journaling activity", goal: 1, icon: "📓", measure: "count" },
  { id: "two-categories", title: "Complete two different categories", goal: 2, icon: "🌈", measure: "categories" },
];

export function pickDailyQuests(seed: string): Quest[] {
  // Simple hash to rotate quests daily
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const idx = Math.abs(h) % QUEST_POOL.length;
  const set = new Set<number>();
  let i = idx;
  while (set.size < 3) {
    set.add(i % QUEST_POOL.length);
    i++;
  }
  return [...set].map((k) => QUEST_POOL[k]);
}

export type QuestProgress = Record<QuestKind, { progress: number; categoriesSeen?: string[] }>;

export function emptyQuestProgress(): QuestProgress {
  return {
    "complete-1": { progress: 0 },
    "earn-25": { progress: 0 },
    "minutes-10": { progress: 0 },
    "category-calm": { progress: 0 },
    "category-focus": { progress: 0 },
    "category-bloom": { progress: 0 },
    "category-journal": { progress: 0 },
    "two-categories": { progress: 0, categoriesSeen: [] },
  };
}

export function advanceQuests(qp: QuestProgress, act: Activity): QuestProgress {
  const next: QuestProgress = JSON.parse(JSON.stringify(qp));
  next["complete-1"].progress = Math.min(1, next["complete-1"].progress + 1);
  next["earn-25"].progress = Math.min(25, next["earn-25"].progress + act.xp);
  next["minutes-10"].progress = Math.min(10, next["minutes-10"].progress + act.minutes);
  if (act.theme === "Calm") next["category-calm"].progress = 1;
  if (act.theme === "Focus") next["category-focus"].progress = 1;
  if (act.theme === "Bloom") next["category-bloom"].progress = 1;
  if (act.category === "Journaling") next["category-journal"].progress = 1;
  const seen = new Set(next["two-categories"].categoriesSeen ?? []);
  seen.add(act.category);
  next["two-categories"].categoriesSeen = [...seen];
  next["two-categories"].progress = Math.min(2, seen.size);
  return next;
}

/* ───────── Shared prefs hook (localStorage + cross-component sync) ───────── */

const PREFS_KEY = "mb_buildskills_prefs_v1";
const COMPLETED_KEY = "mb_buildskills_completed_v1";
const XP_KEY = "mb_buildskills_xp_v2";
const QUESTS_KEY = "mb_buildskills_quests_v1";
const PREFS_EVENT = "mb-buildskills-prefs";

export const DEFAULT_PREFS: Prefs = {
  themes: [],
  categories: [],
  difficulties: [],
};

function readPrefs(): Prefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as Prefs) : null;
  } catch {
    return null;
  }
}

export function usePrefs(): {
  prefs: Prefs | null;
  setPrefs: (p: Prefs) => void;
  hasPrefs: boolean;
} {
  const [prefs, setPrefsState] = useState<Prefs | null>(() => readPrefs());

  useEffect(() => {
    const sync = () => setPrefsState(readPrefs());
    window.addEventListener(PREFS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PREFS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setPrefs = (p: Prefs) => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(p));
    } catch {
      /* ignore */
    }
    setPrefsState(p);
    window.dispatchEvent(new CustomEvent(PREFS_EVENT));
  };

  return { prefs, setPrefs, hasPrefs: !!prefs };
}

export function useLocalState<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [v, setV] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const update = (next: T | ((prev: T) => T)) => {
    setV((prev) => {
      const value = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* ignore */
      }
      return value;
    });
  };
  return [v, update];
}

export const STORAGE_KEYS = {
  COMPLETED: COMPLETED_KEY,
  XP: XP_KEY,
  QUESTS: QUESTS_KEY,
};
