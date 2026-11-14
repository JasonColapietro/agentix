/**
 * "Built by Suede AI in West Palm Beach, Florida": the sitewide estate block
 * rendered inside SiteFooter. Contextual links to the main Suede AI pages and
 * a few related sibling sites; keep it short so it reads as context, not a list.
 */
const muted = { color: "var(--text-muted)" } as const;
const link = { color: "var(--text-primary)", textDecoration: "underline" } as const;

export const SIBLING_SITES = [
  { href: "https://optimize.suedeai.ai/", label: "Suede Scan AI readiness check" },
  { href: "https://docs.suedeai.ai/", label: "Suede developer docs" },
  { href: "https://signal.suedeai.ai/", label: "Suede Signal" },
  { href: "https://podcast.suedeai.ai/", label: "Suede podcast" },
] as const;

export function SuedeNetwork() {
  return (
    <section
      aria-label="Built by Suede AI"
      className="mx-auto max-w-6xl px-5 pt-8"
      style={{ fontSize: "var(--text-xs)", lineHeight: 1.7 }}
    >
      <p className="eyebrow">Built by Suede AI in West Palm Beach, Florida</p>
      <p className="mt-2" style={muted}>
        Agentix is made by <a href="https://suedeai.ai/" style={link}>Suede AI</a>, the agentic platform company{" "}
        <a href="https://suedeai.ai/founder" style={link}>Jason Colapietro</a> founded in 2024. For SEO, GEO and web
        development in West Palm Beach, Jupiter and Palm Beach County, see{" "}
        <a href="https://suedeai.agency/" style={link}>Suede AI's agency practice</a>. Jason writes at{" "}
        <a href="https://jasoncolapietro.com/" style={link}>jasoncolapietro.com</a>, and{" "}
        <a href="https://jupitersocialfl.com/" style={link}>Jupiter Social FL</a> is the local magazine published with
        Suede AI.
      </p>
      <p className="mt-2" style={muted}>
        More from Suede AI:{" "}
        {SIBLING_SITES.map((site, i) => (
          <span key={site.href}>
            {i > 0 ? " · " : ""}
            <a href={site.href} style={link}>{site.label}</a>
          </span>
        ))}
      </p>
    </section>
  );
}
