"use client";

import { useAccount } from "wagmi";
import { TrendingUp, ChevronRight } from "lucide-react";

const mockTokens = [
  { symbol: "ETH", name: "Ethereum", balance: "0.5", value: "$1,245.00", change: "+2.5%" },
  { symbol: "USDT", name: "Tether USD", balance: "500.00", value: "$500.00", change: "0.0%" },
  { symbol: "USDC", name: "USD Coin", balance: "250.00", value: "$250.00", change: "0.0%" },
];

export const PortfolioPanel = () => {
  const { isConnected } = useAccount();

  const totalValue = isConnected ? "$1,995.00" : "$0.00";

  return (
    <div className="w-72 h-full border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Portfolio Focus</h3>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </div>
        <p className="text-3xl font-bold nova-text-gradient">{totalValue}</p>
        <p className="text-sm text-green-500">+$45.32 (2.3%)</p>
      </div>

      {/* Token list */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Your Tokens</h4>
        <div className="space-y-3">
          {isConnected ? (
            mockTokens.map((token) => (
              <div
                key={token.symbol}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full nova-gradient flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">
                      {token.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{token.symbol}</p>
                    <p className="text-xs text-muted-foreground">{token.balance}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{token.value}</p>
                  <p className={`text-xs ${token.change.startsWith("+") ? "text-green-500" : "text-muted-foreground"}`}>
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

      {/* Quick actions */}
      <div className="p-4 border-t border-border">
        <button className="w-full flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
          <span className="font-medium text-sm">View All Assets</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
