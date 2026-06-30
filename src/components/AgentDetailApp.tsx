"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DailyRoll } from "@/lib/data/types";
import { exampleAgent, readAgent, removeAgent, type LocalAgentView } from "@/lib/data/local-store";
import { builderLinks } from "@/lib/site";
import { categoryColor } from "@/lib/category";
import { compactNum, compactUsd, num, shortAddr, shortDay, signedPct, timeAgo, usd, usdPrecise } from "@/lib/format";
import { AreaChart, BarChart } from "@/components/charts";
import { CategoryTag, DeltaPill, StatusBadge } from "@/components/ui";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AgentForm } from "@/components/input/AgentForm";
import { LogEarningsForm } from "@/components/input/LogEarningsForm";
import { ghostBtn, primaryBtn } from "@/components/input/fields";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function AgentDetailApp({ id }: { id: string }) {
  const router = useRouter();
  const [view, setView] = useState<LocalAgentView | null>(() => exampleAgent(id));
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [logging, setLogging] = useState(false);

  const refresh = useCallback(() => setView(readAgent(id, new Date())), [id]);

  useEffect(() => {
    setMounted(true);
    refresh();
    const onStore = () => refresh();
    window.addEventListener("agentix:store", onStore);
    window.addEventListener("storage", onStore);
    return () => {
      window.removeEventListener("agentix:store", onStore);
      window.removeEventListener("storage", onStore);
    };
  }, [refresh]);

  if (!view) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-5 py-24">
          {!mounted ? (
            <p style={{ color: "var(--text-muted)" }}>Loading…</p>
          ) : (
            <>
              <p className="eyebrow">Agent not found</p>
              <h1 className="display" style={{ fontSize: "var(--text-h2)" }}>
                No agent by that id.
              </h1>
              <p style={{ color: "var(--text-muted)" }}>It may have been removed, or the link is stale.</p>
              <Link href="/" className="mono mt-2 inline-flex items-center gap-1 rounded-md px-3.5 py-2 no-underline" style={{ fontSize: "var(--text-xs)", color: "var(--on-primary)", background: "var(--primary)" }}>
                ← Back to portfolio
              </Link>
            </>
          )}
        </main>
      </>
    );
  }

  const { agent, examples, now } = view;
  const NOW = new Date(now);
  const color = categoryColor(agent.category);
  const revenueSeries = agent.daily.map((r) => ({ label: r.day, value: r.revenueUsdc }));
  const callSeries = agent.daily.slice(-30).map((r) => ({ label: r.day, value: r.calls }));
  const errorRate = agent.stats.calls > 0 ? agent.stats.errors / agent.stats.calls : 0;
  const loggedDays = agent.daily.filter((r) => r.calls > 0 || r.revenueUsdc > 0 || r.errors > 0).slice(-20).reverse();

  function onDelete() {
    if (window.confirm(`Delete ${agent.name}? This removes it and its logged days.`)) {
      removeAgent(agent.id);
      router.push("/");
    }
  }

  return (
    <>
      <SiteHeader ownerWallet={agent.ownerWallet || undefined} />
      <main className="mx-auto max-w-6xl px-5 pb-4 pt-8">
        <Link href="/" className="mono inline-flex items-center gap-1 no-underline" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
          <span aria-hidden="true">←</span> Portfolio
        </Link>

        {/* header */}
        <header className="mb-6 mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
              {agent.ownerWallet ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="mono" data-numeric title={agent.ownerWallet}>{shortAddr(agent.ownerWallet)}</span>
                </>
              ) : null}
            </div>
          </div>

          {examples ? (
            agent.x402Url ? (
              <a href={agent.x402Url} target="_blank" rel="noreferrer" className="mono inline-flex shrink-0 items-center gap-1.5 rounded-md px-3.5 py-2 no-underline" style={{ fontSize: "var(--text-xs)", color: "var(--on-primary)", background: "var(--primary)" }}>
                View x402 listing <span aria-hidden="true">↗</span>
              </a>
            ) : null
          ) : (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button type="button" onClick={() => setLogging(true)} style={primaryBtn}>+ Log earnings</button>
              <button type="button" onClick={() => setEditing(true)} style={ghostBtn}>Edit</button>
              <button type="button" onClick={onDelete} style={{ ...ghostBtn, color: "var(--negative)" }}>Delete</button>
            </div>
          )}
        </header>

        {examples ? (
          <div className="mb-6 rounded-lg border px-4 py-3" style={{ borderColor: "var(--hairline-cyan)", background: "color-mix(in srgb, var(--primary) 5%, transparent)", fontSize: "var(--text-sm)" }}>
            <span style={{ fontWeight: 500 }}>Example agent.</span>{" "}
            <Link href="/" className="no-underline" style={{ color: "var(--primary)" }}>Add your own agent</Link>{" "}
            <span style={{ color: "var(--text-muted)" }}>to log and track real earnings.</span>
          </div>
        ) : null}

        {/* metrics */}
        <section className="card mb-8 grid grid-cols-2 divide-x divide-y lg:grid-cols-4 lg:divide-y-0" style={{ borderColor: "var(--hairline)" }}>
          <Metric label="Total earned">{usd(agent.stats.revenueUsdc)}</Metric>
          <Metric label="Paid calls">{num(agent.stats.calls)}</Metric>
          <Metric label="Last 7 days"><DeltaPill fraction={agent.delta7d} /></Metric>
          <Metric label="Error rate" accent={errorRate > 0.1 ? "var(--negative)" : undefined}>{(errorRate * 100).toFixed(1)}%</Metric>
        </section>

        {/* earnings curve */}
        <section className="card mb-6 p-5">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="eyebrow">Earnings · since launch</p>
              <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>USDC revenue per day</p>
            </div>
            <p className="mono hidden sm:block" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }} data-numeric>
              gross {compactUsd(agent.stats.grossUsdc)} · net {compactUsd(agent.stats.revenueUsdc)}
            </p>
          </div>
          {revenueSeries.some((p) => p.value > 0) ? (
            <AreaChart points={revenueSeries} color={color} height={220} format={compactUsd} ariaLabel={`${agent.name} earnings per day`} />
          ) : (
            <EmptyChart examples={examples} onLog={() => setLogging(true)} />
          )}
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
              <HealthRow label="Last call"><span className="tabular" data-numeric>{timeAgo(agent.stats.lastActiveAt, NOW)}</span></HealthRow>
              <HealthRow label="Error rate"><span className="tabular" data-numeric style={{ color: errorRate > 0.1 ? "var(--negative)" : undefined }}>{(errorRate * 100).toFixed(1)}%</span></HealthRow>
              <HealthRow label="7-day trend"><span className="tabular" data-numeric>{signedPct(agent.delta7d)}</span></HealthRow>
            </div>
            {examples ? (
              <div className="mt-auto flex flex-col gap-1.5 pt-5">
                <a href={builderLinks.x402(agent.slug)} target="_blank" rel="noreferrer" className="mono no-underline" style={{ fontSize: "var(--text-xs)", color: "var(--primary)" }}>x402 discovery doc ↗</a>
                <a href={builderLinks.agent(agent.slug)} target="_blank" rel="noreferrer" className="mono no-underline" style={{ fontSize: "var(--text-xs)", color: "var(--primary)" }}>Public listing ↗</a>
              </div>
            ) : agent.x402Url ? (
              <div className="mt-auto flex flex-col gap-1.5 pt-5">
                <a href={agent.x402Url} target="_blank" rel="noreferrer" className="mono no-underline" style={{ fontSize: "var(--text-xs)", color: "var(--primary)" }}>x402 endpoint ↗</a>
              </div>
            ) : null}
          </section>
        </div>

        {/* recent activity */}
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--hairline)" }}>
            <p className="eyebrow">{examples ? "Recent runs" : "Logged days"}</p>
            {!examples ? (
              <button type="button" onClick={() => setLogging(true)} className="mono" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)", fontSize: "var(--text-xs)" }}>+ Log a day</button>
            ) : null}
          </div>

          {examples ? (
            <RunsTable runs={agent.recentRuns} now={NOW} />
          ) : loggedDays.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
              <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No days logged yet.</p>
              <button type="button" onClick={() => setLogging(true)} style={primaryBtn}>+ Log your first day</button>
            </div>
          ) : (
            <EntriesTable rows={loggedDays} price={agent.priceUsdc} />
          )}
        </section>
      </main>
      <SiteFooter sourceLabel={examples ? "seed data (demo)" : "your entries · saved in this browser"} asOf={formatDate(now)} />

      {editing && !examples ? <AgentForm initial={agent} onClose={() => setEditing(false)} onSaved={() => refresh()} /> : null}
      {logging && !examples ? <LogEarningsForm agentId={agent.id} agentName={agent.name} onClose={() => setLogging(false)} onSaved={() => refresh()} /> : null}
    </>
  );
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

function HealthRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{label}</span>
      {children}
    </div>
  );
}

function EmptyChart({ examples, onLog }: { examples: boolean; onLog: () => void }) {
  return (
    <div className="pane flex flex-col items-center justify-center gap-3 py-12 text-center" style={{ minHeight: 180 }}>
      <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No earnings logged yet.</p>
      {!examples ? (
        <button type="button" onClick={onLog} style={primaryBtn}>+ Log earnings</button>
      ) : null}
    </div>
  );
}

function RunsTable({ runs, now }: { runs: { callId: string; ts: string; grossUsdc: number; amountUsdc: number; settled: boolean }[]; now: Date }) {
  if (runs.length === 0) {
    return <p className="px-5 py-8 text-center" style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No paid calls yet.</p>;
  }
  return (
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
          {runs.map((run) => (
            <tr key={run.callId} style={{ borderBottom: "1px solid var(--hairline)" }}>
              <td className="px-5 py-3"><span className="mono" data-numeric style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{run.callId.slice(0, 12)}…</span></td>
              <td className="px-3 py-3 text-right tabular" data-numeric style={{ color: "var(--text-muted)" }}>{usdPrecise(run.grossUsdc)}</td>
              <td className="px-3 py-3 text-right tabular" data-numeric style={{ fontWeight: 500 }}>{run.settled ? usdPrecise(run.amountUsdc) : "—"}</td>
              <td className="px-3 py-3 text-right tabular" data-numeric style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{timeAgo(run.ts, now)}</td>
              <td className="px-5 py-3 text-right">
                {run.settled ? (
                  <span className="mono inline-flex items-center gap-1" style={{ fontSize: "var(--text-label)", color: "var(--positive)" }}><span aria-hidden="true">✓</span> settled</span>
                ) : (
                  <span className="mono" style={{ fontSize: "var(--text-label)", color: "var(--text-muted)" }}>unsettled</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EntriesTable({ rows, price }: { rows: DailyRoll[]; price: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 480 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--hairline)" }}>
            <th className="px-5 py-2.5 text-left"><span className="eyebrow">Day</span></th>
            <th className="px-3 py-2.5 text-right"><span className="eyebrow">Calls</span></th>
            <th className="px-3 py-2.5 text-right"><span className="eyebrow">Revenue</span></th>
            <th className="px-5 py-2.5 text-right"><span className="eyebrow">Errors</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.day} style={{ borderBottom: "1px solid var(--hairline)" }}>
              <td className="px-5 py-3"><span className="tabular" data-numeric>{shortDay(r.day)}</span></td>
              <td className="px-3 py-3 text-right tabular" data-numeric>{num(r.calls)}</td>
              <td className="px-3 py-3 text-right tabular" data-numeric style={{ fontWeight: 500 }}>{usd(r.revenueUsdc)}</td>
              <td className="px-5 py-3 text-right tabular" data-numeric style={{ color: r.errors > 0 ? "var(--negative)" : "var(--text-muted)" }}>{num(r.errors)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
