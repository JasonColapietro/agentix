"use client";

import { useState } from "react";
import { logEntry } from "@/lib/data/local-store";
import { Modal } from "./Modal";
import { Field, controlStyle, ghostBtn, primaryBtn } from "./fields";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function LogEarningsForm({
  agentId,
  agentName,
  onClose,
  onSaved,
}: {
  agentId: string;
  agentName: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [day, setDay] = useState(todayISO());
  const [calls, setCalls] = useState("");
  const [revenue, setRevenue] = useState("");
  const [errors, setErrors] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const c = Number(calls);
    const r = Number(revenue);
    const er = errors ? Number(errors) : 0;
    if (!Number.isFinite(c) || c < 0) return setError("Calls must be a number ≥ 0.");
    if (!Number.isFinite(r) || r < 0) return setError("Revenue must be a number ≥ 0.");
    if (!Number.isFinite(er) || er < 0) return setError("Errors must be a number ≥ 0.");
    logEntry({ agentId, day, calls: c, revenueUsdc: r, errors: er });
    onSaved();
    onClose();
  }

  return (
    <Modal title={`Log a day · ${agentName}`} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", marginTop: -2 }}>
          Enter a day&apos;s totals. Logging the same day again overwrites it.
        </p>

        <Field label="Day">
          <input style={controlStyle} type="date" value={day} onChange={(e) => setDay(e.target.value)} max={todayISO()} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Paid calls">
            <input style={controlStyle} type="number" inputMode="numeric" min="0" step="1" value={calls} onChange={(e) => setCalls(e.target.value)} placeholder="120" autoFocus />
          </Field>
          <Field label="Revenue (USDC)">
            <input style={controlStyle} type="number" inputMode="decimal" min="0" step="0.01" value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="9.60" />
          </Field>
        </div>

        <Field label="Errors" hint="Optional — failed calls that day.">
          <input style={controlStyle} type="number" inputMode="numeric" min="0" step="1" value={errors} onChange={(e) => setErrors(e.target.value)} placeholder="0" />
        </Field>

        {error ? (
          <p style={{ color: "var(--negative)", fontSize: "var(--text-sm)" }} role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-1 flex justify-end gap-2">
          <button type="button" onClick={onClose} style={ghostBtn}>
            Cancel
          </button>
          <button type="submit" style={primaryBtn}>
            Log day
          </button>
        </div>
      </form>
    </Modal>
  );
}
