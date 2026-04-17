import { useState } from "react";
import { Save, X } from "lucide-react";
import type { Customer } from "@/lib/mockData";
import { useInboxStore } from "@/store/inboxStore";
import { toast } from "@/hooks/use-toast";

interface Props {
  conversationId: string;
  customer: Customer;
  onClose: () => void;
}

export default function CustomerEditor({ conversationId, customer, onClose }: Props) {
  const updateCustomer = useInboxStore((s) => s.updateCustomer);
  const [form, setForm] = useState<Customer>(customer);

  const set = <K extends keyof Customer>(k: K, v: Customer[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    updateCustomer(conversationId, form);
    toast({ title: "Customer updated", description: `${form.name}'s details were saved.` });
    onClose();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold">Edit customer</h3>
        <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-secondary">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin p-5 text-xs">
        <Field label="Name" value={form.name} onChange={(v) => set("name", v)} />
        <Field label="Phone" value={form.phone} onChange={(v) => set("phone", v)} />
        <Field label="Address" value={form.address} onChange={(v) => set("address", v)} />
        <Field label="Date of Birth" type="date" value={form.dob} onChange={(v) => set("dob", v)} />
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Gender</label>
          <select
            value={form.gender}
            onChange={(e) => set("gender", e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary/60"
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <Field label="Last Booking" type="date" value={form.lastBooking} onChange={(v) => set("lastBooking", v)} />
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Last Payment</label>
          <select
            value={form.lastPaymentStatus}
            onChange={(e) => set("lastPaymentStatus", e.target.value as Customer["lastPaymentStatus"])}
            className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary/60"
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Online</option>
          </select>
        </div>
        <Field
          label="Services (comma separated)"
          value={form.services.join(", ")}
          onChange={(v) => set("services", v.split(",").map((s) => s.trim()).filter(Boolean))}
        />
        <Field
          label="Tags (comma separated)"
          value={form.tags.join(", ")}
          onChange={(v) => set("tags", v.split(",").map((s) => s.trim()).filter(Boolean))}
        />
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-border bg-card/40 p-3">
        <button
          onClick={onClose}
          className="rounded-md border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium hover:bg-secondary"
        >
          Cancel
        </button>
        <button
          onClick={save}
          className="inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-glow"
        >
          <Save className="h-3 w-3" /> Save
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary/60"
      />
    </div>
  );
}
