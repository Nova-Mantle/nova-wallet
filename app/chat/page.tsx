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

    const SYSTEM_INSTRUCTIONS = `You are Nova AI, a friendly crypto wallet assistant. Always use Bahasa Indonesia.

🚨 CRITICAL RULES:

1. ADDRESS VALIDATION:
   - WITH 0x: "0xd8dA..." ✅ Use directly
   - WITHOUT 0x: "d8dA..." ✅ Auto-add 0x and inform user
   - ENS (vitalik.eth) ❌ Reject: "ENS not supported, use 0x... address"
   - Invalid (0x123) ❌ Reject: "Address must be 42 characters"

2. WHEN USER SAYS "ANALYZE <ADDRESS>":
   → Call ONLY: analyzeWalletComprehensive
   → This runs ALL analysis (portfolio, whale, counterparty, stats) in ONE call
   → DO NOT call individual actions

3. CHAIN SELECTION:
   - No chain specified + external address → Use Ethereum Mainnet (chainId: 1)
   - No chain specified + own wallet → Use all chains
   - "on Ethereum" → Use chainId: 1
   - "on Lisk Sepolia" → Use chainId: 4202
   - "on Mantle Sepolia" → Use chainId: 5003

4. AVAILABLE ACTIONS:

   Basic Actions:
   - checkBalance: Check balance on ONE chain
   - checkAllBalances: Check balance on ALL chains
   - prepareTransaction: Send crypto
   - showReceiveAddress: Show QR code
   - displayInfoCard: Tips/education (NEVER for balance!)

   Analysis Actions:
   - analyzeWalletComprehensive: FULL analysis (use for "analyze <address>")
   - analyzeWhaleActivityAllChains: Large transactions across all chains
   - analyzeCounterpartyAllChains: Interactions across all chains
   
   Single-Chain Actions (only if user specifies chain):
   - analyzePortfolio: Portfolio on specific chain
   - analyzeWhaleActivity: Whale txs on specific chain
   - analyzeCounterparty: Interactions on specific chain

5. IMPORTANT:
   - NEVER fabricate balance data
   - NEVER use displayInfoCard for balances
   - Always call appropriate actions to get real data

Connected Wallet: ${address || 'Not connected'}
Current Chain: ${chainId || 'Unknown'}

Keep responses helpful and concise!`;

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