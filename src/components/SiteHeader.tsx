import Link from "next/link";
import { BUILDER_URL } from "@/lib/site";
import { shortAddr } from "@/lib/format";

export function SiteHeader({ ownerWallet }: { ownerWallet?: string }) {
  return (
    <header
      className="sticky top-0 z-20"
      style={{
        background: "color-mix(in srgb, var(--ink-deep) 86%, transparent)",
        backdropFilter: "saturate(180%) blur(8px)",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-baseline gap-2 no-underline">
          <span className="display" style={{ fontSize: "1.5rem", lineHeight: 1 }}>
            Agentix
          </span>
          <span className="eyebrow hidden sm:inline" style={{ transform: "translateY(-1px)" }}>
            Tracker
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {ownerWallet ? (
            <span
              className="mono hidden items-center gap-1.5 rounded-full px-2.5 py-1 sm:inline-flex"
              style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", border: "1px solid var(--hairline)" }}
              title={ownerWallet}
            >
              <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: "var(--verified-emerald)" }} />
              {shortAddr(ownerWallet)}
            </span>
          ) : null}
          <a
            href={BUILDER_URL}
            target="_blank"
            rel="noreferrer"
            className="mono inline-flex items-center gap-1 rounded-md px-3 py-1.5 no-underline"
            style={{ fontSize: "var(--text-xs)", color: "var(--on-primary)", background: "var(--primary)" }}
          >
            Open Studio
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </header>
  );
}
