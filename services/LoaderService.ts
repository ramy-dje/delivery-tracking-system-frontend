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
