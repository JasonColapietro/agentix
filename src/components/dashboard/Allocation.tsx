import type { AgentWithStats } from "@/lib/data/types";
import { categoryColor } from "@/lib/category";
import { usd } from "@/lib/format";

export function Allocation({ agents }: { agents: AgentWithStats[] }) {
  const earners = agents.filter((a) => a.stats.revenueUsdc > 0).sort((a, b) => b.stats.revenueUsdc - a.stats.revenueUsdc);
  const total = earners.reduce((s, a) => s + a.stats.revenueUsdc, 0);
  const top = earners.slice(0, 8);
  const rest = earners.slice(8);
  const restRev = rest.reduce((s, a) => s + a.stats.revenueUsdc, 0);

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <p className="eyebrow">Revenue allocation</p>
        <p className="mono" style={{ fontSize: "var(--text-label)", color: "var(--text-muted)" }} data-numeric>
          {earners.length} earning
        </p>
      </div>

      {earners.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No revenue logged yet.</p>
      ) : (
        <>
          {/* stacked share bar */}
          <div className="mb-4 flex h-2.5 w-full overflow-hidden rounded-full" style={{ background: "var(--canvas-bg)" }}>
            {top.map((a) => (
              <div key={a.id} title={`${a.name} · ${usd(a.stats.revenueUsdc)}`} style={{ width: `${(a.stats.revenueUsdc / total) * 100}%`, background: categoryColor(a.category) }} />
            ))}
            {restRev > 0 ? <div style={{ width: `${(restRev / total) * 100}%`, background: "var(--text-muted)" }} /> : null}
          </div>

          <div className="flex flex-col gap-2.5">
            {top.map((a) => {
              const pct = (a.stats.revenueUsdc / total) * 100;
              return (
                <div key={a.id} className="flex items-center gap-3">
                  <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 2, background: categoryColor(a.category), flexShrink: 0 }} />
                  <span className="truncate" style={{ flex: 1, fontSize: "var(--text-sm)" }}>{a.name}</span>
                  <span className="tabular" data-numeric style={{ width: 72, textAlign: "right", fontSize: "var(--text-sm)" }}>{usd(a.stats.revenueUsdc)}</span>
                  <span className="tabular" data-numeric style={{ width: 40, textAlign: "right", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{pct.toFixed(0)}%</span>
                </div>
              );
            })}
            {restRev > 0 ? (
              <div className="flex items-center gap-3">
                <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 2, background: "var(--text-muted)", flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{rest.length} more</span>
                <span className="tabular" data-numeric style={{ width: 72, textAlign: "right", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{usd(restRev)}</span>
                <span className="tabular" data-numeric style={{ width: 40, textAlign: "right", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{((restRev / total) * 100).toFixed(0)}%</span>
              </div>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
