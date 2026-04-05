import api from "../axios";

// ── Types ──
export interface CreateFreelancerPayload {
  email: string;
  phone: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  businessName?: string;
  businessType?: "individual" | "small_business" | "ecommerce" | "other";
  preferredDeliveryType?: "home" | "branch_pickup";
}

export interface UpdateFreelancerPayload {
  email?: string;
  phone?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  businessName?: string;
  businessType?: "individual" | "small_business" | "ecommerce" | "other";
  preferredDeliveryType?: "home" | "branch_pickup";
}

// ── Create freelancer ──
export const createFreelancer = async (
  branchId: string,
  data: CreateFreelancerPayload
) => {
  const res = await api.post(
    `/api/supervisor/branch/${branchId}/freelancer`,
    data
  );
  return res.data;
};

// ── Update freelancer ──
export const updateFreelancer = async (
  branchId: string,
  freelancerId: string,
  data: UpdateFreelancerPayload
) => {
  const res = await api.put(
    `/api/supervisor/branch/${branchId}/freelancer/${freelancerId}`,
    data
  );
  return res.data;
};

// ── Toggle block/activate freelancer ──
export const toggleBlockFreelancer = async (
  branchId: string,
  freelancerId: string
) => {
  const res = await api.patch(
    `/api/supervisor/branch/${branchId}/freelancer/${freelancerId}/toggle-block`
  );
  return res.data;
};

// ── Get freelancer by ID ──
export const getFreelancer = async (
  branchId: string,
  freelancerId: string
) => {
  const res = await api.get(
    `/api/supervisor/branch/${branchId}/freelancer/${freelancerId}`
  );
  return res.data;
};

// ── Get all freelancers in branch ──
export const getMyFreelancers = async (
  branchId: string,
  params?: {
    status?: string;
    businessType?: string;
    search?: string;
  }
) => {
  const res = await api.get(
    `/api/supervisor/branch/${branchId}/freelancers`,
    { params }
  );
  return res.data;
};
