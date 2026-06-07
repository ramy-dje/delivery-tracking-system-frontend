"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { ROLES } from "@/lib/roles";
import { getNodeId } from "@/hooks/useAuth";
import RoleGuard from "@/lib/RoleGuard";
import StatCard from "@/components/commons/StatCard";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import ErrorBaner from "@/components/commons/ErrorBaner";
import { parseApiError } from "@/utils/apiErrorHandler";
import { ICreateFreelancer, IFreelancerResponse } from "@/types/freelancer";
import { createFreelancer, listFreelancers, toggleBlockFreelancer } from "@/services/FreelancerService";
import FreelancerList from "@/components/dashboard/freelancers/FreelancerList";
import CreateFreelancerModal from "@/components/dashboard/freelancers/CreateFreelancerModal";

export default function FreelancersPage() {
    const branchId = getNodeId() ?? "";

    const [freelancers, setFreelancers] = useState<IFreelancerResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const [createOpen, setCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selected, setSelected] = useState<IFreelancerResponse | null>(null);
    const [toggleLoading, setToggleLoading] = useState(false);

    // ── Fetch ────────────────────────────────────────────────────────────────

    const fetchFreelancers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await listFreelancers(branchId);
            const items: IFreelancerResponse[] = (res.data ?? []).map((f: any) => ({
                id: f._id ?? f.id,
                fullName: f.userId ? `${f.userId.firstName} ${f.userId.lastName}` : f.fullName ?? "",
                email: f.userId?.email ?? f.email ?? "",
                phoneNumber: f.userId?.phone ?? f.phoneNumber,
                role: "Freelancer",
                isActive: f.isActive ?? true,
            }));
            setFreelancers(items);
        } catch (e: any) {
            const err = parseApiError(e);
            setError(err.message ?? "Failed to fetch freelancers");
        } finally {
            setLoading(false);
        }
    }, [branchId]);

    useEffect(() => { fetchFreelancers(); }, [fetchFreelancers]);

    const filtered = freelancers.filter((f) =>
        !search || f.fullName.toLowerCase().includes(search.toLowerCase()) || f.email.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = freelancers.filter((f) => f.isActive !== false).length;

    // ── CRUD ─────────────────────────────────────────────────────────────────

    const handleCreate = async (data: ICreateFreelancer) => {
        if (!branchId) return;
        setCreateLoading(true);
        try {
            await createFreelancer(branchId, data);
            showToast.success("Freelancer registered successfully");
            setCreateOpen(false);
            fetchFreelancers();
        } catch (e: any) {
            const err = parseApiError(e);
            showToast.error(err.message ?? "Failed to create freelancer");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleToggleBlock = async () => {
        if (!selected || !branchId) return;
        setToggleLoading(true);
        try {
            await toggleBlockFreelancer(branchId, selected.id);
            showToast.success(`Freelancer ${selected.isActive ? "blocked" : "unblocked"}`);
            setConfirmOpen(false);
            setSelected(null);
            fetchFreelancers();
        } catch (e: any) {
            const err = parseApiError(e);
            showToast.error(err.message ?? "Failed to update freelancer");
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
                            <h1 className="text-[22px] font-bold text-white tracking-tight">Freelancers</h1>
                        </div>
                        <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                            Manage freelance delivery agents assigned to this branch.
                        </p>
                    </div>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 4px 16px rgba(251,191,36,0.2)" }}
                    >
                        <Plus size={13} />
                        New Freelancer
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard label="Total" value={freelancers.length} accent="#94a3b8" />
                    <StatCard label="Active" value={activeCount} accent="#34d399" />
                    <StatCard label="Showing" value={filtered.length} accent="#fbbf24" />
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
                        {filtered.length} freelancer{filtered.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <FreelancerList
                    freelancers={filtered}
                    loading={loading}
                    onAddClick={() => setCreateOpen(true)}
                    onToggleStatus={(f) => { setSelected(f); setConfirmOpen(true); }}
                />

                {/* Modals */}
                <CreateFreelancerModal
                    isOpen={createOpen}
                    onClose={() => setCreateOpen(false)}
                    onSubmit={handleCreate}
                    loading={createLoading}
                />

                {confirmOpen && selected && (
                    <ConfirmDialog
                        title={`${selected.isActive ? "Block" : "Unblock"} Freelancer`}
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
