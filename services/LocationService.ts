import api from "@/lib/api";
import { ICommune, ICommuneFilter, IWilaya, IWilayaFilter } from "@/types/common";
import { IBaseFilter } from "@/types/paginate";

export const getWilayas = async (): Promise<{ data: IWilaya[], count: number, success: boolean }> => {
    const res = await api.get("/manager/wilayas");
    console.log("Fetched wilayas: ", res.data);
    return res.data;
};


export const getAllCommunes = async (params: ICommuneFilter): Promise<ICommune[]> => {
    const res = await api.get("/locations/communes", { params });
    return res.data;
};

export const getCommuneById = async (id: string): Promise<ICommune> => {
    console.log("Fetching commune by ID: ", id);
    const res = await api.get(`/locations/communes/${id}`);
    return res.data;
};

export const listDisponibleCommunes = async (params: ICommuneFilter): Promise<ICommune[]> => {
    const res = await api.get("/locations/disponible-communes", { params });
    return res.data;
};