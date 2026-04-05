import api from "../axios";

// ── Types ──
export interface BranchAddress {
  street: string;
  city: string;
  state: string;
  postalCode?: string;
}

export interface BranchLocation {
  type: "Point";
  coordinates: [number, number];
}

export interface BranchOperatingHours {
  open: string;
  close: string;
}

export interface CreateBranchPayload {
  name: string;
  code: string;
  address: BranchAddress;
  location: BranchLocation;
  phone: string;
  email: string;
  operatingHours?: Record<string, BranchOperatingHours>;
  capacityLimit?: number;
}

export interface UpdateBranchPayload {
  name?: string;
  address?: Partial<BranchAddress>;
  location?: BranchLocation;
  phone?: string;
  email?: string;
  operatingHours?: Record<string, BranchOperatingHours>;
  capacityLimit?: number;
}

// ── Create branch ──
export const createBranch = async (
  companyId: string,
  data: CreateBranchPayload
) => {
  const res = await api.post(
    `/api/manager/company/${companyId}/branch`,
    data
  );
  return res.data;
};

// ── Update branch ──
export const updateBranch = async (
  companyId: string,
  branchId: string,
  data: UpdateBranchPayload
) => {
  const res = await api.put(
    `/api/manager/company/${companyId}/branch/${branchId}`,
    data
  );
  return res.data;
};

// ── Toggle block/activate branch ──
export const toggleBlockBranch = async (
  companyId: string,
  branchId: string
) => {
  const res = await api.patch(
    `/api/manager/company/${companyId}/branch/${branchId}/toggle-block`
  );
  return res.data;
};

// ── Get branch by ID ──
export const getBranch = async (companyId: string, branchId: string) => {
  const res = await api.get(
    `/api/manager/company/${companyId}/branch/${branchId}`
  );
  return res.data;
};

// ── Get all branches of my company ──
export const getMyBranches = async (
  companyId: string,
  params?: { status?: string; city?: string; search?: string }
) => {
  const res = await api.get(
    `/api/manager/company/${companyId}/branches`,
    { params }
  );
  return res.data;
};
