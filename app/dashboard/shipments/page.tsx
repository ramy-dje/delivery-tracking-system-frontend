"use client";
import { useCallback, useEffect, useState } from "react";
import { IPaginatedResponse } from "@/types/paginate";
import { getNodeId, getUserRole } from "@/hooks/useAuth";
import { showToast } from "nextjs-toast-notify";
import Pagination from "@/components/commons/Pagination";
import { Plus, Search, X } from "lucide-react";
import StatCard from "@/components/commons/StatCard";
import { IPackage, PackageStatus, IShipmentFilter, ICreatePackageBody, STATUS_LABEL } from "@/types/shipment";
import {
    listShipments,
    createShipment,
    cancelShipment,
    getFreelancerPackages,
    cancelFreelancerPackage,
} from "@/services/ShipmentService";
import ShipmentList from "@/components/dashboard/shipments/ShipmentList";
import ShipmentDetailModal from "@/components/dashboard/shipments/ShipmentDetailModal";
import CreateShipmentModal from "@/components/dashboard/shipments/CreateShipmentModal";
import { parseApiError } from "@/utils/apiErrorHandler";
import RoleGuard from "@/lib/RoleGuard";
import { ROLES } from "@/lib/roles";
import ErrorBaner from "@/components/commons/ErrorBaner";
import SelectField from "@/components/commons/SelectField";
import ActionBtn from "@/components/commons/ActionButton";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import SwapShipmentModal from "@/components/dashboard/shipments/SwapShipmentModal";
import { handleBatchPrint } from "@/utils/printHelper";

const PAGE_SIZE = 10;

interface DashboardStats {
    pending: number;
    inTransit: number;
    delivered: number;
    failed: number;
}

export default function ShipmentsPage() {
    const hubId = getNodeId() ?? "";
    const userRole = getUserRole();
    const isFreelancer = userRole === ROLES.MERCHANT;

    const [pagination, setPagination] = useState<IPaginatedResponse<IPackage> | null>(null);
    const shipments = pagination?.items ?? [];

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"" | PackageStatus>("");
    const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<"" | "home" | "branch_pickup">("");
    const [sortBy, setSortBy] = useState<"createdAt" | "totalPrice" | "status">("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);

    const [createOpen, setCreateOpen] = useState(false);
    const [swapOpen, setSwapOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelLoading, setCancelLoading] = useState(false);
    const [mode, setMode] = useState<'merchant' | 'receptionist'>(() => {
        if (userRole === ROLES.RECEPTIONIST || userRole === ROLES.MANAGER) return 'receptionist';
        if (userRole === ROLES.MERCHANT) return 'merchant';
        return 'merchant';
    });
    const [createLoading, setCreateLoading] = useState(false);

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
    const [selectedShipment, setSelectedShipment] = useState<IPackage | null>(null);

    const [stats, setStats] = useState<DashboardStats>({
        pending: 0,
        inTransit: 0,
        delivered: 0,
        failed: 0,
    });

    // ── Freelancer fetch ──────────────────────────────────────────────────────
    const fetchFreelancerShipments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getFreelancerPackages({
                status: statusFilter || undefined,
                deliveryType: deliveryTypeFilter || undefined,
                search: search || undefined,
                sortBy,
                sortOrder,
                page,
                limit: PAGE_SIZE,
            });

            // Map to IPaginatedResponse shape
            const paginationData: IPaginatedResponse<IPackage> = {
                items: res.data ?? [],
                pageNumber: res.pagination?.page ?? page,
                pageSize: PAGE_SIZE,
                totalCount: res.pagination?.total ?? 0,
                totalPages: res.pagination?.totalPages ?? 1,
                hasNextPage: res.pagination?.hasNextPage ?? false,
                hasPreviousPage: res.pagination?.hasPrevPage ?? false,
            };
            setPagination(paginationData);

            // Populate stats from summary
            const byStatus = res.summary?.byStatus ?? {};
            setStats({
                pending: (byStatus.pending ?? 0) + (byStatus.accepted ?? 0),
                inTransit:
                    (byStatus.at_origin_branch ?? 0) +
                    (byStatus.in_transit_to_branch ?? 0) +
                    (byStatus.at_destination_branch ?? 0) +
                    (byStatus.out_for_delivery ?? 0),
                delivered: byStatus.delivered ?? 0,
                failed:
                    (byStatus.failed_delivery ?? 0) +
                    (byStatus.cancelled ?? 0) +
                    (byStatus.returned ?? 0),
            });
        } catch (e: any) {
            const err = parseApiError(e);
            setError(err.message ?? "Failed to fetch shipments");
        } finally {
            setLoading(false);
        }
    }, [statusFilter, deliveryTypeFilter, search, sortBy, sortOrder, page]);

    // ── Supervisor/Receptionist fetch ─────────────────────────────────────────
    const fetchSupervisorShipments = useCallback(async () => {
        if (!hubId) return;
        setLoading(true);
        setError(null);
        try {
            const filter: IShipmentFilter = {
                pageNumber: page,
                pageSize: PAGE_SIZE,
                search,
                status: statusFilter || undefined,
            };
            const data = await listShipments(filter);
            setPagination(data);
            setStats({ pending: 0, inTransit: 0, delivered: 0, failed: 0 });
        } catch (e: any) {
            const err = parseApiError(e);
            setError(err.message ?? "Failed to fetch shipments");
        } finally {
            setLoading(false);
        }
    }, [hubId, search, statusFilter, page]);

    const fetchShipments = isFreelancer ? fetchFreelancerShipments : fetchSupervisorShipments;

    useEffect(() => {
        fetchShipments();
    }, [fetchShipments]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleCreateSubmit = async (payload: ICreatePackageBody) => {
        setCreateLoading(true);
        try {
            await createShipment(hubId, payload);
            showToast.success("Shipment created successfully");
            await fetchShipments();
            setCreateOpen(false);
        } catch (err: any) {
            var error = parseApiError(err);
            showToast.error(error.message || "Failed to create shipment");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleViewDetail = (shipmentId: string) => {
        setSelectedShipmentId(shipmentId);
        setDetailOpen(true);
    };

    const handleDetailClose = () => {
        setDetailOpen(false);
        setSelectedShipmentId(null);
        fetchShipments();
    };

    const openCreateModal = (mode: 'merchant' | 'receptionist') => {
        setMode(mode);
        setCreateOpen(true);
    };

    const handleCancelShipment = async () => {
        if (!selectedShipment) return;
        setCancelLoading(true);
        try {
            if (isFreelancer) {
                await cancelFreelancerPackage(selectedShipment._id, cancelReason || undefined);
            } else {
                await cancelShipment(hubId, selectedShipment._id);
            }
            showToast.success("Shipment cancelled successfully");
            setCancelOpen(false);
            setCancelReason("");
            setSelectedShipment(null);
            fetchShipments();
        } catch (err) {
            const error = parseApiError(err);
            showToast.error(error.message || "Failed to cancel shipment");
        } finally {
            setCancelLoading(false);
        }
    };

    const handleBatchPrintShipments = async (selected: IPackage[]) => {
        await handleBatchPrint(selected);
    };

    return (
        <RoleGuard allowedRoles={[ROLES.MERCHANT, ROLES.RECEPTIONIST, ROLES.MANAGER]} fallbackPath="/unauthorized">
            <div className="flex flex-col min-h-0 gap-3 h-full">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 pt-1">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }} />
                            <h1 className="text-[22px] font-bold text-white tracking-tight">
                                {isFreelancer ? "My Packages" : "Shipments"}
                            </h1>
                        </div>
                        <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                            {isFreelancer
                                ? "Track and manage all packages you have created."
                                : "Manage shipments and track deliveries for your node."}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {userRole === ROLES.RECEPTIONIST && (
                            <ActionBtn onClick={() => openCreateModal("receptionist")} variant="primary" size="action" label="New Shipment" title="Create new shipment">
                                <Plus className="w-4 h-4" />
                            </ActionBtn>
                        )}
                        {userRole === ROLES.MERCHANT && (
                            <button
                                onClick={() => openCreateModal('merchant')}
                                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95"
                                style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 4px 16px rgba(251,191,36,0.2)" }}
                            >
                                <Plus size={13} />
                                New Package
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                    <StatCard label="Pending" value={stats.pending.toString()} accent="warning" />
                    <StatCard label="In Transit" value={stats.inTransit.toString()} accent="info" />
                    <StatCard label="Delivered" value={stats.delivered.toString()} accent="success" />
                    <StatCard label="Failed / Cancelled" value={stats.failed.toString()} accent="danger" />
                </div>

                {error && <ErrorBaner error={error} setError={setError} />}

                {/* Filters */}
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
                            placeholder="Search tracking code, name, or phone…"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="bg-transparent text-[12.5px] text-white placeholder:text-slate-700 focus:outline-none flex-1 min-w-0"
                        />
                        {search && (
                            <button onClick={() => { setSearch(""); setPage(1); }} className="text-slate-700 hover:text-slate-500">
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    {/* Status filter */}
                    <SelectField
                        label=""
                        value={statusFilter ? String(statusFilter) : ""}
                        onChange={(value) => {
                            setStatusFilter(value ? (value as unknown as PackageStatus) : "");
                            setPage(1);
                        }}
                        placeholder="All Statuses"
                        options={[
                            { value: "", label: "All Statuses" },
                            ...Object.keys(STATUS_LABEL).map((s) => ({
                                value: s,
                                label: STATUS_LABEL[s as PackageStatus],
                            })),
                        ]}
                    />

                    {/* Delivery type filter — freelancer only */}
                    {isFreelancer && (
                        <SelectField
                            label=""
                            value={deliveryTypeFilter}
                            onChange={(value) => {
                                setDeliveryTypeFilter(value as "" | "home" | "branch_pickup");
                                setPage(1);
                            }}
                            placeholder="All Types"
                            options={[
                                { value: "", label: "All Types" },
                                { value: "home", label: "Home Delivery" },
                                { value: "branch_pickup", label: "Branch Pickup" },
                            ]}
                        />
                    )}

                    {/* Sort — freelancer only */}
                    {isFreelancer && (
                        <SelectField
                            label=""
                            value={sortBy}
                            onChange={(value) => setSortBy(value as "createdAt" | "totalPrice" | "status")}
                            options={[
                                { value: "createdAt", label: "Sort: Newest" },
                                { value: "totalPrice", label: "Sort: Price" },
                                { value: "status", label: "Sort: Status" },
                            ]}
                        />
                    )}

                    <span className="text-[11px] text-slate-700 ml-auto hidden sm:block tabular-nums">
                        {shipments.length} shipment{shipments.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Shipment List */}
                <ShipmentList
                    shipments={shipments}
                    loading={loading}
                    onViewDetail={handleViewDetail}
                    onAddClick={() => openCreateModal(mode)}
                    onSwapClick={() => setSwapOpen(true)}
                    userRole={userRole}
                    onCancelClick={() => setCancelOpen(true)}
                    setSelectedShipment={setSelectedShipment}
                    onBatchPrint={handleBatchPrintShipments}
                />

                {/* Pagination */}
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
                <CreateShipmentModal
                    isOpen={createOpen}
                    onClose={() => setCreateOpen(false)}
                    onSubmit={handleCreateSubmit}
                    loading={createLoading}
                    mode={mode}
                />

                {selectedShipmentId && (
                    <ShipmentDetailModal
                        shipmentId={selectedShipmentId}
                        isOpen={detailOpen}
                        onClose={handleDetailClose}
                    />
                )}

                {swapOpen &&
                    <SwapShipmentModal
                        isOpen={swapOpen}
                        onClose={() => setSwapOpen(false)}
                        shipment={selectedShipment!}
                    />
                }

                {/* Cancel confirmation — with optional reason for freelancer */}
                {cancelOpen &&
                    <ConfirmDialog
                        title="Confirm Cancellation"
                        message={
                            isFreelancer
                                ? `Cancel package "${selectedShipment?.trackingNumber}"? This cannot be undone.`
                                : "Are you sure you want to cancel this shipment?"
                        }
                        confirmLabel="Cancel Package"
                        danger={true}
                        loading={cancelLoading}
                        onConfirm={handleCancelShipment}
                        onCancel={() => {
                            setCancelOpen(false);
                            setCancelReason("");
                        }}
                        extra={
                            isFreelancer ? (
                                <input
                                    type="text"
                                    placeholder="Reason (optional)"
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="w-full mt-2 px-3 py-2 rounded-lg text-[12.5px] text-white placeholder:text-slate-600 focus:outline-none"
                                    style={{
                                        background: "rgba(255,255,255,0.04)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                    }}
                                />
                            ) : undefined
                        }
                    />
                }
            </div>
        </RoleGuard>
    );
}