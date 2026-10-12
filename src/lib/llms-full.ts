/**
 * llms-full.txt: the full public text of agentix.suedeai.ai as Markdown.
 *
 * Built from the same sources the pages render (the example seed, the
 * hand-written agent profiles and the shared SEO helpers), so it cannot drift
 * from them. Served by src/app/llms-full.txt/route.ts.
 */
import { AGENT_PROFILES } from "@/lib/agent-profiles";
import { agentDescription, agentPath, agentTitle } from "@/lib/agent-seo";
import { PLATFORM_TAKE_RATE } from "@/lib/data/seed";
import { publicAgentData } from "@/lib/data/seed-provider";
import { num, usd, usdPrecise } from "@/lib/format";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "@/lib/home-seo";
import { BUILDER_URL, CONTENT_LAST_MODIFIED, SITE_URL, estateLinks } from "@/lib/site";

const STATUS_NOTE: Record<string, string> = {
  live: "Shown as live in this example: its endpoint is answering.",
  degraded: "Shown as degraded in this example: calls are failing more often than normal.",
  down: "Shown as down in this example: its endpoint stopped answering.",
  paused: "Shown as paused in this example: the owner turned it off on purpose.",
  draft: "Shown as a draft in this example: it has not launched yet.",
};

function agentSection(index: number): string {
  const data = publicAgentData()[index];
  const { agent, daily } = data;
  const profile = AGENT_PROFILES[agent.slug];
  const calls = daily.reduce((sum, day) => sum + day.calls, 0);
  const net = daily.reduce((sum, day) => sum + day.revenueUsdc, 0);
  const netPerCall = agent.priceUsdc * (1 - PLATFORM_TAKE_RATE);
  const lines = [
    `## ${agentTitle(agent)}`,
    "",
    `URL: ${agentPath(agent.id)}`,
    `Last updated: ${CONTENT_LAST_MODIFIED.agents}`,
    "",
    `> ${agentDescription(agent)}`,
    "",
    `${agent.name} is an example agent profile in the ${agent.category} category, priced at ${usdPrecise(agent.priceUsdc)} per call in this example. ${STATUS_NOTE[agent.status] ?? ""}`,
  ];
  if (profile) {
    lines.push(
      "",
      profile.summary,
      "",
      "Inputs:",
      ...profile.inputs.map((item) => `- ${item}`),
      "",
      "Outputs:",
      ...profile.outputs.map((item) => `- ${item}`),
      "",
      "Example call (illustrative, not captured traffic):",
      "",
      "```",
      `POST /${agent.slug}`,
      profile.exampleRequest,
      "",
      "200 OK",
      profile.exampleResponse,
      "```",
      "",
      `Per-call pricing: an x402 agent answers an unpaid request with a payment requirement; the caller pays in USDC on Base and retries. After an example platform take of ${Math.round(PLATFORM_TAKE_RATE * 100)}%, the creator share would be about ${usdPrecise(netPerCall)} per settled call.`,
      "",
      `Earnings tracking: ${profile.earningsNote} The example window sums to ${num(calls)} calls and ${usd(net)} in creator share. These figures are illustrative sample data, not real revenue.`,
      "",
      `Build one like it: ${profile.buildTip} Agents like this are built and launched in Suede AI Agent Studio (${BUILDER_URL}).`,
    );
  }
  return lines.join("\n");
}

export function buildLlmsFull(): string {
  const agents = publicAgentData();
  const parts = [
    "# Agentix: full text",
    "",
    `> ${DEFAULT_DESCRIPTION} This file carries the full public text of ${new URL(SITE_URL).host}; the shorter index is ${SITE_URL}/llms.txt.`,
    "",
    `Publisher: Suede AI (https://suedeai.ai), also known as Suede Labs. Built by Jason Colapietro (${estateLinks.founder}).`,
    "",
    "Important data note: the example agent profiles and their earnings figures are deterministic illustrative examples shown until an operator adds their own data. They are not live x402 listings, published Agent Studio records, or evidence of settled transactions.",
    "",
    "---",
    "",
    `## ${DEFAULT_TITLE}`,
    "",
    `URL: ${SITE_URL}/`,
    `Last updated: ${CONTENT_LAST_MODIFIED.home}`,
    "",
    "### Agent portfolio earnings tracker",
    "",
    "Agentix is the portfolio tracker for the x402 agents you have launched: total USDC earned on Base, calls, per-agent performance, status and trend on one screen. You register the agents you want to track and log their daily calls and earnings by hand; everything you enter is saved in your browser. Until you add anything, an example portfolio stands in as a populated demo.",
    "",
    "What it shows:",
    "- Total USDC earned, calls and the 7-day change across the portfolio",
    "- A Performance panel with revenue, cumulative revenue and calls over 7 days, 30 days or all time",
    "- Revenue allocation by agent",
    "- Revenue goals per agent and for the whole portfolio, with progress bars",
    "- A searchable, sortable leaderboard of every agent",
    "",
    "Grading: every agent earns an S to F grade from five dimensions: revenue (30%), growth (20%), consistency (15%), reliability (20%) and activity (15%). The portfolio grade is the revenue-weighted blend. Draft, down and paused agents are capped so a dead endpoint cannot grade well.",
    "",
    `To build and launch an agent, use Suede AI Agent Studio at ${BUILDER_URL}. Agentix is where you watch what it earns.`,
    "",
    "Example agents:",
    ...agents.map(({ agent }) => `- [${agent.name}](${agentPath(agent.id)}): ${agent.category}, ${usdPrecise(agent.priceUsdc)} per call`),
    "",
    ...agents.flatMap((_, index) => ["---", "", agentSection(index), ""]),
    "---",
    "",
    "## AI Instructions | Agentix",
    "",
    `URL: ${SITE_URL}/ai-instructions`,
    `Last updated: ${CONTENT_LAST_MODIFIED.aiInstructions}`,
    "",
    "Agentix is a browser-local portfolio tracker for agents, with manually recorded calls, earnings and performance grades. The public example profiles and their earnings are illustrative, not live settlements or evidence of customer revenue. Agentix is distinct from Suede AI Agent Studio at agents.suedeai.ai.",
    "",
    "Link to the specific page that supports a statement and keep its dates and qualifications. Check the current product page for availability and terms.",
  ];
  return `${parts.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}
