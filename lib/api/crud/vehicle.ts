import api from "../axios";

// ── Types ──
export interface CreateVehiclePayload {
  type: "motorcycle" | "car" | "van" | "small_truck" | "large_truck";
  registrationNumber: string;
  brand?: string;
  modelName?: string;
  year?: number;
  color?: string;
  maxWeight: number;
  maxVolume: number;
  supportsFragile?: boolean;
  documents?: {
    registrationCard?: string;
    insurance?: string;
    insuranceExpiry?: Date;
    technicalInspection?: string;
    inspectionExpiry?: Date;
  };
  currentBranchId?: string;
  notes?: string;
}

export interface UpdateVehiclePayload {
  type?: "motorcycle" | "car" | "van" | "small_truck" | "large_truck";
  registrationNumber?: string;
  brand?: string;
  modelName?: string;
  year?: number;
  color?: string;
  maxWeight?: number;
  maxVolume?: number;
  supportsFragile?: boolean;
  currentBranchId?: string;
  status?: "available" | "in_use" | "maintenance" | "out_of_service" | "retired";
  notes?: string;
}

// ── Create vehicle ──
export const createVehicle = async (
  companyId: string,
  data: CreateVehiclePayload
) => {
  const res = await api.post(
    `/api/vehicle/company/${companyId}/vehicle`,
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
    `/api/vehicle/company/${companyId}/vehicle/${vehicleId}`,
    data
  );
  return res.data;
};

// ── Toggle vehicle status (available ↔ out_of_service) ──
export const toggleBlockVehicle = async (
  companyId: string,
  vehicleId: string
) => {
  const res = await api.patch(
    `/api/vehicle/company/${companyId}/vehicle/${vehicleId}/toggle-status`
  );
  return res.data;
};

// ── Get vehicle by ID ──
export const getVehicle = async (companyId: string, vehicleId: string) => {
  const res = await api.get(
    `/api/vehicle/company/${companyId}/vehicle/${vehicleId}`
  );
  return res.data;
};

// ── Get all vehicles of company ──
export const getMyVehicles = async (
  companyId: string,
  params?: {
    status?: string;
    type?: string;
    currentBranchId?: string;
    isAvailable?: string;
    search?: string;
  }
) => {
  const res = await api.get(
    `/api/vehicle/company/${companyId}/vehicles`,
    { params }
  );
  return res.data;
};

// ── Assign vehicle to a user ──
export const assignVehicle = async (
  companyId: string,
  vehicleId: string,
  data: { assignedUserId: string; assignedUserRole?: string; branchId: string }
) => {
  const res = await api.patch(
    `/api/vehicle/company/${companyId}/vehicle/${vehicleId}/assign`,
    data
  );
  return res.data;
};

// ── Release vehicle (unassign) ──
export const releaseVehicle = async (
  companyId: string,
  vehicleId: string
) => {
  const res = await api.patch(
    `/api/vehicle/company/${companyId}/vehicle/${vehicleId}/release`
  );
  return res.data;
};
