import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { publicAgentData } from "@/lib/data/seed-provider";
import { SITE_URL } from "@/lib/site";

describe("public example link integrity", () => {
  it("publishes a truthful LLM index for the illustrative example set", async () => {
    const content = await readFile(
      new URL("../public/llms.txt", import.meta.url),
      "utf8",
    );
    const examples = publicAgentData();
    const profileLines = content
      .split("\n")
      .filter((line) => line.startsWith("- ") && line.includes("/agent/"));

    expect(examples).toHaveLength(18);
    expect(profileLines).toHaveLength(examples.length);
    expect(content).toContain("deterministic illustrative examples");
    expect(content).toContain("They are not live x402 listings");
    expect(content).toContain("or evidence of settled transactions.");

    for (const { agent } of examples) {
      expect(content).toContain(
        `${SITE_URL}/agent/${encodeURIComponent(agent.id)}`,
      );
    }
  });

  it("suppresses unavailable Studio listings for every public example page", () => {
    const examples = publicAgentData();
    expect(examples).toHaveLength(18);
    for (const { agent } of examples) {
      expect(agent.x402Url).toBe("");
    }
  });

  it("covers every current sitemap agent page without manufacturing an external CTA", () => {
    const examples = publicAgentData();
    const agentUrls = sitemap()
      .map((entry) => entry.url)
      .filter((url) => url.startsWith(`${SITE_URL}/agent/`));

    expect(agentUrls).toEqual(
      examples.map(
        ({ agent }) =>
          `${SITE_URL}/agent/${encodeURIComponent(agent.id)}`,
      ),
    );
    expect(examples.every(({ agent }) => agent.x402Url === "")).toBe(true);
  });

  it("labels illustrative profiles when no live listing is attached", async () => {
    const source = await readFile(
      new URL("../src/components/AgentDetailApp.tsx", import.meta.url),
      "utf8",
    );
    expect(source).toContain(
      "This illustrative profile has no",
    );
    expect(source).toContain("live x402 listing.");
  });
});
