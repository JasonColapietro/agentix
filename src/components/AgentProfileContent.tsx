import Link from "next/link";
import { AGENT_PROFILES } from "@/lib/agent-profiles";
import { PLATFORM_TAKE_RATE } from "@/lib/data/seed";
import type { SeedAgentData } from "@/lib/data/seed";
import { num, usd, usdPrecise } from "@/lib/format";
import { BUILDER_URL } from "@/lib/site";

const STATUS_NOTE: Record<string, string> = {
  live: "shown as live in this example, meaning its endpoint is answering",
  degraded: "shown as degraded in this example, meaning calls are failing more often than normal",
  down: "shown as down in this example, meaning its endpoint stopped answering",
  paused: "shown as paused in this example, meaning the owner turned it off on purpose",
  draft: "shown as a draft in this example, meaning it has not launched yet",
};

/** Server-rendered, people-first body for an illustrative agent profile. */
export function AgentProfileContent({ data, related }: { data: SeedAgentData; related: SeedAgentData[] }) {
  const { agent, daily } = data;
  const profile = AGENT_PROFILES[agent.slug];
  if (!profile) return null;
  const calls = daily.reduce((s, d) => s + d.calls, 0);
  const net = daily.reduce((s, d) => s + d.revenueUsdc, 0);
  const netPerCall = agent.priceUsdc * (1 - PLATFORM_TAKE_RATE);
  const callsFor100 = Math.ceil(100 / netPerCall);

  return (
    <section aria-labelledby="about-heading" className="mx-auto max-w-6xl px-5 pb-10" style={{ fontSize: "var(--text-sm)", lineHeight: 1.65 }}>
      <h2 id="about-heading" className="display" style={{ fontSize: "var(--text-h3)" }}>What {agent.name} does</h2>
      <p className="mt-2">
        {agent.name} is an <strong>example agent profile</strong> in the {agent.category} category. {profile.summary}{" "}
        It is {STATUS_NOTE[agent.status]}.
      </p>

      <h3 className="mt-6 font-medium">Inputs and outputs</h3>
      <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="eyebrow">Inputs</p>
          <ul className="mt-1 list-disc pl-5">{profile.inputs.map((i) => <li key={i}>{i}</li>)}</ul>
        </div>
        <div>
          <p className="eyebrow">Outputs</p>
          <ul className="mt-1 list-disc pl-5">{profile.outputs.map((o) => <li key={o}>{o}</li>)}</ul>
        </div>
      </div>

      <h3 className="mt-6 font-medium">Example call</h3>
      <p className="mt-1" style={{ color: "var(--text-muted)" }}>A sample request and response, written for illustration. This is not captured traffic.</p>
      <pre className="mono mt-2 overflow-x-auto rounded-md p-3" style={{ fontSize: "var(--text-xs)", background: "var(--surface-2, rgba(127,127,127,.08))" }}>{`POST /${agent.slug}\n${profile.exampleRequest}\n\n200 OK\n${profile.exampleResponse}`}</pre>

      <h3 className="mt-6 font-medium">How per-call pricing would work</h3>
      <p className="mt-1">
        An x402 agent answers an unpaid request with a payment requirement. The caller pays in USDC on Base and
        retries, and the agent responds. Here the example price is {usdPrecise(agent.priceUsdc)} per call. After an example platform take of{" "}
        {Math.round(PLATFORM_TAKE_RATE * 100)}%, the creator share would be about {usdPrecise(netPerCall)} per settled call, so roughly{" "}
        {num(callsFor100)} settled calls to reach $100 in creator share. Failed calls are not settled, so they earn nothing.
      </p>

      <h3 className="mt-6 font-medium">How earnings are tracked for it</h3>
      <p className="mt-1">
        {profile.earningsNote} The chart above sums to {num(calls)} calls and {usd(net)} in creator share over the example window.
        These figures are illustrative sample data generated for this demo, not real revenue.
        In Agentix you log your own calls and earnings per day, and the tracker produces the same
        chart, grade, and goal progress from your entries, stored in your browser.
      </p>

      {related.length > 0 ? (
        <>
          <h3 className="mt-6 font-medium">Related example agents</h3>
          <ul className="mt-1 list-disc pl-5">
            {related.map(({ agent: r }) => (
              <li key={r.id}>
                <Link href={`/agent/${encodeURIComponent(r.id)}`} style={{ color: "var(--primary)" }}>{r.name}</Link>
                {" "}({r.category}, {usdPrecise(r.priceUsdc)} per call)
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h3 className="mt-6 font-medium">How to build an agent like {agent.name}</h3>
      <p className="mt-1">
        {profile.buildTip} You can design, price, and launch an agent like this in{" "}
        <a href={BUILDER_URL} target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>Suede Agent Studio</a>, then come back to Agentix to track what it earns.
      </p>
    </section>
  );
}
