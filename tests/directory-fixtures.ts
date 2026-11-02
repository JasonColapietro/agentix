import { gradeAgent } from "@/lib/data/grade";
import type { AgentWithStats, DailyRoll } from "@/lib/data/types";

/** A real grade derived from 30 days of paid activity and a 10% failure rate. */
export function highRevenueUnreliableListing(): AgentWithStats {
  const now = new Date("2026-09-30T12:00:00.000Z");
  const daily: DailyRoll[] = Array.from({ length: 30 }, (_, index) => ({
    agentId: "unreliable", day: `2026-09-${String(index + 1).padStart(2, "0")}`,
    calls: 100, errors: 10, revenueUsdc: 20,
  }));
  const grade = gradeAgent({
    revenueUsdc: 600, calls: 3000, errors: 300, delta7d: 0,
    lastActiveAt: now.toISOString(), daily, status: "live", portfolioMaxRevenue: 600, now,
  });
  return {
    id: "unreliable", name: "High-revenue unreliable agent", slug: "unreliable",
    ownerWallet: "", x402Url: "https://example.com/unreliable", priceUsdc: 0.2,
    category: "Data", launchedAt: "2026-09-01T00:00:00.000Z", status: "live", grade,
    stats: { calls: 3000, errors: 300, revenueUsdc: 600, grossUsdc: 600, lastActiveAt: now.toISOString(), spark: [20, 20, 20, 20, 20, 20, 20] },
  };
}
