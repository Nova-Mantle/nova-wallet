"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount, useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { TokenSidebar } from "@/components/chat/TokenSidebar";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { TransactionCard } from "@/components/chat/TransactionCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { toast } from "sonner";

// CopilotKit Imports
import { CopilotKit, useCopilotAction, useCopilotChat } from "@copilotkit/react-core";
import { Message, Role } from "@copilotkit/runtime-client-gql";

export default function ChatPage() {
    return (
        <CopilotKit runtimeUrl="/api/copilotkit">
            <ChatPageContent />
        </CopilotKit>
    );
}

function ChatPageContent() {
    const { isConnected, address } = useAccount();
    const { openConnectModal } = useConnectModal();
    const { sendTransaction } = useSendTransaction();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [inputValue, setInputValue] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // CopilotKit Hooks
    const { visibleMessages, appendMessage, isLoading } = useCopilotChat({

    });

    // Local state for transaction card (Generative UI logic)
    const [pendingTransaction, setPendingTransaction] = useState<{
        type: "send" | "receive" | "swap" | "paylink";
        data: any;
    } | null>(null);

    // Register Actions
    useCopilotAction({
        name: "prepareTransaction",
        description: "Prepare a cryptocurrency transaction for the user to sign. Use this when the user wants to send money. ALWAYS return a JSON with { recipient, amount, token }.",
        parameters: [
            { name: "recipient", type: "string", description: "The recipient wallet address (0x...)" },
            { name: "amount", type: "string", description: "The amount of ETH/tokens to send" },
            { name: "token", type: "string", description: "The token symbol (e.g., ETH, MNT)", required: false },
        ],
        handler: async ({ recipient, amount, token }) => {
            setPendingTransaction({
                type: "send",
                data: { recipient, amount, token }
            });
            return "Transaction card displayed to user.";
        },
    });

    useCopilotAction({
        name: "showReceiveAddress",
        description: "Show the user's receive address QR code.",
        handler: async () => {
            setPendingTransaction({
                type: "receive",
                data: { token: "ETH" }
            });
            return "Receive address card displayed.";
        }
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [visibleMessages]);

    const handleSendMessage = (content: string) => {
        if (!isConnected) {
            toast.error("Please connect your wallet first");
            return;
        }
        appendMessage(new Message({
            content,
            role: Role.User
        }));
        setInputValue("");
    };

    const handleActionClick = (action: "send" | "receive" | "swap" | "paylink") => {
        if (action === "send") {
            setInputValue("I want to send crypto");
        } else if (action === "receive") {
            setInputValue("Show me my receive address");
        } else if (action === "swap") {
            setInputValue("I want to swap tokens");
        } else if (action === "paylink") {
            setInputValue("I want to create a paylink");
        }
    };

    const handleTransactionCancel = () => {
        setPendingTransaction(null);
        toast.info("Transaction cancelled");
        appendMessage(new Message({
            content: "Transaction cancelled.",
            role: Role.System
        }));
    };

    const handleTransactionConfirm = () => {
        if (!pendingTransaction || pendingTransaction.type !== "send") return;

        const { recipient, amount } = pendingTransaction.data;
        if (!recipient || !amount) {
            toast.error("Invalid transaction data");
            return;
        }

        try {
            sendTransaction({
                to: recipient as `0x${string}`,
                value: parseEther(amount),
            }, {
                onSuccess: (hash) => {
                    toast.success("Transaction submitted!", {
                        description: `Hash: ${hash.slice(0, 10)}...${hash.slice(-8)}`
                    });
                    setPendingTransaction(null);
                    appendMessage(new Message({
                        content: `Transaction submitted! Hash: ${hash}`,
                        role: Role.System
                    }));
                },
                onError: (error) => {
                    toast.error("Transaction failed", {
                        description: error.message
                    });
                }
            });
        } catch (error: any) {
            toast.error("Error preparing transaction", { description: error.message });
        }
    };

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

    const hasMessages = visibleMessages && visibleMessages.length > 0;

    return (
        <div className="h-screen flex flex-col bg-background">
            <ChatHeader
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />

            <div className="flex-1 flex overflow-hidden">
                <TokenSidebar isOpen={sidebarOpen} />

                <main className="flex-1 flex flex-col bg-nova-chat-bg dark:bg-background">
                    {!hasMessages ? (
                        <WelcomeScreen onActionClick={handleActionClick} />
                    ) : (
                        <ScrollArea className="flex-1 p-6">
                            <div className="text-center mb-6">
                                <span className="text-sm text-muted-foreground">
                                    Right now you&apos;re in chat with Nova AI
                                </span>
                            </div>

                            <div className="max-w-3xl mx-auto">
                                {visibleMessages.map((message, index) => (
                                    <div key={message.id}>
                                        <ChatMessage
                                            role={(message as any).role === Role.User ? "user" : "assistant"}
                                            content={(message as any).content}
                                        />

                                        {/* Render Transaction Card ONLY if it's the latest message AND we have a pending txn */}
                                        {index === visibleMessages.length - 1 && pendingTransaction && (
                                            <div className="flex justify-start pl-14">
                                                {pendingTransaction.type === "send" && (
                                                    <TransactionCard
                                                        type="send"
                                                        data={{
                                                            token: pendingTransaction.data.token || "ETH",
                                                            amount: pendingTransaction.data.amount || "0",
                                                            network: "Mantle Testnet",
                                                            recipient: pendingTransaction.data.recipient || "0x...",
                                                            gasFee: "< 0.01 MNT",
                                                        }}
                                                        onCancel={handleTransactionCancel}
                                                        onConfirm={handleTransactionConfirm}
                                                    />
                                                )}
                                                {pendingTransaction.type === "receive" && (
                                                    <TransactionCard
                                                        type="receive"
                                                        data={{
                                                            address: address || "0x...",
                                                            token: pendingTransaction.data.token || "ETH",
                                                        }}
                                                        onClose={handleTransactionCancel}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isLoading && <ChatMessage role="assistant" content="" isLoading />}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>
                    )}

                    <ChatInput onSend={handleSendMessage} disabled={isLoading} initialValue={inputValue} />
                </main>
            </div>
        </div>
    );
}
