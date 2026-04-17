import { Card } from "@/components/ui/card";
import { ArrowUpRight, MessageSquare, Send, Activity, Users2, Clock } from "lucide-react";
import { dashboardStats, monthlySeries, channelSplit, responseRateSeries } from "@/lib/mockData";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell, Bar, BarChart, Legend } from "recharts";
import { useState } from "react";

const ranges = ["Monthly", "Quarterly", "Half-Yearly", "Yearly"] as const;

const Stat = ({ icon: Icon, label, value, delta, accent }: any) => (
  <Card className="relative overflow-hidden border-border/60 bg-gradient-card p-5">
    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
    <div className="flex items-start justify-between">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="inline-flex items-center gap-0.5 rounded-md bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
        <ArrowUpRight className="h-3 w-3" /> {delta}
      </span>
    </div>
    <div className="mt-4">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  </Card>
);

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

export default function Dashboard() {
  const [range, setRange] = useState<(typeof ranges)[number]>("Monthly");

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, Jay 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's what's happening across your channels today.</p>
        </div>
        <div className="flex rounded-lg border border-border bg-secondary/40 p-0.5">
          {ranges.map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${range === r ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Send} label="Messages Sent" value={dashboardStats.sent.toLocaleString()} delta="+12.4%" accent="bg-primary/10 text-primary" />
        <Stat icon={MessageSquare} label="Messages Received" value={dashboardStats.received.toLocaleString()} delta="+8.1%" accent="bg-info/10 text-info" />
        <Stat icon={Activity} label="Response Rate" value={`${dashboardStats.responseRate}%`} delta="+2.3%" accent="bg-success/10 text-success" />
        <Stat icon={Users2} label="Active Chats" value={dashboardStats.activeChats} delta="+4" accent="bg-warning/10 text-warning" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 bg-gradient-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Message Volume</h3>
              <p className="text-xs text-muted-foreground">Sent vs received over time</p>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">{range.toUpperCase()}</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlySeries}>
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--info))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--info))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="sent" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#g1)" />
              <Area type="monotone" dataKey="received" stroke="hsl(var(--info))" strokeWidth={2} fill="url(#g2)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="border-border/60 bg-gradient-card p-5">
          <h3 className="text-sm font-semibold">Channel Split</h3>
          <p className="text-xs text-muted-foreground">Where conversations happen</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={channelSplit} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
                {channelSplit.map((c, i) => <Cell key={i} fill={c.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {channelSplit.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                  <span>{c.name}</span>
                </div>
                <span className="font-mono text-muted-foreground">{c.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 bg-gradient-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Response Rate</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={responseRateSeries}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} domain={[60, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="relative overflow-hidden border-dashed border-border/60 bg-gradient-card p-5">
          <div className="absolute inset-0 bg-gradient-glow opacity-60" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
              Coming Soon
            </span>
            <h3 className="mt-3 text-base font-semibold">AI Sentiment Insights</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">Auto-detect emotion, intent and tone across every message — surface unhappy customers before they churn.</p>
            <div className="mt-5 flex -space-x-2">
              {["bg-primary", "bg-info", "bg-success", "bg-warning"].map((c, i) => (
                <div key={i} className={`h-7 w-7 rounded-full ${c}/30 border-2 border-card`} />
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
