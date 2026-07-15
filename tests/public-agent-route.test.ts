import { readFileSync } from "node:fs";
import React from "react";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { SITE_URL } from "@/lib/site";

const knownId = "agt_market_data_feed";
const browserLocalId = "agt_m7x9q2ab12cd34";
const unknownId = "definitely-not-a-real-agent-20260715";

// Next compiles the app with the automatic JSX runtime. Vitest's direct TSX
// import needs React present when it invokes the page component in Node.
Object.assign(globalThis, { React });

describe("public agent routes", () => {
  it("rejects an unknown public agent with Next's 404 response", async () => {
    const page = await import("@/app/agent/[id]/page");

    await expect(
      page.default({ params: Promise.resolve({ id: unknownId }) }),
    ).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
  });

  it("publishes self-canonical, indexable metadata for a known agent", async () => {
    const page = await import("@/app/agent/[id]/page");

    expect(page.generateMetadata).toBeTypeOf("function");
    const metadata = await page.generateMetadata({
      params: Promise.resolve({ id: knownId }),
    });

    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/agent/${knownId}`);
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.title).toContain("Market Data Feed");
    expect(metadata.openGraph).toMatchObject({
      url: `${SITE_URL}/agent/${knownId}`,
      images: [{ url: "https://app.suedeai.ai/opengraph.png" }],
    });
    expect(metadata.twitter).toMatchObject({
      images: ["https://app.suedeai.ai/opengraph.png"],
    });
  });

  it("removes canonical and index signals for an unknown agent", async () => {
    const page = await import("@/app/agent/[id]/page");

    expect(page.generateMetadata).toBeTypeOf("function");
    const metadata = await page.generateMetadata({
      params: Promise.resolve({ id: unknownId }),
    });

    expect(metadata.alternates?.canonical).toBeNull();
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });

  it("keeps browser-local agent IDs client-resolvable but non-indexable", async () => {
    const page = await import("@/app/agent/[id]/page");

    const rendered = await page.default({
      params: Promise.resolve({ id: browserLocalId }),
    });
    const metadata = await page.generateMetadata({
      params: Promise.resolve({ id: browserLocalId }),
    });

    expect(rendered.props.id).toBe(browserLocalId);
    expect(metadata.alternates?.canonical).toBeNull();
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });

  it("scopes the homepage canonical to the homepage instead of every route", async () => {
    const layout = readFileSync("src/app/layout.tsx", "utf8");
    const homepage = await import("@/app/page");

    expect(layout).not.toContain("alternates: { canonical: SITE_URL }");
    expect(homepage.metadata.alternates?.canonical).toBe(SITE_URL);
  });

  it("gives the homepage one visible, answer-ready H1", () => {
    const portfolio = readFileSync("src/components/PortfolioApp.tsx", "utf8");

    expect(portfolio.match(/<h1\b/g)).toHaveLength(1);
    expect(portfolio).toContain("Agent portfolio earnings tracker");
    expect(portfolio).not.toMatch(/<h1[^>]+(?:sr-only|hidden)/);
  });

  it("lists stable public agent detail URLs in the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain(`${SITE_URL}/agent/${knownId}`);
    expect(urls).not.toContain(`${SITE_URL}/agent/${unknownId}`);
  });

  it("does not publish the validator-invalid SoftwareApplication isRelatedTo field", () => {
    const layout = readFileSync("src/app/layout.tsx", "utf8");

    expect(layout).not.toContain("isRelatedTo:");
  });
});
