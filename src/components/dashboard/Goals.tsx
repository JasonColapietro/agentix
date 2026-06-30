"use client";

import { useState } from "react";
import type { PortfolioSummary } from "@/lib/data/types";
import { PORTFOLIO_TARGET } from "@/lib/data/local-store";
import { ProgressBar } from "@/components/ui";
import { GoalEditor } from "@/components/input/InlinePanels";
import { usd } from "@/lib/format";

export function Goals({ summary, targets, onChange }: { summary: PortfolioSummary; targets: Record<string, number>; onChange: () => void }) {
  const [editing, setEditing] = useState(false);
  const target = targets[PORTFOLIO_TARGET];
  const current = summary.totalRevenueUsdc;
  const pct = target ? Math.min(100, (current / target) * 100) : 0;
  const reached = target ? current >= target : false;

  return (
    <section className="card flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Portfolio goal</p>
        {target && !editing ? (
          <button type="button" onClick={() => setEditing(true)} className="mono" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>edit</button>
        ) : null}
      </div>

      {target && !editing ? (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <span className="tabular" data-numeric style={{ fontSize: "1.6rem", fontWeight: 500, letterSpacing: "-0.01em" }}>{usd(current)}</span>
            <span className="mono" data-numeric style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>of {usd(target)}</span>
          </div>
          <ProgressBar value={current} max={target} height={10} />
          <p style={{ color: reached ? "var(--verified-emerald)" : "var(--text-muted)", fontSize: "var(--text-xs)" }} data-numeric>
            {reached ? "Goal reached — nice." : `${pct.toFixed(0)}% there · ${usd(target - current)} to go`}
          </p>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Set a revenue target for the whole portfolio and watch the bar fill as your agents earn.</p>
          <GoalEditor id={PORTFOLIO_TARGET} label="Target (USDC)" onSaved={() => { setEditing(false); onChange(); }} />
        </div>
      )}
    </section>
  );
}
