import { describe, expect, it } from "vitest";
import {
  buildSeedData,
  dayKey,
  PLATFORM_TAKE_RATE,
  windowDays,
  WINDOW_DAYS,
} from "@/lib/data/seed";

describe("seed data", () => {
  const a = buildSeedData();
  const b = buildSeedData();

  it("is deterministic across builds", () => {
    expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
  });

  it("exposes a varied portfolio covering every status", () => {
    const statuses = new Set(a.map((x) => x.agent.status));
    expect(statuses).toContain("live");
    expect(statuses).toContain("degraded");
    expect(statuses).toContain("down");
    expect(statuses).toContain("draft");
    expect(statuses).toContain("paused");
    expect(a.length).toBeGreaterThanOrEqual(6);
  });

  it("spans the full chart window", () => {
    expect(windowDays()).toHaveLength(WINDOW_DAYS);
  });

  it("never settles a draft agent", () => {
    const draft = a.find((x) => x.agent.status === "draft")!;
    expect(draft).toBeTruthy();
    expect(draft.daily.reduce((s, r) => s + r.calls, 0)).toBe(0);
    expect(draft.daily.reduce((s, r) => s + r.revenueUsdc, 0)).toBe(0);
  });

  it("keeps revenue within the settled creator share and errors within calls", () => {
    for (const x of a) {
      for (const r of x.daily) {
        // settled ≤ calls, and revenueUsdc is round2(settled·price·(1−take)),
        // so allow a half-cent for rounding up.
        const maxShare = r.calls * x.agent.priceUsdc * (1 - PLATFORM_TAKE_RATE) + 0.01;
        expect(r.revenueUsdc).toBeLessThanOrEqual(maxShare);
        expect(r.errors).toBeLessThanOrEqual(r.calls);
        expect(r.calls).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("starts each agent's history no earlier than its launch day", () => {
    for (const x of a) {
      if (x.daily.length === 0) continue;
      const launchDay = dayKey(new Date(x.agent.launchedAt));
      expect(x.daily[0].day >= launchDay).toBe(true);
    }
  });

  it("models a recent cliff for the down agent", () => {
    const down = a.find((x) => x.agent.status === "down")!;
    expect(down.daily[down.daily.length - 1].calls).toBe(0);
  });

  it("models a sustained pause for the paused agent", () => {
    const paused = a.find((x) => x.agent.status === "paused")!;
    const tail = paused.daily.slice(-5);
    expect(tail.every((r) => r.calls === 0)).toBe(true);
  });
});
