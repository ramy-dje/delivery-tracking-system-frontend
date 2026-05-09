"use client";

import { useCallback, useEffect, useState } from "react";
import { IPaginatedResponse } from "@/types/paginate";
import { getNodeId } from "@/hooks/useAuth";
import { showToast } from "nextjs-toast-notify";
import Pagination from "@/components/commons/Pagination";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import { Plus, Search, X } from "lucide-react";
import StatCard from "@/components/commons/StatCard";
import { IShipmentSummary, ShipmentStatus } from "@/types/shipment";
import {
    getShipmentsByHub,
    createPickupShipment,
    createWalkInShipment,
} from "@/services/ShipmentService";
import { listBranches } from "@/services/BranchService";
import { getAllCommunes } from "@/services/LocationService";
import { getMerchant } from "@/services/MerchantService";
import ShipmentList from "@/components/dashboard/shipments/ShipmentList";
import CreateWalkInModal from "@/components/dashboard/shipments/CreateWalkInModal";
import CreatePickupModal from "@/components/dashboard/shipments/CreatePickupModal";
import ErrorBaner from "@/components/commons/ErrorBaner";
import ShipmentDetailModal from "@/components/dashboard/shipments/ShipmentDetailModal";
import { getApiErrorMessage, parseApiError } from "@/utils/apiErrorHandler";
import { ICommune } from "@/types/common";
import { IBranchResponse } from "@/types/branch";

const PAGE_SIZE = 10;

interface DashboardStats {
    pending: number;
    inTransit: number;
    delivered: number;
    failed: number;
}

export default function ShipmentsPage() {
    const hubId = getNodeId() ?? "";

    const [pagination, setPagination] = useState<IPaginatedResponse<IShipmentSummary> | null>(null);
    const shipments = pagination?.items ?? [];

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"" | ShipmentStatus>("");
    const [page, setPage] = useState(1);

    const [createOpen, setCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);

    // Auxiliary data
    const [communes, setCommunes] = useState<ICommune[]>([]);
    const [hubs, setHubs] = useState<IBranchResponse[]>([]);
    const [merchantId, setMerchantId] = useState<string>("");
    const [stats, setStats] = useState<DashboardStats>({
        pending: 0,
        inTransit: 0,
        delivered: 0,
        failed: 0,
    });

    // ── Fetch shipments ───────────────────────────────────────────────────────

    const fetchShipments = useCallback(async () => {
        if (!hubId) return;

        setLoading(true);
        setError(null);

        try {
            const data = await getShipmentsByHub(hubId);

            setPagination(data);

            console.log("Fetched shipments:", data);

            const items = Array.isArray(data?.items) ? data.items : [];

            const calculatedStats = items.reduce<DashboardStats>(
                (acc, shipment) => {
                    switch (shipment?.status) {
                        case ShipmentStatus.Pending:
                        case ShipmentStatus.PickupRequested:
                            acc.pending++;
                            break;

                        case ShipmentStatus.InTransit:
                        case ShipmentStatus.OutForDelivery:
                            acc.inTransit++;
                            break;

                        case ShipmentStatus.Delivered:
                            acc.delivered++;
                            break;

                        case ShipmentStatus.DeliveryFailed:
                        case ShipmentStatus.Refused:
                        case ShipmentStatus.Cancelled:
                            acc.failed++;
                            break;

                        default:
                            break;
                    }

                    return acc;
                },
                {
                    pending: 0,
                    inTransit: 0,
                    delivered: 0,
                    failed: 0,
                }
            );

            setStats(calculatedStats);
        } catch (e: any) {
            const error = parseApiError(e);

            console.log("Error fetching shipments:", error);

            setError(error.message ?? "Failed to fetch shipments");
        } finally {
            setLoading(false);
        }
    }, [hubId, search, statusFilter, page]);

    // ── Fetch auxiliaries ─────────────────────────────────────────────────────

    const fetchAuxiliaries = useCallback(async () => {
        try {
            const [communesData, branchesData] = await Promise.all([
                getAllCommunes(),
                listBranches({ pageSize: 100, pageNumber: page, }),
            ]);
            setCommunes(communesData);
            setHubs(branchesData.items);

            // Try to get merchant ID from logged in user context
            // If not available, we'll use a placeholder
            const hubName = branchesData.items?.[0]?.name ?? "";
        } catch (e: any) {
            showToast.error("Failed to load locations and hubs");
        }
    }, []);

    useEffect(() => {
        fetchAuxiliaries();
    }, [fetchAuxiliaries]);

    useEffect(() => {
        fetchShipments();
    }, [fetchShipments]);

    // ── Create shipment ───────────────────────────────────────────────────────

    const handleCreatePickup = async (data: any) => {
        setCreateLoading(true);
        try {
            await createPickupShipment(data);
            await fetchShipments();
            showToast.success("Pickup shipment created successfully");
        } catch (e: any) {
            const error = parseApiError(e);
            showToast.error(error.message);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleCreateWalkIn = async (data: any) => {
        setCreateLoading(true);
        try {
            await createWalkInShipment(data);
            await fetchShipments();
            showToast.success("Walk-in shipment created successfully");
        } catch (e: any) {
            const error = parseApiError(e);
            showToast.error(error.message);
        } finally {
            setCreateLoading(false);
        }
    };

    // ── Handlers ───────────────────────────────────────────────────────────

    const handleViewDetail = (shipmentId: string) => {
        setSelectedShipmentId(shipmentId);
        setDetailOpen(true);
    };

    const handleDetailClose = () => {
        setDetailOpen(false);
        setSelectedShipmentId(null);
    };

    return (
        <RoleGuard
            allowedRoles={[ROLES.RECEPTIONIST, ROLES.MANAGER]}
            fallbackPath="/unauthorized"
        >
            <div className="min-h-screen bg-slate-950 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-100">Shipments</h1>
                            <p className="text-slate-400 text-sm mt-1">Manage shipments and track deliveries</p>
                        </div>
                        <button
                            onClick={() => setCreateOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <Plus size={18} />
                            Create Shipment
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            label="Pending"
                            value={stats.pending?.toString()}
                            // icon={Search}
                            // trend={0}
                            accent="warning"
                        />
                        <StatCard
                            label="In Transit"
                            value={stats.inTransit.toString()}
                            // icon={Search}
                            // trend={0}
                            accent="info"
                        />
                        <StatCard
                            label="Delivered"
                            value={stats.delivered.toString()}

                            // icon={Search}
                            // trend={0}
                            accent="success"
                        />
                        <StatCard
                            label="Failed/Refused"
                            value={stats.failed.toString()}
                            // icon={Search}
                            // trend={0}
                            accent="danger"
                        />
                    </div>

                    {error && <ErrorBaner error={error} setError={setError} />}

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-3 items-end">
                        <div className="flex-1">
                            <label className="text-sm font-medium text-slate-300 mb-2 block">
                                Search Tracking Code or Customer
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                                />
                                {search && (
                                    <button
                                        onClick={() => {
                                            setSearch("");
                                            setPage(1);
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">
                                Filter by Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter((e.target.value as any) || "");
                                    setPage(1);
                                }}
                                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                            >
                                <option value="">All Statuses</option>
                                <option value={ShipmentStatus.Pending}>Pending</option>
                                <option value={ShipmentStatus.PickupRequested}>Pickup Requested</option>
                                <option value={ShipmentStatus.InTransit}>In Transit</option>
                                <option value={ShipmentStatus.OutForDelivery}>Out for Delivery</option>
                                <option value={ShipmentStatus.Delivered}>Delivered</option>
                                <option value={ShipmentStatus.DeliveryFailed}>Failed</option>
                                <option value={ShipmentStatus.Refused}>Refused</option>
                                <option value={ShipmentStatus.Cancelled}>Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Shipment List */}
                    <ShipmentList
                        shipments={shipments}
                        loading={loading}
                        onViewDetail={handleViewDetail}
                        onAddClick={() => setCreateOpen(true)}
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
                </div>
            </div>

            {/* Modals */}
            {/* Receptionists create walk-in shipments */}
            <CreateWalkInModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={handleCreateWalkIn}
                loading={createLoading}
                merchantId={merchantId}
            />

            {/* Pickup modal (merchant) - available for merchant workflows elsewhere */}
            <CreatePickupModal
                isOpen={false}
                onClose={() => { }}
                onSubmit={handleCreatePickup}
                loading={false}
                merchantId={merchantId}
            />

            {selectedShipmentId && (
                <ShipmentDetailModal
                    shipmentId={selectedShipmentId}
                    isOpen={detailOpen}
                    onClose={handleDetailClose}
                />
            )}
        </RoleGuard>
    );
}

// Import RoleGuard and ROLES
import RoleGuard from "@/lib/RoleGuard";
import { ROLES } from "@/lib/roles";
