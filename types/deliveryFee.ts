export interface ITariffEntry {
    domicile: number;
    stopdesk: number;
    from: {
        id: number;
        name: string;
    },
    to: {
        id: number;
        name: string;
    }
}

export interface IUpsertTariffPayload {
    wilayaFrom: number;
    wilayaTo: number;
    stopdesk: number;
    domicile: number;
}

export interface ITariffResponse {
    companyId: string;
    tariffs: ITariffEntry[];
    success: boolean;
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
        hasMore: boolean;
    };
}

export type DeliveryType = "home" | "branch_pickup";

export const DELIVERY_TYPE_VALUES: DeliveryType[] = ["home", "branch_pickup"];

export const DELIVERY_TYPE_MAP: Record<DeliveryType, string> = {
    home: "Home",
    branch_pickup: "Branch Pickup"
};
