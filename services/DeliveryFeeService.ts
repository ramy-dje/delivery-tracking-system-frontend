import api from "@/lib/api";
import { IUpsertTariffPayload, ITariffResponse, ITariffEntry } from "@/types/deliveryFee";

export const getDeliveryFees = async (filter?: { search?: string; pageNumber?: number; pageSize?: number }): Promise<ITariffResponse> => {
    const res = await api.get("/tariffs", { params: filter });
    console.log("Fetched delivery fees: ", res.data);
    return res.data; // The API wraps the response in data: { data: ... }
};

export const getTariffPrice = async (from: number, to: number): Promise<ITariffEntry | null> => {
    const res = await api.get("/tariffs/price", { params: { from, to } });
    if (!res.data.found) return null;
    return res.data.data;
};

export const upsertTariff = async (payload: IUpsertTariffPayload): Promise<ITariffEntry> => {
    const res = await api.post("/tariffs", payload);
    return res.data.data;
};

export const deleteTariff = async (wilayaA: number, wilayaB: number): Promise<void> => {
    await api.delete("/tariffs", { params: { wilayaA, wilayaB } });
};