import { Card } from "@/components/ui/card";

export default function Settings() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Workspace, team and integrations.</p>
      </div>
      {["Workspace", "Meta API Credentials", "n8n Webhook", "Notifications", "Billing"].map((s) => (
        <Card key={s} className="border-border/60 bg-gradient-card p-5">
          <h3 className="text-sm font-semibold">{s}</h3>
          <p className="mt-1 text-xs text-muted-foreground">Configuration UI will be wired up in phase 2 with Lovable Cloud.</p>
        </Card>
      ))}
    </div>
  );
}
