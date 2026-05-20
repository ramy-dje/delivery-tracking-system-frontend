import { IBaseFilter } from "./paginate";

export enum DeliveryType {
    Home = 1,
    StopDesk = 2
}

export interface IDeliveryFeeSummary {
    id: string;
    companyId: string;
    deliveryType: DeliveryType;
    originWilayaName: string;
    destinationWilayaName: string;
    baseFee: number;
    includedWeightKg: number;
    extraKgFee: number;
    isActive: boolean;
    estimatedHours: number;
}

export interface ICreateDeliveryFeePayload {
    deliveryType: DeliveryType;
    originWilayaId: string;
    destinationWilayaId: string;
    baseFee: number;
    includedWeightKg?: number;
    extraKgFee: number;
    estimatedHours?: number;
}

export interface IUpdateDeliveryFeePayload {
    baseFee?: number;
    includedWeightKg?: number;
    extraKgFee?: number;
    isActive?: boolean;
    estimatedHours?: number;
}

export interface IDeliveryFeeFilter extends IBaseFilter {
    deliveryType?: DeliveryType;
    originWilayaId?: string;
    destinationWilayaId?: string;
}
