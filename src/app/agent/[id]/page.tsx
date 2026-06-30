import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentOwner, getProvider } from "@/lib/data/provider";
import { seedMeta } from "@/lib/data/seed-provider";
import { builderLinks } from "@/lib/site";
import { categoryColor } from "@/lib/category";
import { compactNum, compactUsd, num, shortAddr, signedPct, timeAgo, usd, usdPrecise } from "@/lib/format";
import { AreaChart, BarChart } from "@/components/charts";
import { CategoryTag, DeltaPill, StatusBadge } from "@/components/ui";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const NOW = seedMeta.now;

export async function generateStaticParams() {
  // Pre-render the known agents. A live provider can drop this to render
  // on-demand; for the seed source the set is fixed and cheap to enumerate.
  const agents = await getProvider().listAgents(getCurrentOwner());
  return agents.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const agent = await getProvider().getAgent(id);
  if (!agent) return { title: "Agent not found" };
  return {
    title: agent.name,
    description: `${agent.name} — ${usd(agent.stats.revenueUsdc)} earned across ${num(agent.stats.calls)} paid calls on Base.`,
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function Metric({ label, children, accent }: { label: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="flex flex-col gap-1.5 px-5 py-4">
      <p className="eyebrow">{label}</p>
      <div className="tabular flex items-center gap-2" data-numeric style={{ fontSize: "1.35rem", fontWeight: 500, letterSpacing: "-0.01em", color: accent }}>
        {children}
      </div>
    </div>
  );
}

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = getProvider();
  const agent = await provider.getAgent(id);
  if (!agent) notFound();

  const color = categoryColor(agent.category);
  const revenueSeries = agent.daily.map((r) => ({ label: r.day, value: r.revenueUsdc }));
  const callSeries = agent.daily.slice(-30).map((r) => ({ label: r.day, value: r.calls }));
  const errorRate = agent.stats.calls > 0 ? agent.stats.errors / agent.stats.calls : 0;
  const asOf = formatDate(NOW.toISOString());

  return (
    <>
      <SiteHeader ownerWallet={agent.ownerWallet} />
      <main className="mx-auto max-w-6xl px-5 pb-4 pt-8">
        <Link href="/" className="mono inline-flex items-center gap-1 no-underline" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
          <span aria-hidden="true">←</span> Portfolio
        </Link>

        {/* header */}
        <header className="mb-8 mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="display" style={{ fontSize: "var(--text-h2)" }}>{agent.name}</h1>
              <StatusBadge status={agent.status} size="md" />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1" style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
              <CategoryTag category={agent.category} />
              <span aria-hidden="true">·</span>
              <span className="tabular" data-numeric>{usdPrecise(agent.priceUsdc)}/call</span>
              <span aria-hidden="true">·</span>
              <span>launched {formatDate(agent.launchedAt)}</span>
              <span aria-hidden="true">·</span>
              <span className="mono" data-numeric title={agent.ownerWallet}>{shortAddr(agent.ownerWallet)}</span>
            </div>
          </div>
          <a
            href={builderLinks.agent(agent.slug)}
            target="_blank"
            rel="noreferrer"
            className="mono inline-flex shrink-0 items-center gap-1.5 rounded-md px-3.5 py-2 no-underline"
            style={{ fontSize: "var(--text-xs)", color: "var(--on-primary)", background: "var(--primary)" }}
          >
            View x402 listing <span aria-hidden="true">↗</span>
          </a>
        </header>

        {/* metrics */}
        <section className="card mb-8 grid grid-cols-2 divide-x divide-y lg:grid-cols-4 lg:divide-y-0" style={{ borderColor: "var(--hairline)" }}>
          <Metric label="Total earned">{usd(agent.stats.revenueUsdc)}</Metric>
          <Metric label="Paid calls">{num(agent.stats.calls)}</Metric>
          <Metric label="Last 7 days">
            <DeltaPill fraction={agent.delta7d} />
          </Metric>
          <Metric label="Error rate" accent={errorRate > 0.1 ? "var(--negative)" : undefined}>
            {(errorRate * 100).toFixed(1)}%
          </Metric>
        </section>

        {/* earnings curve */}
        <section className="card mb-6 p-5">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="eyebrow">Earnings · since launch</p>
              <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>Settled USDC per day</p>
            </div>
            <p className="mono hidden sm:block" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }} data-numeric>
              gross {compactUsd(agent.stats.grossUsdc)} · net {compactUsd(agent.stats.revenueUsdc)}
            </p>
          </div>
          <AreaChart points={revenueSeries} color={color} height={220} format={compactUsd} ariaLabel={`${agent.name} earnings per day`} />
        </section>

        {/* call volume + health */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="card p-5 lg:col-span-2">
            <div className="mb-4 flex flex-col gap-1">
              <p className="eyebrow">Call volume · last 30 days</p>
              <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }} data-numeric>
                {compactNum(callSeries.reduce((s, p) => s + p.value, 0))} calls in window
              </p>
            </div>
            <BarChart points={callSeries} color={color} height={170} ariaLabel={`${agent.name} call volume`} />
          </section>

          <section className="card flex flex-col p-5">
            <p className="eyebrow mb-4">Endpoint health</p>
            <div className="flex flex-col gap-4">
              <HealthRow label="Status"><StatusBadge status={agent.status} size="md" /></HealthRow>
              <HealthRow label="Last call">
                <span className="tabular" data-numeric>{timeAgo(agent.stats.lastActiveAt, NOW)}</span>
              </HealthRow>
              <HealthRow label="Error rate">
                <span className="tabular" data-numeric style={{ color: errorRate > 0.1 ? "var(--negative)" : undefined }}>
                  {(errorRate * 100).toFixed(1)}%
                </span>
              </HealthRow>
              <HealthRow label="7-day trend">
                <span className="tabular" data-numeric>{signedPct(agent.delta7d)}</span>
              </HealthRow>
            </div>
            <div className="mt-auto flex flex-col gap-1.5 pt-5">
              <a href={builderLinks.x402(agent.slug)} target="_blank" rel="noreferrer" className="mono no-underline" style={{ fontSize: "var(--text-xs)", color: "var(--primary)" }}>
                x402 discovery doc ↗
              </a>
              <a href={builderLinks.agent(agent.slug)} target="_blank" rel="noreferrer" className="mono no-underline" style={{ fontSize: "var(--text-xs)", color: "var(--primary)" }}>
                Public listing ↗
              </a>
            </div>
          </section>
        </div>

        {/* recent runs */}
        <section className="card overflow-hidden">
          <div className="border-b px-5 py-4" style={{ borderColor: "var(--hairline)" }}>
            <p className="eyebrow">Recent runs</p>
          </div>
          {agent.recentRuns.length === 0 ? (
            <p className="px-5 py-8 text-center" style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
              No paid calls yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 560 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--hairline)" }}>
                    <th className="px-5 py-2.5 text-left"><span className="eyebrow">Call</span></th>
                    <th className="px-3 py-2.5 text-right"><span className="eyebrow">Gross</span></th>
                    <th className="px-3 py-2.5 text-right"><span className="eyebrow">Net</span></th>
                    <th className="px-3 py-2.5 text-right"><span className="eyebrow">When</span></th>
                    <th className="px-5 py-2.5 text-right"><span className="eyebrow">Settled</span></th>
                  </tr>
                </thead>
                <tbody>
                  {agent.recentRuns.map((run) => (
                    <tr key={run.callId} style={{ borderBottom: "1px solid var(--hairline)" }}>
                      <td className="px-5 py-3">
                        <span className="mono" data-numeric style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                          {run.callId.slice(0, 12)}…
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right tabular" data-numeric style={{ color: "var(--text-muted)" }}>{usdPrecise(run.grossUsdc)}</td>
                      <td className="px-3 py-3 text-right tabular" data-numeric style={{ fontWeight: 500 }}>{run.settled ? usdPrecise(run.amountUsdc) : "—"}</td>
                      <td className="px-3 py-3 text-right tabular" data-numeric style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{timeAgo(run.ts, NOW)}</td>
                      <td className="px-5 py-3 text-right">
                        {run.settled ? (
                          <span className="mono inline-flex items-center gap-1" style={{ fontSize: "var(--text-label)", color: "var(--positive)" }}>
                            <span aria-hidden="true">✓</span> settled
                          </span>
                        ) : (
                          <span className="mono" style={{ fontSize: "var(--text-label)", color: "var(--text-muted)" }}>unsettled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      <SiteFooter sourceLabel={provider.sourceLabel} asOf={asOf} />
    </>
  );
}

function HealthRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{label}</span>
      {children}
    </div>
  );
}
