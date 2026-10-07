"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import type { AgentStatus, AgentWithStats } from "@/lib/data/types";
import { num, timeAgo, usd } from "@/lib/format";
import { Sparkline } from "@/components/charts";
import { CategoryTag, ProgressBar, StatusBadge } from "@/components/ui";
import { GradeBadge } from "@/components/grade-ui";
import { categoryColor } from "@/lib/category";
import { removeAgent } from "@/lib/data/local-store";
import { InlineAgentForm, InlineLogForm } from "@/components/input/InlinePanels";
import { buyerLabel, directorySignal, useCaseLabel } from "@/lib/directory";

type SortKey = "directory" | "grade" | "revenue" | "calls" | "price" | "name" | "lastActive";
type FilterKey = "all" | "listed" | "earning" | "attention" | AgentStatus;

const SORTS: { key: SortKey; label: string }[] = [
  { key: "directory", label: "Directory score" },
  { key: "grade", label: "Grade" },
  { key: "revenue", label: "Revenue" },
  { key: "calls", label: "Calls" },
  { key: "price", label: "Price" },
  { key: "name", label: "Name" },
  { key: "lastActive", label: "Last call" },
];

const FILTERS: FilterKey[] = ["all", "listed", "earning", "attention", "live", "degraded", "down", "paused", "draft"];

function sortValue(a: AgentWithStats, key: SortKey): number | string {
  switch (key) {
    case "directory": return directorySignal(a).score;
    case "grade": return a.grade?.score ?? -1;
    case "revenue": return a.stats.revenueUsdc;
    case "calls": return a.stats.calls;
    case "price": return a.priceUsdc;
    case "name": return a.name.toLowerCase();
    case "lastActive": return a.stats.lastActiveAt ? new Date(a.stats.lastActiveAt).getTime() : -Infinity;
  }
}

export function AgentBoard({
  agents,
  targets,
  nowISO,
  editable,
  onChange,
}: {
  agents: AgentWithStats[];
  targets: Record<string, number>;
  nowISO: string;
  editable: boolean;
  onChange: () => void;
}) {
  const now = useMemo(() => new Date(nowISO), [nowISO]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("directory");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = agents.filter((a) => {
      const signal = directorySignal(a);
      if (filter === "listed" && !a.x402Url) return false;
      if (filter === "earning" && a.stats.revenueUsdc <= 0) return false;
      if (filter === "attention" && a.status === "live" && signal.reliabilityPct >= 96 && signal.score >= 58) return false;
      if (!["all", "listed", "earning", "attention"].includes(filter) && a.status !== filter) return false;
      const searchable = `${a.name} ${a.category} ${buyerLabel(a)} ${useCaseLabel(a)} ${a.directoryNote ?? ""}`.toLowerCase();
      if (q && !searchable.includes(q)) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      const av = sortValue(a, sort);
      const bv = sortValue(b, sort);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort === "name" ? cmp : -cmp;
    });
  }, [agents, query, filter, sort]);

  function closeAll() {
    setEditingId(null);
    setLoggingId(null);
    setAdding(false);
  }

  return (
    <section className="flex flex-col gap-4">
      {/* controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h2 className="display" style={{ fontSize: "var(--text-h3)" }}>Agent directory</h2>
          <span className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }} data-numeric>{agents.length} agents</span>
        </div>
        <button
          type="button"
          onClick={() => { closeAll(); setAdding((v) => !v); }}
          className="mono"
          style={{ height: 38, padding: "0 14px", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", background: "var(--primary)", color: "var(--on-primary)", fontSize: "var(--text-xs)", fontWeight: 500 }}
        >
          + Add agent
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search agents, buyers, use cases..."
          style={{ height: 36, padding: "0 12px", borderRadius: 999, border: "1px solid var(--hairline)", background: "var(--ink-control)", fontSize: "var(--text-sm)", minWidth: 180, fontFamily: "var(--font-ui)" }}
        />
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((s) => {
            const active = filter === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className="mono"
                style={{ padding: "5px 11px", borderRadius: 999, cursor: "pointer", fontSize: "var(--text-label)", textTransform: "capitalize", border: `1px solid ${active ? "transparent" : "var(--hairline)"}`, background: active ? "var(--text-primary)" : "transparent", color: active ? "var(--ink-deep)" : "var(--text-muted)" }}
              >
                {s === "listed" ? "listed" : s === "earning" ? "earning" : s === "attention" ? "attention" : s}
              </button>
            );
          })}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="mono" style={{ height: 36, padding: "0 10px", borderRadius: 999, border: "1px solid var(--hairline)", background: "var(--ink-control)", fontSize: "var(--text-xs)", color: "var(--text-muted)", cursor: "pointer", marginLeft: "auto" }}>
          {SORTS.map((s) => <option key={s.key} value={s.key}>Sort: {s.label}</option>)}
        </select>
      </div>

      {adding ? (
        <InlineAgentForm onClose={() => setAdding(false)} onSaved={onChange} />
      ) : null}

      {/* board */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 980 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hairline)" }}>
                <Th>#</Th>
                <Th>Score</Th>
                <Th>Grade</Th>
                <Th left>Agent</Th>
                <Th left className="hidden xl:table-cell">Buyer</Th>
                <Th right>Calls</Th>
                <Th right>Revenue</Th>
                <Th left className="hidden lg:table-cell">Goal</Th>
                <Th left className="hidden md:table-cell">7d</Th>
                <Th right className="hidden sm:table-cell">Last call</Th>
                <Th right>Status</Th>
                {editable ? <Th right>·</Th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={editable ? 12 : 11} className="px-5 py-10 text-center" style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No agents match.</td></tr>
              ) : rows.map((a, i) => {
                const target = targets[a.id];
                const isEditing = editingId === a.id;
                const isLogging = loggingId === a.id;
                const signal = directorySignal(a);
                return (
                  <Fragment key={a.id}>
                    <tr style={{ borderBottom: isEditing || isLogging ? "none" : "1px solid var(--hairline)" }} className="group">
                      <td className="px-4 py-3 text-center tabular" data-numeric style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", width: 36 }}>{i + 1}</td>
                      <td className="px-2 py-3 text-center">
                        <span className="tabular" data-numeric title={signal.reason} style={{ fontSize: "var(--text-sm)", fontWeight: 650, color: signal.score >= 72 ? "var(--primary)" : "var(--text-muted)" }}>{signal.score}</span>
                        <span className="block" style={{ color: "var(--text-muted)", fontSize: "var(--text-label)" }}>{signal.label}</span>
                      </td>
                      <td className="px-2 py-3 text-center">{a.grade ? <GradeBadge grade={a.grade} size="sm" /> : null}</td>
                      <td className="px-3 py-3">
                        <Link href={`/agent/${a.id}`} className="no-underline" style={{ fontWeight: 500 }}>
                          <span className="group-hover:underline">{a.name}</span>
                        </Link>
                        <span className="mt-1 block" style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>{useCaseLabel(a)}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-2">
                          <CategoryTag category={a.category} />
                          {a.x402Url ? (
                            <a href={a.x402Url} target="_blank" rel="noreferrer" className="mono no-underline" style={{ color: "var(--primary)", fontSize: "var(--text-label)" }}>Listing ↗</a>
                          ) : null}
                        </span>
                      </td>
                      <td className="hidden px-3 py-3 xl:table-cell" style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", maxWidth: 170 }}>{buyerLabel(a)}</td>
                      <td className="px-3 py-3 text-right tabular" data-numeric>{num(a.stats.calls)}</td>
                      <td className="px-3 py-3 text-right tabular" data-numeric style={{ fontWeight: 500 }}>{usd(a.stats.revenueUsdc)}</td>
                      <td className="hidden px-3 py-3 lg:table-cell" style={{ minWidth: 110 }}>
                        {target ? (
                          <div className="flex flex-col gap-1">
                            <ProgressBar value={a.stats.revenueUsdc} max={target} color={categoryColor(a.category)} height={5} />
                            <span className="tabular" data-numeric style={{ fontSize: "var(--text-label)", color: "var(--text-muted)" }}>{Math.min(100, Math.round((a.stats.revenueUsdc / target) * 100))}% of {usd(target)}</span>
                          </div>
                        ) : (
                          <span style={{ color: "var(--hairline)", fontSize: "var(--text-xs)" }}>—</span>
                        )}
                      </td>
                      <td className="hidden px-3 py-3 md:table-cell"><Sparkline values={a.stats.spark} color={categoryColor(a.category)} width={80} height={24} /></td>
                      <td className="hidden px-3 py-3 text-right tabular sm:table-cell" data-numeric style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{timeAgo(a.stats.lastActiveAt, now)}</td>
                      <td className="px-3 py-3 text-right"><span className="inline-flex justify-end"><StatusBadge status={a.status} /></span></td>
                      {editable ? (
                        <td className="px-3 py-3 text-right" style={{ whiteSpace: "nowrap" }}>
                          <RowAction label="log" onClick={() => { setEditingId(null); setLoggingId(isLogging ? null : a.id); }} active={isLogging} />
                          <RowAction label="edit" onClick={() => { setLoggingId(null); setEditingId(isEditing ? null : a.id); }} active={isEditing} />
                          <RowAction label="✕" title="Remove" onClick={() => { if (window.confirm(`Remove ${a.name}?`)) { removeAgent(a.id); onChange(); } }} />
                        </td>
                      ) : null}
                    </tr>
                    {isEditing ? (
                      <tr key={`${a.id}-edit`}><td colSpan={12} className="px-3 pb-4" style={{ borderBottom: "1px solid var(--hairline)" }}><InlineAgentForm initial={a} onClose={() => setEditingId(null)} onSaved={onChange} /></td></tr>
                    ) : null}
                    {isLogging ? (
                      <tr key={`${a.id}-log`}><td colSpan={12} className="px-3 pb-4" style={{ borderBottom: "1px solid var(--hairline)" }}><InlineLogForm agentId={a.id} agentName={a.name} onClose={() => setLoggingId(null)} onSaved={onChange} /></td></tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Th({ children, left, right, className = "" }: { children: React.ReactNode; left?: boolean; right?: boolean; className?: string }) {
  return (
    <th className={`px-3 py-2.5 ${left ? "text-left" : right ? "text-right" : "text-center"} ${className}`} style={{ whiteSpace: "nowrap" }}>
      <span className="eyebrow">{children}</span>
    </th>
  );
}

function RowAction({ label, onClick, active, title }: { label: string; onClick: () => void; active?: boolean; title?: string }) {
  return (
    <button type="button" onClick={onClick} title={title} className="mono" style={{ background: "none", border: "none", cursor: "pointer", color: active ? "var(--primary)" : "var(--text-muted)", fontSize: "var(--text-xs)", padding: "2px 6px" }}>
      {label}
    </button>
  );
}
