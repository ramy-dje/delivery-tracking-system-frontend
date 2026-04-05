import api from "../axios";

// ── Types ──
export interface CreateDelivererPayload {
  email: string;
  phone: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  currentLocation?: {
    type: "Point";
    coordinates: [number, number];
  };
  documents?: {
    contractImage?: string;
    idCardImage?: string;
    licenseImage?: string;
    licenseNumber?: string;
    licenseExpiry?: Date;
    backgroundCheck?: string;
    insuranceImage?: string;
  };
}

export interface UpdateDelivererPayload {
  email?: string;
  phone?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  currentLocation?: {
    type: "Point";
    coordinates: [number, number];
  };
  documents?: {
    contractImage?: string;
    idCardImage?: string;
    licenseImage?: string;
    licenseNumber?: string;
    licenseExpiry?: Date;
    backgroundCheck?: string;
    insuranceImage?: string;
  };
  availabilityStatus?:
    | "available"
    | "on_route"
    | "off_duty"
    | "on_break"
    | "maintenance";
}

// ── Create deliverer ──
export const createDeliverer = async (
  branchId: string,
  data: CreateDelivererPayload
) => {
  const res = await api.post(
    `/api/supervisor/branch/${branchId}/deliverer`,
    data
  );
  return res.data;
};

// ── Update deliverer ──
export const updateDeliverer = async (
  branchId: string,
  delivererId: string,
  data: UpdateDelivererPayload
) => {
  const res = await api.put(
    `/api/supervisor/branch/${branchId}/deliverer/${delivererId}`,
    data
  );
  return res.data;
};

// ── Toggle block/activate deliverer ──
export const toggleBlockDeliverer = async (
  branchId: string,
  delivererId: string
) => {
  const res = await api.patch(
    `/api/supervisor/branch/${branchId}/deliverer/${delivererId}/toggle-block`
  );
  return res.data;
};

// ── Get deliverer by ID ──
export const getDeliverer = async (
  branchId: string,
  delivererId: string
) => {
  const res = await api.get(
    `/api/supervisor/branch/${branchId}/deliverer/${delivererId}`
  );
  return res.data;
};

// ── Get all deliverers in branch ──
export const getMyDeliverers = async (
  branchId: string,
  params?: {
    verificationStatus?: string;
    availabilityStatus?: string;
    isActive?: string;
    search?: string;
  }
) => {
  const res = await api.get(
    `/api/supervisor/branch/${branchId}/deliverers`,
    { params }
  );
  return res.data;
};
