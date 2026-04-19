import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Pause, X } from "lucide-react";
import { toast } from "sonner";

interface Row {
  id: string;
  org_id: string;
  name: string;
  channel: string;
  status: string;
  sent_count: number;
  total_recipients: number;
  scheduled_at: string | null;
  org_name?: string;
}

const statusCls: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_approval: "bg-warning/15 text-warning",
  approved: "bg-info/15 text-info",
  scheduled: "bg-info/15 text-info",
  sending: "bg-primary/15 text-primary",
  sent: "bg-success/15 text-success",
  failed: "bg-destructive/15 text-destructive",
  cancelled: "bg-secondary text-muted-foreground",
};

export default function SuperAdminCampaigns() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { data } = await supabase
      .from("campaigns")
      .select("id, org_id, name, channel, status, sent_count, total_recipients, scheduled_at")
      .order("created_at", { ascending: false });
    const orgIds = Array.from(new Set((data ?? []).map((d) => d.org_id)));
    const { data: orgs } = await supabase.from("organizations").select("id, name").in("id", orgIds);
    const orgMap = new Map((orgs ?? []).map((o) => [o.id, o.name]));
    setRows((data ?? []).map((d) => ({ ...d, org_name: orgMap.get(d.org_id) ?? "Unknown" })));
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const stop = async (id: string) => {
    const { error } = await supabase.from("campaigns").update({ status: "cancelled" }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Campaign cancelled");
      refresh();
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">All Campaigns</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pause or cancel any campaign across tenants</p>
      </div>
      <Card className="border-border/60 bg-gradient-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No campaigns yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Organization</th>
                  <th className="px-4 py-2.5 font-medium">Campaign</th>
                  <th className="px-4 py-2.5 font-medium">Channel</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Sent / Total</th>
                  <th className="px-4 py-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{r.org_name}</td>
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="px-4 py-3 text-xs">{r.channel}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${statusCls[r.status] ?? "bg-muted"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {r.sent_count} / {r.total_recipients}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => stop(r.id)}
                        disabled={["sent", "cancelled", "failed"].includes(r.status)}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/50 px-2 py-1 text-[10px] hover:bg-destructive/15 hover:text-destructive disabled:opacity-30"
                      >
                        <X className="h-3 w-3" /> Stop
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
