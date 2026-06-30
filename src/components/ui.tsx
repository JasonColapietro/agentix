/**
 * Small presentational primitives shared across the portfolio + detail screens.
 * All purely visual, all server-renderable.
 */
import type { AgentStatus } from "@/lib/data/types";
import { categoryColor } from "@/lib/category";
import { signedPct } from "@/lib/format";

const STATUS_META: Record<AgentStatus, { label: string; color: string }> = {
  live: { label: "Live", color: "var(--status-live)" },
  degraded: { label: "Degraded", color: "var(--status-degraded)" },
  down: { label: "Down", color: "var(--status-down)" },
  draft: { label: "Draft", color: "var(--status-draft)" },
  paused: { label: "Paused", color: "var(--status-draft)" },
};

export function StatusBadge({ status, size = "sm" }: { status: AgentStatus; size?: "sm" | "md" }) {
  const meta = STATUS_META[status];
  const dot = size === "md" ? 8 : 6;
  return (
    <span
      className="mono inline-flex items-center gap-1.5 whitespace-nowrap"
      style={{ fontSize: size === "md" ? "var(--text-xs)" : "var(--text-label)", color: "var(--text-muted)" }}
    >
      <span
        aria-hidden="true"
        style={{
          width: dot,
          height: dot,
          borderRadius: 999,
          background: meta.color,
          boxShadow: status === "live" ? `0 0 0 3px color-mix(in srgb, ${meta.color} 18%, transparent)` : undefined,
          display: "inline-block",
        }}
      />
      {meta.label}
    </span>
  );
}

export function CategoryTag({ category }: { category: string }) {
  const color = categoryColor(category);
  return (
    <span className="inline-flex items-center gap-1.5" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
      <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: 2, background: color, display: "inline-block" }} />
      {category}
    </span>
  );
}

export function DeltaPill({ fraction, className = "" }: { fraction: number; className?: string }) {
  const isNew = !Number.isFinite(fraction);
  const up = fraction > 0;
  const flat = fraction === 0;
  const color = isNew ? "var(--registry-cyan)" : up ? "var(--positive)" : flat ? "var(--text-muted)" : "var(--negative)";
  const glyph = isNew ? "✦" : up ? "▲" : flat ? "→" : "▼";
  const text = isNew ? "new" : signedPct(fraction);
  return (
    <span
      className={`mono inline-flex items-center gap-1 ${className}`}
      style={{
        fontSize: "var(--text-xs)",
        color,
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
        padding: "2px 7px",
        borderRadius: 999,
        lineHeight: 1.2,
      }}
      data-numeric
    >
      <span aria-hidden="true" style={{ fontSize: 9 }}>{glyph}</span>
      {text}
    </span>
  );
}

/** Section label in the mono eyebrow style. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function ProgressBar({ value, max, color = "var(--primary)", height = 8 }: { value: number; max: number; color?: string; height?: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const reached = max > 0 && value >= max;
  return (
    <div style={{ height, borderRadius: 999, background: "var(--canvas-bg)", overflow: "hidden", border: "1px solid var(--hairline)" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: reached ? "var(--verified-emerald)" : color, borderRadius: 999, transition: "width .45s ease" }} />
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex" style={{ border: "1px solid var(--hairline)", borderRadius: 999, padding: 2, background: "var(--ink-control)" }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="mono"
            aria-pressed={active}
            style={{
              border: "none",
              cursor: "pointer",
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: "var(--text-xs)",
              fontWeight: active ? 600 : 450,
              color: active ? "var(--on-primary)" : "var(--text-muted)",
              background: active ? "var(--primary)" : "transparent",
              transition: "color .15s, background .15s",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
