/**
 * Pure read-model computation. Both the seed demo and the manual-input store
 * feed (agents + daily rolls) through here, so they render identically.
 *
 * Take-rate agnostic: `DailyRoll.revenueUsdc` is whatever revenue the source
 * recorded (the seed already nets its 5% example take; manually-entered revenue
 * is taken verbatim). `grossUsdc` is list price × calls — the spread vs revenue
 * reads as unsettled / discounted.
 */
import type {
  Agent,
  AgentDetail,
  AgentStats,
  AgentWithStats,
  DailyPoint,
  DailyRoll,
  Earning,
  PortfolioSummary,
} from "./types";
import { windowKeys } from "./dates";

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);
const round2 = (n: number) => Math.round(n * 100) / 100;
const lastN = <T,>(arr: T[], n: number): T[] => arr.slice(Math.max(0, arr.length - n));

function lastActiveFromDaily(daily: DailyRoll[]): string | null {
  for (let i = daily.length - 1; i >= 0; i--) {
    if (daily[i].calls > 0) return `${daily[i].day}T12:00:00.000Z`;
  }
  return null;
}

export function statsFor(agent: Agent, daily: DailyRoll[], runs?: Earning[]): AgentStats {
  const calls = sum(daily.map((r) => r.calls));
  const revenueUsdc = round2(sum(daily.map((r) => r.revenueUsdc)));
  const errors = sum(daily.map((r) => r.errors));
  const grossUsdc = round2(calls * agent.priceUsdc);
  const lastActiveAt = runs && runs.length ? runs[0].ts : lastActiveFromDaily(daily);
  const spark = lastN(daily, 7).map((r) => r.revenueUsdc);
  return { calls, revenueUsdc, grossUsdc, errors, lastActiveAt, spark };
}

/** Revenue change: last 7 days vs the prior 7, as a fraction (Infinity = brand new). */
export function delta7d(daily: DailyRoll[]): number {
  const last7 = sum(lastN(daily, 7).map((r) => r.revenueUsdc));
  const prior7 = sum(lastN(daily.slice(0, -7), 7).map((r) => r.revenueUsdc));
  if (prior7 === 0) return last7 > 0 ? Infinity : 0;
  return (last7 - prior7) / prior7;
}

export function withStatsAll(
  agents: Agent[],
  dailyByAgent: Map<string, DailyRoll[]>,
  runsByAgent?: Map<string, Earning[]>,
): AgentWithStats[] {
  return agents
    .map((a) => ({ ...a, stats: statsFor(a, dailyByAgent.get(a.id) ?? [], runsByAgent?.get(a.id)) }))
    .sort((x, y) => y.stats.revenueUsdc - x.stats.revenueUsdc);
}

export function detailFor(
  agent: Agent,
  daily: DailyRoll[],
  runs: Earning[],
  _now: Date,
): AgentDetail {
  return { ...agent, stats: statsFor(agent, daily, runs), daily, recentRuns: runs, delta7d: delta7d(daily) };
}

export function summarize(
  ownerWallet: string,
  agents: Agent[],
  daily: DailyRoll[],
  now: Date,
): PortfolioSummary {
  const days = windowKeys(now);
  const byDay = new Map<string, DailyPoint>(
    days.map((day) => [day, { day, calls: 0, revenueUsdc: 0, errors: 0 }]),
  );
  const callsByAgent = new Map<string, number>();
  const recentCallsByAgent = new Map<string, number>();
  const recentDays = new Set(lastN(days, 7));

  for (const r of daily) {
    const pt = byDay.get(r.day);
    if (pt) {
      pt.calls += r.calls;
      pt.revenueUsdc += r.revenueUsdc;
      pt.errors += r.errors;
    }
    callsByAgent.set(r.agentId, (callsByAgent.get(r.agentId) ?? 0) + r.calls);
    if (recentDays.has(r.day)) {
      recentCallsByAgent.set(r.agentId, (recentCallsByAgent.get(r.agentId) ?? 0) + r.calls);
    }
  }

  const trend = days.map((day) => {
    const pt = byDay.get(day)!;
    return { ...pt, revenueUsdc: round2(pt.revenueUsdc) };
  });

  const totalRevenueUsdc = round2(sum(trend.map((p) => p.revenueUsdc)));
  const totalCalls = sum(trend.map((p) => p.calls));
  const totalGrossUsdc = round2(sum(agents.map((a) => (callsByAgent.get(a.id) ?? 0) * a.priceUsdc)));

  const last7 = lastN(trend, 7);
  const prior7 = lastN(trend.slice(0, -7), 7);
  const revenue7d = round2(sum(last7.map((p) => p.revenueUsdc)));
  const priorRevenue = sum(prior7.map((p) => p.revenueUsdc));
  const delta = priorRevenue === 0 ? (revenue7d > 0 ? Infinity : 0) : (revenue7d - priorRevenue) / priorRevenue;
  const activeAgents = agents.filter((a) => (recentCallsByAgent.get(a.id) ?? 0) > 0).length;

  return {
    ownerWallet,
    totalRevenueUsdc,
    totalGrossUsdc,
    totalCalls,
    activeAgents,
    agentCount: agents.length,
    platformTakeRate: 0,
    trend,
    delta7d: delta,
    revenue7d,
  };
}
