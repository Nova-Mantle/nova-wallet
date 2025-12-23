"use client";

import { useAccount, useBalance } from "wagmi";
import { TrendingUp, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const mockTokens = [
  { symbol: "ETH", name: "Ethereum", balance: "11.052", value: "$38,270.08", change: "+5.2%", percentage: "65.2%" },
  { symbol: "BTC", name: "Bitcoin", balance: "0.1234", value: "$5,234.67", change: "+2.1%", percentage: "8.9%" },
  { symbol: "MATIC", name: "Polygon", balance: "1,250.00", value: "$1,125.00", change: "-1.5%", percentage: "1.9%" },
  { symbol: "LINK", name: "Chainlink", balance: "345.67", value: "$5,185.05", change: "+3.7%", percentage: "8.8%" },
  { symbol: "UNI", name: "Uniswap", balance: "89.42", value: "$623.94", change: "+1.2%", percentage: "1.1%" },
  { symbol: "USDC", name: "USD Coin", balance: "2,500.00", value: "$2,500.00", change: "+0.0%", percentage: "4.3%" },
];

interface TokenSidebarProps {
  isOpen: boolean;
}

export const TokenSidebar = ({ isOpen }: TokenSidebarProps) => {
  const { isConnected } = useAccount();
  const [showBalance, setShowBalance] = useState(true);

  const totalValue = isConnected ? "$52,938.74" : "$0.00";

  return (
    <aside
      className={cn(
        "h-full border-r border-border bg-card flex flex-col transition-all duration-300",
        isOpen ? "w-80" : "w-0 overflow-hidden"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Portfolio Focus</h2>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            {showBalance ? (
              <Eye className="w-5 h-5 text-muted-foreground" />
            ) : (
              <EyeOff className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Total Asset Value Card */}
        <div className="nova-gradient rounded-2xl p-4 text-primary-foreground">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm opacity-90">Total Asset Value</span>
          </div>
          <p className="text-3xl font-bold mb-2">
            {showBalance ? totalValue : "••••••"}
          </p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium flex items-center gap-1">
              📈 +2.44%
            </span>
            <span className="text-sm opacity-80">Last 24h</span>
          </div>
        </div>
      </div>

      {/* Token Balance Label */}
      <div className="px-4 py-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Token Balance
        </span>
      </div>

      {/* Token List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-2">
          {isConnected ? (
            mockTokens.map((token) => (
              <div
                key={token.symbol}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
              >
                {/* Token Icon */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {token.symbol.slice(0, 2)}
                  </span>
                </div>

                {/* Token Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{token.name}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {token.percentage}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {showBalance ? `${token.balance} ${token.symbol}` : "••••"}
                  </p>
                </div>

                {/* Value */}
                <div className="text-right">
                  <p className="font-medium">{showBalance ? token.value : "••••"}</p>
                  <p
                    className={cn(
                      "text-xs",
                      token.change.startsWith("+")
                        ? "text-green-500"
                        : token.change.startsWith("-")
                          ? "text-red-500"
                          : "text-muted-foreground"
                    )}
                  >
                    {token.change}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Connect your wallet to view tokens</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
