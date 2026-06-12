import { IBaseFilter, IPaginatedResponse } from "@/types/paginate";

// ── Enums (mirror of PackageModel) ────────────────────────────────

export type PackageType = 'document' | 'parcel' | 'fragile' | 'heavy' | 'perishable' | 'electronic' | 'clothing';

export type DeliveryType = 'home' | 'branch_pickup' | 'locker';

export type PackageStatus =
  | 'pending'
  | 'cashier_claimed'
  | 'accepted'
  | 'at_origin_branch'
  | 'manifested'
  | 'in_transit_to_branch'
  | 'at_destination_branch'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed_delivery'
  | 'failed_delivery_attempt'
  | 'rescheduled'
  | 'returned'
  | 'cancelled'
  | 'lost'
  | 'damaged'
  | 'on_hold';

export type PaymentStatus = 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'failed';

export type PaymentMethod = 'cash' | 'card' | 'cod' | 'wallet' | 'bank_transfer';

export type RefundStatus = 'pending' | 'processed' | 'rejected';

export type SenderType = 'freelancer' | 'client';

export type HandlerRole = 'transporter' | 'deliverer' | 'branch_supervisor' | 'client' | 'system' | 'admin' | 'manager' | 'loader' | 'cashier' | 'freelancer';

// ── Sub-types ────────────────────────────────────────────────────────────────

export interface IDimensions {
  length: number;
  width: number;
  height: number;
}

export interface IDestination {
  recipientName: string;
  recipientPhone: string;
  alternativePhone?: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  notes?: string;
}

export interface IIssue {
  type: 'delay' | 'damage' | 'lost' | 'wrong_address' | 'customer_unavailable' | 'traffic' | 'weather' | 'other';
  description: string;
  reportedBy: string | any;
  reportedAt: string;
  resolved: boolean;
  resolvedAt?: string;
  resolution?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface IReturnInfo {
  isReturn: boolean;
  reason?: string;
  returnDate?: string;
  refundAmount?: number;
  refundStatus?: RefundStatus;
  returnNotes?: string;
}

export interface ITrackingEvent {
  status: PackageStatus;
  location?: string;
  branchId?: string | any;
  userId?: string | any;
  notes?: string;
  timestamp: string;
}

export interface IDeliveryOtp {
  code: string;
  expiresAt: string;
  stopIndex: number;
  routeId: string;
  generatedAt: string;
  verified: boolean;
  verifiedAt?: string;
}

export interface ILocation {
  type: 'Point';
  coordinates: [number, number];
}

// ── Models ────────────────────────────────────────────────────────────────

export interface IPackageHistory {
  _id: string;
  packageId: string | any;
  status: PackageStatus;

  location?: ILocation;
  branchId?: string | any;

  handledBy?: string | any;
  handlerName?: string;
  handlerRole?: HandlerRole;

  manifestId?: string | any;

  notes?: string;
  timestamp: string;

  formattedLocation?: string;
  readableStatus?: string;
  timeAgo?: string;
}

export interface IPackage {
  _id: string;
  trackingNumber: string;
  companyId: string | any;

  senderId: string | any;
  senderType: SenderType;
  clientId?: string | any;

  weight: number;
  volume?: number;
  dimensions?: IDimensions;
  isFragile: boolean;
  type: PackageType;
  description?: string;
  declaredValue?: number;
  images?: string[];

  originBranchId: string | any;
  currentBranchId?: string | any;
  destinationBranchId?: string | any;

  destination: IDestination;

  status: PackageStatus;

  deliveryType: DeliveryType;
  deliveryPriority: 'standard' | 'express' | 'same_day';

  totalPrice: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: string;

  assignedTransporterId?: string | any;
  assignedDelivererId?: string | any;
  assignedVehicleId?: string | any;
  currentRouteId?: string | any;

  attemptCount: number;
  lastAttemptDate?: string;
  nextAttemptDate?: string;
  maxAttempts: number;

  issues: IIssue[];
  returnInfo: IReturnInfo;
  trackingHistory: ITrackingEvent[];

  createdAt: string;
  estimatedDeliveryTime?: string;
  deliveredAt?: string;
  updatedAt: string;

  currentManifestId?: string | any;
  claimedByCashierId?: string | any;
  claimedAt?: string;

  // Virtuals
  isDelivered?: boolean;
  isInTransit?: boolean;
  isAtBranch?: boolean;
  needsAttention?: boolean;
  deliveryProgress?: number;
  estimatedTimeRemaining?: number;
  isOverdue?: boolean;
  canBeDelivered?: boolean;
  deliveryOtp?: IDeliveryOtp;
}

// ── Responses ────────────────────────────────────────────────────────────────

export interface IPackageResponse {
  success: boolean;
  message?: string;
  data: IPackage;
}

export interface IPackageListResponse {
  success: boolean;
  data: IPaginatedResponse<IPackage>;
}

export interface IPackageHistoryResponse {
  success: boolean;
  data: IPackageHistory[];
}

// ── Request payloads ──────────────────────────────────────────────────────────

// Update ICreatePackageBody in shipment.ts
export interface ICreatePackageBody {
  freelancerId?: string;

  recipientName: string;
  recipientPhone: string;
  alternativePhone?: string;
  recipientAddress: string;
  recipientCity: string;
  recipientState: string;
  recipientPostalCode?: string;
  deliveryNotes?: string;

  deliveryLat?: number;
  deliveryLon?: number;

  weight: number;
  dimensions?: { length: number; width: number; height: number };
  isFragile?: boolean;
  type: PackageType;
  description?: string;
  declaredValue?: number;

  deliveryType: DeliveryType;
  deliveryPriority?: "standard" | "express" | "same_day";
  destinationBranchId?: string;

  totalPrice: number;
  paymentMethod?: PaymentMethod;

  estimatedDeliveryTime?: string;
  originBranchId: string;
}

export interface ISwapRequest {
  newCustomer: {
    fullName: string;
    phoneNumber: string;
    communeId: string;
  };
}

// ── Filter ────────────────────────────────────────────────────────────────────

export interface IShipmentFilter extends IBaseFilter {
  status?: PackageStatus;
  type?: PackageType;
  paymentStatus?: PaymentStatus;
  deliveryPriority?: string;
  deliveryType?: DeliveryType;
  isFragile?: boolean;
  isReturn?: boolean;
  hasIssues?: boolean;
  startDate?: string;
  endDate?: string;

  companyId?: string;
  clientId?: string;
  originBranchId?: string;
  currentBranchId?: string;
  assignedDelivererId?: string;
}

// ── Display helpers ───────────────────────────────────────────────────────────

export const STATUS_LABEL: Record<PackageStatus, string> = {
  pending: "Pending",
  cashier_claimed: "Cashier Claimed",
  accepted: "Accepted",
  at_origin_branch: "At Origin Branch",
  manifested: "Manifested",
  in_transit_to_branch: "In Transit",
  at_destination_branch: "At Destination Branch",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  failed_delivery: "Failed Delivery",
  failed_delivery_attempt: "Failed Attempt",
  rescheduled: "Rescheduled",
  returned: "Returned",
  cancelled: "Cancelled",
  lost: "Lost",
  damaged: "Damaged",
  on_hold: "On Hold",
};

export const STATUS_COLOR: Record<PackageStatus, { bg: string; text: string; dot: string }> = {
  pending: { bg: "rgba(148,163,184,0.12)", text: "#94a3b8", dot: "#94a3b8" },
  cashier_claimed: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24", dot: "#fbbf24" },
  accepted: { bg: "rgba(96,165,250,0.12)", text: "#60a5fa", dot: "#60a5fa" },
  at_origin_branch: { bg: "rgba(96,165,250,0.12)", text: "#60a5fa", dot: "#60a5fa" },
  manifested: { bg: "rgba(96,165,250,0.12)", text: "#60a5fa", dot: "#60a5fa" },
  in_transit_to_branch: { bg: "rgba(96,165,250,0.12)", text: "#60a5fa", dot: "#60a5fa" },
  at_destination_branch: { bg: "rgba(96,165,250,0.12)", text: "#60a5fa", dot: "#60a5fa" },
  out_for_delivery: { bg: "rgba(52,211,153,0.12)", text: "#34d399", dot: "#34d399" },
  delivered: { bg: "rgba(52,211,153,0.15)", text: "#34d399", dot: "#34d399" },
  failed_delivery: { bg: "rgba(251,113,133,0.12)", text: "#fb7185", dot: "#fb7185" },
  failed_delivery_attempt: { bg: "rgba(251,113,133,0.12)", text: "#fb7185", dot: "#fb7185" },
  rescheduled: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24", dot: "#fbbf24" },
  returned: { bg: "rgba(148,163,184,0.10)", text: "#94a3b8", dot: "#94a3b8" },
  cancelled: { bg: "rgba(148,163,184,0.08)", text: "#64748b", dot: "#64748b" },
  lost: { bg: "rgba(248,113,113,0.12)", text: "#f87171", dot: "#f87171" },
  damaged: { bg: "rgba(248,113,113,0.12)", text: "#f87171", dot: "#f87171" },
  on_hold: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24", dot: "#fbbf24" },
};