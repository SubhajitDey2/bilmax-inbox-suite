import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SuperAdminSidebar } from "./SuperAdminSidebar";
import { Outlet } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function SuperAdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <SuperAdminSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-destructive/30 bg-destructive/5 px-4 backdrop-blur-xl">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-destructive">
              <ShieldCheck className="h-4 w-4" />
              Super Admin Mode
            </div>
            <div className="ml-auto text-[11px] text-muted-foreground">
              You can view and modify data across all organizations
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
