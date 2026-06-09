import api from "@/lib/api";

import {
    IManagerDashboardOverviewResponse,
    ManagerDashboardRange,
} from "@/types/manager-dashboard";
import {
    IManagerAnalyticsResponse,
    ManagerAnalyticsRange,
} from "@/types/manager-analytics";
import { IManagerPerformanceResponse } from "@/types/manager-performance";

export const getManagerDashboardOverview = async (
    range: ManagerDashboardRange = "30d",
    companyId?: string
): Promise<IManagerDashboardOverviewResponse> => {
    const { data } = await api.get("/manager/dashboard/overview", {
        params: {
            range,
            ...(companyId && { companyId }),
        },
    });

    return data;
};

export const getManagerAnalytics = async (
    range: ManagerAnalyticsRange = "30d",
    companyId?: string
): Promise<IManagerAnalyticsResponse> => {
    const { data } = await api.get("/manager/dashboard/analytics", {
        params: {
            range,
            ...(companyId && { companyId }),
        },
    });

    return data;
};

export const getManagerPerformance = async (
    range: ManagerDashboardRange = "30d",
    companyId?: string
): Promise<IManagerPerformanceResponse> => {
    const { data } = await api.get("/manager/dashboard/performance", {
        params: {
            range,
            ...(companyId && { companyId }),
        },
    });

    return data;
};