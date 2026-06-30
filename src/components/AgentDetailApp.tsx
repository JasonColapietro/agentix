"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DailyRoll, GradeLetter } from "@/lib/data/types";
import { exampleAgent, readAgent, removeAgent, type LocalAgentView } from "@/lib/data/local-store";
import { categoryColor } from "@/lib/category";
import { num, shortAddr, shortDay, signedPct, timeAgo, usd, usdPrecise } from "@/lib/format";
import { CategoryTag, DeltaPill, ProgressBar, StatusBadge } from "@/components/ui";
import { GradeBadge, GradeBreakdownBars } from "@/components/grade-ui";
import { TrendPanel } from "@/components/dashboard/TrendPanel";
import { InlineAgentForm, InlineLogForm, GoalEditor } from "@/components/input/InlinePanels";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ghostBtn, primaryBtn } from "@/components/input/fields";

const GRADE_WORD: Record<GradeLetter, string> = { S: "Exceptional", A: "Strong", B: "Solid", C: "Fair", D: "Weak", F: "Failing" };

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
    const on = () => refresh();
    window.addEventListener("agentix:store", on);
    window.addEventListener("storage", on);
    return () => { window.removeEventListener("agentix:store", on); window.removeEventListener("storage", on); };
  }, [refresh]);

  if (!view) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-5 py-24">
          {!mounted ? <p style={{ color: "var(--text-muted)" }}>Loading…</p> : (
            <>
              <p className="eyebrow">Agent not found</p>
              <h1 className="display" style={{ fontSize: "var(--text-h2)" }}>No agent by that id.</h1>
              <Link href="/" className="mono mt-2 inline-flex rounded-md px-3.5 py-2 no-underline" style={{ fontSize: "var(--text-xs)", color: "var(--on-primary)", background: "var(--primary)" }}>← Back to portfolio</Link>
            </>
          )}
        </main>
      </>
    );
  }

  const { agent, examples, now, target } = view;
  const editable = !examples;
  const NOW = new Date(now);
  const color = categoryColor(agent.category);
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
      <main className="mx-auto max-w-6xl px-5 pb-6 pt-8">
        <Link href="/" className="mono inline-flex items-center gap-1 no-underline" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
          <span aria-hidden="true">←</span> Portfolio
        </Link>

        {/* header */}
        <header className="mb-6 mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <GradeBadge grade={agent.grade} size="lg" />
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
                {agent.ownerWallet ? (<><span aria-hidden="true">·</span><span className="mono" data-numeric title={agent.ownerWallet}>{shortAddr(agent.ownerWallet)}</span></>) : null}
              </div>
            </div>
          </div>
          {editable ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button type="button" onClick={() => { setEditing(false); setLogging((v) => !v); }} style={primaryBtn}>+ Log a day</button>
              <button type="button" onClick={() => { setLogging(false); setEditing((v) => !v); }} style={ghostBtn}>Edit</button>
              <button type="button" onClick={onDelete} style={{ ...ghostBtn, color: "var(--rights-red)" }}>Delete</button>
            </div>
          ) : agent.x402Url ? (
            <a href={agent.x402Url} target="_blank" rel="noreferrer" className="mono inline-flex shrink-0 items-center gap-1.5 rounded-md px-3.5 py-2 no-underline" style={{ fontSize: "var(--text-xs)", color: "var(--on-primary)", background: "var(--primary)" }}>View x402 listing <span aria-hidden="true">↗</span></a>
          ) : null}
        </header>

        {!editable ? (
          <div className="mb-6 rounded-lg border px-4 py-3" style={{ borderColor: "var(--hairline-cyan)", background: "color-mix(in srgb, var(--primary) 5%, transparent)", fontSize: "var(--text-sm)" }}>
            <span style={{ fontWeight: 500 }}>Example agent.</span>{" "}
            <Link href="/" className="no-underline" style={{ color: "var(--primary)" }}>Add your own agent</Link>{" "}
            <span style={{ color: "var(--text-muted)" }}>to log, grade, and set goals.</span>
          </div>
        ) : null}

        {editing && editable ? <div className="mb-6"><InlineAgentForm initial={agent} onClose={() => setEditing(false)} onSaved={refresh} /></div> : null}
        {logging && editable ? <div className="mb-6"><InlineLogForm agentId={agent.id} agentName={agent.name} onClose={() => setLogging(false)} onSaved={refresh} /></div> : null}

        {/* grade + goal */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center gap-4">
              <GradeBadge grade={agent.grade} size="lg" />
              <div className="flex flex-col">
                <p className="eyebrow">Grade</p>
                <p className="display" style={{ fontSize: "var(--text-h3)", color: agent.grade.color }}>{agent.grade.letter} · {GRADE_WORD[agent.grade.letter]}</p>
                <p className="tabular" data-numeric style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>score {agent.grade.score}/100</p>
              </div>
            </div>
            <GradeBreakdownBars grade={agent.grade} />
          </section>

          <section className="card flex flex-col gap-3 p-5">
            <p className="eyebrow">Goal</p>
            {target ? (
              <>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="tabular" data-numeric style={{ fontSize: "1.4rem", fontWeight: 500 }}>{usd(agent.stats.revenueUsdc)}</span>
                  <span className="mono" data-numeric style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>of {usd(target)}</span>
                </div>
                <ProgressBar value={agent.stats.revenueUsdc} max={target} color={color} height={10} />
                <p style={{ color: agent.stats.revenueUsdc >= target ? "var(--verified-emerald)" : "var(--text-muted)", fontSize: "var(--text-xs)" }} data-numeric>
                  {agent.stats.revenueUsdc >= target ? "Reached." : `${Math.round((agent.stats.revenueUsdc / target) * 100)}% · ${usd(target - agent.stats.revenueUsdc)} to go`}
                </p>
              </>
            ) : editable ? (
              <>
                <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Set a revenue target for this agent.</p>
                <GoalEditor id={agent.id} label="Target (USDC)" onSaved={refresh} />
              </>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No goal set.</p>
            )}
          </section>
        </div>

        {/* performance chart (range + metric) */}
        <div className="mb-6">
          <TrendPanel trend={agent.daily as DailyRoll[]} />
        </div>

        {/* health + activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="card flex flex-col p-5">
            <p className="eyebrow mb-4">Endpoint health</p>
            <div className="flex flex-col gap-4">
              <HealthRow label="Status"><StatusBadge status={agent.status} size="md" /></HealthRow>
              <HealthRow label="Last call"><span className="tabular" data-numeric>{timeAgo(agent.stats.lastActiveAt, NOW)}</span></HealthRow>
              <HealthRow label="Error rate"><span className="tabular" data-numeric style={{ color: errorRate > 0.1 ? "var(--rights-red)" : undefined }}>{(errorRate * 100).toFixed(1)}%</span></HealthRow>
              <HealthRow label="7-day trend"><span className="tabular" data-numeric>{signedPct(agent.delta7d)}</span></HealthRow>
              <HealthRow label="Gross / net"><span className="tabular" data-numeric style={{ color: "var(--text-muted)" }}>{usd(agent.stats.grossUsdc)} / {usd(agent.stats.revenueUsdc)}</span></HealthRow>
            </div>
          </section>

          <section className="card overflow-hidden lg:col-span-2">
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--hairline)" }}>
              <p className="eyebrow">{examples ? "Recent runs" : "Logged days"}</p>
              {editable ? <button type="button" onClick={() => { setEditing(false); setLogging(true); }} className="mono" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)", fontSize: "var(--text-xs)" }}>+ Log a day</button> : null}
            </div>
            {examples ? (
              <RunsTable runs={agent.recentRuns} now={NOW} />
            ) : loggedDays.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
                <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No days logged yet.</p>
                <button type="button" onClick={() => setLogging(true)} style={primaryBtn}>+ Log your first day</button>
              </div>
            ) : (
              <EntriesTable rows={loggedDays} />
            )}
          </section>
        </div>
      </main>
      <SiteFooter sourceLabel={examples ? "seed data (demo)" : "your entries · saved in this browser"} asOf={formatDate(now)} />
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

function RunsTable({ runs, now }: { runs: { callId: string; ts: string; grossUsdc: number; amountUsdc: number; settled: boolean }[]; now: Date }) {
  if (runs.length === 0) return <p className="px-5 py-8 text-center" style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No paid calls yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 480 }}>
        <thead><tr style={{ borderBottom: "1px solid var(--hairline)" }}>
          <th className="px-5 py-2.5 text-left"><span className="eyebrow">Call</span></th>
          <th className="px-3 py-2.5 text-right"><span className="eyebrow">Net</span></th>
          <th className="px-3 py-2.5 text-right"><span className="eyebrow">When</span></th>
          <th className="px-5 py-2.5 text-right"><span className="eyebrow">Settled</span></th>
        </tr></thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.callId} style={{ borderBottom: "1px solid var(--hairline)" }}>
              <td className="px-5 py-3"><span className="mono" data-numeric style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{run.callId.slice(0, 12)}…</span></td>
              <td className="px-3 py-3 text-right tabular" data-numeric style={{ fontWeight: 500 }}>{run.settled ? usdPrecise(run.amountUsdc) : "—"}</td>
              <td className="px-3 py-3 text-right tabular" data-numeric style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{timeAgo(run.ts, now)}</td>
              <td className="px-5 py-3 text-right">{run.settled ? <span className="mono" style={{ fontSize: "var(--text-label)", color: "var(--verified-emerald)" }}>✓ settled</span> : <span className="mono" style={{ fontSize: "var(--text-label)", color: "var(--text-muted)" }}>unsettled</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EntriesTable({ rows }: { rows: DailyRoll[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 420 }}>
        <thead><tr style={{ borderBottom: "1px solid var(--hairline)" }}>
          <th className="px-5 py-2.5 text-left"><span className="eyebrow">Day</span></th>
          <th className="px-3 py-2.5 text-right"><span className="eyebrow">Calls</span></th>
          <th className="px-3 py-2.5 text-right"><span className="eyebrow">Revenue</span></th>
          <th className="px-5 py-2.5 text-right"><span className="eyebrow">Errors</span></th>
        </tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.day} style={{ borderBottom: "1px solid var(--hairline)" }}>
              <td className="px-5 py-3"><span className="tabular" data-numeric>{shortDay(r.day)}</span></td>
              <td className="px-3 py-3 text-right tabular" data-numeric>{num(r.calls)}</td>
              <td className="px-3 py-3 text-right tabular" data-numeric style={{ fontWeight: 500 }}>{usd(r.revenueUsdc)}</td>
              <td className="px-5 py-3 text-right tabular" data-numeric style={{ color: r.errors > 0 ? "var(--rights-red)" : "var(--text-muted)" }}>{num(r.errors)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
