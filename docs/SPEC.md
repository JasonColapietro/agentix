# Agentix — Agent Directory And Portfolio Tracker (build spec / handoff)

> Greenfield. Date: 2026-06-30. Owner: Jason (JasonColapietro). Status: spec → ready to build.
> **This repo is the TRACKER, not the builder.** The builder ("Suede Agent Studio") is a
> separate repo at `~/code/suede-agent-studio` → agents.suedeai.ai. Do not conflate them.

## One-line

**agentix.suedeai.ai** — the directory and portfolio dashboard for the x402 agents you've
launched. The builder is where you *make and launch* pay-per-call agents; **Agentix is where
you catalog, compare, and watch them earn.** Buyer fit, use case, total USDC earned, calls,
per-agent performance, status, and trend — one screen.

## Where it fits in the Suede ecosystem

- **Suede Agent Studio** (`~/code/suede-agent-studio`, agents.suedeai.ai): visual node-graph
  builder. Each launched flow becomes a sellable **x402 pay-per-call endpoint** (USDC on Base).
  It already exposes `/api/catalog`, `/api/me`, a directory, `/grade`, and
  `/rankings/best-ai-agent-builders`. **Those rankings/grade surfaces STAY in the builder** —
  Agentix is the *owner's portfolio view*, not the public directory.
- **Agentix** (this repo, agentix.suedeai.ai): the operator-facing directory and tracker. Reads
  the agents a user owns, adds buyer/use-case positioning, and surfaces earnings + ops health
  over time. It can rank the operator's tracked agents, but it must not become the Studio
  builder or duplicate Studio's public launch flows.

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
Agent      { id, name, ownerWallet, x402Url, priceUsdc, category, buyer, useCase, directoryNote, launchedAt, status }
Earning    { agentId, ts, callId, amountUsdc, settled }   // one row per paid call
DailyRoll  { agentId, day, calls, revenueUsdc, errors }    // pre-aggregated for charts
```

## Open questions — RESOLVED 2026-06-30 (see "Build state" at the bottom)

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

## Build state + resolved decisions (2026-06-30)

MVP is built on a **deterministic seed provider** behind the typed
`PortfolioProvider` seam (`src/lib/data/provider.ts`) — swap the implementation,
not the UI. 20 vitest tests pass; production build clean; deployed (below).

**Resolved with Jason:**

1. **Earnings source of truth → builder settlement DB.** Read the builder's shared
   store (`studio.db` dev / Supabase prod) `runs` table directly; Agentix owns the
   daily time-series. `/api/me` only returns the last 25 runs, so the earnings
   curve needs raw `runs`. Wire as `AGENTIX_DATA_SOURCE=settlement`.
   - Map: `runs(agent_id, trigger='agent', settled_at, total_cost_usdc, started_at)` →
     calls/curve; `agents(id, flow_id, slug, price_usdc, settlement_live)`; name ←
     `flows.name`; payout ← `wallets.address` via `flows.owner_id`.
     Creator share = settled × price × (1 − 0.05 platform take).
2. **Auth → share the builder's session.** Reuse the `agx_owner` cookie / owner-id
   so a logged-in user sees *their* agents; resolve in `getCurrentOwner()`.
3. **Own data vs builder API → own the time-series**, link to the builder's public
   surfaces (rankings/grade — footer already links them), don't re-implement.

**Deployed (seed demo):**

- GitHub: <https://github.com/JasonColapietro/agentix> (public, `main`).
- Vercel: project **`agentix-tracker`** → <https://agentix-tracker.vercel.app>.

**Name + domain conflict — RESOLVED 2026-06-30 (Jason: "push to agentix site"):**

- **`agentix.suedeai.ai` now points to the tracker** (Vercel project `agentix-tracker`,
  deployment aliased). It previously served a different live product —
  *"Agentix — Grade any AI agent, S to F"* (a grader) — which was **displaced** from the
  domain. That grader's Vercel project still exists, so this is reversible by
  re-aliasing the domain back to it.
- **Still true / still a footgun:** the Vercel project literally named **`agentix`** is
  the **builder** (agents.suedeai.ai). Never `vercel --prod` the tracker into it — the
  tracker's project is **`agentix-tracker`**. The domain alias is currently pinned to a
  specific deployment, so a future `vercel --prod` won't auto-update it; re-alias (or wire
  Git auto-deploy) when redeploying.
- **Open (brand):** two products still share the "Agentix" name (this tracker + the
  displaced grader) — reconciliation is a separate decision.

**Next (when the domain is settled):** build `SettlementDbProvider` against the
shared store, flip `AGENTIX_DATA_SOURCE=settlement`, wire `getCurrentOwner()` to the
`agx_owner` session, then alias the chosen domain.

## Direction update — manual-input pivot (2026-06-30, later)

Jason redirected: **Agentix is primarily a tracker based on info people put in**, not an
auto-sync from the builder. So the product is now a **manual-input tracker** you populate
yourself — register the agents you want to watch, log their earnings by hand. The builder
settlement DB / on-chain reads are demoted to *optional future enrichment*, not the primary source.

Resolved with Jason for this round:
- **Input model:** earnings/calls are **typed in by hand** (per-day snapshots build the trend);
  agent metadata (name / x402 URL / price / category / wallet / status) is registered manually.
- **Scope:** **single operator** for now (ship fast). Persistence is `localStorage` (per-browser).
  A hosted DB (Supabase / Vercel Postgres) is the cross-device + multi-user upgrade, behind the
  same read-model surface.
- **Example data:** a **large non-music** portfolio (~18 generic x402 agents — scraping, code,
  markets, vision, NLP, maps, compliance…) stands in as the empty-state demo until the operator
  adds their own.

Architecture:
- Read-models live in `src/lib/data/aggregate.ts` (pure, take-agnostic). Both the seed example
  (`seed.ts` / `seed-provider.ts`) and the manual store (`local-store.ts`) feed through it.
- `local-store.ts` = localStorage CRUD (`addAgent` / `updateAgent` / `removeAgent` / `logEntry`)
  + example fallback. Pages (`/`, `/agent/[id]`) render client apps (`PortfolioApp`,
  `AgentDetailApp`) that read it; SSR shows the deterministic example so the public sees content.
- Input UI: `components/input/` (`AgentForm`, `LogEarningsForm`, `Modal`).

## Direction update — directory + tracker value (2026-07-09)

Jason redirected: Agentix needs real value as both a directory and a tracker, while staying
separate from Suede Agent Studio. Interpreted boundary:

- **Agentix directory:** an owner/operator directory of tracked agents. It can store buyer,
  use-case, and directory-note metadata; calculate an Agentix directory score from tracker facts;
  filter for listed, earning, and attention-needed agents; and link to public x402 listings.
- **Suede Agent Studio:** still the build/launch surface at `agents.suedeai.ai`. Agentix links
  out to Studio and its public listing pages but does not re-implement the builder, canvas,
  pricing setup, launch flow, public rankings, or agent grading intake.

Implemented slice:

- `src/lib/directory.ts` computes directory score, reliability, run-rate, labels, and attention
  signals from Agentix tracker read-models.
- Seed and manual agents include `buyer`, `useCase`, and `directoryNote`.
- Dashboard now shows directory intelligence cards and an agent directory table sorted by
  directory score.
- Agent detail pages now include a directory profile with buyer, use case, score, and outbound
  listing/Studio links.
