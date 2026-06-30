/**
 * Formatting helpers for the ledger. All money is USDC. Figures rendered with
 * these are meant to sit in `.tabular` / `[data-numeric]` contexts so columns
 * line up (tabular-nums is set in tokens.css).
 */

const USD_FULL = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const USD_PRECISE = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

const NUM = new Intl.NumberFormat("en-US");

/** $1,234.56 — the default money render. */
export function usd(n: number): string {
  return USD_FULL.format(n);
}

/** $0.2500 — for sub-cent per-call prices where precision matters. */
export function usdPrecise(n: number): string {
  return USD_PRECISE.format(n);
}

/** $1.2k / $3.4M — compact money for headline tiles and axes. */
export function compactUsd(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${trim(n / 1_000_000)}M`;
  if (abs >= 1_000) return `$${trim(n / 1_000)}k`;
  return usd(n);
}

/** 1,234 — call counts and other integers. */
export function num(n: number): string {
  return NUM.format(n);
}

/** 12.3k — compact integer for axes/tiles. */
export function compactNum(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${trim(n / 1_000_000)}M`;
  if (abs >= 1_000) return `${trim(n / 1_000)}k`;
  return num(n);
}

/** +12.3% / −4.0% — signed percentage with a true minus glyph. */
export function signedPct(fraction: number): string {
  if (!Number.isFinite(fraction)) return "—";
  const pct = fraction * 100;
  const sign = pct > 0 ? "+" : pct < 0 ? "−" : "";
  return `${sign}${Math.abs(pct).toFixed(1)}%`;
}

/** 0xA9e4…3F21 — truncated EVM address. */
export function shortAddr(addr: string): string {
  if (!addr.startsWith("0x") || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Relative "time ago" against a reference now (defaults to real now). */
export function timeAgo(iso: string | null, now: Date = new Date()): string {
  if (!iso) return "never";
  const then = new Date(iso).getTime();
  const diffSec = Math.round((now.getTime() - then) / 1000);
  if (diffSec < 45) return "just now";
  const mins = Math.round(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}

/** "Jun 30" — short day label for axes and run rows. */
export function shortDay(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function trim(n: number): string {
  // One decimal, but drop a trailing .0 (1.0k -> 1k).
  return n.toFixed(1).replace(/\.0$/, "");
}
