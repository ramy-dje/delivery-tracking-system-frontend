"use client";
import RoleGuard from "@/lib/RoleGuard";
import { ROLES } from "@/lib/roles";
import OwnerDashboard from "@/components/dashboard/OwnerDashboard";
import ManagerDashboard from "@/components/dashboard/ManagerDashboard";
import ReceptionistDashboard from "@/components/dashboard/ReceptionistDashboard";

export default function OverviewPage() {
  // This route acts as a focused overview entry. Real app may choose which dashboard to show
  return (
    <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.OWNER, ROLES.MANAGER]}>
      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-sm text-slate-400">High-level operational overview and quick stats.</p>
        </div>

        {/* Simple composition: render manager/owner/receptionist dashboards as placeholders. */}
        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-lg border border-white/6 p-4">
            <ManagerDashboard />
          </div>
          <div className="rounded-lg border border-white/6 p-4">
            <OwnerDashboard />
          </div>
          <div className="rounded-lg border border-white/6 p-4">
            <ReceptionistDashboard />
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
