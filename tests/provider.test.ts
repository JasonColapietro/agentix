import { describe, expect, it } from "vitest";
import { SeedProvider } from "@/lib/data/seed-provider";
import { DEFAULT_OWNER } from "@/lib/data/seed";

const provider = new SeedProvider();

describe("SeedProvider", () => {
  it("reports totals consistent with the agent list", async () => {
    const [summary, agents] = await Promise.all([
      provider.getSummary(DEFAULT_OWNER),
      provider.listAgents(DEFAULT_OWNER),
    ]);

    const callSum = agents.reduce((s, a) => s + a.stats.calls, 0);
    expect(summary.totalCalls).toBe(callSum);
    expect(summary.agentCount).toBe(agents.length);

    // Revenue is summed two ways (per-day vs per-agent) so allow cent-level rounding drift.
    const revSum = agents.reduce((s, a) => s + a.stats.revenueUsdc, 0);
    expect(Math.abs(summary.totalRevenueUsdc - revSum)).toBeLessThan(1);
  });

  it("sorts agents by revenue, descending", async () => {
    const agents = await provider.listAgents(DEFAULT_OWNER);
    for (let i = 1; i < agents.length; i++) {
      expect(agents[i - 1].stats.revenueUsdc).toBeGreaterThanOrEqual(agents[i].stats.revenueUsdc);
    }
  });

  it("counts active agents within bounds", async () => {
    const summary = await provider.getSummary(DEFAULT_OWNER);
    expect(summary.activeAgents).toBeGreaterThan(0);
    expect(summary.activeAgents).toBeLessThanOrEqual(summary.agentCount);
  });

  it("resolves an agent by id and by slug", async () => {
    const byId = await provider.getAgent("agt_lyric_doctor");
    expect(byId?.name).toBe("Lyric Doctor");
    const bySlug = await provider.getAgent("lyric-doctor");
    expect(bySlug?.id).toBe("agt_lyric_doctor");
    expect(byId!.daily.length).toBeGreaterThan(0);
    expect(byId!.recentRuns.length).toBeGreaterThan(0);
  });

  it("returns null for an unknown agent", async () => {
    expect(await provider.getAgent("does-not-exist")).toBeNull();
  });

  it("advertises its data source", () => {
    expect(provider.sourceLabel).toMatch(/seed/i);
  });
});
