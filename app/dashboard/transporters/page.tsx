"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { ROLES } from "@/lib/roles";
import { getCompanyId } from "@/hooks/useAuth";
import RoleGuard from "@/lib/RoleGuard";
import StatCard from "@/components/commons/StatCard";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import ErrorBaner from "@/components/commons/ErrorBaner";
import { parseApiError } from "@/utils/apiErrorHandler";
import { ICreateTransporter, ITransporterResponse } from "@/types/transporter";
import { createTransporter, listTransporters, toggleBlockTransporter, updateTransporter } from "@/services/TransporterService";
import TransporterList from "@/components/dashboard/transporters/TransporterList";
import CreateTransporterModal from "@/components/dashboard/transporters/CreateTransporterModal";
import EditTransporterModal from "@/components/dashboard/transporters/EditTransporterModal";
import Pagination from "@/components/commons/Pagination";

export default function TransportersPage() {
    const companyId = getCompanyId() ?? "";

    const [transporters, setTransporters] = useState<ITransporterResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)

    const [createOpen, setCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    const [editOpen, setEditOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<ITransporterResponse | null>(null);
    const [editLoading, setEditLoading] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selected, setSelected] = useState<ITransporterResponse | null>(null);
    const [toggleLoading, setToggleLoading] = useState(false);

    // ── Fetch ────────────────────────────────────────────────────────────────

    const fetchTransporters = useCallback(async () => {
        if (!companyId) { setError("No company assigned to this account."); setLoading(false); return; }
        setLoading(true);
        setError(null);
        try {
            const res = await listTransporters(companyId, { pageNumber, pageSize });
            setTransporters(res.data ?? []);
            setPageNumber(res.pagination?.pageNumber || pageNumber);
            setPageSize(res.pagination?.pageSize || pageSize);
            setTotalPages(res.pagination?.totalPages || totalPages);
        } catch (e: any) {
            const err = parseApiError(e);
            setError(err.message ?? "Failed to fetch transporters");
        } finally {
            setLoading(false);
        }
    }, [companyId, pageNumber, pageSize]);

    useEffect(() => { fetchTransporters(); }, [fetchTransporters]);

    const filtered = transporters.filter((t) =>
        !search || t.fullName.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = transporters.filter((t) => t.isActive !== false).length;
    const onlineCount = transporters.filter((t) => t.isOnline).length;

    // ── CRUD ─────────────────────────────────────────────────────────────────

    const handleCreate = async (data: ICreateTransporter) => {
        if (!companyId) return;
        setCreateLoading(true);
        try {
            await createTransporter(companyId, data);
            showToast.success("Transporter registered successfully");
            setCreateOpen(false);
            fetchTransporters();
        } catch (e: any) {
            const err = parseApiError(e);
            showToast.error(err.message ?? "Failed to create transporter");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleEdit = async (data: Partial<ICreateTransporter>) => {
        if (!editTarget || !companyId) return;
        setEditLoading(true);
        try {
            await updateTransporter(companyId, editTarget.id, data);
            showToast.success("Transporter updated successfully");
            setEditOpen(false);
            setEditTarget(null);
            fetchTransporters();
        } catch (e: any) {
            const err = parseApiError(e);
            showToast.error(err.message ?? "Failed to update transporter");
        } finally {
            setEditLoading(false);
        }
    };

    const handleToggleBlock = async () => {
        if (!selected || !companyId) return;
        setToggleLoading(true);
        try {
            await toggleBlockTransporter(companyId, selected.id);
            showToast.success(`Transporter ${selected.isActive ? "blocked" : "unblocked"}`);
            setConfirmOpen(false);
            setSelected(null);
            fetchTransporters();
        } catch (e: any) {
            const err = parseApiError(e);
            showToast.error(err.message ?? "Failed to update transporter");
        } finally {
            setToggleLoading(false);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <RoleGuard allowedRoles={[ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.ADMIN]}>
            <div className="flex flex-col gap-3 h-full">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 pt-1">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }} />
                            <h1 className="text-[22px] font-bold text-white tracking-tight">Transporters</h1>
                        </div>
                        <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                            Manage truck drivers handling inter-branch routes.
                        </p>
                    </div>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 4px 16px rgba(251,191,36,0.2)" }}
                    >
                        <Plus size={13} />
                        New Transporter
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard label="Total" value={transporters.length} accent="#94a3b8" />
                    <StatCard label="Active" value={activeCount} accent="#34d399" />
                    <StatCard label="Online" value={onlineCount} accent="#22d3ee" />
                </div>

                {error && <ErrorBaner error={error} setError={setError} />}

                {/* Search */}
                <div className="flex flex-wrap items-center gap-3">
                    <div
                        className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-lg"
                        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                        <Search size={13} className="text-slate-700 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by name or email…"
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
                        {filtered.length} transporter{filtered.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <TransporterList
                    transporters={filtered}
                    loading={loading}
                    onAddClick={() => setCreateOpen(true)}
                    onEdit={(t) => { setEditTarget(t); setEditOpen(true); }}
                    onToggleStatus={(t) => { setSelected(t); setConfirmOpen(true); }}
                />

                {totalPages > 1 && (
                    <Pagination
                        pageNumber={pageNumber}
                        totalPages={totalPages}
                        hasNext={pageNumber < totalPages}
                        hasPrev={pageNumber > 1}
                        onChange={(p) => setPageNumber(p)}
                    />
                )}

                {/* Modals */}
                <CreateTransporterModal
                    isOpen={createOpen}
                    onClose={() => setCreateOpen(false)}
                    onSubmit={handleCreate}
                    loading={createLoading}
                />

                <EditTransporterModal
                    isOpen={editOpen}
                    transporter={editTarget}
                    onClose={() => { setEditOpen(false); setEditTarget(null); }}
                    onSubmit={handleEdit}
                    loading={editLoading}
                />

                {confirmOpen && selected && (
                    <ConfirmDialog
                        title={`${selected.isActive ? "Block" : "Unblock"} Transporter`}
                        message={`${selected.isActive ? "Block" : "Unblock"} "${selected.fullName}"? They will ${selected.isActive ? "no longer" : "be able to"} access the system.`}
                        confirmLabel="Confirm"
                        danger={selected.isActive}
                        loading={toggleLoading}
                        onConfirm={handleToggleBlock}
                        onCancel={() => { setConfirmOpen(false); setSelected(null); }}
                    />
                )}
            </div>
        </RoleGuard>
    );
}
