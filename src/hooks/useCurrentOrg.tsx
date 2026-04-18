import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface OrgMembership {
  org_id: string;
  organizations: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
}

export function useMyOrgs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-orgs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memberships")
        .select("org_id, organizations(id, name, slug, plan)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []) as unknown as OrgMembership[];
    },
  });
}

export function useCurrentOrg() {
  const { data: orgs, isLoading } = useMyOrgs();
  const stored = typeof window !== "undefined" ? localStorage.getItem("current_org_id") : null;
  const current =
    orgs?.find((o) => o.org_id === stored)?.organizations ??
    orgs?.[0]?.organizations ??
    null;

  const setCurrent = (orgId: string) => {
    localStorage.setItem("current_org_id", orgId);
    window.location.reload();
  };

  return { org: current, orgs, isLoading, setCurrent };
}
