import { Card } from "@/components/ui/card";
import { NavLink } from "react-router-dom";
import { MessageCircle, FileText, Bell, Building2 } from "lucide-react";

const sections = [
  { title: "Workspace", desc: "Organization name, plan, members.", icon: Building2, to: null },
  { title: "WhatsApp Connection", desc: "Connect Cloud API or Coexistence Mode.", icon: MessageCircle, to: "/settings/whatsapp" },
  { title: "Message Templates", desc: "Create templates and submit for Meta approval.", icon: FileText, to: "/settings/templates" },
  { title: "Notifications", desc: "Email & in-app notification preferences.", icon: Bell, to: null },
];

export default function Settings() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Workspace, integrations, and team.</p>
      </div>
      {sections.map((s) => {
        const inner = (
          <Card className="border-border/60 bg-gradient-card p-5 transition hover:border-primary/40">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">{s.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
              </div>
              {s.to && <span className="text-xs text-muted-foreground">→</span>}
            </div>
          </Card>
        );
        return s.to ? (
          <NavLink key={s.title} to={s.to}>
            {inner}
          </NavLink>
        ) : (
          <div key={s.title} className="opacity-70">{inner}</div>
        );
      })}
    </div>
  );
}
