"use client";

import { useCallback, useEffect, useState } from "react";
import { IPaginatedResponse } from "@/types/paginate";
import { ROLES } from "@/lib/roles";
import { showToast } from "nextjs-toast-notify";
import Pagination from "@/components/commons/Pagination";
import { Plus, Search, X } from "lucide-react";
import RoleGuard from "@/lib/RoleGuard";
import StatCard from "@/components/commons/StatCard";
import { IMerchant, IMerchantDetails, IRegisterMerchant } from "@/types/merchant";
import { createMerchant, listMerchants } from "@/services/MerchantService";
import MerchantList from "@/components/dashboard/merchants/MerchantList";
import ErrorBaner from "@/components/commons/ErrorBaner";
import CreateMerchantModal from "@/components/dashboard/merchants/CreateMerchantModal";
import MerchantDetailModal from "@/components/dashboard/merchants/MerchantDetailModal";
import ActionBtn from "@/components/commons/ActionButton";

const PAGE_SIZE = 10;

export default function MerchantsPage() {
    const [pagination, setPagination] = useState<IPaginatedResponse<IMerchant> | null>(null);
    const merchants = pagination?.items ?? [];

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [createOpen, setCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);

    // ── Fetch ─────────────────────────────────────────────────────────────

    const fetchMerchants = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await listMerchants({ search, pageNumber: page, pageSize: PAGE_SIZE });
            setPagination(res as any);
            console.log("Fetched merchants", res);
        } catch (e: any) {
            console.log("Failed to fetch merchants", e);
            const msg = e?.message ?? "Failed to load merchants";
            setError(msg);
            showToast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchMerchants();
        }, 400);
        return () => clearTimeout(delay);
    }, [fetchMerchants]);

    const totalCount = pagination?.totalCount ?? 0;
    const uniqueWilayaCount = Array.from(new Set(merchants.map((m) => m.wilayaId))).length;

    // ── CRUD ──────────────────────────────────────────────────────────────

    const handleCreate = async (data: IRegisterMerchant) => {
        setCreateLoading(true);
        try {
            await createMerchant(data);
            setCreateOpen(false);
            showToast.success("Merchant registered successfully");
            fetchMerchants();
        } catch (e: any) {
            const serverErrors = e?.response?.data?.errors;
            const firstServerError = serverErrors ? Object.values(serverErrors).flat().find(Boolean) : null;
            const msg =
                firstServerError ??
                e?.response?.data?.message ??
                e?.response?.data?.title ??
                e?.message ??
                "Failed to register merchant";
            showToast.error(msg as string);
        } finally {
            setCreateLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <RoleGuard allowedRoles={[ROLES.MANAGER, ROLES.OWNER, ROLES.RECEPTIONIST]}>
            <div className="flex flex-col gap-3 h-full">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 pt-1">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div
                                style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }}
                                className="w-1 h-6 rounded-full"
                            />
                            <h1 className="text-[22px] font-bold text-white tracking-tight">Merchants</h1>
                        </div>
                        <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                            Manage merchants registered in your logistics network.
                        </p>
                    </div>
                    <ActionBtn onClick={() => setCreateOpen(true)} variant="primary" size="action" label="New Merchant" title="Create new merchant">
                        <Plus className="w-4 h-4" />
                    </ActionBtn>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard label="Total" value={totalCount} accent="#94a3b8" />
                    <StatCard label="Wilayas" value={uniqueWilayaCount} accent="#a78bfa" />
                    <StatCard label="Showing" value={merchants.length} accent="#fbbf24" />
                </div>

                {error && <ErrorBaner error={error} setError={setError} />}

                {/* Filters */}
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
                            placeholder="Search by business name…"
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
                        {merchants.length} merchant{merchants.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <MerchantList
                    merchants={merchants}
                    loading={loading}
                    onAddClick={() => setCreateOpen(true)}
                    onViewDetail={(id) => { setSelectedMerchantId(id); setDetailOpen(true); }}
                />

                {/* Pagination */}
                {pagination && (pagination as any).totalPages > 1 && (
                    <Pagination
                        pageNumber={(pagination as any).pageNumber}
                        totalPages={(pagination as any).totalPages}
                        hasNext={(pagination as any).hasNextPage}
                        hasPrev={(pagination as any).hasPreviousPage}
                        onChange={(p) => setPage(p)}
                    />
                )}

                {/* Modals */}
                <CreateMerchantModal
                    isOpen={createOpen}
                    onClose={() => setCreateOpen(false)}
                    onSubmit={handleCreate}
                    loading={createLoading}
                />

                {selectedMerchantId && (
                    <MerchantDetailModal
                        isOpen={detailOpen}
                        merchantId={selectedMerchantId}
                        onClose={() => { setDetailOpen(false); setSelectedMerchantId(null); }}
                    />
                )}
            </div>
        </RoleGuard>
    );
}