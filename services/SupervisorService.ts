import api from "@/lib/api";

import {
  ICreateSupervisorRequest,
  IUpdateSupervisorRequest,
  ICreateSupervisorResponse,
  IUpdateSupervisorResponse,
  IGetSupervisorsResponse,
  ISingleSupervisorResponse,
  IToggleSupervisorResponse,
  ISupervisorFilter,
} from "@/types/supervisor";

export const createSupervisor = async (
  companyId: string,
  data: ICreateSupervisorRequest
): Promise<ICreateSupervisorResponse> => {
  const response = await api.post<ICreateSupervisorResponse>(
    `/manager/companies/${companyId}/supervisors`,
    data
  );

  return response.data;
};

// --------------------------------------------------
// GET ALL SUPERVISORS
// GET /manager/companies/:companyId/supervisors
// --------------------------------------------------

export const getSupervisors = async (
  companyId: string,
  filters?: ISupervisorFilter
): Promise<IGetSupervisorsResponse> => {
  const response = await api.get<IGetSupervisorsResponse>(
    `/manager/companies/${companyId}/supervisors`,
    { params: filters }
  );

  return response.data;
};

// --------------------------------------------------
// GET SINGLE SUPERVISOR
// (You don't currently have this endpoint)
// --------------------------------------------------

export const getSupervisorById = async (
  companyId: string,
  branchId: string
): Promise<ISingleSupervisorResponse> => {
  const response = await api.get<ISingleSupervisorResponse>(
    `/manager/companies/${companyId}/branches/${branchId}/supervisor`
  );

  return response.data;
};

// --------------------------------------------------
// UPDATE SUPERVISOR
// PATCH /manager/supervisors/:supervisorId
// --------------------------------------------------

export const updateSupervisor = async (
  supervisorId: string,
  data: IUpdateSupervisorRequest
): Promise<IUpdateSupervisorResponse> => {
  const response = await api.patch<IUpdateSupervisorResponse>(
    `/manager/supervisors/${supervisorId}`,
    data
  );

  return response.data;
};

// --------------------------------------------------
// TOGGLE BLOCK
// PATCH /manager/companies/:companyId/supervisors/:supervisorId/toggle-block
// --------------------------------------------------

export const toggleSupervisorStatus = async (
  companyId: string,
  supervisorId: string
): Promise<IToggleSupervisorResponse> => {
  const response = await api.patch<IToggleSupervisorResponse>(
    `/manager/companies/${companyId}/supervisors/${supervisorId}/toggle-block`
  );

  return response.data;
};

// --------------------------------------------------
// COMPANY BRANCHES
// --------------------------------------------------

export const getCompanyBranches = async (
  companyId: string
) => {
  const response = await api.get<{
    success: boolean;
    data: any[];
  }>(
    `/manager/companies/${companyId}/branches`
  );

  return response.data.data;
};