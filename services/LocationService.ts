import api from "@/lib/api";
import { ICommune, IWilaya } from "@/types/common";

export const getWilayas = async (): Promise<IWilaya[]> => {
    const res = await api.get("/locations/wilayas");
    return res.data;
};

export const getCommunes = async (wilayaId: string): Promise<ICommune[]> => {
    const res = await api.get(`/locations/wilayas/${wilayaId}/communes`);
    return res.data;
};

export const getAllCommunes = async (params?: {
    wilayaId?: string;
    wilayaCode?: number;
}): Promise<ICommune[]> => {
    const res = await api.get("/locations/communes", { params });
    return res.data;
};