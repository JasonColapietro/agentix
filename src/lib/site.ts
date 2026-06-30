/**
 * Canonical site origin for Agentix (the tracker) and a pointer to the builder.
 *
 * agentix.suedeai.ai is THIS app — the operator's portfolio tracker.
 * agents.suedeai.ai is the SEPARATE builder (Suede Agent Studio) where agents
 * are made and launched. Agentix links out to the builder's public surfaces
 * (`/rankings`, `/grade`, each agent's x402 listing) but never re-implements them.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://agentix.suedeai.ai";

export const BUILDER_URL =
  process.env.NEXT_PUBLIC_BUILDER_URL ?? "https://agents.suedeai.ai";

/** Deep links into the builder's public surfaces (link, don't duplicate). */
export const builderLinks = {
  rankings: `${BUILDER_URL}/rankings/best-ai-agent-builders`,
  grade: `${BUILDER_URL}/grade`,
  /** Public agent page on the builder: /a/{slug}. */
  agent: (slug: string) => `${BUILDER_URL}/a/${slug}`,
  /** x402 discovery doc for an agent. */
  x402: (slug: string) => `${BUILDER_URL}/api/agents/${slug}/.well-known/x402`,
} as const;
