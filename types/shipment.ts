import api from "@/lib/api";
import { IBaseFilter, IPaginatedResponse } from "@/types/paginate";
import { ICommune } from "./common";
import { DeliveryType } from "./deliveryFee";
import { string } from "zod";

const BASE = "/api/shipments";

// ── Enums (matching .NET Domain.Enums) ──────────────────────────────────────

export enum ShipmentOrigin {
    PickupRequested = 1,
    WalkIn = 2,
}

export enum ShipmentStatus {
    Pending = "Pending",
    ReceivedAtBranch = "ReceivedAtBranch",
    ReceivedAtHub = "ReceivedAtHub",
    ReadyForTransfer = "ReadyForTransfer",
    InTransit = "InTransit",
    ReceivedAtDestinationHub = "ReceivedAtDestinationHub",
    ReadyForDelivery = "ReadyForDelivery",
    OutForDelivery = "OutForDelivery",
    Delivered = "Delivered",
    DeliveryFailed = "DeliveryFailed",
    Refused = "Refused",
    PendingSwap = "PendingSwap",
    RtoPreparing = "RtoPreparing",
    InTransitReturn = "InTransitReturn",
    ReturnedToMerchant = "ReturnedToMerchant",
    Cancelled = "Cancelled",
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

export enum ShipmentEventType {
    StatusChanged = 1,
    PickupRequested = 2,
    Collected = 3,
    ReceivedAtHub = 4,
    TransferStarted = 5,
    TransferCompleted = 6,
    OutForDelivery = 7,
    Delivered = 8,
    DeliveryFailed = 9,
    Refused = 10,
    RtoInitiated = 11,
    Returned = 12,
    Cancelled = 13,
    SwapInitiated = 14,
    SwapConfirmed = 15,
}

export enum EventTriggerSource {
    System = 1,
    Merchant = 2,
    Driver = 3,
    HubWorker = 4,
    Customer = 5,
}

// ── Sub-types (camelCase JSON from .NET PascalCase records) ─────────────────

export interface ICustomer {
    fullName: string;
    phoneNumber: string;
    communeId: string; // Guid as string
    commune?: ICommune;
}

export interface IShipmentEvent {
    id: string; // Guid
    status: ShipmentStatus;
    eventType: ShipmentEventType;
    notes: string | null;
    triggeredByUserId: string | null; // Guid?
    triggerSource: EventTriggerSource;
    hubId: string | null; // Guid?
    manifestId: string | null; // Guid?
    createdAt: string; // ISO DateTime
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

// ── Responses ───────────────────────────────────────────────────────────────

export interface IShipmentSummary {
    id: string; // Guid
    trackingCode: string;
    origin: ShipmentOrigin;
    status: ShipmentStatus;
    deliveryType: DeliveryType;
    merchantId: string;
    merchantBusinessName: string;
    merchantPhoneNumber: string;
    customer: ICustomer;
    destinationHubId: string;
    finalDestinationNodeId: string;
    finalDestinationNodeName: string;
    finalDestinationWilayaName: string;
    finalDestinationWilayaCode: number;
    finalDestinationCommuneName: string;
    codAmount: number; // decimal → number
    deliveryFee: number;
    totalAmount: number;
    deliveryAttempts: number;
    isRto: boolean;
    weightKg: number | null; // decimal? → number?
    hasBeenSwapped: boolean;
    createdAt: string; // ISO DateTime
}

export interface IShipmentDetail extends IShipmentSummary {
    companyId: string; // Guid
    assignedDriverId: string | null; // Guid?
    currentHubId: string | null; // Guid?
    description: string | null;
    weightKg: number | null; // decimal? → number?
    failureReason: FailureReason;
    failureNotes: string | null;
    rtoInitiatedAt: string | null;
    collectedAt: string | null;
    deliveredAt: string | null;
    returnedAt: string | null;
    swap: IShipmentSwap | null;
    events: IShipmentEvent[];
}

// ── Request payloads ────────────────────────────────────────────────────────

export interface ICustomerPayload {
    fullName: string;
    phoneNumber: string;
    communeId: string; // Guid as string
}

export interface ICreateShipment {
    customer: ICustomerPayload;
    codAmount: number;
    description?: string;
    deliveryType: DeliveryType;
    weightKg: number; // Now required per backend CreateShipmentRequestDto
}

export interface IMarkDeliveryFailed {
    reason: FailureReason;
    notes?: string;
}

// ── Filter for ListShipments ────────────────────────────────────────────────

export interface IShipmentFilter extends IBaseFilter {
    merchantId?: string; // Guid?
    nodeId?: string;     // Guid? (hub/branch)
    status?: ShipmentStatus;
}

// ── Queries ─────────────────────────────────────────────────────────────────


// ── Swap (V2 - excluded per request) ───────────────────────────────────────
// Functions like initiateSwap/confirmSwap are intentionally omitted.
// Uncomment and implement when backend swap endpoints are stable.

// ── Display helpers ────────────────────────────────────────────────────────

export const STATUS_LABEL: Record<ShipmentStatus, string> = {
    [ShipmentStatus.Pending]: "Pending",
    [ShipmentStatus.ReceivedAtBranch]: "Received At Branch",
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
    [ShipmentStatus.ReceivedAtBranch]: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24", dot: "#fbbf24" },
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