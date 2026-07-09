/**
 * exampleData — serves the deterministic non-music example portfolio. This is
 * what renders when the operator hasn't entered anything yet (server-rendered
 * demo). The manual-input store reuses the same `aggregate` functions, so
 * typed-in data renders identically.
 */
import { buildSeedData, type SeedAgentData } from "./seed";

/** Raw example dataset for the client store's empty-state fallback. */
export function exampleData(): SeedAgentData[] {
  return buildSeedData();
}
