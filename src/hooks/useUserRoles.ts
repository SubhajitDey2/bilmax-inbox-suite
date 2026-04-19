import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface RoleRow {
  org_id: string;
  role: AppRole;
}

export function useUserRoles(userId: string | undefined) {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setRoles([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    supabase
      .from("user_roles")
      .select("org_id, role")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error("useUserRoles", error);
        setRoles((data ?? []) as RoleRow[]);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const isSuperAdmin = roles.some((r) => r.role === "super_admin");
  const orgIds = Array.from(new Set(roles.map((r) => r.org_id)));
  const primaryOrgId = orgIds[0];

  return { roles, isSuperAdmin, orgIds, primaryOrgId, loading };
}
