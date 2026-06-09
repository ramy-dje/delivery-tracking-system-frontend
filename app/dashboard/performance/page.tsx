"use client";

import ManagerPerformanceDashboard from "@/components/dashboard/ManagerPerformanceDashboard";
import userStore from "@/stores/userStore";

export default function DashboardPerformancePage() {
  const { user } = userStore();
  const role = user?.role?.toUpperCase();

  if (role === "MANAGER" || role === "ADMIN") {
    return <ManagerPerformanceDashboard />;
  }

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="space-y-2 text-center">
        <p className="text-sm text-slate-400">
          No performance dashboard for role: <span className="font-mono text-white">{user?.role ?? "unknown"}</span>
        </p>
        <p className="text-xs text-slate-600">Contact your administrator.</p>
      </div>
    </div>
  );
}
