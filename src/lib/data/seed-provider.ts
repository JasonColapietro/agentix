/**
 * exampleData — serves the deterministic non-music example portfolio. This is
 * what renders when the operator hasn't entered anything yet (server-rendered
 * demo). The manual-input store reuses the same `aggregate` functions, so
 * typed-in data renders identically.
 */
import { buildSeedData, type SeedAgentData } from "./seed";

// local-store.ts generates `agt_` + an 8-character base36 timestamp + 6
// random base36 characters. These routes are private browser state, not public
// entities, so the server may render their client shell but must never index them.
const BROWSER_LOCAL_AGENT_ID = /^agt_[a-z0-9]{14}$/;

/** Raw example dataset for the client store's empty-state fallback. */
export function exampleData(): SeedAgentData[] {
  return buildSeedData();
}

/**
 * Stable agents that can be resolved before browser-local data is available.
 * These are the only agent detail URLs that are public and crawlable.
 */
export function publicAgentData(): SeedAgentData[] {
  return buildSeedData();
}

/** Resolve a public agent by its stable id or its human-readable slug. */
export function publicAgent(id: string): SeedAgentData | undefined {
  return publicAgentData().find(({ agent }) => agent.id === id || agent.slug === id);
}

export function isBrowserLocalAgentId(id: string): boolean {
  return BROWSER_LOCAL_AGENT_ID.test(id);
}
