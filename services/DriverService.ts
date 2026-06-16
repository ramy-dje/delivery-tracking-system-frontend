import api from "@/lib/api";
import { IDelivererResponse, ICreateDelivererPayload, IUpdateDelivererPayload } from "@/types/driver";

export const createDriver = async (branchId: string, data: ICreateDelivererPayload): Promise<IDelivererResponse> => {
    const res = await api.post(`/supervisor/branches/${branchId}/deliverers`, data);
    return res.data.data;
}

export const listDrivers = async (branchId: string, params?: { pageSize?: number, pageNumber?: number, search?: string, isActive?: boolean, availabilityStatus?: string, verificationStatus?: string }): Promise<{ count: number, data: IDelivererResponse[], pagination: { pageSize: number, pageNumber: number, totalPages: number } }> => {
    const res = await api.get(`/supervisor/branches/${branchId}/deliverers`, { params });
    return res.data;
}

export const getDriver = async (branchId: string, id: string): Promise<IDelivererResponse> => {
    const res = await api.get(`/supervisor/branches/${branchId}/deliverers/${id}`);
    return res.data.data;
}

export const updateDriverStatus = async (branchId: string, id: string) => {
    const res = await api.patch(`/supervisor/branches/${branchId}/deliverers/${id}/toggle-block`);
    return res.data;
}

export const updateDriver = async (branchId: string, id: string, data: IUpdateDelivererPayload): Promise<IDelivererResponse> => {
    const res = await api.patch(`/supervisor/branches/${branchId}/deliverers/${id}`, data);
    return res.data.data;
}
