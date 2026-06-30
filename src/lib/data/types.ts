/**
 * Agentix domain types.
 *
 * The three storage-shaped records (Agent / Earning / DailyRoll) mirror the
 * SPEC data model and map cleanly onto the builder's settlement store:
 *   Agent.name        ← flows.name
 *   Agent.ownerWallet ← wallets.address (via flows.owner_id)
 *   Agent.priceUsdc   ← agents.price_usdc
 *   Earning           ← one settled `runs` row (trigger='agent', settled_at set)
 *   DailyRoll         ← runs bucketed by UTC day (Agentix owns this aggregation)
 *
 * The remaining types are read-models the dashboard consumes. Keeping them
 * separate from storage records means a real provider can compute them however
 * it likes (SQL rollups, on-chain reads, a builder API) without the UI caring.
 */

/** Endpoint / agent health surfaced in the portfolio. */
export type AgentStatus = "live" | "degraded" | "down" | "draft" | "paused";

export interface Agent {
  id: string;
  name: string;
  ownerWallet: string;
  /** Public x402 listing URL on the builder (e.g. agents.suedeai.ai/a/{slug}). */
  x402Url: string;
  /** Slug used for builder deep-links (x402 discovery doc, public page). */
  slug: string;
  priceUsdc: number;
  category: string;
  /** ISO timestamp. */
  launchedAt: string;
  status: AgentStatus;
}

/** One paid call. Settled = x402 verify+settle succeeded (runs.settled_at set). */
export interface Earning {
  agentId: string;
  /** ISO timestamp of the call. */
  ts: string;
  callId: string;
  /** Creator's share for this call (price minus platform take). */
  amountUsdc: number;
  /** Gross charged to the caller, before the platform take. */
  grossUsdc: number;
  settled: boolean;
}

/** Pre-aggregated per-day numbers that drive the charts. */
export interface DailyRoll {
  agentId: string;
  /** YYYY-MM-DD (UTC). */
  day: string;
  calls: number;
  /** Creator's settled revenue for the day. */
  revenueUsdc: number;
  errors: number;
}

/** Portfolio-wide daily point (sum across agents). */
export interface DailyPoint {
  day: string;
  calls: number;
  revenueUsdc: number;
  errors: number;
}

/** Derived per-agent stats shown in the portfolio table + detail header. */
export interface AgentStats {
  /** External paid calls (trigger='agent'). */
  calls: number;
  /** Creator's settled revenue, all-time. */
  revenueUsdc: number;
  /** Gross charged, all-time (pre platform take). */
  grossUsdc: number;
  errors: number;
  /** Last call ISO timestamp, or null if never called. */
  lastActiveAt: string | null;
  /** Last 7 daily revenue values, oldest→newest, for the row sparkline. */
  spark: number[];
}

export interface AgentWithStats extends Agent {
  stats: AgentStats;
}

export interface PortfolioSummary {
  ownerWallet: string;
  /** Sum of settled creator revenue across all agents. */
  totalRevenueUsdc: number;
  /** Sum of gross charged across all agents. */
  totalGrossUsdc: number;
  totalCalls: number;
  activeAgents: number;
  agentCount: number;
  /** Platform take rate applied by the builder (e.g. 0.05). */
  platformTakeRate: number;
  /** Daily series across the whole window for the headline trend chart. */
  trend: DailyPoint[];
  /** Revenue change: last 7 days vs the prior 7 days, as a fraction. */
  delta7d: number;
  /** Settled revenue earned in the last 7 days. */
  revenue7d: number;
}

export interface AgentDetail extends AgentWithStats {
  /** Full daily window for this agent (earnings curve + call-volume bars). */
  daily: DailyRoll[];
  /** Most recent paid calls, newest first. */
  recentRuns: Earning[];
  /** Revenue change: last 7 days vs prior 7 days, as a fraction. */
  delta7d: number;
}

/** The seam the whole app reads through. Swap the implementation, not the UI. */
export interface PortfolioProvider {
  /** Identifier of the data source, surfaced in the UI footer for honesty. */
  readonly sourceLabel: string;
  getSummary(ownerWallet: string): Promise<PortfolioSummary>;
  listAgents(ownerWallet: string): Promise<AgentWithStats[]>;
  getAgent(agentId: string): Promise<AgentDetail | null>;
}
