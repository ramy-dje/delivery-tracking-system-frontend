import { IBaseFilter } from "./paginate";

export type VehicleType = 'motorcycle' | 'car' | 'van' | 'small_truck' | 'large_truck';
export type VehicleStatus = 'available' | 'in_use' | 'maintenance' | 'out_of_service' | 'retired';
export type AssignedUserRole = 'transporter' | 'deliverer' | 'driver';

export interface IVehicleDocuments {
    registrationCard?: string;
    insurance?: string;
    insuranceExpiry?: string | Date;
    technicalInspection?: string;
    inspectionExpiry?: string | Date;
}

export interface IVehicleResponse {
    id: string; // From backend _id
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

    // Virtuals
    isAvailable: boolean;
    isAssigned: boolean;
    isHeavy: boolean;
    isLight: boolean;
    documentStatus: 'valid' | 'expiring_soon' | 'expired' | 'missing';
    canTransportFragile: boolean;
    displayName: string;
    category: string;
}

export interface IVehicleDetails extends IVehicleResponse {
    // We can add extra populated details here if the backend returns populated user/branch data
    assignedUserName?: string;
    currentBranchName?: string;
}

export interface IVehicleFilter extends IBaseFilter {
    search?: string;
    type?: VehicleType;
    status?: VehicleStatus;
    minWeight?: number;
    maxWeight?: number;
    supportsFragile?: boolean;
    isAvailable?: boolean;
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
    supportsFragile: boolean;
    notes?: string;
    documents?: IVehicleDocuments;
}