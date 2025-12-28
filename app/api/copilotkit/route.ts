
import { NextRequest } from "next/server";
import { CopilotRuntime, GoogleGenerativeAIAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";

const serviceAdapter = new GoogleGenerativeAIAdapter({
    apiKey: process.env.GEMINI_API_KEY || "",
    model: "gemma-3-27b-it",
});

const runtime = new CopilotRuntime();

export const POST = async (req: NextRequest) => {
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
        runtime,
        serviceAdapter,
        endpoint: "/api/copilotkit",
    });

    return handleRequest(req);
};
