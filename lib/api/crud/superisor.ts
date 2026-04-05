import api from "../axios";

// ── Types ──
export interface CreateSupervisorPayload {
  branchId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  permissions?: string[];
  workSchedule?: Record<
    string,
    { start: string; end: string; dayOff: boolean }
  >;
}

export interface UpdateSupervisorPayload {
  permissions?: string[];
  workSchedule?: Record<
    string,
    { start: string; end: string; dayOff: boolean }
  >;
  isActive?: boolean;
  userData?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    imageUrl?: string;
  };
}

// ── Create supervisor ──
export const createSupervisor = async (
  companyId: string,
  data: CreateSupervisorPayload
) => {
  const res = await api.post(
    `/api/manager/company/${companyId}/supervisor`,
    data
  );
  return res.data;
};

// ── Update supervisor ──
export const updateSupervisor = async (
  supervisorId: string,
  data: UpdateSupervisorPayload
) => {
  const res = await api.put(`/api/manager/supervisor/${supervisorId}`, data);
  return res.data;
};

// ── Toggle block/activate supervisor ──
export const toggleBlockSupervisor = async (
  companyId: string,
  supervisorId: string
) => {
  const res = await api.patch(
    `/api/manager/company/${companyId}/supervisor/${supervisorId}/toggle-block`
  );
  return res.data;
};

// ── Get branch supervisor ──
export const getBranchSupervisor = async (
  companyId: string,
  branchId: string
) => {
  const res = await api.get(
    `/api/manager/company/${companyId}/branch/${branchId}/supervisor`
  );
  return res.data;
};

// ── Get all supervisors of my company ──
export const getMySupervisors = async (
  companyId: string,
  params?: { search?: string }
) => {
  const res = await api.get(
    `/api/manager/company/${companyId}/supervisors`,
    { params }
  );
  return res.data;
};
