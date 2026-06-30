import type { PortfolioSummary } from "@/lib/data/types";
import { AreaChart } from "@/components/charts";
import { compactUsd, usd } from "@/lib/format";

export function PortfolioTrend({ summary }: { summary: PortfolioSummary }) {
  const points = summary.trend.map((p) => ({ label: p.day, value: p.revenueUsdc }));
  const peak = Math.max(...points.map((p) => p.value), 0);

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">Revenue · last {summary.trend.length} days</p>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }} data-numeric>
            Settled USDC earned per day, portfolio-wide
          </p>
        </div>
        <p className="mono hidden sm:block" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }} data-numeric>
          peak {usd(peak)}/day
        </p>
      </div>
      <AreaChart points={points} color="var(--primary)" height={240} format={compactUsd} ariaLabel="Portfolio revenue per day" />
    </section>
  );
}
