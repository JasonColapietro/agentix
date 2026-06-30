# Agentix — Agent Portfolio Tracker (build spec / handoff)

> Greenfield. Date: 2026-06-30. Owner: Jason (JasonColapietro). Status: spec → ready to build.
> **This repo is the TRACKER, not the builder.** The builder ("Suede Agent Studio") is a
> separate repo at `~/code/suede-agent-studio` → agents.suedeai.ai. Do not conflate them.

## One-line

**agentix.suedeai.ai** — the portfolio dashboard for the x402 agents you've launched. The
builder is where you *make and launch* pay-per-call agents; **Agentix is where you watch them
earn.** Total USDC earned, calls, per-agent performance, status, and trend — one screen.

## Where it fits in the Suede ecosystem

- **Suede Agent Studio** (`~/code/suede-agent-studio`, agents.suedeai.ai): visual node-graph
  builder. Each launched flow becomes a sellable **x402 pay-per-call endpoint** (USDC on Base).
  It already exposes `/api/catalog`, `/api/me`, a directory, `/grade`, and
  `/rankings/best-ai-agent-builders`. **Those rankings/grade surfaces STAY in the builder** —
  Agentix is the *owner's portfolio view*, not the public directory.
- **Agentix** (this repo, agentix.suedeai.ai): the operator-facing tracker. Reads the agents a
  user owns and surfaces earnings + ops health over time.

## Decided (locked unless Jason overrides)

1. **Greenfield repo at `~/code/agentix`**, deploys to **agentix.suedeai.ai**.
2. **Stack mirrors the Suede house stack** so it feels native and shares the design system:
   Next.js 15 (app router) · React 19 · TypeScript strict · Tailwind v4 over `tokens.css` ·
   `viem` (Base, for on-chain USDC reads) · Supabase (prod) / better-sqlite3 (dev) · vitest.
3. **Suede design system**: Instrument Serif + Geist + Geist Mono; Rights Red / Registry Cyan /
   Verified Emerald; terminal/ledger primitives. Pull the tokens from the builder repo's
   `tokens.css` / design system so the two products are visually a family.
4. **Vercel rule (Jason, global):** `vercel.json` MUST contain
   `"ignoreCommand": "[ \"$VERCEL_ENV\" != \"production\" ] && exit 0 || exit 1"` (already
   scaffolded). Kills preview builds, keeps prod.
5. **Git identity:** personal account **JasonColapietro**. **No** "Generated with Claude" or
   `Co-Authored-By: Claude` lines in commits/PRs.

## Core screens (MVP)

- **`/` Portfolio dashboard** — headline tiles (total USDC earned, total calls, active agents,
  7-day trend), then a sortable list of the owner's agents: name · category · price/call ·
  calls · revenue · last active · status.
- **`/agent/[id]`** — per-agent detail: earnings curve, call volume over time, recent runs,
  endpoint health (up/degraded/down), the x402 listing link.
- **(stretch) `/portfolio/[wallet]`** — a public, read-only shareable portfolio for a payout
  wallet (founder-credibility surface; gate behind a flag).

## Data model (starting point)

```
Agent      { id, name, ownerWallet, x402Url, priceUsdc, category, launchedAt, status }
Earning    { agentId, ts, callId, amountUsdc, settled }   // one row per paid call
DailyRoll  { agentId, day, calls, revenueUsdc, errors }    // pre-aggregated for charts
```

## Open questions — RESOLVE BEFORE BUILDING DATA LAYER (ask Jason)

1. **Earnings source of truth?** Three options, pick one:
   (a) on-chain reads of each agent's payout address on Base via `viem` (trustless, but noisy —
   needs to attribute transfers to agents); (b) the **builder's settlement DB** (cleanest — the
   builder already records paid calls; expose a read API or share the store); (c) an x402
   facilitator API. **Recommend (b)** — coordinate with `~/code/suede-agent-studio`'s settlement
   tables (`tests/api-settlement.test.ts`, `src/lib/gateway`, `src/lib/rails`).
2. **Auth / identity** — same auth as the builder (so a logged-in user sees *their* agents), a
   connected wallet, or public-by-wallet? Determines `/api/me`-style scoping.
3. **Does Agentix call the builder's API** (`agents.suedeai.ai/api/catalog`, `/api/me`) or own
   its data? Prefer reading the builder's API for the agent list, own only the time-series.
4. **Relationship to the builder's `/rankings` + `/grade`** — Agentix should *link to* them, not
   re-implement. Confirm no duplication.

## First tasks (suggested order)

1. Scaffold Next.js 15 app (app router, TS strict, Tailwind v4), port the Suede `tokens.css` +
   fonts; add `vercel.json` (done) and a `clockin`/`clockout`-friendly layout.
2. Resolve open question #1 with Jason; stub the data layer behind a typed interface so charts
   render on seed data first.
3. Build `/` dashboard against the stub; then wire the real earnings source.
4. `gh repo create JasonColapietro/agentix` (personal account) when ready; deploy to Vercel,
   alias `agentix.suedeai.ai`.

## Reference (read these in the builder repo first)

- `~/code/suede-agent-studio/docs/superpowers/plans/2026-06-11-three-setting-platform.md` — the
  ecosystem master plan + stack rationale.
- `~/code/suede-agent-studio/src/lib/gateway`, `src/lib/rails`, `tests/api-settlement.test.ts` —
  how paid calls are metered/settled (the likely earnings source).
- `~/code/suede-agent-studio/src/app/rankings`, `src/app/grade` — the public surfaces to link to,
  not duplicate.
