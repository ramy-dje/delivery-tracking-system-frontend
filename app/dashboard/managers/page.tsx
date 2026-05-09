"use client";

import { useEffect, useState, useCallback } from "react";
import { listManagers, createManager, removeStaff } from "@/services/ManagerService";
import ManagerList from "@/components/dashboard/managers/ManagerList";
import CreateManagerModal from "@/components/dashboard/managers/CreateManagerModal";
import ManagerDetailModal from "@/components/dashboard/managers/ManagerDetailModal";
import ReassignManagerModal from "@/components/dashboard/managers/ReassignManagerModal";
import { IManagerResponse, ICreateManagerRequest } from "@/types/manager";
import { ROLES } from "@/lib/roles";
import { showToast } from "nextjs-toast-notify";
import { getCompanyId } from "@/hooks/useAuth";
import StatCard from "@/components/commons/StatCard";
import { Plus, Search, X } from "lucide-react";
import ErrorBaner from "@/components/commons/ErrorBaner";
import { IPaginatedResponse } from "@/types/paginate";
import Pagination from "@/components/commons/Pagination";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import ActionBtn from "@/components/commons/ActionButton";


// ─── Page ─────────────────────────────────────────────────────────────────

export default function ManagersPage() {
    const PAGE_SIZE = 8;
    const companyId = getCompanyId() ?? "";
    const [pagination, setPagination] = useState<IPaginatedResponse<IManagerResponse> | null>(null);
    const managers = pagination?.items ?? [];

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<true | false | "">("");

    const [page, setPage] = useState(1);

    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedManager, setSelectedManager] = useState<IManagerResponse | null>(null);

    // Detail and reassign modals
    const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showReassignModal, setShowReassignModal] = useState(false);

    // ── Fetch ─────────────────────────────────────────────────────────────

    const fetchManagers = useCallback(async () => {
        if (!companyId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await listManagers(companyId, undefined, page, PAGE_SIZE);
            setPagination(res);
        } catch (e: any) {
            const msg = e?.message ?? "Failed to load managers";
            setError(msg);
            showToast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [companyId, page]);

    useEffect(() => {
        fetchManagers();
    }, [fetchManagers]);

    // ── CRUD ──────────────────────────────────────────────────────────────

    const handleCreate = async (data: ICreateManagerRequest) => {
        if (!companyId) return;
        setSubmitting(true);
        try {
            await createManager(companyId, data);
            setModalOpen(false);
            showToast.success("Manager created successfully");
            fetchManagers();
        } catch (e: any) {
            const serverMsg = e?.response?.data?.message ||
                (e?.response?.data?.errors && Array.isArray(e.response.data.errors)
                    ? e.response.data.errors.join("; ")
                    : undefined);
            showToast.error(serverMsg ?? e?.message ?? "Failed to create manager");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (m: IManagerResponse) => {
        setSelectedManager(m);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!companyId || !selectedManager) return;

        setLoading(true);
        try {
            await removeStaff(companyId, selectedManager.id);
            showToast.success("Manager removed");
            fetchManagers();
            setConfirmOpen(false);
            setSelectedManager(null);
        } catch (e: any) {
            showToast.error(e?.message ?? "Failed to remove manager");
        } finally {
            setLoading(false);
        }
    };



    const handleViewDetail = (managerId: string) => {
        setSelectedManagerId(managerId);
        setShowDetailModal(true);
    };

    const handleOpenReassign = () => {
        setShowDetailModal(false);
        setShowReassignModal(true);
    };

    const handleReassignSuccess = () => {
        setShowReassignModal(false);
        showToast.success("Manager reassigned successfully");
        fetchManagers();
    };

    // ── Derived ───────────────────────────────────────────────────────────

    const filtered = managers.filter((m) => {
        const q = search.toLowerCase();

        const matchSearch =
            !q ||
            m.fullName.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            m.logisticsNodeName?.toLowerCase().includes(q);

        const matchStatus =
            filterStatus === "" ? true : m.isActive === filterStatus;

        return matchSearch && matchStatus;
    });

    const hubCount = managers.filter((m) => m.role === ROLES.MANAGER).length;
    const activeCount = managers.filter((m) => m.isActive).length;

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-3 h-full">

            {/* ── Header ────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 pt-1">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div
                            className="w-1 h-6 rounded-full"
                            style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }}
                        />
                        <h1 className="text-[22px] font-bold text-white tracking-tight">
                            Managers
                        </h1>
                    </div>
                    <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                        Managers assigned to logistics nodes across your network.
                    </p>
                </div>
                <ActionBtn onClick={() => setModalOpen(true)} variant="primary" size="action" label="New Manager" title="Create new manager">
                    <Plus className="w-4 h-4" />
                </ActionBtn>
            </div>

            {/* ── Stat cards ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard label="Total" value={pagination?.totalCount || 0} accent="#94a3b8" />
                <StatCard label="Active" value={activeCount} accent="#34d399" />
                <StatCard
                    label="Managers"
                    value={hubCount}
                    accent="#fbbf24"
                />
            </div>

            {/* ── Error banner ──────────────────────────────────────────── */}
            {error && (
                <ErrorBaner error={error} setError={setError} />
            )}

            {/* ── Filters ───────────────────────────────────────────────── */}
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
                        placeholder="Search by name, email, or node…"
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

                {/* Role filter — only two options */}
                <div
                    className="flex items-center gap-0.5 p-0.5 rounded-lg shrink-0"
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    {[
                        { value: "", label: "All" },
                        { value: true, label: "Active", color: "#34d399" },
                        { value: false, label: "Inactive", color: "#f87171" },
                    ].map((opt, idx) => {
                        const active = filterStatus === opt.value;

                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    setFilterStatus(opt.value as any);
                                    setPage(1);
                                }}
                                className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150"
                                style={
                                    active
                                        ? {
                                            background: opt.color
                                                ? `${opt.color}20`
                                                : "rgba(255,255,255,0.06)",
                                            border: `1px solid ${opt.color}40`,
                                            color: opt.color ?? "#e2e8f0",
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
                    {filtered.length} manager{filtered.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* ── List ──────────────────────────────────────────────────── */}
            <ManagerList
                managers={filtered}
                loading={loading}
                onDelete={handleDeleteClick}
                onAddClick={() => setModalOpen(true)}
                onViewDetail={handleViewDetail}
            />

            {/* ── Pagination ────────────────────────────────────────────── */}
            {pagination && pagination.totalPages > 1 && (
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
                <CreateManagerModal
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleCreate}
                    loading={submitting}
                />
            )}

            {/* ── Delete Modals ────────────────────────────────────────────────── */}
            {confirmOpen && selectedManager && (
                <ConfirmDialog
                    title="Remove Manager"
                    message={`Remove "${selectedManager.fullName}" from the company?`}
                    confirmLabel="Remove"
                    danger
                    loading={loading}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => {
                        setConfirmOpen(false);
                        setSelectedManager(null);
                    }}
                />
            )}

            {selectedManagerId && (
                <>
                    <ManagerDetailModal
                        managerId={selectedManagerId}
                        companyId={companyId}
                        isOpen={showDetailModal}
                        onClose={() => {
                            setShowDetailModal(false);
                            setSelectedManagerId(null);
                        }}
                        onReassignClick={handleOpenReassign}
                    />

                    <ReassignManagerModal
                        managerId={selectedManagerId}
                        managerName={managers.find((m) => m.id === selectedManagerId)?.fullName ?? ""}
                        currentNodeId={managers.find((m) => m.id === selectedManagerId)?.logisticsNodeId ?? null}
                        currentNodeName={managers.find((m) => m.id === selectedManagerId)?.logisticsNodeName ?? null}
                        companyId={companyId}
                        isOpen={showReassignModal}
                        onClose={() => {
                            setShowReassignModal(false);
                            setShowDetailModal(true);
                        }}
                        onSuccess={handleReassignSuccess}
                    />
                </>
            )}
        </div>
    );
}