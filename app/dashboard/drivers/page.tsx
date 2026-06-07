"use client";

import { useCallback, useEffect, useState } from "react";
import { ROLES } from "@/lib/roles";
import { getNodeId } from "@/hooks/useAuth";
import { showToast } from "nextjs-toast-notify";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import { Plus, Search, X } from "lucide-react";
import RoleGuard from "@/lib/RoleGuard";
import StatCard from "@/components/commons/StatCard";
import { ICreateDelivererPayload, IDelivererResponse } from "@/types/driver";
import { createDriver, listDrivers, updateDriverStatus } from "@/services/DriverService";
import DriverList from "@/components/dashboard/drivers/DriverList";
import CreateDriverModal from "@/components/dashboard/drivers/CreateDriverModal";
import ErrorBaner from "@/components/commons/ErrorBaner";
import DriverDetailModal from "@/components/dashboard/drivers/DriverDetailModal";
import { parseApiError } from "@/utils/apiErrorHandler";

export default function DriversPage() {
    const managerNodeId = getNodeId() ?? "";

    const [drivers, setDrivers] = useState<IDelivererResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const [createOpen, setCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<IDelivererResponse | null>(null);
    const [activationStatusLoading, setActivationStatusLoading] = useState(false);

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

    // ── Fetch ─────────────────────────────────────────────────────────────

    const fetchDrivers = useCallback(async () => {
        setLoading(true);
        if (!managerNodeId) {
            setDrivers([]);
            setLoading(false);
            setError("No logistics node is assigned to this manager.");
            return;
        }
        setError(null);
        try {
            const res = await listDrivers(managerNodeId, { search: search || undefined });
            setDrivers(res.data);
        } catch (e: any) {
            const error = parseApiError(e);
            const msg = error.message ?? "Failed to fetch drivers";
            showToast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [managerNodeId, search]);

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchDrivers();
        }, 400);

        return () => clearTimeout(delay);
    }, [fetchDrivers]);

    const activeCount = drivers.filter((d) => d.isActive).length;
    const totalCount = drivers.length;

    // ── CRUD ──────────────────────────────────────────────────────────────

    const handleCreate = async (data: ICreateDelivererPayload) => {
        if (!managerNodeId) return;
        setCreateLoading(true);
        try {
            await createDriver(managerNodeId, data);
            setCreateOpen(false);
            showToast.success("Deliverer created successfully");
            fetchDrivers();
        } catch (e: any) {
            const serverErrors = e?.response?.data?.errors;
            const firstServerError = serverErrors ? Object.values(serverErrors).flat().find(Boolean) : null;
            const msg = firstServerError ?? e?.response?.data?.message ?? e?.response?.data?.title ?? e?.message ?? "Failed to create deliverer";
            showToast.error(msg as string);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleConfirmToggleActivation = async () => {
        if (!selectedDriver || !managerNodeId) return;
        setActivationStatusLoading(true);
        try {
            await updateDriverStatus(managerNodeId, selectedDriver._id);
            showToast.success(`Deliverer ${selectedDriver.isActive ? "suspended" : "activated"}`);
            setConfirmOpen(false);
            setSelectedDriver(null);
            fetchDrivers();
        } catch (e: any) {
            const error = parseApiError(e);
            showToast.error(error.message);
        } finally {
            setActivationStatusLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <RoleGuard allowedRoles={[ROLES.MANAGER]}>
            <div className="flex flex-col gap-3 h-full">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 pt-1">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }} />
                            <h1 className="text-[22px] font-bold text-white tracking-tight">Deliverers</h1>
                        </div>
                        <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                            Manage deliverers for your branch.
                        </p>
                    </div>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 4px 16px rgba(251,191,36,0.2)" }}
                    >
                        <Plus size={13} />
                        New Deliverer
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Total" value={totalCount} accent="#94a3b8" />
                    <StatCard label="Active" value={activeCount} accent="#34d399" />
                </div>

                {error && (
                    <ErrorBaner error={error} setError={setError} />
                )}

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div
                        className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-lg"
                        style={{
                            background: "rgba(255,255,255,0.025)",
                            border: "1px solid rgba(255,255,255,0.07)",
                        }}
                    >
                        <Search size={13} className="text-slate-700 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or username…"
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
                    <span className="text-[11px] text-slate-700 ml-auto hidden sm:block tabular-nums">
                        {drivers.length} deliverer{drivers.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <DriverList
                    drivers={drivers}
                    loading={loading}
                    onAddClick={() => setCreateOpen(true)}
                    onViewDetail={(id) => { setSelectedDriverId(id); setDetailOpen(true); }}
                    onToggleStatus={(s) => { setSelectedDriver(s); setConfirmOpen(true); }}
                />

                {/* Modals */}
                <CreateDriverModal
                    isOpen={createOpen}
                    onClose={() => setCreateOpen(false)}
                    onSubmit={handleCreate}
                    loading={createLoading}
                />

                {confirmOpen && selectedDriver && (
                    <ConfirmDialog
                        title={`${selectedDriver.isActive ? "Suspend" : "Activate"} Deliverer`}
                        message={`${selectedDriver.isActive ? "Suspend" : "Activate"} "${selectedDriver.userId.firstName} ${selectedDriver.userId.lastName}"? They will ${selectedDriver.isActive ? "no longer" : "be able to"} access the system.`}
                        confirmLabel="Confirm"
                        danger={selectedDriver.isActive} 
                        loading={activationStatusLoading}
                        onConfirm={handleConfirmToggleActivation}
                        onCancel={() => { setConfirmOpen(false); setSelectedDriver(null); }}
                    />
                )}

                {selectedDriverId && managerNodeId && (
                    <DriverDetailModal
                        isOpen={detailOpen}
                        driverId={selectedDriverId}
                        branchId={managerNodeId}
                        onClose={() => { setDetailOpen(false); setSelectedDriverId(null); }}
                    />
                )}
            </div>
        </RoleGuard>
    );
}