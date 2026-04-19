import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Template { id: string; name: string; status: string }
interface Customer { id: string; name: string; phone: string | null; tags: string[] }

export function NewCampaignDialog({ onCreated }: { onCreated?: () => void }) {
  const { user } = useAuth();
  const { primaryOrgId } = useUserRoles(user?.id);
  const [open, setOpen] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState<string>("");
  const [audienceMode, setAudienceMode] = useState<"all" | "tag">("all");
  const [tagFilter, setTagFilter] = useState("");
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !primaryOrgId) return;
    (async () => {
      const [{ data: tpls }, { data: custs }] = await Promise.all([
        supabase.from("whatsapp_templates").select("id, name, status").eq("org_id", primaryOrgId),
        supabase.from("customers").select("id, name, phone, tags").eq("org_id", primaryOrgId),
      ]);
      setTemplates((tpls ?? []) as Template[]);
      setCustomers((custs ?? []) as Customer[]);
    })();
  }, [open, primaryOrgId]);

  const approvedTemplates = templates.filter((t) => t.status === "approved");
  const eligibleCustomers = customers.filter((c) => {
    if (!c.phone) return false;
    if (audienceMode === "all") return true;
    if (!tagFilter.trim()) return true;
    return c.tags.includes(tagFilter.trim());
  });

  const send = async () => {
    if (!primaryOrgId) return toast.error("No organization");
    if (!name.trim()) return toast.error("Name is required");
    if (!templateId) return toast.error("Select an approved template");
    if (eligibleCustomers.length === 0) return toast.error("No eligible recipients");

    setSaving(true);
    // 1. Create campaign
    const { data: camp, error: cErr } = await supabase
      .from("campaigns")
      .insert({
        org_id: primaryOrgId,
        name: name.trim(),
        channel: "whatsapp",
        status: scheduleMode === "now" ? "sending" : "scheduled",
        scheduled_at: scheduleMode === "later" ? scheduledAt || null : null,
        whatsapp_template_id: templateId,
        total_recipients: eligibleCustomers.length,
        audience_filter: { mode: audienceMode, tag: tagFilter || null },
      })
      .select()
      .single();
    if (cErr || !camp) {
      setSaving(false);
      return toast.error(cErr?.message ?? "Failed to create campaign");
    }
    // 2. Enqueue recipients
    const queueRows = eligibleCustomers.map((c) => ({
      org_id: primaryOrgId,
      campaign_id: camp.id,
      customer_id: c.id,
      scheduled_for: scheduleMode === "now" ? new Date().toISOString() : scheduledAt || new Date().toISOString(),
    }));
    const { error: qErr } = await supabase.from("campaign_queue").insert(queueRows);
    setSaving(false);
    if (qErr) return toast.error(qErr.message);
    toast.success(`Campaign queued: ${eligibleCustomers.length} messages`);
    setOpen(false);
    setName("");
    setTemplateId("");
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-3.5 w-3.5" /> New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New WhatsApp Campaign</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Campaign Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Diwali Sale 2026" />
          </div>

          <div>
            <Label>Approved Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
              <SelectContent>
                {approvedTemplates.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground">No approved templates yet</div>
                ) : (
                  approvedTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {templates.length > 0 && approvedTemplates.length === 0 && (
              <div className="mt-1 flex items-start gap-1.5 text-[11px] text-warning">
                <AlertCircle className="mt-0.5 h-3 w-3" />
                Templates exist but none are approved by Meta yet.
              </div>
            )}
          </div>

          <div>
            <Label>Audience</Label>
            <RadioGroup value={audienceMode} onValueChange={(v) => setAudienceMode(v as any)} className="mt-1 flex gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <RadioGroupItem value="all" /> All customers with phone
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <RadioGroupItem value="tag" /> Filter by tag
              </label>
            </RadioGroup>
            {audienceMode === "tag" && (
              <Input className="mt-2" placeholder="vip" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} />
            )}
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {eligibleCustomers.length} eligible recipient{eligibleCustomers.length === 1 ? "" : "s"}
            </p>
          </div>

          <div>
            <Label>Send</Label>
            <RadioGroup value={scheduleMode} onValueChange={(v) => setScheduleMode(v as any)} className="mt-1 flex gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <RadioGroupItem value="now" /> Now
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <RadioGroupItem value="later" /> Schedule
              </label>
            </RadioGroup>
            {scheduleMode === "later" && (
              <Input
                type="datetime-local"
                className="mt-2"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            )}
          </div>

          <Button onClick={send} disabled={saving} className="w-full">
            {saving ? "Creating…" : scheduleMode === "now" ? "Send Now" : "Schedule"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
