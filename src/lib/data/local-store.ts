/**
 * Manual-input store — the operator's own portfolio, persisted in localStorage.
 * Falls back to the non-music example portfolio when empty. Computes the same
 * read-models the seed uses (via `aggregate`) and attaches grades (via `grade`)
 * and goal/target progress.
 */
import type {
  Agent,
  AgentDetail,
  AgentStatus,
  AgentWithStats,
  DailyRoll,
  Earning,
  Grade,
  PortfolioSummary,
} from "./types";
import { dayKey, windowKeys } from "./dates";
import { delta7d, detailFor, summarize, withStatsAll } from "./aggregate";
import { gradeAgent, gradePortfolio } from "./grade";
import { exampleData } from "./seed-provider";
import { SEED_NOW } from "./seed";

const KEY = "agentix.portfolio.v1";

/** Goal target key for the whole portfolio (vs. an agent id). */
export const PORTFOLIO_TARGET = "portfolio";

export interface AgentInput {
  name: string;
  x402Url: string;
  ownerWallet: string;
  priceUsdc: number;
  category: string;
  status: AgentStatus;
  launchedAt: string;
}

export interface EntryInput {
  agentId: string;
  day: string;
  calls: number;
  revenueUsdc: number;
  errors?: number;
}

interface StoredState {
  agents: Agent[];
  entries: DailyRoll[];
  targets: Record<string, number>;
}

const empty = (): StoredState => ({ agents: [], entries: [], targets: {} });

/** Illustrative goals so the demo shows goal progress before you add your own. */
const EXAMPLE_TARGETS: Record<string, number> = {
  [PORTFOLIO_TARGET]: 8000,
  agt_market_data_feed: 1000,
  agt_sentiment_engine: 800,
  agt_web_scraper_pro: 800,
};

export function loadState(): StoredState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const p = JSON.parse(raw) as Partial<StoredState>;
    return { agents: p.agents ?? [], entries: p.entries ?? [], targets: p.targets ?? {} };
  } catch {
    return empty();
  }
}

function saveState(s: StoredState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("agentix:store"));
}

export function usingExamples(s: StoredState = loadState()): boolean {
  return s.agents.length === 0;
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "agent";
}

function newId(): string {
  return `agt_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function normLaunch(s: string): string {
  return s.length === 10 ? `${s}T12:00:00.000Z` : s;
}

// ── mutations ───────────────────────────────────────────────────────────────
export function addAgent(input: AgentInput): Agent {
  const s = loadState();
  const agent: Agent = {
    id: newId(),
    name: input.name.trim(),
    slug: slugify(input.name),
    ownerWallet: input.ownerWallet.trim(),
    x402Url: input.x402Url.trim(),
    priceUsdc: input.priceUsdc,
    category: input.category.trim() || "Other",
    launchedAt: normLaunch(input.launchedAt),
    status: input.status,
  };
  s.agents.push(agent);
  saveState(s);
  return agent;
}

export function updateAgent(id: string, patch: Partial<AgentInput>): void {
  const s = loadState();
  const a = s.agents.find((x) => x.id === id);
  if (!a) return;
  if (patch.name != null) {
    a.name = patch.name.trim();
    a.slug = slugify(patch.name);
  }
  if (patch.x402Url != null) a.x402Url = patch.x402Url.trim();
  if (patch.ownerWallet != null) a.ownerWallet = patch.ownerWallet.trim();
  if (patch.priceUsdc != null) a.priceUsdc = patch.priceUsdc;
  if (patch.category != null) a.category = patch.category.trim() || "Other";
  if (patch.status != null) a.status = patch.status;
  if (patch.launchedAt != null) a.launchedAt = normLaunch(patch.launchedAt);
  saveState(s);
}

export function removeAgent(id: string): void {
  const s = loadState();
  s.agents = s.agents.filter((a) => a.id !== id);
  s.entries = s.entries.filter((e) => e.agentId !== id);
  delete s.targets[id];
  saveState(s);
}

export function logEntry(input: EntryInput): void {
  const s = loadState();
  s.entries = s.entries.filter((e) => !(e.agentId === input.agentId && e.day === input.day));
  s.entries.push({
    agentId: input.agentId,
    day: input.day,
    calls: Math.max(0, Math.round(input.calls)),
    revenueUsdc: Math.max(0, input.revenueUsdc),
    errors: Math.max(0, Math.round(input.errors ?? 0)),
  });
  saveState(s);
}

/** Set a revenue goal (agent id, or PORTFOLIO_TARGET). 0/blank clears it. */
export function setTarget(id: string, amount: number): void {
  const s = loadState();
  if (!amount || amount <= 0) delete s.targets[id];
  else s.targets[id] = amount;
  // Setting a target on an empty (examples) portfolio shouldn't strand it; only
  // persists meaningfully once real agents exist, but we store it regardless.
  saveState(s);
}

export function clearAll(): void {
  saveState(empty());
}

// ── read models ──────────────────────────────────────────────────────────────
function agentDaily(agent: Agent, entries: DailyRoll[], now: Date): DailyRoll[] {
  const byDay = new Map(entries.filter((e) => e.agentId === agent.id).map((e) => [e.day, e]));
  const launchDay = dayKey(new Date(agent.launchedAt));
  return windowKeys(now)
    .filter((d) => d >= launchDay)
    .map((d) => byDay.get(d) ?? { agentId: agent.id, day: d, calls: 0, revenueUsdc: 0, errors: 0 });
}

interface Models {
  examples: boolean;
  now: Date;
  agents: Agent[];
  dailyByAgent: Map<string, DailyRoll[]>;
  runsByAgent: Map<string, Earning[]>;
  flat: DailyRoll[];
  ownerWallet: string;
  targets: Record<string, number>;
}

function exampleModels(): Models {
  const d = exampleData();
  return {
    examples: true,
    now: SEED_NOW,
    agents: d.map((x) => x.agent),
    dailyByAgent: new Map(d.map((x) => [x.agent.id, x.daily])),
    runsByAgent: new Map(d.map((x) => [x.agent.id, x.recentRuns])),
    flat: d.flatMap((x) => x.daily),
    ownerWallet: d[0]?.agent.ownerWallet ?? "",
    targets: EXAMPLE_TARGETS,
  };
}

function realModels(now: Date): Models {
  const s = loadState();
  const dailyByAgent = new Map(s.agents.map((a) => [a.id, agentDaily(a, s.entries, now)]));
  return {
    examples: false,
    now,
    agents: s.agents,
    dailyByAgent,
    runsByAgent: new Map(),
    flat: [...dailyByAgent.values()].flat(),
    ownerWallet: s.agents[0]?.ownerWallet ?? "",
    targets: s.targets,
  };
}

function models(now: Date): Models {
  return usingExamples() ? exampleModels() : realModels(now);
}

function gradeFor(a: AgentWithStats, daily: DailyRoll[], maxRev: number, now: Date): Grade {
  return gradeAgent({
    revenueUsdc: a.stats.revenueUsdc,
    calls: a.stats.calls,
    errors: a.stats.errors,
    delta7d: delta7d(daily),
    lastActiveAt: a.stats.lastActiveAt,
    daily,
    status: a.status,
    portfolioMaxRevenue: maxRev,
    now,
  });
}

export interface LocalView {
  examples: boolean;
  now: string;
  summary: PortfolioSummary;
  agents: AgentWithStats[];
  portfolioGrade: Grade;
  targets: Record<string, number>;
}

function viewFrom(m: Models): LocalView {
  const base = withStatsAll(m.agents, m.dailyByAgent, m.runsByAgent);
  const maxRev = base.reduce((mx, a) => Math.max(mx, a.stats.revenueUsdc), 0);
  const agents = base.map((a) => ({ ...a, grade: gradeFor(a, m.dailyByAgent.get(a.id) ?? [], maxRev, m.now) }));
  const portfolioGrade = gradePortfolio(agents.map((a) => ({ score: a.grade!.score, revenueUsdc: a.stats.revenueUsdc })));
  return {
    examples: m.examples,
    now: m.now.toISOString(),
    summary: summarize(m.ownerWallet, m.agents, m.flat, m.now),
    agents,
    portfolioGrade,
    targets: m.targets,
  };
}

export function readPortfolio(now: Date): LocalView {
  return viewFrom(models(now));
}

export function examplePortfolio(): LocalView {
  return viewFrom(exampleModels());
}

export interface LocalAgentView {
  examples: boolean;
  now: string;
  agent: AgentDetail & { grade: Grade };
  target?: number;
}

function agentViewFrom(m: Models, id: string): LocalAgentView | null {
  const agent = m.agents.find((a) => a.id === id || a.slug === id);
  if (!agent) return null;
  const daily = m.dailyByAgent.get(agent.id) ?? [];
  const detail = detailFor(agent, daily, m.runsByAgent.get(agent.id) ?? [], m.now);
  const maxRev = m.agents.reduce((mx, a) => {
    const d = m.dailyByAgent.get(a.id) ?? [];
    return Math.max(mx, d.reduce((s, r) => s + r.revenueUsdc, 0));
  }, 0);
  const grade = gradeFor(detail, daily, maxRev, m.now);
  return {
    examples: m.examples,
    now: m.now.toISOString(),
    agent: { ...detail, grade },
    target: m.targets[agent.id],
  };
}

export function readAgent(id: string, now: Date): LocalAgentView | null {
  return agentViewFrom(models(now), id);
}

export function exampleAgent(id: string): LocalAgentView | null {
  return agentViewFrom(exampleModels(), id);
}
