import { NextRequest, NextResponse } from "next/server";
import { getTransactionStats } from "@/lib/blockchainAgentWrapper";

export async function POST(req: NextRequest) {
    try {
        const { address, chainId } = await req.json();

        if (!address) {
            return NextResponse.json({ error: "Address is required" }, { status: 400 });
        }

        const result = await getTransactionStats(address, chainId || 1);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Transaction Stats API Error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
