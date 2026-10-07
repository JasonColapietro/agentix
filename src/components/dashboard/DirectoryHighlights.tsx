import Link from "next/link";
import type { AgentWithStats } from "@/lib/data/types";
import { attentionAgents, buyerLabel, directorySignal, topDirectoryAgents, useCaseLabel } from "@/lib/directory";
import { num, usd } from "@/lib/format";
import { StatusBadge } from "@/components/ui";

export function DirectoryHighlights({ agents }: { agents: AgentWithStats[] }) {
  const top = topDirectoryAgents(agents, 3);
  const attention = attentionAgents(agents, 1)[0];
  const best = top[0];
  const second = top[1] ?? top[0];

  if (!best) return null;

  const bestSignal = directorySignal(best);
  const secondSignal = directorySignal(second);
  const attentionSignal = attention ? directorySignal(attention) : null;
  const listed = agents.filter((agent) => Boolean(agent.x402Url)).length;
  const live = agents.filter((agent) => agent.status === "live").length;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Directory intelligence</p>
          <h2 className="display" style={{ fontSize: "var(--text-h3)" }}>Which agents are worth watching</h2>
        </div>
        <p className="mono" data-numeric style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
          {listed}/{agents.length} listed · {live} live
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <HighlightCard
          label="Best directory fit"
          agent={best}
          score={bestSignal.score}
          meta={`${usd(bestSignal.monthlyRunRateUsdc)}/mo run-rate`}
          body={best.directoryNote || bestSignal.reason}
        />
        <HighlightCard
          label="Buyer signal"
          agent={second}
          score={secondSignal.score}
          meta={buyerLabel(second)}
          body={useCaseLabel(second)}
        />
        {attention && attentionSignal ? (
          <HighlightCard
            label="Fix next"
            agent={attention}
            score={attentionSignal.score}
            meta={`${num(attention.stats.calls)} calls · ${attentionSignal.reliabilityPct}% reliable`}
            body={attentionSignal.reason}
            muted
          />
        ) : (
          <div className="card flex min-h-[178px] flex-col justify-between p-5">
            <p className="eyebrow">Fix next</p>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No weak listings in this view.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function HighlightCard({
  label,
  agent,
  score,
  meta,
  body,
  muted,
}: {
  label: string;
  agent: AgentWithStats;
  score: number;
  meta: string;
  body: string;
  muted?: boolean;
}) {
  return (
    <article className="card flex min-h-[178px] flex-col justify-between gap-5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow mb-2">{label}</p>
          <Link href={`/agent/${agent.id}`} className="display block truncate no-underline" style={{ fontSize: "1.35rem" }}>
            {agent.name}
          </Link>
          <p className="mt-1" style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{meta}</p>
        </div>
        <span
          className="tabular"
          data-numeric
          title="Agentix directory score"
          style={{
            borderRadius: "var(--radius-sm)",
            border: `1px solid ${muted ? "var(--hairline)" : "var(--hairline-cyan)"}`,
            color: muted ? "var(--text-muted)" : "var(--primary)",
            padding: "6px 8px",
            fontSize: "var(--text-sm)",
            fontWeight: 650,
            lineHeight: 1,
          }}
        >
          {score}
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{body}</p>
        <StatusBadge status={agent.status} />
      </div>
    </article>
  );
}
