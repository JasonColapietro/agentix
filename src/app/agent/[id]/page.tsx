import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgentProfileContent } from "@/components/AgentProfileContent";
import { SiteFooter } from "@/components/SiteFooter";
import { SEED_NOW } from "@/lib/data/seed";
import { AgentDetailApp } from "@/components/AgentDetailApp";
import {
  isBrowserLocalAgentId,
  publicAgent,
  publicAgentData,
} from "@/lib/data/seed-provider";
import { agentDescription, agentJsonLd, agentPath, agentTitle, relatedAgents } from "@/lib/agent-seo";
import { agentKeywords } from "@/lib/seo-keywords";
import { OG_IMAGE_URL } from "@/lib/site";

interface AgentDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatSeedDate(): string {
  return SEED_NOW.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
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
  const canonical = agentPath(agent.id);
  const description = agentDescription(agent);
  const title = agentTitle(agent);

  return {
    title,
    description,
    keywords: agentKeywords(agent),
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      siteName: "Agentix",
      title: `${title} | Agentix`,
      description,
      images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Agentix" }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@AISUEDE",
      creator: "@johnnysuede",
      title: `${title} | Agentix`,
      description,
      images: [OG_IMAGE_URL],
    },
  };
}

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { id } = await params;
  const match = publicAgent(id);

  if (match) {
    return (
      <>
        <AgentDetailApp id={match.agent.id} hideFooter />
        <AgentProfileContent data={match} related={relatedAgents(match.agent, publicAgentData())} />
        <SiteFooter sourceLabel="seed data (demo)" asOf={formatSeedDate()} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(agentJsonLd(match.agent)) }}
        />
      </>
    );
  }

  if (isBrowserLocalAgentId(id)) return <AgentDetailApp id={id} />;

  notFound();
}
