import api from "@/lib/api";
import { ICreateDeliveryFeePayload, IDeliveryFeeFilter, IDeliveryFeeSummary, IUpdateDeliveryFeePayload } from "@/types/deliveryFee";
import { IPaginatedResponse } from "@/types/paginate";

export const createDeliveryFee = async (payload: ICreateDeliveryFeePayload): Promise<IDeliveryFeeSummary> => {
    const res = await api.post("/delivery-fees", payload);
    return res.data;
}

export const updateDeliveryFee = async (id: string, payload: IUpdateDeliveryFeePayload): Promise<IDeliveryFeeSummary> => {
    const res = await api.put(`/delivery-fees/${id}`, payload);
    return res.data;
}

export const getDeliveryFees = async (filter: IDeliveryFeeFilter): Promise<IPaginatedResponse<IDeliveryFeeSummary>> => {
    const res = await api.get("/delivery-fees", { params: filter });
    return res.data;
}

export const getDeliveryFeeById = async (id: string): Promise<IDeliveryFeeSummary> => {
    const res = await api.get(`/delivery-fees/${id}`);
    return res.data;
}