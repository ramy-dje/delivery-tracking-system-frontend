import api from "@/lib/api";
import { ICreateCompanyInput, ICompanyResponse, ICompany } from "@/types/company";

export const createCompany = async (data: ICreateCompanyInput): Promise<ICompanyResponse> => {
  const response = await api.post<ICompanyResponse>("/manager/companies", data);
  return response.data;
};

export const getMyCompany = async (): Promise<{ success: boolean; data: ICompany }> => {
  const res = await api.get("/manager/companies/my");
  return res.data;
};

export const getCompany = async (companyId: string): Promise<{ success: boolean; data: ICompany }> => {
  const res = await api.get(`/manager/companies/${companyId}`);
  return res.data;
};

export const updateCompany = async (companyId: string, data: Partial<ICompany>): Promise<any> => {
  const res = await api.patch(`/manager/companies/${companyId}`, data);
  return res.data;
};

export const toggleBlockCompany = async (companyId: string): Promise<any> => {
  const res = await api.patch(`/manager/companies/${companyId}/toggle-block`);
  return res.data;
};
