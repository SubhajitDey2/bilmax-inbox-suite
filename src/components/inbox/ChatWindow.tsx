import { memo, useEffect, useMemo, useRef } from "react";
import { Bot, Check, CheckCheck, MessageSquare, MoreVertical, Paperclip, Phone, Send, Smile, User, Video } from "lucide-react";
import { ChannelBadge } from "@/components/ChannelBadge";
import { conversations, messagesByConversation, type Conversation, type Message } from "@/lib/mockData";
import { useInboxStore } from "@/store/inboxStore";

function formatDateLabel(d: Date) {
  const today = new Date();
  const y = new Date();
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

interface Props {
  onBack?: () => void;
}

function ChatWindowInner({ onBack }: Props) {
  const selectedId = useInboxStore((s) => s.selectedId);
  const chatMode = useInboxStore((s) => s.chatMode);
  const setChatMode = useInboxStore((s) => s.setChatMode);
  const setDraft = useInboxStore((s) => s.setDraft);
  const drafts = useInboxStore((s) => s.draftsById);
  const messagesById = useInboxStore((s) => s.messagesById);
  const seedMessages = useInboxStore((s) => s.seedMessages);
  const appendMessage = useInboxStore((s) => s.appendMessage);
  const typing = useInboxStore((s) => s.typing);

  // Resolve conversation from base id (we expanded ids as `${base}-${i}`)
  const active: Conversation | undefined = useMemo(() => {
    if (!selectedId) return undefined;
    const baseId = selectedId.split("-")[0];
    const base = conversations.find((c) => c.id === baseId);
    if (!base) return undefined;
    return { ...base, id: selectedId };
  }, [selectedId]);

  // Seed messages once per conversation
  useEffect(() => {
    if (!selectedId) return;
    const baseId = selectedId.split("-")[0];
    const base = messagesByConversation[baseId] ?? messagesByConversation["1"];
    seedMessages(selectedId, base);
  }, [selectedId, seedMessages]);

  const messages: Message[] = selectedId ? messagesById[selectedId] ?? [] : [];
  const draft = selectedId ? drafts[selectedId] ?? "" : "";

  // Auto-scroll to latest
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, selectedId, typing]);

  // Group messages by date
  const grouped = useMemo(() => {
    const today = new Date();
    return messages.reduce<{ label: string; items: Message[] }[]>((acc, m) => {
      const label = formatDateLabel(today);
      const last = acc[acc.length - 1];
      if (last && last.label === label) last.items.push(m);
      else acc.push({ label, items: [m] });
      return acc;
    }, []);
  }, [messages]);

  if (!selectedId || !active) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50">
          <MessageSquare className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold">Select a conversation</h3>
        <p className="max-w-xs text-xs text-muted-foreground">
          Pick a chat from the list to view messages, customer details, and respond in real time.
        </p>
      </div>
    );
  }

  const send = () => {
    if (!draft.trim() || chatMode === "ai") return;
    appendMessage(selectedId, {
      id: `m-${Date.now()}`,
      text: draft.trim(),
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    });
    setDraft(selectedId, "");
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-card/40 px-5 py-3">
        {onBack && (
          <button onClick={onBack} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary lg:hidden">
            ←
          </button>
        )}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
          {active.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">{active.name}</span>
            <ChannelBadge channel={active.channel} />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {active.online ? "Active now" : "Last seen 2h ago"}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 p-0.5">
          <button
            onClick={() => setChatMode("human")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
              chatMode === "human" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <User className="h-3 w-3" /> Human
          </button>
          <button
            onClick={() => setChatMode("ai")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
              chatMode === "ai" ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground"
            }`}
          >
            <Bot className="h-3 w-3" /> AI
          </button>
        </div>
        <button className="hidden md:inline-flex rounded-lg p-2 text-muted-foreground hover:bg-secondary">
          <Phone className="h-4 w-4" />
        </button>
        <button className="hidden md:inline-flex rounded-lg p-2 text-muted-foreground hover:bg-secondary">
          <Video className="h-4 w-4" />
        </button>
        <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary">
          <MoreVertical className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-6">
        {grouped.map((g) => (
          <div key={g.label} className="space-y-3">
            <div className="my-2 flex items-center justify-center">
              <span className="rounded-full bg-secondary/70 px-2.5 py-0.5 text-[10px] text-muted-foreground">
                {g.label}
              </span>
            </div>
            {g.items.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`group max-w-[70%] rounded-2xl px-3.5 py-2 text-sm animate-in fade-in slide-in-from-bottom-1 duration-200 ${
                    m.sender === "me"
                      ? "bg-gradient-primary text-primary-foreground rounded-br-sm shadow-sm"
                      : "bg-secondary text-foreground rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                      m.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {m.time}
                    {m.sender === "me" &&
                      (m.status === "read" ? (
                        <CheckCheck className="h-3 w-3" />
                      ) : (
                        <Check className="h-3 w-3" />
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {typing && (
          <div className="mt-3 flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl bg-secondary px-3 py-2">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <footer className="border-t border-border bg-card/40 p-3">
        {chatMode === "ai" && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] text-primary">
            <Bot className="h-3 w-3" /> AI is replying automatically via n8n. Switch to Human to take over.
          </div>
        )}
        <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 transition focus-within:border-primary/60">
          <button className="text-muted-foreground hover:text-foreground">
            <Paperclip className="h-4 w-4" />
          </button>
          <textarea
            value={draft}
            onChange={(e) => setDraft(selectedId, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={chatMode === "ai" ? "AI mode active…" : "Type a message…"}
            disabled={chatMode === "ai"}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />
          <button className="text-muted-foreground hover:text-foreground">
            <Smile className="h-4 w-4" />
          </button>
          <button
            onClick={send}
            disabled={chatMode === "ai" || !draft.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow transition disabled:opacity-40 disabled:shadow-none"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </footer>
    </div>
  );
}

export const ChatWindow = memo(ChatWindowInner);
