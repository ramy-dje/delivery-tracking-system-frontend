"use client";
import RoleGuard from "@/lib/RoleGuard";
import { ROLES } from "@/lib/roles";
import OwnerDashboard from "@/components/dashboard/OwnerDashboard";
import ManagerDashboard from "@/components/dashboard/ManagerDashboard";
import ReceptionistDashboard from "@/components/dashboard/ReceptionistDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import userStore from "@/stores/userStore";

export default function OverviewPage() {
  const { user } = userStore();
  const role = user?.role;

  return (
    <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.OWNER, ROLES.MANAGER, ROLES.RECEPTIONIST]}>
      <div className="p-4 h-full overflow-y-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-sm text-slate-400">High-level operational overview and quick stats.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {role === ROLES.ADMIN && (
            <div className="rounded-lg border border-white/6 p-4">
              <AdminDashboard />
            </div>
          )}
          {role === ROLES.MANAGER && (
            <div className="rounded-lg border border-white/6 p-4">
              <ManagerDashboard />
            </div>
          )}
          {role === ROLES.OWNER && (
            <div className="rounded-lg border border-white/6 p-4">
              <OwnerDashboard />
            </div>
          )}
          {role === ROLES.RECEPTIONIST && (
            <div className="rounded-lg border border-white/6 p-4">
              <ReceptionistDashboard />
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
