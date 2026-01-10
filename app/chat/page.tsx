"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { TokenSidebar } from "@/components/chat/TokenSidebar";
import { CustomUserMessage } from "@/components/chat/CustomUserMessage";
import { CustomChatInput } from "@/components/chat/CustomChatInput";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { Button } from "@/components/ui/button";
import { Wallet, Sparkles, Send } from "lucide-react";

// CopilotKit Imports
import { CopilotKit, useCopilotChat } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";
import "@copilotkit/react-ui/styles.css";

// Import the custom actions hook
import { useNovaActions } from "./actions/useNovaActions";

export default function ChatPage() {
    return (
        <CopilotKit runtimeUrl="/api/copilotkit">
            <ChatPageContent />
        </CopilotKit>
    );
}

function ChatPageContent() {
    const { isConnected, address } = useAccount();
    const chainId = useChainId();
    const { openConnectModal } = useConnectModal();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const [inputValue, setInputValue] = useState("");
    const [hasStartedChat, setHasStartedChat] = useState(false);
    const [pendingMessage, setPendingMessage] = useState<string | null>(null);

    // Register all Nova AI actions
    useNovaActions();

    // useCopilotChat for programmatic message sending
    const { appendMessage } = useCopilotChat();

    // ============================================
    // FIXED CONSTANTS (Instructions)
    // ============================================

    const SYSTEM_INSTRUCTIONS = `Kamu adalah Nova AI, asisten crypto wallet yang ramah dan helpful. Selalu gunakan Bahasa Indonesia.

🚨🚨🚨 CRITICAL RULE #1 - ADDRESS HANDLING 🚨🚨🚨

When user provides an Ethereum address:

1. CHECK the format:
   - WITH 0x prefix: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" ✅
   - WITHOUT 0x prefix: "d8dA6BF26964aF9D7eEd9e03E53415D37aA96045" ✅ (accepted but needs acknowledgment)

2. IF address is provided WITHOUT "0x" prefix:
   ⚠️ BEFORE calling any action, you MUST explicitly tell the user:
   
   "✅ Saya mendeteksi address tanpa prefix '0x'. Saya akan menambahkan '0x' secara otomatis:
   
   Address yang Anda berikan: d8dA6BF26964aF9D7eEd9e03E53415D37aA96045
   Address yang akan digunakan: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
   
   Memulai analisis..."

3. IF address ALREADY has "0x" prefix:
   ✅ Proceed normally without any special message

4. INVALID addresses (reject immediately):
   ❌ "vitalik.eth" → ENS not supported
   ❌ "0x123" → Too short (must be 42 chars total)
   ❌ "0xZZZZ..." → Invalid hex characters

💡 TIP: Always validate the final address format (0x + 40 hex chars) before calling actions.

🔥 "ANALYZE" SHORTCUT:
Jika user berkata "analyze <address>", "scan <address>", atau "cek wallet <address>":
→ JANGAN panggil tool satuan (jangan panggil analyzePortfolio atau analyzeWhale terpisah).
→ WAJIB panggil SATU tool ini: **analyzeWalletComprehensive**
→ Tool ini akan menjalankan semua analisis (Portfolio + Whale + Counterparty + Stats) sekaligus.

CONTOH:
User: "analyze 0xd8dA..."
AI: [Memanggil analyzeWalletComprehensive] (✅ BENAR)
AI: [Memanggil analyzePortfolio + analyzeWhale...] (❌ SALAH - terlalu banyak step)

---

TOOLS YANG TERSEDIA:

Basic Actions:
1. checkBalance - Cek saldo di SATU chain
2. checkAllBalances - Cek saldo di SEMUA chain (7 chains)
3. prepareTransaction - Kirim crypto
4. showReceiveAddress - QR code wallet
5. displayInfoCard - Tips & edukasi (JANGAN untuk balance!)
6. predictTradeCost - Analisis slippage CEX

Single-Chain Analysis (gunakan jika user sebutkan chain spesifik):
7. analyzePortfolio - Portfolio satu chain
8. analyzeTokenActivity - Trading P&L satu chain
9. getTransactionStats - Stats satu chain
10. analyzeCounterparty - Counterparties satu chain
11. analyzeWhaleActivity - Whale txs satu chain

Multi-Chain Analysis (DEFAULT untuk "analyze"):
12. analyzeCounterpartyAllChains - Counterparties semua chain
13. analyzeWhaleActivityAllChains - Whale txs semua chain

---

🚨 KEYWORD DETECTION - SANGAT PENTING! 🚨

Jika user berkata "analyze <address>" atau "analyze that address":
→ Ini adalah COMPREHENSIVE ANALYSIS request
→ Panggil MINIMAL 3 actions ini:
   1. analyzeWhaleActivityAllChains (prioritas #1 - transaksi besar)
   2. analyzeCounterpartyAllChains (prioritas #2 - siapa yang berinteraksi)
   3. analyzePortfolio atau analyzeTokenActivity (opsional - detail holdings/trading)

Jika user hanya minta satu aspek spesifik:
- "whale activity for 0x..." → HANYA analyzeWhaleActivityAllChains
- "who interacted with 0x..." → HANYA analyzeCounterpartyAllChains
- "portfolio of 0x..." → HANYA analyzePortfolio
- "trading activity for 0x..." → HANYA analyzeTokenActivity

CONTOH BENAR:

✅ User: "analyze 0xd8dA6BF..."
   AI: [Panggil: analyzeWhaleActivityAllChains + analyzeCounterpartyAllChains]
   
✅ User: "whale activity for 0xd8dA..."
   AI: [Panggil HANYA analyzeWhaleActivityAllChains]

✅ User: "who have I been trading with?"
   AI: [Panggil analyzeCounterpartyAllChains]

❌ User: "analyze 0xd8dA..."
   AI: [Panggil HANYA counterparty] ← SALAH! Harus panggil whale + counterparty minimal

---

CHAIN SELECTION LOGIC:

a) Jika user TIDAK menyebutkan chain:
   • Gunakan tool "AllChains" (analyzeCounterpartyAllChains, analyzeWhaleActivityAllChains)
   • Contoh: "show me my largest transactions" → analyzeWhaleActivityAllChains
   
b) Jika user MENYEBUTKAN chain:
   • Extract chain name dan gunakan tool single-chain
   • Contoh: "whale activity on Ethereum" → analyzeWhaleActivity dengan chainId=1
   
c) Chain ID mapping:
   • Ethereum Mainnet = 1
   • Ethereum Sepolia = 11155111
   • Mantle Sepolia = 5003
   • Lisk Sepolia = 4202

---

ATURAN PENTING:

1. JANGAN PERNAH memfabrikasi data saldo - selalu panggil checkBalance/checkAllBalances
2. JANGAN gunakan displayInfoCard untuk balance - data akan salah!
3. Chain tersedia: Ethereum (Mainnet & Sepolia), Mantle Sepolia, Lisk Sepolia
4. TIDAK ada Bitcoin (BTC) - hanya support EVM chains
5. Prioritaskan user experience - berikan jawaban paling berguna

---

Wallet user: ${address}
Current Chain ID: ${chainId}

Selalu prioritaskan user experience dan berikan jawaban yang paling berguna!`;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Send pending message after CopilotChat mounts
    useEffect(() => {
        if (pendingMessage && hasStartedChat) {
            const sendPendingMessage = async () => {
                try {
                    await appendMessage(
                        new TextMessage({
                            role: MessageRole.User,
                            content: pendingMessage
                        })
                    );
                    setPendingMessage(null);
                } catch (error) {
                    console.error("Error sending message:", error);
                }
            };
            // Small delay to ensure CopilotChat is mounted
            const timer = setTimeout(sendPendingMessage, 100);
            return () => clearTimeout(timer);
        }
    }, [pendingMessage, hasStartedChat, appendMessage]);

    if (!isMounted) return null;

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <div className="w-20 h-20 nova-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 nova-glow">
                        <Wallet className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
                    <p className="text-muted-foreground mb-8">
                        Connect your wallet to start chatting with Nova AI and manage your crypto with natural language commands.
                    </p>
                    <Button
                        size="lg"
                        className="nova-gradient hover:opacity-90 nova-glow"
                        onClick={openConnectModal}
                    >
                        Connect Wallet
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-background">
            <ChatHeader
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />

            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Your Custom Sidebar */}
                <TokenSidebar isOpen={sidebarOpen} />

                {/* CopilotKit Chat UI */}
                <main className="flex-1 flex flex-col min-h-0 h-full relative">
                    {/* Welcome Screen with Input */}
                    {showWelcome ? (
                        <div className="flex-1 flex flex-col">
                            {/* Chat Status Header */}
                            <div className="flex-shrink-0 text-center py-3 text-gray-400 text-sm border-b border-gray-100">
                                Right now you&apos;re in chat with Nova AI
                            </div>

                            {/* Welcome Screen Content */}
                            <div className="flex-1 flex items-center justify-center overflow-auto">
                                <WelcomeScreen
                                    onActionClick={(action) => {
                                        const actionMessages: Record<string, string> = {
                                            send: "Saya ingin mengirim crypto",
                                            receive: "Tampilkan alamat wallet saya",
                                            swap: "Saya ingin swap token",
                                            paylink: "Buat payment link"
                                        };
                                        setInputValue(actionMessages[action]);
                                    }}
                                />
                            </div>

                            {/* Custom Input at Bottom - Match CopilotChat Input Design */}
                            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (inputValue.trim()) {
                                            const message = inputValue.trim();
                                            setInputValue("");
                                            setShowWelcome(false);
                                            setHasStartedChat(true);
                                            setPendingMessage(message);
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-3 shadow-sm">
                                        {/* Sparkle Icon */}
                                        <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0" />

                                        {/* Input Field */}
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder="Ask Nova AI about your wallet, markets, or transactions..."
                                            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-500"
                                        />

                                        {/* Send Button */}
                                        <button
                                            type="submit"
                                            disabled={!inputValue.trim()}
                                            className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-md"
                                        >
                                            <Send className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Chat Status Header */}
                            <div className="flex-shrink-0 text-center py-3 text-gray-400 text-sm border-b border-gray-100">
                                Right now you&apos;re in chat with Nova AI
                            </div>

                            {/* CopilotChat - Only shown after welcome */}
                            <div className="flex-1 min-h-0 h-full overflow-hidden">
                                {hasStartedChat && (
                                    <CopilotChat
                                        className="h-full w-full"
                                        labels={{
                                            title: "Nova AI",
                                            placeholder: "Tanya Nova AI tentang wallet atau crypto...",
                                        }}
                                        UserMessage={CustomUserMessage}
                                        Input={CustomChatInput}
                                        instructions={SYSTEM_INSTRUCTIONS}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}