/**
 * Agent category → signal color. Colors are the builder's node-tag palette
 * (tokens.css) so a "Lyrics" agent here reads the same cyan as a Suede Tools
 * node there. Unknown categories hash into the palette deterministically.
 */
const CATEGORY_COLOR: Record<string, string> = {
  Lyrics: "var(--registry-cyan)",
  Audio: "var(--verified-emerald)",
  Discovery: "var(--violet)",
  Royalties: "var(--amber)",
  Artwork: "var(--proof-sky)",
  Mastering: "var(--primary)",
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
