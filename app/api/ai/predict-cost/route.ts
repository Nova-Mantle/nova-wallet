
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { symbol, amount, side } = body;

        if (!symbol || !amount || !side) {
            return NextResponse.json(
                { error: "Missing required fields: symbol, amount, side" },
                { status: 400 }
            );
        }

        const externalApiUrl = "https://wildanniam-slippagepredictoronchain.hf.space/predict";

        const payload = {
            symbol,
            amount,
            side,
        };

        console.log("[predict-cost] Sending payload to external API:", payload);
        const startTime = Date.now();

        // Add timeout (45 seconds to allow for cold start)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        try {
            const response = await fetch(externalApiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const elapsed = Date.now() - startTime;
            console.log(`[predict-cost] External API responded in ${elapsed}ms with status ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[predict-cost] External API error (${response.status}):`, errorText);
                return NextResponse.json(
                    {
                        error: errorText || "External API returned error",
                        status: response.status,
                        payload: payload // Include for debugging
                    },
                    { status: response.status }
                );
            }

            const data = await response.json();
            console.log("[predict-cost] Success! Received data from external API");
            return NextResponse.json(data);
        } catch (fetchError: any) {
            clearTimeout(timeoutId);

            if (fetchError.name === 'AbortError') {
                console.error("[predict-cost] Request timeout after 45s");
                return NextResponse.json(
                    { error: "Request timeout - API took too long to respond", payload },
                    { status: 504 }
                );
            }
            throw fetchError;
        }

    } catch (error: any) {
        console.error("[predict-cost] error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch prediction" },
            { status: 500 }
        );
    }
}
