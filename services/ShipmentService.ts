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
const FREELANCER_BASE = "/freelancer";

// ── Freelancer Endpoints (for merchant/freelancer role) ───────────────────────

export async function getFreelancerPackages(params?: {
    status?: string;
    deliveryType?: string;
    paymentStatus?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}): Promise<{ success: boolean; data: IPackage[]; pagination: any; summary?: any }> {
    const { data } = await api.get(`${FREELANCER_BASE}/packages`, { params });
    return data;
}

export async function getFreelancerActivePackages(params?: {
    deliveryType?: string;
    search?: string;
    page?: number;
    limit?: number;
}): Promise<{ success: boolean; data: IPackage[]; pagination: any; summary?: any }> {
    const { data } = await api.get(`${FREELANCER_BASE}/packages/active`, { params });
    return data;
}

export async function getFreelancerDeliveredPackages(params?: {
    fromDate?: string;
    toDate?: string;
    deliveryType?: string;
    paymentStatus?: string;
    search?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}): Promise<{ success: boolean; data: IPackage[]; pagination: any; summary?: any }> {
    const { data } = await api.get(`${FREELANCER_BASE}/packages/delivered`, { params });
    return data;
}

export async function trackFreelancerPackage(packageId: string): Promise<any> {
    const { data } = await api.get(`${FREELANCER_BASE}/packages/${packageId}/track`);
    return data;
}

export async function cancelFreelancerPackage(packageId: string, reason?: string): Promise<any> {
    const { data } = await api.patch(`${FREELANCER_BASE}/packages/${packageId}/cancel`, { reason });
    return data;
}

export async function createFreelancerShipment(payload: ICreatePackageBody): Promise<IPackageResponse> {
    const { data } = await api.post<IPackageResponse>(`${FREELANCER_BASE}/packages`, payload);
    return data;
}

export async function getFreelancerProfile(): Promise<any> {
    const { data } = await api.get(`${FREELANCER_BASE}/me`);
    return data;
}

export async function updateFreelancerProfile(payload: {
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    businessName?: string;
    businessType?: string;
    preferredDeliveryType?: string;
}): Promise<any> {
    const { data } = await api.patch(`${FREELANCER_BASE}/me`, payload);
    return data;
}

// ── Supervisor Endpoints (for receptionist/manager/admin) ────────────────────

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
    const { data } = await api.get<IPackageListResponse>(`${SUPERVISOR_BASE}/packages`, { params: filter });
    return data.data;
}

export async function getShipmentsByBranch(
    branchId: string,
    filter: IShipmentFilter,
): Promise<IPaginatedResponse<IPackage>> {
    return listShipments({ ...filter, originBranchId: branchId });
}

export async function createShipment(
    branchId: string,
    payload: ICreatePackageBody,
): Promise<IPackageResponse> {
    const { data } = await api.post<IPackageResponse>(`${FREELANCER_BASE}/packages`, payload);
    return data;
}

export async function createBulkShipments(
    branchId: string,  // Not used for freelancer, kept for API compatibility
    shipments: ICreatePackageBody[]
): Promise<{ success: boolean; index: number; error?: string }[]> {
    const results = [];

    // Process shipments sequentially to avoid overwhelming the server
    for (let i = 0; i < shipments.length; i++) {
        try {
            // Use the freelancer endpoint (works for both freelancer and supervisor)
            // The backend will use the authenticated user's role
            const { data } = await api.post<IPackageResponse>(`/freelancer/packages`, shipments[i]);
            results.push({ success: true, index: i });
        } catch (e: any) {
            console.error(`Failed to create shipment at index ${i}:`, e.response?.data || e.message);
            results.push({
                success: false,
                index: i,
                error: e.response?.data?.message || e.message || "Unknown error"
            });
        }
    }

    return results;
}

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




export interface IBranchPickupOption {
    id: string;
    name: string;
    code: string;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode?: string;
    };
    phone: string;
    email: string;
    distance: string | null;
}

export async function searchBranchesForPickup(
    city: string,
    limit: number = 20
): Promise<{ success: boolean; data: IBranchPickupOption[]; total: number; message: string }> {
    const { data } = await api.get(`${FREELANCER_BASE}/branches/search`, {
        params: { city, limit },
    });
    return data;
}

// ── Public Endpoints ─────────────────────────────────────────────────────────

export async function trackPublicPackage(trackingNumber: string): Promise<any> {
    try {
        const { data } = await api.get(`/track/${trackingNumber}`);
        return data;
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data; // Return the restricted payload instead of throwing if it's a 403 or 404
        }
        throw error;
    }
}