"use client";

import { TransactionFlow as TransactionFlowType } from "@/hooks/useNovaAI";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionFlowProps {
    flow: TransactionFlowType;
}

export const TransactionFlow = ({ flow }: TransactionFlowProps) => {
    return (
        <div className="bg-card rounded-2xl border border-border p-6 max-w-md mt-3">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                    {flow.type === "send" && "Sending Transaction"}
                    {flow.type === "swap" && "Swapping Tokens"}
                    {flow.type === "receive" && "Receive Address"}
                </h3>
                {flow.currentStep !== "completed" && flow.currentStep !== "failed" && (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                )}
            </div>

            <div className="space-y-4">
                {flow.steps.map((step, index) => {
                    const isActive = step.status === "active";
                    const isCompleted = step.status === "completed";
                    const isError = step.status === "error";
                    const isPending = step.status === "pending";

                    return (
                        <div key={step.step} className="flex items-start gap-3">
                            {/* Step indicator */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                                        isCompleted && "bg-green-500 text-white",
                                        isActive && "bg-primary text-primary-foreground animate-pulse",
                                        isError && "bg-red-500 text-white",
                                        isPending && "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {isCompleted && <Check className="w-4 h-4" />}
                                    {isActive && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isError && <AlertCircle className="w-4 h-4" />}
                                    {isPending && <span className="text-xs">{index + 1}</span>}
                                </div>

                                {/* Connector line */}
                                {index < flow.steps.length - 1 && (
                                    <div
                                        className={cn(
                                            "w-0.5 h-8 mt-1 transition-all duration-300",
                                            isCompleted ? "bg-green-500" : "bg-muted"
                                        )}
                                    />
                                )}
                            </div>

                            {/* Step content */}
                            <div className="flex-1 pt-1">
                                <p
                                    className={cn(
                                        "font-medium text-sm transition-colors",
                                        isActive && "text-primary",
                                        isCompleted && "text-green-600 dark:text-green-400",
                                        isError && "text-red-600 dark:text-red-400",
                                        isPending && "text-muted-foreground"
                                    )}
                                >
                                    {step.label}
                                </p>
                                {step.message && isActive && (
                                    <p className="text-xs text-muted-foreground mt-1">{step.message}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Transaction details */}
            {flow.currentStep === "ready" && (
                <div className="mt-6 pt-6 border-t border-border">
                    <div className="space-y-2 text-sm">
                        {flow.type === "send" && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span className="font-medium">{flow.data.amount} {flow.data.token}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">To</span>
                                    <span className="font-mono text-xs">{flow.data.recipient?.slice(0, 10)}...</span>
                                </div>
                            </>
                        )}
                        {flow.type === "swap" && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">From</span>
                                    <span className="font-medium">{flow.data.amount} {flow.data.fromToken}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">To</span>
                                    <span className="font-medium">{flow.data.toToken}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Success message */}
            {flow.currentStep === "completed" && (
                <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Check className="w-5 h-5" />
                        <span className="font-medium">Transaction completed successfully!</span>
                    </div>
                </div>
            )}
        </div>
    );
};
