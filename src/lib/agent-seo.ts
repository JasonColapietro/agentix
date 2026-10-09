import type { Agent } from "@/lib/data/types";
import type { SeedAgentData } from "@/lib/data/seed";
import { SITE_URL } from "@/lib/site";

const SUEDE_ORG_ID = "https://suedeai.ai/#organization";
const JASON_PERSON_ID = "https://suedeai.ai/founder#person";

export function agentPath(id: string): string {
  return `${SITE_URL}/agent/${encodeURIComponent(id)}`;
}

/** Unique per-agent title (the root template appends " | Agentix"). */
export function agentTitle(agent: Pick<Agent, "name">): string {
  return `${agent.name} example agent profile`;
}

/** Unique per-agent description, <= 155 characters. */
export function agentDescription(agent: Pick<Agent, "name" | "category">): string {
  return (
    `Example ${agent.category.toLowerCase()} agent profile for ${agent.name} in Agentix: ` +
    "x402 price, status, calls, grade, and USDC earnings trend."
  );
}

/** SoftwareApplication + BreadcrumbList JSON-LD for an agent profile. */
export function agentJsonLd(
  agent: Pick<Agent, "id" | "name" | "category">,
): Record<string, unknown> {
  const url = agentPath(agent.id);
  const app: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    "@id": `${url}#app`,
    name: agent.name,
    url,
    description: agentDescription(agent),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    author: { "@id": JASON_PERSON_ID },
    publisher: { "@id": SUEDE_ORG_ID },
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      app,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Agentix", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: agent.name, item: url },
        ],
      },
    ],
  };
}

/** Up to three related agents: same category first, then nearest price. */
export function relatedAgents(agent: Agent, all: SeedAgentData[], limit = 3): SeedAgentData[] {
  return all
    .filter((d) => d.agent.id !== agent.id)
    .sort((a, b) => {
      const ca = Number(a.agent.category === agent.category);
      const cb = Number(b.agent.category === agent.category);
      if (ca !== cb) return cb - ca;
      return (
        Math.abs(a.agent.priceUsdc - agent.priceUsdc) - Math.abs(b.agent.priceUsdc - agent.priceUsdc) ||
        a.agent.name.localeCompare(b.agent.name)
      );
    })
    .slice(0, limit);
}
