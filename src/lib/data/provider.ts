/**
 * The single entry point the app uses to read portfolio data.
 *
 * Today this always returns the SeedProvider. The real earnings source (open
 * question #1 — likely the builder's settlement DB, see docs/SPEC.md) plugs in
 * here behind the same PortfolioProvider interface. Selection is env-driven so
 * flipping sources is a config change, not a code change:
 *
 *   AGENTIX_DATA_SOURCE=seed        → deterministic demo data (default)
 *   AGENTIX_DATA_SOURCE=settlement  → builder settlement store   (TODO)
 *   AGENTIX_DATA_SOURCE=builder-api → agents.suedeai.ai /api/me  (TODO)
 *   AGENTIX_DATA_SOURCE=onchain     → viem reads on Base         (TODO)
 */
import type { PortfolioProvider } from "./types";
import { SeedProvider } from "./seed-provider";
import { DEFAULT_OWNER } from "./seed";

export type DataSource = "seed" | "settlement" | "builder-api" | "onchain";

let provider: PortfolioProvider | null = null;

export function getProvider(): PortfolioProvider {
  if (provider) return provider;

  const source = (process.env.AGENTIX_DATA_SOURCE ?? "seed") as DataSource;
  switch (source) {
    case "seed":
      provider = new SeedProvider();
      break;
    // case "settlement": provider = new SettlementDbProvider(); break;
    // case "builder-api": provider = new BuilderApiProvider(); break;
    // case "onchain":     provider = new OnchainProvider();     break;
    default:
      // Until the real sources land, anything unknown falls back to seed so the
      // app never hard-fails on a misconfigured env var.
      console.warn(
        `[agentix] AGENTIX_DATA_SOURCE="${source}" not implemented yet; using seed data.`,
      );
      provider = new SeedProvider();
  }
  return provider;
}

/**
 * The owner whose portfolio we render. Once auth (open question #2) is decided
 * this resolves from the session / connected wallet; for now it's the seed
 * owner so the dashboard has something to show.
 */
export function getCurrentOwner(): string {
  return process.env.AGENTIX_OWNER_WALLET ?? DEFAULT_OWNER;
}
