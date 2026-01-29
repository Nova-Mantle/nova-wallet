import { NextRequest } from "next/server";
import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
// Rate limiting (anti-DDoS)
import { ratelimit } from "../../lib/ratelimit";
import { headers } from "next/headers";

// NOTE: Onchain search actions (analyze_whale_activity, analyze_counterparties, etc.)
// are now handled in frontend page.tsx with useCopilotAction and Generative UI cards.
// This keeps backend lean and allows for visual card rendering.

const serviceAdapter = new OpenAIAdapter({
  model: "gpt-4o-mini",
});

const runtime = new CopilotRuntime({
  // Onchain search actions are now handled in frontend (page.tsx) with Generative UI cards
  // See: useCopilotAction hooks for analyze_whale_activity, analyze_counterparties, etc.
  actions: []
});

export const POST = async (req: NextRequest) => {
  // ✅ KEEP: Rate limiting (anti-DDoS protection)
  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";

  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return new Response("Too Many Requests", { status: 429 });
  }

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};