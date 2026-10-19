import { readFileSync } from "node:fs";
import React from "react";
import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { GET as llmsFull } from "@/app/llms-full.txt/route";
import { agentDescription, agentJsonLd } from "@/lib/agent-seo";
import { publicAgentData } from "@/lib/data/seed-provider";
import { HOME_JSON_LD } from "@/lib/home-seo";
import { CONTENT_LAST_MODIFIED, OG_IMAGE_URL, SITE_URL } from "@/lib/site";

Object.assign(globalThis, { React });

describe("search and answer-engine surfaces", () => {
  it("gives every sitemap URL a real W3C lastmod and lists the AI instructions page", () => {
    const entries = sitemap();
    for (const entry of entries) {
      expect(String(entry.lastModified), entry.url).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    expect(entries.map((e) => e.url)).toContain(`${SITE_URL}/ai-instructions`);
    for (const date of Object.values(CONTENT_LAST_MODIFIED)) {
      expect(Date.parse(date)).not.toBeNaN();
    }
  });

  it("keeps agent descriptions between 120 and 160 characters", () => {
    for (const { agent } of publicAgentData()) {
      const length = agentDescription(agent).length;
      expect(length, agent.name).toBeGreaterThanOrEqual(120);
      expect(length, agent.name).toBeLessThanOrEqual(160);
    }
  });

  it("publishes a WebPage for the home page and for every agent profile", () => {
    const homeTypes = HOME_JSON_LD["@graph"].map((node) => node["@type"]);
    expect(homeTypes).toEqual(expect.arrayContaining(["WebSite", "WebPage"]));
    const graph = agentJsonLd({ id: "agt_x", name: "X", category: "Data" })["@graph"] as Record<string, unknown>[];
    const page = graph.find((node) => node["@type"] === "WebPage");
    expect(page?.isPartOf).toEqual({ "@id": `${SITE_URL}/#website` });
    expect(page?.breadcrumb).toEqual({ "@id": `${SITE_URL}/agent/agt_x#breadcrumb` });
  });

  it("serves llms-full.txt with every public page, linked from llms.txt", async () => {
    const res = llmsFull();
    expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    const body = await res.text();
    expect(body.startsWith("# ")).toBe(true);
    expect(Buffer.byteLength(body)).toBeLessThan(500_000);
    for (const entry of sitemap()) {
      expect(body, entry.url).toContain(`URL: ${entry.url}\n`);
    }
    expect(body).toContain("They are not live x402 listings");
    expect(body).not.toContain("—");
    expect(readFileSync("public/llms.txt", "utf8")).toContain(`${SITE_URL}/llms-full.txt`);
  });

  it("names the AI crawlers in robots.txt and allows the whole site", () => {
    const rules = robots().rules;
    const list = Array.isArray(rules) ? rules : [rules];
    const agents = list.flatMap((rule) => (Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent]));
    for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot", "Googlebot", "Bingbot", "*"]) {
      expect(agents).toContain(bot);
    }
    for (const rule of list) expect(rule.disallow).toBeUndefined();
  });

  it("serves the shared IndexNow key as a bare static file", () => {
    expect(readFileSync("public/4c265a375effa42521f5b88bb3c28501.txt", "utf8")).toBe("4c265a375effa42521f5b88bb3c28501");
  });

  it("points every social preview at the Agentix card, not another product's", () => {
    expect(OG_IMAGE_URL).toBe("https://agentix.suedeai.ai/og.png");
    const route = readFileSync("src/app/og.png/route.tsx", "utf8");
    expect(route).toContain('export const dynamic = "force-static"');
    expect(route).toContain("ImageResponse");

    const aiInstructions = readFileSync("public/ai-instructions.html", "utf8");
    expect(aiInstructions).toContain(`<meta property="og:image" content="${OG_IMAGE_URL}">`);
    expect(aiInstructions).toContain(`<meta name="twitter:image" content="${OG_IMAGE_URL}">`);
    expect(aiInstructions).not.toContain("app.suedeai.ai/opengraph.png");
  });
});
