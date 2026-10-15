import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AgentBoard } from "@/components/dashboard/AgentBoard";
import { DirectoryHighlights } from "@/components/dashboard/DirectoryHighlights";
import { examplePortfolio } from "@/lib/data/local-store";

describe("directory surfaces", () => {
  it("renders buyer positioning and scores while preserving illustrative listing safety", () => {
    const view = examplePortfolio();
    const html = renderToStaticMarkup(createElement(AgentBoard, { agents: view.agents, targets: {}, nowISO: view.now, editable: false, onChange: () => {} }));
    expect(html).toContain("Agent directory");
    expect(html).toContain("Data ops and price-intel teams");
    expect(html).toContain("Needs attention");
    expect(html).not.toContain('href="https://agents.suedeai.ai/a/');
    expect(html).toContain('aria-label="Search agents, buyers, and use cases"');
  });

  it("surfaces a live weak listing in the Fix next card", () => {
    const original = examplePortfolio().agents[0];
    const weak = { ...original, name: "Weak test listing", status: "live" as const, x402Url: "", grade: undefined, stats: { ...original.stats, calls: 100, errors: 0, revenueUsdc: 0, spark: [0, 0, 0, 0, 0, 0, 0] } };
    const html = renderToStaticMarkup(createElement(DirectoryHighlights, { agents: [weak] }));
    expect(html).not.toContain("No weak listings in this view.");
    const fixNext = html.slice(html.indexOf("Fix next"));
    expect(fixNext).toContain("Weak test listing");
    expect(fixNext).toContain("100 calls");
  });
});
