import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  variable: "--font-instrument-serif",
  subsets: ["latin"],
});

const SITE_NAME = "Agentix";
const DEFAULT_TITLE = "Agentix — watch your agents earn";
const DEFAULT_DESCRIPTION =
  "The portfolio tracker for the x402 agents you've launched. Total USDC earned on Base, calls, per-agent performance, status, and trend — one screen.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "x402 agent earnings",
    "agent portfolio tracker",
    "USDC on Base",
    "AI agents that earn",
    "pay-per-call API revenue",
    "agent commerce dashboard",
    "Suede Agent Studio",
    "Suede Labs AI",
    "Jason Colapietro",
  ],
  authors: [{ name: "Jason Colapietro", url: "https://github.com/JasonColapietro" }],
  creator: "Jason Colapietro",
  publisher: "Suede Labs AI",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    site: "@AISUEDE",
    creator: "@johnnysuede",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
};

/**
 * Minimal entity graph. The Organization + Person @ids MIRROR the canonical
 * nodes published across the Suede ecosystem (suedeai.ai `/#organization`,
 * `/founder#person`) so Agentix folds into the same Suede Labs AI / Jason
 * Colapietro entities rather than minting new ones. Keep in lockstep with the
 * builder's layout.tsx graph.
 */
const SUEDE_ORG_ID = "https://suedeai.ai/#organization";
const JASON_PERSON_ID = "https://suedeai.ai/founder#person";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: SITE_URL,
      description: DEFAULT_DESCRIPTION,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      author: { "@id": JASON_PERSON_ID },
      publisher: { "@id": SUEDE_ORG_ID },
      isRelatedTo: { "@id": "https://agents.suedeai.ai/#app" },
    },
    {
      "@type": "Organization",
      "@id": SUEDE_ORG_ID,
      name: "Suede Labs AI",
      url: "https://suedeai.ai",
      founder: { "@id": JASON_PERSON_ID },
    },
    {
      "@type": "Person",
      "@id": JASON_PERSON_ID,
      name: "Jason Colapietro",
      url: "https://suedeai.ai/founder",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
      >
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
