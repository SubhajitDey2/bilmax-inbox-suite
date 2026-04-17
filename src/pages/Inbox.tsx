import { useMemo, useState } from "react";
import { conversations, messagesByConversation, customerByConversation, type Channel } from "@/lib/mockData";
import { ChannelBadge, ChannelDot } from "@/components/ChannelBadge";
import { Search, Send, Paperclip, Smile, Bot, User, Phone, Video, MoreVertical, Check, CheckCheck } from "lucide-react";

const filters: { id: "all" | Channel; label: string }[] = [
  { id: "all", label: "All" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
];

export default function Inbox() {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [activeId, setActiveId] = useState("1");
  const [mode, setMode] = useState<"ai" | "human">("human");
  const [draft, setDraft] = useState("");

  const list = useMemo(
    () => conversations.filter((c) => filter === "all" || c.channel === filter),
    [filter]
  );
  const active = conversations.find((c) => c.id === activeId)!;
  const messages = messagesByConversation[activeId] ?? messagesByConversation["1"];
  const customer = customerByConversation[activeId] ?? customerByConversation["1"];

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-[320px_1fr_320px] xl:grid-cols-[340px_1fr_340px]">
      {/* LEFT: Conversation list */}
      <aside className="flex flex-col border-r border-border bg-card/40">
        <div className="border-b border-border p-4">
          <h2 className="text-sm font-semibold tracking-tight">Inbox</h2>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input placeholder="Search…" className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground" />
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {filters.map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)} className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${filter === f.id ? "bg-primary text-primary-foreground" : "bg-secondary/70 text-muted-foreground hover:text-foreground"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {list.map((c) => (
            <button key={c.id} onClick={() => setActiveId(c.id)} className={`group flex w-full items-start gap-3 border-b border-border/50 px-4 py-3 text-left transition ${activeId === c.id ? "bg-primary/5" : "hover:bg-secondary/40"}`}>
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                  {c.avatar}
                </div>
                {c.online && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-card" />}
                <span className="absolute -left-1 -top-1"><ChannelDot channel={c.channel} /></span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{c.name}</span>
                  <span className="text-[10px] text-muted-foreground">{c.time}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium ${c.mode === "ai" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {c.mode === "ai" ? <Bot className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
                    {c.mode === "ai" ? "AI" : "Human"}
                  </span>
                  {c.unread > 0 && <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">{c.unread}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* MIDDLE: Chat */}
      <section className="flex flex-col bg-background">
        <header className="flex items-center gap-3 border-b border-border bg-card/40 px-5 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
            {active.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold">{active.name}</span>
              <ChannelBadge channel={active.channel} />
            </div>
            <p className="text-[11px] text-muted-foreground">{active.online ? "Active now" : "Last seen 2h ago"}</p>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 p-0.5">
            <button onClick={() => setMode("human")} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition ${mode === "human" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
              <User className="h-3 w-3" /> Human
            </button>
            <button onClick={() => setMode("ai")} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition ${mode === "ai" ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground"}`}>
              <Bot className="h-3 w-3" /> AI Mode
            </button>
          </div>
          <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><Phone className="h-4 w-4" /></button>
          <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><Video className="h-4 w-4" /></button>
          <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><MoreVertical className="h-4 w-4" /></button>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 px-5 py-6">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`group max-w-[70%] rounded-2xl px-3.5 py-2 text-sm ${m.sender === "me" ? "bg-gradient-primary text-primary-foreground rounded-br-sm shadow-sm" : "bg-secondary text-foreground rounded-bl-sm"}`}>
                <p>{m.text}</p>
                <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${m.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {m.time}
                  {m.sender === "me" && (m.status === "read" ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="border-t border-border bg-card/40 p-3">
          {mode === "ai" && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] text-primary">
              <Bot className="h-3 w-3" /> AI is replying automatically via n8n. Switch to Human to take over.
            </div>
          )}
          <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary/60 transition">
            <button className="text-muted-foreground hover:text-foreground"><Paperclip className="h-4 w-4" /></button>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={mode === "ai" ? "AI mode active…" : "Type a message…"}
              disabled={mode === "ai"}
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
            />
            <button className="text-muted-foreground hover:text-foreground"><Smile className="h-4 w-4" /></button>
            <button disabled={mode === "ai" || !draft.trim()} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow disabled:opacity-40 disabled:shadow-none transition">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </footer>
      </section>

      {/* RIGHT: Customer details */}
      <aside className="hidden lg:flex flex-col border-l border-border bg-card/40 overflow-y-auto scrollbar-thin">
        <div className="flex flex-col items-center border-b border-border p-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-lg font-semibold text-primary-foreground shadow-glow">
            {active.avatar}
          </div>
          <h3 className="mt-3 text-sm font-semibold">{customer.name}</h3>
          <p className="text-xs text-muted-foreground">{customer.email}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1">
            {customer.tags.map((t) => (
              <span key={t} className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">{t}</span>
            ))}
          </div>
        </div>
        <div className="space-y-4 p-5 text-xs">
          <Detail label="Phone" value={customer.phone} />
          <Detail label="Address" value={customer.address} />
          <Detail label="Date of Birth" value={customer.dob} />
          <Detail label="Gender" value={customer.gender} />
          <Detail label="Last Booking" value={customer.lastBooking} />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Services</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {customer.services.map((s) => (
                <span key={s} className="rounded-md bg-secondary px-2 py-0.5 text-[11px]">{s}</span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-gradient-card p-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Last Payment</p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-base font-semibold">{customer.totalSpend}</span>
              <span className="rounded-md bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">{customer.lastPaymentStatus}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-foreground">{value}</p>
    </div>
  );
}
