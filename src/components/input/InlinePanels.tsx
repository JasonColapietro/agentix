"use client";

/** In-page inline forms — no modal overlays. Used by the board + detail. */
import { useState } from "react";
import type { Agent, AgentStatus } from "@/lib/data/types";
import { addAgent, logEntry, setTarget, updateAgent, type AgentInput } from "@/lib/data/local-store";
import { CATEGORY_OPTIONS } from "@/lib/category";
import { Field, controlStyle, ghostBtn, primaryBtn } from "./fields";

const STATUSES: AgentStatus[] = ["live", "degraded", "down", "paused", "draft"];
const today = () => new Date().toISOString().slice(0, 10);

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5" style={{ borderColor: "var(--hairline-cyan)" }}>
      <p className="eyebrow mb-4">{title}</p>
      {children}
    </div>
  );
}

export function InlineAgentForm({ initial, onClose, onSaved }: { initial?: Agent; onClose: () => void; onSaved: (a: Agent) => void }) {
  const editing = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [price, setPrice] = useState(initial ? String(initial.priceUsdc) : "");
  const [status, setStatus] = useState<AgentStatus>(initial?.status ?? "live");
  const [x402Url, setX402Url] = useState(initial?.x402Url ?? "");
  const [wallet, setWallet] = useState(initial?.ownerWallet ?? "");
  const [launchedAt, setLaunchedAt] = useState(initial ? initial.launchedAt.slice(0, 10) : today());
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Give the agent a name.");
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0) return setError("Price/call must be a number ≥ 0.");
    const input: AgentInput = { name, category, priceUsdc: priceNum, status, x402Url, ownerWallet: wallet, launchedAt };
    const agent = editing && initial ? (updateAgent(initial.id, input), { ...initial, ...input, priceUsdc: priceNum }) : addAgent(input);
    onSaved(agent as Agent);
    onClose();
  }

  return (
    <Panel title={editing ? "Edit agent" : "Add an agent"}>
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Name">
          <input style={controlStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Web Scraper Pro" autoFocus />
        </Field>
        <Field label="Category">
          <input style={controlStyle} list="agentix-cats" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Scraping" />
          <datalist id="agentix-cats">
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Price / call (USDC)">
          <input style={controlStyle} type="number" inputMode="decimal" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.10" />
        </Field>
        <Field label="Status">
          <select style={controlStyle} value={status} onChange={(e) => setStatus(e.target.value as AgentStatus)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </Field>
        <Field label="Launched">
          <input style={controlStyle} type="date" value={launchedAt} onChange={(e) => setLaunchedAt(e.target.value)} max={today()} />
        </Field>
        <Field label="x402 URL (optional)">
          <input style={controlStyle} type="url" value={x402Url} onChange={(e) => setX402Url(e.target.value)} placeholder="https://…/run" />
        </Field>
        <Field label="Payout wallet (optional)">
          <input style={{ ...controlStyle, fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }} value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="0x…" />
        </Field>

        <div className="col-span-full mt-1 flex items-center justify-between gap-3">
          {error ? <p style={{ color: "var(--rights-red)", fontSize: "var(--text-sm)" }} role="alert">{error}</p> : <span />}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} style={ghostBtn}>Cancel</button>
            <button type="submit" style={primaryBtn}>{editing ? "Save changes" : "Add agent"}</button>
          </div>
        </div>
      </form>
    </Panel>
  );
}

export function InlineLogForm({ agentId, agentName, onClose, onSaved }: { agentId: string; agentName: string; onClose: () => void; onSaved: () => void }) {
  const [day, setDay] = useState(today());
  const [calls, setCalls] = useState("");
  const [revenue, setRevenue] = useState("");
  const [errors, setErrors] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const c = Number(calls);
    const r = Number(revenue);
    const er = errors ? Number(errors) : 0;
    if (!Number.isFinite(c) || c < 0 || !Number.isFinite(r) || r < 0 || !Number.isFinite(er) || er < 0) return setError("Enter valid numbers (≥ 0).");
    logEntry({ agentId, day, calls: c, revenueUsdc: r, errors: er });
    onSaved();
    onClose();
  }

  return (
    <Panel title={`Log a day · ${agentName}`}>
      <form onSubmit={submit} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Day">
          <input style={controlStyle} type="date" value={day} onChange={(e) => setDay(e.target.value)} max={today()} />
        </Field>
        <Field label="Calls">
          <input style={controlStyle} type="number" min="0" step="1" value={calls} onChange={(e) => setCalls(e.target.value)} placeholder="120" autoFocus />
        </Field>
        <Field label="Revenue (USDC)">
          <input style={controlStyle} type="number" min="0" step="0.01" value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="9.60" />
        </Field>
        <Field label="Errors">
          <input style={controlStyle} type="number" min="0" step="1" value={errors} onChange={(e) => setErrors(e.target.value)} placeholder="0" />
        </Field>
        <div className="col-span-full flex items-center justify-between gap-3">
          {error ? <p style={{ color: "var(--rights-red)", fontSize: "var(--text-sm)" }} role="alert">{error}</p> : <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>Logging the same day overwrites it.</span>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} style={ghostBtn}>Cancel</button>
            <button type="submit" style={primaryBtn}>Save day</button>
          </div>
        </div>
      </form>
    </Panel>
  );
}

export function GoalEditor({ id, label, onSaved }: { id: string; label: string; onSaved: () => void }) {
  const [amount, setAmount] = useState("");
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (Number.isFinite(n) && n >= 0) {
      setTarget(id, n);
      onSaved();
    }
  }
  return (
    <form onSubmit={submit} className="flex items-end gap-2">
      <Field label={label}>
        <input style={{ ...controlStyle, width: 140 }} type="number" min="0" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000" autoFocus />
      </Field>
      <button type="submit" style={{ ...primaryBtn, height: "var(--control-h)" }}>Set</button>
    </form>
  );
}
