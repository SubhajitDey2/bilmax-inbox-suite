import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { MessagesSquare } from "lucide-react";

interface ConvRow {
  id: string;
  org_id: string;
  channel: string;
  status: string;
  last_message_preview: string | null;
  last_message_at: string | null;
  unread_count: number;
  org_name?: string;
}

export default function SuperAdminInbox() {
  const [rows, setRows] = useState<ConvRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, org_id, channel, status, last_message_preview, last_message_at, unread_count")
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(200);
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }
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
        <h1 className="text-2xl font-semibold tracking-tight">All Conversations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time monitoring across every tenant
        </p>
      </div>
      <Card className="border-border/60 bg-gradient-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center text-sm text-muted-foreground">
            <MessagesSquare className="h-8 w-8 opacity-40" />
            No conversations yet across any tenant.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Organization</th>
                  <th className="px-4 py-2.5 font-medium">Channel</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Last message</th>
                  <th className="px-4 py-2.5 font-medium text-right">Unread</th>
                  <th className="px-4 py-2.5 font-medium text-right">When</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{r.org_name}</td>
                    <td className="px-4 py-3 text-xs">{r.channel}</td>
                    <td className="px-4 py-3 text-xs">{r.status}</td>
                    <td className="max-w-md truncate px-4 py-3 text-xs text-muted-foreground">
                      {r.last_message_preview ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{r.unread_count}</td>
                    <td className="px-4 py-3 text-right font-mono text-[11px] text-muted-foreground">
                      {r.last_message_at ? new Date(r.last_message_at).toLocaleString() : "—"}
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
