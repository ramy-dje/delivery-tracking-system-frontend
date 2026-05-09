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
        if (!hasHydrated) {
            return;
        }

        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }

        const hasAccess = allowedRoles.includes(user.role as Role);

        if (!hasAccess) {
            router.push(fallbackPath);
        }
    }, [user, hasHydrated, allowedRoles, router, pathname, fallbackPath]);

    // Show loading while checking
    if (!hasHydrated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // Check access before rendering
    const hasAccess = allowedRoles.includes(user.role as Role);
    if (!hasAccess) {
        return null; // Prevent flash of content
    }

    return <>{children}</>;
}