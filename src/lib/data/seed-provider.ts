/**
 * SeedProvider — serves the deterministic non-music example portfolio through
 * the shared aggregator. This is what renders when the operator hasn't entered
 * anything yet (server-rendered demo). The manual-input store reuses the same
 * `aggregate` functions, so typed-in data renders identically.
 */
import type {
  AgentDetail,
  AgentWithStats,
  DailyRoll,
  Earning,
  PortfolioProvider,
  PortfolioSummary,
} from "./types";
import { buildSeedData, SEED_NOW, type SeedAgentData } from "./seed";
import { WINDOW_DAYS } from "./dates";
import { detailFor, summarize, withStatsAll } from "./aggregate";

let CACHE: SeedAgentData[] | null = null;
function data(): SeedAgentData[] {
  if (!CACHE) CACHE = buildSeedData();
  return CACHE;
}

function maps() {
  const d = data();
  const dailyByAgent = new Map<string, DailyRoll[]>();
  const runsByAgent = new Map<string, Earning[]>();
  for (const x of d) {
    dailyByAgent.set(x.agent.id, x.daily);
    runsByAgent.set(x.agent.id, x.recentRuns);
  }
  return { agents: d.map((x) => x.agent), dailyByAgent, runsByAgent };
}

export class SeedProvider implements PortfolioProvider {
  readonly sourceLabel = "seed data (demo)";

  async listAgents(_ownerWallet: string): Promise<AgentWithStats[]> {
    const { agents, dailyByAgent, runsByAgent } = maps();
    return withStatsAll(agents, dailyByAgent, runsByAgent);
  }

  async getSummary(ownerWallet: string): Promise<PortfolioSummary> {
    const { agents } = maps();
    const flat = data().flatMap((x) => x.daily);
    return summarize(ownerWallet, agents, flat, SEED_NOW);
  }

  async getAgent(agentId: string): Promise<AgentDetail | null> {
    const d = data().find((x) => x.agent.id === agentId || x.agent.slug === agentId);
    if (!d) return null;
    return detailFor(d.agent, d.daily, d.recentRuns, SEED_NOW);
  }
}

export const seedMeta = { now: SEED_NOW, windowDays: WINDOW_DAYS };

/** Raw example dataset for the client store's empty-state fallback. */
export function exampleData(): SeedAgentData[] {
  return buildSeedData();
}
