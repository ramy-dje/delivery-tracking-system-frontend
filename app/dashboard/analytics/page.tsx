"use client";

import ManagerAnalyticsDashboard from "@/components/dashboard/ManagerAnalyticsDashboard";
import ReceptionistDashboard from "@/components/dashboard/ReceptionistDashboard";
import userStore from "@/stores/userStore";

export default function DashboardAnalyticsPage() {
  const { user } = userStore();
  const role = user?.role?.toUpperCase();

  if (role === "MANAGER" || role === "ADMIN") {
    return <ManagerAnalyticsDashboard />;
  }

  if (role === "CACHIER") {
    return <ReceptionistDashboard />;
  }

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="space-y-2 text-center">
        <p className="text-sm text-slate-400">
          No analytics dashboard for role: <span className="font-mono text-white">{user?.role ?? "unknown"}</span>
        </p>
        <p className="text-xs text-slate-600">Contact your administrator.</p>
      </div>
    </div>
  );
}
