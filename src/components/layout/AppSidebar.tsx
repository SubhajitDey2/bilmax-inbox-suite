import { LayoutDashboard, Inbox, Users, Megaphone, Settings, Sparkles, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const main = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Inbox", url: "/inbox", icon: Inbox },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Campaigns", url: "/campaigns", icon: Megaphone },
];
const system = [{ title: "Settings", url: "/settings", icon: Settings }];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user } = useAuth();

  const linkCls = (active: boolean) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
      active
        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
    }`;

  const initials =
    user?.user_metadata?.full_name
      ?.split(" ")
      .map((s: string) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-sidebar-accent-foreground">Pulse</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Conversations</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-widest">Workspace</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {main.map((item) => (
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

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-widest">System</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {system.map((item) => (
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
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-sidebar-accent/50 transition">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">{initials}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-accent-foreground">
                  {user?.user_metadata?.full_name ?? user?.email ?? "Guest"}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent/50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={() => supabase.auth.signOut()}
            className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground"
          >
            {initials}
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
