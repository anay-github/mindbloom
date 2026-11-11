// MindBloom AI — shared, explainable pattern-detection layer (mock data).
//
// IMPORTANT: This is a supportive wellness tool. It does NOT diagnose any
// mental health condition. Every insight is a starting point for a trusted
// adult to consider — not a label for a student.

export type SupportStatus = "On Track" | "Watch" | "Support";
export type Confidence = "Low" | "Moderate" | "Strong";

export type StudentSignals = {
  id: string;
  name: string;
  grade: string;
  // 14-day daily series (0–10 scale, higher = better, except stress where higher = more stress)
  mood14: number[];
  stress14: number[];
  sleep14: number[];
  energy14: number[];
  // Last 7 days
  activityCompletion: number; // 0–1
  missedRoutines: number; // count
  // Trend
  weeklyCheckins: number[]; // last 4 weeks
  participation: number[]; // last 4 weeks (0–10)
  reflectionSentiment: number[]; // last 7 days (0–1, higher = more positive)
};

export type Insight = {
  studentId: string;
  status: SupportStatus;
  confidence: Confidence;
  patternTitle: string;
  signalChips: string[]; // small explainable chips
  message: string; // combined narrative
  nextStep: string;
  whatChanged: string;
  whyItMatters: string;
  daysObserved: number;
  signalsUsed: string[]; // for explain modal
};

const avg = (a: number[]) => (a.length ? a.reduce((s, n) => s + n, 0) / a.length : 0);
const last = (a: number[], n: number) => a.slice(-n);
const prev = (a: number[], n: number) => a.slice(-(2 * n), -n);

/** Compare last `window` days to the prior `window` days against the student's own baseline. */
function deltaVsBaseline(series: number[], window = 5): number {
  if (series.length < window * 2) return 0;
  return avg(last(series, window)) - avg(prev(series, window));
}

/** Count consecutive days at end where predicate(v) is true. */
function streakAtEnd(series: number[], pred: (v: number) => boolean): number {
  let c = 0;
  for (let i = series.length - 1; i >= 0; i--) {
    if (pred(series[i])) c++;
    else break;
  }
  return c;
}

export function analyzeStudent(s: StudentSignals): Insight {
  const stressDelta = deltaVsBaseline(s.stress14, 5); // + = more stress recently
  const moodDelta = deltaVsBaseline(s.mood14, 5);
  const sleepDelta = deltaVsBaseline(s.sleep14, 5);
  const energyDelta = deltaVsBaseline(s.energy14, 5);

  const stressStreak = streakAtEnd(s.stress14, (v) => v >= 6);
  const lowMoodStreak = streakAtEnd(s.mood14, (v) => v <= 4);
  const lowSleepStreak = streakAtEnd(s.sleep14, (v) => v <= 4);

  const participationDrop =
    s.participation.length >= 3 &&
    s.participation[s.participation.length - 1] <
      s.participation[0] - 1.5;

  // Build signal list (only meaningful ones)
  const chips: string[] = [];
  const used: string[] = [];

  if (stressDelta >= 1 || stressStreak >= 3) {
    chips.push("Stress higher than usual");
    used.push("Stress check-ins (14 days)");
  }
  if (sleepDelta <= -1 || lowSleepStreak >= 3) {
    chips.push("Sleep lower this week");
    used.push("Sleep quality (14 days)");
  }
  if (moodDelta <= -1 || lowMoodStreak >= 3) {
    chips.push("Mood slightly lower");
    used.push("Mood check-ins (14 days)");
  }
  if (energyDelta <= -1) {
    chips.push("Energy lower than usual");
    used.push("Energy check-ins");
  }
  if (s.missedRoutines >= 2) {
    chips.push(`${s.missedRoutines} missed activities`);
    used.push("Wellness routine completion");
  }
  if (s.activityCompletion < 0.5) {
    chips.push("Activity completion down");
    used.push("Skill activity completion");
  }
  if (participationDrop) {
    chips.push("Participation trending lower");
    used.push("Weekly participation trend");
  }
  if (avg(s.reflectionSentiment) < 0.4) {
    chips.push("Reflection tone shifting");
    used.push("Reflection sentiment (private — tone only)");
  }

  const signalCount = chips.length;
  const daysObserved = Math.max(stressStreak, lowMoodStreak, lowSleepStreak, 1);

  // Decide status with anti-false-alarm rules:
  //  - Never escalate to Support from one bad day.
  //  - Need 3+ signals OR a multi-day repeated pattern.
  let status: SupportStatus = "On Track";
  let confidence: Confidence = "Low";

  if (signalCount === 0) {
    status = "On Track";
    confidence = "Low";
  } else if (signalCount === 1 && daysObserved < 3) {
    status = "On Track"; // one-off — gentle suggestion only
    confidence = "Low";
  } else if (signalCount <= 2 && daysObserved >= 3) {
    status = "Watch";
    confidence = "Moderate";
  } else if (signalCount >= 3) {
    status = "Support";
    confidence = daysObserved >= 5 ? "Strong" : "Moderate";
  }

  // Narrative
  const firstName = s.name.split(" ")[0];
  const message =
    status === "Support"
      ? `${firstName}'s stress has been higher than usual across ${Math.max(stressStreak, 3)} check-ins, and ${chips.length - 1} other signals shifted this week. A supportive counselor check-in may be helpful.`
      : status === "Watch"
        ? `${firstName} is showing a gentle shift across ${chips.length} signal${chips.length === 1 ? "" : "s"} over the last few days. Light-touch monitoring suggested.`
        : `${firstName}'s patterns look steady compared to their usual baseline. Keep encouraging small daily habits.`;

  const nextStep =
    status === "Support"
      ? "Offer a supportive check-in and suggest a short calming activity."
      : status === "Watch"
        ? "Send a brief encouraging note; recommend a calming skill (Box Breathing or Body Scan)."
        : "No action needed — keep encouraging steady habits.";

  const patternTitle =
    status === "Support"
      ? "Repeated pattern across multiple wellness signals"
      : status === "Watch"
        ? "Gentle shift noticed in recent check-ins"
        : "Steady wellness pattern";

  const whatChanged =
    chips.length > 0
      ? `Recent ${daysObserved}-day window vs. ${firstName}'s own baseline shows: ${chips.join(", ")}.`
      : `No meaningful change vs. ${firstName}'s own baseline.`;

  const whyItMatters =
    status === "Support"
      ? "Patterns that repeat across multiple signals over several days are more meaningful than a single low check-in. A trusted adult is best placed to follow up."
      : status === "Watch"
        ? "A gentle pattern can fade on its own — a small encouragement now often helps it pass."
        : "On Track patterns mean current supports are working — keep them in place.";

  return {
    studentId: s.id,
    status,
    confidence,
    patternTitle,
    signalChips: chips,
    message,
    nextStep,
    whatChanged,
    whyItMatters,
    daysObserved,
    signalsUsed: used.length ? used : ["Mood, stress, sleep, energy (14-day baseline)"],
  };
}

/* ───────────── Mock students ───────────── */

export const MOCK_STUDENTS: StudentSignals[] = [
  {
    id: "maya",
    name: "Sam T.",
    grade: "Grade 10",
    mood14: [7, 7, 6, 7, 6, 6, 6, 5, 5, 4, 5, 4, 4, 4],
    stress14: [3, 4, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 7],
    sleep14: [7, 7, 6, 7, 6, 6, 5, 5, 4, 4, 5, 4, 4, 3],
    energy14: [7, 7, 7, 6, 6, 6, 5, 5, 5, 4, 4, 4, 4, 4],
    activityCompletion: 0.35,
    missedRoutines: 4,
    weeklyCheckins: [5, 4, 3, 2],
    participation: [9, 8, 6, 5],
    reflectionSentiment: [0.6, 0.5, 0.5, 0.4, 0.3, 0.3, 0.3],
  },
  {
    id: "jordan",
    name: "Jordan K.",
    grade: "Grade 9",
    mood14: [8, 7, 7, 7, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5],
    stress14: [3, 3, 4, 4, 4, 4, 5, 5, 6, 6, 6, 6, 5, 6],
    sleep14: [7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 5, 6, 6, 5],
    energy14: [7, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6],
    activityCompletion: 0.65,
    missedRoutines: 1,
    weeklyCheckins: [5, 5, 4, 4],
    participation: [8, 8, 7, 7],
    reflectionSentiment: [0.6, 0.6, 0.5, 0.5, 0.5, 0.5, 0.5],
  },
  {
    id: "priya",
    name: "Priya N.",
    grade: "Grade 11",
    mood14: [7, 7, 7, 6, 6, 6, 5, 6, 6, 5, 5, 5, 6, 5],
    stress14: [4, 4, 5, 5, 5, 5, 6, 6, 5, 6, 6, 6, 5, 6],
    sleep14: [7, 7, 6, 6, 6, 6, 5, 5, 6, 5, 5, 5, 5, 5],
    energy14: [7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
    activityCompletion: 0.7,
    missedRoutines: 1,
    weeklyCheckins: [5, 5, 5, 4],
    participation: [8, 8, 7, 7],
    reflectionSentiment: [0.5, 0.5, 0.4, 0.4, 0.4, 0.4, 0.4],
  },
  {
    id: "sam",
    name: "John D.",
    grade: "Grade 10",
    mood14: [7, 7, 7, 8, 7, 8, 7, 8, 8, 7, 8, 8, 8, 8],
    stress14: [3, 3, 3, 2, 3, 3, 3, 2, 3, 3, 2, 3, 3, 2],
    sleep14: [7, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 8, 7, 8],
    energy14: [7, 8, 7, 8, 7, 8, 8, 8, 7, 8, 8, 8, 8, 8],
    activityCompletion: 0.9,
    missedRoutines: 0,
    weeklyCheckins: [5, 5, 5, 5],
    participation: [9, 9, 9, 9],
    reflectionSentiment: [0.7, 0.7, 0.7, 0.8, 0.7, 0.8, 0.8],
  },
  {
    id: "alex",
    name: "Alex P.",
    grade: "Grade 11",
    mood14: [7, 8, 8, 8, 7, 8, 8, 8, 8, 9, 8, 9, 8, 9],
    stress14: [3, 2, 3, 3, 2, 3, 2, 3, 2, 2, 3, 2, 2, 2],
    sleep14: [8, 8, 8, 8, 9, 8, 9, 8, 9, 8, 9, 9, 8, 9],
    energy14: [8, 8, 9, 8, 8, 9, 9, 8, 9, 9, 9, 9, 9, 10],
    activityCompletion: 0.95,
    missedRoutines: 0,
    weeklyCheckins: [5, 5, 5, 5],
    participation: [9, 9, 10, 10],
    reflectionSentiment: [0.8, 0.8, 0.8, 0.9, 0.8, 0.9, 0.9],
  },
];

export const STATUS_TONE: Record<SupportStatus, "coral" | "sky" | "leaf"> = {
  Support: "coral",
  Watch: "sky",
  "On Track": "leaf",
};

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  Low: "Low pattern confidence",
  Moderate: "Moderate pattern confidence",
  Strong: "Strong repeated pattern",
};
