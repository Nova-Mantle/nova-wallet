import { NextRequest, NextResponse } from "next/server";
import { getTokenActivity } from "@/lib/blockchainAgentWrapper";

export async function POST(req: NextRequest) {
    try {
        const { address, chainId, timeframeDays } = await req.json();

        if (!address) {
            return NextResponse.json({ error: "Address is required" }, { status: 400 });
        }

        const result = await getTokenActivity(address, chainId || 1, timeframeDays);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Token Activity API Error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
