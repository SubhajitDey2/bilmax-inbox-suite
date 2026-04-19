import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Send } from "lucide-react";
import { toast } from "sonner";

interface TemplateRow {
  id: string;
  name: string;
  category: string;
  language: string;
  body: string;
  status: string;
  rejection_reason: string | null;
  submitted_at: string | null;
  approved_at: string | null;
}

const statusCls: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning/15 text-warning",
  approved: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
};

export default function Templates() {
  const { user } = useAuth();
  const { primaryOrgId } = useUserRoles(user?.id);
  const [rows, setRows] = useState<TemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const refresh = async () => {
    if (!primaryOrgId) return;
    const { data } = await supabase
      .from("whatsapp_templates")
      .select("*")
      .eq("org_id", primaryOrgId)
      .order("created_at", { ascending: false });
    setRows((data ?? []) as TemplateRow[]);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [primaryOrgId]);

  const submitToMeta = async (id: string) => {
    // MOCK: in real implementation, call edge function `template-submit`
    const { error } = await supabase
      .from("whatsapp_templates")
      .update({ status: "pending", submitted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Submitted to Meta for approval (mocked)");
      refresh();
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Message Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create and submit templates for Meta approval</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 h-3.5 w-3.5" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Template</DialogTitle>
            </DialogHeader>
            <NewTemplateForm
              orgId={primaryOrgId}
              onCreated={() => {
                setOpen(false);
                refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/60 bg-gradient-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No templates yet. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Category</th>
                  <th className="px-4 py-2.5 font-medium">Lang</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.name}</div>
                      <div className="mt-0.5 max-w-md truncate text-[11px] text-muted-foreground">{r.body}</div>
                      {r.status === "rejected" && r.rejection_reason && (
                        <div className="mt-1 text-[11px] text-destructive">Reason: {r.rejection_reason}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs capitalize">{r.category}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.language}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${statusCls[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === "draft" && (
                        <Button size="sm" variant="secondary" onClick={() => submitToMeta(r.id)}>
                          <Send className="mr-1 h-3 w-3" /> Submit
                        </Button>
                      )}
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

function NewTemplateForm({ orgId, onCreated }: { orgId: string | undefined; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"marketing" | "utility" | "authentication">("utility");
  const [language, setLanguage] = useState("en");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!orgId || !name.trim() || !body.trim()) {
      toast.error("Name and body are required");
      return;
    }
    setSaving(true);
    const variables = Array.from(body.matchAll(/\{\{(\w+)\}\}/g)).map((m) => m[1]);
    const { error } = await supabase.from("whatsapp_templates").insert({
      org_id: orgId,
      name: name.trim().toLowerCase().replace(/\s+/g, "_"),
      category,
      language,
      body,
      variables,
      status: "draft",
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Template created");
      onCreated();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="appointment_reminder" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="utility">Utility</SelectItem>
              <SelectItem value="authentication">Authentication</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Language</Label>
          <Input value={language} onChange={(e) => setLanguage(e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Body</Label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Hi {{1}}, your appointment is confirmed for {{2}}."
          rows={4}
        />
        <p className="mt-1 text-[11px] text-muted-foreground">Use {"{{1}}, {{2}}"} for variables</p>
      </div>
      <Button onClick={submit} disabled={saving} className="w-full">
        {saving ? "Creating…" : "Create as Draft"}
      </Button>
    </div>
  );
}
