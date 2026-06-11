"use client";


import ManagerOverviewDashboard from "@/components/dashboard/ManagerOverviewDashboard";
import ReceptionistDashboard from "@/components/dashboard/ReceptionistDashboard";
import SupervisorDashboard from "@/components/dashboard/SupervisorDashboard";
import { ROLES } from "@/lib/roles";
import userStore from "@/stores/userStore";

/**
 * Adjust the strings below to match your ROLES constants exactly.
 */
export default function DashboardPage() {
    const { user } = userStore();
    const role = user?.role?.toUpperCase();
    console.log("User role:", role);

    if (role === ROLES.MANAGER || user?.role === ROLES.MANAGER) return <ManagerOverviewDashboard />;
    if (role === "RECEPTIONIST" || user?.role === "cachier") return <ReceptionistDashboard />;
    if (role === ROLES.SUPERVISOR.toUpperCase() || user?.role === ROLES.SUPERVISOR) return <SupervisorDashboard />;

    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
                <p className="text-slate-400 text-sm">
                    No dashboard for role:{" "}
                    <span className="text-white font-mono">{user?.role ?? "unknown"}</span>
                </p>
                <p className="text-slate-600 text-xs">Contact your administrator.</p>
            </div>
        </div>
    );
}