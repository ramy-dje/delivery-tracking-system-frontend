import api from "@/lib/api";
import { ICreateVehicleRequest, IVehicleDetails, IVehicleFilter, IVehicleResponse } from "@/types/vehicle";
import { IPaginatedResponse } from "@/types/paginate";

export const createVehicle = async (data: ICreateVehicleRequest): Promise<IVehicleResponse> => {
    const res = await api.post<IVehicleResponse>("/vehicles", data);
    return res.data;
};

export const listVehicles = async (params?: IVehicleFilter): Promise<IPaginatedResponse<IVehicleResponse>> => {
    const res = await api.get<IPaginatedResponse<IVehicleResponse>>("/vehicles", { params });
    return res.data;
};

export const getVehicle = async (id: string): Promise<IVehicleDetails> => {
    const res = await api.get<IVehicleDetails>(`/vehicles/${id}`);
    return res.data;
};