/**
 * Hand-written, per-agent example content for the illustrative /agent/* pages.
 * Everything here describes what an agent of this kind WOULD do. Request and
 * response bodies are sample payloads, not captured traffic.
 */
export interface AgentProfileContent {
  summary: string;
  inputs: string[];
  outputs: string[];
  exampleRequest: string;
  exampleResponse: string;
  earningsNote: string;
  buildTip: string;
}

export const AGENT_PROFILES: Record<string, AgentProfileContent> = {
  "web-scraper-pro": {
    summary: "Fetches a public web page, renders it, and returns clean structured text and links so a calling agent never has to run a headless browser itself.",
    inputs: ["url: the page to fetch", "selectors (optional): CSS selectors to extract", "render_js: whether to execute client-side scripts"],
    outputs: ["title and main text", "list of outbound links", "extracted fields keyed by selector", "HTTP status and fetch time"],
    exampleRequest: '{ "url": "https://example.com/pricing", "selectors": { "plans": ".plan-card h3" }, "render_js": true }',
    exampleResponse: '{ "title": "Pricing", "plans": ["Free", "Team", "Scale"], "links": 14, "status": 200 }',
    earningsNote: "Call volume is the biggest driver here because each fetch is cheap. Watch the error rate: blocked or timed-out fetches are calls you did not get paid for.",
    buildTip: "Start with one narrow job, such as extracting a single field set, and add JavaScript rendering only once plain fetches stop being enough.",
  },
  "pdf-extractor": {
    summary: "Turns a PDF into text, tables, and metadata, preserving reading order so downstream agents can summarize or query the document.",
    inputs: ["file_url: a link to the PDF", "pages (optional): a page range", "tables: whether to return tables as rows"],
    outputs: ["plain text by page", "tables as arrays of rows", "document metadata such as page count and title"],
    exampleRequest: '{ "file_url": "https://example.com/report.pdf", "pages": "1-3", "tables": true }',
    exampleResponse: '{ "pages": 3, "text": ["..."], "tables": [[["Region","Q1"],["EMEA","1.2M"]]], "title": "Annual report" }',
    earningsNote: "Each call is heavier than a simple lookup, so a higher per-call price is normal. Tracking error rate matters because scanned or encrypted PDFs fail more often.",
    buildTip: "Decide up front how to treat scanned pages; pairing this agent with an OCR agent is a common way to cover them.",
  },
  "code-reviewer": {
    summary: "Reads a code diff and returns review comments on bugs, risky patterns, and readability, so another agent can gate a merge on the result.",
    inputs: ["diff: a unified diff", "language (optional): a hint for syntax rules", "focus: bugs, security, or style"],
    outputs: ["list of findings with file and line", "severity per finding", "a short overall verdict"],
    exampleRequest: '{ "diff": "--- a/app.js\\n+++ b/app.js\\n@@ ...", "language": "javascript", "focus": "security" }',
    exampleResponse: '{ "verdict": "changes_requested", "findings": [{ "file": "app.js", "line": 42, "severity": "high", "note": "Unsanitized input" }] }',
    earningsNote: "Calls are fewer but priced higher, so one extra day of traffic moves revenue noticeably. A ramping 7-day trend is the signal to watch.",
    buildTip: "Constrain the output format to findings with line numbers; callers can act on that far more reliably than on free-form prose.",
  },
  "sentiment-engine": {
    summary: "Scores short texts such as reviews, tickets, and posts as positive, neutral, or negative, with a confidence value.",
    inputs: ["text: one string, or a batch of strings", "language (optional)", "granularity: document or sentence"],
    outputs: ["label per text", "score from -1 to 1", "confidence"],
    exampleRequest: '{ "text": ["Setup was painless.", "Support never replied."], "granularity": "document" }',
    exampleResponse: '{ "results": [{ "label": "positive", "score": 0.82 }, { "label": "negative", "score": -0.74 }] }',
    earningsNote: "This is a high-volume, low-price agent, so revenue comes from steady call counts rather than big tickets. Small error-rate changes show up quickly.",
    buildTip: "Batch support lowers cost per text for callers and keeps your call counts honest, since one batch is one paid call.",
  },
  "geocode-api": {
    summary: "Converts a free-text address or place name into coordinates, and coordinates back into a normalized address.",
    inputs: ["query: an address or place name", "reverse (optional): latitude and longitude", "country (optional): a bias hint"],
    outputs: ["latitude and longitude", "normalized address parts", "match confidence"],
    exampleRequest: '{ "query": "1600 Pennsylvania Ave NW, Washington DC", "country": "US" }',
    exampleResponse: '{ "lat": 38.8977, "lng": -77.0365, "confidence": 0.97, "city": "Washington" }',
    earningsNote: "The cheapest agent in the example set, so profit depends on very high call counts. Latency and uptime matter more than anything else.",
    buildTip: "Cache repeat lookups on your side; identical addresses are common and cost you nothing to answer twice.",
  },
  "translation-bot": {
    summary: "Translates text between languages while preserving formatting such as line breaks and inline markup.",
    inputs: ["text: the source string", "source (optional): language code, otherwise detected", "target: language code"],
    outputs: ["translated text", "detected source language", "character count billed"],
    exampleRequest: '{ "text": "Your order has shipped.", "target": "es" }',
    exampleResponse: '{ "text": "Su pedido ha sido enviado.", "detected": "en" }',
    earningsNote: "Price per call is flat, so very long texts are worth less per character. Consider whether your profile should cap input length.",
    buildTip: "State a maximum input size clearly in the listing so callers are not surprised by a rejected request.",
  },
  "market-data-feed": {
    summary: "Returns current and recent price data for a ticker or trading pair, intended as a data source for other agents rather than as advice.",
    inputs: ["symbol: ticker or pair", "interval: tick, minute, or day", "limit: number of points"],
    outputs: ["timestamped price points", "volume", "source and delay disclosure"],
    exampleRequest: '{ "symbol": "ETH-USD", "interval": "minute", "limit": 3 }',
    exampleResponse: '{ "symbol": "ETH-USD", "points": [{ "t": "12:00", "price": 3000.1 }, { "t": "12:01", "price": 3000.4 }] }',
    earningsNote: "Demand tends to follow market activity, so volatility in the call chart is expected. The sample numbers here are illustrative only.",
    buildTip: "Say plainly how stale the data can be. Callers building on a feed care about freshness more than anything else.",
  },
  "ocr-vision": {
    summary: "Reads text out of images such as receipts, screenshots, and scans, returning the text with positions.",
    inputs: ["image_url: a link to the image", "language hints (optional)", "return_boxes: include bounding boxes"],
    outputs: ["recognized text", "bounding boxes per line", "confidence per line"],
    exampleRequest: '{ "image_url": "https://example.com/receipt.jpg", "return_boxes": true }',
    exampleResponse: '{ "lines": [{ "text": "TOTAL 18.40", "box": [12, 220, 180, 244], "confidence": 0.95 }] }',
    earningsNote: "A newer agent in the example set, so its trend is still ramping. Image quality drives error rate, which is worth tracking from day one.",
    buildTip: "Document supported image sizes and formats; most failed calls on an OCR agent come from oversized or unusual files.",
  },
  "email-parser": {
    summary: "Parses a raw email into sender, subject, body text, attachments, and detected intent such as invoice or meeting request.",
    inputs: ["raw: the full RFC 822 message", "extract_links: include links found in the body", "intent: whether to classify the message"],
    outputs: ["structured headers", "clean body text", "attachment names and types", "intent label"],
    exampleRequest: '{ "raw": "From: a@example.com\\nSubject: Invoice 204\\n\\nPlease find attached...", "intent": true }',
    exampleResponse: '{ "from": "a@example.com", "subject": "Invoice 204", "attachments": ["inv204.pdf"], "intent": "invoice" }',
    earningsNote: "Steady mid-volume traffic from workflow agents. Because inputs can be messy, expect a small but constant error rate.",
    buildTip: "Never log message bodies in your own systems unless the caller asks you to; say so in the listing.",
  },
  "kyc-verifier": {
    summary: "Checks submitted identity details against supplied document data and returns a pass, review, or fail result for a compliance workflow.",
    inputs: ["name and date of birth", "document_type and document_number", "country"],
    outputs: ["result: pass, review, or fail", "reason codes", "check timestamp"],
    exampleRequest: '{ "name": "Sample Person", "dob": "1990-01-01", "document_type": "passport", "country": "GB" }',
    exampleResponse: '{ "result": "review", "reasons": ["document_expiry_unclear"], "checked_at": "2026-06-30T12:00:00Z" }',
    earningsNote: "The highest per-call price in the set because each check carries more risk and cost. This profile is shown as degraded, which illustrates how a rising error rate appears in the health panel.",
    buildTip: "Compliance agents need clear data-handling statements. Describe what you store and for how long before anything else.",
  },
  "weather-oracle": {
    summary: "Returns current conditions and a short forecast for a location, in a compact format that other agents can use directly.",
    inputs: ["location: place name or coordinates", "units: metric or imperial", "hours: forecast horizon"],
    outputs: ["current temperature and conditions", "hourly forecast", "precipitation probability"],
    exampleRequest: '{ "location": "Lisbon", "units": "metric", "hours": 6 }',
    exampleResponse: '{ "now": { "temp": 21, "sky": "clear" }, "hourly": [{ "h": 1, "temp": 21, "rain": 0.02 }] }',
    earningsNote: "A low-price, high-volume agent with a stable trend, a good example of what a flat revenue line looks like.",
    buildTip: "Return a small, fixed schema. Weather agents get called by other agents, which prefer predictable fields.",
  },
  "stock-quote": {
    summary: "Returns the latest quote for a listed stock symbol, including open, high, low, and close for the day.",
    inputs: ["symbol: a ticker", "exchange (optional)", "fields: which quote fields to return"],
    outputs: ["last price", "day open, high, low, and close", "quote time and delay disclosure"],
    exampleRequest: '{ "symbol": "AAPL", "fields": ["last", "high", "low"] }',
    exampleResponse: '{ "symbol": "AAPL", "last": 190.1, "high": 191.0, "low": 188.7, "delayed": true }',
    earningsNote: "This profile is marked paused, so its chart shows calls stopping on a given date. It is a useful example of how a pause looks in the trend and 7-day delta.",
    buildTip: "If you pause an agent, say so in its listing so that callers can route elsewhere instead of failing.",
  },
  "image-moderation": {
    summary: "Screens an image for categories such as adult content, violence, or spam, returning a score per category.",
    inputs: ["image_url", "categories (optional): which checks to run", "threshold: the score that counts as flagged"],
    outputs: ["score per category", "overall flagged boolean", "policy version used"],
    exampleRequest: '{ "image_url": "https://example.com/upload.png", "threshold": 0.8 }',
    exampleResponse: '{ "flagged": false, "scores": { "adult": 0.02, "violence": 0.01, "spam": 0.11 }, "policy": "v1" }',
    earningsNote: "Traffic here follows upload volume on the caller's side, so growth comes in steps when a new customer connects.",
    buildTip: "Let callers set their own threshold. A fixed cutoff will be too strict for some and too loose for others.",
  },
  "seo-auditor": {
    summary: "Audits a single web page for title, description, headings, links, and basic technical issues, then lists fixes in priority order.",
    inputs: ["url: the page to audit", "keyword (optional): the target phrase", "depth: page only or page plus linked pages"],
    outputs: ["issue list with priority", "title and description checks", "link and heading summary"],
    exampleRequest: '{ "url": "https://example.com/blog/post", "keyword": "x402 agents" }',
    exampleResponse: '{ "issues": [{ "priority": "high", "note": "Title longer than 60 characters" }], "headings": { "h1": 1, "h2": 5 } }',
    earningsNote: "This profile is marked down, so it shows what a sudden stop in calls looks like. A cliff in the chart and a high error rate point to an endpoint outage.",
    buildTip: "Audit one page per call. It keeps latency predictable and the price per call easy to explain.",
  },
  summarizer: {
    summary: "Condenses long text into a short summary with optional bullet points, aimed at agents that need to digest documents quickly.",
    inputs: ["text: the content to summarize", "length: short, medium, or long", "format: paragraph or bullets"],
    outputs: ["summary text", "key points", "compression ratio"],
    exampleRequest: '{ "text": "Long article text...", "length": "short", "format": "bullets" }',
    exampleResponse: '{ "summary": ["Point one.", "Point two."], "ratio": 0.08 }',
    earningsNote: "A growing agent in the example set. Its ramping trend shows how revenue and calls rise together when a useful agent gets adopted.",
    buildTip: "Report the compression ratio. It helps callers judge whether the summary kept enough of the source.",
  },
  "sports-odds": {
    summary: "Returns published odds and match schedule data for a sport and date, as reference data and not as betting advice.",
    inputs: ["sport", "date", "league (optional)"],
    outputs: ["fixtures with start times", "odds by market", "data source and update time"],
    exampleRequest: '{ "sport": "football", "date": "2026-06-30", "league": "example-league" }',
    exampleResponse: '{ "fixtures": [{ "home": "Team A", "away": "Team B", "odds": { "home": 2.1, "draw": 3.3, "away": 3.4 } }] }',
    earningsNote: "Traffic bunches around match days, so a spiky call chart is normal. Compare weeks, not single days.",
    buildTip: "Mark the update time on every response. Stale odds are the main complaint callers have about this kind of agent.",
  },
  "forecast-engine": {
    summary: "Takes a time series and returns a forecast with an uncertainty range, intended for agents that plan inventory or capacity.",
    inputs: ["series: dated values", "horizon: number of periods to predict", "frequency: day, week, or month"],
    outputs: ["forecast values", "lower and upper bounds", "model used"],
    exampleRequest: '{ "series": [{ "d": "2026-05-01", "v": 120 }, { "d": "2026-05-02", "v": 131 }], "horizon": 7 }',
    exampleResponse: '{ "forecast": [{ "d": "2026-05-03", "v": 128, "low": 110, "high": 146 }], "model": "seasonal" }',
    earningsNote: "This profile is a draft with no calls yet, which is how every agent starts. Its flat zero chart shows what the tracker displays before launch.",
    buildTip: "Always return the uncertainty range with the forecast. A single number without a range invites over-trust.",
  },
  "address-validator": {
    summary: "Checks a postal address, corrects common mistakes, and returns it in a standard format with a deliverability flag.",
    inputs: ["address lines", "country", "strict: whether to reject partial matches"],
    outputs: ["standardized address", "deliverable boolean", "corrections made"],
    exampleRequest: '{ "lines": ["12 high st", "bristol"], "country": "GB" }',
    exampleResponse: '{ "address": "12 High Street, Bristol", "deliverable": true, "corrections": ["expanded st"] }',
    earningsNote: "Reliable mid-volume traffic from checkout and onboarding flows. Revenue changes slowly, so a sudden drop usually means an outage rather than demand.",
    buildTip: "List the countries you support. Address rules vary a lot and callers need to know up front.",
  },
};
