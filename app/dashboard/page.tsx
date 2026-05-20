"use client";

import ManagerDashboard from "@/components/dashboard/ManagerDashboard";
import OwnerDashboard from "@/components/dashboard/OwnerDashboard";
import ReceptionistDashboard from "@/components/dashboard/ReceptionistDashboard";
import userStore from "@/stores/userStore";

/**
 * Adjust the strings below to match your ROLES constants exactly.
 */
export default function DashboardPage() {
    const { user } = userStore();
    const role = user?.role?.toUpperCase();

    if (role === "OWNER") return <OwnerDashboard />;
    if (role === "MANAGER") return <OwnerDashboard />;
    if (role === "RECEPTIONIST") return <ReceptionistDashboard />;

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