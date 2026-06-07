import api from "@/lib/api";
import { IPaginatedResponse } from "./paginate";
import { ICashier, ICreateCashierBody, IUpdateCashierBody } from "@/types/cashier";

const SUPERVISOR_BASE = "/supervisor";

export async function createCashier(
    branchId: string,
    payload: ICreateCashierBody,
): Promise<{ success: boolean; message: string; data: ICashier }> {
    const { data } = await api.post(`${SUPERVISOR_BASE}/branches/${branchId}/cashiers`, payload);
    return data;
}

export async function updateCashier(
    branchId: string,
    cashierId: string,
    payload: IUpdateCashierBody,
): Promise<{ success: boolean; message: string; data: ICashier }> {
    const { data } = await api.patch(`${SUPERVISOR_BASE}/branches/${branchId}/cashiers/${cashierId}`, payload);
    return data;
}

export async function getBranchCashiers(
    branchId: string,
    params?: any,
): Promise<{ success: boolean; count: number; data: ICashier[] }> {
    const { data } = await api.get(`${SUPERVISOR_BASE}/branches/${branchId}/cashiers`, { params });
    return data;
}

export async function toggleBlockCashier(
    branchId: string,
    cashierId: string,
): Promise<{ success: boolean; message: string; data: { cashier: ICashier; isActive: boolean } }> {
    const { data } = await api.patch(`${SUPERVISOR_BASE}/branches/${branchId}/cashiers/${cashierId}/toggle-block`);
    return data;
}
