import api from "@/lib/api";

import {
    IAssignVehicleRequest,
    ICreateVehicleRequest,
    IUpdateVehicleRequest,
    IVehicleDetails,
    IVehicleFilter,
    IVehicleListResponse,
    IVehicleResponse,
} from "@/types/vehicle";

export const createVehicle = async (
    companyId: string,
    data: ICreateVehicleRequest
): Promise<IVehicleResponse> => {
    const res = await api.post(
        `vehicle/company/${companyId}/vehicle`,
        data
    );

    return res.data.data;
};

export const updateVehicle = async (
    companyId: string,
    vehicleId: string,
    data: IUpdateVehicleRequest
): Promise<IVehicleResponse> => {
    const res = await api.put(
        `vehicle/company/${companyId}/vehicle/${vehicleId}`,
        data
    );

    return res.data.data;
};

export const getVehicle = async (
    companyId: string,
    vehicleId: string
): Promise<IVehicleDetails> => {
    const res = await api.get(
        `vehicle/company/${companyId}/vehicle/${vehicleId}`
    );

    return res.data.vehicle;
};

export const getCompanyVehicles = async (
    companyId: string,
    params?: IVehicleFilter
): Promise<IVehicleListResponse> => {
    const res = await api.get(
        `vehicle/company/${companyId}/vehicles`,
        { params }
    );

    return res.data;
};

export const toggleVehicleStatus = async (
    companyId: string,
    vehicleId: string
) => {
    const res = await api.patch(
        `vehicle/company/${companyId}/vehicle/${vehicleId}/toggle-status`
    );

    return res.data;
};

export const assignVehicle = async (
    companyId: string,
    vehicleId: string,
    data: IAssignVehicleRequest
) => {
    const res = await api.patch(
        `vehicle/company/${companyId}/vehicle/${vehicleId}/assign`,
        data
    );

    return res.data;
};

export const releaseVehicle = async (
    companyId: string,
    vehicleId: string
) => {
    const res = await api.patch(
        `vehicle/company/${companyId}/vehicle/${vehicleId}/release`
    );

    return res.data;
};