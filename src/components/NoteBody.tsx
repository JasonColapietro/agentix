import Link from "next/link";
import type { ReactNode } from "react";
import type { NoteBlock } from "@/lib/notes";

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;
const linkStyle = { color: "var(--primary)", textDecoration: "underline" } as const;

/** Renders inline [text](url) links: internal paths via next/link, external as anchors. */
export function RichText({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    const [whole, label, href] = match;
    const at = match.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    out.push(
      href.startsWith("/") ? (
        <Link key={at} href={href} style={linkStyle}>{label}</Link>
      ) : (
        <a key={at} href={href} style={linkStyle}>{label}</a>
      ),
    );
    last = at + whole.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

export function NoteBody({ blocks }: { blocks: NoteBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "h2") {
          return (
            <h2 key={i} className="display mt-10" style={{ fontSize: "var(--text-h3)" }}>
              {block.text}
            </h2>
          );
        }
        if (block.type === "p") {
          return (
            <p key={i} className="mt-4">
              <RichText text={block.text} />
            </p>
          );
        }
        return (
          <ul key={i} className="mt-4 list-disc space-y-2 pl-5">
            {block.items.map((item) => (
              <li key={item}>
                <RichText text={item} />
              </li>
            ))}
          </ul>
        );
      })}
    </>
  );
}

/** Short author box shown under every note. */
export function AuthorBox() {
  return (
    <aside className="card mt-12 p-5" aria-label="About the author" style={{ fontSize: "var(--text-sm)" }}>
      <p className="eyebrow">About the author</p>
      <p className="mt-2">
        <a href="https://suedeai.ai/founder" style={linkStyle}>Jason Colapietro</a>, Founder and CEO, Suede AI,
        West Palm Beach, Florida. Engineer, author of five books and builder of Agentix. More at{" "}
        <a href="https://jasoncolapietro.com/" style={linkStyle}>jasoncolapietro.com</a>, with every claim
        backed on the <a href="https://seo.suedeai.ai/evidence" style={linkStyle}>Suede AI evidence page</a>.
      </p>
    </aside>
  );
}
