import api from "../axios";

// ── Types ──
export interface CreateManagerPayload {
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  permissions?: string[];
}

export interface UpdateManagerPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  permissions?: string[];
  isActive?: boolean;
}

// TODO: No dedicated backend manager CRUD routes exist yet.
// Manager data is currently part of the company setup flow.
// These functions are prepared for when manager CRUD endpoints are added to the backend.

// ── Get my company (returns manager profile as well) ──
export const getManagerProfile = async () => {
  const res = await api.get("/api/manager/my-company");
  return res.data;
};
