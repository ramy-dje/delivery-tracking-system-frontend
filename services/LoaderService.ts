import api from "@/lib/api";
import { ILoader, ICreateLoaderBody, IUpdateLoaderBody } from "@/types/loader";

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
): Promise<{ success: boolean; count: number; data: ILoader[] }> {
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

// Origin Branch Operations
export async function loaderScanIn(manifestId: string, packageId: string): Promise<any> {
    const { data } = await api.post(`${LOADER_BASE}/manifests/${manifestId}/scan-in`, { packageId });
    return data;
}

export async function loaderRemovePackage(manifestId: string, packageId: string): Promise<any> {
    const { data } = await api.delete(`${LOADER_BASE}/manifests/${manifestId}/packages/${packageId}`);
    return data;
}

export async function loaderSealManifest(manifestId: string): Promise<any> {
    const { data } = await api.post(`${LOADER_BASE}/manifests/${manifestId}/seal`);
    return data;
}

export async function loaderLoadOnTruck(manifestId: string): Promise<any> {
    const { data } = await api.post(`${LOADER_BASE}/manifests/${manifestId}/load-on-truck`);
    return data;
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

export async function loaderScanOut(manifestId: string, packageId: string): Promise<any> {
    const { data } = await api.post(`${LOADER_BASE}/manifests/${manifestId}/scan-out`, { packageId });
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
