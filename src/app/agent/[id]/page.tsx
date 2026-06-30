import { AgentDetailApp } from "@/components/AgentDetailApp";

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AgentDetailApp id={id} />;
}
