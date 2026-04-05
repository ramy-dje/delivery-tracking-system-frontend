import api from "../axios";

// ── Types ──
export interface CreateTransporterPayload {
  email: string;
  phone: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
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

export interface UpdateTransporterPayload {
  email?: string;
  phone?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
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
  currentBranchId?: string;
}

// ── Create transporter ──
export const createTransporter = async (
  companyId: string,
  data: CreateTransporterPayload
) => {
  const res = await api.post(
    `/api/supervisor/company/${companyId}/transporter`,
    data
  );
  return res.data;
};

// ── Update transporter ──
export const updateTransporter = async (
  companyId: string,
  transporterId: string,
  data: UpdateTransporterPayload
) => {
  const res = await api.put(
    `/api/supervisor/company/${companyId}/transporter/${transporterId}`,
    data
  );
  return res.data;
};

// ── Toggle block/activate transporter ──
export const toggleBlockTransporter = async (
  companyId: string,
  transporterId: string
) => {
  const res = await api.patch(
    `/api/supervisor/company/${companyId}/transporter/${transporterId}/toggle-block`
  );
  return res.data;
};

// ── Get transporter by ID ──
export const getTransporter = async (
  companyId: string,
  transporterId: string
) => {
  const res = await api.get(
    `/api/supervisor/company/${companyId}/transporter/${transporterId}`
  );
  return res.data;
};

// ── Get all transporters of company ──
export const getMyTransporters = async (
  companyId: string,
  params?: {
    verificationStatus?: string;
    availabilityStatus?: string;
    isActive?: string;
    currentBranchId?: string;
    search?: string;
  }
) => {
  const res = await api.get(
    `/api/supervisor/company/${companyId}/transporters`,
    { params }
  );
  return res.data;
};
