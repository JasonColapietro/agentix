import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgentDetailApp } from "@/components/AgentDetailApp";
import {
  isBrowserLocalAgentId,
  publicAgent,
  publicAgentData,
} from "@/lib/data/seed-provider";
import { OG_IMAGE_URL, SITE_URL } from "@/lib/site";

interface AgentDetailPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams(): { id: string }[] {
  return publicAgentData().map(({ agent }) => ({ id: agent.id }));
}

export async function generateMetadata({ params }: AgentDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const match = publicAgent(id);

  if (!match) {
    return {
      title: isBrowserLocalAgentId(id) ? "Private agent" : "Agent not found",
      alternates: { canonical: null },
      robots: { index: false, follow: true },
      openGraph: null,
      twitter: null,
    };
  }

  const { agent } = match;
  const canonical = `${SITE_URL}/agent/${encodeURIComponent(agent.id)}`;
  const description =
    `Explore the ${agent.name} example agent profile in Agentix, including ` +
    "x402 price, status, calls, grade, and earnings trend.";

  return {
    title: agent.name,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      siteName: "Agentix",
      title: `${agent.name} — Agentix`,
      description,
      images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Agentix" }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@AISUEDE",
      creator: "@johnnysuede",
      title: `${agent.name} — Agentix`,
      description,
      images: [OG_IMAGE_URL],
    },
  };
}

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { id } = await params;
  const match = publicAgent(id);

  if (match) return <AgentDetailApp id={match.agent.id} />;

  if (isBrowserLocalAgentId(id)) return <AgentDetailApp id={id} />;

  notFound();
}
