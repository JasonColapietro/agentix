import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorBox, NoteBody } from "@/components/NoteBody";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { NOTES, NOTES_PUBLISHED, noteBySlug, noteJsonLd, notePath } from "@/lib/notes";
import { withBrand } from "@/lib/seo-keywords";
import { OG_IMAGE_URL } from "@/lib/site";

interface NotePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return NOTES.map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = noteBySlug(slug);
  if (!note) return { title: "Note not found", robots: { index: false, follow: true } };
  const url = notePath(note.slug);
  return {
    title: { absolute: note.metaTitle },
    description: note.description,
    keywords: withBrand(note.keywords),
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    authors: [{ name: "Jason Colapietro", url: "https://suedeai.ai/founder" }],
    openGraph: {
      type: "article",
      locale: "en_US",
      url,
      siteName: "Agentix",
      title: note.metaTitle,
      description: note.description,
      publishedTime: NOTES_PUBLISHED,
      authors: ["https://suedeai.ai/founder"],
      images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "Agentix" }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@AISUEDE",
      creator: "@johnnysuede",
      title: note.metaTitle,
      description: note.description,
      images: [OG_IMAGE_URL],
    },
  };
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params;
  const note = noteBySlug(slug);
  if (!note) notFound();
  const others = NOTES.filter((n) => n.slug !== note.slug);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-14" style={{ lineHeight: 1.7 }}>
        <nav aria-label="Breadcrumb" className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
          <Link href="/" className="no-underline">Agentix</Link> /{" "}
          <Link href="/notes" className="no-underline">Notes</Link>
        </nav>
        <article className="mt-6">
          <h1 className="display" style={{ fontSize: "var(--text-h2)" }}>{note.title}</h1>
          <p className="mono mt-4" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            By <a href="https://suedeai.ai/founder" style={{ textDecoration: "underline" }}>Jason Colapietro</a> ·
            Suede AI, West Palm Beach, Florida · <time dateTime={NOTES_PUBLISHED}>November 14, 2026</time>
          </p>
          <div className="mt-6">
            <NoteBody blocks={note.blocks} />
          </div>
        </article>
        <AuthorBox />
        <nav aria-label="More notes" className="mt-10">
          <p className="eyebrow">More notes</p>
          <ul className="mt-2 list-disc pl-5" style={{ fontSize: "var(--text-sm)" }}>
            {others.map((n) => (
              <li key={n.slug}>
                <Link href={`/notes/${n.slug}`} style={{ color: "var(--primary)" }}>{n.title}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
      <SiteFooter sourceLabel="Suede AI notes" asOf="Nov 14, 2026" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(noteJsonLd(note)).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
