import { describe, expect, it } from "vitest";
import { directorySignal, topDirectoryAgents } from "@/lib/directory";
import { examplePortfolio } from "@/lib/data/local-store";

describe("directory signals", () => {
  const view = examplePortfolio();

  it("scores every example agent into a bounded directory signal", () => {
    for (const agent of view.agents) {
      const signal = directorySignal(agent);
      expect(signal.score).toBeGreaterThanOrEqual(0);
      expect(signal.score).toBeLessThanOrEqual(100);
      expect(signal.label.length).toBeGreaterThan(0);
      expect(signal.reason.length).toBeGreaterThan(0);
      expect(signal.reliabilityPct).toBeGreaterThanOrEqual(0);
      expect(signal.reliabilityPct).toBeLessThanOrEqual(100);
    }
  });

  it("keeps the top directory ranking deterministic", () => {
    const top = topDirectoryAgents(view.agents, 3).map((agent) => agent.slug);
    expect(top).toEqual(["market-data-feed", "sentiment-engine", "code-reviewer"]);
  });

  it("penalizes broken listings even when they have historical revenue", () => {
    const down = view.agents.find((agent) => agent.status === "down")!;
    expect(directorySignal(down).label).toBe("Needs attention");
  });
});
