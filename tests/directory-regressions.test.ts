import { describe, expect, it } from "vitest";
import { attentionAgents, directorySignal } from "@/lib/directory";
import type { AgentStatus, AgentWithStats } from "@/lib/data/types";

function listing(overrides: Partial<AgentWithStats> = {}): AgentWithStats {
  return {
    id: "agent", name: "Tracked agent", slug: "tracked-agent", ownerWallet: "",
    x402Url: "https://example.com/agent", priceUsdc: 0.1, category: "Data",
    launchedAt: "2026-01-01T00:00:00Z", status: "live",
    stats: { calls: 100, errors: 0, revenueUsdc: 500, grossUsdc: 500, lastActiveAt: null, spark: [20, 20, 20, 20, 20, 20, 20] },
    grade: { letter: "S", score: 100, color: "green", breakdown: { revenue: 1, growth: 1, consistency: 1, reliability: 1, activity: 1 } },
    ...overrides,
  };
}

describe("directory health and attention", () => {
  it.each<AgentStatus>(["degraded", "down"])("flags a %s agent despite strong historical earnings", (status) => {
    const agent = listing({ status });
    expect(directorySignal(agent).score).toBeGreaterThanOrEqual(86);
    expect(directorySignal(agent).label).toBe("Needs attention");
    expect(attentionAgents([agent])).toEqual([agent]);
  });

  it("keeps an earning healthy agent eligible for a prime label", () => {
    const agent = listing();
    expect(directorySignal(agent).label).toBe("Prime listing");
    expect(attentionAgents([agent])).toEqual([]);
  });

  it("includes a live low-score listing in Fix next even with successful calls", () => {
    const agent = listing({ x402Url: "", grade: undefined, stats: { ...listing().stats, revenueUsdc: 0, spark: [0, 0, 0, 0, 0, 0, 0] } });
    expect(directorySignal(agent)).toMatchObject({ score: 35, reliabilityPct: 100 });
    expect(attentionAgents([agent])).toEqual([agent]);
  });

  it.each([{ grade: 53, score: 57, included: true }, { grade: 55, score: 58, included: false }])("uses the score boundary at $score", ({ grade, score, included }) => {
    const agent = listing({ x402Url: "", grade: { ...listing().grade!, score: grade }, stats: { ...listing().stats, revenueUsdc: 0, spark: [0, 0, 0, 0, 0, 0, 0] } });
    expect(directorySignal(agent).score).toBe(score);
    expect(attentionAgents([agent])).toEqual(included ? [agent] : []);
  });

  it.each([{ errors: 5, included: true }, { errors: 4, included: false }])("uses the reliability boundary with $errors failures in 100 calls", ({ errors, included }) => {
    const agent = listing({ stats: { ...listing().stats, errors } });
    expect(attentionAgents([agent])).toEqual(included ? [agent] : []);
  });

  it("prioritizes the affected revenue and honors the requested limit without mutating input", () => {
    const low = listing({ id: "low", status: "down", stats: { ...listing().stats, revenueUsdc: 10 } });
    const high = listing({ id: "high", status: "degraded", stats: { ...listing().stats, revenueUsdc: 1000 } });
    const input = [low, high, listing()];
    expect(attentionAgents(input, 1)).toEqual([high]);
    expect(input.map((agent) => agent.id)).toEqual(["low", "high", "agent"]);
  });
});
