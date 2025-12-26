"use client";

import { PanelLeftClose, PanelLeft, Zap, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount, useDisconnect } from "wagmi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const ChatHeader = ({ sidebarOpen, onToggleSidebar }: ChatHeaderProps) => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-card">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleSidebar}
          className="rounded-lg"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelLeft className="w-5 h-5" />
          )}
        </Button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 nova-gradient rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Nova Wallet</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Crypto</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Token Usage */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
          <span className="text-lg">🪙</span>
          <span className="text-sm">
            <span className="font-medium">0/10</span>{" "}
            <span className="text-muted-foreground">Tokens Used</span>
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Wallet Address */}
        {address && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="nova-gradient text-primary-foreground rounded-full gap-2">
                <span className="text-lg">🦊</span>
                {truncateAddress(address)}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(address)}>
                Copy Address
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => disconnect()} className="text-destructive">
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};
