import type { Metadata } from "next";
import { PortfolioApp } from "@/components/PortfolioApp";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
};

// Client-driven: renders the example portfolio server-side, then hydrates the
// operator's own entries from localStorage. See src/lib/data/local-store.ts.
export default function DashboardPage() {
  return <PortfolioApp />;
}
