"use client";

import { useState, useRef } from "react";
import { useAccount, useSendTransaction, useChainId } from "wagmi";
import { parseEther } from "viem";
import { useCopilotAction } from "@copilotkit/react-core";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

// Components
import { TransactionCard } from "@/components/chat/TransactionCard";
import { BalanceCard } from "@/components/chat/BalanceCard";
import { MultiChainBalanceCard } from "@/components/chat/MultiChainBalanceCard";
import { InfoCard } from "@/components/chat/InfoCard";
import { SlippageCard } from "@/components/chat/SlippageCard";

/**
 * Validates Ethereum address format
 * Returns object with validation result
 */
function validateEthereumAddress(address: string | undefined): {
    isValid: boolean;
    normalizedAddress?: string;
    error?: string;
} {
    if (!address) {
        return { isValid: true };
    }

    if (address.includes('.')) {
        return {
            isValid: false,
            error: "❌ ENS names and domain names (like 'vitalik.eth') are not supported yet. Please use the raw Ethereum address format (0x... with 42 characters)."
        };
    }

    // Add 0x prefix if missing
    const cleanAddress = address.startsWith('0x') ? address : '0x' + address;

    // Check format: 0x followed by 40 hex characters
    if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
        if (cleanAddress.length !== 42) {
            return {
                isValid: false,
                error: `❌ Address has incorrect length. Ethereum addresses must be exactly 40 hex characters (42 with '0x' prefix). Received: ${address.length} characters.`
            };
        }

        return {
            isValid: false,
            error: "❌ Invalid address format. Address must contain only hexadecimal characters (0-9, a-f, A-F)."
        };
    }

    return {
        isValid: true,
        normalizedAddress: cleanAddress.toLowerCase()  // ✅ FIX: Convert to lowercase
    };
}

export function useNovaActions() {
    const { isConnected, address } = useAccount();
    const chainId = useChainId();
    const { sendTransaction } = useSendTransaction();

    // State to store balance data for Generative UI
    const [balanceData, setBalanceData] = useState<{
        balance: string;
        tokenSymbol: string;
        chainName: string;
    } | null>(null);

    // Ref for multi-chain balances (synchronous access in render)
    const multiChainBalancesRef = useRef<{
        chainName: string;
        balance: string;
        symbol: string;
    }[] | null>(null);

    // State for slippage prediction
    const slippageDataRef = useRef<{
        best_venue: string;
        quotes: any[];
        symbol: string;
        amount: number;
        side: "buy" | "sell";
    } | null>(null);

    // State to trigger re-render after data is set in refs
    const [, forceUpdate] = useState(0);

    const FIXED_PORTFOLIO_DESCRIPTION = `Analisis portfolio wallet di SATU chain tertentu.

Shows token holdings, P&L, and current values.

Use this when:
- User explicitly mentions a chain: "portfolio on Ethereum"
- You're calling it as part of a multi-chain analysis

For multi-chain portfolio analysis, use analyzePortfolioAllChains instead.`;

    // ============================================
    // ACTION: Check Balance
    // ============================================
    useCopilotAction({
        name: "checkBalance",
        description: "Cek saldo wallet user di blockchain tertentu. Gunakan ini ketika user mau tahu saldo mereka, cek balance, atau lihat berapa crypto yang dimiliki.",
        parameters: [
            { name: "chainId", type: "number", description: "The chain ID to check balance on (e.g., 5000 for Mantle Mainnet, 5003 for Mantle Sepolia)", required: false },
        ],
        handler: async ({ chainId: targetChainId }) => {
            console.log("🔥 checkBalance action called!", { targetChainId }); // DEBUG
            if (!isConnected || !address) {
                return "User wallet is not connected. Please ask the user to connect their wallet first.";
            }

            try {
                const resolvedChainId = targetChainId || chainId;
                const response = await fetch("/api/wallet/balance", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ address, chainId: resolvedChainId }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    setBalanceData(null);
                    return `Error checking balance: ${error.error || "Unknown error"}`;
                }

                const data = await response.json();
                setBalanceData({
                    balance: data.balanceEth,
                    tokenSymbol: data.tokenSymbol,
                    chainName: data.formattedChainName,
                });
                return `Saldo user: ${data.balanceEth} ${data.tokenSymbol} di ${data.formattedChainName}. Card balance sudah ditampilkan.`;
            } catch (error: any) {
                setBalanceData(null);
                return `Error: ${error.message}`;
            }
        },
        render: ({ status }) => {
            if (status === "executing") {
                return (
                    <div className="flex items-center gap-2 p-4 bg-purple-50 rounded-xl border border-purple-100 max-w-sm mt-3">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-purple-700">Checking balance...</span>
                    </div>
                );
            }
            if (status === "complete" && balanceData && address) {
                return (
                    <BalanceCard
                        balance={balanceData.balance}
                        tokenSymbol={balanceData.tokenSymbol}
                        chainName={balanceData.chainName}
                        address={address}
                    />
                );
            }
            return <></>;
        },
    });

    // ============================================
    // ACTION: Check All Balances
    // ============================================
    useCopilotAction({
        name: "checkAllBalances",
        description: "Cek saldo wallet user di SEMUA chain yang tersedia sekaligus. Gunakan ini ketika user mau lihat semua saldo, cek portfolio, atau lihat balance di setiap chain.",
        handler: async () => {
            console.log("🔥 checkAllBalances action called!"); // DEBUG
            if (!isConnected || !address) {
                return "User wallet is not connected. Please ask the user to connect their wallet first.";
            }

            try {
                // Fetch balances from all supported chains
                const chainIds = [11155111, 5003, 84532, 11155420, 4202, 80002, 421614];
                const balancePromises = chainIds.map(async (cid) => {
                    try {
                        const response = await fetch("/api/wallet/balance", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ address, chainId: cid }),
                        });
                        if (response.ok) {
                            const data = await response.json();
                            return {
                                chainName: data.formattedChainName,
                                balance: data.balanceEth,
                                symbol: data.tokenSymbol,
                            };
                        }
                        return null;
                    } catch {
                        return null;
                    }
                });

                const results = await Promise.all(balancePromises);
                const validBalances = results.filter((b): b is NonNullable<typeof b> => b !== null);

                console.log("🔥 checkAllBalances results:", validBalances); // DEBUG
                multiChainBalancesRef.current = validBalances;
                forceUpdate(n => n + 1); // Trigger re-render
                console.log("🔥 multiChainBalances ref set to:", validBalances.length, "chains"); // DEBUG

                const nonZero = validBalances.filter(b => parseFloat(b.balance) > 0);
                return `Berhasil mengambil saldo dari ${validBalances.length} chains. ${nonZero.length} chains memiliki saldo > 0. Lihat card portfolio di atas.`;
            } catch (error: any) {
                console.log("🔥 checkAllBalances error:", error); // DEBUG
                multiChainBalancesRef.current = null;
                return `Error: ${error.message}`;
            }
        },
        render: ({ status }) => {
            if (status === "executing") {
                return (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-md mt-3 shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 
                                                          flex items-center justify-center animate-pulse">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Checking all chains...</p>
                                <p className="text-sm text-gray-500">Fetching balances from 7 networks</p>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-7 gap-1">
                            {[...Array(7)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-1.5 rounded-full bg-purple-200 animate-pulse"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                />
                            ))}
                        </div>
                    </div>
                );
            }
            if (status === "complete" && multiChainBalancesRef.current && address) {
                console.log("🔥 Rendering MultiChainBalanceCard with:", multiChainBalancesRef.current); // DEBUG
                return (
                    <MultiChainBalanceCard
                        balances={multiChainBalancesRef.current}
                        address={address}
                    />
                );
            }
            return <></>;
        },
    });

    // ============================================
    // ACTION: Prepare Transaction
    // ============================================
    useCopilotAction({
        name: "prepareTransaction",
        description: "Prepare a cryptocurrency transaction for the user to sign. Use this when the user wants to send money.",
        parameters: [
            { name: "recipient", type: "string", description: "The recipient wallet address (0x...)" },
            { name: "amount", type: "string", description: "The amount of native tokens to send (e.g., 0.1)" },
            { name: "chainId", type: "number", description: "The chain ID for the transaction", required: false },
        ],
        render: ({ status, args }) => {
            if (status === "executing") {
                return <div className="text-muted-foreground">Preparing transaction...</div>;
            }

            if (status === "complete" && args.recipient && args.amount) {
                return (
                    <TransactionCard
                        type="send"
                        data={{
                            token: "MNT",
                            amount: args.amount,
                            network: "Mantle",
                            recipient: args.recipient,
                            gasFee: "< 0.01 MNT",
                        }}
                        onCancel={() => {
                            toast.info("Transaction cancelled");
                        }}
                        onConfirm={() => {
                            try {
                                sendTransaction({
                                    to: args.recipient as `0x${string}`,
                                    value: parseEther(args.amount),
                                }, {
                                    onSuccess: (hash) => {
                                        toast.success("Transaction submitted!", {
                                            description: `Hash: ${hash.slice(0, 10)}...${hash.slice(-8)}`
                                        });
                                    },
                                    onError: (error) => {
                                        toast.error("Transaction failed", {
                                            description: error.message
                                        });
                                    }
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                                toast.error("Error", { description: errorMessage });
                            }
                        }}
                    />
                );
            }

            return <></>;
        },
        handler: async ({ recipient, amount, chainId: targetChainId }) => {
            if (!isConnected || !address) {
                return "User wallet is not connected. Please ask the user to connect their wallet first.";
            }

            // Validate address
            if (!recipient || !recipient.startsWith("0x") || recipient.length !== 42) {
                return "Invalid recipient address. Please provide a valid Ethereum address (0x...).";
            }

            // Validate amount
            const amountNum = parseFloat(amount);
            if (isNaN(amountNum) || amountNum <= 0) {
                return "Invalid amount. Please provide a valid positive number.";
            }

            return `Transaction prepared: Sending ${amount} tokens to ${recipient}. Please confirm the transaction in the UI above.`;
        },
    });

    // ============================================
    // ACTION: Predict Trade Cost
    // ============================================
    useCopilotAction({
        name: "predictTradeCost",
        description: "Predicts execution cost and slippage for a trade. Use this when user wants to analyze trade cost, check slippage, or compare exchanges for CEX (Binance, Kraken, etc).",
        parameters: [
            { name: "symbol", type: "string", description: "Trading pair symbol (e.g., BTC/USDT, ETH/USDT)" },
            { name: "amount", type: "number", description: "Amount of crypto to trade" },
            { name: "side", type: "string", description: "Trade side: 'buy' or 'sell'" },
        ],
        render: ({ status, args }) => {
            if (status === "complete" && slippageDataRef.current) {
                return (
                    <SlippageCard
                        symbol={slippageDataRef.current.symbol}
                        amount={slippageDataRef.current.amount}
                        side={slippageDataRef.current.side}
                        quotes={slippageDataRef.current.quotes}
                    />
                );
            }
            if (status === "executing") {
                return <div className="text-sm text-gray-500 italic animate-pulse">🤖 Analyzing market depth & predicted slippage...</div>;
            }
            return <></>;
        },
        handler: async ({ symbol, amount, side }) => {
            console.log("🔥 predictTradeCost action called!", { symbol, amount, side }); // DEBUG
            try {
                // Determine side if not provided or valid
                const tradeSide = (side && ['buy', 'sell'].includes(side.toLowerCase())) ? side.toLowerCase() : 'sell';

                const response = await fetch("/api/ai/predict-cost", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ symbol: symbol.toUpperCase(), amount, side: tradeSide }),
                });

                if (!response.ok) throw new Error("Failed to fetch prediction");

                const data = await response.json();

                slippageDataRef.current = {
                    ...data,
                    symbol: symbol.toUpperCase(),
                    amount,
                    side: tradeSide as "buy" | "sell"
                };
                forceUpdate(n => n + 1); // Trigger render

                return `Prediction complete. View the card above.`;
            } catch (error: any) {
                console.error("🔥 predictTradeCost error:", error);

                // Fallback Mock Data if API fails (for demo/resilience)
                const mockQuotes = [
                    { exchange: "binance", quote_price: 98000 * (amount || 1), predicted_slippage_pct: 0.001, total_cost: 98150 * (amount || 1), fees: { trading_fee: 50, slippage_cost: 100 } },
                    { exchange: "kraken", quote_price: 98050 * (amount || 1), predicted_slippage_pct: 0.0015, total_cost: 98250 * (amount || 1), fees: { trading_fee: 60, slippage_cost: 140 } },
                    { exchange: "coinbase", quote_price: 98100 * (amount || 1), predicted_slippage_pct: 0.002, total_cost: 98400 * (amount || 1), fees: { trading_fee: 80, slippage_cost: 220 } },
                ];

                slippageDataRef.current = {
                    best_venue: "binance",
                    quotes: mockQuotes,
                    symbol: symbol.toUpperCase(),
                    amount,
                    side: (side && ['buy', 'sell'].includes(side.toLowerCase())) ? (side.toLowerCase() as "buy" | "sell") : 'sell'
                };
                forceUpdate(n => n + 1);

                return `API Error (${error.message}). Showing simulated data for demonstration.`;
            }
        },
    });

    // ============================================
    // ACTION: Show Receive Address
    // ============================================
    useCopilotAction({
        name: "showReceiveAddress",
        description: "Tampilkan alamat wallet user dengan QR code untuk menerima crypto. Gunakan ini ketika user ingin menerima token, melihat alamat wallet mereka, meminta QR code, atau share address.",
        handler: async () => {
            if (!isConnected || !address) {
                return "User wallet is not connected. Please ask the user to connect their wallet first.";
            }

            return `Alamat wallet user: ${address}. QR code dan tombol copy sudah ditampilkan di atas.`;
        },
        render: ({ status }) => {
            // Always show the receive card when action is complete
            if (status === "complete" && address) {
                return (
                    <TransactionCard
                        type="receive"
                        data={{
                            address: address,
                            token: "MNT",
                        }}
                        onClose={() => { }}
                    />
                );
            }
            if (status === "executing") {
                return <div className="text-muted-foreground text-sm">Generating QR code...</div>;
            }
            return <></>;
        },
    });

    // ============================================
    // ACTION: Display Info Card
    // ============================================
    useCopilotAction({
        name: "displayInfoCard",
        description: "Tampilkan informasi umum dalam format card. JANGAN gunakan untuk menampilkan saldo/balance - gunakan checkBalance atau checkAllBalances untuk itu. Gunakan displayInfoCard hanya untuk: tips crypto, penjelasan blockchain, status transaksi, atau informasi edukasi.",
        parameters: [
            { name: "title", type: "string", description: "Judul card" },
            { name: "content", type: "string", description: "Konten utama card (opsional)", required: false },
            {
                name: "items",
                type: "object[]",
                description: "Array of items dengan label dan value untuk ditampilkan. Format: [{label: string, value: string}]",
                required: false
            },
            {
                name: "type",
                type: "string",
                description: "Tipe card: 'info' (biru), 'success' (hijau), 'warning' (kuning), 'error' (merah)",
                required: false
            },
        ],
        render: ({ status, args }) => {
            // BLOCK: Don't render anything balance/saldo related
            const blockedKeywords = ['saldo', 'balance', 'portfolio', 'chain 1', 'chain 2', 'eth', 'btc', 'bnb'];
            const titleLower = (args.title || '').toLowerCase();
            if (blockedKeywords.some(kw => titleLower.includes(kw))) {
                return <></>;  // Don't render fake balance cards
            }

            if (status === "complete" && args.title) {
                return (
                    <InfoCard
                        title={args.title}
                        content={args.content}
                        items={args.items as { label: string; value: string }[]}
                        type={args.type as "info" | "success" | "warning" | "error"}
                    />
                );
            }
            return <></>;
        },
        handler: async ({ title }) => {
            console.log("🔥 displayInfoCard action called!", { title }); // DEBUG

            // BLOCK: Reject balance-related requests
            const blockedKeywords = ['saldo', 'balance', 'portfolio'];
            const titleLower = (title || '').toLowerCase();
            if (blockedKeywords.some(kw => titleLower.includes(kw))) {
                return "ERROR: Jangan gunakan displayInfoCard untuk balance/saldo. Gunakan checkBalance atau checkAllBalances.";
            }

            return `Informasi "${title}" berhasil ditampilkan dalam format card.`;
        },
    });

    // ============================================
    // ACTION: Analyze Portfolio (All Tokens)
    // ============================================
    useCopilotAction({
        name: "analyzePortfolio",
        description: `⚠️ SINGLE-CHAIN ONLY - DO NOT use for general "analyze" queries.

Use analyzeWalletComprehensive instead for "analyze <address>".

Use this ONLY when:
- User explicitly says "portfolio on Ethereum"
- User asks "holdings on Lisk Sepolia"
- You need portfolio for ONE specific chain

For multi-chain or comprehensive analysis, use analyzeWalletComprehensive.`,
        parameters: [
            {
                name: "targetAddress",
                type: "string",
                description: "Wallet address (0x...)",
                required: false
            },
            {
                name: "chainId",
                type: "number",
                description: "REQUIRED: Must specify chain ID",
                required: true
            },
        ],
        handler: async ({ targetAddress, chainId: targetChainId }) => {
            console.log("🔥 analyzePortfolio action called!", { targetAddress, targetChainId });

            const validationError = validateEthereumAddress(targetAddress);
            if (validationError.isValid === false && validationError.error) {
                return validationError.error;
            }

            const walletAddress = validationError.normalizedAddress || targetAddress || address;

            if (!walletAddress) {
                return "No address provided and wallet is not connected. Please provide an address (0x...) or connect your wallet.";
            }

            try {
                // ✅ SMART CHAIN DEFAULT LOGIC
                let resolvedChainId = targetChainId;
                if (!resolvedChainId) {
                    const isExternalAddress = targetAddress && address && targetAddress.toLowerCase() !== address.toLowerCase();
                    if (isExternalAddress) {
                        resolvedChainId = 1;
                    } else {
                        resolvedChainId = chainId;
                    }
                }

                console.log(`📍 Using Chain ID: ${resolvedChainId} for address ${walletAddress}`);

                // Call blockchain API route (server-side)
                const response = await fetch('/api/blockchain', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'portfolio',
                        address: walletAddress,
                        chainId: resolvedChainId,
                        // ✅ DECISION CHOICE: Limit to 30 days to prevent 6-minute waits on whales
                        timeframeDays: 30
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch portfolio data');
                }

                const { data: result } = await response.json();

                if (result.data.type === 'portfolio') {
                    const portfolio = result.data.analysis;

                    // Format response for AI
                    let response = `✅ Portfolio Analysis Complete (${result.chain}):\n`;
                    response += `ℹ️ Snapshot: Analyzed recent activity (last 30 days) for performance.\n\n`;

                    const nativeTokenSymbol = result.metadata?.nativeToken || 'ETH';
                    response += `💰 Native Balance: ${portfolio.nativeBalance.toFixed(4)} ${nativeTokenSymbol}\n`;
                    response += `💵 Native Value: $${portfolio.nativeValueUSD.toFixed(2)}\n\n`;

                    if (portfolio.numTokens > 0) {
                        response += `📊 Token Holdings (Top Active):\n`;
                        portfolio.tokenHoldings.slice(0, 5).forEach((token: any, i: number) => {
                            response += `${i + 1}. ${token.tokenSymbol}: ${token.balance.toFixed(4)} tokens\n`;
                            if (token.currentValueUSD > 0) {
                                response += `   Value: $${token.currentValueUSD.toFixed(2)} | P&L: ${token.pnlPercentage > 0 ? '+' : ''}${token.pnlPercentage.toFixed(2)}%\n`;
                            }
                        });

                        if (portfolio.totalPortfolioValueUSD > portfolio.nativeValueUSD) {
                            response += `\n💼 Total Portfolio: $${portfolio.totalPortfolioValueUSD.toFixed(2)}\n`;
                        }
                    } else {
                        response += `ℹ️ No active ERC-20 tokens found in this period.`;
                    }

                    return response;
                }

                return "Failed to analyze portfolio. Please try again.";
            } catch (error: any) {
                console.error("Portfolio analysis error:", error);
                return `Error analyzing portfolio: ${error.message}`;
            }
        },
        render: ({ status }) => {
            if (status === "executing") {
                return <div className="text-sm text-muted-foreground animate-pulse">🔍 Analyzing recent portfolio activity...</div>;
            }
            return <></>;
        },
    });

    // ============================================
    // ACTION: Analyze Token Activity (Trading History)
    // ============================================
    useCopilotAction({
        name: "analyzeTokenActivity",
        description: `⚠️ SINGLE-CHAIN ONLY - DO NOT use for general "analyze" queries.

Use analyzeWalletComprehensive instead.

Use this ONLY when:
- User explicitly asks "trading activity on Ethereum"
- User says "P&L on Lisk Sepolia"

For comprehensive analysis, use analyzeWalletComprehensive.`,
        parameters: [
            {
                name: "targetAddress",
                type: "string",
                description: "Wallet address to analyze (0x...). If not provided, uses connected wallet address.",
                required: false
            },
            {
                name: "chainId",
                type: "number",
                description: "Chain ID untuk analisis",
                required: false
            },
            {
                name: "timeframeDays",
                type: "number",
                description: "Timeframe dalam hari (30, 90, 365, atau all-time)",
                required: false
            },
        ],
        handler: async ({ targetAddress, chainId: targetChainId, timeframeDays }) => {
            console.log("🔥 analyzeTokenActivity action called!", { targetAddress, targetChainId, timeframeDays });

            const validationError = validateEthereumAddress(targetAddress);
            if (validationError.isValid === false && validationError.error) {
                return validationError.error;
            }

            const walletAddress = validationError.normalizedAddress || targetAddress || address;

            if (!walletAddress) {
                return "No address provided and wallet is not connected. Please provide an address (0x...) or connect your wallet.";
            }

            try {
                // ✅ SMART CHAIN DEFAULT LOGIC
                let resolvedChainId = targetChainId;
                if (!resolvedChainId) {
                    const isExternalAddress = targetAddress && address && targetAddress.toLowerCase() !== address.toLowerCase();
                    if (isExternalAddress) {
                        resolvedChainId = 1; // Default to Mainnet for external
                    } else {
                        resolvedChainId = chainId; // Default to Connected for user
                    }
                }

                // Call blockchain API route (server-side)
                const response = await fetch('/api/blockchain', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'token_activity',
                        address: walletAddress,
                        chainId: resolvedChainId,
                        timeframeDays
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch token activity');
                }

                const { data: result } = await response.json();

                if (result.data.type === 'token_activity') {
                    const activity = result.data.analysis;
                    const summary = activity.summary;

                    let response = `✅ Token Activity Analysis (${result.chain}):\n`;
                    // ✅ Added explicit note about data scope
                    response += `ℹ️ Analysis based on most recent trading activity.\n\n`;

                    response += `📊 Trading Summary:\n`;
                    response += `• Tokens Bought: ${summary.numTokensBought}\n`;
                    response += `• Tokens Sold: ${summary.numTokensSold}\n`;
                    response += `• Total Invested: $${summary.totalInvestedUSD.toFixed(2)}\n`;
                    response += `• Current Value: $${summary.currentPortfolioValueUSD.toFixed(2)}\n`;
                    response += `• Realized P&L: ${summary.totalPnLPercentage > 0 ? '+' : ''}${summary.totalPnLPercentage.toFixed(2)}% ($${summary.totalPnL > 0 ? '+' : ''}${summary.totalPnL.toFixed(2)})\n\n`;

                    if (summary.mostProfitableToken) {
                        const best = summary.mostProfitableToken;
                        response += `🏆 Best Performer (in this period):\n`;
                        response += `   ${best.tokenSymbol}: +${best.pnlPercentage.toFixed(2)}% ($${best.pnl.toFixed(2)})\n\n`;
                    }

                    if (summary.biggestLoserToken && summary.biggestLoserToken.pnl < 0) {
                        const worst = summary.biggestLoserToken;
                        response += `📉 Worst Performer (in this period):\n`;
                        response += `   ${worst.tokenSymbol}: ${worst.pnlPercentage.toFixed(2)}% ($${worst.pnl.toFixed(2)})\n`;
                    }

                    return response;
                }

                return "Failed to analyze token activity. Please try again.";
            } catch (error: any) {
                console.error("Token activity error:", error);
                return `Error analyzing trading activity: ${error.message}`;
            }
        },
        render: ({ status }) => {
            if (status === "executing") {
                return <div className="text-sm text-muted-foreground animate-pulse">📊 Analyzing trading history & P&L...</div>;
            }
            return <></>;
        },
    });

    // ============================================
    // ACTION: Transaction Stats (Gas, Activity)
    // ============================================
    useCopilotAction({
        name: "getTransactionStats",
        description: `⚠️ SINGLE-CHAIN ONLY - DO NOT use for general "analyze" queries.

Use analyzeWalletComprehensive instead.

Use this ONLY when:
- User explicitly asks "gas spending on Ethereum"
- User says "transaction stats on Lisk"

For comprehensive analysis, use analyzeWalletComprehensive.`,
        parameters: [
            {
                name: "targetAddress",
                type: "string",
                description: "Wallet address to analyze (0x...)",
                required: false
            },
            {
                name: "chainId",
                type: "number",
                description: "Chain ID",
                required: false
            },
            {
                name: "timeframeDays",
                type: "number",
                description: "Timeframe in days (default: 180)",
                required: false
            },
        ],
        handler: async ({ targetAddress, chainId: targetChainId, timeframeDays }) => {  // ✅ ADD timeframeDays here!
            console.log("🔥 getTransactionStats action called!", { targetAddress, targetChainId, timeframeDays });

            const validationError = validateEthereumAddress(targetAddress);
            if (validationError.isValid === false && validationError.error) {
                return validationError.error;
            }

            const walletAddress = validationError.normalizedAddress || targetAddress || address;

            if (!walletAddress) {
                return "No address provided and wallet is not connected. Please provide an address (0x...) or connect your wallet.";
            }

            try {
                // ✅ SMART CHAIN DEFAULT LOGIC
                let resolvedChainId = targetChainId;
                if (!resolvedChainId) {
                    const isExternalAddress = targetAddress && address && targetAddress.toLowerCase() !== address.toLowerCase();
                    if (isExternalAddress) {
                        resolvedChainId = 1;
                    } else {
                        resolvedChainId = chainId;
                    }
                }

                // Call blockchain API route (server-side)
                const response = await fetch('/api/blockchain', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'transaction_stats',
                        address: walletAddress,
                        chainId: resolvedChainId,
                        timeframeDays: timeframeDays || 180  // ✅ NOW WORKS!
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch transaction stats');
                }

                const { data: result } = await response.json();

                if (result.data.type === 'transaction_stats') {
                    const stats = result.data.stats;

                    let response = `✅ Transaction Statistics (${result.chain}):\n`;
                    response += `ℹ️ Analysis based on the latest ${stats.totalTransactions} transactions.\n\n`;

                    response += `📈 Activity Overview:\n`;
                    response += `• Analyzed Transactions: ${stats.totalTransactions}\n`;
                    response += `• Sent: ${stats.transactionsSent} | Received: ${stats.transactionsReceived}\n`;
                    response += `• Native Txs: ${stats.ethTransactions} | Token Txs: ${stats.erc20Transactions}\n\n`;

                    response += `⛽ Gas Spending:\n`;
                    response += `• Gas Spent: $${stats.totalGasSpentUSD.toFixed(2)}\n`;
                    response += `• Average per Tx: $${stats.averageGasPerTxUSD.toFixed(4)}\n\n`;

                    response += `📅 Account Info:\n`;
                    response += `• Account Age: ${stats.accountAgeDays} days\n`;
                    response += `• Activity Level: ${stats.activityFrequency}\n`;

                    return response;
                }

                return "Failed to get transaction stats. Please try again.";
            } catch (error: any) {
                console.error("Transaction stats error:", error);
                return `Error getting transaction stats: ${error.message}`;
            }
        },
        render: ({ status }) => {
            if (status === "executing") {
                return <div className="text-sm text-muted-foreground animate-pulse">⛽ Calculating gas & transaction stats...</div>;
            }
            return <></>;
        },
    });

    // ============================================
    // ACTION: Counterparty Analysis
    // ============================================

    useCopilotAction({
        name: "analyzeCounterparty",
        description: `⚠️ SINGLE-CHAIN ONLY - Analisis counterparties pada SATU chain spesifik.

✅ GUNAKAN INI HANYA JIKA user EXPLICITLY menyebut chain:
- "who did I interact with ON ETHEREUM"
- "exchanges on Lisk Sepolia"
- "DeFi protocols ON MANTLE"

❌ JANGAN gunakan ini untuk:
- "who have I been interacting with?" (pakai analyzeCounterpartyAllChains)
- "my exchanges" (pakai analyzeCounterpartyAllChains)
- "show me counterparties for 0x123..." (pakai analyzeCounterpartyAllChains)`,

        parameters: [
            {
                name: "targetAddress",
                type: "string",
                description: "Wallet address to analyze (0x...). If not provided, uses connected wallet address.",
                required: false
            },
            {
                name: "chainId",
                type: "number",
                description: "REQUIRED: Chain ID must be provided",
                required: true
            },
            {
                name: "timeframeDays",
                type: "number",
                description: "Timeframe dalam hari (30, 90, 365). Default 90 days.",
                required: false
            },
        ],
        handler: async ({ targetAddress, chainId: targetChainId, timeframeDays }) => {
            console.log("🔥 analyzeCounterparty action called!", { targetAddress, targetChainId, timeframeDays });

            const validationError = validateEthereumAddress(targetAddress);
            if (validationError.isValid === false && validationError.error) {
                return validationError.error;
            }

            const walletAddress = validationError.normalizedAddress || targetAddress || address;

            if (!walletAddress) {
                return "No address provided and wallet is not connected. Please provide an address (0x...) or connect your wallet.";
            }

            try {
                // ✅ SMART CHAIN DEFAULT LOGIC
                let resolvedChainId = targetChainId;
                if (!resolvedChainId) {
                    const isExternalAddress = targetAddress && address && targetAddress.toLowerCase() !== address.toLowerCase();
                    if (isExternalAddress) {
                        resolvedChainId = 1;
                    } else {
                        resolvedChainId = chainId;
                    }
                }

                // Call blockchain API route (server-side)
                const response = await fetch('/api/blockchain', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'counterparty',
                        address: walletAddress,
                        chainId: resolvedChainId,
                        // ✅ FORCE 30 DAYS DEFAULT for speed (unless user asked for more)
                        timeframeDays: timeframeDays || 30
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch counterparty data');
                }

                const { data: result } = await response.json();

                if (result.data.type === 'counterparty') {
                    const analysis = result.data.analysis;

                    let response = `✅ Counterparty Analysis (${result.chain}):\n`;
                    response += `ℹ️ Snapshot: Analyzed recent activity (${timeframeDays || 30} days).\n\n`;

                    response += `🤝 Interaction Summary:\n`;
                    response += `• Total Unique Addresses: ${analysis.totalUniqueCounterparties}\n`;
                    response += `• Known Exchanges: ${analysis.knownExchanges.length}\n`;
                    response += `• Known DeFi Protocols: ${analysis.knownDeFiProtocols.length}\n`;
                    response += `• Unknown Addresses: ${analysis.unknownAddresses.length}\n\n`;

                    if (analysis.knownExchanges.length > 0) {
                        response += `📊 Exchange Interactions:\n`;
                        analysis.knownExchanges.slice(0, 5).forEach((exchange: any) => {
                            response += `• ${exchange.label}: ${exchange.numTransactions} txs\n`;
                            response += `  Sent: $${exchange.totalValueSentUSD.toFixed(2)} | Received: $${exchange.totalValueReceivedUSD.toFixed(2)}\n`;
                        });
                        response += `\n`;
                    }

                    if (analysis.knownDeFiProtocols.length > 0) {
                        response += `🏦 DeFi Protocol Interactions:\n`;
                        analysis.knownDeFiProtocols.slice(0, 5).forEach((protocol: any) => {
                            response += `• ${protocol.label}: ${protocol.numTransactions} txs\n`;
                        });
                        response += `\n`;
                    }

                    if (analysis.unknownAddresses.length > 0) {
                        response += `❓ Top Unknown Addresses:\n`;
                        analysis.unknownAddresses.slice(0, 3).forEach((addr: any, i: number) => {
                            response += `${i + 1}. ${addr.address.substring(0, 10)}...${addr.address.substring(addr.address.length - 8)}\n`;
                            response += `   ${addr.numTransactions} txs | Type: ${addr.interactionType}\n`;
                        });
                    }

                    return response;
                }

                return "Failed to analyze counterparties. Please try again.";
            } catch (error: any) {
                console.error("Counterparty analysis error:", error);
                return `Error analyzing counterparties: ${error.message}`;
            }
        },
        render: ({ status }) => {
            if (status === "executing") {
                return <div className="text-sm text-muted-foreground animate-pulse">🤝 Analyzing recent interactions...</div>;
            }
            return <></>;
        },
    });

    // ============================================
    // ACTION: Whale Activity Analysis
    // ============================================

    useCopilotAction({
        name: "analyzeWhaleActivity",
        description: `⚠️ SINGLE-CHAIN ONLY - DO NOT use for general "analyze" queries.

Use analyzeWhaleActivityAllChains for multi-chain whale analysis.

Use this ONLY when:
- User explicitly says "whale activity ON ETHEREUM"
- User says "largest transactions ON MANTLE"

Extract chainId from chain name:
- "on Ethereum" → chainId: 1
- "on Lisk Sepolia" → chainId: 4202
- "on Mantle Sepolia" → chainId: 5003`,
        parameters: [
            {
                name: "targetAddress",
                type: "string",
                description: "Wallet address to analyze (0x...). If not provided, uses connected wallet address.",
                required: false
            },
            {
                name: "chainId",
                type: "number",
                description: "REQUIRED: Chain ID must be provided",
                required: true
            },
            {
                name: "timeframeDays",
                type: "number",
                description: "Timeframe dalam hari (30, 90, 180, 365). Default 180 days.",
                required: false
            },
            {
                name: "thresholdUSD",
                type: "number",
                description: "Minimum transaction value in USD to be considered 'whale'.",
                required: false
            },
        ],
        handler: async ({ targetAddress, chainId: targetChainId, timeframeDays, thresholdUSD }) => {
            console.log("🔥 analyzeWhaleActivity action called!", { targetAddress, targetChainId, timeframeDays, thresholdUSD });

            const validationError = validateEthereumAddress(targetAddress);
            if (validationError.isValid === false && validationError.error) {
                return validationError.error;
            }

            const walletAddress = validationError.normalizedAddress || targetAddress || address;

            if (!walletAddress) {
                return "No address provided and wallet is not connected. Please provide an address (0x...) or connect your wallet.";
            }

            try {
                // ✅ SMART CHAIN DEFAULT LOGIC
                let resolvedChainId = targetChainId;
                if (!resolvedChainId) {
                    const isExternalAddress = targetAddress && address && targetAddress.toLowerCase() !== address.toLowerCase();
                    if (isExternalAddress) {
                        resolvedChainId = 1;
                    } else {
                        resolvedChainId = chainId;
                    }
                }

                // ✅ FIXED THRESHOLD LOGIC
                // Lower threshold for own wallet ($10k), higher for external addresses ($50k)
                const isExternalAddress = targetAddress && address && targetAddress.toLowerCase() !== address.toLowerCase();
                const defaultThreshold = isExternalAddress ? 50000 : 10000;
                const whaleThreshold = thresholdUSD || defaultThreshold;

                console.log(`🐋 Using threshold: $${whaleThreshold.toLocaleString()} for ${isExternalAddress ? 'external' : 'own'} wallet`);

                // Call blockchain API route (server-side)
                const response = await fetch('/api/blockchain', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'whale',
                        address: walletAddress,
                        chainId: resolvedChainId,
                        timeframeDays: timeframeDays || (isExternalAddress ? 365 : 180),
                        whaleThresholdUSD: whaleThreshold
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch whale activity data');
                }

                const { data: result } = await response.json();

                if (result.data.type === 'whale') {
                    const analysis = result.data.analysis;

                    let response = `✅ Whale Activity Analysis (${result.chain}):\n`;
                    response += `Threshold: $${whaleThreshold.toLocaleString()}\n\n`;

                    response += `🐋 Transaction Summary:\n`;
                    response += `• Total Whale Transactions: ${analysis.numWhaleTransactions}\n`;
                    response += `• Total Value: $${analysis.totalWhaleValueUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n`;
                    response += `• Average per TX: $${analysis.averageWhaleTransactionUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n\n`;

                    if (analysis.largestTransaction) {
                        const largest = analysis.largestTransaction;
                        const date = new Date(largest.timestamp * 1000).toLocaleDateString();
                        response += `💰 Largest Transaction:\n`;
                        response += `• Value: $${largest.valueUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n`;
                        response += `• Direction: ${largest.direction}\n`;
                        response += `• Date: ${date}\n`;
                        if (largest.destinationLabel) {
                            response += `• Destination: ${largest.destinationLabel}\n`;
                        }
                        response += `\n`;
                    }

                    response += `📊 Exchange Flows:\n`;
                    response += `• Sent to Exchanges: $${analysis.exchangeFlows.sentToExchanges.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n`;
                    response += `• Received from Exchanges: $${analysis.exchangeFlows.receivedFromExchanges.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n`;
                    response += `• Net Flow: $${analysis.exchangeFlows.netExchangeFlow.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n`;

                    if (analysis.exchangeFlows.netExchangeFlow > 0) {
                        response += `⚠️ Net outflow to exchanges (possible selling pressure)\n`;
                    } else if (analysis.exchangeFlows.netExchangeFlow < 0) {
                        response += `✅ Net inflow from exchanges (accumulation)\n`;
                    }

                    if (analysis.whaleTransactions.length > 0) {
                        response += `\n📜 Recent Whale Transactions:\n`;
                        analysis.whaleTransactions.slice(0, 5).forEach((tx: any, i: number) => {
                            const date = new Date(tx.timestamp * 1000).toLocaleDateString();
                            response += `${i + 1}. $${tx.valueUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} - ${tx.direction} (${date})\n`;
                            if (tx.destinationLabel) {
                                response += `   → ${tx.destinationLabel}\n`;
                            }
                        });
                    }

                    return response;
                }

                return "Failed to analyze whale activity. Please try again.";
            } catch (error: any) {
                console.error("Whale activity error:", error);
                return `Error analyzing whale activity: ${error.message}`;
            }
        },
        render: ({ status }) => {
            if (status === "executing") {
                return <div className="text-sm text-muted-foreground animate-pulse">🐋 Analyzing large transactions...</div>;
            }
            return <></>;
        },
    });

    // ============================================
    // MULTI-CHAIN ACTION: Whale Activity (All Chains)
    // ============================================
    useCopilotAction({
        name: "analyzeWhaleActivityAllChains",
        description: `✅ MULTI-CHAIN whale analysis - Use when user asks about large transactions WITHOUT specifying a chain.

Examples:
- "show me my largest transactions" → Use this
- "whale activity for 0xd8dA..." → Use this
- "biggest transactions" → Use this

This checks ALL chains automatically.`,
        parameters: [
            {
                name: "targetAddress",
                type: "string",
                description: "Wallet address to analyze (0x...). If not provided, uses connected wallet address.",
                required: false
            },
            {
                name: "timeframeDays",
                type: "number",
                description: "Timeframe dalam hari (30, 90, 180, 365). Default 180 days.",
                required: false
            },
            {
                name: "thresholdUSD",
                type: "number",
                description: "Minimum transaction value in USD. Default $10,000.",
                required: false
            },
        ],
        handler: async ({ targetAddress, timeframeDays, thresholdUSD }) => {
            console.log("🔥 analyzeWhaleActivityAllChains action called!", { targetAddress, timeframeDays, thresholdUSD });

            const validation = validateEthereumAddress(targetAddress);
            if (!validation.isValid) {
                return validation.error!;
            }

            const walletAddress = validation.normalizedAddress || address;

            if (!walletAddress) {
                return "No address provided and wallet is not connected. Please provide an address (0x...) or connect your wallet.";
            }

            try {
                const isExternalAddress = walletAddress.toLowerCase() !== address?.toLowerCase();
                const defaultThreshold = isExternalAddress ? 50000 : 10000;
                const whaleThreshold = thresholdUSD || defaultThreshold;

                console.log(`🐋 Multi-chain using threshold: $${whaleThreshold.toLocaleString()} for ${isExternalAddress ? 'external' : 'own'} wallet`);

                const defaultTimeframe = isExternalAddress ? 90 : 180;
                const timeframe = timeframeDays || defaultTimeframe;

                const chains = isExternalAddress
                    ? [
                        { name: "Ethereum Mainnet", chainId: 1 },
                        { name: "Mantle Mainnet", chainId: 5000 },
                        { name: "Lisk Mainnet", chainId: 1135 },
                    ]
                    : [
                        { name: "Ethereum", chainId: 1 },
                        { name: "Ethereum Sepolia", chainId: 11155111 },
                        { name: "Mantle Sepolia", chainId: 5003 },
                        { name: "Lisk Sepolia", chainId: 4202 },
                    ];

                console.log(`🔍 Analyzing ${isExternalAddress ? 'external' : 'own'} address: ${walletAddress.substring(0, 10)}...`);
                console.log(`⏱️  Timeframe: ${timeframe} days | Checking ${chains.length} chains`);

                const results = await Promise.all(
                    chains.map(async (chain) => {
                        try {
                            console.log(`   📡 Fetching ${chain.name}...`);

                            const response = await fetch('/api/blockchain', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    action: 'whale',
                                    address: walletAddress,
                                    chainId: chain.chainId,
                                    timeframeDays: timeframe,
                                    whaleThresholdUSD: whaleThreshold
                                })
                            });

                            if (!response.ok) {
                                console.log(`   ❌ ${chain.name} failed (${response.status})`);
                                return null;
                            }

                            const { data: result } = await response.json();
                            if (result.data.type === 'whale') {
                                console.log(`   ✅ ${chain.name}: ${result.data.analysis.numWhaleTransactions} whale txs`);
                                return {
                                    chain: chain.name,
                                    analysis: result.data.analysis
                                };
                            }
                            return null;
                        } catch (error) {
                            console.error(`   ❌ Error fetching ${chain.name}:`, error);
                            return null;
                        }
                    })
                );

                const validResults = results.filter((r): r is NonNullable<typeof r> => r !== null);

                if (validResults.length === 0) {
                    return "❌ Failed to fetch whale activity from any chain. The address might be invalid or have no transaction history.";
                }

                let totalWhaleTransactions = 0;
                let totalValue = 0;
                let largestTx: any = null;
                let largestTxChain = "";

                validResults.forEach(result => {
                    totalWhaleTransactions += result.analysis.numWhaleTransactions;
                    totalValue += result.analysis.totalWhaleValueUSD;

                    if (result.analysis.largestTransaction) {
                        if (!largestTx || result.analysis.largestTransaction.valueUSD > largestTx.valueUSD) {
                            largestTx = result.analysis.largestTransaction;
                            largestTxChain = result.chain;
                        }
                    }
                });

                let response = `✅ Multi-Chain Whale Activity Analysis:\n`;
                response += `Address: ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}\n`;
                response += `Threshold: $${whaleThreshold.toLocaleString()} | Timeframe: ${timeframe} days\n\n`;

                response += `🐋 Overall Summary:\n`;
                response += `• Total Whale Transactions: ${totalWhaleTransactions} (across ${validResults.length} chains)\n`;
                response += `• Total Value: $${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n`;

                if (totalWhaleTransactions > 0) {
                    response += `• Average per TX: $${(totalValue / totalWhaleTransactions).toLocaleString(undefined, { maximumFractionDigits: 2 })}\n\n`;

                    if (largestTx) {
                        const date = new Date(largestTx.timestamp * 1000).toLocaleDateString();
                        response += `💰 Largest Transaction (on ${largestTxChain}):\n`;
                        response += `• Value: $${largestTx.valueUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n`;
                        response += `• Direction: ${largestTx.direction}\n`;
                        response += `• Date: ${date}\n`;
                        if (largestTx.destinationLabel) {
                            response += `• Destination: ${largestTx.destinationLabel}\n`;
                        }
                        response += `\n`;
                    }

                    response += `📊 Breakdown by Chain:\n`;
                    validResults.forEach(result => {
                        if (result.analysis.numWhaleTransactions > 0) {
                            response += `• ${result.chain}: ${result.analysis.numWhaleTransactions} txs ($${result.analysis.totalWhaleValueUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })})\n`;
                        }
                    });

                    if (isExternalAddress) {
                        response += `\n⚡ Note: Analysis limited to last ${timeframe} days for performance.`;
                    }
                } else {
                    response += `\nNo whale transactions found above $${whaleThreshold.toLocaleString()} across any checked chain in the last ${timeframe} days.`;

                    if (isExternalAddress) {
                        response += `\n\n💡 Tip: This analysis checked mainnet chains. If the address is on a testnet, results may be empty.`;
                    }
                }

                return response;
            } catch (error: any) {
                console.error("Multi-chain whale activity error:", error);
                return `Error analyzing whale activity: ${error.message}`;
            }
        },
        render: ({ status }) => {
            if (status === "executing") {
                return (
                    <div className="text-sm text-muted-foreground animate-pulse">
                        🐋 Analyzing whale activity across all chains...
                        <div className="text-xs mt-1 text-gray-400">Checking Ethereum, Mantle, Lisk...</div>
                    </div>
                );
            }
            return <></>;
        },
    });

    // ============================================
    // MULTI-CHAIN ACTION: Counterparty (All Chains)
    // ============================================

    useCopilotAction({
        name: "analyzeCounterpartyAllChains",
        description: `✅ MULTI-CHAIN counterparty analysis - Use when user asks about interactions WITHOUT specifying a chain.

Examples:
- "who have I been interacting with?" → Use this
- "my exchanges" → Use this
- "show counterparties for 0xd8dA..." → Use this

This checks ALL chains automatically.`,
        parameters: [
            {
                name: "targetAddress",
                type: "string",
                description: "Wallet address to analyze (0x...). If not provided, uses connected wallet address.",
                required: false
            },
            {
                name: "timeframeDays",
                type: "number",
                description: "Timeframe dalam hari (30, 90, 365). Default 90 days.",
                required: false
            },
        ],
        handler: async ({ targetAddress, timeframeDays }) => {
            console.log("🔥 analyzeCounterpartyAllChains action called!", { targetAddress, timeframeDays });

            const validation = validateEthereumAddress(targetAddress);
            if (!validation.isValid) {
                return validation.error!;
            }

            const walletAddress = validation.normalizedAddress || address;

            if (!walletAddress) {
                return "No address provided and wallet is not connected. Please provide an address (0x...) or connect your wallet.";
            }

            try {
                const timeframe = timeframeDays || 90;

                const chains = [
                    { name: "Ethereum", chainId: 1 },
                    { name: "Ethereum Sepolia", chainId: 11155111 },
                    { name: "Mantle Sepolia", chainId: 5003 },
                    { name: "Lisk Sepolia", chainId: 4202 },
                ];

                const results = await Promise.all(
                    chains.map(async (chain) => {
                        try {
                            const response = await fetch('/api/blockchain', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    action: 'counterparty',
                                    address: walletAddress,
                                    chainId: chain.chainId,
                                    timeframeDays: timeframe
                                })
                            });

                            if (!response.ok) return null;

                            const { data: result } = await response.json();
                            if (result.data.type === 'counterparty') {
                                return {
                                    chain: chain.name,
                                    analysis: result.data.analysis
                                };
                            }
                            return null;
                        } catch (error) {
                            console.error(`Error fetching ${chain.name}:`, error);
                            return null;
                        }
                    })
                );

                const validResults = results.filter((r): r is NonNullable<typeof r> => r !== null);

                if (validResults.length === 0) {
                    return "Failed to fetch counterparty data from any chain. Please try again.";
                }

                const allExchanges = new Map<string, any>();
                const allDeFiProtocols = new Map<string, any>();
                let totalCounterparties = 0;

                validResults.forEach(result => {
                    totalCounterparties += result.analysis.totalUniqueCounterparties;

                    result.analysis.knownExchanges.forEach((exchange: any) => {
                        const key = exchange.label;
                        if (allExchanges.has(key)) {
                            const existing = allExchanges.get(key)!;
                            existing.numTransactions += exchange.numTransactions;
                            existing.totalValueSentUSD += exchange.totalValueSentUSD;
                            existing.totalValueReceivedUSD += exchange.totalValueReceivedUSD;
                            existing.chains.push(result.chain);
                        } else {
                            allExchanges.set(key, {
                                ...exchange,
                                chains: [result.chain]
                            });
                        }
                    });

                    result.analysis.knownDeFiProtocols.forEach((protocol: any) => {
                        const key = protocol.label;
                        if (allDeFiProtocols.has(key)) {
                            const existing = allDeFiProtocols.get(key)!;
                            existing.numTransactions += protocol.numTransactions;
                            existing.chains.push(result.chain);
                        } else {
                            allDeFiProtocols.set(key, {
                                ...protocol,
                                chains: [result.chain]
                            });
                        }
                    });
                });

                let response = `✅ Multi-Chain Counterparty Analysis:\n`;
                response += `Timeframe: ${timeframe} days\n\n`;

                response += `🤝 Overall Summary:\n`;
                response += `• Total Unique Addresses: ${totalCounterparties} (across all chains)\n`;
                response += `• Known Exchanges: ${allExchanges.size}\n`;
                response += `• Known DeFi Protocols: ${allDeFiProtocols.size}\n\n`;

                if (allExchanges.size > 0) {
                    response += `📊 Exchange Interactions:\n`;
                    const sortedExchanges = Array.from(allExchanges.values())
                        .sort((a, b) => b.numTransactions - a.numTransactions)
                        .slice(0, 5);

                    sortedExchanges.forEach((exchange: any) => {
                        response += `• ${exchange.label}: ${exchange.numTransactions} txs\n`;
                        response += `  Sent: $${exchange.totalValueSentUSD.toFixed(2)} | Received: $${exchange.totalValueReceivedUSD.toFixed(2)}\n`;
                        response += `  Chains: ${exchange.chains.join(', ')}\n`;
                    });
                    response += `\n`;
                }

                if (allDeFiProtocols.size > 0) {
                    response += `🏦 DeFi Protocol Interactions:\n`;
                    const sortedProtocols = Array.from(allDeFiProtocols.values())
                        .sort((a, b) => b.numTransactions - a.numTransactions)
                        .slice(0, 5);

                    sortedProtocols.forEach((protocol: any) => {
                        response += `• ${protocol.label}: ${protocol.numTransactions} txs\n`;
                        response += `  Chains: ${protocol.chains.join(', ')}\n`;
                    });
                    response += `\n`;
                }

                response += `📊 Activity by Chain:\n`;
                validResults.forEach(result => {
                    const exchanges = result.analysis.knownExchanges.length;
                    const defi = result.analysis.knownDeFiProtocols.length;
                    response += `• ${result.chain}: ${result.analysis.totalUniqueCounterparties} addresses (${exchanges} exchanges, ${defi} DeFi)\n`;
                });

                return response;
            } catch (error: any) {
                console.error("Multi-chain counterparty error:", error);
                return `Error analyzing counterparties: ${error.message}`;
            }
        },
        render: ({ status }) => {
            if (status === "executing") {
                return (
                    <div className="text-sm text-muted-foreground animate-pulse">
                        🤝 Analyzing counterparties across all chains...
                        <div className="text-xs mt-1 text-gray-400">Checking Ethereum, Mantle, Lisk...</div>
                    </div>
                );
            }
            return <></>;
        },
    });

    // ============================================
    // 🚀 NEW SUPER ACTION: Comprehensive Analysis
    // ============================================
    useCopilotAction({
        name: "analyzeWalletComprehensive",
        description: `🎯 PRIMARY ACTION - Use this when user says "analyze <address>"

⚠️ CRITICAL: Do NOT resolve ENS names! Pass addresses exactly as user provides.
If user provides "vitalik.eth", pass "vitalik.eth" (validation will reject it).

This is a COMPLETE wallet analysis that runs ALL checks in ONE call:
✅ Portfolio holdings
✅ Whale transactions (>$50k)
✅ Counterparty analysis
✅ Transaction statistics
✅ Trading P&L

When to use:
- "analyze 0xd8dA..." → Use this
- "analyze that address" → Use this
- "comprehensive analysis" → Use this

When NOT to use:
- "check my balance" → Use checkBalance
- "whale activity on Ethereum" → Use analyzeWhaleActivity

This action is OPTIMIZED and calls the backend only ONCE.`,
        parameters: [
            {
                name: "targetAddress",
                type: "string",
                description: "Wallet address to analyze (0x...)",
                required: true
            },
            {
                name: "chainId",
                type: "number",
                description: "Chain ID (Default: 1 for Ethereum Mainnet)",
                required: false
            }
        ],
        handler: async ({ targetAddress, chainId: targetChainId }) => {
            console.log("🚀 analyzeWalletComprehensive called!", { targetAddress });

            if (targetAddress && targetAddress.includes('.')) {
                return "❌ CANNOT PROCEED: ENS names (like 'vitalik.eth') are not supported.\n\n" +
                    "I cannot resolve this to an address. Please ask the user to provide the raw Ethereum address (0x... format).\n\n" +
                    "DO NOT attempt to resolve this ENS name yourself. Wait for the user to provide a valid address.";
            }

            const validation = validateEthereumAddress(targetAddress);

            if (!validation.isValid) {
                return validation.error!;
            }

            const addressToUse = validation.normalizedAddress || targetAddress;
            const resolvedChainId = targetChainId || 1;

            // ✅ Use 365 days for external addresses (Vitalik's wallet is old)
            const isExternalAddress = addressToUse && address &&
                addressToUse.toLowerCase() !== address.toLowerCase();
            const timeframe = isExternalAddress ? 365 : 180;

            try {
                console.log(`📊 Starting comprehensive analysis...`);
                console.log(`   Address: ${addressToUse.substring(0, 10)}...`);
                console.log(`   Chain: ${resolvedChainId}`);
                console.log(`   Timeframe: ${timeframe} days`);

                const response = await fetch('/api/blockchain', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'comprehensive',
                        address: addressToUse,
                        chainId: resolvedChainId,
                        timeframeDays: timeframe,
                        whaleThresholdUSD: 50000
                    })
                });

                if (!response.ok) {
                    throw new Error(`API returned ${response.status}`);
                }

                const json = await response.json();

                // ✅ DEBUG: Log full response
                console.log('📦 Full API Response:', JSON.stringify(json, null, 2));

                // ✅ Handle two possible structures:
                // Structure 1: { data: { data: { type: 'comprehensive', ... } } }
                // Structure 2: { data: { type: 'comprehensive', ... } }

                let comprehensiveData;

                if (json.data?.data?.type === 'comprehensive') {
                    // Structure 1 (nested)
                    comprehensiveData = json.data.data;
                    console.log('✅ Using Structure 1 (nested data.data)');
                } else if (json.data?.type === 'comprehensive') {
                    // Structure 2 (flat)
                    comprehensiveData = json.data;
                    console.log('✅ Using Structure 2 (flat data)');
                } else {
                    console.error('❌ Unexpected structure:', json);
                    throw new Error('Invalid response structure from API');
                }

                // ✅ Extract data safely
                const portfolio = comprehensiveData.portfolio;
                const whale = comprehensiveData.whale;
                const counterparty = comprehensiveData.counterparty;
                const stats = comprehensiveData.stats;
                const tokenActivity = comprehensiveData.tokenActivity;

                console.log('📊 Data fields:', {
                    portfolio: !!portfolio,
                    whale: !!whale,
                    counterparty: !!counterparty,
                    stats: !!stats,
                    tokenActivity: !!tokenActivity
                });

                // ✅ Validate all required fields exist
                if (!portfolio || !whale || !counterparty || !stats || !tokenActivity) {
                    throw new Error('Missing required analysis data');
                }

                // ✅ Extract values with safe defaults
                const portfolioValue = portfolio.totalPortfolioValueUSD || 0;
                const numTokens = portfolio.numTokens || 0;
                const numWhaleTxs = whale.numWhaleTransactions || 0;
                const whaleValue = whale.totalWhaleValueUSD || 0;
                const numCounterparties = counterparty.totalUniqueCounterparties || 0;
                const gasSpent = stats.totalGasSpentUSD || 0;
                const totalTxs = stats.totalTransactions || 0;
                const pnl = tokenActivity.summary?.totalPnLPercentage || 0;

                console.log('✅ Extracted values:', {
                    portfolioValue,
                    numTokens,
                    numWhaleTxs,
                    numCounterparties,
                    totalTxs
                });

                // Build response
                const chain = json.chain || json.data?.chain || 'Unknown Chain';

                let msg = `✅ **Laporan Analisis Lengkap** untuk ${addressToUse.substring(0, 6)}...\n`;
                msg += `Chain: ${chain}\n\n`;

                msg += `💰 **Portfolio:** $${portfolioValue.toLocaleString()} (${numTokens} tokens)\n`;

                if (numWhaleTxs > 0) {
                    msg += `🐋 **Whale Activity:** TERDETEKSI. ${numWhaleTxs} transaksi besar (Total: $${whaleValue.toLocaleString()}).\n`;
                } else {
                    msg += `🐋 **Whale Activity:** Tidak ada transaksi >$50k dalam ${timeframe} hari terakhir.\n`;
                }

                msg += `🤝 **Interaksi:** ${numCounterparties} alamat unik.\n`;
                msg += `⛽ **Gas:** $${gasSpent.toFixed(2)} (${totalTxs} transaksi).\n`;
                msg += `📈 **Trading P&L:** ${pnl > 0 ? '+' : ''}${pnl.toFixed(2)}%\n\n`;
                msg += `ℹ️ *Analisis berdasarkan ${timeframe} hari terakhir.*`;

                return msg;

            } catch (error: any) {
                console.error('❌ Comprehensive analysis failed:', error);
                console.error('Stack:', error.stack);

                return `❌ Maaf, terjadi kesalahan:\n\n${error.message}\n\nSilakan coba lagi.`;
            }
        },
        render: ({ status }) => {
            if (status === "executing") {
                return (
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3 animate-pulse">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <div className="text-sm text-blue-800 font-medium">
                            Running Deep Scan...
                        </div>
                    </div>
                );
            }
            return <></>;
        }
    });

    // ============================================
    // analyzePortfolioAllChains
    // ============================================
    useCopilotAction({
        name: "analyzePortfolioAllChains",
        description: `✅ Multi-chain portfolio analysis - checks token holdings across ALL chains.`,
        parameters: [
            {
                name: "targetAddress",
                type: "string",
                description: "Wallet address to analyze (0x...)",
                required: false
            },
        ],
        handler: async ({ targetAddress }) => {
            console.log("🔥 analyzePortfolioAllChains called!", { targetAddress });

            const validation = validateEthereumAddress(targetAddress);
            if (!validation.isValid) {
                return validation.error!;
            }

            const walletAddress = validation.normalizedAddress || address;
            if (!walletAddress) {
                return "No address provided and wallet is not connected.";
            }

            try {
                const isExternal = walletAddress.toLowerCase() !== address?.toLowerCase();
                const chains = isExternal
                    ? [
                        { name: "Ethereum Mainnet", chainId: 1 },
                        { name: "Mantle Mainnet", chainId: 5000 },
                        { name: "Lisk Mainnet", chainId: 1135 },
                    ]
                    : [
                        { name: "Ethereum", chainId: 1 },
                        { name: "Ethereum Sepolia", chainId: 11155111 },
                        { name: "Mantle Sepolia", chainId: 5003 },
                        { name: "Lisk Sepolia", chainId: 4202 },
                    ];

                console.log(`📊 Fetching portfolio from ${chains.length} chains...`);

                const results = await Promise.all(
                    chains.map(async (chain) => {
                        try {
                            const response = await fetch('/api/blockchain', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    action: 'portfolio',
                                    address: walletAddress,
                                    chainId: chain.chainId,
                                    timeframeDays: 30
                                })
                            });

                            if (!response.ok) return null;
                            const { data: result } = await response.json();

                            if (result.data.type === 'portfolio') {
                                return { chain: chain.name, portfolio: result.data.analysis };
                            }
                            return null;
                        } catch (error) {
                            console.error(`Portfolio fetch failed for ${chain.name}:`, error);
                            return null;
                        }
                    })
                );

                const validResults = results.filter((r): r is NonNullable<typeof r> => r !== null);

                if (validResults.length === 0) {
                    return "❌ Failed to fetch portfolio from any chain.";
                }

                let totalPortfolioValue = 0;
                let totalNativeValue = 0;
                const allTokens = new Map<string, any>();

                validResults.forEach(result => {
                    totalPortfolioValue += result.portfolio.totalPortfolioValueUSD;
                    totalNativeValue += result.portfolio.nativeValueUSD;

                    result.portfolio.tokenHoldings.forEach((token: any) => {
                        const key = `${token.tokenSymbol}-${token.tokenAddress}`;
                        if (allTokens.has(key)) {
                            const existing = allTokens.get(key)!;
                            existing.balance += token.balance;
                            existing.currentValueUSD += token.currentValueUSD;
                            existing.chains.push(result.chain);
                        } else {
                            allTokens.set(key, {
                                ...token,
                                chains: [result.chain]
                            });
                        }
                    });
                });

                let response = `✅ Multi-Chain Portfolio Analysis:\n`;
                response += `Address: ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}\n\n`;

                response += `💼 Total Portfolio Value: $${totalPortfolioValue.toFixed(2)}\n`;
                response += `💰 Native Tokens Value: $${totalNativeValue.toFixed(2)}\n\n`;

                if (allTokens.size > 0) {
                    response += `📊 Top Token Holdings (across all chains):\n`;
                    const sortedTokens = Array.from(allTokens.values())
                        .sort((a, b) => b.currentValueUSD - a.currentValueUSD)
                        .slice(0, 10);

                    sortedTokens.forEach((token: any, i: number) => {
                        response += `${i + 1}. ${token.tokenSymbol}: ${token.balance.toFixed(4)} tokens ($${token.currentValueUSD.toFixed(2)})\n`;
                        response += `   Chains: ${token.chains.join(', ')}\n`;
                        if (token.pnlPercentage !== 0) {
                            response += `   P&L: ${token.pnlPercentage > 0 ? '+' : ''}${token.pnlPercentage.toFixed(2)}%\n`;
                        }
                    });
                }

                response += `\n📊 Breakdown by Chain:\n`;
                validResults.forEach(result => {
                    response += `• ${result.chain}: $${result.portfolio.totalPortfolioValueUSD.toFixed(2)} (${result.portfolio.numTokens} tokens)\n`;
                });

                return response;
            } catch (error: any) {
                console.error("Multi-chain portfolio error:", error);
                return `Error: ${error.message}`;
            }
        },
        render: ({ status }) => {
            if (status === "executing") {
                return <div className="text-sm text-muted-foreground animate-pulse">💼 Analyzing portfolio across all chains...</div>;
            }
            return <></>;
        },
    });

    // ============================================
    // analyzeTokenActivityAllChains
    // ============================================
    useCopilotAction({
        name: "analyzeTokenActivityAllChains",
        description: `✅ Multi-chain token activity - analyzes trading history across ALL chains.`,
        parameters: [
            {
                name: "targetAddress",
                type: "string",
                description: "Wallet address to analyze (0x...)",
                required: false
            },
        ],
        handler: async ({ targetAddress }) => {
            console.log("🔥 analyzeTokenActivityAllChains called!", { targetAddress });

            const validation = validateEthereumAddress(targetAddress);
            if (!validation.isValid) {
                return validation.error!;
            }

            const walletAddress = validation.normalizedAddress || address;
            if (!walletAddress) {
                return "No address provided and wallet is not connected.";
            }

            try {
                const isExternal = walletAddress.toLowerCase() !== address?.toLowerCase();
                const chains = isExternal
                    ? [{ name: "Ethereum Mainnet", chainId: 1 }]
                    : [
                        { name: "Ethereum", chainId: 1 },
                        { name: "Ethereum Sepolia", chainId: 11155111 },
                        { name: "Mantle Sepolia", chainId: 5003 },
                        { name: "Lisk Sepolia", chainId: 4202 },
                    ];

                const results = await Promise.all(
                    chains.map(async (chain) => {
                        try {
                            const response = await fetch('/api/blockchain', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    action: 'token_activity',
                                    address: walletAddress,
                                    chainId: chain.chainId,
                                    timeframeDays: 90
                                })
                            });

                            if (!response.ok) return null;
                            const { data: result } = await response.json();

                            if (result.data.type === 'token_activity') {
                                return { chain: chain.name, activity: result.data.analysis };
                            }
                            return null;
                        } catch (error) {
                            console.error(`Token activity fetch failed for ${chain.name}:`, error);
                            return null;
                        }
                    })
                );

                const validResults = results.filter((r): r is NonNullable<typeof r> => r !== null);

                if (validResults.length === 0) {
                    return "❌ Failed to fetch token activity from any chain.";
                }

                // Aggregate
                let totalInvested = 0;
                let totalCurrentValue = 0;
                let totalBought = 0;
                let totalSold = 0;

                validResults.forEach(result => {
                    const summary = result.activity.summary;
                    totalInvested += summary.totalInvestedUSD;
                    totalCurrentValue += summary.currentPortfolioValueUSD;
                    totalBought += summary.numTokensBought;
                    totalSold += summary.numTokensSold;
                });

                const totalPnL = totalCurrentValue - totalInvested;
                const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

                let response = `✅ Multi-Chain Token Activity:\n\n`;
                response += `📊 Trading Summary (all chains):\n`;
                response += `• Tokens Bought: ${totalBought}\n`;
                response += `• Tokens Sold: ${totalSold}\n`;
                response += `• Total Invested: $${totalInvested.toFixed(2)}\n`;
                response += `• Current Value: $${totalCurrentValue.toFixed(2)}\n`;
                response += `• Total P&L: ${totalPnLPct > 0 ? '+' : ''}${totalPnLPct.toFixed(2)}% ($${totalPnL > 0 ? '+' : ''}${totalPnL.toFixed(2)})\n\n`;

                response += `📊 Breakdown by Chain:\n`;
                validResults.forEach(result => {
                    const summary = result.activity.summary;
                    response += `• ${result.chain}: ${summary.numTokensBought} bought, ${summary.numTokensSold} sold\n`;
                });

                return response;
            } catch (error: any) {
                console.error("Multi-chain token activity error:", error);
                return `Error: ${error.message}`;
            }
        },
        render: ({ status }) => {
            if (status === "executing") {
                return <div className="text-sm text-muted-foreground animate-pulse">📊 Analyzing trading activity across all chains...</div>;
            }
            return <></>;
        },
    });

    // ============================================
    // getTransactionStatsAllChains
    // ============================================
    useCopilotAction({
        name: "getTransactionStatsAllChains",
        description: `✅ Multi-chain transaction stats - analyzes gas spending & activity across ALL chains.`,
        parameters: [
            {
                name: "targetAddress",
                type: "string",
                description: "Wallet address to analyze (0x...)",
                required: false
            },
        ],
        handler: async ({ targetAddress }) => {
            console.log("🔥 getTransactionStatsAllChains called!", { targetAddress });

            const validation = validateEthereumAddress(targetAddress);
            if (!validation.isValid) {
                return validation.error!;
            }

            const walletAddress = validation.normalizedAddress || address;
            if (!walletAddress) {
                return "No address provided and wallet is not connected.";
            }

            try {
                const isExternal = walletAddress.toLowerCase() !== address?.toLowerCase();
                const chains = isExternal
                    ? [{ name: "Ethereum Mainnet", chainId: 1 }]
                    : [
                        { name: "Ethereum", chainId: 1 },
                        { name: "Ethereum Sepolia", chainId: 11155111 },
                        { name: "Mantle Sepolia", chainId: 5003 },
                        { name: "Lisk Sepolia", chainId: 4202 },
                    ];

                const results = await Promise.all(
                    chains.map(async (chain) => {
                        try {
                            const response = await fetch('/api/blockchain', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    action: 'transaction_stats',
                                    address: walletAddress,
                                    chainId: chain.chainId,
                                    timeframeDays: 180
                                })
                            });

                            if (!response.ok) return null;
                            const { data: result } = await response.json();

                            if (result.data.type === 'transaction_stats') {
                                return { chain: chain.name, stats: result.data.stats };
                            }
                            return null;
                        } catch (error) {
                            console.error(`Stats fetch failed for ${chain.name}:`, error);
                            return null;
                        }
                    })
                );

                const validResults = results.filter((r): r is NonNullable<typeof r> => r !== null);

                if (validResults.length === 0) {
                    return "❌ Failed to fetch transaction stats from any chain.";
                }

                // Aggregate
                let totalTransactions = 0;
                let totalGasSpent = 0;
                let oldestAccountAge = 0;

                validResults.forEach(result => {
                    totalTransactions += result.stats.totalTransactions;
                    totalGasSpent += result.stats.totalGasSpentUSD;
                    if (result.stats.accountAgeDays > oldestAccountAge) {
                        oldestAccountAge = result.stats.accountAgeDays;
                    }
                });

                let response = `✅ Multi-Chain Transaction Stats:\n\n`;
                response += `📈 Activity Snapshot (Latest 500):\n`;
                response += `• Analyzed Transactions: ${totalTransactions} (across ${validResults.length} chains)\n`;
                response += `• Total Gas Spent: $${totalGasSpent.toFixed(2)}\n`;
                response += `• Account Age: ${oldestAccountAge} days\n\n`;

                response += `📊 Breakdown by Chain:\n`;
                validResults.forEach(result => {
                    response += `• ${result.chain}: ${result.stats.totalTransactions} analyzed txs ($${result.stats.totalGasSpentUSD.toFixed(2)} gas)\n`;
                });

                response += `\nℹ️ Note: We analyze the most recent 500 transactions per chain to ensure speed and prevent API rate limiting.`;
                return response;
            } catch (error: any) {
                console.error("Multi-chain stats error:", error);
                return `Error: ${error.message}`;
            }
        },
        render: ({ status }) => {
            if (status === "executing") {
                return <div className="text-sm text-muted-foreground animate-pulse">⛽ Analyzing transaction stats across all chains...</div>;
            }
            return <></>;
        },
    });
}