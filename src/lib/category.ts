/**
 * Agent category → signal color, drawn from the builder's node-tag palette
 * (tokens.css) so the tracker stays a Suede family member. Unknown categories
 * hash into the palette deterministically.
 */
const CATEGORY_COLOR: Record<string, string> = {
  Scraping: "var(--registry-cyan)",
  Documents: "var(--proof-sky)",
  Code: "var(--primary)",
  NLP: "var(--violet)",
  Maps: "var(--verified-emerald)",
  Language: "var(--registry-cyan)",
  Markets: "var(--amber)",
  Vision: "var(--proof-sky)",
  Email: "var(--violet)",
  Compliance: "var(--amber)",
  Weather: "var(--proof-sky)",
  Moderation: "var(--violet)",
  SEO: "var(--verified-emerald)",
  Sports: "var(--amber)",
  Analytics: "var(--primary)",
  Data: "var(--registry-cyan)",
};

const PALETTE = [
  "var(--registry-cyan)",
  "var(--verified-emerald)",
  "var(--violet)",
  "var(--amber)",
  "var(--proof-sky)",
  "var(--primary)",
];

export function categoryColor(category: string): string {
  const known = CATEGORY_COLOR[category];
  if (known) return known;
  let h = 0;
  for (let i = 0; i < category.length; i++) h = (h * 31 + category.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

/** Categories offered in the add-agent form (free text also allowed). */
export const CATEGORY_OPTIONS = Object.keys(CATEGORY_COLOR);
