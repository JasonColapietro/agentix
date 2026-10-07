/**
 * Deterministic seed data — the non-music **example portfolio** shown until the
 * operator adds their own agents. Anchored to a fixed `SEED_NOW` and driven by a
 * seeded PRNG, so it renders identical numbers on every request.
 *
 * These are generic x402 agents (scraping, code, markets, vision, NLP, maps,
 * compliance…), not Suede-music-specific — Agentix tracks whatever you launch.
 */
import type { Agent, AgentStatus, DailyRoll, Earning } from "./types";
import { dayKey, MS_DAY, startOfUtcDay, windowKeys, WINDOW_DAYS } from "./dates";

export { dayKey, WINDOW_DAYS };

/** Example take used only to net the seed's demo revenue; real entries are verbatim. */
export const PLATFORM_TAKE_RATE = 0.05;

/** Demo owner payout wallet (Base). */
export const DEFAULT_OWNER = "0xA9e4F1b2C3d4E5F6a7B8c9D0e1F2a3B4c5D6E7f8";

/** Fixed clock so seed output is stable and deterministic. */
export const SEED_NOW = new Date("2026-06-30T16:00:00.000Z");

export const windowDays = (now: Date = SEED_NOW): string[] => windowKeys(now);

interface SeedSpec {
  name: string;
  slug: string;
  category: string;
  buyer: string;
  useCase: string;
  directoryNote: string;
  priceUsdc: number;
  status: AgentStatus;
  launchedDaysAgo: number;
  baseCalls: number;
  growth: number;
  volatility: number;
  errorRate: number;
  shape?: "cliff" | "pause" | "ramp";
  eventDaysAgo?: number;
}

/**
 * A large, varied, non-music roster — every status represented, prices from
 * $0.02 to $1.00, high-volume cheap agents alongside low-volume premium ones.
 */
const SPECS: SeedSpec[] = [
  { name: "Web Scraper Pro", slug: "web-scraper-pro", category: "Scraping", buyer: "Data ops and price-intel teams", useCase: "Extract structured facts from target pages for downstream agents.", directoryNote: "High-volume crawler with steady paid demand.", priceUsdc: 0.08, status: "live", launchedDaysAgo: 89, baseCalls: 70, growth: 1.012, volatility: 0.25, errorRate: 0.02, shape: "ramp" },
  { name: "PDF Extractor", slug: "pdf-extractor", category: "Documents", buyer: "Ops teams with document intake queues", useCase: "Turn PDFs into normalized fields, tables, and summaries.", directoryNote: "Reliable document utility with clear recurring demand.", priceUsdc: 0.2, status: "live", launchedDaysAgo: 80, baseCalls: 24, growth: 1.01, volatility: 0.2, errorRate: 0.015 },
  { name: "Code Reviewer", slug: "code-reviewer", category: "Code", buyer: "Engineering teams and coding agents", useCase: "Review a diff and return ranked issues before human review.", directoryNote: "Premium-priced developer workflow with strong conversion potential.", priceUsdc: 0.5, status: "live", launchedDaysAgo: 70, baseCalls: 12, growth: 1.016, volatility: 0.22, errorRate: 0.02, shape: "ramp" },
  { name: "Sentiment Engine", slug: "sentiment-engine", category: "NLP", buyer: "Support, research, and brand teams", useCase: "Classify tone, risk, and intent from text at API speed.", directoryNote: "Cheap, high-frequency language rail with excellent retention.", priceUsdc: 0.05, status: "live", launchedDaysAgo: 85, baseCalls: 120, growth: 1.01, volatility: 0.3, errorRate: 0.01 },
  { name: "Geocode API", slug: "geocode-api", category: "Maps", buyer: "Logistics, delivery, and field-service apps", useCase: "Resolve messy addresses into coordinates and clean location data.", directoryNote: "Low-price infrastructure endpoint with broad usage.", priceUsdc: 0.02, status: "live", launchedDaysAgo: 88, baseCalls: 240, growth: 1.008, volatility: 0.2, errorRate: 0.005 },
  { name: "Translation Bot", slug: "translation-bot", category: "Language", buyer: "Global support and localization teams", useCase: "Translate messages and preserve labels for routed workflows.", directoryNote: "Useful utility, but category competition is high.", priceUsdc: 0.1, status: "live", launchedDaysAgo: 64, baseCalls: 30, growth: 1.012, volatility: 0.22, errorRate: 0.02 },
  { name: "Market Data Feed", slug: "market-data-feed", category: "Markets", buyer: "Trading dashboards and finance agents", useCase: "Return normalized market snapshots for automated briefings.", directoryNote: "Highest revenue listing in the current directory.", priceUsdc: 0.25, status: "live", launchedDaysAgo: 75, baseCalls: 40, growth: 1.014, volatility: 0.25, errorRate: 0.02, shape: "ramp" },
  { name: "OCR Vision", slug: "ocr-vision", category: "Vision", buyer: "Back-office automation teams", useCase: "Read text from images, scans, labels, and mobile photos.", directoryNote: "Early ramp with clear visual-workflow fit.", priceUsdc: 0.15, status: "live", launchedDaysAgo: 50, baseCalls: 20, growth: 1.03, volatility: 0.28, errorRate: 0.02, shape: "ramp" },
  { name: "Email Parser", slug: "email-parser", category: "Email", buyer: "RevOps, support, and inbox automation agents", useCase: "Extract sender intent, fields, and next action from inbound email.", directoryNote: "Reliable recurring workflow with simple adoption path.", priceUsdc: 0.06, status: "live", launchedDaysAgo: 72, baseCalls: 55, growth: 1.01, volatility: 0.2, errorRate: 0.015 },
  { name: "KYC Verifier", slug: "kyc-verifier", category: "Compliance", buyer: "Fintech and onboarding teams", useCase: "Screen identity artifacts and return pass, review, or reject.", directoryNote: "High-price compliance endpoint currently held back by reliability.", priceUsdc: 1.0, status: "degraded", launchedDaysAgo: 62, baseCalls: 7, growth: 1.004, volatility: 0.25, errorRate: 0.16, shape: "cliff", eventDaysAgo: 4 },
  { name: "Weather Oracle", slug: "weather-oracle", category: "Weather", buyer: "Travel, routing, and outdoor operations apps", useCase: "Answer weather-sensitive workflow questions from a single call.", directoryNote: "Durable utility endpoint with strong call volume.", priceUsdc: 0.03, status: "live", launchedDaysAgo: 90, baseCalls: 160, growth: 1.006, volatility: 0.2, errorRate: 0.008 },
  { name: "Stock Quote", slug: "stock-quote", category: "Markets", buyer: "Finance apps and research agents", useCase: "Return clean quote data and basic market context.", directoryNote: "Paused listing with historical demand worth restoring.", priceUsdc: 0.04, status: "paused", launchedDaysAgo: 80, baseCalls: 90, growth: 1.006, volatility: 0.2, errorRate: 0.01, shape: "pause", eventDaysAgo: 9 },
  { name: "Image Moderation", slug: "image-moderation", category: "Moderation", buyer: "Marketplaces and community products", useCase: "Classify images before publish or model ingestion.", directoryNote: "Clear trust-and-safety job with steady usage.", priceUsdc: 0.12, status: "live", launchedDaysAgo: 58, baseCalls: 26, growth: 1.012, volatility: 0.24, errorRate: 0.02 },
  { name: "SEO Auditor", slug: "seo-auditor", category: "SEO", buyer: "Content teams and site operators", useCase: "Score a URL and return fixes for metadata, structure, and search intent.", directoryNote: "Good buyer fit, but current downtime kills directory confidence.", priceUsdc: 0.3, status: "down", launchedDaysAgo: 33, baseCalls: 10, growth: 1.01, volatility: 0.28, errorRate: 0.03, shape: "cliff", eventDaysAgo: 2 },
  { name: "Summarizer", slug: "summarizer", category: "NLP", buyer: "Analysts, researchers, and agent workflows", useCase: "Condense long inputs into decision-ready summaries.", directoryNote: "Fast-rising commodity utility with healthy call velocity.", priceUsdc: 0.07, status: "live", launchedDaysAgo: 48, baseCalls: 60, growth: 1.025, volatility: 0.3, errorRate: 0.012, shape: "ramp" },
  { name: "Sports Odds", slug: "sports-odds", category: "Sports", buyer: "Sports apps and newsletter operators", useCase: "Normalize odds, matchup notes, and movement signals.", directoryNote: "Niche demand with a small but paying audience.", priceUsdc: 0.09, status: "live", launchedDaysAgo: 70, baseCalls: 35, growth: 1.01, volatility: 0.25, errorRate: 0.02 },
  { name: "Forecast Engine", slug: "forecast-engine", category: "Analytics", buyer: "Ops teams testing prediction workflows", useCase: "Turn time-series context into a forecast and confidence band.", directoryNote: "Draft listing; needs launch data before Agentix can score it.", priceUsdc: 0.4, status: "draft", launchedDaysAgo: 12, baseCalls: 0, growth: 1, volatility: 0, errorRate: 0 },
  { name: "Address Validator", slug: "address-validator", category: "Data", buyer: "Commerce, CRM, and logistics teams", useCase: "Clean, validate, and standardize address inputs.", directoryNote: "Boring but valuable data-quality rail with persistent demand.", priceUsdc: 0.03, status: "live", launchedDaysAgo: 84, baseCalls: 75, growth: 1.008, volatility: 0.2, errorRate: 0.01 },
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

const creatorShare = (gross: number) => Math.round(gross * (1 - PLATFORM_TAKE_RATE) * 100) / 100;
const round2 = (n: number) => Math.round(n * 100) / 100;

function idOf(spec: SeedSpec): string {
  return `agt_${spec.slug.replace(/-/g, "_")}`;
}

function buildAgent(spec: SeedSpec): Agent {
  const launchedAt = new Date(
    startOfUtcDay(SEED_NOW).getTime() - spec.launchedDaysAgo * MS_DAY + 11 * 3600_000,
  ).toISOString();
  return {
    id: idOf(spec),
    name: spec.name,
    slug: spec.slug,
    ownerWallet: DEFAULT_OWNER,
    x402Url: `https://agents.suedeai.ai/a/${spec.slug}`,
    priceUsdc: spec.priceUsdc,
    category: spec.category,
    buyer: spec.buyer,
    useCase: spec.useCase,
    directoryNote: spec.directoryNote,
    launchedAt,
    status: spec.status,
  };
}

function buildDaily(spec: SeedSpec): DailyRoll[] {
  const id = idOf(spec);
  const rng = mulberry32(hashStr(id));
  const end = startOfUtcDay(SEED_NOW);
  const rolls: DailyRoll[] = [];

  for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
    const date = new Date(end.getTime() - i * MS_DAY);
    const daysAgo = i;
    const tSinceLaunch = spec.launchedDaysAgo - daysAgo;
    if (tSinceLaunch < 0) continue;

    let calls = 0;
    let errors = 0;

    if (spec.status !== "draft") {
      const drift = Math.pow(spec.growth, tSinceLaunch);
      const dow = date.getUTCDay();
      const weekend = dow === 0 || dow === 6 ? 0.68 : 1;
      const noise = 1 + (rng() * 2 - 1) * spec.volatility;
      let expected = spec.baseCalls * drift * weekend * noise;

      if (spec.shape === "cliff" && spec.eventDaysAgo != null && daysAgo <= spec.eventDaysAgo) {
        expected *= spec.status === "down" ? 0 : 0.18;
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
      agentId: id,
      day: dayKey(date),
      calls,
      revenueUsdc: creatorShare(settled * spec.priceUsdc),
      errors,
    });
  }
  return rolls;
}

function hex(rng: () => number, len: number): string {
  let s = "0x";
  for (let i = 0; i < len; i++) s += Math.floor(rng() * 16).toString(16);
  return s;
}

function buildRecentRuns(spec: SeedSpec, daily: DailyRoll[], limit = 14): Earning[] {
  const id = idOf(spec);
  const rng = mulberry32(hashStr(id + ":runs"));
  const runs: Earning[] = [];
  for (let d = daily.length - 1; d >= 0 && runs.length < limit; d--) {
    const roll = daily[d];
    const dayStart = new Date(`${roll.day}T00:00:00.000Z`).getTime();
    let remainingErrors = roll.errors;
    const count = Math.min(roll.calls, limit - runs.length);
    for (let c = 0; c < count; c++) {
      const settled = remainingErrors > 0 && rng() < 0.5 ? (remainingErrors--, false) : true;
      const tsMs = dayStart + Math.floor(rng() * MS_DAY * 0.92);
      runs.push({
        agentId: id,
        ts: new Date(tsMs).toISOString(),
        callId: hex(rng, 16),
        grossUsdc: spec.priceUsdc,
        amountUsdc: settled ? round2(spec.priceUsdc * (1 - PLATFORM_TAKE_RATE)) : 0,
        settled,
      });
    }
  }
  return runs.sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, limit);
}

export interface SeedAgentData {
  agent: Agent;
  daily: DailyRoll[];
  recentRuns: Earning[];
}

export function buildSeedData(): SeedAgentData[] {
  return SPECS.map((spec) => {
    const daily = buildDaily(spec);
    return { agent: buildAgent(spec), daily, recentRuns: buildRecentRuns(spec, daily) };
  });
}
