import { NextRequest } from "next/server";
import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
import { ratelimit } from "../../lib/ratelimit";
import { headers } from "next/headers";

const serviceAdapter = new OpenAIAdapter({
    model: "gpt-4o-mini",
});

const runtime = new CopilotRuntime();

export const POST = async (req: NextRequest) => {
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
