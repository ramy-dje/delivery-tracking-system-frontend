import React from "react";
import RoleGuard from "@/lib/RoleGuard";
import { ROLES } from "@/lib/roles";
import TopNav from "@/components/dashboard/TopNav";
import Sidebar from "@/components/dashboard/sidebar";

export const metadata = {
    title: "Dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    // Roles allowed to access the dashboard (exclude mobile-only roles)
    const allowed = [
        ROLES.ADMIN,
        ROLES.OWNER,
        ROLES.MERCHANT,
        ROLES.MANAGER,
        ROLES.SHIFT_SUPERVISOR,
        ROLES.INVENTORY_AUDITOR,
        ROLES.SECURITY_OFFICER,
        ROLES.RECEPTIONIST,
        ROLES.SORTER,
    ];

    return (
        /*role guard removedd now for easy work <RoleGuard allowedRoles={allowed}>*/       
            <div className="h-dvh overflow-hidden p-3 bg-[#020816] text-white selection:bg-amber-500/30">
                <div className="w-full h-full flex flex-col gap-3">
                    <TopNav />

                    <div className="flex-1 min-h-0 flex flex-col gap-3 md:flex-row">
                        <Sidebar />

                        <main className="w-full min-h-0 h-full p-3 border border-white/10 rounded-lg bg-background-surface">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
    );
}
