"use client";

import { useCallback, useEffect, useState } from "react";
import {
    listBranches,
    getDeletedBranches,
    createBranch,
    updateBranch,
    deleteBranch,
    restoreBranch,
} from "@/services/BranchService";
import {
    IBranchResponse,
    ICreateBranchPayload,
    IUpdateBranchPayload,
    NodeType,
} from "@/types/branch";
import BranchModal from "@/components/dashboard/branches/BranchModal";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import { showToast } from "nextjs-toast-notify";
import BranchRow from "@/components/dashboard/branches/BranchRow";
import EmptyState from "@/components/commons/EmptyState";
import { CircleAlert, FileExclamationPoint, Package, Plus, Search, X } from "lucide-react";
import StatCard from "@/components/commons/StatCard";
import { SkeletonList } from "@/components/commons/Skeleton";
import { IPaginatedResponse } from "@/types/paginate";
import Pagination from "@/components/commons/Pagination";
import ErrorBaner from "@/components/commons/ErrorBaner";
import ActionBtn from "@/components/commons/ActionButton";

type Tab = "active" | "deleted";

export default function BranchesPage() {

    const PAGE_SIZE = 7;
    const [pagination, setPagination] = useState<IPaginatedResponse<IBranchResponse> | null>(null);
    const branches = pagination?.items ?? [];

    const [tab, setTab] = useState<Tab>("active");
    const [deleted, setDeleted] = useState<IBranchResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState<NodeType | "">("");

    const [page, setPage] = useState(1);

    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<IBranchResponse | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<IBranchResponse | null>(null);
    const [restoreTarget, setRestoreTarget] = useState<IBranchResponse | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // ── Fetching ─────────────────────────────────────────────────────────

    const fetchActive = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, any> = { pageNumber: page, pageSize: PAGE_SIZE };
            if (search) params.search = search;
            if (filterType) params.type = filterType;
            const res = await listBranches(params);
            setPagination(res);
        } catch (e: any) {
            setError(e?.message ?? "Failed to load branches");
        } finally {
            setLoading(false);
        }
    }, [page, search, filterType]);

    const fetchDeleted = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getDeletedBranches();
            setDeleted(res);
        } catch (e: any) {
            setError(e?.message ?? "Failed to load deleted branches");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (tab === "active") fetchActive();
        else fetchDeleted();
    }, [tab, fetchActive, fetchDeleted]);

    // ── CRUD ─────────────────────────────────────────────────────────────

    const handleCreate = async (payload: ICreateBranchPayload | IUpdateBranchPayload) => {
        setSubmitting(true);
        try {
            await createBranch(payload as ICreateBranchPayload);
            setModalOpen(false);
            showToast.success("Branch created successfully");
            fetchActive();
        } catch (e: any) {
            setError(e?.message ?? "Failed to create branch");
            showToast.error(e?.message ?? "Failed to create branch");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (payload: ICreateBranchPayload | IUpdateBranchPayload) => {
        if (!editTarget) return;
        setSubmitting(true);
        try {
            await updateBranch(editTarget.id, payload as IUpdateBranchPayload);
            setEditTarget(null);
            showToast.success("Branch updated successfully");
            fetchActive();
        } catch (e: any) {
            setError(e?.message ?? "Failed to update branch");
            showToast.error(e?.message ?? "Failed to update branch");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setSubmitting(true);
        try {
            await deleteBranch(deleteTarget.id);
            setDeleteTarget(null);
            showToast.success("Branch deleted successfully");
            fetchActive();
        } catch (e: any) {
            setError(e?.message ?? "Failed to delete branch");
            showToast.error(e?.message ?? "Failed to delete branch");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRestore = async () => {
        if (!restoreTarget) return;
        setSubmitting(true);
        try {
            await restoreBranch(restoreTarget.id);
            setRestoreTarget(null);
            showToast.success("Branch restored successfully");
            fetchDeleted();
        } catch (e: any) {
            setError(e?.message ?? "Failed to restore branch");
            showToast.error(e?.message ?? "Failed to restore branch");
        } finally {
            setSubmitting(false);
        }
    };

    const displayedBranches = tab === "active" ? branches : deleted;

    const hubCount = branches.filter((b) => b.type === NodeType.Hub).length;
    const branchCount = branches.filter((b) => b.type === NodeType.Branch).length;
    const warehouseCount = branches.filter((b) => b.type === NodeType.MainHub).length;

    // ── Render ───────────────────────────────────────────────────────────


    return (
        <div className=" flex h-full min-h-0 flex-col gap-3">

            {/* ── Header ────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 pt-1">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        {/* Accent line */}
                        <div
                            className="w-1 h-6 rounded-full"
                            style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }}
                        />
                        <h1 className="text-[22px] font-bold text-white tracking-tight">
                            Logistics Nodes
                        </h1>
                    </div>
                    <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                        Manage hubs, branches, and Main Hubs across your network.
                    </p>
                </div>
                {tab === "active" && (
                    <ActionBtn onClick={() => setModalOpen(true)} variant="primary" size="action" label="New Node" title="Create new logistics node">
                        <Plus className="w-4 h-4" />
                    </ActionBtn>
                )}
            </div>

            {/* ── Stat cards ────────────────────────────────────────────── */}
            {tab === "active" && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard label="Total" value={pagination?.totalCount || 0} accent="#94a3b8" />
                    <StatCard label="Hubs" value={hubCount} accent="#fbbf24" />
                    <StatCard label="Branches" value={branchCount} accent="#22d3ee" />
                    <StatCard label="Main Hubs" value={warehouseCount} accent="#a78bfa" />
                </div>
            )}

            {/* ── Error banner ──────────────────────────────────────────── */}
            {error && (
                <ErrorBaner error={error} setError={setError} />
            )}

            {/* ── Tabs + Filters row ────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Tabs */}
                <div
                    className="flex items-center gap-0.5 p-0.5 rounded-lg"
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    {(["active", "deleted"] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => { setTab(t); setPage(1); }}
                            className={`px-3.5 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150 ${tab === t ? "text-white" : "text-slate-600 hover:text-slate-400"
                                }`}
                            style={
                                tab === t
                                    ? {
                                        background:
                                            t === "deleted"
                                                ? "rgba(239,68,68,0.1)"
                                                : "rgba(251,191,36,0.1)",
                                        border: `1px solid ${t === "deleted"
                                            ? "rgba(239,68,68,0.18)"
                                            : "rgba(251,191,36,0.18)"
                                            }`,
                                        color: t === "deleted" ? "#f87171" : "#fbbf24",
                                    }
                                    : {}
                            }
                        >
                            {t === "active" ? "Active" : "Deleted"}
                            {t === "deleted" && deleted.length > 0 && (
                                <span className="ml-1.5 px-1 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400">
                                    {deleted.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Filters — active tab only */}
                {tab === "active" && (
                    <>
                        {/* Search */}
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
                                placeholder="Search name or code…"
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

                        {/* Type filter */}
                        <select
                            value={filterType}
                            onChange={(e) => { setFilterType(e.target.value as NodeType | ""); setPage(1); }}
                            className="px-3 py-2 rounded-lg text-[12.5px] text-slate-400 focus:outline-none transition-colors"
                            style={{
                                appearance: "none",
                                background: "rgba(255,255,255,0.025)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                minWidth: "110px",
                            }}
                        >
                            <option value="" style={{ background: "#0d1117" }}>All types</option>
                            <option value="Hub" style={{ background: "#0d1117" }}>Hub</option>
                            <option value="Branch" style={{ background: "#0d1117" }}>Branch</option>
                            <option value="MainHub" style={{ background: "#0d1117" }}>Main Hub</option>
                        </select>

                        <span className="text-[11px] text-slate-700 ml-auto hidden sm:block tabular-nums">
                            {pagination?.totalCount || 0} node{pagination?.totalCount !== 1 ? "s" : ""}
                        </span>
                    </>
                )}
            </div>

            {/* ── Table ─────────────────────────────────────────────────── */}
            <div
                className="rounded-xl flex-col flex-1 p-10 overflow-y-auto"
                style={{
                    background: "#060a10",
                    border: "1px solid rgba(255,255,255,0.05)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
                }}
            >
                {/* Column headers */}
                <div
                    className="hidden md:grid grid-cols-[1fr_120px_270px_160px_auto] gap-4 px-5 py-2.5 border-b border-white/4"
                    style={{ background: "rgba(255,255,255,0.015)" }}
                >
                    {["Node", "Type", "Location", "Created", "Actions"].map((h, i) => (
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
                ) : displayedBranches.length === 0 ? (
                    tab === "deleted" ? (
                        <EmptyState
                            title="No deleted branches"
                            description="Deleted branches will appear here for restoration."
                            icon={Package}
                            tone="default"
                        />
                    ) : (
                        <EmptyState
                            title="No branches yet"
                            description="Create your first logistics node to get started."
                            icon={Package}
                            actionLabel="+ New Branch"
                            tone="warning"
                            onAction={() => setModalOpen(true)}
                        />
                    )
                ) : (
                    <div className="">
                        {displayedBranches.map((branch, idx) => (
                            <BranchRow
                                key={branch.id}
                                branch={branch}
                                isLast={idx === displayedBranches.length - 1}
                                isDeleted={tab === "deleted"}
                                onEdit={() => setEditTarget(branch)}
                                onDelete={() => setDeleteTarget(branch)}
                                onRestore={() => setRestoreTarget(branch)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Pagination ────────────────────────────────────────────── */}
            {tab === "active" && pagination && pagination.totalPages > 1 && (
                <Pagination
                    pageNumber={pagination.pageNumber}
                    totalPages={pagination.totalPages}
                    hasNext={pagination.hasNextPage}
                    hasPrev={pagination.hasPreviousPage}
                    onChange={(p) => setPage(p)}
                />
            )}

            {/* ── Modals ────────────────────────────────────────────────── */}
            {modalOpen && (
                <BranchModal
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleCreate}
                    loading={submitting}
                />
            )}

            {editTarget && (
                <BranchModal
                    branch={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSubmit={handleUpdate}
                    loading={submitting}
                />
            )}

            {deleteTarget && (
                <ConfirmDialog
                    title="Delete Node"
                    message={`Are you sure you want to delete "${deleteTarget.name}"? It can be restored later from the Deleted tab.`}
                    confirmLabel="Delete"
                    danger
                    loading={submitting}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {restoreTarget && (
                <ConfirmDialog
                    title="Restore Node"
                    message={`Restore "${restoreTarget.name}" and make it active again?`}
                    confirmLabel="Restore"
                    loading={submitting}
                    onConfirm={handleRestore}
                    onCancel={() => setRestoreTarget(null)}
                />
            )}
        </div>
    );
}