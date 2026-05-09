
import api from "@/lib/api";
import { IPaginatedResponse } from "@/types/paginate";
import {
    IShipmentSummary,
    IShipmentDetail,
    IShipmentSwap,
    ICreatePickupShipment,
    ICreateWalkInShipment,
    IMarkDeliveryFailed,
    IInitiateSwap,
} from "@/types/shipment";

const BASE = "/shipments";

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getShipmentById(id: string): Promise<IShipmentDetail> {
    const { data } = await api.get<IShipmentDetail>(`${BASE}/${id}`);
    return data;
}

export async function getShipmentByTrackingCode(code: string): Promise<IShipmentDetail> {
    const { data } = await api.get<IShipmentDetail>(`${BASE}/track/${code}`);
    return data;
}

export async function getShipmentsByMerchant(merchantId: string): Promise<IPaginatedResponse<IShipmentSummary>> {
    const { data } = await api.get(`${BASE}/by-merchant/${merchantId}`);
    return data;
}

export async function getShipmentsByHub(hubId: string): Promise<IPaginatedResponse<IShipmentSummary>> {
    const { data } = await api.get(`${BASE}/by-hub/${hubId}`);
    return data;
}

// ── Creation ──────────────────────────────────────────────────────────────────

export async function createPickupShipment(payload: ICreatePickupShipment): Promise<IShipmentDetail> {
    const { data } = await api.post<IShipmentDetail>(`${BASE}/pickup`, payload);
    return data;
}

export async function createWalkInShipment(payload: ICreateWalkInShipment): Promise<IShipmentDetail> {
    const { data } = await api.post<IShipmentDetail>(`${BASE}/walk-in`, payload);
    return data;
}

// ── Status transitions ────────────────────────────────────────────────────────

export async function requestPickup(id: string): Promise<void> {
    await api.post(`${BASE}/${id}/request-pickup`);
}

export async function markCollected(id: string, driverId: string): Promise<void> {
    await api.post(`${BASE}/${id}/collect`, null, { params: { driverId } });
}

export async function markReceivedAtHub(id: string, hubId: string): Promise<void> {
    await api.post(`${BASE}/${id}/receive-at-hub`, null, { params: { hubId } });
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

// ── Swap ──────────────────────────────────────────────────────────────────────

export async function initiateSwap(id: string, payload: IInitiateSwap): Promise<IShipmentSwap> {
    const { data } = await api.post<IShipmentSwap>(`${BASE}/${id}/swap`, payload);
    return data;
}

export async function confirmSwap(id: string): Promise<void> {
    await api.post(`${BASE}/${id}/swap/confirm`);
}