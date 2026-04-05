import api from "../axios";

// ── Types ──
export interface CreateVehiclePayload {
  companyId: string;
  type: "bike" | "car" | "van" | "truck" | "bus";
  registrationNumber: string;
  brand?: string;
  modelName?: string;
  year?: number;
  color?: string;
  maxWeight: number;
  maxVolume: number;
  supportsFragile?: boolean;
  currentBranchId?: string;
  notes?: string;
}

export interface UpdateVehiclePayload {
  type?: "bike" | "car" | "van" | "truck" | "bus";
  registrationNumber?: string;
  brand?: string;
  modelName?: string;
  year?: number;
  color?: string;
  maxWeight?: number;
  maxVolume?: number;
  supportsFragile?: boolean;
  currentBranchId?: string;
  status?: "available" | "in_use" | "maintenance" | "inactive";
  isAvailable?: boolean;
  notes?: string;
}

// TODO: No backend vehicle routes exist yet.
// These functions are prepared for when vehicle CRUD endpoints are added to the backend.

// ── Create vehicle ──
export const createVehicle = async (
  companyId: string,
  data: CreateVehiclePayload
) => {
  const res = await api.post(
    `/api/manager/company/${companyId}/vehicle`,
    data
  );
  return res.data;
};

// ── Update vehicle ──
export const updateVehicle = async (
  companyId: string,
  vehicleId: string,
  data: UpdateVehiclePayload
) => {
  const res = await api.put(
    `/api/manager/company/${companyId}/vehicle/${vehicleId}`,
    data
  );
  return res.data;
};

// ── Toggle block/activate vehicle ──
export const toggleBlockVehicle = async (
  companyId: string,
  vehicleId: string
) => {
  const res = await api.patch(
    `/api/manager/company/${companyId}/vehicle/${vehicleId}/toggle-block`
  );
  return res.data;
};

// ── Get vehicle by ID ──
export const getVehicle = async (companyId: string, vehicleId: string) => {
  const res = await api.get(
    `/api/manager/company/${companyId}/vehicle/${vehicleId}`
  );
  return res.data;
};

// ── Get all vehicles of company ──
export const getMyVehicles = async (
  companyId: string,
  params?: {
    status?: string;
    type?: string;
    isAvailable?: string;
    search?: string;
  }
) => {
  const res = await api.get(
    `/api/manager/company/${companyId}/vehicles`,
    { params }
  );
  return res.data;
};
