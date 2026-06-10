export type ManagerDashboardRange =
    | "7d"
    | "30d"
    | "90d"
    | "12m";

export interface IManagerDashboardPackageSummary {
    totalToday: number;
    totalThisMonth: number;
    delivered: number;
    pending: number;
    returned: number;
    cancelled: number;
}

export interface IManagerDashboardRevenueSummary {
    today: number;
    todayFormatted: string;

    month: number;
    monthFormatted: string;

    outstanding: number;
    outstandingFormatted: string;

    collectedCash: number;
    collectedCashFormatted: string;
}

export interface IManagerDashboardOperationsSummary {
    activeBranches: number;
    activeDeliverers: number;
    activeTransporters: number;
    packagesInTransit: number;
}

export interface IManagerDashboardSummary {
    packages: IManagerDashboardPackageSummary;
    revenue: IManagerDashboardRevenueSummary;
    operations: IManagerDashboardOperationsSummary;
}

export interface IManagerDashboardDeliveryPerformance {
    key: string;
    label: string;

    created: number;
    delivered: number;
    returned: number;
    cancelled: number;
}

export interface IManagerDashboardPackageStatusBreakdown {
    key: string;
    label: string;
    count: number;
    percentage: number;
}

export interface IManagerDashboardBranchPerformance {
    branchId: string;

    name: string;
    code: string;

    status: string;

    totalPackages: number;
    deliveredPackages: number;

    revenue: number;
    revenueFormatted: string;
}

export interface IManagerDashboardTopDeliverer {
    delivererId: string;

    name: string;

    rating: number;

    delivered: number;

    totalDeliveries: number;

    availabilityStatus: string;
}

export interface IManagerDashboardActivity {
    kind: "package" | "manifest" | "payment";

    title: string;

    description: string;

    timestamp: string;

    referenceId: string;

    branchId?: string;

    status: string;
}

export interface IManagerDashboardAlert {
    key: string;

    severity: "critical" | "warning" | "info";

    title: string;

    count: number;
}

export interface IManagerDashboardRevenuePerBranch {
    branchId: string;

    name: string;

    revenue: number;
    revenueFormatted: string;
}

export interface IManagerDashboardFinancialOverview {
    revenuePerBranch: IManagerDashboardRevenuePerBranch[];

    outstandingPayments: number;

    outstandingPaymentsFormatted: string;
}

export interface IManagerDashboardMeta {
    generatedAt: string;

    timeline: {
        start: string;
        end: string;
        bucketFormat: string;
    };
}

export interface IManagerDashboardOverviewResponse {
    success: boolean;

    companyId: string;

    range: ManagerDashboardRange | string;

    summary: IManagerDashboardSummary;

    deliveryPerformance: IManagerDashboardDeliveryPerformance[];

    packageStatusBreakdown: IManagerDashboardPackageStatusBreakdown[];

    branchPerformance: IManagerDashboardBranchPerformance[];

    topDeliverers: IManagerDashboardTopDeliverer[];

    recentActivity: IManagerDashboardActivity[];

    alerts: IManagerDashboardAlert[];

    financialOverview: IManagerDashboardFinancialOverview;

    meta: IManagerDashboardMeta;
}