"use client";

import { useCallback, useEffect, useState } from "react";
import {
    getBranchCashiers,
    createCashier,
    updateCashier,
    deleteCashier,
    toggleBlockCashier,
} from "@/services/CashierService";
import { ICashier, ICreateCashierBody, IUpdateCashierBody } from "@/types/cashier";
import { showToast } from "nextjs-toast-notify";
import EmptyState from "@/components/commons/EmptyState";
import { Users, Plus, Search, X, Pencil, Trash2 } from "lucide-react";
import StatCard from "@/components/commons/StatCard";
import { SkeletonList } from "@/components/commons/Skeleton";
import ErrorBaner from "@/components/commons/ErrorBaner";
import ActionBtn from "@/components/commons/ActionButton";
import CreateCashierModal from "@/components/dashboard/cashiers/CreateCashierModal";
import EditCashierModal from "@/components/dashboard/cashiers/EditCashierModal";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import userStore from "@/stores/userStore";

export default function CashiersPage() {
    const { user, associated } = userStore();
    // For supervisor and loader/cashier context, branchId is stored in the associated profile
    const branchId = (associated as any)?.branchId || (user as any)?.branchId; 

    const [cashiers, setCashiers] = useState<ICashier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [editTarget, setEditTarget] = useState<ICashier | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ICashier | null>(null);
    const [toggleTarget, setToggleTarget] = useState<ICashier | null>(null);

    // ── Fetching ─────────────────────────────────────────────────────────

    const fetchCashiers = useCallback(async () => {
        if (!branchId || branchId === "TODO_BRANCH_ID") {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, any> = {};
            if (search) params.search = search;
            const res = await getBranchCashiers(branchId, params);
            setCashiers(res.data);
        } catch (e: any) {
            setError(e?.message ?? "Failed to load cashiers");
        } finally {
            setLoading(false);
        }
    }, [search, branchId]);

    useEffect(() => {
        fetchCashiers();
    }, [fetchCashiers]);

    // ── CRUD ─────────────────────────────────────────────────────────────

    const handleCreate = async (payload: ICreateCashierBody) => {
        console.log("branchId", branchId);
        if (!branchId || branchId === "TODO_BRANCH_ID") return;
        setSubmitting(true);
        try {
            const res = await createCashier(branchId, payload);
            console.log("res", res);
            setModalOpen(false);
            showToast.success("Cashier created successfully");
            fetchCashiers();
        } catch (e: any) {
            setError(e?.message ?? "Failed to create cashier");
            showToast.error(e?.message ?? "Failed to create cashier");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!toggleTarget || !branchId || branchId === "TODO_BRANCH_ID") return;
        setSubmitting(true);
        try {
            await toggleBlockCashier(branchId, toggleTarget._id);
            setToggleTarget(null);
            showToast.success(`Cashier ${toggleTarget.status === "active" ? "blocked" : "unblocked"} successfully`);
            fetchCashiers();
        } catch (e: any) {
            setError(e?.message ?? "Failed to update cashier status");
            showToast.error(e?.message ?? "Failed to update cashier status");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (payload: IUpdateCashierBody) => {
        if (!editTarget || !branchId || branchId === "TODO_BRANCH_ID") return;
        setSubmitting(true);
        try {
            await updateCashier(branchId, editTarget._id, payload);
            setEditTarget(null);
            showToast.success("Cashier updated successfully");
            fetchCashiers();
        } catch (e: any) {
            setError(e?.message ?? "Failed to update cashier");
            showToast.error(e?.message ?? "Failed to update cashier");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget || !branchId || branchId === "TODO_BRANCH_ID") return;
        setSubmitting(true);
        try {
            await deleteCashier(branchId, deleteTarget._id);
            setDeleteTarget(null);
            showToast.success("Cashier deleted successfully");
            fetchCashiers();
        } catch (e: any) {
            setError(e?.message ?? "Failed to delete cashier");
            showToast.error(e?.message ?? "Failed to delete cashier");
        } finally {
            setSubmitting(false);
        }
    };

    const activeCount = cashiers.filter((c) => c.status === "active").length;

    // ── Render ───────────────────────────────────────────────────────────

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">

            {/* ── Header ────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 pt-1">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div
                            className="w-1 h-6 rounded-full"
                            style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }}
                        />
                        <h1 className="text-[22px] font-bold text-white tracking-tight">
                            Cashiers
                        </h1>
                    </div>
                    <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                        Manage cashiers assigned to this branch.
                    </p>
                </div>
                <ActionBtn onClick={() => setModalOpen(true)} variant="primary" size="action" label="New Cashier" title="Add a new cashier">
                    <Plus className="w-4 h-4" />
                </ActionBtn>
            </div>

            {/* ── Stat cards ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Total Cashiers" value={cashiers.length} accent="#94a3b8" />
                <StatCard label="Active" value={activeCount} accent="#10b981" />
            </div>

            {/* ── Error banner ──────────────────────────────────────────── */}
            {error && (
                <ErrorBaner error={error} setError={setError} />
            )}

            {/* ── Filters row ────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3">
                <div
                    className="flex items-center gap-2 flex-1 min-w-45 px-3 py-2 rounded-lg transition-colors"
                    style={{
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.07)",
                    }}
                >
                    <Search size={13} className="text-slate-700 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search name, email or code…"
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
                    {cashiers.length} cashier{cashiers.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* ── Table ─────────────────────────────────────────────────── */}
            <div
                className="rounded-xl flex-col flex-1 p-4 overflow-y-auto"
                style={{
                    background: "#060a10",
                    border: "1px solid rgba(255,255,255,0.05)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
                }}
            >
                <div
                    className="hidden md:grid grid-cols-[1fr_120px_100px_120px_120px_auto] gap-4 px-5 py-2.5 border-b border-white/4"
                    style={{ background: "rgba(255,255,255,0.015)" }}
                >
                    {["Cashier", "Employee Code", "Counter", "Status", "Created", "Actions"].map((h, i) => (
                        <div
                            key={i}
                            className="text-[9.5px] uppercase tracking-[0.14em] text-slate-700 font-semibold"
                        >
                            {h}
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="py-2">
                        <SkeletonList rows={5} />
                    </div>
                ) : cashiers.length === 0 ? (
                    <EmptyState
                        title="No cashiers yet"
                        description="Add a cashier to get started."
                        icon={Users}
                        actionLabel="+ New Cashier"
                        tone="warning"
                        onAction={() => setModalOpen(true)}
                    />
                ) : (
                    <div>
                        {cashiers.map((cashier, idx) => (
                            <div key={cashier._id} className={`grid grid-cols-[1fr_120px_100px_120px_120px_auto] items-center gap-4 px-5 py-3 ${idx !== cashiers.length - 1 ? 'border-b border-white/5' : ''}`}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-white/10 text-[12px] font-medium text-slate-300">
                                        {cashier.userId?.firstName?.charAt(0) || 'C'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[13px] font-medium text-white truncate">
                                            {cashier.userId?.firstName} {cashier.userId?.lastName}
                                        </div>
                                        <div className="text-[11px] text-slate-500 truncate">
                                            {cashier.userId?.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[12.5px] text-slate-400 font-mono">
                                    {cashier.employeeCode}
                                </div>
                                <div className="text-[12.5px] text-slate-400">
                                    {cashier.counterNumber || "-"}
                                </div>
                                <div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${cashier.status === "active" ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {cashier.status}
                                    </span>
                                </div>
                                <div className="text-[12.5px] text-slate-400">
                                    {new Date(cashier.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setEditTarget(cashier)}
                                        className="text-[11px] p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                                        title="Edit Cashier"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        onClick={() => setToggleTarget(cashier)}
                                        className="text-[11px] px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                                    >
                                        {cashier.status === "active" ? "Block" : "Unblock"}
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(cashier)}
                                        className="text-[11px] p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                                        title="Delete Cashier"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Modals ────────────────────────────────────────────────── */}
            {modalOpen && (
                <CreateCashierModal
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleCreate}
                    loading={submitting}
                />
            )}

            {editTarget && (
                <EditCashierModal
                    cashier={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSubmit={handleUpdate}
                    loading={submitting}
                />
            )}

            {toggleTarget && (
                <ConfirmDialog
                    title={`${toggleTarget.status === "active" ? "Block" : "Unblock"} Cashier`}
                    message={`Are you sure you want to ${toggleTarget.status === "active" ? "block" : "unblock"} ${toggleTarget.userId?.firstName}?`}
                    confirmLabel={toggleTarget.status === "active" ? "Block" : "Unblock"}
                    danger={toggleTarget.status === "active"}
                    loading={submitting}
                    onConfirm={handleToggleStatus}
                    onCancel={() => setToggleTarget(null)}
                />
            )}

            {deleteTarget && (
                <ConfirmDialog
                    title="Delete Cashier"
                    message={`Are you sure you want to delete ${deleteTarget.userId?.firstName}? This action cannot be undone.`}
                    confirmLabel="Delete"
                    danger={true}
                    loading={submitting}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}
