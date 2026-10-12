import { buildLlmsFull } from "@/lib/llms-full";

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildLlmsFull(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
