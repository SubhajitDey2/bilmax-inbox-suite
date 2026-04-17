import { Card } from "@/components/ui/card";
import { clients } from "@/lib/mockData";
import { Plus, KeyRound } from "lucide-react";

const planCls: Record<string, string> = {
  Pro: "bg-primary/15 text-primary",
  Growth: "bg-info/15 text-info",
  Starter: "bg-secondary text-muted-foreground",
};
const statusCls: Record<string, string> = {
  Active: "bg-success/15 text-success",
  Trial: "bg-warning/15 text-warning",
  Suspended: "bg-destructive/15 text-destructive",
};

export default function Admin() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage tenants, Meta credentials, and usage limits.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow">
          <Plus className="h-3.5 w-3.5" /> Add Client
        </button>
      </div>

      <Card className="border-border/60 bg-gradient-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Client</th>
                <th className="px-4 py-2.5 font-medium">Plan</th>
                <th className="px-4 py-2.5 font-medium text-right">Users</th>
                <th className="px-4 py-2.5 font-medium text-right">Messages</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 transition">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3"><span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${planCls[c.plan]}`}>{c.plan}</span></td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{c.users}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{c.messages.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${statusCls[c.status]}`}>{c.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/50 px-2 py-1 text-[10px] hover:bg-secondary">
                      <KeyRound className="h-3 w-3" /> Meta Keys
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
