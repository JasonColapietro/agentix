"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AgentWithStats } from "@/lib/data/types";
import { num, timeAgo, usd, usdPrecise } from "@/lib/format";
import { Sparkline } from "@/components/charts";
import { CategoryTag, DeltaPill, StatusBadge } from "@/components/ui";
import { categoryColor } from "@/lib/category";

type SortKey = "name" | "category" | "price" | "calls" | "revenue" | "lastActive" | "status";
type Dir = "asc" | "desc";

const STATUS_ORDER: Record<string, number> = { live: 0, degraded: 1, down: 2, paused: 3, draft: 4 };

function value(a: AgentWithStats, key: SortKey): number | string {
  switch (key) {
    case "name":
      return a.name.toLowerCase();
    case "category":
      return a.category.toLowerCase();
    case "price":
      return a.priceUsdc;
    case "calls":
      return a.stats.calls;
    case "revenue":
      return a.stats.revenueUsdc;
    case "lastActive":
      return a.stats.lastActiveAt ? new Date(a.stats.lastActiveAt).getTime() : -Infinity;
    case "status":
      return STATUS_ORDER[a.status] ?? 99;
  }
}

const NUMERIC: Record<SortKey, boolean> = {
  name: false,
  category: false,
  price: true,
  calls: true,
  revenue: true,
  lastActive: true,
  status: true,
};

export function AgentTable({ agents, nowISO }: { agents: AgentWithStats[]; nowISO: string }) {
  const [sort, setSort] = useState<SortKey>("revenue");
  const [dir, setDir] = useState<Dir>("desc");
  const now = useMemo(() => new Date(nowISO), [nowISO]);

  const rows = useMemo(() => {
    const sorted = [...agents].sort((a, b) => {
      const av = value(a, sort);
      const bv = value(b, sort);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return dir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [agents, sort, dir]);

  function toggle(key: SortKey) {
    if (key === sort) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setDir(NUMERIC[key] ? "desc" : "asc");
    }
  }

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-4" style={{ borderColor: "var(--hairline)" }}>
        <p className="eyebrow">Agents · {agents.length}</p>
        <p className="mono" style={{ fontSize: "var(--text-label)", color: "var(--text-muted)" }}>
          sorted by {LABELS[sort].toLowerCase()} {dir === "desc" ? "↓" : "↑"}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 720 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--hairline)" }}>
              <Th label="Agent" k="name" sort={sort} dir={dir} onSort={toggle} />
              <Th label="Category" k="category" sort={sort} dir={dir} onSort={toggle} className="hidden md:table-cell" />
              <Th label="Price" k="price" sort={sort} dir={dir} onSort={toggle} align="right" />
              <Th label="Calls" k="calls" sort={sort} dir={dir} onSort={toggle} align="right" />
              <Th label="Revenue" k="revenue" sort={sort} dir={dir} onSort={toggle} align="right" />
              <th className="hidden px-3 py-2.5 text-left lg:table-cell">
                <span className="eyebrow">7d</span>
              </th>
              <Th label="Last call" k="lastActive" sort={sort} dir={dir} onSort={toggle} align="right" />
              <Th label="Status" k="status" sort={sort} dir={dir} onSort={toggle} align="right" />
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr
                key={a.id}
                className="group transition-colors"
                style={{ borderBottom: "1px solid var(--hairline)" }}
              >
                <td className="px-5 py-3">
                  <Link
                    href={`/agent/${a.id}`}
                    className="no-underline"
                    style={{ fontWeight: 500 }}
                  >
                    <span className="group-hover:underline" style={{ textDecorationColor: "var(--hairline)" }}>
                      {a.name}
                    </span>
                  </Link>
                  <span className="mt-0.5 block md:hidden">
                    <CategoryTag category={a.category} />
                  </span>
                </td>
                <td className="hidden px-3 py-3 md:table-cell">
                  <CategoryTag category={a.category} />
                </td>
                <td className="px-3 py-3 text-right tabular" data-numeric style={{ color: "var(--text-muted)" }}>
                  {usdPrecise(a.priceUsdc)}
                </td>
                <td className="px-3 py-3 text-right tabular" data-numeric>
                  {num(a.stats.calls)}
                </td>
                <td className="px-3 py-3 text-right tabular" data-numeric style={{ fontWeight: 500 }}>
                  {usd(a.stats.revenueUsdc)}
                </td>
                <td className="hidden px-3 py-3 lg:table-cell">
                  <Sparkline values={a.stats.spark} color={categoryColor(a.category)} width={84} height={26} />
                </td>
                <td className="px-3 py-3 text-right tabular" data-numeric style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
                  {timeAgo(a.stats.lastActiveAt, now)}
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="inline-flex justify-end">
                    <StatusBadge status={a.status} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const LABELS: Record<SortKey, string> = {
  name: "Agent",
  category: "Category",
  price: "Price",
  calls: "Calls",
  revenue: "Revenue",
  lastActive: "Last call",
  status: "Status",
};

function Th({
  label,
  k,
  sort,
  dir,
  onSort,
  align = "left",
  className = "",
}: {
  label: string;
  k: SortKey;
  sort: SortKey;
  dir: Dir;
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
  className?: string;
}) {
  const active = sort === k;
  return (
    <th className={`px-3 py-2.5 ${align === "right" ? "text-right" : "text-left"} ${className}`} style={{ whiteSpace: "nowrap" }} aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => onSort(k)}
        className="eyebrow inline-flex items-center gap-1"
        style={{ background: "none", border: "none", cursor: "pointer", color: active ? "var(--text-primary)" : "var(--text-muted)", padding: 0 }}
      >
        {align === "right" && active ? <Caret dir={dir} /> : null}
        {label}
        {align === "left" && active ? <Caret dir={dir} /> : null}
      </button>
    </th>
  );
}

function Caret({ dir }: { dir: Dir }) {
  return <span aria-hidden="true" style={{ fontSize: 8 }}>{dir === "asc" ? "▲" : "▼"}</span>;
}
