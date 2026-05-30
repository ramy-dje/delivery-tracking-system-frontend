import api from "@/lib/api";
import { ICreateSupervisor, ISupervisorResponse } from "@/types/supervisor";

export const listSupervisors = async (companyId: string): Promise<{ success: boolean; data: any[] }> => {
  const res = await api.get(`/manager/companies/${companyId}/supervisors`);
  return res.data;
};

export const createSupervisor = async (
  companyId: string,
  data: ICreateSupervisor
): Promise<ISupervisorResponse> => {
  const res = await api.post<ISupervisorResponse>(
    `/manager/companies/${companyId}/supervisors`,
    data
  );
  return res.data;
};

export const updateSupervisor = async (
  supervisorId: string,
  data: Partial<ICreateSupervisor>
): Promise<any> => {
  const res = await api.patch(`/manager/supervisors/${supervisorId}`, data);
  return res.data;
};

export const toggleBlockSupervisor = async (
  companyId: string,
  supervisorId: string
): Promise<any> => {
  const res = await api.patch(
    `/manager/companies/${companyId}/supervisors/${supervisorId}/toggle-block`
  );
  return res.data;
};
