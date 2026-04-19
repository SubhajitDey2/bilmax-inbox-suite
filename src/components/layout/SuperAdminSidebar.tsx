import { LayoutGrid, Inbox, Megaphone, MessageCircle, ShieldCheck, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";

const items = [
  { title: "Overview", url: "/admin", icon: LayoutGrid },
  { title: "All Conversations", url: "/admin/inbox", icon: Inbox },
  { title: "All Campaigns", url: "/admin/campaigns", icon: Megaphone },
  { title: "WhatsApp Accounts", url: "/admin/whatsapp", icon: MessageCircle },
];

export function SuperAdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const linkCls = (active: boolean) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
      active
        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
    }`;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
            <ShieldCheck className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">Super Admin</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Global Control</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-widest">Admin</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={({ isActive }) => linkCls(isActive)}>
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex w-full items-center gap-2 rounded-lg p-2 text-sm text-muted-foreground hover:bg-sidebar-accent/50"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Sign out"}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
