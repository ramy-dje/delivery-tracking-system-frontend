import api from "@/lib/api";
import { ICreateCompanyInput, ICompanyResponse, ICompany } from "@/types/company";


export const createCompany = async (data: ICreateCompanyInput): Promise<ICompanyResponse> => {
  const response = await api.post<ICompanyResponse>("/manager/companies", data);
  return response.data;
};

export const updateCompany = async (
  companyId: string,
  data: Partial<ICompany>
) => {
  const res = await api.put(`/api/manager/company/${companyId}`, data);
  return res.data;
};


export const toggleBlockCompany = async (companyId: string) => {
  const res = await api.patch(
    `/api/manager/company/${companyId}/toggle-block`
  );
  return res.data;
};

// ── Get company by ID ──
export const getCompany = async (companyId: string) => {
  const res = await api.get(`/api/manager/company/${companyId}`);
  return res.data;
};

// ── Get my company (current manager) ──
export const getMyCompany = async () => {
  const res = await api.get("/api/manager/my-company");
  return res.data;
};
