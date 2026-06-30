"use client";

import { useCallback, useEffect, useState } from "react";
import { clearAll, examplePortfolio, readPortfolio, type LocalView } from "@/lib/data/local-store";
import type { GradeLetter } from "@/lib/data/types";
import { num, usd } from "@/lib/format";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DeltaPill } from "@/components/ui";
import { GradeBadge } from "@/components/grade-ui";
import { StatTiles } from "@/components/dashboard/StatTiles";
import { TrendPanel } from "@/components/dashboard/TrendPanel";
import { Allocation } from "@/components/dashboard/Allocation";
import { Goals } from "@/components/dashboard/Goals";
import { AgentBoard } from "@/components/dashboard/AgentBoard";

function formatAsOf(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC", hour12: false }) + " UTC";
}

const GRADE_WORD: Record<GradeLetter, string> = { S: "Exceptional", A: "Strong", B: "Solid", C: "Fair", D: "Weak", F: "Failing" };

export function PortfolioApp() {
  const [view, setView] = useState<LocalView>(() => examplePortfolio());
  const refresh = useCallback(() => setView(readPortfolio(new Date())), []);

  useEffect(() => {
    refresh();
    const on = () => refresh();
    window.addEventListener("agentix:store", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("agentix:store", on);
      window.removeEventListener("storage", on);
    };
  }, [refresh]);

  const { summary, agents, examples, portfolioGrade, targets } = view;
  const asOf = formatAsOf(view.now);

  return (
    <>
      <SiteHeader ownerWallet={summary.ownerWallet || undefined} />
      <main className="mx-auto max-w-6xl px-5 pb-6 pt-10">
        {/* hero */}
        <header className="mb-8">
          <p className="eyebrow mb-3">Portfolio · as of {asOf}</p>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-5">
              <GradeBadge grade={portfolioGrade} size="xl" />
              <div className="flex flex-col gap-1.5">
                <span className="tabular" data-numeric style={{ fontSize: "clamp(2rem, 1.5rem + 2vw, 3rem)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {usd(summary.totalRevenueUsdc)}
                </span>
                <div className="flex flex-wrap items-center gap-2" style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
                  <DeltaPill fraction={summary.delta7d} />
                  <span data-numeric>earned · {summary.agentCount} agents · {num(summary.totalCalls)} calls</span>
                </div>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="eyebrow mb-1">Portfolio grade</p>
              <p className="display" style={{ fontSize: "var(--text-h3)", color: portfolioGrade.color }}>
                {portfolioGrade.letter} · {GRADE_WORD[portfolioGrade.letter]}
              </p>
            </div>
          </div>
        </header>

        {examples ? (
          <div className="mb-8 flex flex-col gap-2 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--hairline-cyan)", background: "color-mix(in srgb, var(--primary) 5%, transparent)" }}>
            <p style={{ fontSize: "var(--text-sm)" }}>
              <span style={{ fontWeight: 500 }}>Example portfolio.</span>{" "}
              <span style={{ color: "var(--text-muted)" }}>Add your own agents below — everything you enter is saved in this browser.</span>
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-8">
          <StatTiles summary={summary} />
          <TrendPanel trend={summary.trend} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Allocation agents={agents} />
            </div>
            <Goals summary={summary} targets={targets} onChange={refresh} />
          </div>
          <AgentBoard agents={agents} targets={targets} nowISO={view.now} editable={!examples} onChange={refresh} />
        </div>

        {!examples ? (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => { if (window.confirm("Clear your portfolio and return to the example data?")) clearAll(); }}
              className="mono"
              style={{ background: "none", border: "1px solid var(--hairline)", borderRadius: "var(--radius-sm)", padding: "6px 12px", fontSize: "var(--text-xs)", color: "var(--text-muted)", cursor: "pointer" }}
            >
              Clear my portfolio
            </button>
          </div>
        ) : null}
      </main>
      <SiteFooter sourceLabel={examples ? "seed data (demo)" : "your entries · saved in this browser"} asOf={asOf} />
    </>
  );
}
