import { useState } from "react";
import { Sparkles, Loader2, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "workspace";

export default function Onboarding() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;

    // 1. Create org
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .insert({ name, slug, created_by: user.id })
      .select()
      .single();

    if (orgErr || !org) {
      setLoading(false);
      return toast.error(orgErr?.message ?? "Failed to create workspace");
    }

    // 2. Add membership
    const { error: memErr } = await supabase
      .from("memberships")
      .insert({ org_id: org.id, user_id: user.id });
    if (memErr) {
      setLoading(false);
      return toast.error(memErr.message);
    }

    // 3. Assign owner role
    const { error: roleErr } = await supabase
      .from("user_roles")
      .insert({ user_id: user.id, org_id: org.id, role: "owner" });
    if (roleErr) {
      setLoading(false);
      return toast.error(roleErr.message);
    }

    // 4. Set as default org
    await supabase.from("profiles").update({ default_org_id: org.id }).eq("id", user.id);
    localStorage.setItem("current_org_id", org.id);

    setLoading(false);
    toast.success("Workspace created");
    window.location.href = "/";
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-6">
      <div className="absolute inset-0 bg-gradient-glow" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <p className="text-base font-semibold tracking-tight">Pulse</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-6 shadow-elegant backdrop-blur-xl">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Create your workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">This is your business or salon. You can invite teammates later.</p>

          <form onSubmit={handleCreate} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="name">Workspace name</Label>
              <Input id="name" required placeholder="Bloom Salon" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading || !name.trim()} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create workspace"}
            </Button>
          </form>

          <button onClick={signOut} className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
