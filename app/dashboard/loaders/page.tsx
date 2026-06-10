"use client";

import { useCallback, useEffect, useState } from "react";
import {
    getBranchLoaders,
    createLoader,
    updateLoader,
    deleteLoader,
    toggleBlockLoader,
} from "@/services/LoaderService";
import { ILoader, ICreateLoaderBody, IUpdateLoaderBody } from "@/types/loader";
import { showToast } from "nextjs-toast-notify";
import EmptyState from "@/components/commons/EmptyState";
import { Truck, Plus, Search, X, Pencil, Trash2 } from "lucide-react";
import StatCard from "@/components/commons/StatCard";
import { SkeletonList } from "@/components/commons/Skeleton";
import ErrorBaner from "@/components/commons/ErrorBaner";
import ActionBtn from "@/components/commons/ActionButton";
import CreateLoaderModal from "@/components/dashboard/loaders/CreateLoaderModal";
import EditLoaderModal from "@/components/dashboard/loaders/EditLoaderModal";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import userStore from "@/stores/userStore";

export default function LoadersPage() {
    const { user, associated } = userStore();
    // For supervisor context, branchId is stored in the associated profile
    const branchId = (associated as any)?.branchId || (user as any)?.branchId; 

    const [loaders, setLoaders] = useState<ILoader[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [editTarget, setEditTarget] = useState<ILoader | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ILoader | null>(null);
    const [toggleTarget, setToggleTarget] = useState<ILoader | null>(null);

    // ── Fetching ─────────────────────────────────────────────────────────

    const fetchLoaders = useCallback(async () => {
        if (!branchId || branchId === "TODO_BRANCH_ID") {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, any> = {};
            if (search) params.search = search;
            const res = await getBranchLoaders(branchId, params);
            setLoaders(res.data);
        } catch (e: any) {
            setError(e?.message ?? "Failed to load loaders");
        } finally {
            setLoading(false);
        }
    }, [search, branchId]);

    useEffect(() => {
        fetchLoaders();
    }, [fetchLoaders]);

    // ── CRUD ─────────────────────────────────────────────────────────────

    const handleCreate = async (payload: ICreateLoaderBody) => {
        if (!branchId || branchId === "TODO_BRANCH_ID") return;
        setSubmitting(true);
        try {
            await createLoader(branchId, payload);
            setModalOpen(false);
            showToast.success("Loader created successfully");
            fetchLoaders();
        } catch (e: any) {
            setError(e?.message ?? "Failed to create loader");
            showToast.error(e?.message ?? "Failed to create loader");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!toggleTarget || !branchId || branchId === "TODO_BRANCH_ID") return;
        setSubmitting(true);
        try {
            await toggleBlockLoader(branchId, toggleTarget._id);
            setToggleTarget(null);
            showToast.success(`Loader ${toggleTarget.status === "active" ? "blocked" : "unblocked"} successfully`);
            fetchLoaders();
        } catch (e: any) {
            setError(e?.message ?? "Failed to update loader status");
            showToast.error(e?.message ?? "Failed to update loader status");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (payload: IUpdateLoaderBody) => {
        if (!editTarget || !branchId || branchId === "TODO_BRANCH_ID") return;
        setSubmitting(true);
        try {
            await updateLoader(branchId, editTarget._id, payload);
            setEditTarget(null);
            showToast.success("Loader updated successfully");
            fetchLoaders();
        } catch (e: any) {
            setError(e?.message ?? "Failed to update loader");
            showToast.error(e?.message ?? "Failed to update loader");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget || !branchId || branchId === "TODO_BRANCH_ID") return;
        setSubmitting(true);
        try {
            await deleteLoader(branchId, deleteTarget._id);
            setDeleteTarget(null);
            showToast.success("Loader deleted successfully");
            fetchLoaders();
        } catch (e: any) {
            setError(e?.message ?? "Failed to delete loader");
            showToast.error(e?.message ?? "Failed to delete loader");
        } finally {
            setSubmitting(false);
        }
    };

    const activeCount = loaders.filter((l) => l.status === "active").length;

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
                            Loaders
                        </h1>
                    </div>
                    <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                        Manage loaders assigned to this branch.
                    </p>
                </div>
                <ActionBtn onClick={() => setModalOpen(true)} variant="primary" size="action" label="New Loader" title="Add a new loader">
                    <Plus className="w-4 h-4" />
                </ActionBtn>
            </div>

            {/* ── Stat cards ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Total Loaders" value={loaders.length} accent="#94a3b8" />
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
                    {loaders.length} loader{loaders.length !== 1 ? "s" : ""}
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
                    className="hidden md:grid grid-cols-[1fr_120px_120px_120px_auto] gap-4 px-5 py-2.5 border-b border-white/4"
                    style={{ background: "rgba(255,255,255,0.015)" }}
                >
                    {["Loader", "Employee Code", "Status", "Created", "Actions"].map((h, i) => (
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
                ) : loaders.length === 0 ? (
                    <EmptyState
                        title="No loaders yet"
                        description="Add a loader to get started."
                        icon={Truck}
                        actionLabel="+ New Loader"
                        tone="warning"
                        onAction={() => setModalOpen(true)}
                    />
                ) : (
                    <div>
                        {loaders.map((loader, idx) => (
                            <div key={loader._id} className={`grid grid-cols-[1fr_120px_120px_120px_auto] items-center gap-4 px-5 py-3 ${idx !== loaders.length - 1 ? 'border-b border-white/5' : ''}`}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-white/10 text-[12px] font-medium text-slate-300">
                                        {loader.userId?.firstName?.charAt(0) || 'L'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[13px] font-medium text-white truncate">
                                            {loader.userId?.firstName} {loader.userId?.lastName}
                                        </div>
                                        <div className="text-[11px] text-slate-500 truncate">
                                            {loader.userId?.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[12.5px] text-slate-400 font-mono">
                                    {loader.employeeCode}
                                </div>
                                <div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${loader.status === "active" ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {loader.status}
                                    </span>
                                </div>
                                <div className="text-[12.5px] text-slate-400">
                                    {new Date(loader.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setEditTarget(loader)}
                                        className="text-[11px] p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                                        title="Edit Loader"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        onClick={() => setToggleTarget(loader)}
                                        className="text-[11px] px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                                    >
                                        {loader.status === "active" ? "Block" : "Unblock"}
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(loader)}
                                        className="text-[11px] p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                                        title="Delete Loader"
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
                <CreateLoaderModal
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleCreate}
                    loading={submitting}
                />
            )}

            {editTarget && (
                <EditLoaderModal
                    loader={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSubmit={handleUpdate}
                    loading={submitting}
                />
            )}

            {toggleTarget && (
                <ConfirmDialog
                    title={`${toggleTarget.status === "active" ? "Block" : "Unblock"} Loader`}
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
                    title="Delete Loader"
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
