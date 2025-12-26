"use client";

import { Send, Download, ArrowLeftRight, Link, Zap } from "lucide-react";

interface WelcomeScreenProps {
  onActionClick: (action: "send" | "receive" | "swap" | "paylink") => void;
}

export const WelcomeScreen = ({ onActionClick }: WelcomeScreenProps) => {
  const actions = [
    {
      id: "receive" as const,
      icon: Download,
      title: "Receive",
      description: "Get your wallet address to receive crypto",
      gradient: "receive-bg feature-bg-blur",
      iconBg: "receive-logo",
      textColor: "text-pink-500",
    },
    {
      id: "swap" as const,
      icon: ArrowLeftRight,
      title: "Swap",
      description: "Exchange one token for another instantly",
      gradient: "swap-bg",
      iconBg: "swap-logo",
      textColor: "text-purple-500",
    },
    {
      id: "paylink" as const,
      icon: Link,
      title: "Paylink",
      description: "Create a payment link for quick & secure transfers",
      gradient: "paylink-bg",
      iconBg: "paylink-logo",
      textColor: "text-blue-500",
    },
    {
      id: "send" as const,
      icon: Send,
      title: "Send",
      description: "Transfer your assets to another wallet",
      gradient: "send-bg",
      iconBg: "send-logo",
      textColor: "text-yellow-600",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      {/* Nova AI Logo */}
      <div className="mb-8 relative w-24 h-24">
        {/* Behind box - rotated left */}
        <div className="absolute w-24 h-24 rounded-3xl chat-logo-behind -rotate-20 -top-3 -left-5" />
        {/* Front box */}
        <div className="absolute top-0 left-0 w-24 h-24 rounded-3xl chat-logo flex items-center justify-center shadow-2xl shadow-purple-500/30">
          <Zap className="w-12 h-12 text-white fill-white" />
        </div>
      </div>

      {/* Welcome Text */}
      <h1 className="text-2xl font-semibold mb-2 text-foreground">Welcome to Nova AI</h1>
      <p className="text-base text-foreground/80 mb-12">
        How can I help?
      </p>

      {/* Action Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl w-full">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.id)}
            className={`p-6 rounded-2xl bg-linear-to-br ${action.gradient} border border-border/50 hover:border-primary/20 transition-all hover:shadow-md hover:-translate-y-0.5 text-left group`}
          >
            <div className={`w-12 h-12 ${action.iconBg} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className={`font-semibold text-base mb-2 ${action.textColor}`}>
              {action.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {action.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
