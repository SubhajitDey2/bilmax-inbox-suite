import { memo } from "react";
import { Bot, User } from "lucide-react";
import { ChannelDot } from "@/components/ChannelBadge";
import type { Conversation } from "@/lib/mockData";

interface Props {
  conversation: Conversation;
  active: boolean;
  onSelect: (id: string) => void;
  style?: React.CSSProperties;
}

function Row({ conversation: c, active, onSelect, style }: Props) {
  return (
    <button
      style={style}
      onClick={() => onSelect(c.id)}
      className={`group flex w-full items-start gap-3 border-b border-border/50 px-4 py-3 text-left transition ${
        active ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-secondary/40"
      }`}
    >
      <div className="relative shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
          {c.avatar}
        </div>
        {c.online && (
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-card" />
        )}
        <span className="absolute -left-1 -top-1">
          <ChannelDot channel={c.channel} />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{c.name}</span>
          <span className="shrink-0 text-[10px] text-muted-foreground">{c.time}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.lastMessage}</p>
        <div className="mt-1.5 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium ${
              c.mode === "ai" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
            }`}
          >
            {c.mode === "ai" ? <Bot className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
            {c.mode === "ai" ? "AI" : "Human"}
          </span>
          {c.unread > 0 && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
              {c.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export const ConversationRow = memo(Row);
