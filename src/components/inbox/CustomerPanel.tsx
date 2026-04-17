import { lazy, memo, Suspense, useMemo, useState } from "react";
import { customerByConversation, type Customer } from "@/lib/mockData";
import { useInboxStore } from "@/store/inboxStore";
import { Pencil, Save, X, UserCircle2 } from "lucide-react";

const Editor = lazy(() => import("./CustomerEditor"));

function CustomerPanelInner() {
  const selectedId = useInboxStore((s) => s.selectedId);
  const edits = useInboxStore((s) => s.customerEditsById);
  const [editing, setEditing] = useState(false);

  const customer: Customer | undefined = useMemo(() => {
    if (!selectedId) return undefined;
    const baseId = selectedId.split("-")[0];
    const base = customerByConversation[baseId] ?? customerByConversation["1"];
    return { ...base, ...(edits[selectedId] ?? {}) } as Customer;
  }, [selectedId, edits]);

  if (!selectedId || !customer) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-xs text-muted-foreground">
        <UserCircle2 className="h-8 w-8 opacity-40" />
        Select a conversation to view customer details.
      </div>
    );
  }

  if (editing) {
    return (
      <Suspense fallback={<div className="p-6 text-xs text-muted-foreground">Loading editor…</div>}>
        <Editor
          conversationId={selectedId}
          customer={customer}
          onClose={() => setEditing(false)}
        />
      </Suspense>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto scrollbar-thin">
      <div className="flex flex-col items-center border-b border-border p-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-lg font-semibold text-primary-foreground shadow-glow">
          {customer.name
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("")}
        </div>
        <h3 className="mt-3 text-sm font-semibold">{customer.name}</h3>
        <p className="text-xs text-muted-foreground">{customer.email}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-1">
          {customer.tags.map((t) => (
            <span key={t} className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
              {t}
            </span>
          ))}
        </div>
        <button
          onClick={() => setEditing(true)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-secondary"
        >
          <Pencil className="h-3 w-3" /> Edit details
        </button>
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
              <span key={s} className="rounded-md bg-secondary px-2 py-0.5 text-[11px]">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-gradient-card p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Last Payment</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base font-semibold">{customer.totalSpend}</span>
            <span className="rounded-md bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
              {customer.lastPaymentStatus}
            </span>
          </div>
        </div>
      </div>
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

export const CustomerPanel = memo(CustomerPanelInner);
export { Save, X };
