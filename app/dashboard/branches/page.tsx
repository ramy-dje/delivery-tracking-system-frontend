"use client";

import { useCallback, useEffect, useState } from "react";
import {
    listBranches,
    toggleBlockBranch,
    createBranch,
    updateBranch,
    IBranchFilter,
} from "@/services/BranchService";
import {
    IBranchResponse,
    ICreateBranchPayload,
    IUpdateBranchPayload,
} from "@/types/branch";
import BranchModal from "@/components/dashboard/branches/BranchModal";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import { showToast } from "nextjs-toast-notify";
import BranchRow from "@/components/dashboard/branches/BranchRow";
import EmptyState from "@/components/commons/EmptyState";
import { Package, Plus, Search, X } from "lucide-react";
import StatCard from "@/components/commons/StatCard";
import { SkeletonList } from "@/components/commons/Skeleton";
import ErrorBaner from "@/components/commons/ErrorBaner";
import ActionBtn from "@/components/commons/ActionButton";
import { parseApiError } from "@/utils/apiErrorHandler";

// Status options that match the backend BranchStatus type
type StatusFilter = "" | "active" | "inactive" | "maintenance" | "pending";

export default function BranchesPage() {
    const [branches, setBranches] = useState<IBranchResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters — all sent to the backend directly
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
    const [cityFilter, setCityFilter] = useState("");

    // Modals
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<IBranchResponse | null>(null);
    const [toggleTarget, setToggleTarget] = useState<IBranchResponse | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // ── Fetch ─────────────────────────────────────────────────────────────────

    const fetchBranches = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params: IBranchFilter = {};
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            if (cityFilter) params.city = cityFilter;
            const res = await listBranches(params);
            setBranches(res);
        } catch (e: any) {
            const error = parseApiError(e);
            console.log("Failed to fetch branches:", error);
            setError(e?.message ?? "Failed to load branches");
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, cityFilter]);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    // ── CRUD ──────────────────────────────────────────────────────────────────

    const handleCreate = async (payload: ICreateBranchPayload | IUpdateBranchPayload) => {
        setSubmitting(true);
        try {
            await createBranch(payload as ICreateBranchPayload);
            setModalOpen(false);
            showToast.success("Branch created successfully");
            fetchBranches();
        } catch (e: any) {
            const error = parseApiError(e);
            console.log("Failed to create branch:", error);
            showToast.error(error.message ?? "Failed to create branch");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (payload: ICreateBranchPayload | IUpdateBranchPayload) => {
        if (!editTarget) return;
        setSubmitting(true);
        try {
            await updateBranch(editTarget._id ?? editTarget.id, payload as IUpdateBranchPayload);
            setEditTarget(null);
            showToast.success("Branch updated successfully");
            fetchBranches();
        } catch (e: any) {
            const error = parseApiError(e);
            console.log("Failed to update branch:", error);
            showToast.error(error.message ?? "Failed to update branch");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleBlock = async () => {
        if (!toggleTarget) return;
        setSubmitting(true);
        try {
            const { newStatus } = await toggleBlockBranch(toggleTarget._id ?? toggleTarget.id);
            setToggleTarget(null);
            showToast.success(
                `Branch ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
            );
            fetchBranches();
        } catch (e: any) {
            showToast.error(e?.message ?? "Failed to update branch status");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Derived counts (from loaded data only) ────────────────────────────────

    const hubCount = branches.filter((b) => b.branchType === "regional_main_hub").length;
    const branchCount = branches.filter((b) => b.branchType === "local_branch").length;
    const activeCount = branches.filter((b) => b.status === "active").length;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 pt-1">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div
                            className="w-1 h-6 rounded-full"
                            style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }}
                        />
                        <h1 className="text-[22px] font-bold text-white tracking-tight">
                            Logistics Nodes
                        </h1>
                    </div>
                    <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                        Manage hubs and branches across your network.
                    </p>
                </div>
                <ActionBtn
                    onClick={() => setModalOpen(true)}
                    variant="primary"
                    size="action"
                    label="New Node"
                    title="Create new logistics node"
                >
                    <Plus className="w-4 h-4" />
                </ActionBtn>
            </div>

            {/* ── Stat cards ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Total" value={branches.length} accent="#94a3b8" />
                <StatCard label="Active" value={activeCount} accent="#22c55e" />
                <StatCard label="Hubs" value={hubCount} accent="#fbbf24" />
                <StatCard label="Branches" value={branchCount} accent="#22d3ee" />
            </div>

            {/* ── Error banner ─────────────────────────────────────────────── */}
            {error && <ErrorBaner error={error} setError={setError} />}

            {/* ── Filters row ──────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3">
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
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent text-[12.5px] text-white placeholder:text-slate-700 focus:outline-none flex-1 min-w-0"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="text-slate-700 hover:text-slate-500"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>

                {/* City filter */}
                <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.07)",
                    }}
                >
                    <input
                        type="text"
                        placeholder="Filter by city…"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="bg-transparent text-[12.5px] text-white placeholder:text-slate-700 focus:outline-none w-28"
                    />
                    {cityFilter && (
                        <button
                            onClick={() => setCityFilter("")}
                            className="text-slate-700 hover:text-slate-500"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>

                {/* Status filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="px-3 py-2 rounded-lg text-[12.5px] text-slate-400 focus:outline-none transition-colors"
                    style={{
                        appearance: "none",
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        minWidth: "110px",
                    }}
                >
                    <option value="" style={{ background: "#0d1117" }}>All statuses</option>
                    <option value="active" style={{ background: "#0d1117" }}>Active</option>
                    <option value="inactive" style={{ background: "#0d1117" }}>Inactive</option>
                    <option value="maintenance" style={{ background: "#0d1117" }}>Maintenance</option>
                    <option value="pending" style={{ background: "#0d1117" }}>Pending</option>
                </select>

                <span className="text-[11px] text-slate-700 ml-auto hidden sm:block tabular-nums">
                    {branches.length} node{branches.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* ── Table ────────────────────────────────────────────────────── */}
            <div
                className="rounded-xl flex-col flex-1 p-2 overflow-y-auto"
                style={{
                    background: "#060a10",
                    border: "1px solid rgba(255,255,255,0.05)",
                    boxShadow:
                        "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
                }}
            >
                {/* Column headers */}
                <div
                    className="hidden md:grid grid-cols-[1fr_270px_120px_120px_160px_auto] gap-4 px-5 py-2.5 border-b border-white/4"
                    style={{ background: "rgba(255,255,255,0.015)" }}
                >
                    {["Node", "Location", "Type", "Status", "Created", "Actions"].map((h, i) => (
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
                ) : branches.length === 0 ? (
                    <EmptyState
                        title="No branches found"
                        description="Create your first logistics node or adjust your filters."
                        icon={Package}
                        actionLabel="+ New Branch"
                        tone="warning"
                        onAction={() => setModalOpen(true)}
                    />
                ) : (
                    <div>
                        {branches.map((branch, idx) => (
                            <BranchRow
                                key={branch._id ?? branch.id}
                                branch={branch}
                                isLast={idx === branches.length - 1}
                                onEdit={() => setEditTarget(branch)}
                                onToggleBlock={() => setToggleTarget(branch)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Modals ───────────────────────────────────────────────────── */}
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

            {toggleTarget && (
                <ConfirmDialog
                    title={
                        toggleTarget.status === "active"
                            ? "Deactivate Branch"
                            : "Activate Branch"
                    }
                    message={
                        toggleTarget.status === "active"
                            ? `Deactivate "${toggleTarget.name}"? It will stop being available.`
                            : `Activate "${toggleTarget.name}"? It will become available again.`
                    }
                    confirmLabel={
                        toggleTarget.status === "active" ? "Deactivate" : "Activate"
                    }
                    danger={toggleTarget.status === "active"}
                    loading={submitting}
                    onConfirm={handleToggleBlock}
                    onCancel={() => setToggleTarget(null)}
                />
            )}
        </div>
    );
}