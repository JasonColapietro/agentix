import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Only the homepage is listed: /agent/[id] pages render the operator's own
 * local/seed portfolio data, so they aren't stable public URLs worth indexing.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
