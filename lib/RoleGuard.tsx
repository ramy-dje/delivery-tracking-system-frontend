"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Role } from "@/lib/roles";
import { useAuth } from "@/hooks/useAuth"; // Your auth hook
import LoadingSpinner from "@/components/commons/LoadingSpinner";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: Role[];
    fallbackPath?: string; // Redirect if unauthorized (default: /unauthorized)
}
export default function RoleGuard({
    children,
    allowedRoles,
    fallbackPath = "/unauthorized"
}: RoleGuardProps) {
    const { user, hasHydrated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!hasHydrated) return;

        if (!user) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }

        if (!allowedRoles.includes(user.role as Role)) {
            router.replace(fallbackPath);
        }
    }, [user, hasHydrated, allowedRoles, router, pathname, fallbackPath]);

    if (!hasHydrated) return null;
    if (!user) return null;

    if (!allowedRoles.includes(user.role as Role)) return null;

    return <>{children}</>;
}