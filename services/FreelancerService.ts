import api from "@/lib/api";
import { ICreateFreelancer, IFreelancerFilter, IFreelancerResponse } from "@/types/freelancer";

export const listFreelancers = async (
  branchId: string,
  params?: IFreelancerFilter
): Promise<{ success: boolean; pagination?: any; data: IFreelancerResponse[] }> => {
  const res = await api.get(`/supervisor/branches/${branchId}/freelancers`, { params });
  return res.data;
};

export const listAllFreelancers = async (params?: IFreelancerFilter): Promise<{ success: boolean; pagination?: any; data: IFreelancerResponse[] }> => {
  const res = await api.get(`/freelancer`, {
    params,
  });

  return res.data;
};

export const createFreelancer = async (
  branchId: string,
  data: ICreateFreelancer
): Promise<any> => {
  const res = await api.post(`/supervisor/branches/${branchId}/freelancers`, data);
  return res.data;
};

export const updateFreelancer = async (
  branchId: string,
  freelancerId: string,
  data: Partial<ICreateFreelancer>
): Promise<any> => {
  const res = await api.patch(
    `/supervisor/branches/${branchId}/freelancers/${freelancerId}`,
    data
  );
  return res.data;
};

export const toggleBlockFreelancer = async (
  branchId: string,
  freelancerId: string
): Promise<any> => {
  const res = await api.patch(
    `/supervisor/branches/${branchId}/freelancers/${freelancerId}/toggle-block`
  );
  return res.data;
};
