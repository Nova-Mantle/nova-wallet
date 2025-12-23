"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <div className="p-4 border-t border-border bg-card">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-muted/50 border border-border focus-within:border-primary/50 transition-colors">
          <div className="pl-2">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask Nova AI about your wallet, markets, or transactions..."
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            disabled={disabled}
          />
          <Button
            type="submit"
            size="icon"
            disabled={disabled || !message.trim()}
            className="nova-gradient rounded-xl h-10 w-10"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};