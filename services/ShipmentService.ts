import api from "@/lib/api";
import { IBulkShipmentResult } from "@/types/bulk";
import { IBaseFilter, IPaginatedResponse } from "@/types/paginate";
import {
    ICreateShipment,
    IMarkDeliveryFailed,
    IMarkInTransit,
    IShipmentDetail,
    IShipmentFilter,
    IShipmentSummary,
    ISwapConfirmation,
    ISwapRequest,
    IShipmentSwap,
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

export async function listShipments(
    filter: IShipmentFilter,
): Promise<IPaginatedResponse<IShipmentSummary>> {
    const { data } = await api.get<IPaginatedResponse<IShipmentSummary>>(BASE, { params: filter });
    return data;
}

// Convenience wrappers
export async function getShipmentsByMerchant(
    merchantId: string,
    pagination: IBaseFilter,
): Promise<IPaginatedResponse<IShipmentSummary>> {
    return listShipments({ merchantId, ...pagination });
}

export async function getShipmentsByHub(
    hubId: string,
    pagination: IBaseFilter,
): Promise<IPaginatedResponse<IShipmentSummary>> {
    return listShipments({ nodeId: hubId, ...pagination });
}

// ── Creation ──────────────────────────────────────────────────────────────────

/** Merchant creates a shipment remotely (starts as Pending). */
export async function createShipmentByMerchant(
    payload: ICreateShipment,
): Promise<IShipmentDetail> {
    const { data } = await api.post<IShipmentDetail>(BASE, payload);
    return data;
}
export async function createBulkShipments(
    payload: ICreateShipment[],
): Promise<IBulkShipmentResult[]> {
    const { data } = await api.post<IBulkShipmentResult[]>(
        `${BASE}/bulk`,
        { shipments: payload, }
    );

    return data;
}

/** Receptionist creates a shipment at a branch on behalf of a merchant (starts as ReceivedAtBranch). */
export async function createShipmentAtNode(
    merchantId: string,
    payload: ICreateShipment,
): Promise<IShipmentDetail> {
    const { data } = await api.post<IShipmentDetail>(`${BASE}/walk-in/${merchantId}`, payload);
    return data;
}

export const createWalkInShipment = createShipmentAtNode;

// ── Hub operations ────────────────────────────────────────────────────────────

/** Merchant walks in and drops a Pending shipment at a branch → ReceivedAtBranch. */
export async function markDroppedAtBranch(id: string): Promise<void> {
    await api.post(`${BASE}/${id}/drop-at-branch`);
}

export async function markReadyForTransfer(id: string): Promise<void> {
    await api.post(`${BASE}/${id}/ready-for-transfer`);
}

/** Shipment departs a hub toward the next node → InTransit. */
export async function markInTransit(id: string, payload: IMarkInTransit): Promise<void> {
    await api.post(`${BASE}/${id}/in-transit`, payload);
}

/** Shipment arrives at the destination hub → ReceivedAtDestinationHub. */
export async function markReceivedAtDestinationHub(id: string): Promise<void> {
    await api.post(`${BASE}/${id}/received-at-destination`);
}

export async function markReadyForDelivery(id: string): Promise<void> {
    await api.post(`${BASE}/${id}/ready-for-delivery`);
}

// ── Driver flow ───────────────────────────────────────────────────────────────

/** Assign a driver without changing the shipment status. */
export async function assignDriver(id: string, driverId: string): Promise<void> {
    await api.post(`${BASE}/${id}/assign-driver`, null, { params: { driverId } });
}

export async function markOutForDelivery(id: string, driverId: string): Promise<void> {
    await api.post(`${BASE}/${id}/out-for-delivery`, null, { params: { driverId } });
}

export async function markDelivered(id: string): Promise<void> {
    await api.post(`${BASE}/${id}/deliver`);
}

export async function markDeliveryFailed(
    id: string,
    payload: IMarkDeliveryFailed,
): Promise<void> {
    await api.post(`${BASE}/${id}/delivery-failed`, payload);
}

export async function markRefused(id: string, payload: IMarkDeliveryFailed): Promise<void> {
    await api.post(`${BASE}/${id}/refuse`, payload);
}

// ── RTO flow ──────────────────────────────────────────────────────────────────

export async function initiateRto(id: string): Promise<void> {
    await api.post(`${BASE}/${id}/initiate-rto`);
}

/** Shipment departs a hub on its return journey → InTransitReturn. */
export async function markInTransitReturn(id: string, payload: IMarkInTransit): Promise<void> {
    await api.post(`${BASE}/${id}/in-transit-return`, payload);
}

export async function markReturnedToMerchant(id: string): Promise<void> {
    await api.post(`${BASE}/${id}/return-to-merchant`);
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

export async function cancelShipment(id: string): Promise<void> {
    await api.post(`${BASE}/${id}/cancel`);
}

// ── Swap ──────────────────────────────────────────────────────────────────────

export async function initiateSwap(
    id: string,
    payload: ISwapRequest,
): Promise<IShipmentSwap> {
    const { data } = await api.post<IShipmentSwap>(`${BASE}/${id}/swap`, payload);
    return data;
}

export async function confirmSwap(
    id: string,
    payload: ISwapConfirmation,
): Promise<void> {
    await api.post(`${BASE}/${id}/swap/confirm`, payload);
}