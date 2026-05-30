"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getDeliveryFees, createDeliveryFee, updateDeliveryFee } from "@/services/DeliveryFeeService";
import { IDeliveryFeeSummary, ICreateDeliveryFeePayload, IUpdateDeliveryFeePayload, DeliveryType } from "@/types/deliveryFee";
import { IPaginatedResponse } from "@/types/paginate";
import { showToast } from "nextjs-toast-notify";
import Pagination from "@/components/commons/Pagination";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import { Plus, Search, X } from "lucide-react";
import StatCard from "@/components/commons/StatCard";
import DeliveryFeeDetailModal from "@/components/dashboard/delivery-fees/DeliveryFeeDetailsModal";
import CreateDeliveryFeeModal from "@/components/dashboard/delivery-fees/CreateDeliveryFeeModal";
import EditDeliveryFeeModal from "@/components/dashboard/delivery-fees/EditDeliverFeeModal";
import DeliveryFeeList from "@/components/dashboard/delivery-fees/DeliveryFeeList";
import ActionBtn from "@/components/commons/ActionButton";

const PAGE_SIZE = 10;

export default function DeliveryFeesPage() {
    const [pagination, setPagination] = useState<IPaginatedResponse<IDeliveryFeeSummary> | null>(null);
    const fees = pagination?.items ?? [];

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<"" | DeliveryType>("");
    const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
    const [page, setPage] = useState(1);

    // Create
    const [createOpen, setCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    // Edit
    const [editOpen, setEditOpen] = useState(false);
    const [editFee, setEditFee] = useState<IDeliveryFeeSummary | null>(null);
    const [editLoading, setEditLoading] = useState(false);

    // Toggle status (activate/deactivate)
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState<IDeliveryFeeSummary | null>(null);
    const [toggleLoading, setToggleLoading] = useState(false);

    // Detail modal
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedFeeId, setSelectedFeeId] = useState<string | null>(null);

    // ── Fetch ──────────────────────────────────────────────────────────────

    const fetchFees = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getDeliveryFees({
                pageNumber: page,
                pageSize: PAGE_SIZE,
                deliveryType: typeFilter !== "" ? typeFilter : undefined,
            });
            setPagination(res);
        } catch (e: any) {
            const msg = e?.message ?? "Failed to load delivery fees";
            setError(msg);
            showToast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [page, typeFilter]);

    useEffect(() => { fetchFees(); }, [fetchFees]);

    // ── Client-side filtering ──────────────────────────────────────────────

    const filteredFees = useMemo(() => {
        const q = search.trim().toLowerCase();
        return fees.filter((f) => {
            const matchSearch =
                !q ||
                f.originWilayaName.toLowerCase().includes(q) ||
                f.destinationWilayaName.toLowerCase().includes(q);
            const isActive = f.isActive !== false;
            const matchStatus =
                statusFilter === "" ? true : statusFilter === "active" ? isActive : !isActive;
            return matchSearch && matchStatus;
        });
    }, [search, statusFilter, fees]);

    const activeCount = fees.filter((f) => f.isActive !== false).length;
    const totalCount = pagination?.totalCount ?? 0;
    const homeCount = fees.filter((f) => f.deliveryType === DeliveryType.Home).length;

    // ── CRUD ───────────────────────────────────────────────────────────────

    const handleCreate = async (data: ICreateDeliveryFeePayload) => {
        setCreateLoading(true);
        try {
            await createDeliveryFee(data);
            setCreateOpen(false);
            showToast.success("Delivery fee created successfully");
            fetchFees();
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
                "Failed to create delivery fee";
            showToast.error(msg as string);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleEdit = async (id: string, data: IUpdateDeliveryFeePayload) => {
        setEditLoading(true);
        try {
            await updateDeliveryFee(id, data);
            setEditOpen(false);
            setEditFee(null);
            showToast.success("Delivery fee updated successfully");
            fetchFees();
        } catch (e: any) {
            const msg = e?.message ?? "Failed to update delivery fee";
            showToast.error(msg);
        } finally {
            setEditLoading(false);
        }
    };

    const handleConfirmToggle = async () => {
        if (!selectedFee) return;
        setToggleLoading(true);
        try {
            await updateDeliveryFee(selectedFee.id, { isActive: !selectedFee.isActive });
            showToast.success(`Fee ${selectedFee.isActive ? "deactivated" : "activated"}`);
            setConfirmOpen(false);
            setSelectedFee(null);
            fetchFees();
        } catch (e: any) {
            showToast.error(e?.message ?? "Failed to update fee status");
        } finally {
            setToggleLoading(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-3 h-full">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 pt-1">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div
                            className="w-1 h-6 rounded-full"
                            style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }}
                        />
                        <h1 className="text-[22px] font-bold text-white tracking-tight">Delivery Fees</h1>
                    </div>
                    <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                        Manage origin-destination pricing rules for your logistics network.
                    </p>
                </div>
                <ActionBtn onClick={() => setCreateOpen(true)} variant="primary" size="action" label="New Fee" title="Create new fee">
                    <Plus className="w-4 h-4" />
                </ActionBtn>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
                <StatCard label="Total" value={totalCount} accent="#fbbf24" />
                <StatCard label="Active" value={activeCount} accent="#22d3ee" />
                <StatCard label="Home" value={homeCount} accent="#34d399" />
                <StatCard label="Showing" value={filteredFees.length} accent="#38bdf8" />
            </div>

            {/* Error */}
            {error && (
                <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 text-[13px]"
                    style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {error}
                </div>
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
                        placeholder="Search by wilaya name…"
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

                {/* Delivery type filter */}
                <div
                    className="flex items-center gap-0.5 p-0.5 rounded-lg shrink-0"
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    {[
                        { value: "" as const, label: "All" },
                        { value: DeliveryType.Home as const, label: "Home", color: "#fbbf24" },
                        { value: DeliveryType.StopDesk as const, label: "Stop Desk", color: "#38bdf8" },
                    ].map((opt, idx) => {
                        const active = typeFilter === opt.value;
                        return (
                            <button
                                key={idx}
                                onClick={() => { setTypeFilter(opt.value); setPage(1); }}
                                className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150"
                                style={
                                    active
                                        ? {
                                            background: (opt as any).color
                                                ? `${(opt as any).color}20`
                                                : "rgba(255,255,255,0.06)",
                                            border: `1px solid ${(opt as any).color ?? "#e2e8f0"}40`,
                                            color: (opt as any).color ?? "#e2e8f0",
                                        }
                                        : { color: "#475569" }
                                }
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>

                {/* Status filter */}
                <div
                    className="flex items-center gap-0.5 p-0.5 rounded-lg shrink-0"
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    {[
                        { value: "" as const, label: "All" },
                        { value: "active" as const, label: "Active", color: "#34d399" },
                        { value: "inactive" as const, label: "Inactive", color: "#f87171" },
                    ].map((opt, idx) => {
                        const active = statusFilter === opt.value;
                        return (
                            <button
                                key={idx}
                                onClick={() => { setStatusFilter(opt.value); setPage(1); }}
                                className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150"
                                style={
                                    active
                                        ? {
                                            background: (opt as any).color
                                                ? `${(opt as any).color}20`
                                                : "rgba(255,255,255,0.06)",
                                            border: `1px solid ${(opt as any).color ?? "#e2e8f0"}40`,
                                            color: (opt as any).color ?? "#e2e8f0",
                                        }
                                        : { color: "#475569" }
                                }
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>

                <span className="text-[11px] text-slate-700 ml-auto hidden sm:block tabular-nums">
                    {filteredFees.length} fee{filteredFees.length !== 1 ? "s" : ""}
                </span>
            </div>

            <DeliveryFeeList
                fees={filteredFees}
                loading={loading}
                onAddClick={() => setCreateOpen(true)}
                onViewDetail={(id) => { setSelectedFeeId(id); setDetailOpen(true); }}
                onEdit={(fee) => { setEditFee(fee); setEditOpen(true); }}
                onToggleStatus={(fee) => { setSelectedFee(fee); setConfirmOpen(true); }}
            />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <Pagination
                    pageNumber={pagination.pageNumber}
                    totalPages={pagination.totalPages}
                    hasNext={pagination.hasNextPage}
                    hasPrev={pagination.hasPreviousPage}
                    onChange={(p) => setPage(p)}
                />
            )}

            {/* Modals */}
            <CreateDeliveryFeeModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={handleCreate}
                loading={createLoading}
            />

            <EditDeliveryFeeModal
                isOpen={editOpen}
                fee={editFee}
                onClose={() => { setEditOpen(false); setEditFee(null); }}
                onSubmit={handleEdit}
                loading={editLoading}
            />

            {confirmOpen && selectedFee && (
                <ConfirmDialog
                    title={`${selectedFee.isActive ? "Deactivate" : "Activate"} Fee`}
                    message={`${selectedFee.isActive ? "Deactivate" : "Activate"} the fee for "${selectedFee.originWilayaName} → ${selectedFee.destinationWilayaName}"? It will ${selectedFee.isActive ? "no longer" : "start"} applying to new deliveries.`}
                    confirmLabel="Confirm"
                    danger={selectedFee.isActive}
                    loading={toggleLoading}
                    onConfirm={handleConfirmToggle}
                    onCancel={() => { setConfirmOpen(false); setSelectedFee(null); }}
                />
            )}

            {selectedFeeId && (
                <DeliveryFeeDetailModal
                    isOpen={detailOpen}
                    feeId={selectedFeeId}
                    onClose={() => { setDetailOpen(false); setSelectedFeeId(null); }}
                />
            )}
        </div>
    );
}