import { create } from "zustand";
import type { Channel, Customer, Message } from "@/lib/mockData";

export type ChatMode = "ai" | "human";
export type PlatformFilter = "all" | Channel;

interface InboxState {
  selectedId: string | null;
  filter: PlatformFilter;
  search: string;
  chatMode: ChatMode;
  draftsById: Record<string, string>;
  messagesById: Record<string, Message[]>;
  customerEditsById: Record<string, Partial<Customer>>;
  typing: boolean;

  setSelectedId: (id: string | null) => void;
  setFilter: (f: PlatformFilter) => void;
  setSearch: (s: string) => void;
  setChatMode: (m: ChatMode) => void;
  setDraft: (id: string, v: string) => void;
  appendMessage: (id: string, m: Message) => void;
  seedMessages: (id: string, m: Message[]) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  setTyping: (v: boolean) => void;
}

export const useInboxStore = create<InboxState>((set) => ({
  selectedId: null,
  filter: "all",
  search: "",
  chatMode: "human",
  draftsById: {},
  messagesById: {},
  customerEditsById: {},
  typing: false,

  setSelectedId: (id) => set({ selectedId: id }),
  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),
  setChatMode: (chatMode) => set({ chatMode }),
  setDraft: (id, v) => set((s) => ({ draftsById: { ...s.draftsById, [id]: v } })),
  appendMessage: (id, m) =>
    set((s) => ({
      messagesById: { ...s.messagesById, [id]: [...(s.messagesById[id] ?? []), m] },
    })),
  seedMessages: (id, m) =>
    set((s) => (s.messagesById[id] ? s : { messagesById: { ...s.messagesById, [id]: m } })),
  updateCustomer: (id, patch) =>
    set((s) => ({
      customerEditsById: {
        ...s.customerEditsById,
        [id]: { ...(s.customerEditsById[id] ?? {}), ...patch },
      },
    })),
  setTyping: (typing) => set({ typing }),
}));

/** Debounce hook for search input */
export function useDebounced<T>(value: T, ms = 200): T {
  // Local impl to avoid extra dep
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react") as typeof import("react");
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
