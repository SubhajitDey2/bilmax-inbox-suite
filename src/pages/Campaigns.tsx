import { Card } from "@/components/ui/card";
import { campaigns } from "@/lib/mockData";
import { Plus, Eye, Send, MailCheck } from "lucide-react";

const statusCls: Record<string, string> = {
  Live: "bg-success/15 text-success",
  Scheduled: "bg-info/15 text-info",
  Draft: "bg-muted text-muted-foreground",
  Completed: "bg-primary/15 text-primary",
};

export default function Campaigns() {
  const totalSent = campaigns.reduce((a, c) => a + c.sent, 0);
  const totalRead = campaigns.reduce((a, c) => a + c.read, 0);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
          <p className="mt-1 text-sm text-muted-foreground">Templates, broadcasts, retargeting drips.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow">
          <Plus className="h-3.5 w-3.5" /> New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPI icon={Send} label="Total Sent" value={totalSent.toLocaleString()} />
        <KPI icon={MailCheck} label="Read" value={totalRead.toLocaleString()} />
        <KPI icon={Eye} label="Read Rate" value={`${Math.round((totalRead / totalSent) * 100)}%`} />
      </div>

      <Card className="border-border/60 bg-gradient-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Campaign</th>
                <th className="px-4 py-2.5 font-medium">Template</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Sent</th>
                <th className="px-4 py-2.5 font-medium text-right">Delivered</th>
                <th className="px-4 py-2.5 font-medium text-right">Read</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 transition">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.template}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${statusCls[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{c.sent.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{c.delivered.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{c.read.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
