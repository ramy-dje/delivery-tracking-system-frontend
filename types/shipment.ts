

// ── Enums ─────────────────────────────────────────────────────────────────────

import { ICommune } from "./common";

export enum ShipmentOrigin {
    PickupRequested = 1,
    WalkIn = 2,
}

export enum ShipmentStatus {
    Pending = 1,
    PickupRequested = 2,
    DroppedOffAtBranch = 3,
    Collected = 4,
    ReceivedAtHub = 5,
    ReadyForTransfer = 6,
    InTransit = 7,
    ReceivedAtDestinationHub = 8,
    ReadyForDelivery = 9,
    OutForDelivery = 10,
    Delivered = 11,
    DeliveryFailed = 12,
    Refused = 13,
    PendingSwap = 14,
    RtoPreparing = 15,
    InTransitReturn = 16,
    ReturnedToMerchant = 17,
    Cancelled = 18,
}

export enum FailureReason {
    OneTimeFailure = 0,
    AddressIssue = 1,
    CustomerUnavailable = 2,
    WeatherDelay = 3,
    VehicleBreakdown = 4,
    Other = 5,
}

export enum SwapType {
    CustomerOnly = 0,
    FullReroute = 1,
}

// ── Sub-types ─────────────────────────────────────────────────────────────────

export interface ICustomer {
    fullName: string;
    phoneNumber: string;
    communeId: string;
    commune?: ICommune;
}

export interface IShipmentSwap {
    id: string;
    type: SwapType;
    originalCustomer: ICustomer;
    originalDestinationHubId: string | null;
    newCustomer: ICustomer;
    newDestinationHubId: string | null;
    requestedAt: string;
    confirmedAt: string | null;
    isConfirmed: boolean;
}

export interface IShipmentEvent {
    id: string;
    status: ShipmentStatus;
    eventType: number;
    notes: string | null;
    triggeredByUserId: string | null;
    triggerSource: number;
    hubId: string | null;
    manifestId: string | null;
    createdAt: string;
}

// ── Responses ─────────────────────────────────────────────────────────────────

export interface IShipmentSummary {
    id: string;
    trackingCode: string;
    origin: ShipmentOrigin;
    status: ShipmentStatus;
    merchantId: string;
    customer: ICustomer;
    destinationHubId: string;
    codAmount: number;
    deliveryFee: number;
    totalAmount: number;
    deliveryAttempts: number;
    isRto: boolean;
    hasBeenSwapped: boolean;
    createdAt: string;
}

export interface IShipmentDetail extends IShipmentSummary {
    companyId: string;
    assignedDriverId: string | null;
    currentHubId: string | null;
    description: string | null;
    weightKg: number | null;
    failureReason: FailureReason;
    failureNotes: string | null;
    rtoInitiatedAt: string | null;
    collectedAt: string | null;
    deliveredAt: string | null;
    returnedAt: string | null;
    swap: IShipmentSwap | null;
    events: IShipmentEvent[];
}

// ── Request payloads ──────────────────────────────────────────────────────────

export interface ICustomerPayload {
    fullName: string;
    phoneNumber: string;
    communeId: string;
}

export interface ICreatePickupShipment {
    merchantId: string;
    customer: ICustomerPayload;
    destinationHubId: string;
    codAmount: number;
    deliveryFee: number;
    description?: string;
    weightKg?: number;
}

export interface ICreateWalkInShipment {
    merchantId: string;
    customer: ICustomerPayload;
    destinationHubId: string;
    dropOffHubId: string;
    codAmount: number;
    deliveryFee: number;
    description?: string;
    weightKg?: number;
}

export interface IMarkDeliveryFailed {
    reason: FailureReason;
    notes?: string;
}

export interface IInitiateSwap {
    swapType: SwapType;
    newCustomer: ICustomerPayload;
    requestedByMerchantId: string;
    newDestinationHubId?: string;
}

// ── Display helpers ───────────────────────────────────────────────────────────

export const STATUS_LABEL: Record<ShipmentStatus, string> = {
    [ShipmentStatus.Pending]: "Pending",
    [ShipmentStatus.PickupRequested]: "Pickup Requested",
    [ShipmentStatus.DroppedOffAtBranch]: "Dropped Off",
    [ShipmentStatus.Collected]: "Collected",
    [ShipmentStatus.ReceivedAtHub]: "At Hub",
    [ShipmentStatus.ReadyForTransfer]: "Ready for Transfer",
    [ShipmentStatus.InTransit]: "In Transit",
    [ShipmentStatus.ReceivedAtDestinationHub]: "At Dest. Hub",
    [ShipmentStatus.ReadyForDelivery]: "Ready for Delivery",
    [ShipmentStatus.OutForDelivery]: "Out for Delivery",
    [ShipmentStatus.Delivered]: "Delivered",
    [ShipmentStatus.DeliveryFailed]: "Failed",
    [ShipmentStatus.Refused]: "Refused",
    [ShipmentStatus.PendingSwap]: "Pending Swap",
    [ShipmentStatus.RtoPreparing]: "RTO Preparing",
    [ShipmentStatus.InTransitReturn]: "Return Transit",
    [ShipmentStatus.ReturnedToMerchant]: "Returned",
    [ShipmentStatus.Cancelled]: "Cancelled",
};

export const STATUS_COLOR: Record<ShipmentStatus, { bg: string; text: string; dot: string }> = {
    [ShipmentStatus.Pending]: { bg: "rgba(148,163,184,0.12)", text: "#94a3b8", dot: "#94a3b8" },
    [ShipmentStatus.PickupRequested]: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24", dot: "#fbbf24" },
    [ShipmentStatus.DroppedOffAtBranch]: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24", dot: "#fbbf24" },
    [ShipmentStatus.Collected]: { bg: "rgba(167,139,250,0.12)", text: "#a78bfa", dot: "#a78bfa" },
    [ShipmentStatus.ReceivedAtHub]: { bg: "rgba(167,139,250,0.12)", text: "#a78bfa", dot: "#a78bfa" },
    [ShipmentStatus.ReadyForTransfer]: { bg: "rgba(96,165,250,0.12)", text: "#60a5fa", dot: "#60a5fa" },
    [ShipmentStatus.InTransit]: { bg: "rgba(96,165,250,0.12)", text: "#60a5fa", dot: "#60a5fa" },
    [ShipmentStatus.ReceivedAtDestinationHub]: { bg: "rgba(96,165,250,0.12)", text: "#60a5fa", dot: "#60a5fa" },
    [ShipmentStatus.ReadyForDelivery]: { bg: "rgba(52,211,153,0.12)", text: "#34d399", dot: "#34d399" },
    [ShipmentStatus.OutForDelivery]: { bg: "rgba(52,211,153,0.12)", text: "#34d399", dot: "#34d399" },
    [ShipmentStatus.Delivered]: { bg: "rgba(52,211,153,0.15)", text: "#34d399", dot: "#34d399" },
    [ShipmentStatus.DeliveryFailed]: { bg: "rgba(251,113,133,0.12)", text: "#fb7185", dot: "#fb7185" },
    [ShipmentStatus.Refused]: { bg: "rgba(251,113,133,0.12)", text: "#fb7185", dot: "#fb7185" },
    [ShipmentStatus.PendingSwap]: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24", dot: "#fbbf24" },
    [ShipmentStatus.RtoPreparing]: { bg: "rgba(251,113,133,0.08)", text: "#f87171", dot: "#f87171" },
    [ShipmentStatus.InTransitReturn]: { bg: "rgba(251,113,133,0.08)", text: "#f87171", dot: "#f87171" },
    [ShipmentStatus.ReturnedToMerchant]: { bg: "rgba(148,163,184,0.1)", text: "#94a3b8", dot: "#94a3b8" },
    [ShipmentStatus.Cancelled]: { bg: "rgba(148,163,184,0.08)", text: "#64748b", dot: "#64748b" },
};

export const FAILURE_REASON_LABEL: Record<FailureReason, string> = {
    [FailureReason.OneTimeFailure]: "One-time failure",
    [FailureReason.AddressIssue]: "Address issue",
    [FailureReason.CustomerUnavailable]: "Customer unavailable",
    [FailureReason.WeatherDelay]: "Weather delay",
    [FailureReason.VehicleBreakdown]: "Vehicle breakdown",
    [FailureReason.Other]: "Other",
};