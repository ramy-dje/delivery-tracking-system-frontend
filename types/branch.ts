// ─── Enums ────────────────────────────────────────────────────────────────────

export type WeekDay =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

export type BranchType = "local_branch" | "regional_main_hub";
export type BranchStatus = "active" | "inactive" | "maintenance" | "pending";

// ─── Nested shapes ────────────────────────────────────────────────────────────

export interface IOperatingHours {
    open: string;
    close: string;
}

export interface IBranchAddress {
    street: string;
    city: string;
    state: string;
    postalCode?: string;
}

export interface IBranchLocation {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
}

// ─── Response types (what the backend actually returns) ───────────────────────

/**
 * Returned by GET /companies/:companyId/branches  (list)
 * and POST /companies/:companyId/branches (create)
 * companyId is a plain string here (not populated)
 */
export interface IBranchResponse {
    _id: string;
    id: string; // virtual alias for _id if your backend sends it; keep both for safety

    companyId: string;
    name: string;
    code: string;

    address: IBranchAddress;
    location: IBranchLocation;

    phone: string;
    email: string;

    operatingHours: Record<WeekDay, IOperatingHours>;

    capacityLimit?: number;
    currentLoad: number;

    status: BranchStatus;

    createdAt: string;
    updatedAt: string;

    // Virtuals
    isHub: boolean;
    isFull: boolean;
    isOpen: boolean;
    isAvailable: boolean;
    fullAddress: string;
    availableCapacity: number;

    branchType: BranchType;
    parentHubId?: string;
    servesBranches?: string[];
}

export interface IBranchDetails {
    _id: string;
    id: string;

    companyId: {
        _id: string;
        name: string;
        businessType: string;
        status: string;
    };

    name: string;
    code: string;

    address: IBranchAddress;
    location: IBranchLocation;

    phone: string;
    email: string;

    operatingHours: Record<WeekDay, IOperatingHours>;

    capacityLimit?: number;
    currentLoad: number;

    status: BranchStatus;

    createdAt: string;
    updatedAt: string;

    // Virtuals
    isHub: boolean;
    isFull: boolean;
    isOpen: boolean;
    isAvailable: boolean;
    fullAddress: string;
    availableCapacity: number;

    branchType: BranchType;
    parentHubId?: string;
    servesBranches?: string[];
}

// ─── Payload types ────────────────────────────────────────────────────────────

export interface ICreateBranchPayload {
    name: string;
    code: string;
    address: IBranchAddress;
    location: IBranchLocation;
    phone: string;
    email: string;
    operatingHours?: Record<string, IOperatingHours>;
    capacityLimit?: number;
    branchType?: BranchType;
    parentHubId?: string;
    servesBranches?: string[];
}

export interface IUpdateBranchPayload {
    name?: string;
    address?: Partial<IBranchAddress>;
    location?: IBranchLocation;
    phone?: string;
    email?: string;
    operatingHours?: Record<string, IOperatingHours>;
    capacityLimit?: number;
    branchType?: BranchType;
    parentHubId?: string | null;
    servesBranches?: string[];
}