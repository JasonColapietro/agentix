import { describe, expect, it } from "vitest";
import { compactNum, compactUsd, num, shortAddr, shortDay, signedPct, timeAgo, usd, usdPrecise } from "@/lib/format";

describe("format helpers", () => {
  it("formats money", () => {
    expect(usd(1234.5)).toBe("$1,234.50");
    expect(usdPrecise(0.25)).toBe("$0.25"); // 2–4 decimals: clean prices, precise sub-cent nets
    expect(usdPrecise(0.2375)).toBe("$0.2375");
    expect(compactUsd(1200)).toBe("$1.2k");
    expect(compactUsd(3_400_000)).toBe("$3.4M");
    expect(compactUsd(999)).toBe("$999.00");
  });

  it("formats integers", () => {
    expect(num(12345)).toBe("12,345");
    expect(compactNum(12_500)).toBe("12.5k");
  });

  it("formats signed percentages with a true minus", () => {
    expect(signedPct(0.123)).toBe("+12.3%");
    expect(signedPct(-0.04)).toBe("−4.0%");
    expect(signedPct(0)).toBe("0.0%");
    expect(signedPct(Infinity)).toBe("—");
  });

  it("truncates EVM addresses", () => {
    expect(shortAddr("0xA9e4F1b2C3d4E5F6a7B8c9D0e1F2a3B4c5D6E7f8")).toBe("0xA9e4…E7f8");
    expect(shortAddr("short")).toBe("short");
  });

  it("renders relative time against a fixed now", () => {
    const now = new Date("2026-06-30T12:00:00.000Z");
    expect(timeAgo(new Date("2026-06-30T10:00:00.000Z").toISOString(), now)).toBe("2h ago");
    expect(timeAgo(new Date("2026-06-28T12:00:00.000Z").toISOString(), now)).toBe("2d ago");
    expect(timeAgo(null, now)).toBe("never");
  });

  it("renders short day labels in UTC", () => {
    expect(shortDay("2026-06-30")).toBe("Jun 30");
  });
});
