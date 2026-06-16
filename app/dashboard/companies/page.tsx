"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, X, Building2 } from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { ROLES } from "@/lib/roles";
import RoleGuard from "@/lib/RoleGuard";
import StatCard from "@/components/commons/StatCard";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import ErrorBaner from "@/components/commons/ErrorBaner";
import { parseApiError } from "@/utils/apiErrorHandler";
import { ICompany } from "@/types/company";
import { getAllCompanies, toggleBlockCompany } from "@/services/CompanyService";
import CompanyList from "@/components/dashboard/company/CompanyList";
import CompanyDetailModal from "@/components/dashboard/company/CompanyDetailModal";
import Pagination from "@/components/commons/Pagination";

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<ICompany[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize, setPageSize] = useState(6)
    const [totalPages, setTotalPages] = useState(0)

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<ICompany | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [blockTarget, setBlockTarget] = useState<ICompany | null>(null);
    const [blockLoading, setBlockLoading] = useState(false);

    // ── Fetch ────────────────────────────────────────────────────────────────

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAllCompanies({ pageNumber, pageSize, search });
            setCompanies(res.data || []);
            console.log("Fetched companies:", res.pagination);
            setTotalPages(res.pagination.totalPages || 0)
            setPageNumber(res.pagination.pageNumber || 1)
            setPageSize(res.pagination.pageSize || 0)
        } catch (e: any) {
            const err = parseApiError(e);
            setError(err.message ?? "Failed to load companies");
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize, search]);

    useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

    const activeCount = companies.filter((c) => c.status === "active").length;
    const suspendedCount = companies.filter((c) => c.status === "suspended").length;

    // ── Toggle block ─────────────────────────────────────────────────────────

    const handleToggleBlock = async () => {
        if (!blockTarget) return;
        setBlockLoading(true);
        try {
            await toggleBlockCompany(blockTarget._id);
            showToast.success(
                `Company ${blockTarget.status === "suspended" ? "unblocked" : "suspended"} successfully`
            );
            setConfirmOpen(false);
            setBlockTarget(null);
            fetchCompanies();
        } catch (e: any) {
            const err = parseApiError(e);
            showToast.error(err.message ?? "Failed to update company status");
        } finally {
            setBlockLoading(false);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <RoleGuard allowedRoles={[ROLES.ADMIN]}>
            <div className="flex flex-col gap-3 h-full min-h-0 flex-1 overflow-hidden">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 pt-1">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div
                                className="w-1 h-6 rounded-full"
                                style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }}
                            />
                            <h1 className="text-[22px] font-bold text-white tracking-tight">
                                Companies
                            </h1>
                        </div>
                        <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                            View and manage all registered companies.
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard label="Total" value={companies.length} accent="#94a3b8" />
                    <StatCard label="Active" value={activeCount} accent="#34d399" />
                    <StatCard label="Suspended" value={suspendedCount} accent="#f87171" />
                </div>

                {error && <ErrorBaner error={error} setError={setError} />}

                {/* Search */}
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
                            placeholder="Search by name or email…"
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
                    <span className="text-[11px] text-slate-700 ml-auto hidden sm:block tabular-nums">
                        {companies.length} compan{companies.length !== 1 ? "ies" : "y"}
                    </span>
                </div>

                {/* List */}
                <CompanyList
                    companies={companies}
                    loading={loading}
                    onViewDetail={(c) => { setSelectedCompany(c); setDetailOpen(true); }}
                    onToggleBlock={(c) => { setBlockTarget(c); setConfirmOpen(true); }}
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
                {/* Detail modal — read-only for admin (no onSave) */}
                {detailOpen && selectedCompany && (
                    <CompanyDetailModal
                        isOpen={detailOpen}
                        company={selectedCompany}
                        onClose={() => { setDetailOpen(false); setSelectedCompany(null); }}
                    />
                )}

                {/* Block/unblock confirm */}
                {confirmOpen && blockTarget && (
                    <ConfirmDialog
                        title={`${blockTarget.status === "suspended" ? "Unblock" : "Suspend"} Company`}
                        message={`${blockTarget.status === "suspended" ? "Unblock" : "Suspend"} "${blockTarget.name}"?${blockTarget.status !== "suspended" ? " All associated users will lose access." : ""}`}
                        confirmLabel="Confirm"
                        danger={blockTarget.status !== "suspended"}
                        loading={blockLoading}
                        onConfirm={handleToggleBlock}
                        onCancel={() => { setConfirmOpen(false); setBlockTarget(null); }}
                    />
                )}
            </div>
        </RoleGuard>
    );
}