import { ManagerDashboardRange } from "./manager-dashboard";

export interface IPerformanceKpi {
    name: string;
    value: string | number;
    changePercent?: number; // e.g. 5.4 for +5.4%
    trend?: "up" | "down" | "flat";
}

export interface IBranchPerformanceKpis {
    bestPerformingBranch: IPerformanceKpi;
    worstPerformingBranch: IPerformanceKpi;
    highestRevenueBranch: IPerformanceKpi;
    highestSuccessRateBranch: IPerformanceKpi;
}

export interface IBranchPerformanceCharts {
    revenueByBranch: Array<{ name: string; revenue: number; revenueFormatted: string }>;
    deliveriesByBranch: Array<{ name: string; deliveries: number }>;
    successRateByBranch: Array<{ name: string; successRate: number }>;
}

export interface IBranchPerformanceSection {
    kpis: IBranchPerformanceKpis;
    charts: IBranchPerformanceCharts;
}

export interface IBranchRanking {
    branchId: string;
    name: string;
    revenue: number;
    revenueFormatted: string;
    packages: number;
    successRate: number; // e.g. 94.2 for 94.2%
    returnRate: number;  // e.g. 2.1 for 2.1%
    rank: number;
}

export interface IDelivererPerformanceKpis {
    topDeliverer: IPerformanceKpi;
    lowestPerformer: IPerformanceKpi;
    averageRating: { value: number; count: number };
    averageSuccessRate: { value: number };
}

export interface IDelivererPerformanceCharts {
    deliveriesByDeliverer: Array<{ name: string; deliveries: number }>;
    successRateByDeliverer: Array<{ name: string; successRate: number }>;
    ratingDistribution: Array<{ rating: number; count: number }>;
}

export interface IDelivererPerformanceSection {
    kpis: IDelivererPerformanceKpis;
    charts: IDelivererPerformanceCharts;
}

export interface IDelivererLeaderboardEntry {
    delivererId: string;
    name: string;
    deliveries: number;
    delivered: number;
    returned: number;
    successRate: number;
    rating: number;
    rank: number;
}

export interface IProductivityAnalytics {
    deliveriesPerDay: Array<{ date: string; deliveries: number }>;
    deliveriesPerDeliverer: Array<{ name: string; averageDeliveries: number }>;
    revenuePerDeliverer: Array<{ name: string; averageRevenue: number; averageRevenueFormatted: string }>;
}

export interface IQualityMetrics {
    returnRateByBranch: Array<{ name: string; rate: number }>;
    cancellationRateByBranch: Array<{ name: string; rate: number }>;
    complaintRateByBranch: Array<{ name: string; rate: number }>;
}

export interface IPerformanceInsight {
    id: string;
    type: "positive" | "negative" | "neutral";
    title: string;
    description: string;
    metricName: string;
    metricValue: string;
}

export interface IManagerPerformanceMeta {
    generatedAt: string;
    range: ManagerDashboardRange | string;
    companyId: string;
    timeline: {
        start: string;
        end: string;
        bucketFormat: string;
    };
}

export interface IManagerPerformanceResponse {
    success: boolean;
    companyId: string;
    range: ManagerDashboardRange | string;
    branchPerformance: IBranchPerformanceSection;
    branchRankings: IBranchRanking[];
    delivererPerformance: IDelivererPerformanceSection;
    delivererLeaderboard: IDelivererLeaderboardEntry[];
    productivityAnalytics: IProductivityAnalytics;
    qualityMetrics: IQualityMetrics;
    performanceInsights: IPerformanceInsight[];
    meta: IManagerPerformanceMeta;
}
