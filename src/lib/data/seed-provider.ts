/**
 * SeedProvider — implements PortfolioProvider over the deterministic seed data.
 * This is what renders the dashboard today. When open question #1 (earnings
 * source of truth) is resolved, a SettlementDbProvider / BuilderApiProvider can
 * be dropped in behind the same interface with zero UI changes.
 */
import type {
  AgentDetail,
  AgentStats,
  AgentWithStats,
  DailyPoint,
  DailyRoll,
  PortfolioProvider,
  PortfolioSummary,
} from "./types";
import {
  buildSeedData,
  PLATFORM_TAKE_RATE,
  SEED_NOW,
  WINDOW_DAYS,
  windowDays,
  type SeedAgentData,
} from "./seed";

// Build once per process — deterministic, so memoizing is safe.
let CACHE: SeedAgentData[] | null = null;
function data(): SeedAgentData[] {
  if (!CACHE) CACHE = buildSeedData();
  return CACHE;
}

function sum(ns: number[]): number {
  return ns.reduce((a, b) => a + b, 0);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function lastN<T>(arr: T[], n: number): T[] {
  return arr.slice(Math.max(0, arr.length - n));
}

function statsFor(d: SeedAgentData): AgentStats {
  const calls = sum(d.daily.map((r) => r.calls));
  const revenueUsdc = round2(sum(d.daily.map((r) => r.revenueUsdc)));
  const errors = sum(d.daily.map((r) => r.errors));
  const grossUsdc = round2(calls * d.agent.priceUsdc);
  const lastActiveAt = d.recentRuns[0]?.ts ?? null;
  const spark = lastN(d.daily, 7).map((r) => r.revenueUsdc);
  return { calls, revenueUsdc, grossUsdc, errors, lastActiveAt, spark };
}

function withStats(d: SeedAgentData): AgentWithStats {
  return { ...d.agent, stats: statsFor(d) };
}

/** Revenue change: last 7 days vs the prior 7 days, as a fraction. */
function delta7d(daily: DailyRoll[]): number {
  const last7 = sum(lastN(daily, 7).map((r) => r.revenueUsdc));
  const prior7 = sum(lastN(daily.slice(0, -7), 7).map((r) => r.revenueUsdc));
  if (prior7 === 0) return last7 > 0 ? Infinity : 0;
  return (last7 - prior7) / prior7;
}

export class SeedProvider implements PortfolioProvider {
  readonly sourceLabel = "seed data (demo)";

  async listAgents(_ownerWallet: string): Promise<AgentWithStats[]> {
    return data()
      .map(withStats)
      .sort((a, b) => b.stats.revenueUsdc - a.stats.revenueUsdc);
  }

  async getSummary(ownerWallet: string): Promise<PortfolioSummary> {
    const agents = data();
    const days = windowDays();

    // Index revenue/calls/errors by day for fast portfolio rollup.
    const byDay = new Map<string, DailyPoint>(
      days.map((day) => [day, { day, calls: 0, revenueUsdc: 0, errors: 0 }]),
    );
    for (const a of agents) {
      for (const r of a.daily) {
        const pt = byDay.get(r.day);
        if (!pt) continue;
        pt.calls += r.calls;
        pt.revenueUsdc += r.revenueUsdc;
        pt.errors += r.errors;
      }
    }
    const trend = days.map((day) => {
      const pt = byDay.get(day)!;
      return { ...pt, revenueUsdc: round2(pt.revenueUsdc) };
    });

    const totalRevenueUsdc = round2(sum(trend.map((p) => p.revenueUsdc)));
    const totalCalls = sum(trend.map((p) => p.calls));
    const totalGrossUsdc = round2(
      sum(agents.map((a) => statsFor(a).grossUsdc)),
    );

    const last7 = lastN(trend, 7);
    const prior7 = lastN(trend.slice(0, -7), 7);
    const revenue7d = round2(sum(last7.map((p) => p.revenueUsdc)));
    const priorRevenue = sum(prior7.map((p) => p.revenueUsdc));
    const delta = priorRevenue === 0 ? (revenue7d > 0 ? Infinity : 0) : (revenue7d - priorRevenue) / priorRevenue;

    // "Active" = a call landed in the last 7 days.
    const recentCallsByAgent = new Map<string, number>();
    for (const a of agents) {
      recentCallsByAgent.set(a.agent.id, sum(lastN(a.daily, 7).map((r) => r.calls)));
    }
    const activeAgents = [...recentCallsByAgent.values()].filter((c) => c > 0).length;

    return {
      ownerWallet,
      totalRevenueUsdc,
      totalGrossUsdc,
      totalCalls,
      activeAgents,
      agentCount: agents.length,
      platformTakeRate: PLATFORM_TAKE_RATE,
      trend,
      delta7d: delta,
      revenue7d,
    };
  }

  async getAgent(agentId: string): Promise<AgentDetail | null> {
    const d = data().find((x) => x.agent.id === agentId || x.agent.slug === agentId);
    if (!d) return null;
    return {
      ...withStats(d),
      daily: d.daily,
      recentRuns: d.recentRuns,
      delta7d: delta7d(d.daily),
    };
  }
}

/** Exposed for tests + the seed-window-aware UI (footer "as of" line). */
export const seedMeta = { now: SEED_NOW, windowDays: WINDOW_DAYS };
