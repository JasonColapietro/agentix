/**
 * Canonical site origin for Agentix (the tracker) and a pointer to the builder.
 *
 * agentix.suedeai.ai is THIS app — the operator's portfolio tracker.
 * agents.suedeai.ai is the SEPARATE builder (Suede AI Agent Studio) where agents
 * are made and launched. Agentix links out to the builder's public surfaces
 * (`/rankings`, `/grade`, each agent's x402 listing) but never re-implements them.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://agentix.suedeai.ai";

export const BUILDER_URL =
  process.env.NEXT_PUBLIC_BUILDER_URL ?? "https://agents.suedeai.ai";

/**
 * Last content change per public surface, as YYYY-MM-DD, from git history.
 * Feeds the sitemap <lastmod> and JSON-LD dateModified so the two agree.
 * Bump the matching entry in the same commit that changes that surface's
 * visible content (tests/sitemap-lastmod.test.ts checks the shape).
 *   home    - src/app/page.tsx, PortfolioApp, dashboard/*, SiteFooter, layout
 *   agents  - src/app/agent/*, AgentProfileContent, AgentDetailApp,
 *             agent-profiles.ts, agent-seo.ts, data/seed.ts, SiteFooter
 *   aiInstructions - public/ai-instructions.html
 */
export const CONTENT_LAST_MODIFIED = {
  home: "2026-10-12",
  agents: "2026-10-12",
  aiInstructions: "2026-10-12",
} as const;

/** Shared Suede social card until Agentix has a dedicated image. */
export const OG_IMAGE_URL = "https://app.suedeai.ai/opengraph.png";

/** Deep links into the builder's public surfaces (link, don't duplicate). */
export const builderLinks = {
  rankings: `${BUILDER_URL}/rankings/best-ai-agent-builders`,
  grade: `${BUILDER_URL}/grade`,
  /** Public agent page on the builder: /a/{slug}. */
  agent: (slug: string) => `${BUILDER_URL}/a/${slug}`,
  /** x402 discovery doc for an agent. */
  x402: (slug: string) => `${BUILDER_URL}/api/agents/${slug}/.well-known/x402`,
} as const;

/**
 * Estate-wide policy and contact surfaces. Agentix has no policy of its own,
 * so the footer points at the Suede AI pages that cover its apps and sites.
 */
export const estateLinks = {
  /** Canonical founder page; owns the https://suedeai.ai/founder#person entity. */
  founder: "https://suedeai.ai/founder",
  contact: "https://suedeai.ai/contact",
  privacy: "https://suedeai.ai/privacy",
} as const;
