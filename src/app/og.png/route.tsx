import { ImageResponse } from "next/og";

/**
 * Agentix's own 1200x630 social card, served at /og.png and prerendered at
 * build time. Every page's og:image and twitter:image point here through
 * OG_IMAGE_URL in src/lib/site.ts. It replaces the shared Suede app card, which
 * showed a different product (music generation) under the old Suede Labs name.
 *
 * The figures on the card are labels, not numbers: no earnings, call counts or
 * customer claims appear here, so nothing on it can drift from the site.
 */
export const dynamic = "force-static";

const SIZE = { width: 1200, height: 630 } as const;

export function GET(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#ffffff",
          color: "#111317",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#4f46e5",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            A
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>Agentix</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            Agent portfolio earnings tracker
          </div>
          <div style={{ fontSize: 34, color: "#6b7280", lineHeight: 1.3 }}>
            USDC earned on Base, calls, grades and trend for every x402 agent you launch.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid #e6e8ef",
            paddingTop: 28,
            fontSize: 28,
          }}
        >
          <div style={{ display: "flex", gap: 16 }}>
            {["Earnings", "Calls", "Grades", "Goals"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  padding: "8px 20px",
                  borderRadius: 999,
                  background: "#f7f8fc",
                  border: "2px solid #e6e8ef",
                  color: "#4338ca",
                }}
              >
                {label}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", color: "#047857", fontWeight: 700 }}>
            agentix.suedeai.ai
          </div>
        </div>
      </div>
    ),
    SIZE,
  );
}
