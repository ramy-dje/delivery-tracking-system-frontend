import api from "@/lib/api";
import { IUpsertTariffPayload, ITariffResponse, ITariffEntry } from "@/types/deliveryFee";

export const getDeliveryFees = async (filter?: { search?: string; page?: number; limit?: number }): Promise<ITariffResponse> => {
    const res = await api.get("/manager/tariffs", { params: filter });
    return res.data.data; // The API wraps the response in data: { data: ... }
};

export const getTariffPrice = async (from: number, to: number): Promise<ITariffEntry | null> => {
    const res = await api.get("/manager/tariffs/price", { params: { from, to } });
    if (!res.data.found) return null;
    return res.data.data;
};

export const upsertTariff = async (payload: IUpsertTariffPayload): Promise<ITariffEntry> => {
    const res = await api.post("/manager/tariffs", payload);
    return res.data.data;
};

export const deleteTariff = async (wilayaA: number, wilayaB: number): Promise<void> => {
    await api.delete("/manager/tariffs", { params: { wilayaA, wilayaB } });
};