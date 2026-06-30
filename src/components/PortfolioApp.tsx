"use client";

import { useCallback, useEffect, useState } from "react";
import { clearAll, examplePortfolio, readPortfolio, type LocalView } from "@/lib/data/local-store";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StatTiles } from "@/components/dashboard/StatTiles";
import { PortfolioTrend } from "@/components/dashboard/PortfolioTrend";
import { AgentTable } from "@/components/dashboard/AgentTable";
import { AgentForm } from "@/components/input/AgentForm";
import { ghostBtn, primaryBtn } from "@/components/input/fields";

function formatAsOf(iso: string): string {
  return (
    new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
      hour12: false,
    }) + " UTC"
  );
}

export function PortfolioApp() {
  // Initial state = deterministic examples, so SSR and first client paint match.
  const [view, setView] = useState<LocalView>(() => examplePortfolio());
  const [showAdd, setShowAdd] = useState(false);

  const refresh = useCallback(() => setView(readPortfolio(new Date())), []);

  useEffect(() => {
    refresh();
    const onStore = () => refresh();
    window.addEventListener("agentix:store", onStore);
    window.addEventListener("storage", onStore);
    return () => {
      window.removeEventListener("agentix:store", onStore);
      window.removeEventListener("storage", onStore);
    };
  }, [refresh]);

  const { summary, agents, examples } = view;
  const asOf = formatAsOf(view.now);

  return (
    <>
      <SiteHeader ownerWallet={summary.ownerWallet || undefined} />
      <main className="mx-auto max-w-6xl px-5 pb-4 pt-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="eyebrow">Portfolio · as of {asOf}</p>
            <h1 className="display" style={{ fontSize: "var(--text-h1)" }}>
              Watch your agents earn.
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              {examples
                ? "Example portfolio — add your own agents to start tracking."
                : `Tracking ${summary.agentCount} ${summary.agentCount === 1 ? "agent" : "agents"} you entered.`}
            </p>
          </div>
          <button type="button" onClick={() => setShowAdd(true)} style={primaryBtn}>
            + Add agent
          </button>
        </header>

        {examples ? (
          <div
            className="mb-8 flex flex-col gap-2 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: "var(--hairline-cyan)", background: "color-mix(in srgb, var(--primary) 5%, transparent)" }}
          >
            <p style={{ fontSize: "var(--text-sm)" }}>
              <span style={{ fontWeight: 500 }}>These are example agents.</span>{" "}
              <span style={{ color: "var(--text-muted)" }}>
                Add your own — everything you enter is saved in this browser.
              </span>
            </p>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              style={{ ...primaryBtn, height: 36, padding: "0 14px", fontSize: "var(--text-xs)" }}
            >
              + Add your first agent
            </button>
          </div>
        ) : null}

        <div className="flex flex-col gap-8">
          <StatTiles summary={summary} />
          <PortfolioTrend summary={summary} />
          <AgentTable agents={agents} nowISO={view.now} />
        </div>

        {!examples ? (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Clear your portfolio and return to the example data?")) clearAll();
              }}
              style={{ ...ghostBtn, height: "auto", padding: "6px 12px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}
            >
              Clear my portfolio
            </button>
          </div>
        ) : null}
      </main>
      <SiteFooter
        sourceLabel={examples ? "seed data (demo)" : "your entries · saved in this browser"}
        asOf={asOf}
      />
      {showAdd ? <AgentForm onClose={() => setShowAdd(false)} onSaved={() => refresh()} /> : null}
    </>
  );
}
