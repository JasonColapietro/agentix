"use client";

import type { CSSProperties, ReactNode } from "react";

export const controlStyle: CSSProperties = {
  width: "100%",
  height: "var(--control-h)",
  padding: "0 12px",
  border: "1px solid var(--hairline)",
  borderRadius: "var(--radius-sm)",
  background: "var(--ink-control)",
  color: "var(--text-primary)",
  fontSize: "var(--text-base)",
  fontFamily: "var(--font-ui)",
};

export const primaryBtn: CSSProperties = {
  height: "var(--control-h)",
  padding: "0 18px",
  border: "none",
  borderRadius: "var(--radius-sm)",
  background: "var(--primary)",
  color: "var(--on-primary)",
  fontSize: "var(--text-sm)",
  fontWeight: 500,
  cursor: "pointer",
};

export const ghostBtn: CSSProperties = {
  height: "var(--control-h)",
  padding: "0 16px",
  border: "1px solid var(--hairline)",
  borderRadius: "var(--radius-sm)",
  background: "var(--ink-control)",
  color: "var(--text-primary)",
  fontSize: "var(--text-sm)",
  cursor: "pointer",
};

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="eyebrow">{label}</span>
      {children}
      {hint ? (
        <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>{hint}</span>
      ) : null}
    </label>
  );
}
