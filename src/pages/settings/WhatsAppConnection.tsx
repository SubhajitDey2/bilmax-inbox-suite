import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type ConnType = "cloud_api" | "coexistence";

export default function WhatsAppConnection() {
  const { user } = useAuth();
  const { primaryOrgId } = useUserRoles(user?.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnType>("cloud_api");
  const [displayName, setDisplayName] = useState("WhatsApp");
  const [metaAppId, setMetaAppId] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [status, setStatus] = useState<string>("disconnected");
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    if (!primaryOrgId) return;
    (async () => {
      const { data } = await supabase
        .from("whatsapp_accounts")
        .select("*")
        .eq("org_id", primaryOrgId)
        .eq("connection_type", connectionType)
        .maybeSingle();
      if (data) {
        setAccountId(data.id);
        setDisplayName(data.display_name);
        setMetaAppId(data.meta_app_id ?? "");
        setPhoneNumberId(data.phone_number_id ?? "");
        setWabaId(data.whatsapp_business_account_id ?? "");
        setStatus(data.status);
        setLastSync(data.last_synced_at);
        setLastError(data.last_error);
        // tokens are stored encrypted; we don't show them back
        setAccessToken("");
        setAppSecret("");
      } else {
        setAccountId(null);
        setStatus("disconnected");
        setLastSync(null);
        setLastError(null);
      }
      setLoading(false);
    })();
  }, [primaryOrgId, connectionType]);

  const save = async () => {
    if (!primaryOrgId) return;
    setSaving(true);
    // NOTE: real encryption should be done server-side via an edge function.
    // Here we mark fields as "encrypted" by prefix, replaced by real KMS later.
    const payload = {
      org_id: primaryOrgId,
      connection_type: connectionType,
      display_name: displayName,
      meta_app_id: metaAppId || null,
      phone_number_id: phoneNumberId || null,
      whatsapp_business_account_id: wabaId || null,
      access_token_encrypted: accessToken ? `enc:${accessToken}` : undefined,
      app_secret_encrypted: appSecret ? `enc:${appSecret}` : undefined,
      status: phoneNumberId && accessToken ? "pending" : "disconnected",
    };
    // Strip undefined to preserve existing token if not changed
    Object.keys(payload).forEach((k) => (payload as any)[k] === undefined && delete (payload as any)[k]);

    const { error } = accountId
      ? await supabase.from("whatsapp_accounts").update(payload).eq("id", accountId)
      : await supabase.from("whatsapp_accounts").insert(payload);

    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("WhatsApp settings saved");
  };

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">WhatsApp Connection</h1>
        <p className="mt-1 text-sm text-muted-foreground">Connect your WhatsApp Business account</p>
      </div>

      <Card className="border-border/60 bg-gradient-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Status</h3>
          <StatusBadge status={status} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Last Sync</p>
            <p className="mt-0.5">{lastSync ? new Date(lastSync).toLocaleString() : "Never"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Last Error</p>
            <p className="mt-0.5 text-destructive">{lastError ?? "None"}</p>
          </div>
        </div>
      </Card>

      <Card className="border-border/60 bg-gradient-card p-5">
        <h3 className="text-sm font-semibold">Connection Type</h3>
        <RadioGroup
          value={connectionType}
          onValueChange={(v) => setConnectionType(v as ConnType)}
          className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-3 hover:border-primary/40">
            <RadioGroupItem value="cloud_api" />
            <div>
              <p className="text-sm font-medium">WhatsApp Cloud API</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Official Meta API via Embedded Signup</p>
            </div>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-3 hover:border-primary/40">
            <RadioGroupItem value="coexistence" />
            <div>
              <p className="text-sm font-medium">Coexistence Mode</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Use Business App + API in parallel</p>
            </div>
          </label>
        </RadioGroup>
      </Card>

      <Card className="border-border/60 bg-gradient-card p-5">
        <h3 className="text-sm font-semibold">Credentials</h3>
        <div className="mt-1 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-2 text-[11px] text-warning">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>
            Tokens are stored server-side. For now they are stored with a placeholder encryption marker — wire up
            real KMS or Supabase Vault before production.
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Display Name" value={displayName} onChange={setDisplayName} />
          <Field label="Meta App ID" value={metaAppId} onChange={setMetaAppId} />
          <Field label="Phone Number ID" value={phoneNumberId} onChange={setPhoneNumberId} />
          <Field label="WhatsApp Business Account ID" value={wabaId} onChange={setWabaId} />
          <Field label="Access Token" value={accessToken} onChange={setAccessToken} type="password" placeholder={accountId ? "•••••••• (leave blank to keep)" : ""} />
          <Field label="App Secret" value={appSecret} onChange={setAppSecret} type="password" placeholder={accountId ? "•••••••• (leave blank to keep)" : ""} />
        </div>
        <div className="mt-5 flex justify-end">
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save & Test Connection"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} type={type} placeholder={placeholder} className="mt-1" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { Icon: any; cls: string }> = {
    connected: { Icon: CheckCircle2, cls: "text-success bg-success/15" },
    pending: { Icon: Clock, cls: "text-warning bg-warning/15" },
    disconnected: { Icon: XCircle, cls: "text-muted-foreground bg-muted" },
    error: { Icon: XCircle, cls: "text-destructive bg-destructive/15" },
  };
  const { Icon, cls } = map[status] ?? map.disconnected;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}
