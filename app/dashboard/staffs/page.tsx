"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listStaffs, createStaff, setActivateStaff } from "@/services/StaffService";
import { IStaffRegister, IStaffResponse } from "@/types/staff";
import { IPaginatedResponse } from "@/types/paginate";
import { ROLES, Role } from "@/lib/roles";
import { getNodeId } from "@/hooks/useAuth";
import { showToast } from "nextjs-toast-notify";
import Pagination from "@/components/commons/Pagination";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import { Plus, Search, X } from "lucide-react";
import StaffList from "@/components/dashboard/staffs/StaffList";
import CreateStaffModal from "@/components/dashboard/staffs/CreateStaffModal";
import StaffDetailModal from "@/components/dashboard/staffs/StaffDetailModal";
import RoleGuard from "@/lib/RoleGuard";
import StatCard from "@/components/commons/StatCard";

const PAGE_SIZE = 3;

export default function StaffsPage() {
    const managerNodeId = getNodeId() ?? "";

    const [pagination, setPagination] = useState<IPaginatedResponse<IStaffResponse> | null>(null);
    const staffs = pagination?.items ?? [];

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<"" | Role>("");
    const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
    const [page, setPage] = useState(1);

    const [createOpen, setCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<IStaffResponse | null>(null);
    const [activationStatusLoading, setActivationStatusLoading] = useState(false);

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

    // ── Fetch ─────────────────────────────────────────────────────────────

    const fetchStaffs = useCallback(async () => {
        if (!managerNodeId) {
            setPagination(null);
            setLoading(false);
            setError("No logistics node is assigned to this manager.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await listStaffs({ pageNumber: page, pageSize: PAGE_SIZE });
            console.log("Fetched staffs", res);
            setPagination(res);
        } catch (e: any) {
            const msg = e?.message ?? "Failed to load staff";
            setError(msg);
            showToast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [managerNodeId, page]);

    useEffect(() => { fetchStaffs(); }, [fetchStaffs]);

    // ── Filtering ─────────────────────────────────────────────────────────

    const filteredStaffs = useMemo(() => {
        const q = search.trim().toLowerCase();
        return staffs.filter((s) => {
            const matchSearch = !q || s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
            const matchRole = !roleFilter || s.role === roleFilter;
            const isActive = s.isActive !== false;
            const matchStatus = statusFilter === "" ? true : statusFilter === "active" ? isActive : !isActive;
            return matchSearch && matchRole && matchStatus;
        });
    }, [search, roleFilter, statusFilter, staffs]);

    const activeCount = staffs.filter((s) => s.isActive !== false).length;
    const totalCount = pagination?.totalCount ?? 0;

    // ── CRUD ──────────────────────────────────────────────────────────────

    const handleCreate = async (data: IStaffRegister) => {
        if (!managerNodeId) return;
        setCreateLoading(true);
        try {
            console.log("Creating staff with data", data);
            await createStaff({ ...data });
            setCreateOpen(false);
            showToast.success("Staff created successfully");
            fetchStaffs();
        } catch (e: any) {
            const serverErrors = e?.response?.data?.errors;
            const firstServerError = serverErrors ? Object.values(serverErrors).flat().find(Boolean) : null;
            const msg = firstServerError ?? e?.response?.data?.message ?? e?.response?.data?.title ?? e?.message ?? "Failed to create staff";
            showToast.error(msg);
            console.error("Create staff error", e);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleConfirmToggleActivation = async () => {
        if (!selectedStaff) return;
        setActivationStatusLoading(true);
        try {
            // Toggle isActive: if true → false (deactivate), if false → true (activate)
            await setActivateStaff(selectedStaff.id, !selectedStaff.isActive);
            showToast.success(`Staff ${selectedStaff.isActive ? "deactivated" : "activated"}`);
            setConfirmOpen(false);
            setSelectedStaff(null);
            fetchStaffs();
        } catch (e: any) {
            showToast.error(e?.message ?? "Failed to update staff status");
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
                            <h1 className="text-[22px] font-bold text-white tracking-tight">Staff</h1>
                        </div>
                        <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                            Manage operational staff for your logistics node.
                        </p>
                    </div>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 4px 16px rgba(251,191,36,0.2)" }}
                    >
                        <Plus size={13} />
                        New Staff
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard label="Total" value={totalCount} accent="#94a3b8" />
                    <StatCard label="Active" value={activeCount} accent="#34d399" />
                    <StatCard label="Showing" value={filteredStaffs.length} accent="#fbbf24" />
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 text-[13px]" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        {error}
                    </div>
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

                    {/* Role filter — only two options
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
                            const active = statusFilter === opt.value;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setStatusFilter(opt.value as any);
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
                    </div> */}

                    <span className="text-[11px] text-slate-700 ml-auto hidden sm:block tabular-nums">
                        {filteredStaffs.length} manager{filteredStaffs.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <StaffList
                    staffs={filteredStaffs}
                    loading={loading}
                    onAddClick={() => setCreateOpen(true)}
                    onViewDetail={(id) => { setSelectedStaffId(id); setDetailOpen(true); }}
                    onToggleStatus={(s) => { setSelectedStaff(s); setConfirmOpen(true); }}
                />

                {/* Pagination area */}
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
                <CreateStaffModal
                    isOpen={createOpen}
                    onClose={() => setCreateOpen(false)}
                    onSubmit={handleCreate}
                    loading={createLoading}
                    defaultNodeId={managerNodeId}
                    lockNodeSelection
                />

                {confirmOpen && selectedStaff && (
                    <ConfirmDialog
                        title={`${selectedStaff.isActive ? "Deactivate" : "Activate"} Staff`}
                        message={`${selectedStaff.isActive ? "Deactivate" : "Activate"} "${selectedStaff.fullName}"? They will ${selectedStaff.isActive ? "no longer" : "be able to"} access the system.`}
                        confirmLabel="Confirm"
                        danger={selectedStaff.isActive}  // red for deactivate, green for activate
                        loading={activationStatusLoading}
                        onConfirm={handleConfirmToggleActivation}
                        onCancel={() => { setConfirmOpen(false); setSelectedStaff(null); }}
                    />
                )}

                {selectedStaffId && (
                    <StaffDetailModal
                        isOpen={detailOpen}
                        staffId={selectedStaffId}
                        onClose={() => { setDetailOpen(false); setSelectedStaffId(null); }}
                    />
                )}
            </div>
        </RoleGuard>
    );
}