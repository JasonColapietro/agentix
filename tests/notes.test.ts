import { readFileSync } from "node:fs";
import React from "react";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { NOTES, NOTES_INDEX, noteJsonLd, notePath, notePlainText, notesIndexJsonLd } from "@/lib/notes";
import { SITE_URL } from "@/lib/site";

Object.assign(globalThis, { React });

const FORBIDDEN = [
  /velvet sundown/i,
  /forbes/i,
  /anthropic partner/i,
  /claude partner/i,
  /google partner(?! advantage)/i,
  /\$\s?(28|30)\s?m/i,
  /multimillion/i,
  /\bFAU\b/,
  /\bdelve|leverage|unlock|elevate|seamless|game-changer|tapestry|realm\b/i,
  /—/,
  /Victorian Lane/i,
];

const count = (text: string, re: RegExp) => (text.match(re) ?? []).length;

describe("notes articles", () => {
  it("publishes three unique articles", () => {
    expect(NOTES).toHaveLength(3);
    expect(new Set(NOTES.map((n) => n.slug)).size).toBe(3);
    expect(new Set(NOTES.map((n) => n.metaTitle)).size).toBe(3);
    expect(new Set(NOTES.map((n) => n.description)).size).toBe(3);
  });

  it.each(NOTES.map((n) => [n.slug, n] as const))("%s meets the length, naming and claims rules", (_, note) => {
    const text = notePlainText(note);
    const words = text.split(/\s+/).filter(Boolean).length;
    expect(words).toBeGreaterThanOrEqual(800);
    expect(words).toBeLessThanOrEqual(1300);
    expect(note.metaTitle.length).toBeGreaterThanOrEqual(50);
    expect(note.metaTitle.length).toBeLessThanOrEqual(60);
    expect(note.description.length).toBeGreaterThanOrEqual(120);
    expect(note.description.length).toBeLessThanOrEqual(160);
    expect(count(text, /Jason Colapietro/g)).toBeGreaterThanOrEqual(5);
    expect(count(text, /Suede(?! AI| Labs)/g)).toBeGreaterThanOrEqual(3);
    expect(count(text, /Suede Labs/g)).toBeGreaterThanOrEqual(1);
    expect(count(text, /Suede AI/g)).toBeGreaterThan(count(text, /Suede Labs/g));
    expect(text).toMatch(/West Palm Beach/);
    for (const re of FORBIDDEN) expect(text, String(re)).not.toMatch(re);
    const body = JSON.stringify(note.blocks);
    expect(body).toContain("https://suedeai.agency/assessment");
    expect(body).toContain("https://suedeai.ai/founder");
  });

  it("emits BlogPosting and BreadcrumbList JSON-LD pointing at canonical entities", () => {
    for (const note of NOTES) {
      const graph = noteJsonLd(note)["@graph"] as Record<string, unknown>[];
      const post = graph.find((n) => n["@type"] === "BlogPosting")!;
      expect(post.author).toEqual({ "@id": "https://suedeai.ai/founder#person" });
      expect(post.publisher).toEqual({ "@id": "https://suedeai.ai/#organization" });
      expect(post.datePublished).toBe("2026-11-14");
      expect(post.mainEntityOfPage).toEqual({ "@id": `${notePath(note.slug)}#webpage` });
      expect(graph.some((n) => n["@type"] === "BreadcrumbList")).toBe(true);
      // never mint new Person or Organization nodes
      expect(graph.some((n) => n["@type"] === "Person" || n["@type"] === "Organization")).toBe(false);
    }
    const index = notesIndexJsonLd()["@graph"] as Record<string, unknown>[];
    expect(index.some((n) => n["@type"] === "Person" || n["@type"] === "Organization")).toBe(false);
  });

  it("lists the notes in the sitemap and llms.txt", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${SITE_URL}${NOTES_INDEX.path}`);
    const llms = readFileSync("public/llms.txt", "utf8");
    for (const note of NOTES) {
      expect(urls).toContain(notePath(note.slug));
      expect(llms).toContain(notePath(note.slug));
    }
  });

  it("renders each note page with a self canonical and a 50 to 60 character title", async () => {
    const page = await import("@/app/notes/[slug]/page");
    for (const note of NOTES) {
      const meta = await page.generateMetadata({ params: Promise.resolve({ slug: note.slug }) });
      expect(meta.alternates?.canonical).toBe(notePath(note.slug));
      expect(meta.title).toEqual({ absolute: note.metaTitle });
    }
    expect(NOTES_INDEX.title.length).toBeGreaterThanOrEqual(50);
    expect(NOTES_INDEX.title.length).toBeLessThanOrEqual(60);
    expect(NOTES_INDEX.description.length).toBeGreaterThanOrEqual(120);
    expect(NOTES_INDEX.description.length).toBeLessThanOrEqual(160);
  });

  it("carries the Built by Suede AI block in the shared footer", () => {
    const footer = readFileSync("src/components/SiteFooter.tsx", "utf8");
    const block = readFileSync("src/components/SuedeNetwork.tsx", "utf8");
    expect(footer).toContain("<SuedeNetwork />");
    expect(footer).toContain('href="/notes"');
    for (const href of ["https://suedeai.agency/", "https://suedeai.ai/", "https://suedeai.ai/founder", "https://jasoncolapietro.com/", "https://jupitersocialfl.com/"]) {
      expect(block).toContain(href);
    }
  });
});
