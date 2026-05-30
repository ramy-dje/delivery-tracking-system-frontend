import { IBaseFilter, IPaginatedResponse } from "@/types/paginate";
import { ICommune } from "./common";
import { DeliveryType } from "./deliveryFee";

// ── Enums (mirror of DeliveryDz.Domain.Enums) ────────────────────────────────
// Values match the C# integer assignments exactly.

export enum ShipmentStatus {
    Pending = "Pending",
    ReceivedAtBranch = "ReceivedAtBranch",
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
    // Creation / entry
    ShipmentCreated = 1,
    WalkInDropOff = 2,
    ShipmentCancelled = 3,

    // Scanning
    PackageScanned = 10,
    ManifestScanned = 11,

    // Hub / branch operations
    ReceivedAtBranch = 20,
    ReadyForTransfer = 21,
    SortedIntoManifest = 22,
    DepartedHub = 23,
    InTransit = 24,
    ArrivedAtDestinationHub = 25,
    ReadyForDelivery = 26,

    // Driver / delivery
    OutForDelivery = 40,
    DeliveryAttempted = 41,
    DeliveryFailed = 42,
    DeliveryConfirmed = 43,
    PackageRefused = 44,

    // Swap
    SwapRequested = 50,
    SwapConfirmed = 51,

    // RTO
    RtoInitiated = 60,
    InTransitReturn = 61,
    ReturnedToMerchant = 62,

    // Back office / system
    ManualOverride = 70,
    NoteAdded = 71,
    DriverAssigned = 72,
    LabelPrinted = 73,
}

export enum EventTriggerSource {
    Driver = 1,
    Merchant = 2,
    Hub = 3,
    BackOffice = 4,
    System = 5,
}

// ── Sub-types ────────────────────────────────────────────────────────────────

export interface ICustomer {
    fullName: string;
    phoneNumber: string;
    communeId: string;
    commune?: ICommune;
}

export interface IShipmentEvent {
    id: string;
    status: ShipmentStatus;
    eventType: ShipmentEventType;
    triggerSource: EventTriggerSource;
    triggeredByUserId: string | null;
    notes: string | null;
    hubId: string | null;
    fromNodeId: string | null;
    toNodeId: string | null;
    manifestId: string | null;
    createdAt: string;
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

// ── Responses ────────────────────────────────────────────────────────────────

export interface IShipmentSummary {
    id: string;
    trackingCode: string;
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
    companyName: string;
    companyLogo: string;
    companySubDomain: string;
    codAmount: number;
    deliveryFee: number;
    totalAmount: number;
    deliveryAttempts: number;
    isRto: boolean;
    weightKg: number | null;
    hasBeenSwapped: boolean;
    createdAt: string;
}

export interface IShipmentDetail extends IShipmentSummary {
    companyId: string;
    assignedDriverId: string | null;
    currentNodeId: string | null;
    previousNodeId: string | null;
    nextNodeId: string | null;
    description: string | null;
    failureReason: FailureReason;
    failureNotes: string | null;
    rtoInitiatedAt: string | null;
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

export interface ICreateShipment {
    customer: ICustomerPayload;
    codAmount: number;
    deliveryType: DeliveryType;
    weightKg: number;
    description?: string;
}

export interface IMarkDeliveryFailed {
    reason: FailureReason;
    notes?: string;
}

export interface IMarkInTransit {
    fromNodeId: string;
    toNodeId: string;
    manifestId?: string;
}

export interface ISwapRequest {
    newCustomer: ICustomerPayload;
}

export interface ISwapConfirmation {
    swapId: string;
}

// ── Filter ────────────────────────────────────────────────────────────────────

export interface IShipmentFilter extends IBaseFilter {
    merchantId?: string;
    nodeId?: string;
    status?: ShipmentStatus;
    search?: string;
}

// ── Display helpers ───────────────────────────────────────────────────────────

export const STATUS_LABEL: Record<ShipmentStatus, string> = {
    [ShipmentStatus.Pending]: "Pending",
    [ShipmentStatus.ReceivedAtBranch]: "Received at branch",
    [ShipmentStatus.ReadyForTransfer]: "Ready for transfer",
    [ShipmentStatus.InTransit]: "In transit",
    [ShipmentStatus.ReceivedAtDestinationHub]: "At destination hub",
    [ShipmentStatus.ReadyForDelivery]: "Ready for delivery",
    [ShipmentStatus.OutForDelivery]: "Out for delivery",
    [ShipmentStatus.Delivered]: "Delivered",
    [ShipmentStatus.DeliveryFailed]: "Failed",
    [ShipmentStatus.Refused]: "Refused",
    [ShipmentStatus.PendingSwap]: "Pending swap",
    [ShipmentStatus.RtoPreparing]: "RTO preparing",
    [ShipmentStatus.InTransitReturn]: "Return transit",
    [ShipmentStatus.ReturnedToMerchant]: "Returned",
    [ShipmentStatus.Cancelled]: "Cancelled",
};

export const STATUS_COLOR: Record<ShipmentStatus, { bg: string; text: string; dot: string }> = {
    [ShipmentStatus.Pending]: { bg: "rgba(148,163,184,0.12)", text: "#94a3b8", dot: "#94a3b8" },
    [ShipmentStatus.ReceivedAtBranch]: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24", dot: "#fbbf24" },
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
    [ShipmentStatus.ReturnedToMerchant]: { bg: "rgba(148,163,184,0.10)", text: "#94a3b8", dot: "#94a3b8" },
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

export const EVENT_TYPE_LABEL: Record<ShipmentEventType, string> = {
    [ShipmentEventType.ShipmentCreated]: "Shipment created",
    [ShipmentEventType.WalkInDropOff]: "Walk-in drop-off",
    [ShipmentEventType.ShipmentCancelled]: "Shipment cancelled",
    [ShipmentEventType.PackageScanned]: "Package scanned",
    [ShipmentEventType.ManifestScanned]: "Manifest scanned",
    [ShipmentEventType.ReceivedAtBranch]: "Received at branch",
    [ShipmentEventType.ReadyForTransfer]: "Ready for transfer",
    [ShipmentEventType.SortedIntoManifest]: "Sorted into manifest",
    [ShipmentEventType.DepartedHub]: "Departed hub",
    [ShipmentEventType.InTransit]: "In transit",
    [ShipmentEventType.ArrivedAtDestinationHub]: "Arrived at destination hub",
    [ShipmentEventType.ReadyForDelivery]: "Ready for delivery",
    [ShipmentEventType.OutForDelivery]: "Out for delivery",
    [ShipmentEventType.DeliveryAttempted]: "Delivery attempted",
    [ShipmentEventType.DeliveryFailed]: "Delivery failed",
    [ShipmentEventType.DeliveryConfirmed]: "Delivered",
    [ShipmentEventType.PackageRefused]: "Package refused",
    [ShipmentEventType.SwapRequested]: "Swap requested",
    [ShipmentEventType.SwapConfirmed]: "Swap confirmed",
    [ShipmentEventType.RtoInitiated]: "RTO initiated",
    [ShipmentEventType.InTransitReturn]: "In transit (return)",
    [ShipmentEventType.ReturnedToMerchant]: "Returned to merchant",
    [ShipmentEventType.ManualOverride]: "Manual override",
    [ShipmentEventType.NoteAdded]: "Note added",
    [ShipmentEventType.DriverAssigned]: "Driver assigned",
    [ShipmentEventType.LabelPrinted]: "Label printed",
};

export const TRIGGER_SOURCE_LABEL: Record<EventTriggerSource, string> = {
    [EventTriggerSource.Driver]: "Driver",
    [EventTriggerSource.Merchant]: "Merchant",
    [EventTriggerSource.Hub]: "Hub",
    [EventTriggerSource.BackOffice]: "Back office",
    [EventTriggerSource.System]: "System",
};

// ── Allowed transitions (mirrors Shipment._allowedTransitions exactly) ────────
// Kept as an array of tuples — JS Sets do not deduplicate object/array references,
// so using a Set<[…]> would never match on lookup. Use `canTransition()` instead.

export const ALLOWED_TRANSITIONS: Array<[ShipmentStatus, ShipmentStatus]> = [
    // Entry
    [ShipmentStatus.Pending, ShipmentStatus.ReceivedAtBranch],
    [ShipmentStatus.Pending, ShipmentStatus.Cancelled],

    // Transfer
    [ShipmentStatus.ReceivedAtBranch, ShipmentStatus.ReadyForTransfer],
    [ShipmentStatus.ReadyForTransfer, ShipmentStatus.InTransit],
    [ShipmentStatus.InTransit, ShipmentStatus.ReceivedAtDestinationHub],

    // Delivery
    [ShipmentStatus.ReceivedAtDestinationHub, ShipmentStatus.ReadyForDelivery],
    [ShipmentStatus.ReadyForDelivery, ShipmentStatus.OutForDelivery],
    [ShipmentStatus.OutForDelivery, ShipmentStatus.Delivered],
    [ShipmentStatus.OutForDelivery, ShipmentStatus.DeliveryFailed],
    [ShipmentStatus.OutForDelivery, ShipmentStatus.Refused],

    // Retry
    [ShipmentStatus.DeliveryFailed, ShipmentStatus.OutForDelivery],

    // Swap
    [ShipmentStatus.Pending, ShipmentStatus.PendingSwap],
    [ShipmentStatus.ReceivedAtDestinationHub, ShipmentStatus.PendingSwap],
    [ShipmentStatus.DeliveryFailed, ShipmentStatus.PendingSwap],
    [ShipmentStatus.PendingSwap, ShipmentStatus.ReadyForTransfer],
    [ShipmentStatus.PendingSwap, ShipmentStatus.ReadyForDelivery],

    // RTO
    [ShipmentStatus.DeliveryFailed, ShipmentStatus.RtoPreparing],
    [ShipmentStatus.Refused, ShipmentStatus.RtoPreparing],
    [ShipmentStatus.RtoPreparing, ShipmentStatus.InTransitReturn],
    [ShipmentStatus.InTransitReturn, ShipmentStatus.ReturnedToMerchant],
];

/** Returns true if the given status transition is permitted by the domain rules. */
export function canTransition(from: ShipmentStatus, to: ShipmentStatus): boolean {
    return ALLOWED_TRANSITIONS.some(([f, t]) => f === from && t === to);
}

/** Returns every status that `current` can legally move to. */
export function nextAllowedStatuses(current: ShipmentStatus): ShipmentStatus[] {
    return ALLOWED_TRANSITIONS.filter(([f]) => f === current).map(([, t]) => t);
}