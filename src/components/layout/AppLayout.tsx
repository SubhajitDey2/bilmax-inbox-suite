import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search, Command } from "lucide-react";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-sm text-muted-foreground w-72 hover:border-primary/40 transition">
              <Search className="h-3.5 w-3.5" />
              <span className="flex-1">Search conversations, contacts…</span>
              <kbd className="flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-gradient-subtle">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
