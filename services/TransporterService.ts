import api from "@/lib/api";
import { ICreateTransporter, ITransporterResponse } from "@/types/transporter";

export const listTransporters = async (
  companyId: string,
  filters?: { pageNumber?: number; pageSize?: number }
): Promise<{ success: boolean; data: ITransporterResponse[]; pagination?: { pageNumber: number; pageSize: number; totalPages: number } }> => {
  const res = await api.get(`/manager/companies/${companyId}/transporters`, { params: filters });
  const mappedData = res.data.data.map((t: any) => ({
    id: t._id,
    userId: t.userId?._id || "",
    fullName: `${t.userId?.firstName || ""} ${t.userId?.lastName || ""}`.trim(),
    email: t.userId?.email || "",
    phone: t.userId?.phone || "",
    role: t.userId?.role || "transporter",
    isActive: t.isActive !== false,
    isOnline: t.isOnline || false,
  }));
  return { ...res.data, data: mappedData };
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
  const t = res.data.data;
  return {
    id: t._id,
    fullName: `${t.userId?.firstName || ""} ${t.userId?.lastName || ""}`.trim(),
    email: t.userId?.email || "",
    phone: t.userId?.phone || "",
    role: t.userId?.role || "transporter",
    isActive: t.isActive !== false,
    isOnline: t.isOnline || false,
  };
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
