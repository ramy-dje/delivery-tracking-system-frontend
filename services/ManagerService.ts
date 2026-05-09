import api from "@/lib/api";
import { ICreateSupervisor, ISupervisorResponse } from "@/types/supervisor";
import {
  IManagerResponse,
  ICreateManagerRequest,
  IAssignManagerRequest,
  IManagerDetail,
  IManagerRoleChangeLog,
} from "@/types/manager";
import { IPaginatedResponse } from "@/types/paginate";


export const getSupervisors = async () => {
  const response = await api.get("/manager/supervisors");
  return response.data;
}

export const createSupervisor = async (
  companyId: string,
  data: ICreateSupervisor
): Promise<ISupervisorResponse> => {
  const response = await api.post<ISupervisorResponse>(
    `/manager/companies/${companyId}/supervisors`,
    data
  );
  return response.data;
};

export const getCompanyBranches = async (companyId: string) => {
  const response = await api.get<{ success: boolean; data: any[] }>(
    `/manager/companies/${companyId}/branches`
  );
  return response.data.data;
};

// --- Managers API -------------------------------------------------

export const createManager = async (
  companyId: string,
  data: ICreateManagerRequest
): Promise<IManagerResponse> => {
  const res = await api.post<IManagerResponse>(`/companies/${companyId}/managers`, data);
  return res.data;
};

export const assignManagerToNode = async (
  companyId: string,
  managerId: string,
  data: IAssignManagerRequest
) => {
  await api.post(`/companies/${companyId}/managers/assign/${managerId}`, data);
};

export const getManagerById = async (
  companyId: string,
  managerId: string
): Promise<IManagerDetail> => {
  const res = await api.get<IManagerDetail>(`/companies/${companyId}/managers/${managerId}`);
  return res.data;
};

export const listManagers = async (
  companyId: string,
  nodeId?: string,
  pageNumber = 1,
  pageSize = 20
): Promise<IPaginatedResponse<IManagerResponse>> => {
  const res = await api.get(`/companies/${companyId}/managers`, { params: { pageNumber, pageSize, nodeId } });
  return res.data;
};

export const listStaff = async (
  companyId: string,
  pageNumber = 1,
  pageSize = 20
): Promise<IPaginatedResponse<IManagerResponse>> => {
  const res = await api.get(`/companies/${companyId}/managers`, { params: { pageNumber, pageSize } });
  return res.data;
};

export const removeStaff = async (companyId: string, userId: string) => {
  await api.delete(`/companies/${companyId}/managers/${userId}`);
};

export const getRoleChangeLogs = async (
  companyId: string,
  managerId?: string | null,
  pageNumber = 1,
  pageSize = 20
): Promise<{ items: IManagerRoleChangeLog[]; totalCount?: number } | IManagerRoleChangeLog[]> => {
  const params: any = { pageNumber, pageSize };
  if (managerId) params.managerId = managerId;
  const res = await api.get(`/companies/${companyId}/managers/role-change-logs`, { params });
  return res.data;
};
