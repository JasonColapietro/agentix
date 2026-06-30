"use client";

import { useState } from "react";
import type { DailyPoint } from "@/lib/data/types";
import { AreaChart, BarChart } from "@/components/charts";
import { Segmented } from "@/components/ui";
import { compactUsd, num, usd } from "@/lib/format";

type Range = "7" | "30" | "90";
type Metric = "revenue" | "cumulative" | "calls";

export function TrendPanel({ trend }: { trend: DailyPoint[] }) {
  const [range, setRange] = useState<Range>("90");
  const [metric, setMetric] = useState<Metric>("revenue");

  const n = range === "7" ? 7 : range === "30" ? 30 : trend.length;
  const slice = trend.slice(-n);

  let chart: React.ReactNode;
  let headline: string;
  if (metric === "calls") {
    chart = <BarChart points={slice.map((p) => ({ label: p.day, value: p.calls }))} color="var(--registry-cyan)" height={240} ariaLabel="Calls per day" />;
    headline = `${num(slice.reduce((s, p) => s + p.calls, 0))} calls`;
  } else if (metric === "cumulative") {
    let run = 0;
    const pts = slice.map((p) => ({ label: p.day, value: (run += p.revenueUsdc) }));
    chart = <AreaChart points={pts} color="var(--verified-emerald)" height={240} format={compactUsd} ariaLabel="Cumulative revenue" />;
    headline = `${usd(run)} total`;
  } else {
    chart = <AreaChart points={slice.map((p) => ({ label: p.day, value: p.revenueUsdc }))} color="var(--primary)" height={240} format={compactUsd} ariaLabel="Revenue per day" />;
    headline = `${usd(slice.reduce((s, p) => s + p.revenueUsdc, 0))} in range`;
  }

  return (
    <section className="card p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">Performance</p>
          <p className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }} data-numeric>
            {headline}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented value={metric} onChange={setMetric} options={[{ value: "revenue", label: "Revenue" }, { value: "cumulative", label: "Cumulative" }, { value: "calls", label: "Calls" }]} />
          <Segmented value={range} onChange={setRange} options={[{ value: "7", label: "7D" }, { value: "30", label: "30D" }, { value: "90", label: "All" }]} />
        </div>
      </div>
      {chart}
    </section>
  );
}
