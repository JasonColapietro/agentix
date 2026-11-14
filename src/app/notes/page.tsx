import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { NOTES, NOTES_INDEX, NOTES_PUBLISHED, notesIndexJsonLd } from "@/lib/notes";
import { withBrand } from "@/lib/seo-keywords";
import { OG_IMAGE_URL, SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/notes`;

export const metadata: Metadata = {
  title: { absolute: NOTES_INDEX.title },
  description: NOTES_INDEX.description,
  keywords: withBrand(NOTES_INDEX.keywords),
  alternates: { canonical: url },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url,
    siteName: "Agentix",
    title: NOTES_INDEX.title,
    description: NOTES_INDEX.description,
    images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Agentix" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@AISUEDE",
    creator: "@johnnysuede",
    title: NOTES_INDEX.title,
    description: NOTES_INDEX.description,
    images: [OG_IMAGE_URL],
  },
};

export default function NotesIndexPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-14" style={{ lineHeight: 1.65 }}>
        <nav aria-label="Breadcrumb" className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
          <Link href="/" className="no-underline">Agentix</Link> / Notes
        </nav>
        <p className="eyebrow mt-6">Notes</p>
        <h1 className="display mt-2" style={{ fontSize: "var(--text-h1)" }}>
          Grading AI agents, from West Palm Beach
        </h1>
        <p className="mt-4" style={{ fontSize: "var(--text-lede)", color: "var(--text-muted)" }}>
          Field notes from Jason Colapietro and the Suede AI team on testing, grading and running AI agents for
          businesses in West Palm Beach, Jupiter and across Palm Beach County, Florida.
        </p>
        <ul className="mt-10 flex flex-col gap-5">
          {NOTES.map((note) => (
            <li key={note.slug} className="card p-5">
              <h2 className="display" style={{ fontSize: "var(--text-h3)" }}>
                <Link href={`/notes/${note.slug}`} className="no-underline">{note.title}</Link>
              </h2>
              <p className="mt-2" style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{note.summary}</p>
              <p className="mono mt-3" style={{ fontSize: "var(--text-label)", color: "var(--text-muted)" }}>
                Jason Colapietro · <time dateTime={NOTES_PUBLISHED}>November 14, 2026</time>
              </p>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter sourceLabel="Suede AI notes" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(notesIndexJsonLd()).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
