/**
 * Grading engine. Each agent earns an S–F grade from five performance
 * dimensions; the portfolio grade is the revenue-weighted blend. Pure + tested.
 *
 *   revenue      — earnings, log-scaled against the portfolio's top earner
 *   growth       — last-7-days revenue change
 *   consistency  — steadiness of daily revenue (low variance scores high)
 *   reliability  — inverse of error rate
 *   activity     — recency of the last paid call
 */
import type { AgentStatus, DailyRoll, Grade, GradeBreakdown, GradeLetter } from "./types";

const WEIGHTS: GradeBreakdown = {
  revenue: 0.3,
  growth: 0.2,
  consistency: 0.15,
  reliability: 0.2,
  activity: 0.15,
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function letterFor(score: number): GradeLetter {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 68) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

export function gradeColor(letter: GradeLetter): string {
  switch (letter) {
    case "S":
      return "var(--violet)";
    case "A":
      return "var(--verified-emerald)";
    case "B":
      return "var(--registry-cyan)";
    case "C":
      return "var(--amber)";
    case "D":
      return "var(--warning-amber)";
    case "F":
      return "var(--rights-red)";
  }
}

export interface GradeInput {
  revenueUsdc: number;
  calls: number;
  errors: number;
  delta7d: number; // fraction; Infinity = brand new
  lastActiveAt: string | null;
  daily: DailyRoll[];
  status: AgentStatus;
  portfolioMaxRevenue: number;
  now: Date;
}

export function gradeAgent(input: GradeInput): Grade {
  // revenue — log-scaled vs the portfolio's top earner
  const max = Math.max(input.portfolioMaxRevenue, 1);
  const revenue = input.revenueUsdc <= 0 ? 0 : clamp01(0.25 + 0.75 * (Math.log1p(input.revenueUsdc) / Math.log1p(max)));

  // growth — centered on flat (0 → 0.5); ±50% maps to 0/1; "new" gets benefit of the doubt
  const growth = !Number.isFinite(input.delta7d) ? 0.7 : clamp01(0.5 + input.delta7d);

  // consistency — inverse coefficient of variation of recent active-day revenue
  const last30 = input.daily.slice(-30).map((d) => d.revenueUsdc);
  const active = last30.filter((v) => v > 0);
  let consistency: number;
  if (active.length < 3) {
    consistency = input.calls > 0 ? 0.4 : 0;
  } else {
    const mean = active.reduce((a, b) => a + b, 0) / active.length;
    const variance = active.reduce((a, b) => a + (b - mean) ** 2, 0) / active.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 1;
    consistency = clamp01(1 - cv);
  }

  // reliability — 20% error rate floors it
  const errRate = input.calls > 0 ? input.errors / input.calls : 0;
  const reliability = input.calls === 0 ? 0.5 : clamp01(1 - errRate * 5);

  // activity — recency of last paid call
  let activity = 0;
  if (input.lastActiveAt) {
    const days = (input.now.getTime() - new Date(input.lastActiveAt).getTime()) / 86_400_000;
    activity = days < 1 ? 1 : days < 3 ? 0.8 : days < 7 ? 0.55 : days < 14 ? 0.3 : 0.12;
  }
  if (input.status === "draft") activity = 0;

  const breakdown: GradeBreakdown = { revenue, growth, consistency, reliability, activity };
  let score =
    100 *
    (WEIGHTS.revenue * revenue +
      WEIGHTS.growth * growth +
      WEIGHTS.consistency * consistency +
      WEIGHTS.reliability * reliability +
      WEIGHTS.activity * activity);

  // status caps — a draft or dead endpoint can't grade well however it scores
  if (input.status === "draft") score = Math.min(score, 38);
  if (input.status === "down") score = Math.min(score, 55);
  if (input.status === "paused") score = Math.min(score, 62);

  score = Math.round(score);
  const letter = letterFor(score);
  return { letter, score, color: gradeColor(letter), breakdown };
}

/** Revenue-weighted portfolio grade (a floor weight keeps tiny agents counting). */
export function gradePortfolio(graded: { score: number; revenueUsdc: number }[]): Grade {
  const items = graded.filter((g) => Number.isFinite(g.score));
  if (items.length === 0) {
    const letter = letterFor(0);
    return { letter, score: 0, color: gradeColor(letter), breakdown: zero() };
  }
  const totalW = items.reduce((a, g) => a + Math.max(g.revenueUsdc, 1), 0);
  const score = Math.round(items.reduce((a, g) => a + g.score * Math.max(g.revenueUsdc, 1), 0) / totalW);
  const letter = letterFor(score);
  return { letter, score, color: gradeColor(letter), breakdown: zero() };
}

const zero = (): GradeBreakdown => ({ revenue: 0, growth: 0, consistency: 0, reliability: 0, activity: 0 });

export const GRADE_DIMENSIONS: { key: keyof GradeBreakdown; label: string }[] = [
  { key: "revenue", label: "Revenue" },
  { key: "growth", label: "Growth" },
  { key: "consistency", label: "Consistency" },
  { key: "reliability", label: "Reliability" },
  { key: "activity", label: "Activity" },
];
