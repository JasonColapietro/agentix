import { builderLinks } from "@/lib/site";

export function SiteFooter({ sourceLabel, asOf }: { sourceLabel: string; asOf?: string }) {
  return (
    <footer style={{ borderTop: "1px solid var(--hairline)" }} className="mt-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="display" style={{ fontSize: "1.1rem" }}>
            Agentix
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
            The portfolio tracker for the x402 agents you've launched.
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex items-center gap-4">
            <a href={builderLinks.rankings} target="_blank" rel="noreferrer" className="mono no-underline" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              Rankings ↗
            </a>
            <a href={builderLinks.grade} target="_blank" rel="noreferrer" className="mono no-underline" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              Grade ↗
            </a>
          </div>
          <span className="mono" style={{ fontSize: "var(--text-label)", color: "var(--text-muted)" }} data-numeric>
            Source: {sourceLabel}
            {asOf ? ` · as of ${asOf}` : ""}
          </span>
        </div>
      </div>
    </footer>
  );
}
