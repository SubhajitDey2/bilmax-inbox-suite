import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="absolute inset-0 bg-gradient-glow" />
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="text-left">
            <p className="text-base font-semibold tracking-tight">Pulse</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Conversations</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-6 shadow-elegant backdrop-blur-xl">
          <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your workspace</p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => { e.preventDefault(); nav("/"); }}
          >
            <div>
              <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Email</label>
              <input type="email" defaultValue="jay@bloomsalon.com" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 transition" />
            </div>
            <div>
              <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Password</label>
              <input type="password" defaultValue="••••••••" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 transition" />
            </div>
            <button type="submit" className="w-full rounded-lg bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-95">
              Sign in
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Auth wiring coming in phase 2 with Lovable Cloud.
          </p>
        </div>
      </div>
    </div>
  );
}
