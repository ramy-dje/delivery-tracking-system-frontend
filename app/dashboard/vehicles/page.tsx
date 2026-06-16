"use client";

import { useCallback, useEffect, useState } from "react";
import { IVehicleListResponse, ICreateVehicleRequest, IVehicleResponse } from "@/types/vehicle";
import { ROLES } from "@/lib/roles";
import { showToast } from "nextjs-toast-notify";
import Pagination from "@/components/commons/Pagination";
import { Plus, Search, X } from "lucide-react";
import RoleGuard from "@/lib/RoleGuard";
import StatCard from "@/components/commons/StatCard";
import { createVehicle, getCompanyVehicles } from "@/services/VehicleService";
import VehicleList from "@/components/dashboard/vehicles/VehicleList";
import CreateVehicleModal from "@/components/dashboard/vehicles/CreateVehicleModal";
import VehicleDetailModal from "@/components/dashboard/vehicles/VehicleDetailModal";
import ErrorBaner from "@/components/commons/ErrorBaner";
import { parseApiError } from "@/utils/apiErrorHandler";
import { getCompanyId } from "@/hooks/useAuth";

const PAGE_SIZE = 10;

export default function VehiclesPage() {
    const companyId = getCompanyId();

    const [listResponse, setListResponse] = useState<IVehicleListResponse | null>(null);
    const vehicles: IVehicleResponse[] = listResponse?.data ?? [];
    const pagination = listResponse?.pagination ?? null;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [createOpen, setCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

    // ── Fetch ─────────────────────────────────────────────────────────────

    const fetchVehicles = useCallback(async () => {
        if (!companyId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await getCompanyVehicles(companyId, {
                search,
                page,
                limit: PAGE_SIZE,
            });
            setListResponse(res);
        } catch (e: any) {
            const err = parseApiError(e);
            console.error("Failed to fetch vehicles:", err);
            const msg = err?.message ?? "Failed to fetch vehicles";
            setError(msg);
            showToast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [companyId, page, search]);

    useEffect(() => {
        const delay = setTimeout(() => { fetchVehicles(); }, 400);
        return () => clearTimeout(delay);
    }, [fetchVehicles]);

    // Derived stats
    const totalCount = pagination?.total ?? 0;
    const fragileSupportCount = vehicles.filter((v) => v.supportsFragile).length;
    const availableCount = listResponse?.summary?.byStatus?.available ?? 0;

    // ── CRUD ──────────────────────────────────────────────────────────────

    const handleCreate = async (data: ICreateVehicleRequest) => {
        if (!companyId) return;
        setCreateLoading(true);
        try {
            await createVehicle(companyId, data);
            setCreateOpen(false);
            showToast.success("Vehicle added to fleet");
            fetchVehicles();
        } catch (e: any) {
            const serverErrors = e?.response?.data?.errors;
            const firstServerError = serverErrors
                ? Object.values(serverErrors).flat().find(Boolean)
                : null;
            const msg =
                firstServerError ??
                e?.response?.data?.message ??
                e?.response?.data?.title ??
                e?.message ??
                "Failed to create vehicle";
            showToast.error(msg as string);
        } finally {
            setCreateLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <RoleGuard allowedRoles={[ROLES.MANAGER, ROLES.SUPERVISOR]}>
            <div className="flex flex-col gap-3 h-full">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 pt-1">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div
                                className="w-1 h-6 rounded-full"
                                style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }}
                            />
                            <h1 className="text-[22px] font-bold text-white tracking-tight">Fleet</h1>
                        </div>
                        <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                            Manage vehicles registered in your logistics network.
                        </p>
                    </div>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95"
                        style={{
                            background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                            boxShadow: "0 4px 16px rgba(251,191,36,0.2)",
                        }}
                    >
                        <Plus size={13} />
                        New Vehicle
                    </button>
                </div>

                {/* Stats — now uses summary from backend */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard label="Total" value={totalCount} accent="#94a3b8" />
                    <StatCard label="Available" value={availableCount} accent="#34d399" />
                    <StatCard label="Fragile Ready" value={fragileSupportCount} accent="#38bdf8" />
                </div>

                {error && <ErrorBaner error={error} setError={setError} />}

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
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
                            placeholder="Search by registration, brand, or model…"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="bg-transparent text-[12.5px] text-white placeholder:text-slate-700 focus:outline-none flex-1 min-w-0"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="text-slate-700 hover:text-slate-500">
                                <X size={13} />
                            </button>
                        )}
                    </div>
                    <span className="text-[11px] text-slate-700 ml-auto hidden sm:block tabular-nums">
                        {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <VehicleList
                    vehicles={vehicles}
                    loading={loading}
                    onAddClick={() => setCreateOpen(true)}
                    onViewDetail={(id) => { setSelectedVehicleId(id); setDetailOpen(true); }}
                />

                {/* Pagination — new shape uses total/totalPages/hasNextPage/hasPrevPage */}
                {pagination && pagination.totalPages > 1 && (
                    <Pagination
                        pageNumber={pagination.page}
                        totalPages={pagination.totalPages}
                        hasNext={pagination.hasNextPage}
                        hasPrev={pagination.hasPrevPage}
                        onChange={(p) => setPage(p)}
                    />
                )}

                {/* Modals */}
                <CreateVehicleModal
                    isOpen={createOpen}
                    onClose={() => setCreateOpen(false)}
                    onSubmit={handleCreate}
                    loading={createLoading}
                />

                {selectedVehicleId && companyId && (
                    <VehicleDetailModal
                        isOpen={detailOpen}
                        vehicleId={selectedVehicleId}
                        companyId={companyId}
                        onClose={() => { setDetailOpen(false); setSelectedVehicleId(null); }}
                    />
                )}
            </div>
        </RoleGuard>
    );
}