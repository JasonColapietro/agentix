import React from "react";
import { describe, expect, it, vi } from "vitest";
import type { Metadata } from "next";
import sitemap from "@/app/sitemap";
import { SITE_URL } from "@/lib/site";

Object.assign(globalThis, { React });

// next/font only works inside the Next compiler; stub it so layout.tsx imports.
vi.mock("next/font/google", () => {
  const font = () => ({ variable: "", className: "", style: {} });
  return { Geist: font, Geist_Mono: font, Instrument_Serif: font };
});

function keywordList(metadata: Metadata): string[] {
  const { keywords } = metadata;
  if (!keywords) return [];
  return Array.isArray(keywords) ? [...keywords] : [keywords];
}

function expectGoodKeywords(route: string, keywords: string[]) {
  expect(keywords.length, `${route} keyword count`).toBeGreaterThanOrEqual(4);
  expect(keywords.length, `${route} keyword count`).toBeLessThanOrEqual(10);
  for (const k of keywords) expect(k.trim(), `${route} empty keyword`).not.toBe("");
  expect(new Set(keywords).size, `${route} duplicate keywords`).toBe(keywords.length);
  expect(keywords, `${route} brand`).toContain("Suede AI");
  expect(keywords.join(" "), `${route} company name`).not.toMatch(/suede labs ai/i);
}

async function metadataFor(url: string): Promise<Metadata> {
  const path = url.slice(SITE_URL.length) || "/";
  if (path === "/") {
    const page = await import("@/app/page");
    return page.metadata;
  }
  const match = path.match(/^\/agent\/([^/]+)$/);
  if (match) {
    const page = await import("@/app/agent/[id]/page");
    return page.generateMetadata({
      params: Promise.resolve({ id: decodeURIComponent(match[1]) }),
    });
  }
  throw new Error(`No keyword guard for indexable route ${path}; add it here and to lib/seo-keywords.ts`);
}

describe("meta keywords on every indexable page", () => {
  const urls = sitemap().map((entry) => entry.url);

  it("covers the home page and every indexable agent", () => {
    expect(urls[0]).toBe(SITE_URL);
  });

  it.each(urls)("%s ships a complete keywords list", async (url) => {
    const metadata = await metadataFor(url);
    expect(metadata.robots ?? { index: true }).not.toMatchObject({ index: false });
    expectGoodKeywords(url, keywordList(metadata));
  });

  it("root layout carries a fallback keywords list", async () => {
    const layout = await import("@/app/layout");
    expectGoodKeywords("layout", keywordList(layout.metadata));
  });

  it("agent keywords name the specific agent first", async () => {
    const page = await import("@/app/agent/[id]/page");
    const metadata = await page.generateMetadata({
      params: Promise.resolve({ id: "agt_market_data_feed" }),
    });
    expect(keywordList(metadata)[0]).toBe("market data feed x402 agent");
  });
});

describe("withBrand", () => {
  it("dedupes case-insensitively, trims, and appends brand terms once", async () => {
    const { withBrand } = await import("@/lib/seo-keywords");
    expect(withBrand([" Suede AI ", "agentix", "x402", "X402", ""])).toEqual(["Suede AI", "agentix", "x402"]);
  });
});
