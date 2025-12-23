"use client";

import { Send, Download, ArrowLeftRight, Link } from "lucide-react";

interface WelcomeScreenProps {
  onActionClick: (action: "send" | "receive" | "swap" | "paylink") => void;
}

export const WelcomeScreen = ({ onActionClick }: WelcomeScreenProps) => {
  const actions = [
    {
      id: "send" as const,
      icon: Send,
      title: "Send",
      description: "Transfer your assets to another wallet",
      gradient: "from-purple-400/20 to-purple-500/10",
      iconBg: "bg-purple-500",
    },
    {
      id: "receive" as const,
      icon: Download,
      title: "Receive",
      description: "Get your wallet address to receive crypto",
      gradient: "from-orange-400/20 to-orange-500/10",
      iconBg: "bg-orange-500",
    },
    {
      id: "swap" as const,
      icon: ArrowLeftRight,
      title: "Swap",
      description: "Exchange one token for another instantly",
      gradient: "from-green-400/20 to-green-500/10",
      iconBg: "bg-green-500",
    },
    {
      id: "paylink" as const,
      icon: Link,
      title: "Paylink",
      description: "Create a payment link for quick & secure transfers",
      gradient: "from-blue-400/20 to-cyan-500/10",
      iconBg: "bg-blue-500",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      {/* Nova AI Avatar */}
      <div className="w-20 h-20 rounded-full nova-gradient-light flex items-center justify-center mb-6 nova-glow">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 via-violet-500 to-purple-600 flex items-center justify-center">
          <span className="text-2xl">🌐</span>
        </div>
      </div>

      {/* Welcome Text */}
      <h1 className="text-3xl font-bold mb-2">Welcome to NovaAI</h1>
      <p className="text-muted-foreground mb-10">
        Your AI companion for effortless crypto management
      </p>

      {/* Action Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl w-full">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.id)}
            className={`p-5 rounded-2xl bg-gradient-to-br ${action.gradient} border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:-translate-y-1 text-left`}
          >
            <div className={`w-10 h-10 ${action.iconBg} rounded-xl flex items-center justify-center mb-4`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-1" style={{ color: action.id === 'send' ? '#9b59b6' : action.id === 'receive' ? '#e67e22' : action.id === 'swap' ? '#27ae60' : '#3498db' }}>
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
