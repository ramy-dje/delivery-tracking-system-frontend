import api from "@/lib/api";
import { IPaginatedResponse } from "@/types/paginate";
import {
    IPackage,
    IPackageResponse,
    IPackageListResponse,
    IPackageHistoryResponse,
    ICreatePackageBody,
    IShipmentFilter,
    ISwapRequest,
} from "@/types/shipment";

const SUPERVISOR_BASE = "/supervisor";

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getShipmentById(branchId: string, packageId: string): Promise<IPackageResponse> {
    const { data } = await api.get<IPackageResponse>(`${SUPERVISOR_BASE}/branches/${branchId}/packages/${packageId}`);
    return data;
}

export async function getPackageHistory(branchId: string, packageId: string): Promise<IPackageHistoryResponse> {
    const { data } = await api.get<IPackageHistoryResponse>(`${SUPERVISOR_BASE}/branches/${branchId}/packages/${packageId}/history`);
    return data;
}

export async function listShipments(
    filter: IShipmentFilter,
): Promise<IPaginatedResponse<IPackage>> {
    // Note: The backend uses /supervisor/packages for paginated listing
    const { data } = await api.get<IPackageListResponse>(`${SUPERVISOR_BASE}/packages`, { params: filter });
    return data.data; // Returning IPaginatedResponse<IPackage> directly
}

export async function getShipmentsByBranch(
    branchId: string,
    filter: IShipmentFilter,
): Promise<IPaginatedResponse<IPackage>> {
    // Overriding the branchId filter just in case
    return listShipments({ ...filter, originBranchId: branchId });
}

// ── Creation ──────────────────────────────────────────────────────────────────

export async function createShipment(
    branchId: string,
    payload: ICreatePackageBody,
): Promise<IPackageResponse> {
    const { data } = await api.post<IPackageResponse>(`${SUPERVISOR_BASE}/branches/${branchId}/packages`, payload);
    return data;
}

export async function createBulkShipments(
    branchId: string,
    shipments: ICreatePackageBody[]
): Promise<{ success: boolean; index: number; error?: string }[]> {
    const results = [];
    for (let i = 0; i < shipments.length; i++) {
        try {
            await createShipment(branchId, shipments[i]);
            results.push({ success: true, index: i });
        } catch (e: any) {
            results.push({ success: false, index: i, error: e.response?.data?.message || e.message });
        }
    }
    return results;
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

export async function cancelShipment(branchId: string, packageId: string): Promise<IPackageResponse> {
    const { data } = await api.patch<IPackageResponse>(`${SUPERVISOR_BASE}/branches/${branchId}/packages/${packageId}/cancel`);
    return data;
}

export async function markDroppedAtBranch(branchId: string, packagesIds: string[]): Promise<any> {
    const { data } = await api.patch(`${SUPERVISOR_BASE}/branches/${branchId}/packages/drop`, { packagesIds });
    return data;
}

export async function initiateSwap(branchId: string, packageId: string, payload: ISwapRequest): Promise<any> {
    const { data } = await api.patch(`${SUPERVISOR_BASE}/branches/${branchId}/packages/${packageId}/swap`, payload);
    return data;
}