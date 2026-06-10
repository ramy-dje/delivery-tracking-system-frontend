export type ManagerAnalyticsRange = "7d" | "30d" | "90d" | "12m";

export type TrendDirection = "up" | "down" | "flat";

export interface IManagerAnalyticsGrowthMetric {
  currentValue: number;
  previousValue: number;
  changePercent: number;
  direction: TrendDirection;
}

export interface IManagerAnalyticsRevenueMetric {
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
}

export interface IManagerAnalyticsRevenuePoint {
  key: string;
  label: string;
  revenue: number;
  previousRevenue: number;
  growthPercent: number;
}

export interface IManagerAnalyticsGrowthPoint {
  key: string;
  label: string;
  growthPercent: number;
}

export interface IManagerAnalyticsTrendMetric {
  currentValue: number;
  bestValue: number;
  worstValue: number;
}

export interface IManagerAnalyticsOperationalPoint {
  key: string;
  label: string;
  created: number;
  assigned: number;
  pickedUp: number;
  inTransit: number;
  delivered: number;
  returned: number;
  cancelled: number;
  successRate: number;
  returnRate: number;
  cancellationRate: number;
  averageDeliveryTime: number;
}

export interface IManagerAnalyticsFinancialPoint {
  key: string;
  label: string;
  revenue: number;
  collectedCash: number;
  outstandingAmount: number;
}

export interface IManagerAnalyticsLifecycleStage {
  key: string;
  label: string;
  count: number;
  percentage: number;
}

export interface IManagerAnalyticsLifecyclePoint {
  key: string;
  label: string;
  created: number;
  assigned: number;
  pickedUp: number;
  inTransit: number;
  delivered: number;
  returned: number;
  cancelled: number;
}

export interface IManagerAnalyticsHeatmapPoint {
  key: string;
  label: string;
  count: number;
}

export interface IManagerAnalyticsMeta {
  generatedAt: string;
  range: ManagerAnalyticsRange | string;
  companyId: string;
  currentPeriod: {
    start: string;
    end: string;
  };
  previousPeriod: {
    start: string;
    end: string;
  };
  timeline: {
    granularity: "day" | "month";
    bucketFormat: string;
    bucketCount: number;
  };
}

export interface IManagerAnalyticsResponse {
  success: boolean;
  companyId: string;
  range: ManagerAnalyticsRange | string;

  growthAnalytics: {
    revenueGrowth: IManagerAnalyticsGrowthMetric;
    packageGrowth: IManagerAnalyticsGrowthMetric;
    deliveryGrowth: IManagerAnalyticsGrowthMetric;
  };

  revenueAnalytics: {
    revenueOverTime: IManagerAnalyticsRevenuePoint[];
    revenueGrowthTrend: IManagerAnalyticsGrowthPoint[];
    metrics: IManagerAnalyticsRevenueMetric;
  };

  operationalAnalytics: {
    deliverySuccessRateTrend: IManagerAnalyticsOperationalPoint[];
    deliverySuccessRate: IManagerAnalyticsTrendMetric;
    returnRate: IManagerAnalyticsTrendMetric;
    cancellationRate: IManagerAnalyticsTrendMetric;
    averageDeliveryTime: IManagerAnalyticsTrendMetric;
  };

  financialAnalytics: {
    cashCollectionTrend: Array<{
      key: string;
      label: string;
      cashCollected: number;
    }>;
    outstandingAmountTrend: Array<{
      key: string;
      label: string;
      outstandingAmount: number;
    }>;
    revenueVsCollections: IManagerAnalyticsFinancialPoint[];
  };

  packageLifecycleAnalytics: {
    stages: IManagerAnalyticsLifecycleStage[];
    trend: IManagerAnalyticsLifecyclePoint[];
  };

  activityAnalytics: {
    weekdayHeatmap: IManagerAnalyticsHeatmapPoint[];
    hourHeatmap: IManagerAnalyticsHeatmapPoint[];
  };

  meta: IManagerAnalyticsMeta;
}