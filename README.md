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

Scaffold only. See `docs/SPEC.md` for the MVP screens, data model, and the open questions to
resolve with Jason before building the earnings data layer.
