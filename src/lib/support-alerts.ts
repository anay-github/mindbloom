// Shared mock store for "Support Alerts" — synced across student + counselor
// dashboards via localStorage. No backend. Supportive tone only.

import { useEffect, useState } from "react";

export type AlertStatus = "New" | "Reviewed" | "Scheduled";
export type AlertType =
  | "Support Recommended"
  | "Student Requested Support";

export type SupportAlert = {
  id: string;
  studentName: string;
  alertType: AlertType;
  reason: string;
  signals: string[];
  nextStep: string;
  status: AlertStatus;
  timePeriod: string;
  source: "ai" | "student";
  createdAt: number;
};

const KEY = "mb-support-alerts-v3";

const SEED: SupportAlert[] = [
  {
    id: "seed-maya",
    studentName: "Sam T.",
    alertType: "Support Recommended",
    reason: "Repeated changes across stress, sleep, and participation.",
    signals: ["Stress ↑ 3 of 5 days", "Sleep ↓ this week", "Participation ↓ 3 wks"],
    nextStep: "Schedule a supportive check-in this week.",
    status: "New",
    timePeriod: "Last 3 weeks vs Sam's usual pattern",
    source: "ai",
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: "seed-jordan",
    studentName: "Jordan K.",
    alertType: "Support Recommended",
    reason: "Mood gently lower across multiple days; streak recently broken.",
    signals: ["Mood ↓ 4 days", "Streak broken", "Reflection tone shifting"],
    nextStep: "Send a short encouraging note; suggest Box Breathing.",
    status: "Reviewed",
    timePeriod: "Last 7 days vs Jordan's usual pattern",
    source: "ai",
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
  },
  {
    id: "seed-anay-request",
    studentName: "John D.",
    alertType: "Student Requested Support",
    reason: "John asked to connect with a trusted adult.",
    signals: ["Direct student request", "Prefers in-person"],
    nextStep: "Reach out for a supportive check-in within 24 hours.",
    status: "New",
    timePeriod: "Today",
    source: "student",
    createdAt: Date.now() - 1000 * 60 * 30,
  },
];

function read(): SupportAlert[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(SEED));
      return SEED;
    }
    return JSON.parse(raw) as SupportAlert[];
  } catch {
    return SEED;
  }
}

function write(next: SupportAlert[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("mb-support-alerts-changed"));
}

export function useSupportAlerts() {
  const [alerts, setAlerts] = useState<SupportAlert[]>(() => read());

  useEffect(() => {
    const sync = () => setAlerts(read());
    window.addEventListener("storage", sync);
    window.addEventListener("mb-support-alerts-changed", sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(
        "mb-support-alerts-changed",
        sync as EventListener,
      );
    };
  }, []);

  function addAlert(a: Omit<SupportAlert, "id" | "createdAt" | "status"> & {
    status?: AlertStatus;
  }) {
    const next: SupportAlert = {
      ...a,
      id: `req-${Date.now()}`,
      createdAt: Date.now(),
      status: a.status ?? "New",
    };
    const all = [next, ...read()];
    write(all);
    setAlerts(all);
    return next;
  }

  function updateStatus(id: string, status: AlertStatus) {
    const all = read().map((a) => (a.id === id ? { ...a, status } : a));
    write(all);
    setAlerts(all);
  }

  return { alerts, addAlert, updateStatus };
}

export function requestCounselorCheckIn(studentName: string) {
  const all = read();
  const next: SupportAlert = {
    id: `req-${Date.now()}`,
    studentName,
    alertType: "Student Requested Support",
    reason: `${studentName} asked to connect with a trusted adult.`,
    signals: ["Student requested support directly"],
    nextStep: "Reach out for a supportive check-in this week",
    status: "New",
    timePeriod: "Just now",
    source: "student",
    createdAt: Date.now(),
  };
  write([next, ...all]);
  return next;
}
