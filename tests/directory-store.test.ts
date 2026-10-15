import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addAgent, loadState, updateAgent } from "@/lib/data/local-store";

// The store uses browser storage and dispatch events; keep its real serialization,
// normalization and mutations while replacing only the browser boundary.
beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) },
    dispatchEvent: () => true,
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("directory metadata persistence", () => {
  it("saves, reloads, edits and clears buyer metadata while preserving tracked identity", () => {
    const agent = addAgent({
      name: "Customer parser", category: "Data", priceUsdc: 0.1, status: "live",
      ownerWallet: "", x402Url: "https://example.com/parser", launchedAt: "2026-10-01",
      buyer: "  Support teams  ", useCase: "  Parse a ticket  ", directoryNote: "  Internal queue  ",
    });
    expect(loadState().agents[0]).toMatchObject({ id: agent.id, buyer: "Support teams", useCase: "Parse a ticket", directoryNote: "Internal queue" });
    updateAgent(agent.id, { buyer: "  Operations  ", directoryNote: "" });
    expect(loadState().agents[0]).toMatchObject({ id: agent.id, buyer: "Operations", useCase: "Parse a ticket", directoryNote: "", x402Url: "https://example.com/parser" });
  });
});
