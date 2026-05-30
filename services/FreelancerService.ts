import api from "@/lib/api";
import { ICreateFreelancer, IFreelancerResponse } from "@/types/freelancer";

export const listFreelancers = async (
  branchId: string
): Promise<{ success: boolean; data: IFreelancerResponse[] }> => {
  const res = await api.get(`/supervisor/branches/${branchId}/freelancers`);
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
