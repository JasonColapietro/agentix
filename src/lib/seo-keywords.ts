/**
 * Central route -> `<meta name="keywords">` map for every indexable page.
 *
 * Next.js REPLACES (does not merge) a parent's `keywords` when a child route
 * sets its own, so every list here is complete on its own. Terms must match
 * what the page actually shows (an earlier tag was dropped in #9 because some
 * terms never appeared on the page); `tests/seo-keywords.test.ts` fails if an
 * indexable route ships without them.
 *
 * "ai agent discovery" and "ai agent marketplace" are deliberately absent:
 * Agentix tracks agents you already launched, it does not list or search
 * other people's agents, so those terms would be padding.
 */

/** Brand terms appended to every list. */
export const BRAND_KEYWORDS: readonly string[] = ["Agentix", "Suede AI"];

/** Trims, drops empties, dedupes case-insensitively, appends brand terms. */
export function withBrand(terms: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [...terms, ...BRAND_KEYWORDS]) {
    const term = raw.trim();
    const key = term.toLowerCase();
    if (!term || seen.has(key)) continue;
    seen.add(key);
    out.push(term);
  }
  return out;
}

/** Dashboard at `/`: the x402 agent portfolio earnings tracker. */
export const HOME_KEYWORDS: readonly string[] = withBrand([
  "agent earnings tracker",
  "x402 agent portfolio tracker",
  "x402 agent payments",
  "ai agent earnings",
  "usdc earnings on base",
  "ai agent performance dashboard",
]);

/** Example agent profile at `/agent/[id]`. */
export function agentKeywords(agent: { name: string; category: string }): string[] {
  return withBrand([
    `${agent.name.toLowerCase()} x402 agent`,
    `${agent.category.toLowerCase()} ai agent`,
    "x402 agent payments",
    "agent earnings tracker",
    "ai agent earnings",
  ]);
}
