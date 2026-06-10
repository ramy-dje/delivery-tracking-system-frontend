import { DeliveryType } from "@/types/deliveryFee";
import { IShipmentDetail, PackageType } from "./shipment";

export interface IBulkShipmentRow {
    // Recipient info
    customerFullName: string;
    customerPhone: string;
    alternativePhone?: string;
    address: string;
    communeRaw: string;
    wilayaRaw: string;
    postalCode?: string;
    deliveryNotes?: string;

    // Package details
    codAmount: number;
    description?: string;
    weightKg: number;
    packageType: PackageType;
    isFragile: boolean;
    declaredValue?: number;

    // Delivery options
    deliveryType: DeliveryType;
    deliveryPriority: 'standard' | 'express' | 'same_day';
    paymentMethod?: string;
    destinationBranchId?: string;
    estimatedDeliveryTime?: string;

    // Internal fields
    communeId: string;
    dimensions?: { length: number; width: number; height: number };

    // Validation fields
    _rowIndex: number;
    _valid: boolean;
    _errors: string[];
}

export interface IBulkImportResult {
    succeeded: IBulkShipmentRow[];
    failed: { row: IBulkShipmentRow; reason: string }[];
    skipped: IBulkShipmentRow[];
}

export interface IBulkShipmentResult {
    index: number;
    success: boolean;
    shipment?: IShipmentDetail;
    error?: string;
}