"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { ROLES } from "@/lib/roles";
import RoleGuard from "@/lib/RoleGuard";
import StatCard from "@/components/commons/StatCard";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import ErrorBaner from "@/components/commons/ErrorBaner";
import { parseApiError } from "@/utils/apiErrorHandler";
import { ICompany, ICreateCompanyInput } from "@/types/company";
import { createCompany, getMyCompany, toggleBlockCompany, updateCompany } from "@/services/CompanyService";
import CompanyList from "@/components/dashboard/company/CompanyList";
import CreateCompanyModal from "@/components/dashboard/company/CreateCompanyModal";
import CompanyDetailModal from "@/components/dashboard/company/CompanyDetailModal";

export default function CompanyPage() {
    const [companies, setCompanies] = useState<ICompany[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const [createOpen, setCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<ICompany | null>(null);
    const [saveLoading, setSaveLoading] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [blockTarget, setBlockTarget] = useState<ICompany | null>(null);
    const [blockLoading, setBlockLoading] = useState(false);

    // ── Fetch ────────────────────────────────────────────────────────────────

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getMyCompany();
            const c: ICompany = res.data ?? res;
            setCompanies(c ? [c] : []);
        } catch (e: any) {
            const err = parseApiError(e);
            setError(err.message ?? "Failed to load company");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

    const filtered = companies.filter((c) =>
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount    = companies.filter((c) => c.status === "active").length;
    const suspendedCount = companies.filter((c) => c.status === "suspended").length;

    // ── Create ───────────────────────────────────────────────────────────────

    const handleCreate = async (data: ICreateCompanyInput) => {
        setCreateLoading(true);
        try {
            await createCompany(data);
            showToast.success("Company created successfully");
            setCreateOpen(false);
            fetchCompanies();
        } catch (e: any) {
            const err = parseApiError(e);
            showToast.error(err.message ?? "Failed to create company");
        } finally {
            setCreateLoading(false);
        }
    };

    // ── Edit ─────────────────────────────────────────────────────────────────

    const handleSave = async (id: string, data: Partial<ICompany>) => {
        setSaveLoading(true);
        try {
            await updateCompany(id, data);
            showToast.success("Company updated successfully");
            fetchCompanies();
        } catch (e: any) {
            const err = parseApiError(e);
            showToast.error(err.message ?? "Failed to update company");
        } finally {
            setSaveLoading(false);
        }
    };

    // ── Toggle block ─────────────────────────────────────────────────────────

    const handleToggleBlock = async () => {
        if (!blockTarget) return;
        setBlockLoading(true);
        try {
            await toggleBlockCompany(blockTarget._id);
            showToast.success(`Company ${blockTarget.status === "suspended" ? "unblocked" : "suspended"}`);
            setConfirmOpen(false);
            setBlockTarget(null);
            fetchCompanies();
        } catch (e: any) {
            const err = parseApiError(e);
            showToast.error(err.message ?? "Failed to update company");
        } finally {
            setBlockLoading(false);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <RoleGuard allowedRoles={[ROLES.MANAGER, ROLES.OWNER, ROLES.ADMIN]}>
            <div className="flex flex-col gap-3 h-full">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 pt-1">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }} />
                            <h1 className="text-[22px] font-bold text-white tracking-tight">Company</h1>
                        </div>
                        <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                            Manage your company profile and settings.
                        </p>
                    </div>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 4px 16px rgba(251,191,36,0.2)" }}
                    >
                        <Plus size={13} />
                        New Company
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard label="Total"     value={companies.length} accent="#94a3b8" />
                    <StatCard label="Active"    value={activeCount}      accent="#34d399" />
                    <StatCard label="Suspended" value={suspendedCount}   accent="#f87171" />
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
                        {filtered.length} company{filtered.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Table */}
                <CompanyList
                    companies={filtered}
                    loading={loading}
                    onAddClick={() => setCreateOpen(true)}
                    onViewDetail={(c) => { setSelectedCompany(c); setDetailOpen(true); }}
                    onToggleBlock={(c) => { setBlockTarget(c); setConfirmOpen(true); }}
                />

                {/* Modals */}
                <CreateCompanyModal
                    isOpen={createOpen}
                    onClose={() => setCreateOpen(false)}
                    onSubmit={handleCreate}
                    loading={createLoading}
                />

                {detailOpen && selectedCompany && (
                    <CompanyDetailModal
                        isOpen={detailOpen}
                        company={selectedCompany}
                        onClose={() => { setDetailOpen(false); setSelectedCompany(null); }}
                        onSave={handleSave}
                        saving={saveLoading}
                    />
                )}

                {confirmOpen && blockTarget && (
                    <ConfirmDialog
                        title={`${blockTarget.status === "suspended" ? "Unblock" : "Suspend"} Company`}
                        message={`${blockTarget.status === "suspended" ? "Unblock" : "Suspend"} "${blockTarget.name}"? ${blockTarget.status !== "suspended" ? "All associated users will lose access." : ""}`}
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
