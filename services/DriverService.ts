import api from "@/lib/api";
import { IDriverDetails, IDriverFilter, IDriverRegister, IDriverResponse } from "@/types/driver";
import { IPaginatedResponse } from "@/types/paginate";
export const createDriver = async (data: IDriverRegister): Promise<IDriverResponse> => {
    console.log("Creating driver with data:", data.role);
    var res = await api.post<IDriverResponse>("/drivers", data);
    return res.data;
}

export const listDrivers = async (params?: IDriverFilter): Promise<IPaginatedResponse<IDriverResponse>> => {
    console.log("Listing drivers with params:", params);
    var res = await api.get<IPaginatedResponse<IDriverResponse>>("/drivers", {
        params
    });
    return res.data;
}

export const getDriver = async (id: string): Promise<IDriverDetails> => {
    var res = await api.get<IDriverDetails>(`/drivers/${id}`);
    return res.data;
}

export const updateDriverStatus = async (id: string, isActive: boolean) => {
    var res = await api.put(`/drivers/${id}/status`, {}, {
        params: { isActive }
    });
    return res.data;
}

export const AssignVehicleToDriver = async (driverId: string, vehicleId: string) => {
    var res = await api.put(`/drivers/${driverId}/assign-vehicle/${vehicleId}`);
    return res.data;
}

export const UnassignVehicleFromDriver = async (driverId: string, vehicleId: string) => {
    var res = await api.put(`/drivers/${driverId}/unassign-vehicle/${vehicleId}`);
    return res.data;
}
