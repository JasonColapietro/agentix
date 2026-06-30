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

**Manual-input tracker that grades your agents (single operator).** You register the agents you
want to track and log their earnings by hand; Agentix organizes, visualizes, and **grades** them.
Everything renders from **your entries**, persisted in `localStorage`. Until you add anything, a
large non-music **example portfolio** stands in as a populated demo.

- **Grading** — every agent earns an S–F grade from revenue, growth, consistency, reliability, and
  activity ([`src/lib/data/grade.ts`](src/lib/data/grade.ts)); the portfolio gets a revenue-weighted
  grade, and the leaderboard ranks them.
- **Inline everything (no modals)** — add / edit / delete agents and log a day directly on the page.
- **Richer analytics** — Performance panel with Revenue / Cumulative / Calls × 7D / 30D / All
  toggles, a revenue **allocation** breakdown, and per-agent grade breakdowns.
- **Search, filter, sort** the leaderboard; **goals** — set a revenue target per agent and for the
  whole portfolio, with progress bars.
- One read-model seam ([`src/lib/data/aggregate.ts`](src/lib/data/aggregate.ts)) feeds from either
  the example seed or the [`local-store`](src/lib/data/local-store.ts). A hosted DB (Supabase /
  Vercel Postgres) drops in behind the same surface for cross-device + multi-user without UI changes.

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
