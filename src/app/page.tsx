import { getCurrentOwner, getProvider } from "@/lib/data/provider";
import { seedMeta } from "@/lib/data/seed-provider";
import { shortAddr } from "@/lib/format";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StatTiles } from "@/components/dashboard/StatTiles";
import { PortfolioTrend } from "@/components/dashboard/PortfolioTrend";
import { AgentTable } from "@/components/dashboard/AgentTable";

// Anchor "now" to the active provider's clock. Seed data is anchored to
// SEED_NOW so relative times ("2d ago") line up with the generated history;
// a live provider would pass the real now here instead.
const NOW = seedMeta.now;

function formatAsOf(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  }) + " UTC";
}

export default async function DashboardPage() {
  const provider = getProvider();
  const owner = getCurrentOwner();
  const [summary, agents] = await Promise.all([
    provider.getSummary(owner),
    provider.listAgents(owner),
  ]);
  const asOf = formatAsOf(NOW);

  return (
    <>
      <SiteHeader ownerWallet={owner} />
      <main className="mx-auto max-w-6xl px-5 pb-4 pt-10">
        <header className="mb-8 flex flex-col gap-2">
          <p className="eyebrow">Portfolio · as of {asOf}</p>
          <h1 className="display" style={{ fontSize: "var(--text-h1)" }}>
            Watch your agents earn.
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Settled to{" "}
            <span className="mono" data-numeric title={owner}>
              {shortAddr(owner)}
            </span>{" "}
            on Base · USDC.
          </p>
        </header>

        <div className="flex flex-col gap-8">
          <StatTiles summary={summary} />
          <PortfolioTrend summary={summary} />
          <AgentTable agents={agents} nowISO={NOW.toISOString()} />
        </div>
      </main>
      <SiteFooter sourceLabel={provider.sourceLabel} asOf={asOf} />
    </>
  );
}
