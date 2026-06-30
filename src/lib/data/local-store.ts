/**
 * Manual-input store — the operator's own portfolio, persisted in localStorage
 * (single-operator MVP, "info people put in primarily"). Falls back to the
 * non-music example portfolio when empty, and computes the exact same
 * read-models the seed uses via the shared `aggregate` functions.
 *
 * Swappable: this is the same `PortfolioProvider`-shaped surface as the seed.
 * A future hosted DB (Supabase / Vercel Postgres) drops in behind these calls
 * for cross-device + multi-user without touching the UI.
 */
import type {
  Agent,
  AgentDetail,
  AgentStatus,
  AgentWithStats,
  DailyRoll,
  Earning,
  PortfolioSummary,
} from "./types";
import { dayKey, windowKeys } from "./dates";
import { detailFor, summarize, withStatsAll } from "./aggregate";
import { exampleData } from "./seed-provider";
import { SEED_NOW } from "./seed";

const KEY = "agentix.portfolio.v1";

export interface AgentInput {
  name: string;
  x402Url: string;
  ownerWallet: string;
  priceUsdc: number;
  category: string;
  status: AgentStatus;
  launchedAt: string; // YYYY-MM-DD or ISO
}

export interface EntryInput {
  agentId: string;
  day: string; // YYYY-MM-DD
  calls: number;
  revenueUsdc: number;
  errors?: number;
}

interface StoredState {
  agents: Agent[];
  entries: DailyRoll[];
}

const empty = (): StoredState => ({ agents: [], entries: [] });

export function loadState(): StoredState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    return { agents: parsed.agents ?? [], entries: parsed.entries ?? [] };
  } catch {
    return empty();
  }
}

function saveState(s: StoredState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
  // let any other mounted views in this tab know
  window.dispatchEvent(new Event("agentix:store"));
}

/** True when the operator hasn't added anything → we show the example portfolio. */
export function usingExamples(s: StoredState = loadState()): boolean {
  return s.agents.length === 0;
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "agent";
}

function newId(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `agt_${Date.now().toString(36)}${rand}`;
}

// ── mutations ───────────────────────────────────────────────────────────────
export function addAgent(input: AgentInput): Agent {
  const s = loadState();
  const slug = slugify(input.name);
  const agent: Agent = {
    id: newId(),
    name: input.name.trim(),
    slug,
    ownerWallet: input.ownerWallet.trim(),
    x402Url: input.x402Url.trim(),
    priceUsdc: input.priceUsdc,
    category: input.category.trim() || "Other",
    launchedAt: input.launchedAt.length === 10 ? `${input.launchedAt}T12:00:00.000Z` : input.launchedAt,
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
  if (patch.launchedAt != null) {
    a.launchedAt = patch.launchedAt.length === 10 ? `${patch.launchedAt}T12:00:00.000Z` : patch.launchedAt;
  }
  saveState(s);
}

export function removeAgent(id: string): void {
  const s = loadState();
  s.agents = s.agents.filter((a) => a.id !== id);
  s.entries = s.entries.filter((e) => e.agentId !== id);
  saveState(s);
}

/** Log (or overwrite) a day's numbers for an agent — the core "info people put in". */
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

export function clearAll(): void {
  saveState(empty());
}

// ── read models (mirror the seed provider, computed from stored state) ───────
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
  };
}

function models(now: Date): Models {
  return usingExamples() ? exampleModels() : realModels(now);
}

export interface LocalView {
  examples: boolean;
  now: string; // ISO, for hydration-safe relative times
  summary: PortfolioSummary;
  agents: AgentWithStats[];
}

function viewFrom(m: Models): LocalView {
  return {
    examples: m.examples,
    now: m.now.toISOString(),
    summary: summarize(m.ownerWallet, m.agents, m.flat, m.now),
    agents: withStatsAll(m.agents, m.dailyByAgent, m.runsByAgent),
  };
}

/** Read the operator's portfolio (or examples if empty). Call after mount. */
export function readPortfolio(now: Date): LocalView {
  return viewFrom(models(now));
}

/** Deterministic example view — safe for SSR + first client paint (no localStorage). */
export function examplePortfolio(): LocalView {
  return viewFrom(exampleModels());
}

export interface LocalAgentView {
  examples: boolean;
  now: string;
  agent: AgentDetail;
}

function agentViewFrom(m: Models, id: string): LocalAgentView | null {
  const agent = m.agents.find((a) => a.id === id || a.slug === id);
  if (!agent) return null;
  return {
    examples: m.examples,
    now: m.now.toISOString(),
    agent: detailFor(agent, m.dailyByAgent.get(agent.id) ?? [], m.runsByAgent.get(agent.id) ?? [], m.now),
  };
}

export function readAgent(id: string, now: Date): LocalAgentView | null {
  return agentViewFrom(models(now), id);
}

export function exampleAgent(id: string): LocalAgentView | null {
  return agentViewFrom(exampleModels(), id);
}
