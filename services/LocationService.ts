import api from "@/lib/api";
import { ICommune, ICommuneFilter, IWilaya, IWilayaFilter } from "@/types/common";

export const getWilayas = async (params?: IWilayaFilter): Promise<IWilaya[]> => {
    const res = await api.get("/locations/wilayas", { params });
    return res.data;
};


export const getAllCommunes = async (params: ICommuneFilter): Promise<ICommune[]> => {
    const res = await api.get("/locations/communes", { params });
    return res.data;
};