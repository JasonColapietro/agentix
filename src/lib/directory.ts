import type { AgentWithStats } from "@/lib/data/types";

const round = (n: number) => Math.round(n);
const round2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);

export interface DirectorySignal {
  score: number;
  label: string;
  reason: string;
  reliabilityPct: number;
  monthlyRunRateUsdc: number;
}

export function buyerLabel(agent: AgentWithStats): string {
  return agent.buyer?.trim() || `${agent.category} teams`;
}

export function useCaseLabel(agent: AgentWithStats): string {
  return agent.useCase?.trim() || `Track demand, revenue, and health for this ${agent.category.toLowerCase()} agent.`;
}

export function directorySignal(agent: AgentWithStats): DirectorySignal {
  const calls = agent.stats.calls;
  const reliabilityPct = calls > 0 ? clamp(((calls - agent.stats.errors) / calls) * 100) : agent.status === "draft" ? 0 : 60;
  const weeklyRevenue = sum(agent.stats.spark);
  const monthlyRunRateUsdc = round2((weeklyRevenue / 7) * 30);
  const revenueScore = clamp((monthlyRunRateUsdc / 500) * 100);
  const gradeScore = agent.grade?.score ?? 0;
  const statusScore =
    agent.status === "live" ? 100 :
    agent.status === "degraded" ? 55 :
    agent.status === "paused" ? 38 :
    agent.status === "down" ? 18 :
    8;
  const listingScore = agent.x402Url ? 100 : 35;
  const score = round(
    gradeScore * 0.42 +
    reliabilityPct * 0.2 +
    revenueScore * 0.18 +
    statusScore * 0.12 +
    listingScore * 0.08,
  );

  let label = "Needs proof";
  if (score >= 86) label = "Prime listing";
  else if (score >= 72) label = "Worth watching";
  else if (score >= 58) label = "Prove demand";
  else if (agent.status === "down" || agent.status === "degraded") label = "Needs attention";

  let reason = "Add demand and health data before promoting it.";
  if (agent.status === "down") reason = "Fix uptime before buyers trust the listing.";
  else if (agent.status === "degraded") reason = "Demand exists, but reliability is dragging the listing down.";
  else if (!agent.x402Url) reason = "Add the public x402 listing URL so buyers can inspect it.";
  else if (score >= 86) reason = "Strong revenue, reliable calls, and clear buyer fit.";
  else if (score >= 72) reason = "Good demand signal with room to tighten positioning.";
  else if (score >= 58) reason = "Useful niche, but the tracker needs more paid-call proof.";

  return { score: clamp(score), label, reason, reliabilityPct: round(reliabilityPct), monthlyRunRateUsdc };
}

export function topDirectoryAgents(agents: AgentWithStats[], count = 3): AgentWithStats[] {
  return [...agents]
    .sort((a, b) => directorySignal(b).score - directorySignal(a).score)
    .slice(0, count);
}

export function attentionAgents(agents: AgentWithStats[], count = 3): AgentWithStats[] {
  return [...agents]
    .filter((agent) => agent.status !== "live" || directorySignal(agent).reliabilityPct < 96)
    .sort((a, b) => b.stats.revenueUsdc - a.stats.revenueUsdc)
    .slice(0, count);
}
