import type { MetadataRoute } from "next";
import { publicAgentData } from "@/lib/data/seed-provider";
import { CONTENT_LAST_MODIFIED, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: CONTENT_LAST_MODIFIED.home,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...publicAgentData()
      .map(({ agent }) => ({
      url: `${SITE_URL}/agent/${encodeURIComponent(agent.id)}`,
      lastModified: CONTENT_LAST_MODIFIED.agents,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    {
      url: `${SITE_URL}/ai-instructions`,
      lastModified: CONTENT_LAST_MODIFIED.aiInstructions,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
