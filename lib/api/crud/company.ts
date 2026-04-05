import api from "../axios";

// ── Types ──
export interface CompanyPayload {
  name: string;
  businessType: "solo" | "company";
  registrationNumber?: string;
  email?: string;
  phone?: string;
  logo?: { public_id: string; url: string };
  headquarters?: {
    address: string;
    city: string;
    postalCode?: string;
    location: { type: "Point"; coordinates: [number, number] };
  };
  status?: "active" | "inactive" | "suspended";
}

// ── Create company ──
export const createCompany = async (data: CompanyPayload) => {
  const res = await api.post("/api/manager/company", data);
  return res.data;
};

// ── Update company ──
export const updateCompany = async (
  companyId: string,
  data: Partial<CompanyPayload>
) => {
  const res = await api.put(`/api/manager/company/${companyId}`, data);
  return res.data;
};

// ── Toggle block/activate company ──
export const toggleBlockCompany = async (companyId: string) => {
  const res = await api.patch(
    `/api/manager/company/${companyId}/toggle-block`
  );
  return res.data;
};

// ── Get company by ID ──
export const getCompany = async (companyId: string) => {
  const res = await api.get(`/api/manager/company/${companyId}`);
  return res.data;
};

// ── Get my company (current manager) ──
export const getMyCompany = async () => {
  const res = await api.get("/api/manager/my-company");
  return res.data;
};
