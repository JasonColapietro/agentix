# Agentix

**The portfolio tracker for the x402 agents you've launched.** → agentix.suedeai.ai

Suede Agent Studio (agents.suedeai.ai) is where you *build and launch* pay-per-call agents.
**Agentix is where you watch them earn** — total USDC, calls, per-agent performance, status, and
trend on one screen.

> Greenfield, in development. Build spec + handoff: [`docs/SPEC.md`](docs/SPEC.md).
> This is the **tracker**, a separate product from the builder repo `suede-agent-studio`.

## Stack

Next.js 15 · React 19 · TypeScript (strict) · Tailwind v4 over `tokens.css` · viem (Base) ·
Supabase / better-sqlite3 · vitest. Shares the Suede design system with the rest of the ecosystem.

## Status

**Manual-input tracker (single operator).** You register the agents you want to track and log
their earnings by hand — Agentix organizes and visualizes it. The `/` dashboard (headline tiles,
90-day revenue trend, sortable agent table) and `/agent/[id]` detail (earnings curve, call-volume
bars, endpoint health, logged-days ledger) render from **your entries**, persisted in
`localStorage`. Until you add anything, a large non-music **example portfolio** stands in as a
populated demo.

- **Add / edit / delete agents** (name, category, price, status, x402 URL, payout wallet).
- **Log a day** per agent (date · calls · revenue · errors) — builds the trend.
- Everything reads through one seam — the read-models in
  [`src/lib/data/aggregate.ts`](src/lib/data/aggregate.ts), fed by either the example seed or the
  [`local-store`](src/lib/data/local-store.ts). A hosted DB (Supabase / Vercel Postgres) drops in
  behind the same surface for cross-device + multi-user without UI changes.

> Optional future enrichment (not the primary source): import earnings from the builder's
> settlement `runs`, or read payout wallets on-chain via `viem`. See [`docs/SPEC.md`](docs/SPEC.md).

## Develop

```bash
npm install
npm run dev        # http://localhost:3000 (or: -p 3300)
npm run build      # production build
npm test           # vitest (data layer + formatters)
npm run typecheck  # tsc --noEmit
```
