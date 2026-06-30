import type { PortfolioSummary } from "@/lib/data/types";
import { compactUsd, num, usd } from "@/lib/format";
import { Sparkline } from "@/components/charts";
import { DeltaPill } from "@/components/ui";

function Tile({
  label,
  children,
  sub,
}: {
  label: string;
  children: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col gap-2 p-5">
      <p className="eyebrow">{label}</p>
      <div className="flex items-end justify-between gap-3">{children}</div>
      {sub ? (
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }} data-numeric>
          {sub}
        </p>
      ) : null}
    </div>
  );
}

function Figure({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="tabular"
      style={{ fontSize: "clamp(1.6rem, 1.2rem + 1.4vw, 2.1rem)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}
    >
      {children}
    </span>
  );
}

export function StatTiles({ summary }: { summary: PortfolioSummary }) {
  const last7 = summary.trend.slice(-7).map((p) => p.revenueUsdc);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Tile label="Total earned" sub={`${compactUsd(summary.totalGrossUsdc)} gross at list price`}>
        <Figure>{usd(summary.totalRevenueUsdc)}</Figure>
      </Tile>

      <Tile label="Paid calls" sub={`across ${summary.agentCount} agents`}>
        <Figure>{num(summary.totalCalls)}</Figure>
      </Tile>

      <Tile label="Active agents" sub="called in the last 7 days">
        <Figure>
          {summary.activeAgents}
          <span style={{ color: "var(--text-muted)", fontSize: "0.5em", fontWeight: 450 }}> / {summary.agentCount}</span>
        </Figure>
      </Tile>

      <Tile label="Last 7 days" sub={<span>vs prior 7 days</span>}>
        <div className="flex flex-col gap-1.5">
          <Figure>{usd(summary.revenue7d)}</Figure>
          <DeltaPill fraction={summary.delta7d} />
        </div>
        <Sparkline values={last7} color="var(--primary)" width={108} height={40} />
      </Tile>
    </section>
  );
}
