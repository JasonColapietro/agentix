import { CONTENT_LAST_MODIFIED, SITE_URL } from "@/lib/site";

const SITE_NAME = "Agentix";
export const DEFAULT_TITLE = "Agentix: x402 AI Agent Earnings Tracker for USDC on Base";
export const DEFAULT_DESCRIPTION =
  "The portfolio tracker for the x402 agents you've launched. Total USDC earned on Base, calls, per-agent performance, status, and trend. One screen.";

/**
 * Site-wide WebSite node and the homepage WebPage. Agent profile pages add
 * their own WebPage (src/lib/agent-seo.ts) that points back at this WebSite.
 */
export const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": "https://suedeai.ai/#organization" },
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: `${SITE_URL}/`,
      name: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      inLanguage: "en",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#app` },
      publisher: { "@id": "https://suedeai.ai/#organization" },
      dateModified: CONTENT_LAST_MODIFIED.home,
    },
  ],
};
