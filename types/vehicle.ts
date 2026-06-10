import { IBaseFilter } from "./paginate";

export type VehicleType =
    | "motorcycle"
    | "car"
    | "van"
    | "small_truck"
    | "large_truck";

export type VehicleStatus =
    | "available"
    | "in_use"
    | "maintenance"
    | "out_of_service"
    | "retired";

export type AssignedUserRole =
    | "transporter"
    | "deliverer";

export interface IVehicleDocuments {
    registrationCard?: string;
    insurance?: string;
    insuranceExpiry?: string;
    technicalInspection?: string;
    inspectionExpiry?: string;
}

export interface ICompanyVehicle {
    _id: string;
    name: string;
    businessType?: string;
    status?: string;
}

export interface IBranchVehicle {
    _id: string;
    name: string;
    code?: string;
    status?: string;
}

export interface IAssignedUser {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
}

export interface IVehicleResponse {
    _id: string;

    companyId: string;
    type: VehicleType;
    registrationNumber: string;

    brand?: string;
    modelName?: string;
    year?: number;
    color?: string;

    maxWeight: number;
    maxVolume: number;
    supportsFragile: boolean;

    documents?: IVehicleDocuments;

    currentBranchId?: string;
    assignedUserId?: string;
    assignedUserRole?: AssignedUserRole;

    status: VehicleStatus;
    notes?: string;

    createdAt: string;
    updatedAt: string;

    // Aggregation fields returned by backend
    isAssigned?: boolean;
    isHeavy?: boolean;
    isLight?: boolean;
    category?: string;

    company?: ICompanyVehicle;
    currentBranch?: IBranchVehicle;
    assignedUser?: IAssignedUser;
}

export interface IVehicleDetails extends IVehicleResponse { }

export interface IVehicleFilter {
    search?: string;
    type?: VehicleType;
    status?: VehicleStatus;
    branchId?: string;
    page?: number;
    limit?: number

    sortBy?:
    | "createdAt"
    | "maxWeight"
    | "maxVolume"
    | "year"
    | "status";

    sortOrder?: "asc" | "desc";
}

export interface ICreateVehicleRequest {
    type: VehicleType;
    registrationNumber: string;

    brand?: string;
    modelName?: string;
    year?: number;
    color?: string;

    maxWeight: number;
    maxVolume: number;

    supportsFragile?: boolean;
    currentBranchId?: string;

    notes?: string;
    documents?: IVehicleDocuments;
}

export interface IUpdateVehicleRequest {
    type?: VehicleType;
    registrationNumber?: string;

    brand?: string;
    modelName?: string;
    year?: number;
    color?: string;

    maxWeight?: number;
    maxVolume?: number;

    supportsFragile?: boolean;
    currentBranchId?: string;

    status?: VehicleStatus;

    notes?: string;
    documents?: IVehicleDocuments;
}

export interface IAssignVehicleRequest {
    assignedUserId: string;
    assignedUserRole: "deliverer" | "transporter";
    branchId: string;
}

export interface IVehicleListResponse {
    success: boolean;
    data: IVehicleResponse[];

    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };

    summary: {
        byStatus: Record<string, number>;
        byType: Record<string, number>;
    };
}