import type { Metadata } from "next";
import { PortfolioApp } from "@/components/PortfolioApp";
import { SITE_URL } from "@/lib/site";
import { HOME_KEYWORDS } from "@/lib/seo-keywords";
import { HOME_JSON_LD } from "@/lib/home-seo";

export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/` },
  keywords: [...HOME_KEYWORDS],
};

// Client-driven: renders the example portfolio server-side, then hydrates the
// operator's own entries from localStorage. See src/lib/data/local-store.ts.
export default function DashboardPage() {
  return (
    <>
      <PortfolioApp />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSON_LD).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
