import api from "../axios";

// ── Types ──
export interface CreateClientPayload {
  email?: string;
  phone: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  deliveryAddresses?: {
    label?: string;
    street: string;
    city: string;
    state: string;
    isDefault?: boolean;
  }[];
  currentLocation?: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface UpdateClientPayload {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  deliveryAddresses?: {
    label?: string;
    street: string;
    city: string;
    state: string;
    isDefault?: boolean;
  }[];
}

// Note: Clients are auto-created when packages are created via getOrCreateClient.
// These functions use the user model directly for client management.
// Adjust endpoints if you add dedicated client routes on the backend.

// ── Get all clients (placeholder - needs dedicated backend route) ──
// For now, clients are managed through the package creation flow.
// The supervisor controller's getOrCreateClient handles client creation.

// If you need dedicated client CRUD, you'll need to add routes on the backend.
// For now, these are stubs that can be connected once backend client routes exist.

export const getClients = async (
  params?: {
    search?: string;
    status?: string;
  }
) => {
  // TODO: Add a dedicated client listing endpoint on the backend
  // For now this is a placeholder
  const res = await api.get("/api/clients", { params });
  return res.data;
};

export const getClient = async (clientId: string) => {
  const res = await api.get(`/api/clients/${clientId}`);
  return res.data;
};

export const createClient = async (data: CreateClientPayload) => {
  const res = await api.post("/api/clients", data);
  return res.data;
};

export const updateClient = async (
  clientId: string,
  data: UpdateClientPayload
) => {
  const res = await api.put(`/api/clients/${clientId}`, data);
  return res.data;
};

export const toggleBlockClient = async (clientId: string) => {
  const res = await api.patch(`/api/clients/${clientId}/toggle-block`);
  return res.data;
};
