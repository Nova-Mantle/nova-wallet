"use client";

import { Plus, MessageSquare, Zap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDisconnect, useAccount } from "wagmi";

interface Conversation {
  id: string;
  title: string;
  preview: string;
  date: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

export const ChatSidebar = ({ conversations, activeId, onSelect, onNewChat }: ChatSidebarProps) => {
  const { disconnect } = useDisconnect();
  const { address } = useAccount();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="w-80 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 nova-gradient rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold">Nova AI</span>
        </div>
        <Button onClick={onNewChat} className="w-full nova-gradient hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full p-3 rounded-lg text-left transition-colors mb-1 ${activeId === conv.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50"
                }`}
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 mt-1 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{conv.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{conv.preview}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Footer - Wallet Info */}
      <div className="p-4 border-t border-sidebar-border">
        {address && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full nova-gradient-light flex items-center justify-center">
                <span className="text-xs font-medium text-primary">
                  {address.slice(2, 4).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium">{truncateAddress(address)}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => disconnect()}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
