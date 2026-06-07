"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { ROLES } from "@/lib/roles";
import { getNodeId } from "@/hooks/useAuth";
import RoleGuard from "@/lib/RoleGuard";
import StatCard from "@/components/commons/StatCard";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import ErrorBaner from "@/components/commons/ErrorBaner";
import { parseApiError } from "@/utils/apiErrorHandler";
import { IRoute, RouteStatus } from "@/types/route";
import { listRoutes, toggleCancelRoute } from "@/services/RouteService";
import RouteList from "@/components/dashboard/routes/RouteList";

const STATUS_FILTERS: { label: string; value: "" | RouteStatus }[] = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending" },
    { label: "In Transit", value: "in_transit" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
];

export default function RoutesPage() {
    const branchId = getNodeId() ?? "";

    const [routes, setRoutes] = useState<IRoute[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"" | RouteStatus>("");

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selected, setSelected] = useState<IRoute | null>(null);
    const [toggleLoading, setToggleLoading] = useState(false);

    // ── Fetch ────────────────────────────────────────────────────────────────

    const fetchRoutes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await listRoutes(branchId);
            const items: IRoute[] = (res.data ?? []).map((r: any) => ({
                id: r._id ?? r.id,
                status: r.status ?? "pending",
                originBranchId: r.originBranchId ?? r.originBranch?._id,
                originBranchName: r.originBranchName ?? r.originBranch?.name,
                stops: (r.stops ?? []).map((s: any) => ({
                    branchId: s.branchId?._id ?? s.branchId,
                    branchName: s.branchId?.name ?? s.branchName,
                    order: s.order ?? 0,
                    arrivedAt: s.arrivedAt,
                })),
                transporterId: r.transporterId?._id ?? r.transporterId,
                transporterName: r.transporterId?.userId
                    ? `${r.transporterId.userId.firstName} ${r.transporterId.userId.lastName}`
                    : r.transporterName,
                packageCount: r.packageCount ?? r.packages?.length,
                createdAt: r.createdAt,
                updatedAt: r.updatedAt,
            }));
            setRoutes(items);
        } catch (e: any) {
            const err = parseApiError(e);
            setError(err.message ?? "Failed to fetch routes");
        } finally {
            setLoading(false);
        }
    }, [branchId]);

    useEffect(() => { fetchRoutes(); }, [fetchRoutes]);

    const filtered = routes.filter((r) => {
        if (statusFilter && r.status !== statusFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                r.originBranchName?.toLowerCase().includes(q) ||
                r.transporterName?.toLowerCase().includes(q) ||
                r.stops.some((s) => s.branchName?.toLowerCase().includes(q))
            );
        }
        return true;
    });

    const activeCount = routes.filter((r) => r.status === "in_transit").length;
    const completedCount = routes.filter((r) => r.status === "completed").length;

    // ── CRUD ─────────────────────────────────────────────────────────────────

    const handleToggleCancel = async () => {
        if (!selected || !branchId) return;
        setToggleLoading(true);
        try {
            await toggleCancelRoute(branchId, selected.id);
            showToast.success(`Route ${selected.status === "cancelled" ? "restored" : "cancelled"}`);
            setConfirmOpen(false);
            setSelected(null);
            fetchRoutes();
        } catch (e: any) {
            const err = parseApiError(e);
            showToast.error(err.message ?? "Failed to update route");
        } finally {
            setToggleLoading(false);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <RoleGuard allowedRoles={[ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.ADMIN]}>
            <div className="flex flex-col gap-3 h-full">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 pt-1">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }} />
                            <h1 className="text-[22px] font-bold text-white tracking-tight">Routes</h1>
                        </div>
                        <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                            Inter-branch delivery routes for this branch.
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard label="Total" value={routes.length} accent="#94a3b8" />
                    <StatCard label="In Transit" value={activeCount} accent="#22d3ee" />
                    <StatCard label="Completed" value={completedCount} accent="#34d399" />
                </div>

                {error && <ErrorBaner error={error} setError={setError} />}

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div
                        className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-lg"
                        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                        <Search size={13} className="text-slate-700 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by branch or transporter…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent text-[12.5px] text-white placeholder:text-slate-700 focus:outline-none flex-1 min-w-0"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="text-slate-700 hover:text-slate-500">
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    {/* Status pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {STATUS_FILTERS.map((f) => {
                            const active = statusFilter === f.value;
                            return (
                                <button
                                    key={f.value}
                                    onClick={() => setStatusFilter(f.value)}
                                    className="px-3 py-1.5 rounded-lg text-[11.5px] font-medium transition-all duration-150"
                                    style={{
                                        background: active ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.03)",
                                        border: active ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(255,255,255,0.06)",
                                        color: active ? "#fbbf24" : "#64748b",
                                    }}
                                >
                                    {f.label}
                                </button>
                            );
                        })}
                    </div>

                    <span className="text-[11px] text-slate-700 ml-auto hidden sm:block tabular-nums">
                        {filtered.length} route{filtered.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <RouteList
                    routes={filtered}
                    loading={loading}
                    onToggleCancel={(r) => { setSelected(r); setConfirmOpen(true); }}
                />

                {confirmOpen && selected && (
                    <ConfirmDialog
                        title={`${selected.status === "cancelled" ? "Restore" : "Cancel"} Route`}
                        message={`${selected.status === "cancelled" ? "Restore" : "Cancel"} this route? ${selected.status !== "cancelled" ? "Packages will not be dispatched until it is restored." : ""}`}
                        confirmLabel="Confirm"
                        danger={selected.status !== "cancelled"}
                        loading={toggleLoading}
                        onConfirm={handleToggleCancel}
                        onCancel={() => { setConfirmOpen(false); setSelected(null); }}
                    />
                )}
            </div>
        </RoleGuard>
    );
}
