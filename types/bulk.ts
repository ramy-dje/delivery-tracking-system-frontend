import { DeliveryType } from "@/types/deliveryFee";
import { IShipmentDetail } from "./shipment";

export interface IBulkShipmentRow {
    // Customer fields
    customerFullName: string;
    customerPhone: string;
    communeId: string;          // resolved from commune name lookup
    communeRaw: string;         // original text from CSV, shown in UI
    wilayaRaw: string;          // original text from CSV, shown in UI

    // Shipment fields
    codAmount: number;
    description: string;
    weightKg: number;
    deliveryType: DeliveryType;

    // Validation meta
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