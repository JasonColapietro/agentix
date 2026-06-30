import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function AgentNotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-5 py-24">
        <p className="eyebrow">Agent not found</p>
        <h1 className="display" style={{ fontSize: "var(--text-h2)" }}>
          No agent by that id.
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          It may have been unlisted, or the link is stale.
        </p>
        <Link
          href="/"
          className="mono mt-2 inline-flex items-center gap-1 rounded-md px-3.5 py-2 no-underline"
          style={{ fontSize: "var(--text-xs)", color: "var(--on-primary)", background: "var(--primary)" }}
        >
          ← Back to portfolio
        </Link>
      </main>
    </>
  );
}
