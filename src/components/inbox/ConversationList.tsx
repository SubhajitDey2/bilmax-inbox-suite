import { memo, useCallback, useMemo, useState, useEffect } from "react";
import { List, type RowComponentProps } from "react-window";
import { Search } from "lucide-react";
import { conversations as seed, type Channel, type Conversation } from "@/lib/mockData";
import { ConversationRow } from "./ConversationRow";
import { useInboxStore, type PlatformFilter } from "@/store/inboxStore";

const ROW_HEIGHT = 84;

interface RowProps {
  items: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function VirtualRow({ index, style, items, selectedId, onSelect }: RowComponentProps<RowProps>) {
  const c = items[index];
  return (
    <ConversationRow
      conversation={c}
      active={selectedId === c.id}
      onSelect={onSelect}
      style={style}
    />
  );
}

const filters: { id: PlatformFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
];

/** Generate a large mock dataset to demonstrate virtualization */
function expand(base: Conversation[], target = 1200): Conversation[] {
  const out: Conversation[] = [];
  for (let i = 0; i < target; i++) {
    const b = base[i % base.length];
    out.push({ ...b, id: `${b.id}-${i}`, name: i < base.length ? b.name : `${b.name} #${i}` });
  }
  return out;
}

interface Props {
  height: number;
  onSelected?: () => void;
}

function ConversationListInner({ height, onSelected }: Props) {
  const all = useMemo(() => expand(seed), []);
  const filter = useInboxStore((s) => s.filter);
  const setFilter = useInboxStore((s) => s.setFilter);
  const setSelectedId = useInboxStore((s) => s.setSelectedId);
  const selectedId = useInboxStore((s) => s.selectedId);
  const setSearch = useInboxStore((s) => s.setSearch);
  const search = useInboxStore((s) => s.search);

  const [searchInput, setSearchInput] = useState(search);
  // Debounce search input → store
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 180);
    return () => clearTimeout(t);
  }, [searchInput, setSearch]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((c) => {
      if (filter !== "all" && c.channel !== filter) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.lastMessage.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [all, filter, search]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelected?.();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <h2 className="text-sm font-semibold tracking-tight">Inbox</h2>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-2.5 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search…"
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as Channel | "all")}
              className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
                filter === f.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">{list.length.toLocaleString()} conversations</p>
      </div>
      <div className="flex-1 min-h-0">
        {list.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-xs text-muted-foreground">
            No conversations match.
          </div>
        ) : (
          <List
            height={Math.max(height - 140, 200)}
            itemCount={list.length}
            itemSize={ROW_HEIGHT}
            width="100%"
            className="scrollbar-thin"
          >
            {({ index, style }) => {
              const c = list[index];
              return (
                <ConversationRow
                  key={c.id}
                  conversation={c}
                  active={selectedId === c.id}
                  onSelect={handleSelect}
                  style={style}
                />
              );
            }}
          </List>
        )}
      </div>
    </div>
  );
}

export const ConversationList = memo(ConversationListInner);
