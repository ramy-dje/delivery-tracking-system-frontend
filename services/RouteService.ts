import api from "@/lib/api";
import { IRoute } from "@/types/route";

export const listRoutes = async (branchId: string): Promise<{ success: boolean; data: IRoute[] }> => {
  const res = await api.get(`/supervisor/branches/${branchId}/routes`);
  return res.data;
};

export const getAllRoutes = async (): Promise<{ success: boolean; data: IRoute[] }> => {
  const res = await api.get(`/manager/routes`);
  return res.data;
};

export const listActiveRoutes = async (branchId: string): Promise<{ success: boolean; data: IRoute[] }> => {
  const res = await api.get(`/supervisor/branches/${branchId}/routes/active`);
  return res.data;
};

export const getRoute = async (branchId: string, routeId: string): Promise<{ success: boolean; data: IRoute }> => {
  const res = await api.get(`/supervisor/branches/${branchId}/routes/${routeId}`);
  return res.data;
};

export const updateRoute = async (branchId: string, routeId: string, data: Partial<IRoute>): Promise<any> => {
  const res = await api.patch(`/supervisor/branches/${branchId}/routes/${routeId}`, data);
  return res.data;
};

export const toggleCancelRoute = async (branchId: string, routeId: string): Promise<any> => {
  const res = await api.patch(`/supervisor/branches/${branchId}/routes/${routeId}/toggle-cancel`);
  return res.data;
};
