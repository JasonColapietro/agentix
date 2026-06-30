import { PortfolioApp } from "@/components/PortfolioApp";

// Client-driven: renders the example portfolio server-side, then hydrates the
// operator's own entries from localStorage. See src/lib/data/local-store.ts.
export default function DashboardPage() {
  return <PortfolioApp />;
}
