import api from "@/lib/api";
import { ICreateCompanyInput, ICompanyResponse, ICompany, IUpdateCompanyInput, IMyCompanyResponse } from "@/types/company";

export const createCompany = async (data: ICreateCompanyInput): Promise<ICompanyResponse> => {
  const response = await api.post<ICompanyResponse>("/manager/companies", data);
  return response.data;
};

export const getMyCompany = async (): Promise<IMyCompanyResponse> => {
  const res = await api.get<IMyCompanyResponse>("/manager/companies/my");
  return res.data;
};

export const getAllCompanies = async (): Promise<any> => {
  const res = await api.get<any>("/manager/companies");
  return res.data;
};

export const getCompany = async (companyId: string): Promise<ICompanyResponse> => {
  const res = await api.get<ICompanyResponse>(`/manager/companies/${companyId}`);
  return res.data;
};

export const updateCompany = async (companyId: string, data: IUpdateCompanyInput): Promise<ICompanyResponse> => {
  const res = await api.patch<ICompanyResponse>(`/manager/companies/${companyId}`, data);
  return res.data;
};

export const toggleBlockCompany = async (companyId: string): Promise<ICompanyResponse> => {
  const res = await api.patch<ICompanyResponse>(`/manager/companies/${companyId}/toggle-block`);
  return res.data;
};
