"use client";

import { useEffect, useState, useCallback } from "react";

import {
    getSupervisors,
    createSupervisor,
    toggleSupervisorStatus,
} from "@/services/SupervisorService";

import {
    ISupervisorResponse,
    ICreateSupervisorRequest,
} from "@/types/supervisor";

import { showToast } from "nextjs-toast-notify";
import { getCompanyId } from "@/hooks/useAuth";

import StatCard from "@/components/commons/StatCard";
import ErrorBaner from "@/components/commons/ErrorBaner";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import ActionBtn from "@/components/commons/ActionButton";

import { Plus, Search, X } from "lucide-react";
import SupervisorList from "@/components/dashboard/supervisors/SupervisorList";
import CreateSupervisorModal from "@/components/dashboard/supervisors/CreateSupervisorModal";
import SupervisorDetailModal from "@/components/dashboard/supervisors/SupervisorDetailModal";
import { parseApiError } from "@/utils/apiErrorHandler";
import Pagination from "@/components/commons/Pagination";

export default function SupervisorsPage() {
    const companyId = getCompanyId() ?? "";

    const [supervisors, setSupervisors] = useState<ISupervisorResponse[]>([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");

    // pagination 
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)

    const [modalOpen, setModalOpen] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedSupervisor, setSelectedSupervisor] =
        useState<ISupervisorResponse | null>(null);

    // For detail modal — store both supervisorId and its branchId
    const [detailTarget, setDetailTarget] = useState<{
        supervisorId: string;
        branchId: string;
    } | null>(null);

    const fetchSupervisors = useCallback(async () => {
        if (!companyId) return;

        setLoading(true);
        setError(null);

        try {
            const res = await getSupervisors(companyId, { search, pageNumber, pageSize });
            setSupervisors(res.data);
            setTotalPages(res.pagination.totalPages);
            setPageNumber(res.pagination.pageNumber);
            setPageSize(res.pagination.pageSize);
        } catch (e: any) {
            const msg = e?.message ?? "Failed to load supervisors";
            setError(msg);
            showToast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [companyId, pageNumber, pageSize, totalPages]);

    useEffect(() => {
        fetchSupervisors();
    }, [fetchSupervisors]);

    const handleCreate = async (data: ICreateSupervisorRequest) => {
        if (!companyId) return;

        setSubmitting(true);

        try {
            await createSupervisor(companyId, data);
            showToast.success("Supervisor created successfully");
            setModalOpen(false);
            fetchSupervisors();
        } catch (e: any) {
            const error = parseApiError(e);
            console.log("Create Supervisor Error:", error);
            showToast.error(
                error?.message ||
                "Failed to create supervisor"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleClick = (supervisor: ISupervisorResponse) => {
        setSelectedSupervisor(supervisor);
        setConfirmOpen(true);
    };

    const handleConfirmToggle = async () => {
        if (!companyId || !selectedSupervisor) return;

        try {
            await toggleSupervisorStatus(companyId, selectedSupervisor._id);
            showToast.success(
                selectedSupervisor.isActive
                    ? "Supervisor suspended"
                    : "Supervisor activated"
            );
            fetchSupervisors();
        } catch (e: any) {
            showToast.error(
                e?.response?.data?.message ||
                e?.message ||
                "Failed to update supervisor"
            );
        } finally {
            setConfirmOpen(false);
            setSelectedSupervisor(null);
        }
    };

    // Derive branchId from the supervisor record so the detail modal can call
    // GET /manager/companies/:companyId/branches/:branchId/supervisor
    const handleViewDetail = (supervisorId: string) => {
        const supervisor = supervisors.find((s) => s._id === supervisorId);
        const branchId =
            typeof supervisor?.branchId === "object"
                ? supervisor.branchId._id
                : supervisor?.branchId ?? "";

        setDetailTarget({ supervisorId, branchId });
    };

    const activeCount = supervisors.filter((s) => s.isActive).length;

    return (
        <div className="flex flex-col gap-3 h-full min-h-0">

            <div className="flex items-start justify-between gap-4 pt-1">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div
                            className="w-1 h-6 rounded-full"
                            style={{
                                background: "linear-gradient(180deg,#fbbf24,#f59e0b66)",
                            }}
                        />
                        <h1 className="text-[22px] font-bold text-white tracking-tight">
                            Supervisors
                        </h1>
                    </div>
                    <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                        Branch supervisors across your company.
                    </p>
                </div>

                <ActionBtn
                    onClick={() => setModalOpen(true)}
                    variant="primary"
                    size="action"
                    label="New Supervisor"
                    title="Create Supervisor"
                >
                    <Plus className="w-4 h-4" />
                </ActionBtn>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <StatCard label="Total" value={supervisors.length} accent="#94a3b8" />
                <StatCard label="Active" value={activeCount} accent="#34d399" />
            </div>

            {error && <ErrorBaner error={error} setError={setError} />}

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
                        placeholder="Search supervisor..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent text-[12.5px] text-white placeholder:text-slate-700 focus:outline-none flex-1"
                    />
                    {search && (
                        <button onClick={() => setSearch("")}>
                            <X size={13} />
                        </button>
                    )}
                </div>
            </div>

            <SupervisorList
                supervisors={supervisors}
                loading={loading}
                onToggleStatus={handleToggleClick}
                onViewDetail={handleViewDetail}
                onAddClick={() => setModalOpen(true)}
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

            {modalOpen && (
                <CreateSupervisorModal
                    loading={submitting}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleCreate}
                />
            )}

            {confirmOpen && selectedSupervisor && (
                <ConfirmDialog
                    danger={selectedSupervisor.isActive}
                    loading={loading}
                    title={
                        selectedSupervisor.isActive
                            ? "Suspend Supervisor"
                            : "Activate Supervisor"
                    }
                    confirmLabel={
                        selectedSupervisor.isActive ? "Suspend" : "Activate"
                    }
                    message={`Are you sure you want to ${selectedSupervisor.isActive ? "suspend" : "activate"
                        } this supervisor?`}
                    onConfirm={handleConfirmToggle}
                    onCancel={() => {
                        setConfirmOpen(false);
                        setSelectedSupervisor(null);
                    }}
                />
            )}

            {detailTarget && (
                <SupervisorDetailModal
                    supervisorId={detailTarget.supervisorId}
                    branchId={detailTarget.branchId}
                    companyId={companyId}
                    isOpen={!!detailTarget}
                    onClose={() => setDetailTarget(null)}
                />
            )}
        </div>
    );
}