import api from "@/lib/api";
import { ICreateTransporter, ITransporterResponse } from "@/types/transporter";

export const listTransporters = async (
  companyId: string
): Promise<{ success: boolean; data: ITransporterResponse[] }> => {
  const res = await api.get(`/manager/companies/${companyId}/transporters`);
  return res.data;
};

export const createTransporter = async (
  companyId: string,
  data: ICreateTransporter
): Promise<any> => {
  const res = await api.post(`/manager/companies/${companyId}/transporters`, data);
  return res.data;
};

export const getTransporter = async (
  companyId: string,
  transporterId: string
): Promise<ITransporterResponse> => {
  const res = await api.get(
    `/manager/companies/${companyId}/transporters/${transporterId}`
  );
  return res.data;
};

export const updateTransporter = async (
  companyId: string,
  transporterId: string,
  data: Partial<ICreateTransporter>
): Promise<any> => {
  const res = await api.patch(
    `/manager/companies/${companyId}/transporters/${transporterId}`,
    data
  );
  return res.data;
};

export const toggleBlockTransporter = async (
  companyId: string,
  transporterId: string
): Promise<any> => {
  const res = await api.patch(
    `/manager/companies/${companyId}/transporters/${transporterId}/toggle-block`
  );
  return res.data;
};
