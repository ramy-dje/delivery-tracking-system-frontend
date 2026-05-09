import api from "@/lib/api";
import { IPaginatedResponse } from "@/types/paginate";
import { IStaffRegister, IStaffResponse } from "@/types/staff";


export const listStaffs = async (
    params: { pageNumber?: number; pageSize?: number; search?: string }
): Promise<IPaginatedResponse<IStaffResponse>> => {
    const res = await api.get(`staffs`, { params });
    return res.data;
};

export const createStaff = async (
    data: IStaffRegister
): Promise<IStaffResponse> => {
    const response = await api.post<IStaffResponse>(
        `staffs`,
        data
    );
    return response.data;
};


export const getStaffById = async (
    staffId: string
): Promise<IStaffResponse> => {
    const res = await api.get<IStaffResponse>(`staffs/${staffId}`);
    return res.data;
};

export const setActivateStaff = async (staffId: string, isActive: boolean) => {
    await api.patch(`staffs/${staffId}/active`, {
        params: {
            isActive
        }
    });
};


