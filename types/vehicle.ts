import { IBaseFilter } from "./paginate";

export type VehicleType = "Moto" | "Car" | "Van" | "Truck";

// Must match backend: DeliveryDz.Domain.Enums.VehicleOwnershipType  
export type VehicleOwnershipType = "Company" | "Driver";

export interface IVehicleResponse {
    id: string;
    licensePlate: string;
    brand?: string;
    model?: string;
    capacityKg: number;
    volumeM3: number;
    isRefrigerated: boolean;
    type: VehicleType;
    ownershipType: VehicleOwnershipType;
}

export interface IVehicleAssignment {
    driverId: string;
    driverName: string;
    assignedAt: Date;
}

export interface IVehicleDetails {
    id: string;
    licensePlate: string;
    brand?: string;
    model?: string;
    capacityKg: number;
    volumeM3: number;
    isRefrigerated: boolean;
    type: VehicleType;
    ownershipType: VehicleOwnershipType;
    ownerDriverId?: string;
    ownerDriverName?: string;
    currentAssignment?: IVehicleAssignment | null;
}

export interface IVehicleFilter extends IBaseFilter {
    search?: string;
    type?: VehicleType;
    ownershipType?: VehicleOwnershipType;
    minCapacityKg?: number;
    maxCapacityKg?: number;
    isRefrigerated?: boolean;
    isAvailable?: boolean;
}

export interface ICreateVehicleRequest {
    licensePlate: string;
    capacityKg: number;
    volumeM3: number;
    brand?: string;
    model?: string;
    type: VehicleType;
    ownershipType: VehicleOwnershipType;
    ownerDriverId?: string;
    isRefrigerated: boolean;
}