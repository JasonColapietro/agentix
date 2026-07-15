import type { MetadataRoute } from "next";
import { publicAgentData } from "@/lib/data/seed-provider";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...publicAgentData().map(({ agent }) => ({
      url: `${SITE_URL}/agent/${encodeURIComponent(agent.id)}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
