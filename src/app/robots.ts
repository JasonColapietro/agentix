import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Search and AI crawlers named explicitly so each gets an unambiguous invite,
 * not only the wildcard rule. Nothing on this site is private: the tracker
 * keeps an operator's entries in their own browser.
 */
export const NAMED_CRAWLERS = [
  "Googlebot",
  "Bingbot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "DuckAssistBot",
  "meta-externalagent",
  "MistralAI-User",
  "CCBot",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...NAMED_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" })),
      { userAgent: "*", allow: "/" },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, "https://agentix.suedeai.ai/ai-instructions-sitemap.xml"],
  };
}
