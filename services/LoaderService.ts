import api from "@/lib/api";
import { ILoader, ICreateLoaderBody, IUpdateLoaderBody } from "@/types/loader";
import { IManifestsResponse } from "@/types/manifest";

const SUPERVISOR_BASE = "/supervisor";

export async function createLoader(
    branchId: string,
    payload: ICreateLoaderBody,
): Promise<{ success: boolean; message: string; data: ILoader }> {
    const { data } = await api.post(`${SUPERVISOR_BASE}/branches/${branchId}/loaders`, payload);
    return data;
}

export async function updateLoader(
    branchId: string,
    loaderId: string,
    payload: IUpdateLoaderBody,
): Promise<{ success: boolean; message: string; data: ILoader }> {
    const { data } = await api.patch(`${SUPERVISOR_BASE}/branches/${branchId}/loaders/${loaderId}`, payload);
    return data;
}

export async function getBranchLoaders(
    branchId: string,
    params?: any,
): Promise<{ success: boolean; count: number; data: ILoader[]; pagination: { pageNumber: number; pageSize: number; totalPages: number } }> {
    const { data } = await api.get(`${SUPERVISOR_BASE}/branches/${branchId}/loaders`, { params });
    return data;
}

export async function toggleBlockLoader(
    branchId: string,
    loaderId: string,
): Promise<{ success: boolean; message: string; data: { loader: ILoader; isActive: boolean } }> {
    const { data } = await api.patch(`${SUPERVISOR_BASE}/branches/${branchId}/loaders/${loaderId}/toggle-block`);
    return data;
}

export async function deleteLoader(
    branchId: string,
    loaderId: string,
): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`${SUPERVISOR_BASE}/branches/${branchId}/loaders/${loaderId}`);
    return data;
}

// ── Loader Operations (for SORTER role) ──────────────────────────────────────
const LOADER_BASE = "/loader";

// Shift Management
export async function loaderCheckIn(): Promise<any> {
    const { data } = await api.post(`${LOADER_BASE}/check-in`);
    return data;
}

export async function loaderCheckOut(): Promise<any> {
    const { data } = await api.post(`${LOADER_BASE}/check-out`);
    return data;
}

export async function loaderGetMyShift(): Promise<any> {
    const { data } = await api.get(`${LOADER_BASE}/my-shift`);
    return data;
}

export async function loaderGetMyStats(): Promise<any> {
    const { data } = await api.get(`${LOADER_BASE}/my-stats`);
    return data;
}

// Manifest Management
export async function loaderCreateManifest(payload: {
    destinationBranchId: string;
    vehicleId?: string;
    driverId?: string;
    plannedDeparture?: string;
}): Promise<any> {
    const { data } = await api.post(`${LOADER_BASE}/manifests`, payload);
    return data;
}

export async function loaderGetManifestDetail(manifestId: string): Promise<any> {
    const { data } = await api.get(`${LOADER_BASE}/manifests/${manifestId}`);
    return data;
}

export async function loaderGetPackagesToManifest(destinationBranchId?: string): Promise<any> {
    const { data } = await api.get(`${LOADER_BASE}/packages/to-manifest`, { params: { destinationBranchId } });
    return data;
}

export async function loaderGetPackagesToManifestGrouped(): Promise<any> {
    const { data } = await api.get(`${LOADER_BASE}/packages/to-manifest/grouped`);
    return data;
}

export async function listManifests(params?: any): Promise<IManifestsResponse> {
    const { data } = await api.get(`${LOADER_BASE}/manifests`, { params });
    return data;
}

// Origin Branch Operations
export async function loaderScanIn(manifestId: string, trackingNumber: string): Promise<any> {
    const { data } = await api.post(`${LOADER_BASE}/manifests/${manifestId}/scan-in`, { trackingNumber });
    return data;
}

export async function loaderRemovePackage(manifestId: string, packageId: string): Promise<any> {
    const { data } = await api.delete(`${LOADER_BASE}/manifests/${manifestId}/packages/${packageId}`);
    return data;
}

export async function loaderSealManifest(
    manifestId: string,
    sealNumber: string,
    notes?: string,
): Promise<any> {
    const { data } = await api.post(`${LOADER_BASE}/manifests/${manifestId}/seal`, {
        sealNumber,
        notes,
    });
    return data;
}

// In LoaderService.ts
export async function loaderLoadOnTruck(
    manifestId: string,
    data: {
        transporterUserId: string;
        vehicleId?: string;
        estimatedArrival?: string;
        notes?: string;
    }
): Promise<any> {
    const { data: responseData } = await api.post(
        `${LOADER_BASE}/manifests/${manifestId}/load-on-truck`,
        data
    );
    return responseData;
}

export async function loaderDepartManifest(manifestId: string): Promise<any> {
    const { data } = await api.post(`${LOADER_BASE}/manifests/${manifestId}/depart`);
    return data;
}

// Destination Branch Operations
export async function loaderArriveManifest(manifestId: string): Promise<any> {
    const { data } = await api.post(`${LOADER_BASE}/manifests/${manifestId}/arrive`);
    return data;
}

export async function loaderScanOut(manifestId: string, trackingNumber: string): Promise<any> {
    const { data } = await api.post(`${LOADER_BASE}/manifests/${manifestId}/scan-out`, { trackingNumber });
    return data;
}

export async function loaderRemanifestPackage(manifestId: string, payload: { packageId: string; newDestinationBranchId: string; reason: string }): Promise<any> {
    const { data } = await api.post(`${LOADER_BASE}/manifests/${manifestId}/re-manifest`, payload);
    return data;
}

export async function loaderCloseManifest(manifestId: string): Promise<any> {
    const { data } = await api.post(`${LOADER_BASE}/manifests/${manifestId}/close`);
    return data;
}

export async function loaderFlagDiscrepancy(manifestId: string, payload: { packageId: string; reason: string; notes?: string }): Promise<any> {
    const { data } = await api.post(`${LOADER_BASE}/manifests/${manifestId}/discrepancy`, payload);
    return data;
}
