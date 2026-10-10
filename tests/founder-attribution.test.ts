import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { estateLinks } from "@/lib/site";

describe("founder attribution", () => {
  it("links the canonical founder page", () => {
    expect(estateLinks.founder).toBe("https://suedeai.ai/founder");
  });

  it("names Jason Colapietro as the founder in the shared footer", async () => {
    const source = await readFile(
      new URL("../src/components/SiteFooter.tsx", import.meta.url),
      "utf8",
    );
    expect(source).toMatch(
      /Built by\{" "\}\s*<a href=\{estateLinks\.founder\}[^>]*>\s*Jason Colapietro\s*<\/a>\s*, founder of Suede AI/,
    );
  });
});
