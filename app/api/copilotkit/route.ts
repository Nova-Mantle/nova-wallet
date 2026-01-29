import { NextRequest } from "next/server";
import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
// ✅ KEEP: Rate limiting dari main (anti-DDoS)
import { ratelimit } from "../../lib/ratelimit";
import { headers } from "next/headers";
// ✅ ADD: Onchain search functions dari onchainsearchexp
import {
  getWhaleActivity,
  getCounterpartyAnalysis,
  getPortfolioAnalysis,
  getTokenActivity,
  getTransactionStats
} from "@/lib/blockchainAgentWrapper";

const serviceAdapter = new OpenAIAdapter({
  model: "gpt-4o-mini",
});

// ✅ FIX: Added 'as const' to ensure 'type' is treated as the literal "string"
const strictAddressParam = {
  name: "address",
  type: "string",
  description: "The wallet address. CRITICAL: Pass the EXACT string the user provided. DO NOT add '0x' if it is missing. DO NOT fix typos. If the user input is 'd8dA...', pass 'd8dA...'."
} as const;

const runtime = new CopilotRuntime({
  actions: [
    {
      name: "analyze_whale_activity",
      description: "Analyze if a wallet is a 'Whale' (large holder). Checks accumulation patterns, dump risk, and large transfers.",
      parameters: [
        strictAddressParam,
        { name: "chainId", type: "number", description: "The chain ID (e.g., 1 for Eth, 5000 for Mantle). Default: 1 (Ethereum)", required: false }
      ],
      handler: async ({ address, chainId }: { address: string; chainId?: number }) => {
        try {
          console.log(`🔍 RAW ADDRESS RECEIVED FROM AI: "${address}" (length: ${address.length})`);
          console.log(`🐳 AI Triggered Whale Search for ${address}`);
          return await getWhaleActivity(address, chainId || 1);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          console.error(`❌ Whale Analysis Error: ${errorMessage}`);
          return { error: true, message: errorMessage };
        }
      }
    },
    {
      name: "analyze_counterparties",
      description: "Analyze who a wallet interacts with most. Identifies top senders/receivers and relationship clusters.",
      parameters: [
        strictAddressParam,
        { name: "chainId", type: "number", description: "The chain ID. Default: 1 (Ethereum)", required: false }
      ],
      handler: async ({ address, chainId }: { address: string; chainId?: number }) => {
        try {
          console.log(`🤝 AI Triggered Counterparty Search for ${address}`);
          return await getCounterpartyAnalysis(address, chainId || 1);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          console.error(`❌ Counterparty Analysis Error: ${errorMessage}`);
          return { error: true, message: errorMessage };
        }
      }
    },
    {
      name: "analyze_portfolio",
      description: "Get the token balances and total net worth of a wallet.",
      parameters: [
        strictAddressParam,
        { name: "chainId", type: "number", description: "The chain ID. Default: 1 (Ethereum)", required: false }
      ],
      handler: async ({ address, chainId }: { address: string; chainId?: number }) => {
        try {
          return await getPortfolioAnalysis(address, chainId || 1);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          console.error(`❌ Portfolio Analysis Error: ${errorMessage}`);
          return { error: true, message: errorMessage };
        }
      }
    },
    {
      name: "analyze_token_activity",
      description: "Analyze trading performance (PnL), buying/selling habits for specific tokens.",
      parameters: [
        strictAddressParam,
        { name: "chainId", type: "number", description: "The chain ID. Default: 1 (Ethereum)", required: false },
        { name: "timeframeDays", type: "number", description: "Number of days to analyze. Default: 180", required: false }
      ],
      handler: async ({ address, chainId, timeframeDays }: { address: string; chainId?: number; timeframeDays?: number }) => {
        try {
          return await getTokenActivity(address, chainId || 1, timeframeDays);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          console.error(`❌ Token Activity Analysis Error: ${errorMessage}`);
          return { error: true, message: errorMessage };
        }
      }
    },
    {
      name: "analyze_transaction_stats",
      description: "Get general stats: total gas fees spent, active days, and transaction counts.",
      parameters: [
        strictAddressParam,
        { name: "chainId", type: "number", description: "The chain ID. Default: 1 (Ethereum)", required: false }
      ],
      handler: async ({ address, chainId }: { address: string; chainId?: number }) => {
        try {
          return await getTransactionStats(address, chainId || 1);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          console.error(`❌ Transaction Stats Error: ${errorMessage}`);
          return { error: true, message: errorMessage };
        }
      }
    }
  ]
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