export interface ITariffEntry {
    wilayaA: number;
    wilayaB: number;
    wilayaAName: string;
    wilayaBName: string;
    stopdesk: number;
    domicile: number;
}

export interface IUpsertTariffPayload {
    wilayaFrom: number;
    wilayaTo: number;
    stopdesk: number;
    domicile: number;
}

export interface ITariffResponse {
    companyId: string;
    entries: ITariffEntry[];
    lastUpdated: string | null;
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
        hasMore: boolean;
    };
}
