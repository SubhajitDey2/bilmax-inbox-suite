import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, MessagesSquare, Megaphone, LogIn } from "lucide-react";
import { toast } from "sonner";

interface OrgRow {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
  member_count: number;
  conversation_count: number;
  campaign_count: number;
}

export default function SuperAdminOverview() {
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: orgList, error } = await supabase
        .from("organizations")
        .select("id, name, slug, plan, created_at")
        .order("created_at", { ascending: false });
      if (error) {
        toast.error("Failed to load organizations");
        setLoading(false);
        return;
      }
      // Aggregate counts (parallel)
      const enriched = await Promise.all(
        (orgList ?? []).map(async (o) => {
          const [{ count: members }, { count: convos }, { count: camps }] = await Promise.all([
            supabase.from("memberships").select("*", { count: "exact", head: true }).eq("org_id", o.id),
            supabase.from("conversations").select("*", { count: "exact", head: true }).eq("org_id", o.id),
            supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("org_id", o.id),
          ]);
          return {
            ...o,
            member_count: members ?? 0,
            conversation_count: convos ?? 0,
            campaign_count: camps ?? 0,
          } as OrgRow;
        })
      );
      setOrgs(enriched);
      setLoading(false);
    })();
  }, []);

  const impersonate = (orgId: string) => {
    sessionStorage.setItem("super_admin_impersonating_org", orgId);
    toast.success("Impersonation active — viewing as client");
    window.location.href = "/";
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">All Organizations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {loading ? "Loading…" : `${orgs.length} tenant${orgs.length === 1 ? "" : "s"} on the platform`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {orgs.map((o) => (
          <Card key={o.id} className="border-border/60 bg-gradient-card p-5">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h3 className="truncate text-sm font-semibold">{o.name}</h3>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">/{o.slug}</p>
              </div>
              <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {o.plan}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat icon={Users} label="Users" value={o.member_count} />
              <Stat icon={MessagesSquare} label="Convos" value={o.conversation_count} />
              <Stat icon={Megaphone} label="Camps" value={o.campaign_count} />
            </div>
            <button
              onClick={() => impersonate(o.id)}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium hover:bg-secondary"
            >
              <LogIn className="h-3 w-3" /> Login as client
            </button>
          </Card>
        ))}
        {!loading && orgs.length === 0 && (
          <Card className="col-span-full border-dashed border-border/60 bg-card/30 p-8 text-center text-sm text-muted-foreground">
            No organizations yet.
          </Card>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-lg bg-secondary/40 py-2">
      <div className="flex items-center justify-center gap-1 text-muted-foreground">
        <Icon className="h-3 w-3" />
        <span className="text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-0.5 font-mono text-sm">{value}</p>
    </div>
  );
}
