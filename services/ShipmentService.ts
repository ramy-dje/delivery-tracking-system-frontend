
import api from "@/lib/api";
import { IBaseFilter, IPaginatedResponse } from "@/types/paginate";
import { ICreateShipment, IMarkDeliveryFailed, IShipmentDetail, IShipmentFilter, IShipmentSummary } from "@/types/shipment";

const BASE = "/shipments";


export async function getShipmentById(id: string): Promise<IShipmentDetail> {
    const { data } = await api.get<IShipmentDetail>(`${BASE}/${id}`);
    return data;
}

export async function getShipmentByTrackingCode(code: string): Promise<IShipmentDetail> {
    const { data } = await api.get<IShipmentDetail>(`${BASE}/track/${code}`);
    return data;
}

// Unified list endpoint with filters (replaces by-merchant / by-hub)
export async function listShipments(filter: IShipmentFilter): Promise<IPaginatedResponse<IShipmentSummary>> {
    const { data } = await api.get<IPaginatedResponse<IShipmentSummary>>(BASE, { params: filter });
    return data;
}

// Convenience wrappers for common filter scenarios
export async function getShipmentsByMerchant(merchantId: string, pagination: IBaseFilter): Promise<IPaginatedResponse<IShipmentSummary>> {
    return listShipments({ merchantId, ...pagination });
}

export async function getShipmentsByHub(hubId: string, pagination: IBaseFilter): Promise<IPaginatedResponse<IShipmentSummary>> {
    return listShipments({ nodeId: hubId, ...pagination });
}

// ── Creation ────────────────────────────────────────────────────────────────

export async function createShipmentByMerchant(payload: ICreateShipment): Promise<IShipmentDetail> {
    const { data } = await api.post<IShipmentDetail>(BASE, payload);
    return data;
}

// Walk-in / drop-at-node: merchantId in URL, not body
export async function createShipmentAtNode(merchantId: string, payload: ICreateShipment): Promise<IShipmentDetail> {
    const { data } = await api.post<IShipmentDetail>(`${BASE}/walk-in/${merchantId}`, payload);
    return data;
}

// Alias for clarity (same backend endpoint)
export const createWalkInShipment = createShipmentAtNode;

// ── Status transitions ─────────────────────────────────────────────────────

// Pickup flow: merchant drops package at branch
export async function markDroppedAtBranch(id: string): Promise<void> {
    await api.post(`${BASE}/${id}/drop-at-branch`);
}

export async function markReadyForTransfer(id: string): Promise<void> {
    await api.post(`${BASE}/${id}/ready-for-transfer`);
}

export async function markReadyForDelivery(id: string): Promise<void> {
    await api.post(`${BASE}/${id}/ready-for-delivery`);
}

export async function markOutForDelivery(id: string, driverId: string): Promise<void> {
    await api.post(`${BASE}/${id}/out-for-delivery`, null, { params: { driverId } });
}

export async function markDelivered(id: string): Promise<void> {
    await api.post(`${BASE}/${id}/deliver`);
}

export async function markDeliveryFailed(id: string, payload: IMarkDeliveryFailed): Promise<void> {
    await api.post(`${BASE}/${id}/delivery-failed`, payload);
}

export async function markRefused(id: string, payload: IMarkDeliveryFailed): Promise<void> {
    await api.post(`${BASE}/${id}/refuse`, payload);
}

export async function initiateRto(id: string): Promise<void> {
    await api.post(`${BASE}/${id}/initiate-rto`);
}

export async function markReturnedToMerchant(id: string): Promise<void> {
    await api.post(`${BASE}/${id}/return-to-merchant`);
}

export async function cancelShipment(id: string): Promise<void> {
    await api.post(`${BASE}/${id}/cancel`);
}
