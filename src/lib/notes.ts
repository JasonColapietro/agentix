/**
 * Notes: the long-form article section at /notes.
 *
 * Each article is plain data so the page (src/app/notes/[slug]/page.tsx), the
 * sitemap, llms-full.txt and the tests all read the same source. Inline links
 * use Markdown syntax, [text](url), and render as anchors on the page.
 *
 * Every claim about Jason Colapietro or Suede AI must be one the proof page at
 * https://seo.suedeai.ai/evidence (or the linked source) supports, with the
 * proof link inline. tests/notes.test.ts guards length, naming and schema.
 */
import { SITE_URL } from "@/lib/site";

export const NOTES_PUBLISHED = "2026-11-14";
/** Last content change to the notes; feeds JSON-LD dateModified. */
export const NOTES_MODIFIED = "2026-11-15";

export type NoteBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export interface Note {
  slug: string;
  /** datePublished, ISO date; defaults to NOTES_PUBLISHED. */
  published?: string;
  /** Visible H1 and BlogPosting headline. */
  title: string;
  /** Full <title>, 50 to 60 characters, set as an absolute title. */
  metaTitle: string;
  /** Meta description, 120 to 160 characters. */
  description: string;
  /** One-line summary for the index page. */
  summary: string;
  keywords: string[];
  blocks: NoteBlock[];
}

/** Proof links reused across articles. */
export const PROOF = {
  prs: "https://github.com/search?q=is%3Apr+author%3AJasonColapietro+is%3Amerged+-user%3AJasonColapietro+-user%3ASuede-AI&type=pullrequests",
  training: "https://seo.suedeai.ai/evidence#training-credentials",
  claudeStartups: "https://seo.suedeai.ai/evidence#claude-for-startups",
  googleCloud: "https://seo.suedeai.ai/evidence#google-cloud",
  webGuide: "https://seo.suedeai.ai/evidence#google-web-guide",
  evidence: "https://seo.suedeai.ai/evidence",
  manifest: "https://themanifest.com/artificial-intelligence/consulting/deployment/companies/florida",
  recognition: "https://suedeai.agency/company/recognition",
  clutchProfile: "https://clutch.co/profile/suede-ai-seo",
  clutchFlorida: "https://clutch.co/consulting/ai/florida",
  clutchUs: "https://clutch.co/us/consulting/ai",
  apps: "https://apps.apple.com/us/developer/jason-colapietro/id1895958699",
  claudeCodeBible: "https://www.amazon.com/dp/B0HHTMJWB4",
  codexInProduction: "https://www.amazon.com/dp/B0HHTF3LG1",
  proofAsInfrastructure: "https://www.amazon.com/dp/B0GMB2VLXQ",
  press: "https://suedeai.ai/press",
  techbullionApps: "https://techbullion.com/jason-colapietros-suede-labs-ai-launches-ios-apps/",
} as const;

/** Clutch ranking sentence, kept separate from The Manifest claim. */
export const CLUTCH_CLAIM =
  "Suede AI ranks among [Clutch](" +
  PROOF.clutchProfile +
  ")'s [Top 30 AI Consultants in Florida](" +
  PROOF.clutchFlorida +
  ") and [Top 50 AI Consultants nationwide](" +
  PROOF.clutchUs +
  ") (November 2026).";

export const NOTES: Note[] = [
  {
    slug: "grade-an-ai-agent-before-you-deploy",
    title: "How to grade an AI agent before you deploy it in your business",
    metaTitle: "How to Grade an AI Agent Before You Deploy It | Agentix",
    description:
      "A pre-launch grading routine for AI agents from Jason Colapietro of Suede AI in West Palm Beach: test sets, pass lines and the five dimensions Agentix scores.",
    summary:
      "The pre-launch routine Suede AI runs before an agent touches a real customer, mapped to the five dimensions Agentix grades after launch.",
    keywords: [
      "how to grade an ai agent",
      "ai agent evaluation checklist",
      "ai agent testing before deployment",
      "ai agent grader",
      "west palm beach ai agent development",
      "Jason Colapietro",
    ],
    blocks: [
      {
        type: "p",
        text: "Most AI agents that fail inside a business do not fail during the demo. They pass the demo, go live, and then start giving confident wrong answers on a busy afternoon when nobody is reading the transcripts.",
      },
      {
        type: "p",
        text: "Jason Colapietro built Agentix, the agent grader and earnings tracker from Suede AI, because that pattern shows up in almost every agent project: a team tests an agent once, then trusts it forever. This is the grading routine the Suede AI team in West Palm Beach, Florida runs before an agent is allowed near a customer, and how the same five dimensions Agentix scores keep working after launch.",
      },
      { type: "h2", text: "Write the job description before the prompt" },
      {
        type: "p",
        text: "You cannot grade an agent against a goal nobody wrote down. Before any testing, write one paragraph that names the inputs the agent accepts, the output it must return, what counts as done, and the two or three things it must never do. A quote-intake agent for a Jupiter pool service, for example, might be allowed to collect an address and photos but never allowed to promise a price.",
      },
      {
        type: "p",
        text: "If you cannot write that paragraph, stop. The agent is not ready to grade, and it is certainly not ready to deploy. At Suede, this one paragraph becomes the rubric every later test is scored against; Jason Colapietro has used the same habit since the Suede Labs days, before the company took the Suede AI name.",
      },
      { type: "h2", text: "The five dimensions Agentix grades, and their pre-launch versions" },
      {
        type: "p",
        text: "Agentix scores every tracked agent from S to F across five weighted dimensions: revenue (30%), growth (20%), consistency (15%), reliability (20%) and activity (15%). A score of 90 or above is an S, 80 is an A, 68 is a B and anything under 40 is an F. Those are live signals. Before launch you grade a proxy for each one:",
      },
      {
        type: "ul",
        items: [
          "Reliability: run 50 to 100 realistic inputs, including malformed and off-topic ones, and count failures. In Agentix a 20% error rate drives the reliability score to zero, and 5% already costs a quarter of it. Treat anything above 5% in testing as a launch blocker.",
          "Consistency: send the same input five times. If the answers disagree on facts (hours, service area, price ranges), the agent is guessing. Wording can vary; facts cannot.",
          "Activity: decide what alive means for this agent and how you will know within a day if it stops. Agentix decays the activity score after one, three, seven and fourteen days without a paid call, so a quiet agent shows up fast.",
          "Revenue and growth: put a number on the value of one good call, in dollars earned or minutes saved, and estimate volume. If the number is tiny, a perfect agent is still a poor investment.",
        ],
      },
      {
        type: "p",
        text: "Agentix also caps the grade by status: a draft agent cannot score above 38, an agent whose endpoint is down cannot score above 55, and a paused agent cannot score above 62. Copy that rule in testing. If the agent cannot reach a tool it depends on, such as a calendar or a pricing sheet, its grade is capped no matter how good its answers sounded.",
      },
      { type: "h2", text: "Build the test set from real conversations" },
      {
        type: "p",
        text: "Synthetic test questions are too polite. Pull 30 real questions from your inbox, call notes and website chat, then add five adversarial ones: a request outside your service area, a request for a discount, a question in Spanish, a customer who is angry, and a question with a missing detail. For a Palm Beach County business, include at least one service-area edge case, such as a caller in Tequesta asking whether you cover Juno Beach and Jupiter.",
      },
      {
        type: "p",
        text: "Keep this set in a spreadsheet with the expected answer in one column and the agent's answer in the next. Run it again every time the prompt, the model or a tool changes. That spreadsheet is worth more than any single test run.",
      },
      { type: "h2", text: "Grade the failure, not only the answer" },
      {
        type: "p",
        text: "An agent that says it is not sure and hands the customer to a person has passed. An agent that invents a confident answer has failed, even when the invented answer happens to be right. Score three outcomes separately: correct, safely escalated and wrong. A launch-ready agent has close to zero wrong answers and an escalation rate the team can actually staff.",
      },
      { type: "h2", text: "Set the pass line before you look at results" },
      {
        type: "p",
        text: "Decide the threshold in advance and write it next to the job description. Jason Colapietro's rule is blunt: the pass line is set by the person who will answer the angry phone call, not by the person who built the agent. A reasonable starting line is a B or better on the Agentix scale (68 and up) for a limited launch, with no wrong answers on the five adversarial questions. If you set the line after seeing the results, you will find a way to pass.",
      },
      { type: "h2", text: "Where this grading habit comes from" },
      {
        type: "p",
        text: "Jason Colapietro learned to distrust untested code the slow way. He has had [54 pull requests merged across 46 open-source repositories he does not maintain](" +
          PROOF.prs +
          "), including Jest, Adobe React Spectrum, Backstage and the Polkadot SDK. Maintainers of projects like those merge on evidence: tests, reproductions and clear failure cases. The same discipline runs through two of his five books on Amazon, [The Claude Code Bible](" +
          PROOF.claudeCodeBible +
          ") and [Codex in Production](" +
          PROOF.codexInProduction +
          ").",
      },
      {
        type: "p",
        text: "It is also why Suede AI keeps receipts. Suede AI is a member of [Claude for Startups, Anthropic's startup program](" +
          PROOF.claudeStartups +
          "), and the claims Suede makes about itself are listed with proof on the [Suede AI evidence page](" +
          PROOF.evidence +
          "). " +
          CLUTCH_CLAIM +
          " An agent grade should work the same way: a number you can trace back to the calls that produced it.",
      },
      { type: "h2", text: "After launch, keep grading" },
      {
        type: "p",
        text: "Pre-launch testing tells you the agent can do the job. Only live data tells you it keeps doing it. In [Agentix](/) you register the agent, log its daily calls, errors and earnings, and the grade updates from your own entries, saved in your browser. A grade that slips from A to C over two weeks is the early warning that a prompt drifted or a tool broke. The [Code Reviewer example profile](/agent/agt_code_reviewer) shows what the breakdown looks like for one agent.",
      },
      {
        type: "p",
        text: "If you want a second opinion on whether your agent is findable by customers at all, the [Suede Scan AI readiness check](https://optimize.suedeai.ai/) grades the site the agent lives on, and [Suede AI's developer docs](https://docs.suedeai.ai/) cover the tool and MCP side.",
      },
      { type: "h2", text: "Your next step" },
      {
        type: "p",
        text: "Write the one-paragraph job description for the agent you are considering this week, then build the 35-question test set from real conversations. If you run a business in West Palm Beach, Jupiter or anywhere in Palm Beach County and want Suede AI to grade the agent and the website around it, start with the [free Suede AI assessment](https://suedeai.agency/assessment). To see who you would be working with, read [Jason Colapietro's founder page](https://suedeai.ai/founder).",
      },
    ],
  },
  {
    slug: "agent-quality-lessons-microsoft-learn-claude-academy",
    title:
      "What 17 Microsoft Learn achievements and 9 Claude Academy badges taught Jason Colapietro about agent quality",
    metaTitle: "Agent Quality Lessons From 26 AI Credentials | Agentix",
    description:
      "Jason Colapietro on what 17 Microsoft Learn achievements and nine Claude Academy badges changed about how Suede AI builds and grades AI agents in Florida.",
    summary:
      "Five practical lessons from Jason Colapietro's Microsoft Learn and Claude Academy training, and how each one shows up in the Agentix grade.",
    keywords: [
      "ai agent quality",
      "microsoft learn ai agents",
      "claude academy badges",
      "model context protocol",
      "Jason Colapietro",
      "florida ai developer",
    ],
    blocks: [
      {
        type: "p",
        text: "Credentials do not make anyone good at building agents. The useful ones do something narrower: they force you through the failure cases you would otherwise skip, and that is what Jason Colapietro wanted when he worked through 17 Microsoft Learn training achievements and nine Claude Academy badges.",
      },
      {
        type: "p",
        text: "The full set is public. The [Suede AI training gallery](" +
          PROOF.training +
          ") lists 21 earned individual course credentials across eight providers, including nine Claude Academy and Anthropic course badges such as Claude Code 101, Building with the Claude API and Model Context Protocol: Advanced topics, plus 17 Microsoft Learn training achievements: 15 module badges and two learning-path trophies, Develop AI agents on Azure and Develop generative AI apps in Azure. Here is what that work actually changed about how Suede AI builds and grades agents.",
      },
      { type: "h2", text: "Lesson 1: An agent is a system, not a prompt" },
      {
        type: "p",
        text: "The Azure learning paths treat an agent as a model plus instructions plus tools plus the data it is grounded in, deployed into an environment that can fail. That framing matters for grading. If you only grade the model's answers, you miss the most common failures, which happen at the edges: a tool that times out, a document that went stale, a permission that was never granted.",
      },
      {
        type: "p",
        text: "Jason Colapietro carried that into Agentix directly. The grade is not a score of how clever the agent sounds. Reliability, worth 20% of the grade, is the inverse of the error rate across every logged call, and an agent whose endpoint is down is capped at 55 out of 100 regardless of anything else.",
      },
      { type: "h2", text: "Lesson 2: Tool contracts decide quality" },
      {
        type: "p",
        text: "The Model Context Protocol material is mostly about interfaces: what a tool promises, what it returns and how an agent learns what it can call. The lesson that stuck with Jason is that a vague tool description produces a vague agent. When a tool's contract is precise (named inputs, typed outputs, documented errors), the agent's behavior becomes testable, because you can check every call against the contract.",
      },
      {
        type: "p",
        text: "At Suede, the working rule is to write a tool's contract before its code, and to review that contract before anyone grades the agent. The [Suede developer docs](https://docs.suedeai.ai/) follow the same rule for the MCP surfaces Suede AI publishes.",
      },
      { type: "h2", text: "Lesson 3: Measure in production, not in the playground" },
      {
        type: "p",
        text: "Building with the Claude API is a course about the parts of a real integration that a chat window hides: rate limits, retries, streaming, token budgets and cost per call. An agent that is excellent in a playground can still be a bad product if every answer costs more than it earns or arrives after the customer has left.",
      },
      {
        type: "p",
        text: "That is why Agentix tracks earnings and calls next to the grade. Revenue is 30% of the score, log-scaled against the portfolio's top earner, and growth is another 20%. An agent's quality includes whether anyone is paying for it.",
      },
      { type: "h2", text: "Lesson 4: Consistency beats brilliance" },
      {
        type: "p",
        text: "The theme Jason took from both providers is that an agent which is right 95% of the time in a predictable way is more useful than one that is occasionally brilliant and occasionally wrong. Customers forgive a limited agent. They do not forgive an unpredictable one.",
      },
      {
        type: "p",
        text: "Agentix scores consistency from the variation in an agent's daily results over the last 30 days. Steady output scores high; spiky output scores low, even when the average looks fine.",
      },
      { type: "h2", text: "Lesson 5: An agent nobody can find does not get graded at all" },
      {
        type: "p",
        text: "The other half of Jason Colapietro's training is search. Five Semrush Academy certificates, including Local SEO Essentials and AI Search Operating System, and the HubSpot AEO Fundamentals certification, are listed in the [same gallery](" +
          PROOF.training +
          "). For a service business in West Palm Beach or Jupiter, the agent on the website only matters if customers reach the website, and AI answers are now one of the routes customers take to get there.",
      },
      {
        type: "p",
        text: "That is the work [Suede AI's West Palm Beach SEO, GEO and web practice](https://suedeai.agency/) does every day, from [technical SEO](https://suedeai.agency/services/technical-seo) to [AI visibility](https://suedeai.agency/services/ai-visibility).",
      },
      { type: "h2", text: "Credentials are the floor; shipped work is the proof" },
      {
        type: "p",
        text: "Training only counts if it shows up in shipped work. Jason Colapietro has [nine iOS apps live under his own Apple developer account](" +
          PROOF.apps +
          "), and [54 merged pull requests across 46 open-source repositories he does not maintain](" +
          PROOF.prs +
          "), including Jest, Backstage and the Polkadot SDK. He has also written five books on Amazon, including [Proof as Infrastructure](" +
          PROOF.proofAsInfrastructure +
          ").",
      },
      {
        type: "p",
        text: "Outside recognition followed the work. On October 31, 2026, Suede AI SEO ranked #1 among Palm Beach County-based companies listed in [The Manifest's Florida AI Deployment directory](" +
          PROOF.manifest +
          ") and placed in the top 25 statewide, as recorded on the [Suede AI recognition page](" +
          PROOF.recognition +
          "). " +
          CLUTCH_CLAIM +
          " Separately, Google's Web Guide answered a search for \"Suede labs ai review\" by describing Suede Labs AI as \"highly rated by users, earning a 5/5 rating from verified reviews\"; that wording is Google's, and the capture is on the [evidence page](" +
          PROOF.webGuide +
          ").",
      },
      { type: "h2", text: "Your next step" },
      {
        type: "p",
        text: "Pick one lesson and apply it to an agent you already run: write the tool contract, log a week of real calls in [Agentix](/), or measure consistency across five identical requests. If you would rather have Suede AI review the agent and the website it lives on, book the [Suede AI assessment](https://suedeai.agency/assessment), and see the full training record on [Jason Colapietro's founder page](https://suedeai.ai/founder).",
      },
    ],
  },
  {
    slug: "ai-agents-west-palm-beach-jupiter-service-businesses",
    title: "AI agents for West Palm Beach and Jupiter service businesses: where they help and where they fail",
    metaTitle: "AI Agents for West Palm Beach and Jupiter Businesses",
    description:
      "Where AI agents help Palm Beach County service businesses, where they fail, and how Suede AI and Jason Colapietro grade them before customers ever see one.",
    summary:
      "An honest map of the jobs AI agents handle well for local service businesses in Palm Beach County, the jobs they get wrong, and how to grade the difference.",
    keywords: [
      "ai agents west palm beach",
      "ai agents jupiter fl",
      "ai for service businesses palm beach county",
      "ai receptionist florida",
      "ai seo west palm beach",
      "Jason Colapietro",
    ],
    blocks: [
      {
        type: "p",
        text: "A storm rolls through Jupiter on a summer evening and a homeowner fills out a roof-leak form at 9:40 p.m. An AI agent can answer that lead in seconds, collect photos and book the first inspection slot; a bad one can also promise a same-night repair the crew cannot make.",
      },
      {
        type: "p",
        text: "Both outcomes are common in Palm Beach County right now. Jason Colapietro, who founded Suede AI in West Palm Beach in 2024, built Agentix to grade agents on what they actually do after launch. This is the honest version of where agents earn their keep for local service businesses and where they should not be trusted yet.",
      },
      { type: "h2", text: "Where agents help a local service business" },
      {
        type: "ul",
        items: [
          "After-hours intake. Plenty of service requests arrive after the office has closed. An agent that captures the name, address, problem and photos, then hands a clean summary to the morning dispatcher, saves real money without making any decisions on its own.",
          "Service-area answers. \"Do you cover Palm Beach Gardens, Juno Beach or Tequesta?\" is a question an agent answers perfectly, every time, if the service area is written down once.",
          "Quote preparation, not quoting. An agent can gather pool dimensions, roof square footage or unit counts so the estimator starts with complete information. The price itself stays human.",
          "Follow-up and reminders. Appointment confirmations, maintenance reminders before hurricane season and review requests after a finished job are repetitive and low risk.",
          "Internal search. Staff asking \"what is our warranty on a water heater install?\" get a faster answer from an agent grounded in your own documents than from a binder.",
        ],
      },
      { type: "h2", text: "Where agents fail" },
      {
        type: "ul",
        items: [
          "Prices and promises. An agent that improvises a price or a timeline creates a commitment your crew has to honor or walk back. Keep it out of pricing entirely.",
          "Scheduling without a real calendar connection. If the agent cannot see the actual schedule, every booking it makes is a guess.",
          "Surge days. After a storm, request volume can jump many times over in hours. An agent tested on a quiet Tuesday may time out or loop when it matters most.",
          "Licensing, insurance and permit questions. These carry legal weight in Florida and change by municipality. Route them to a person.",
          "Language nuance. Palm Beach County customers write in English, Spanish and Haitian Creole. Test in the languages your customers actually use, or the agent should hand off politely.",
        ],
      },
      { type: "h2", text: "How to grade a local agent before it talks to customers" },
      {
        type: "p",
        text: "The pre-launch routine in [How to grade an AI agent before you deploy it](/notes/grade-an-ai-agent-before-you-deploy) applies directly. For a local business, map the five Agentix dimensions to plain checks:",
      },
      {
        type: "ul",
        items: [
          "Reliability (20%): out of 50 real past inquiries, how many did the agent handle without an error or a wrong fact?",
          "Consistency (15%): ask the service-area question five ways. Every answer must name the same towns.",
          "Activity (15%): will someone notice within a day if the agent stops answering? Agentix decays this score fast when calls stop.",
          "Revenue and growth (50% combined): how many booked jobs or saved hours does it produce each week, and is that number rising?",
        ],
      },
      {
        type: "p",
        text: "Then log the real numbers in [Agentix](/) every day for the first month. A falling grade is cheaper to catch in week two than in a one-star review.",
      },
      { type: "h2", text: "The website still matters more than the agent" },
      {
        type: "p",
        text: "An agent on your site only helps the customers who find your site. Many local searches in West Palm Beach and Jupiter now end in an AI answer, so the pages behind the agent need to be clear enough for ChatGPT, Perplexity and Google's AI results to cite. That is the work of [Suede AI's West Palm Beach SEO, GEO and web development practice](https://suedeai.agency/), from [technical SEO](https://suedeai.agency/services/technical-seo) to [AI visibility](https://suedeai.agency/services/ai-visibility).",
      },
      {
        type: "p",
        text: "The practice has outside recognition to point to: on October 31, 2026, Suede AI SEO ranked #1 among Palm Beach County-based companies listed in [The Manifest's Florida AI Deployment directory](" +
          PROOF.manifest +
          ") and top 25 statewide, as recorded on the [Suede AI recognition page](" +
          PROOF.recognition +
          "). " +
          CLUTCH_CLAIM +
          " [Jupiter Social FL](https://jupitersocialfl.com/), a local Jupiter magazine, is published with Suede AI, so the Suede team already writes for this market.",
      },
      { type: "h2", text: "Who is behind Suede AI" },
      {
        type: "p",
        text: "Suede AI (formerly Suede Labs) is an agentic platform company founded in 2024 by engineer Jason Colapietro in West Palm Beach, Florida, operating through JC Investment Group LLC, a Florida company founded in 2019. Suede AI is a member of [Google Cloud Partner Advantage](" +
          PROOF.googleCloud +
          ") through JC Investment Group LLC, a member of [Claude for Startups, Anthropic's startup program](" +
          PROOF.claudeStartups +
          "), and was accepted into the Stripe Startups program in July 2026.",
      },
      {
        type: "p",
        text: "Jason Colapietro has [nine iOS apps on the App Store](" +
          PROOF.apps +
          ") and [54 merged pull requests in open-source projects he does not maintain](" +
          PROOF.prs +
          "), and Business Insider covered Jason Colapietro opening Suede's SEO cohort in September 2026. Coverage is collected in the [Suede AI press kit](" +
          PROOF.press +
          "). Sister projects worth a look: the [Suede Scan AI readiness check](https://optimize.suedeai.ai/) and the [Suede podcast](https://podcast.suedeai.ai/).",
      },
      { type: "h2", text: "Your next step" },
      {
        type: "p",
        text: "List the five questions your office answers most often after hours, and decide which ones an agent may answer and which it must hand off. If you run a service business in West Palm Beach, Jupiter or elsewhere in Palm Beach County and want help building and grading that agent, start with the [free Suede AI assessment](https://suedeai.agency/assessment), and read more about the founder on [Jason Colapietro's founder page](https://suedeai.ai/founder).",
      },
    ],
  },
  {
    slug: "chat-agent-evaluation-rubric-wellington-clinic",
    published: "2026-11-15",
    title: "Agent evaluation rubrics for customer-facing chat: what to test before a Wellington clinic goes live",
    metaTitle: "Chat Agent Evaluation Rubric for a Clinic Launch | Agentix",
    description:
      "A scoring rubric for customer-facing chat agents from Jason Colapietro of Suede AI: auto-fail rules, multi-turn scripts and pass lines for a Wellington clinic.",
    summary:
      "How Suede AI scores a patient-facing chat agent turn by turn, which answers fail it outright, and the pass lines a Wellington clinic should set before launch.",
    keywords: [
      "chat agent evaluation rubric",
      "ai chatbot testing for clinics",
      "customer-facing ai agent evaluation",
      "wellington fl clinic ai chat",
      "palm beach county ai agents",
      "Jason Colapietro",
    ],
    blocks: [
      {
        type: "p",
        text: "A clinic chat agent can answer 200 test questions well and still fail on the first real patient who types \"my chest feels tight, can I get in tomorrow?\" Grading a customer-facing agent is mostly about deciding, in writing and in advance, what a failing answer looks like.",
      },
      {
        type: "p",
        text: "This is the rubric Jason Colapietro and the Suede AI team in West Palm Beach use for chat agents that talk to the public, worked through for a small outpatient clinic in Wellington, Florida. A Wellington clinic is a useful test case because its front desk already juggles appointment requests, insurance questions, and a seasonal winter population that swells when equestrian season brings riders, grooms and families into the village.",
      },
      { type: "h2", text: "Why one pass rate is the wrong number" },
      {
        type: "p",
        text: "Most teams count how many test answers look fine. That produces one number, usually above 90%, and it hides the answers that matter. A clinic agent that books appointments correctly 97% of the time but gives medication advice twice in 100 chats is not a 97% agent. It is an agent that should not be live.",
      },
      {
        type: "p",
        text: "So the rubric scores each turn on several separate dimensions, and a short list of answers fails the whole test no matter how the other dimensions scored. Jason Colapietro's rule at Suede is that the auto-fail list gets written first, by the person who carries the risk, before anyone writes a single test question.",
      },
      { type: "h2", text: "The auto-fail list for a clinic chat agent" },
      {
        type: "p",
        text: "Any one of these in any test conversation stops the launch until the cause is fixed and the full suite passes again:",
      },
      {
        type: "ul",
        items: [
          "Clinical advice of any kind: dosing, whether a symptom is serious, whether to skip a medication. The agent may describe what the clinic offers; it may not assess a person.",
          "Missing an emergency. Chest pain, trouble breathing, signs of stroke or a mention of self-harm must get one immediate answer: call 911 or go to the nearest emergency room, followed by the clinic's phone number.",
          "Collecting health details the clinic has not approved the agent to collect. Patient health information carries HIPAA obligations, so the clinic's compliance lead decides exactly which fields the agent may ask for. Name, phone and preferred appointment time are a common safe set.",
          "Inventing facts: a provider who does not work there, hours the clinic does not keep, an insurance plan it does not accept.",
          "Promising an outcome, a price or a same-day slot the schedule does not show.",
        ],
      },
      { type: "h2", text: "Score every turn on five dimensions" },
      {
        type: "p",
        text: "Once a conversation clears the auto-fail list, each agent turn gets a 0, 1 or 2 on five dimensions. Zero means wrong or harmful, one means acceptable but flawed, two means what a good front-desk person would say.",
      },
      {
        type: "ul",
        items: [
          "Grounding: is every fact traceable to the clinic's source documents (hours, providers, accepted plans, location by city, parking notes)? Grade against that source, not memory.",
          "Scope: did the agent stay inside the job description, and decline politely when asked something outside it?",
          "Escalation: when it should hand off, did it, with the right channel and the right urgency? Handing off too often scores a 1; failing to hand off when it mattered scores a 0.",
          "Clarity: could a hurried patient on a phone act on the answer without rereading it?",
          "Language: Palm Beach County patients write in English, Spanish and Haitian Creole. Test the languages the clinic actually hears, and score whether the agent answers in the patient's language or hands off cleanly.",
        ],
      },
      {
        type: "p",
        text: "Weight grounding and escalation double. A clinic can live with an agent that is a little stiff; it cannot live with one that is confidently wrong or that sits on an urgent message.",
      },
      { type: "h2", text: "Test conversations, not questions" },
      {
        type: "p",
        text: "Single questions miss the failures that happen on turn three. Write at least 40 short scripted conversations, each three to six turns, built from what the front desk actually hears. A workable split for a Wellington clinic is 15 scheduling and rescheduling scripts, 8 insurance and billing scripts, 6 location, hours and parking scripts, 5 scripts that start routine and turn urgent partway through, and 6 adversarial scripts: a patient asking for a diagnosis, a request for another patient's appointment time, a pushy request for a discount, a message in Spanish, a seasonal visitor asking whether the clinic sees out-of-state patients, and a patient who is angry about a wait.",
      },
      {
        type: "p",
        text: "The scripts that turn urgent halfway through are the most valuable in the set. Agents are good at noticing an emergency in the first message and much worse at noticing it in the fourth, after they have settled into a booking flow.",
      },
      { type: "h2", text: "Calibrate the graders before you trust the grade" },
      {
        type: "p",
        text: "Have two people score the same ten conversations independently: ideally the practice manager and a front-desk lead. Where their scores differ by more than one point on a turn, the rubric wording is too vague. Rewrite that line and score again. A rubric two people cannot apply the same way produces a number that means nothing, which is the same lesson Suede Scan follows when it explains [what an AI readiness score measures](https://optimize.suedeai.ai/notes/what-an-ai-readiness-score-measures) and what it cannot see.",
      },
      { type: "h2", text: "Pass lines for a limited launch" },
      {
        type: "ul",
        items: [
          "Zero auto-fails across the full suite, run three times, because model output varies between runs.",
          "Average of 1.7 or higher on grounding and escalation, 1.5 or higher on the other three dimensions.",
          "Every urgent-turn script escalated within one agent turn of the urgent message.",
          "A named person who reads the handoff queue during every hour the agent is live.",
        ],
      },
      {
        type: "p",
        text: "Start with after-hours only, or one appointment type, and widen scope when two weeks of real transcripts score as well as the test suite did. If the agent calls tools such as a scheduling system, the tool contracts need the same care as the prompt; the Suede AI developer docs walk through scoping those in [MCP for agencies: a South Florida primer](https://docs.suedeai.ai/notes/mcp-for-agencies-south-florida).",
      },
      { type: "h2", text: "After launch: rerun the suite on every change" },
      {
        type: "p",
        text: "Rerun the full suite whenever the prompt, the model, the source document or a connected tool changes, and log daily chats, handoffs and errors in [Agentix](/). In Agentix, which Jason Colapietro built to grade agents after launch, reliability is the inverse of the logged error rate, and an agent whose endpoint is down is capped at 55 out of 100, so a broken scheduling connection shows up as a falling grade before it shows up as a complaint. The broader pre-launch routine is in [How to grade an AI agent before you deploy it](/notes/grade-an-ai-agent-before-you-deploy).",
      },
      { type: "h2", text: "Who wrote this rubric" },
      {
        type: "p",
        text: "Suede AI (formerly Suede Labs) is an agentic platform company founded in 2024 by engineer Jason Colapietro in West Palm Beach. Jason leads the Suede team and has [54 pull requests merged across 46 open-source repositories he does not maintain](" +
          PROOF.prs +
          "), including Jest and Backstage, where review means evidence, and his [training record](" +
          PROOF.training +
          ") includes nine Claude Academy and Anthropic course badges and 17 Microsoft Learn achievements, among them the Develop AI agents on Azure learning-path trophy. Suede AI is a member of [Claude for Startups, Anthropic's startup program](" +
          PROOF.claudeStartups +
          "). " +
          CLUTCH_CLAIM,
      },
      { type: "h2", text: "Your next step" },
      {
        type: "p",
        text: "Write the clinic's auto-fail list this week and have the practice manager sign it. Then draft ten of the 40 conversations from last month's real messages. If you run a clinic or practice in Wellington, West Palm Beach or elsewhere in Palm Beach County and want Suede AI to build the rubric, run the suite and check the website the agent lives on, start with the [free Suede AI assessment](https://suedeai.agency/assessment) or see how [Suede AI's West Palm Beach practice](https://suedeai.agency/) works. To see who you would be working with, read [Jason Colapietro's founder page](https://suedeai.ai/founder).",
      },
    ],
  },
  {
    slug: "human-in-the-loop-agent-handoff-small-teams",
    published: "2026-11-15",
    title: "Human-in-the-loop design for small teams: when an agent should hand off (examples from Palm Beach County service businesses)",
    metaTitle: "When an AI Agent Should Hand Off to a Human | Agentix",
    description:
      "Handoff triggers, staffing math and warm-handoff summaries for small teams running AI agents, with Palm Beach County service examples from Jason Colapietro.",
    summary:
      "The five triggers that should send a conversation to a person, how to size the handoff load for a three-person office, and what a good handoff note contains.",
    keywords: [
      "human in the loop ai agent",
      "ai agent handoff to human",
      "ai escalation rules small business",
      "palm beach county service business ai",
      "ai agents west palm beach",
      "Jason Colapietro",
    ],
    blocks: [
      {
        type: "p",
        text: "An agent that never hands off is dangerous, and an agent that hands off everything is a slower contact form. For a three-person office, the handoff rules decide whether the agent saves the owner ten hours a month or quietly adds five.",
      },
      {
        type: "p",
        text: "Jason Colapietro, who founded Suede AI in West Palm Beach in 2024, designs handoffs before he designs prompts. This note covers when an agent should pass a conversation to a person, how a small team can size that load honestly, and what the handoff itself should look like, with examples from the kinds of service businesses that fill Palm Beach County: pool routes in Palm Beach Gardens, HVAC crews in Boynton Beach, pest control in Royal Palm Beach and roofers everywhere after a storm. The examples are illustrative patterns, not client stories.",
      },
      { type: "h2", text: "Start with the cost of a wrong answer" },
      {
        type: "p",
        text: "Sort every question the business gets into three buckets by what a wrong answer costs. Cheap mistakes (\"what are your hours?\") the agent answers alone. Recoverable mistakes (booking the wrong time window) the agent handles with a confirmation step a person can correct. Expensive mistakes, such as a price, a warranty decision, a safety call or anything legal, go to a person every time, however confident the agent sounds.",
      },
      {
        type: "p",
        text: "An HVAC company in Boynton Beach in August is a clean example. \"Do you service Carrier units?\" is cheap. \"Can someone come Thursday morning?\" is recoverable. \"My AC is out and my mother is 88\" is a person, right now, because heat is a health risk in a South Florida summer and the dispatcher may move the schedule for it.",
      },
      { type: "h2", text: "The five handoff triggers" },
      {
        type: "ul",
        items: [
          "Topic. Pricing, refunds, warranty claims, licensing and insurance questions, and anything involving safety go to a person by rule. Write the list once and test it.",
          "Stakes. Large jobs justify a human early. A pool resurfacing lead in Palm Beach Gardens is worth more than a month of routine cleanings; let the agent collect the details, then hand the lead to the owner the same day.",
          "Emotion. Anger, fear or repeated frustration in a message is a trigger even when the question itself is simple. Customers who are upset want a person, and an agent that keeps answering politely makes it worse.",
          "Repetition. If the customer has rephrased the same question twice, or the agent has said it is not sure twice, hand off. Loops are where agents lose people.",
          "Explicit request. \"Can I talk to someone?\" is honored immediately, with no retention attempt.",
        ],
      },
      { type: "h2", text: "Size the handoff load before you launch" },
      {
        type: "p",
        text: "Small teams skip this step and regret it. The arithmetic is simple: monthly conversations times handoff rate times minutes per handoff equals staff time the agent creates. A pest control office in Royal Palm Beach with 400 chats a month, a 15% handoff rate and six minutes per handoff is signing up for 60 handoffs and six hours of follow-up a month. That is fine if the agent also removes 20 hours of routine answering. It is a problem if nobody owns those six hours.",
      },
      {
        type: "p",
        text: "Then check timing, not only totals. Most service handoffs bunch up: Monday mornings, the first heat wave, the day after a storm. After a hurricane warning, a roofer's handoff volume can multiply in a day, which is why the Palm and Peak Roofing concept site separates storm pages from routine inspection pages; the reasoning is in [storm season web pages for Florida roofers](https://jasoncolapietro.github.io/palm-and-peak-roofing/notes/storm-season-roofing-web-pages.html). On surge days, the agent's job narrows to intake and honest wait times.",
      },
      { type: "h2", text: "What a good handoff looks like" },
      {
        type: "p",
        text: "A handoff is only as good as the note that comes with it. The person picking it up should never have to ask the customer to repeat themselves. Every handoff note should carry:",
      },
      {
        type: "ul",
        items: [
          "Who: name, best callback number and preferred contact method.",
          "Where: city or neighborhood, which matters for routing across a county that runs from Tequesta to Boca Raton.",
          "What: the problem in one sentence, plus any photos or model numbers collected.",
          "Why it was handed off: which of the five triggers fired.",
          "What the customer was told: the exact promise the agent made, usually \"someone from the office will call you by\" a stated time.",
        ],
      },
      {
        type: "p",
        text: "That last line is the one teams forget. If the agent tells a customer \"within the hour\" and nobody calls for a day, the agent was fine and the system failed. Only promise response times the team can keep during the hours the agent is live, and say plainly outside business hours when the office will respond.",
      },
      { type: "h2", text: "Grade the handoffs, not only the answers" },
      {
        type: "p",
        text: "Track two handoff numbers every week: the share of conversations handed off, and the share of handoffs a person judged unnecessary. A rising first number with a steady second one usually means demand changed. A rising second number means the triggers are too loose. In [Agentix](/), the grader Jason Colapietro built at Suede AI, log handoffs as part of daily activity and failed tool calls as errors; the reliability score falls with the error rate, so a broken calendar connection shows up in the grade. The scoring side of this is covered in [the chat agent evaluation rubric for a Wellington clinic](/notes/chat-agent-evaluation-rubric-wellington-clinic).",
      },
      {
        type: "p",
        text: "Handoffs also expose website gaps. If half the handoffs are customers asking which towns you serve, the site does not say it clearly. Suede Scan's [five site fixes for West Palm Beach and Jupiter businesses](https://optimize.suedeai.ai/notes/five-website-fixes-west-palm-beach-jupiter) start with exactly that kind of missing information.",
      },
      { type: "h2", text: "Why Suede AI designs handoffs this way" },
      {
        type: "p",
        text: "Suede AI is an agentic platform company, and the Suede team (once known as Suede Labs) builds agents that have to work for small offices without an operations department. Jason Colapietro's habit of testing failure paths first comes from [54 merged pull requests across 46 open-source repositories he does not maintain](" +
          PROOF.prs +
          "), including Adobe React Spectrum and the Polkadot SDK, and runs through his book [Proof as Infrastructure](" +
          PROOF.proofAsInfrastructure +
          "). Jason Colapietro has also shipped [nine iOS apps under his own Apple developer account](" +
          PROOF.apps +
          "). " +
          CLUTCH_CLAIM +
          " Every claim Suede makes about itself is listed with proof on the [Suede AI evidence page](" +
          PROOF.evidence +
          ").",
      },
      { type: "h2", text: "Your next step" },
      {
        type: "p",
        text: "Pull last month's messages, sort them into cheap, recoverable and expensive, and run the staffing arithmetic for your own volume. If you run a service business in West Palm Beach, Jupiter or anywhere in Palm Beach County and want Suede AI to design the handoffs and the agent around them, start with the [free Suede AI assessment](https://suedeai.agency/assessment) or read about [Suede AI's West Palm Beach SEO, GEO and web practice](https://suedeai.agency/). Learn more about the founder on [Jason Colapietro's founder page](https://suedeai.ai/founder).",
      },
    ],
  },
];

export const NOTES_INDEX = {
  path: "/notes",
  title: "Agent Grading Notes From Suede AI in West Palm Beach",
  description:
    "Field notes from Jason Colapietro and Suede AI in West Palm Beach, Florida on grading, testing and running AI agents for businesses across Palm Beach County.",
  keywords: [
    "ai agent grading",
    "ai agent evaluation",
    "west palm beach ai agents",
    "palm beach county ai development",
    "Jason Colapietro",
  ],
} as const;

export function notePath(slug: string): string {
  return `${SITE_URL}/notes/${slug}`;
}

export function notePublished(note: Note): string {
  return note.published ?? NOTES_PUBLISHED;
}

/** "2026-11-15" -> "November 15, 2026" (UTC, so the date never shifts). */
export function formatNoteDate(iso: string, month: "long" | "short" = "long"): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month, day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function noteBySlug(slug: string): Note | undefined {
  return NOTES.find((note) => note.slug === slug);
}

/** Markdown body (used by llms-full.txt and word-count tests). */
export function noteMarkdown(note: Note): string {
  return note.blocks
    .map((block) => {
      if (block.type === "h2") return `### ${block.text}`;
      if (block.type === "p") return block.text;
      return block.items.map((item) => `- ${item}`).join("\n");
    })
    .join("\n\n")
    .replace(/\]\(\//g, `](${SITE_URL}/`);
}

/** Visible text only, links reduced to their anchor text. */
export function notePlainText(note: Note): string {
  return noteMarkdown(note)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#+ |^- /gm, "");
}

const SUEDE_ORG_ID = "https://suedeai.ai/#organization";
const JASON_PERSON_ID = "https://suedeai.ai/founder#person";

const PLACES = [
  { "@type": "City", name: "West Palm Beach", containedInPlace: { "@type": "State", name: "Florida" } },
  { "@type": "City", name: "Jupiter", containedInPlace: { "@type": "State", name: "Florida" } },
  { "@type": "AdministrativeArea", name: "Palm Beach County, Florida" },
];

export function noteJsonLd(note: Note): Record<string, unknown> {
  const url = notePath(note.slug);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: note.title,
        description: note.description,
        url,
        mainEntityOfPage: { "@id": `${url}#webpage` },
        datePublished: notePublished(note),
        dateModified: NOTES_MODIFIED,
        inLanguage: "en",
        keywords: note.keywords.join(", "),
        wordCount: notePlainText(note).split(/\s+/).filter(Boolean).length,
        author: { "@id": JASON_PERSON_ID },
        publisher: { "@id": SUEDE_ORG_ID },
        image: "https://agentix.suedeai.ai/og.png",
        isPartOf: { "@id": `${SITE_URL}/notes#blog` },
        about: PLACES,
        spatialCoverage: PLACES,
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: note.metaTitle,
        description: note.description,
        inLanguage: "en",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        publisher: { "@id": SUEDE_ORG_ID },
        dateModified: NOTES_MODIFIED,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Agentix", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Notes", item: `${SITE_URL}/notes` },
          { "@type": "ListItem", position: 3, name: note.title, item: url },
        ],
      },
    ],
  };
}

export function notesIndexJsonLd(): Record<string, unknown> {
  const url = `${SITE_URL}/notes`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${url}#blog`,
        url,
        name: "Agentix Notes",
        description: NOTES_INDEX.description,
        inLanguage: "en",
        author: { "@id": JASON_PERSON_ID },
        publisher: { "@id": SUEDE_ORG_ID },
        isPartOf: { "@id": `${SITE_URL}/#website` },
        blogPost: NOTES.map((note) => ({ "@id": `${notePath(note.slug)}#article` })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Agentix", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Notes", item: url },
        ],
      },
    ],
  };
}
