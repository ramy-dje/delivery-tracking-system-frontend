import { IBranchResponse } from "./branch";
import { IUser } from "./user";

export type ManifestStatus =
    | "open"
    | "sealed"
    | "loaded"
    | "in_transit"
    | "arrived"
    | "unloading"
    | "closed"
    | "discrepancy"
    | "cancelled";

export type ManifestPriority =
    | "standard"
    | "express"
    | "urgent";

export interface IManifestPackageEntry {
    packageId: string;
    trackingNumber: string;
    weight: number;
    sequence: number;

    scannedInBy: string;
    scannedInAt: string;

    scannedOutBy?: string;
    scannedOutAt?: string;

    remanifestId?: string;
    remanifestAt?: string;

    entryStatus:
    | "in_manifest"
    | "unloaded"
    | "remanifested"
    | "missing"
    | "damaged";

    notes?: string;
}


export interface IManifestDiscrepancy {
    reportedBy: string;
    reportedAt: string;

    expectedCount: number;
    actualCount: number;

    missingPackageIds: string[];
    extraPackageIds: string[];

    notes: string;

    resolvedBy?: string;
    resolvedAt?: string;
    resolution?: string;
}

export interface IManifestSeal {
    sealedBy: string | IUser;

    sealedAt: string;
    sealNumber: string;

    totalWeight: number;
    packageCount: number;

    notes?: string;
}

export interface IManifestTransportLeg {
    vehicleId?: string;

    transporterId: string | IUser;

    assignedAt: string;
    departedAt?: string;
    arrivedAt?: string;
    estimatedArrival?: string;

    notes?: string;
}

export interface IManifest {
    _id: string;

    manifestCode: string;

    originBranch: IBranchResponse;
    destinationBranch: IBranchResponse;

    createdBy: IUser;

    status: ManifestStatus;
    priority: ManifestPriority;

    packageCount: number;
    totalDeclaredWeight: number;

    sealInfo: IManifestSeal | null;
    transportLeg: IManifestTransportLeg | null;

    createdAt: string;

    updatedAt?: string;
}


export interface IManifestsResponse {
    success: boolean;
    data: IManifest[];
    pagination: {
        pageNumber: number;
        pageSize: number;
        totalPages: number;
    };
}


export interface IManifestEvent {
    _id: string;

    manifestId: string;
    manifestCode: string;

    eventType:
    | "created"
    | "package_added"
    | "package_removed"
    | "sealed"
    | "loaded_on_vehicle"
    | "departed"
    | "arrived"
    | "unload_started"
    | "package_unloaded"
    | "package_remanifested"
    | "closed"
    | "discrepancy_flagged"
    | "discrepancy_resolved"
    | "cancelled"
    | "note_added";

    performedBy: string | IUser;

    performerName?: string;
    performerRole?: string;

    branchId?: string;
    packageId?: string;
    packageTrackingNumber?: string;

    previousStatus?: ManifestStatus;
    newStatus?: ManifestStatus;

    notes?: string;

    metadata?: Record<string, any>;

    timestamp: string;
    timeAgo?: string;
}

export interface IManifestDetailResponse {
    success: boolean;
    data: IManifest & {
        events: IManifestEvent[];
    };
}


export interface IManifestDetail {
    _id: string;

    manifestCode: string;

    companyId: string;

    originBranchId: IBranchResponse;
    destinationBranchId: IBranchResponse;

    status: ManifestStatus;
    priority: ManifestPriority;

    createdBy: IUser;

    sealInfo: IManifestSeal | null;
    transportLeg: IManifestTransportLeg | null;

    packages: IManifestPackageEntry[];

    discrepancy: IManifestDiscrepancy | null;

    totalDeclaredWeight: number;
    packageCount: number;

    notes?: string;
    internalReference?: string;

    createdAt: string;
    updatedAt: string;

    sealedAt?: string;
    closedAt?: string;
    departedAt?: string;
    arrivedAt?: string;
    estimatedArrival?: string;

    // Virtuals
    isSealed?: boolean;
    isInTransit?: boolean;
    isClosed?: boolean;
    hasDiscrepancy?: boolean;
    unloadedCount?: number;
    remainingCount?: number;
    durationMinutes?: number;

    events: IManifestEvent[];
}