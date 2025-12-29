"use client";

import { useState } from "react";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface TransactionPreviewProps {
    recipient: string;
    amount: number;
    token?: string;
    status: "inProgress" | "complete" | "executing";
    handler: (result: any) => void;
}

export function TransactionPreview({ recipient, amount, token = "ETH", status, handler }: TransactionPreviewProps) {
    const { data: hash, sendTransaction, isPending: isSendPending, error: sendError } = useSendTransaction();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    const [txStatus, setTxStatus] = useState<"idle" | "sending" | "confirming" | "success" | "error">("idle");

    const handleConfirm = async () => {
        try {
            setTxStatus("sending");
            sendTransaction({
                to: recipient as `0x${string}`,
                value: parseEther(amount.toString()),
            }, {
                onSuccess: (hash) => {
                    setTxStatus("confirming");
                    toast.success("Transaction submitted!", {
                        description: `Hash: ${hash.slice(0, 10)}...`
                    });
                },
                onError: (error) => {
                    setTxStatus("error");
                    toast.error("Transaction failed", {
                        description: error.message
                    });
                    handler("FAILED: " + error.message);
                }
            });
        } catch (e: any) {
            setTxStatus("error");
            handler("FAILED: " + e.message);
        }
    };

    // Effect to notify handler on completion
    if (isConfirmed && txStatus !== "success") {
        setTxStatus("success");
        handler(`SUCCESS: Transaction confirmed with hash ${hash}`);
    }

    return (
        <Card className="w-full max-w-sm border-primary/20 bg-background/50 backdrop-blur">
            <CardHeader>
                <CardTitle>Confirm Transaction</CardTitle>
                <CardDescription>Review the details before sending</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">To:</span>
                        <span className="font-mono">{recipient.slice(0, 6)}...{recipient.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount:</span>
                        <span>{amount} {token}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Network:</span>
                        <span>Mantle Testnet</span>
                    </div>
                </div>

                {sendError && (
                    <div className="text-red-500 text-xs bg-red-500/10 p-2 rounded">
                        Error: {sendError.message.slice(0, 100)}...
                    </div>
                )}
            </CardContent>
            <CardFooter>
                {(status === "complete" || txStatus === "success") ? (
                    <Button className="w-full bg-green-500 hover:bg-green-600" disabled>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Sent Successfully
                    </Button>
                ) : (
                    <Button
                        className="w-full nova-gradient"
                        onClick={handleConfirm}
                        disabled={status !== "inProgress" && status !== "executing" || isSendPending || isConfirming}
                    >
                        {isSendPending || isConfirming ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isSendPending ? "Check Wallet..." : "Confirming..."}
                            </>
                        ) : (
                            "Confirm & Send"
                        )}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
