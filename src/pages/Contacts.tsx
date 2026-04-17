import { Card } from "@/components/ui/card";
import { contacts } from "@/lib/mockData";
import { Download, Upload, Plus, Search, Filter } from "lucide-react";

export default function Contacts() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
          <p className="mt-1 text-sm text-muted-foreground">{contacts.length} customers across all channels</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium hover:bg-secondary transition">
            <Upload className="h-3.5 w-3.5" /> Sync Google
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium hover:bg-secondary transition">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow">
            <Plus className="h-3.5 w-3.5" /> Add Contact
          </button>
        </div>
      </div>

      <Card className="border-border/60 bg-gradient-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border p-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input placeholder="Search contacts…" className="flex-1 bg-transparent text-xs outline-none" />
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1.5 text-xs">
            <Filter className="h-3 w-3" /> Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Phone</th>
                <th className="px-4 py-2.5 font-medium">Address</th>
                <th className="px-4 py-2.5 font-medium">Gender</th>
                <th className="px-4 py-2.5 font-medium">Tags</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-border/50 transition hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-[10px] font-semibold text-primary-foreground">
                        {c.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.address}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.gender}</td>
                  <td className="px-4 py-3">
                    {c.tags.map((t) => (
                      <span key={t} className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">{t}</span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
