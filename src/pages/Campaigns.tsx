import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Eye, Send, MailCheck } from "lucide-react";
import { NewCampaignDialog } from "@/components/campaigns/NewCampaignDialog";

interface Row {
  id: string;
  name: string;
  status: string;
  sent_count: number;
  total_recipients: number;
  failed_count: number;
  created_at: string;
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

export default function Campaigns() {
  const { user } = useAuth();
  const { primaryOrgId } = useUserRoles(user?.id);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!primaryOrgId) return;
    const { data } = await supabase
      .from("campaigns")
      .select("id, name, status, sent_count, total_recipients, failed_count, created_at")
      .eq("org_id", primaryOrgId)
      .order("created_at", { ascending: false });
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [primaryOrgId]);

  const totalSent = rows.reduce((a, c) => a + c.sent_count, 0);
  const totalRecipients = rows.reduce((a, c) => a + c.total_recipients, 0);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
          <p className="mt-1 text-sm text-muted-foreground">WhatsApp broadcasts using approved templates.</p>
        </div>
        <NewCampaignDialog onCreated={refresh} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPI icon={Send} label="Total Sent" value={totalSent.toLocaleString()} />
        <KPI icon={MailCheck} label="Recipients" value={totalRecipients.toLocaleString()} />
        <KPI
          icon={Eye}
          label="Delivery Rate"
          value={totalRecipients > 0 ? `${Math.round((totalSent / totalRecipients) * 100)}%` : "—"}
        />
      </div>

      <Card className="border-border/60 bg-gradient-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No campaigns yet. Click <strong>New Campaign</strong> to start.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Campaign</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Sent</th>
                  <th className="px-4 py-2.5 font-medium text-right">Failed</th>
                  <th className="px-4 py-2.5 font-medium text-right">Total</th>
                  <th className="px-4 py-2.5 font-medium text-right">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 transition">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${statusCls[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{c.sent_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{c.failed_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{c.total_recipients.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-[11px] text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
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

function KPI({ icon: Icon, label, value }: any) {
  return (
    <Card className="border-border/60 bg-gradient-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-semibold">{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}
