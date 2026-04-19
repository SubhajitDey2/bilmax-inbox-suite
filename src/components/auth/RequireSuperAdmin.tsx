import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";

export default function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isSuperAdmin, loading: rolesLoading } = useUserRoles(user?.id);

  if (loading || rolesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Checking permissions…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!isSuperAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
