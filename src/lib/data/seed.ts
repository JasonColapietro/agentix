/**
 * Deterministic seed data for Agentix.
 *
 * Everything here is anchored to a fixed `SEED_NOW` and driven by a seeded PRNG,
 * so the dashboard renders identical numbers on every request (no flicker, no
 * server/client mismatch) until the real earnings source is wired behind the
 * same PortfolioProvider interface. Shapes match the builder's settlement
 * reality: creator revenue = settled calls × price × (1 − platform take).
 */
import type { Agent, AgentStatus, DailyRoll, Earning } from "./types";

/** Mirrors the builder's PLATFORM_TAKE_RATE (5%). */
export const PLATFORM_TAKE_RATE = 0.05;

/** Demo owner payout wallet (Base). */
export const DEFAULT_OWNER = "0xA9e4F1b2C3d4E5F6a7B8c9D0e1F2a3B4c5D6E7f8";

/** Fixed clock so seed output is stable and deterministic. */
export const SEED_NOW = new Date("2026-06-30T16:00:00.000Z");

/** How many days of history the charts span. */
export const WINDOW_DAYS = 90;

const MS_DAY = 86_400_000;

interface SeedSpec {
  id: string;
  name: string;
  slug: string;
  category: string;
  priceUsdc: number;
  status: AgentStatus;
  launchedDaysAgo: number;
  /** Calls/day around launch, before drift. */
  baseCalls: number;
  /** Daily multiplicative drift (1.0 flat, >1 growing, <1 decaying). */
  growth: number;
  /** Noise amplitude, 0..1. */
  volatility: number;
  /** Baseline fraction of calls that error. */
  errorRate: number;
  /** Recent-event shaping. */
  shape?: "cliff" | "pause" | "ramp";
  /** Days-ago the shape event kicks in. */
  eventDaysAgo?: number;
}

/**
 * A portfolio built to exercise every status and the full signal palette:
 * a clear top earner, two healthy growers, one degraded high-ticket agent,
 * one that fell off a cliff, one still in draft (not settling), one paused.
 */
const SPECS: SeedSpec[] = [
  {
    id: "agt_lyric_doctor",
    name: "Lyric Doctor",
    slug: "lyric-doctor",
    category: "Lyrics",
    priceUsdc: 0.25,
    status: "live",
    launchedDaysAgo: 89,
    baseCalls: 18,
    growth: 1.018,
    volatility: 0.22,
    errorRate: 0.015,
    shape: "ramp",
  },
  {
    id: "agt_stem_splitter",
    name: "Stem Splitter",
    slug: "stem-splitter",
    category: "Audio",
    priceUsdc: 0.5,
    status: "live",
    launchedDaysAgo: 74,
    baseCalls: 11,
    growth: 1.012,
    volatility: 0.2,
    errorRate: 0.02,
  },
  {
    id: "agt_hook_finder",
    name: "Hook Finder",
    slug: "hook-finder",
    category: "Discovery",
    priceUsdc: 0.1,
    status: "live",
    launchedDaysAgo: 48,
    baseCalls: 22,
    growth: 1.035,
    volatility: 0.3,
    errorRate: 0.01,
    shape: "ramp",
  },
  {
    id: "agt_royalty_router",
    name: "Royalty Router",
    slug: "royalty-router",
    category: "Royalties",
    priceUsdc: 1.0,
    status: "degraded",
    launchedDaysAgo: 62,
    baseCalls: 6,
    growth: 1.004,
    volatility: 0.25,
    errorRate: 0.16,
    shape: "cliff",
    eventDaysAgo: 4,
  },
  {
    id: "agt_cover_art_forge",
    name: "Cover Art Forge",
    slug: "cover-art-forge",
    category: "Artwork",
    priceUsdc: 0.35,
    status: "down",
    launchedDaysAgo: 33,
    baseCalls: 9,
    growth: 1.01,
    volatility: 0.28,
    errorRate: 0.03,
    shape: "cliff",
    eventDaysAgo: 2,
  },
  {
    id: "agt_sync_scout",
    name: "Sync Scout",
    slug: "sync-scout",
    category: "Discovery",
    priceUsdc: 0.15,
    status: "paused",
    launchedDaysAgo: 80,
    baseCalls: 8,
    growth: 1.006,
    volatility: 0.2,
    errorRate: 0.02,
    shape: "pause",
    eventDaysAgo: 9,
  },
  {
    id: "agt_master_bus",
    name: "Master Bus",
    slug: "master-bus",
    category: "Mastering",
    priceUsdc: 0.2,
    status: "draft",
    launchedDaysAgo: 12,
    baseCalls: 0,
    growth: 1,
    volatility: 0,
    errorRate: 0,
  },
];

// ── deterministic PRNG ────────────────────────────────────────────────────
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** UTC YYYY-MM-DD for a Date. */
export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** The window of day-keys the charts span, oldest → newest (length WINDOW_DAYS). */
export function windowDays(now: Date = SEED_NOW): string[] {
  const end = startOfUtcDay(now);
  const days: string[] = [];
  for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
    days.push(dayKey(new Date(end.getTime() - i * MS_DAY)));
  }
  return days;
}

function creatorShare(gross: number): number {
  return round2(gross * (1 - PLATFORM_TAKE_RATE));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ── generation ─────────────────────────────────────────────────────────────
function buildAgent(spec: SeedSpec): Agent {
  const launchedAt = new Date(
    startOfUtcDay(SEED_NOW).getTime() - spec.launchedDaysAgo * MS_DAY + 11 * 3600_000,
  ).toISOString();
  return {
    id: spec.id,
    name: spec.name,
    slug: spec.slug,
    ownerWallet: DEFAULT_OWNER,
    x402Url: `https://agents.suedeai.ai/a/${spec.slug}`,
    priceUsdc: spec.priceUsdc,
    category: spec.category,
    launchedAt,
    status: spec.status,
  };
}

/** Generate the full daily series for one agent across the chart window. */
function buildDaily(spec: SeedSpec, now: Date = SEED_NOW): DailyRoll[] {
  const rng = mulberry32(hashStr(spec.id));
  const end = startOfUtcDay(now);
  const rolls: DailyRoll[] = [];

  for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
    const date = new Date(end.getTime() - i * MS_DAY);
    const daysAgo = i;
    const tSinceLaunch = spec.launchedDaysAgo - daysAgo; // age in days on this date
    if (tSinceLaunch < 0) continue; // agent didn't exist yet

    let calls = 0;
    let errors = 0;

    if (spec.status !== "draft") {
      const drift = Math.pow(spec.growth, tSinceLaunch);
      const dow = date.getUTCDay();
      const weekend = dow === 0 || dow === 6 ? 0.68 : 1;
      const noise = 1 + (rng() * 2 - 1) * spec.volatility;
      let expected = spec.baseCalls * drift * weekend * noise;

      // Recent-event shaping.
      if (spec.shape === "cliff" && spec.eventDaysAgo != null && daysAgo <= spec.eventDaysAgo) {
        expected *= spec.status === "down" ? 0 : 0.18; // down = silent, degraded = limping
      }
      if (spec.shape === "pause" && spec.eventDaysAgo != null && daysAgo <= spec.eventDaysAgo) {
        expected = 0;
      }
      if (spec.shape === "ramp") {
        expected *= 0.6 + 0.4 * (tSinceLaunch / Math.max(1, spec.launchedDaysAgo));
      }

      calls = Math.max(0, Math.round(expected));
      const errRate = spec.errorRate * (spec.status === "degraded" && daysAgo <= 6 ? 2.4 : 1);
      errors = Math.min(calls, Math.round(calls * errRate + (rng() < 0.04 ? rng() * 3 : 0)));
    }

    const settled = Math.max(0, calls - errors);
    rolls.push({
      agentId: spec.id,
      day: dayKey(date),
      calls,
      revenueUsdc: creatorShare(settled * spec.priceUsdc),
      errors,
    });
  }
  return rolls;
}

/** Synthesize recent paid-call rows from the tail of the daily series. */
function buildRecentRuns(spec: SeedSpec, daily: DailyRoll[], limit = 14): Earning[] {
  const rng = mulberry32(hashStr(spec.id + ":runs"));
  const runs: Earning[] = [];
  // Walk newest → oldest days, emitting individual calls until we hit the limit.
  for (let d = daily.length - 1; d >= 0 && runs.length < limit; d--) {
    const roll = daily[d];
    const dayStart = new Date(`${roll.day}T00:00:00.000Z`).getTime();
    let remainingErrors = roll.errors;
    const count = Math.min(roll.calls, limit - runs.length);
    for (let c = 0; c < count; c++) {
      const settled = remainingErrors > 0 && rng() < 0.5 ? (remainingErrors--, false) : true;
      const tsMs = dayStart + Math.floor(rng() * MS_DAY * 0.92);
      runs.push({
        agentId: spec.id,
        ts: new Date(tsMs).toISOString(),
        callId: hex(rng, 16),
        grossUsdc: spec.priceUsdc,
        amountUsdc: settled ? creatorShare(spec.priceUsdc) : 0,
        settled,
      });
    }
  }
  return runs.sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, limit);
}

function hex(rng: () => number, len: number): string {
  let s = "0x";
  for (let i = 0; i < len; i++) s += Math.floor(rng() * 16).toString(16);
  return s;
}

// ── public surface ───────────────────────────────────────────────────────
export interface SeedAgentData {
  agent: Agent;
  daily: DailyRoll[];
  recentRuns: Earning[];
}

/** Build the entire deterministic dataset once. */
export function buildSeedData(now: Date = SEED_NOW): SeedAgentData[] {
  return SPECS.map((spec) => {
    const daily = buildDaily(spec, now);
    return {
      agent: buildAgent(spec),
      daily,
      recentRuns: buildRecentRuns(spec, daily),
    };
  });
}
