// nova-wallet/app/api/ai/chat/route.ts - RESTORED ORIGINAL + ADDED WHALE/COUNTERPARTY

import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { parseIntent } from "@/lib/intentParser";
import { isAddress as viemIsAddress } from "viem";

import { supportedChains } from "../../../config/chains";

// NEW: Import ALL blockchain analysis functions (Added Whale/Counterparty here)
import {
    getPortfolioAnalysis,
    getTokenActivity,
    getTransactionStats,
    getWhaleActivity,       // ✅ NEW
    getCounterpartyAnalysis // ✅ NEW
} from "@/lib/blockchainAgentWrapper";

// Function untuk check balance (UNCHANGED)
async function checkBalance(address: string, chainId: number) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/wallet/balance`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ address, chainId }),
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Gagal mengambil saldo");
        }

        return await response.json();
    } catch (error) {
        console.error("[checkBalance] error", error);
        throw error;
    }
}

type ChatRequestBody = {
    messages: Array<{
        role: "user" | "assistant";
        content: string;
    }>;
    walletContext?: {
        address: string;
        chainId: number;
        balance?: string;
        isConnected: boolean;
    };
};

const SUPPORTED_CHAINS_LIST = supportedChains.map(c => `- ${c.name} (Chain ID: ${c.id})`).join("\n");

// ✅ ORIGINAL SYSTEM PROMPT (Preserved) + Added Point 4 & 5
const SYSTEM_PROMPT = `Kamu adalah Nova AI, asisten crypto wallet yang ramah dan membantu. Kamu berbicara dalam Bahasa Indonesia yang natural dan mudah dipahami.

Jaringan yang didukung saat ini:
${SUPPORTED_CHAINS_LIST}

PENTING - RULES MUTLAK:
1. Jika user bertanya "portfolio aku apa aja", "token apa yang aku punya", "holdings aku", atau sejenisnya:
   → WAJIB panggil analyzePortfolio DULU
   → JANGAN jawab langsung tanpa data

2. Jika user bertanya "profit aku berapa", "token apa yang paling untung", "rugi berapa", atau sejenisnya:
   → WAJIB panggil analyzeTokenActivity DULU
   → JANGAN jawab langsung tanpa data

3. Jika user bertanya "saldo", "balance", "berapa ETH/MNT aku":
   → WAJIB panggil checkBalance DULU
   → JANGAN jawab langsung tanpa data

4. Jika user bertanya "transaksi besar", "apakah aku whale", "cek whale activity":
   → WAJIB panggil analyzeWhaleActivity DULU (✅ NEW RULE)

5. Jika user bertanya "siapa yang sering kirim", "interaksi dengan siapa", "counterparty":
   → WAJIB panggil analyzeCounterparty DULU (✅ NEW RULE)

INGAT: Kamu TIDAK BISA membuat data. Kamu HARUS memanggil function untuk mendapatkan data real dari blockchain.

Tugas kamu:
1. Bantu user cek saldo wallet dengan memanggil checkBalance
2. Bantu user analisis portfolio dengan memanggil analyzePortfolio
3. Bantu user lihat aktivitas trading dengan memanggil analyzeTokenActivity
4. Bantu user deteksi transaksi besar (Whale) dengan analyzeWhaleActivity
5. Bantu user lihat interaksi wallet (Counterparty) dengan analyzeCounterparty
6. Validasi transaksi sebelum execute (jangan pernah execute tanpa konfirmasi user)

Format Jawaban:
- SELALU sebutkan chain name (misalnya "di Mantle Sepolia", "di Ethereum Sepolia")
- SELALU gunakan data REAL dari function calls
- JANGAN membuat data palsu atau contoh
- Jika function call gagal, jelaskan kenapa dan minta user coba lagi

Catatan tentang Token:
- checkBalance → native token saja (ETH/MNT/LSK)
- analyzePortfolio → semua token + nilai USD + P&L
- analyzeTokenActivity → riwayat trading + profit per token

Ingat:
- Selalu gunakan Bahasa Indonesia
- WAJIB panggil function sebelum jawab
- Jelaskan dengan bahasa yang mudah dipahami
- Jangan pernah execute transaksi tanpa konfirmasi eksplisit dari user
- Kalau user belum connect wallet, ingatkan mereka untuk connect dulu`;

// Function schema untuk Gemini (KEEP EXISTING + ADD NEW TOOLS)
const tools = [
    {
        name: "checkBalance",
        description: "Cek saldo native token (ETH/MNT/LSK) wallet di blockchain tertentu",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                address: { type: SchemaType.STRING, description: "Alamat wallet yang ingin dicek saldonya" },
                chainId: { type: SchemaType.NUMBER, description: "Chain ID blockchain" },
            },
            required: ["address", "chainId"],
        },
    },
    {
        name: "analyzePortfolio",
        description: "Analisis portfolio lengkap: semua token holdings, nilai USD, profit/loss.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                address: { type: SchemaType.STRING, description: "Alamat wallet yang ingin dianalisis" },
                chainId: { type: SchemaType.NUMBER, description: "Chain ID blockchain" },
            },
            required: ["address", "chainId"],
        },
    },
    {
        name: "analyzeTokenActivity",
        description: "Analisis aktivitas trading: token apa yang dibeli/dijual, profit/loss per token.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                address: { type: SchemaType.STRING, description: "Alamat wallet yang ingin dianalisis" },
                chainId: { type: SchemaType.NUMBER, description: "Chain ID blockchain" },
                timeframeDays: { type: SchemaType.NUMBER, description: "Timeframe dalam hari (opsional)" },
            },
            required: ["address", "chainId"],
        },
    },
    // ✅ NEW TOOL: Whale Activity
    {
        name: "analyzeWhaleActivity",
        description: "Analisis transaksi besar (whale). Gunakan jika user tanya 'transaksi besar', 'whale', 'dump'.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                address: { type: SchemaType.STRING, description: "Alamat wallet" },
                chainId: { type: SchemaType.NUMBER, description: "Chain ID" },
                timeframeDays: { type: SchemaType.NUMBER, description: "Timeframe (opsional)" }
            },
            required: ["address", "chainId"],
        },
    },
    // ✅ NEW TOOL: Counterparty Analysis
    {
        name: "analyzeCounterparty",
        description: "Analisis interaksi wallet. Gunakan jika user tanya 'siapa yang sering kirim', 'top interaction', 'exchange apa'.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                address: { type: SchemaType.STRING, description: "Alamat wallet" },
                chainId: { type: SchemaType.NUMBER, description: "Chain ID" },
                timeframeDays: { type: SchemaType.NUMBER, description: "Timeframe (opsional)" }
            },
            required: ["address", "chainId"],
        },
    },
    {
        name: "prepareTransaction",
        description: "Siapkan data transaksi untuk mengirim koin/token dari user ke orang lain.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                toAddress: { type: SchemaType.STRING, description: "Alamat wallet tujuan (harus 0x...)" },
                amount: { type: SchemaType.NUMBER, description: "Jumlah yang ingin dikirim" },
                chainId: { type: SchemaType.NUMBER, description: "Chain ID network tujuan" },
            },
            required: ["toAddress", "amount", "chainId"],
        },
    }
];

// KEEP ALL EXISTING HELPER FUNCTIONS (Preserved exactly as you had them)
interface PrepareSendParams {
    fromAddress: string;
    toAddress: string;
    amount: number;
    chainId: number;
}

const GAS_LIMIT = 21000;
const DEFAULT_GAS_PRICE_GWEI = 0.001;

const isValidAddress = (address: string) =>
    viemIsAddress(address as `0x${string}`);

const formatNumber = (value: number) =>
    Number.isFinite(value) ? value.toFixed(6) : "0";

const estimateGasCost = (gasPriceGwei = DEFAULT_GAS_PRICE_GWEI) => {
    const gasPriceEth = gasPriceGwei / 1e9;
    return gasPriceEth * GAS_LIMIT;
};

const prepareSendTransaction = async ({
    fromAddress,
    toAddress,
    amount,
    chainId,
}: PrepareSendParams) => {
    const issues: string[] = [];

    if (!isValidAddress(toAddress)) {
        issues.push("Alamat tujuan tidak valid. Pastikan formatnya 0x...");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        issues.push("Jumlah yang ingin dikirim harus lebih besar dari 0.");
    }

    const balanceData = await checkBalance(fromAddress, chainId);
    const tokenSymbol = balanceData.tokenSymbol || "MNT";
    const chainName = balanceData.formattedChainName;
    const chainIdResolved = balanceData.chainId || chainId;
    const balanceValue = parseFloat(balanceData.balanceEth);
    const hasBalance = Number.isFinite(balanceValue)
        ? balanceValue >= amount
        : false;

    if (!hasBalance) {
        issues.push(
            `Saldo kamu di ${chainName} hanya ${balanceData.balanceEth} ${tokenSymbol}.`,
        );
    }

    const gasEstimateEth = estimateGasCost();
    const totalEstimate = amount + gasEstimateEth;

    return {
        success: issues.length === 0,
        preview: {
            fromAddress,
            toAddress,
            amount,
            amountFormatted: `${formatNumber(amount)} ${tokenSymbol}`,
            tokenSymbol,
            chainId: chainIdResolved,
            chainName,
            gasEstimate: `${formatNumber(gasEstimateEth)} ${tokenSymbol}`,
            totalEstimate: `${formatNumber(totalEstimate)} ${tokenSymbol}`,
        },
        validations: {
            hasBalance,
            issues,
        },
    };
};

// Helper to call Gemini API via fetch (UNCHANGED)
async function callGemini(
    messages: ChatRequestBody["messages"],
    tools: any[],
    apiKey: string,
    modelName: string = "gemma-3-27b-it"
) {
    const cleanKey = apiKey.trim();
    const encodedKey = encodeURIComponent(cleanKey);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodedKey}`;

    const contents = messages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
    }));

    const isGemma = modelName.toLowerCase().includes("gemma");
    const toolsConfig = (!isGemma && tools.length > 0) ? {
        function_declarations: tools
    } : undefined;

    const payload = {
        contents,
        tools: toolsConfig ? [toolsConfig] : undefined
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        const maskedUrl = url.replace(encodedKey, "HIDDEN");
        const keyDebug = `Len:${cleanKey.length} Prx:${cleanKey.substring(0, 4)}`;
        throw new Error(`Gemini API Error: ${response.status} - ${errorText}. URL: ${maskedUrl} KeyDeb: ${keyDebug}`);
    }

    return await response.json();
}

export async function POST(request: Request) {
    let body: ChatRequestBody | undefined;
    let parsedIntent: any;

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY belum diset");
        }

        body = (await request.json()) as ChatRequestBody;

        console.log("\n🔥 AI CHAT ROUTE CALLED");
        console.log("  Last message:", body.messages[body.messages.length - 1]?.content.substring(0, 100));
        console.log("  Wallet connected:", body.walletContext?.isConnected);
        console.log("  Chain ID:", body.walletContext?.chainId);

        if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
            return NextResponse.json(
                { error: "Messages wajib berupa array yang tidak kosong." },
                { status: 400 },
            );
        }

        const lastMessage = body.messages[body.messages.length - 1];
        parsedIntent = parseIntent(lastMessage.content);

        const resolvedChainId = body.walletContext?.chainId ?? parsedIntent.entities.chainId ?? 5003;

        console.log("[AI API] Processing message:", lastMessage.content);

        if (parsedIntent.intent === "GET_BALANCE" && !body.walletContext?.isConnected) {
            return NextResponse.json({ message: "Hubungkan wallet kamu dulu supaya aku bisa cek saldo di Mantle.", intent: parsedIntent });
        }

        // Build System Prompt Context
        let systemInstructionText = SYSTEM_PROMPT;

        // Add ReAct Instructions for Gemma (UNCHANGED)
        systemInstructionText += `

ATURAN KHUSUS UNTUK MEMANGGIL FUNCTION (TOOL CALLING):
Kamu memiliki akses ke tools berikut:
1. checkBalance(address: string, chainId: number)
2. analyzePortfolio(address: string, chainId: number)
3. analyzeTokenActivity(address: string, chainId: number, timeframeDays?: number)
4. analyzeWhaleActivity(address: string, chainId: number)  <-- NEW
5. analyzeCounterparty(address: string, chainId: number)   <-- NEW
6. prepareTransaction(toAddress: string, amount: number, chainId: number)

JIKA user meminta sesuatu yang membutuhkan tool tersebut, JANGAN LANGSUNG MENJAWAB.
Sebaliknya, keluarkan output JSON valid di dalam blok kode \`\`\`json\`\`\` seperti ini:

\`\`\`json
{
  "tool": "checkBalance",
  "args": {
    "address": "0x...",
    "chainId": 5003
  }
}
\`\`\`

Tunggu system memberikan hasil eksekusi tool tersebut sebelum menjawab final.
`;

        if (body.walletContext?.isConnected) {
            systemInstructionText += `\n\nContext Wallet: Address=${body.walletContext.address}, Chain=${body.walletContext.chainId}`;
        }

        const augmentedMessages = [...body.messages];
        augmentedMessages[augmentedMessages.length - 1].content = `${systemInstructionText}\n\nUser Question: ${lastMessage.content}`;

        // Initial Call
        let geminiResponse = await callGemini(
            augmentedMessages,
            tools,
            apiKey,
            "gemma-3-27b-it" // KEEP YOUR FRIEND'S MODEL CHOICE
        );

        let candidate = geminiResponse.candidates?.[0];
        let parts = candidate?.content?.parts || [];
        let transactionPreviewData: any = null;

        // Function Calling Logic (Hybrid: Native + Text Parse)
        let functionCallData = null;
        let functionCallPart = parts.find((p: any) => p.functionCall);

        // 1. Try Native Function Call
        if (functionCallPart) {
            functionCallData = {
                name: functionCallPart.functionCall.name,
                args: functionCallPart.functionCall.args
            };
        }
        // 2. Try Text-based JSON parsing (for Gemma)
        else {
            const fullText = parts.map((p: any) => p.text).join("");
            const jsonMatch = fullText.match(/```json\s*({[\s\S]*?})\s*```/);
            if (jsonMatch) {
                try {
                    const parsed = JSON.parse(jsonMatch[1]);
                    if (parsed.tool && parsed.args) {
                        console.log("[AI API] Detected Text-based Tool Call:", parsed.tool);
                        functionCallData = {
                            name: parsed.tool,
                            args: parsed.args
                        };
                    }
                } catch (e) {
                    console.log("[AI API] JSON Parse Error in ReAct:", e);
                }
            }
        }

        if (functionCallData) {
            const { name, args } = functionCallData;
            console.log("[AI API] Executing Function:", name);

            if (name === "checkBalance") {
                const targetAddress = args.address ?? body.walletContext?.address;
                const targetChainId = args.chainId ?? resolvedChainId;
                let functionResult;
                try {
                    functionResult = await checkBalance(targetAddress, targetChainId);
                } catch (e: any) {
                    functionResult = { error: e.message };
                }
                const followUpContent = `System: Result of tool ${name}: ${JSON.stringify(functionResult)}. Explain this to user.`;
                augmentedMessages.push({ role: "assistant", content: parts.map((p: any) => p.text).join("") });
                augmentedMessages.push({ role: "user", content: followUpContent });
                geminiResponse = await callGemini(augmentedMessages, [], apiKey, "gemma-3-27b-it");

            } else if (name === "analyzePortfolio") {
                try {
                    const result = await getPortfolioAnalysis(args.address ?? body.walletContext?.address, args.chainId ?? resolvedChainId);
                    const followUpContent = `System: Portfolio analysis complete. Data: ${JSON.stringify(result.data)}. Format response in Bahasa Indonesia.`;
                    augmentedMessages.push({ role: "assistant", content: parts.map((p: any) => p.text).join("") });
                    augmentedMessages.push({ role: "user", content: followUpContent });
                    geminiResponse = await callGemini(augmentedMessages, [], apiKey, "gemma-3-27b-it");
                } catch (error: any) {
                    const followUpContent = `System: Error: ${error.message}`;
                    augmentedMessages.push({ role: "assistant", content: parts.map((p: any) => p.text).join("") });
                    augmentedMessages.push({ role: "user", content: followUpContent });
                    geminiResponse = await callGemini(augmentedMessages, [], apiKey, "gemma-3-27b-it");
                }

            } else if (name === "analyzeTokenActivity") {
                try {
                    const result = await getTokenActivity(args.address ?? body.walletContext?.address, args.chainId ?? resolvedChainId, args.timeframeDays);
                    const followUpContent = `System: Token activity result: ${JSON.stringify(result.data)}. Explain to user.`;
                    augmentedMessages.push({ role: "assistant", content: parts.map((p: any) => p.text).join("") });
                    augmentedMessages.push({ role: "user", content: followUpContent });
                    geminiResponse = await callGemini(augmentedMessages, [], apiKey, "gemma-3-27b-it");
                } catch (error: any) {
                    const followUpContent = `System: Error: ${error.message}`;
                    augmentedMessages.push({ role: "assistant", content: parts.map((p: any) => p.text).join("") });
                    augmentedMessages.push({ role: "user", content: followUpContent });
                    geminiResponse = await callGemini(augmentedMessages, [], apiKey, "gemma-3-27b-it");
                }

            // ✅ NEW HANDLER: WHALE ACTIVITY
            } else if (name === "analyzeWhaleActivity") {
                try {
                    const result = await getWhaleActivity(args.address ?? body.walletContext?.address, args.chainId ?? resolvedChainId, args.timeframeDays);
                    const followUpContent = `System: Whale analysis result: ${JSON.stringify(result.data)}. Explain if user is a whale.`;
                    augmentedMessages.push({ role: "assistant", content: parts.map((p: any) => p.text).join("") });
                    augmentedMessages.push({ role: "user", content: followUpContent });
                    geminiResponse = await callGemini(augmentedMessages, [], apiKey, "gemma-3-27b-it");
                } catch (error: any) {
                    const followUpContent = `System: Error: ${error.message}`;
                    augmentedMessages.push({ role: "assistant", content: parts.map((p: any) => p.text).join("") });
                    augmentedMessages.push({ role: "user", content: followUpContent });
                    geminiResponse = await callGemini(augmentedMessages, [], apiKey, "gemma-3-27b-it");
                }

            // ✅ NEW HANDLER: COUNTERPARTY ANALYSIS
            } else if (name === "analyzeCounterparty") {
                try {
                    const result = await getCounterpartyAnalysis(args.address ?? body.walletContext?.address, args.chainId ?? resolvedChainId, args.timeframeDays);
                    const followUpContent = `System: Counterparty analysis result: ${JSON.stringify(result.data)}. Explain who they interact with.`;
                    augmentedMessages.push({ role: "assistant", content: parts.map((p: any) => p.text).join("") });
                    augmentedMessages.push({ role: "user", content: followUpContent });
                    geminiResponse = await callGemini(augmentedMessages, [], apiKey, "gemma-3-27b-it");
                } catch (error: any) {
                    const followUpContent = `System: Error: ${error.message}`;
                    augmentedMessages.push({ role: "assistant", content: parts.map((p: any) => p.text).join("") });
                    augmentedMessages.push({ role: "user", content: followUpContent });
                    geminiResponse = await callGemini(augmentedMessages, [], apiKey, "gemma-3-27b-it");
                }

            } else if (name === "prepareTransaction") {
                // (UNCHANGED LOGIC)
                if (!body.walletContext?.isConnected) {
                    const followUpContent = `System: User is not connected. Tell them to connect wallet first.`;
                    augmentedMessages.push({ role: "assistant", content: parts.map((p: any) => p.text).join("") });
                    augmentedMessages.push({ role: "user", content: followUpContent });
                    geminiResponse = await callGemini(augmentedMessages, [], apiKey, "gemma-3-27b-it");
                } else {
                    const fromAddress = body.walletContext.address;
                    const result = await prepareSendTransaction({
                        fromAddress,
                        toAddress: args.toAddress,
                        amount: args.amount,
                        chainId: args.chainId
                    });

                    if (result.success) {
                        transactionPreviewData = result;
                        const followUpContent = `System: Transaction prepared. Preview: ${JSON.stringify(result.preview)}. Ask user to confirm.`;
                        augmentedMessages.push({ role: "assistant", content: parts.map((p: any) => p.text).join("") });
                        augmentedMessages.push({ role: "user", content: followUpContent });
                        geminiResponse = await callGemini(augmentedMessages, [], apiKey, "gemma-3-27b-it");
                    } else {
                        const followUpContent = `System: Failed. Issues: ${result.validations.issues.join(", ")}. Explain to user.`;
                        augmentedMessages.push({ role: "assistant", content: parts.map((p: any) => p.text).join("") });
                        augmentedMessages.push({ role: "user", content: followUpContent });
                        geminiResponse = await callGemini(augmentedMessages, [], apiKey, "gemma-3-27b-it");
                    }
                }
            }

            candidate = geminiResponse.candidates?.[0];
            parts = candidate?.content?.parts || [];
        }

        const finalText = parts.map((p: any) => p.text).join("");

        return NextResponse.json({
            message: finalText,
            intent: parsedIntent,
            transactionPreview: transactionPreviewData,
        });

    } catch (error: any) {
        console.error("[AI API] Manual Fetch Error:", error);
        const safeIntent = parsedIntent || { intent: "UNKNOWN", confidence: 0, entities: {} };
        const isConnected = !!body?.walletContext?.isConnected;

        const fallbackMessage = isConnected
            ? `Halo! Saya Nova AI (Gemma). Maaf, ada kendala sistem. Error: ${error.message}.`
            : `Halo! Saya Nova AI (Gemma). Silakan hubungkan wallet. (Error: ${error.message})`;

        return NextResponse.json({
            message: fallbackMessage,
            intent: safeIntent,
            debug: { error: error.message }
        });
    }
}