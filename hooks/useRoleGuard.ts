import { useAuth } from "./useAuth";
import { ROLE_ROUTES, Role, hasAnyRole } from "@/lib/roles";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export const useRoleGuard = (allowedRoles?: Role[]) => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const checkAccess = (roles?: Role[]): boolean => {
    const rolesToCheck = roles || ROLE_ROUTES[pathname] || [];
    
    if (!user) return false;
    return hasAnyRole(user.role as Role, rolesToCheck);
  };

  const redirectTo = (path: string) => {
    router.push(path);
  };

  // Auto-redirect if unauthorized
  useEffect(() => {
    if (!user) return;
    
    const hasAccess = checkAccess(allowedRoles);
    if (!hasAccess && pathname !== "/unauthorized") {
      redirectTo("/unauthorized");
    }
  }, [user, pathname, allowedRoles]);

  return {
    hasAccess: checkAccess(allowedRoles),
    userRole: user?.role as Role | undefined,
    redirectTo,
    checkAccess,
  };
};