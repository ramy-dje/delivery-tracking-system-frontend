"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getDeliveryFees, upsertTariff, deleteTariff } from "@/services/DeliveryFeeService";
import { ITariffEntry, IUpsertTariffPayload } from "@/types/deliveryFee";
import { showToast } from "nextjs-toast-notify";
import Pagination from "@/components/commons/Pagination";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import { Plus, Search, X } from "lucide-react";
import StatCard from "@/components/commons/StatCard";
import CreateDeliveryFeeModal from "@/components/dashboard/delivery-fees/CreateDeliveryFeeModal";
import EditDeliveryFeeModal from "@/components/dashboard/delivery-fees/EditDeliverFeeModal";
import DeliveryFeeList from "@/components/dashboard/delivery-fees/DeliveryFeeList";
import ActionBtn from "@/components/commons/ActionButton";

const PAGE_SIZE = 10;

export default function DeliveryFeesPage() {
    const [fees, setFees] = useState<ITariffEntry[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    // Create
    const [createOpen, setCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    // Edit
    const [editOpen, setEditOpen] = useState(false);
    const [editFee, setEditFee] = useState<ITariffEntry | null>(null);
    const [editLoading, setEditLoading] = useState(false);

    // Delete
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState<ITariffEntry | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // ── Fetch ──────────────────────────────────────────────────────────────

    const fetchFees = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getDeliveryFees({
                page,
                limit: PAGE_SIZE,
                search: search || undefined
            });
            setFees(res.entries);
            setTotalCount(res.pagination.total);
            setTotalPages(res.pagination.pages);
        } catch (e: any) {
            const msg = e?.message ?? "Failed to load delivery fees";
            setError(msg);
            showToast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { 
        const timeout = setTimeout(() => {
            fetchFees();
        }, 300);
        return () => clearTimeout(timeout);
    }, [fetchFees]);

    // ── CRUD ───────────────────────────────────────────────────────────────

    const handleCreate = async (data: IUpsertTariffPayload) => {
        setCreateLoading(true);
        try {
            await upsertTariff(data);
            setCreateOpen(false);
            showToast.success("Tariff saved successfully");
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
                "Failed to save tariff";
            showToast.error(msg as string);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleEdit = async (data: IUpsertTariffPayload) => {
        setEditLoading(true);
        try {
            await upsertTariff(data);
            setEditOpen(false);
            setEditFee(null);
            showToast.success("Tariff updated successfully");
            fetchFees();
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? "Failed to update tariff";
            showToast.error(msg);
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedFee) return;
        setDeleteLoading(true);
        try {
            await deleteTariff(selectedFee.wilayaA, selectedFee.wilayaB);
            showToast.success("Tariff removed successfully");
            setConfirmOpen(false);
            setSelectedFee(null);
            fetchFees();
        } catch (e: any) {
            showToast.error(e?.response?.data?.message ?? e?.message ?? "Failed to remove tariff");
        } finally {
            setDeleteLoading(false);
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
                        <h1 className="text-[22px] font-bold text-white tracking-tight">Tariffs</h1>
                    </div>
                    <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                        Manage wilaya pairing prices for stopdesk and domicile deliveries.
                    </p>
                </div>
                <ActionBtn onClick={() => setCreateOpen(true)} variant="primary" size="action" label="New Tariff" title="Create new tariff">
                    <Plus className="w-4 h-4" />
                </ActionBtn>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard label="Total Pairs" value={totalCount} accent="#fbbf24" />
                <StatCard label="Showing" value={fees.length} accent="#38bdf8" />
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
                        onChange={(e) => {setSearch(e.target.value); setPage(1)}}
                        className="bg-transparent text-[12.5px] text-white placeholder:text-slate-700 focus:outline-none flex-1 min-w-0"
                    />
                    {search && (
                        <button onClick={() => {setSearch(""); setPage(1)}} className="text-slate-700 hover:text-slate-500">
                            <X size={13} />
                        </button>
                    )}
                </div>

                <span className="text-[11px] text-slate-700 ml-auto hidden sm:block tabular-nums">
                    {fees.length} fee{fees.length !== 1 ? "s" : ""}
                </span>
            </div>

            <DeliveryFeeList
                fees={fees}
                loading={loading}
                onAddClick={() => setCreateOpen(true)}
                onEdit={(fee) => { setEditFee(fee); setEditOpen(true); }}
                onDelete={(fee) => { setSelectedFee(fee); setConfirmOpen(true); }}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    pageNumber={page}
                    totalPages={totalPages}
                    hasNext={page < totalPages}
                    hasPrev={page > 1}
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

            {editFee && (
                <EditDeliveryFeeModal
                    isOpen={editOpen}
                    fee={editFee}
                    onClose={() => { setEditOpen(false); setEditFee(null); }}
                    onSubmit={handleEdit}
                    loading={editLoading}
                />
            )}

            {confirmOpen && selectedFee && (
                <ConfirmDialog
                    title={`Remove Tariff`}
                    message={`Are you sure you want to remove the tariff for "${selectedFee.wilayaAName} ↔ ${selectedFee.wilayaBName}"?`}
                    confirmLabel="Delete"
                    danger={true}
                    loading={deleteLoading}
                    onConfirm={handleDelete}
                    onCancel={() => { setConfirmOpen(false); setSelectedFee(null); }}
                />
            )}
        </div>
    );
}