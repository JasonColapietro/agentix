import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-5 py-24">
        <p className="eyebrow">404</p>
        <h1 className="display" style={{ fontSize: "var(--text-h2)" }}>
          Nothing tracked here.
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          That page doesn&apos;t exist in the portfolio.
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
