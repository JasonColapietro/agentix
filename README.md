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

**MVP built on seed data.** The `/` portfolio dashboard (headline tiles, 90-day revenue trend,
sortable agent table) and `/agent/[id]` detail (earnings curve, call-volume bars, endpoint
health, recent runs) are live and rendering. Every figure currently comes from a deterministic
**seed provider** so the UI is real before the earnings source is wired.

The whole app reads through one seam — `PortfolioProvider` in
[`src/lib/data/provider.ts`](src/lib/data/provider.ts) — so the real source drops in behind the
same interface with **no UI changes**. Source is env-selected via `AGENTIX_DATA_SOURCE`
(`seed` today; `settlement` / `builder-api` / `onchain` stubbed for when open question #1 lands).

> **Open before the real data layer:** the earnings source of truth (SPEC open question #1).
> The builder already computes per-agent `calls`/`earnedUsdc`/`settledUsdc`, but only returns
> the last 25 runs — so the historical earnings curve needs raw `runs` from the shared store.
> See `docs/SPEC.md`.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000 (or: -p 3300)
npm run build      # production build
npm test           # vitest (data layer + formatters)
npm run typecheck  # tsc --noEmit
```
