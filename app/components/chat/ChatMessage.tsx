"use client";

import { Zap, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
}

export const ChatMessage = ({ role, content, isLoading }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-4 mb-6", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          isUser ? "bg-muted" : "nova-gradient"
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-muted-foreground" />
        ) : (
          <Zap className="w-5 h-5 text-primary-foreground" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-5 py-4",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-md"
            : "bg-card border border-border rounded-tl-md shadow-sm"
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0.1s" }} />
            <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0.2s" }} />
          </div>
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        )}
      </div>
    </div>
  );
};
