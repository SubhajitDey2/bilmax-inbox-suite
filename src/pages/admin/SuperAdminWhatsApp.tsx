import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, CheckCircle2, XCircle, Clock } from "lucide-react";

interface Row {
  id: string;
  org_id: string;
  connection_type: string;
  display_name: string;
  phone_number_id: string | null;
  status: string;
  last_synced_at: string | null;
  org_name?: string;
}

const statusIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  connected: CheckCircle2,
  pending: Clock,
  disconnected: XCircle,
  error: XCircle,
};
const statusCls: Record<string, string> = {
  connected: "text-success",
  pending: "text-warning",
  disconnected: "text-muted-foreground",
  error: "text-destructive",
};

export default function SuperAdminWhatsApp() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("whatsapp_accounts")
        .select("id, org_id, connection_type, display_name, phone_number_id, status, last_synced_at");
      const orgIds = Array.from(new Set((data ?? []).map((d) => d.org_id)));
      const { data: orgs } = await supabase.from("organizations").select("id, name").in("id", orgIds);
      const orgMap = new Map((orgs ?? []).map((o) => [o.id, o.name]));
      setRows((data ?? []).map((d) => ({ ...d, org_name: orgMap.get(d.org_id) ?? "Unknown" })));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">WhatsApp Accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">Per-tenant WhatsApp Cloud API & Coexistence connections</p>
      </div>
      <Card className="border-border/60 bg-gradient-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-sm text-muted-foreground">
            <MessageCircle className="h-8 w-8 opacity-40" />
            No WhatsApp accounts configured yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Organization</th>
                  <th className="px-4 py-2.5 font-medium">Display Name</th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="px-4 py-2.5 font-medium">Phone #</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Last Sync</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const Icon = statusIcon[r.status] ?? XCircle;
                  return (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{r.org_name}</td>
                      <td className="px-4 py-3">{r.display_name}</td>
                      <td className="px-4 py-3 text-xs">{r.connection_type === "cloud_api" ? "Cloud API" : "Coexistence"}</td>
                      <td className="px-4 py-3 font-mono text-xs">{r.phone_number_id ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs ${statusCls[r.status]}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[11px] text-muted-foreground">
                        {r.last_synced_at ? new Date(r.last_synced_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
