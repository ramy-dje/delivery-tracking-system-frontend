"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
    BarChart, Bar, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell
} from "recharts";
import { getManagerPerformance } from "@/services/DashboardService";
import { IManagerPerformanceResponse, IBranchRanking, IDelivererLeaderboardEntry, IPerformanceInsight } from "@/types/manager-performance";
import { ManagerDashboardRange } from "@/types/manager-dashboard";
import { parseApiError } from "@/utils/apiErrorHandler";
import { Award, AlertTriangle, Star, ShieldAlert, ArrowUpDown, ChevronDown, ChevronUp, CheckCircle2, TrendingUp, TrendingDown, RefreshCw, BarChart3, Users, HelpCircle, AlertCircle } from "lucide-react";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
    amber: "#fbbf24",
    amberDim: "rgba(251,191,36,0.12)",
    green: "#34d399",
    greenDim: "rgba(52,211,153,0.12)",
    red: "#f87171",
    redDim: "rgba(248,113,113,0.12)",
    orange: "#fb923c",
    orgDim: "rgba(251,146,60,0.12)",
    blue: "#60a5fa",
    blueDim: "rgba(96,165,250,0.12)",
    purple: "#a78bfa",
    purDim: "rgba(167,139,250,0.12)",
    slate: "#94a3b8",
    slateDim: "rgba(148,163,184,0.08)",
    surface: "#0a0d14",
    card: "#0d1117",
    border: "rgba(255,255,255,0.07)",
    borderHi: "rgba(255,255,255,0.12)",
};

const RANGE_LABELS: Record<ManagerDashboardRange, string> = {
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
    "12m": "Last 12 months",
};

// ─── Mock Data Creator (Fallback & Demo Mode) ──────────────────────────────────
const generateMockData = (range: ManagerDashboardRange): IManagerPerformanceResponse => {
    const scale = range === "7d" ? 0.25 : range === "90d" ? 3 : range === "12m" ? 12 : 1;
    const baseMult = scale;

    const insights: IPerformanceInsight[] = [
        {
            id: "insight-1",
            type: "positive",
            title: "Top Branch Success",
            description: "Algiers Main branch recorded a high success rate and generated significant revenue.",
            metricName: "Algiers Main",
            metricValue: "96.4% Success"
        },
        {
            id: "insight-2",
            type: "positive",
            title: "Deliverer of the Period",
            description: "Sofiane Benzine completed deliveries with a 99.1% success rate and 4.95 rating.",
            metricName: "Sofiane Benzine",
            metricValue: "342 Delivered"
        },
        {
            id: "insight-3",
            type: "positive",
            title: "Most Improved Branch",
            description: "Oran West increased its delivery success rate by 8.5% over the previous period.",
            metricName: "Oran West",
            metricValue: "+8.5% Success"
        },
        {
            id: "insight-4",
            type: "negative",
            title: "Branch Return Rate Warning",
            description: "Constantine East has a high return rate of 12.4%, mainly due to wrong delivery addresses.",
            metricName: "Constantine East",
            metricValue: "12.4% Returns"
        },
        {
            id: "insight-5",
            type: "negative",
            title: "Lowest Success Rate Branch",
            description: "Setif Branch is experiencing operational bottlenecks, falling below targets.",
            metricName: "Setif Branch",
            metricValue: "74.2% Success"
        }
    ];

    const branchPerformance = {
        kpis: {
            bestPerformingBranch: { name: "Algiers Main", value: "96.4% Success", changePercent: 1.2, trend: "up" as const },
            worstPerformingBranch: { name: "Setif Branch", value: "74.2% Success", changePercent: -3.5, trend: "down" as const },
            highestRevenueBranch: { name: "Algiers Main", value: `${Math.round(4250000 * baseMult).toLocaleString()} DA`, changePercent: 12.8, trend: "up" as const },
            highestSuccessRateBranch: { name: "Oran West", value: "97.1% Success", changePercent: 8.5, trend: "up" as const }
        },
        charts: {
            revenueByBranch: [
                { name: "Algiers Main", revenue: Math.round(4250000 * baseMult), revenueFormatted: `${Math.round(4250000 * baseMult).toLocaleString()} DA` },
                { name: "Oran West", revenue: Math.round(2800000 * baseMult), revenueFormatted: `${Math.round(2800000 * baseMult).toLocaleString()} DA` },
                { name: "Constantine East", revenue: Math.round(1950000 * baseMult), revenueFormatted: `${Math.round(1950000 * baseMult).toLocaleString()} DA` },
                { name: "Annaba Port", revenue: Math.round(1650000 * baseMult), revenueFormatted: `${Math.round(1650000 * baseMult).toLocaleString()} DA` },
                { name: "Setif Branch", revenue: Math.round(1200000 * baseMult), revenueFormatted: `${Math.round(1200000 * baseMult).toLocaleString()} DA` }
            ],
            deliveriesByBranch: [
                { name: "Algiers Main", deliveries: Math.round(4500 * baseMult) },
                { name: "Oran West", deliveries: Math.round(2900 * baseMult) },
                { name: "Annaba Port", deliveries: Math.round(1800 * baseMult) },
                { name: "Constantine East", deliveries: Math.round(1750 * baseMult) },
                { name: "Setif Branch", deliveries: Math.round(1300 * baseMult) }
            ],
            successRateByBranch: [
                { name: "Oran West", successRate: 97.1 },
                { name: "Algiers Main", successRate: 96.4 },
                { name: "Annaba Port", successRate: 91.2 },
                { name: "Constantine East", successRate: 85.6 },
                { name: "Setif Branch", successRate: 74.2 }
            ]
        }
    };

    const branchRankings: IBranchRanking[] = [
        { branchId: "b-1", name: "Oran West", revenue: Math.round(2800000 * baseMult), revenueFormatted: `${Math.round(2800000 * baseMult).toLocaleString()} DA`, packages: Math.round(2900 * baseMult), successRate: 97.1, returnRate: 1.8, rank: 1 },
        { branchId: "b-2", name: "Algiers Main", revenue: Math.round(4250000 * baseMult), revenueFormatted: `${Math.round(4250000 * baseMult).toLocaleString()} DA`, packages: Math.round(4500 * baseMult), successRate: 96.4, returnRate: 2.3, rank: 2 },
        { branchId: "b-3", name: "Annaba Port", revenue: Math.round(1650000 * baseMult), revenueFormatted: `${Math.round(1650000 * baseMult).toLocaleString()} DA`, packages: Math.round(1800 * baseMult), successRate: 91.2, returnRate: 5.4, rank: 3 },
        { branchId: "b-4", name: "Constantine East", revenue: Math.round(1950000 * baseMult), revenueFormatted: `${Math.round(1950000 * baseMult).toLocaleString()} DA`, packages: Math.round(1750 * baseMult), successRate: 85.6, returnRate: 12.4, rank: 4 },
        { branchId: "b-5", name: "Setif Branch", revenue: Math.round(1200000 * baseMult), revenueFormatted: `${Math.round(1200000 * baseMult).toLocaleString()} DA`, packages: Math.round(1300 * baseMult), successRate: 74.2, returnRate: 18.5, rank: 5 }
    ];

    const delivererPerformance = {
        kpis: {
            topDeliverer: { name: "Sofiane Benzine", value: `${Math.round(342 * baseMult)} Delivered`, changePercent: 5.4, trend: "up" as const },
            lowestPerformer: { name: "Amine Kadi", value: `${Math.round(110 * baseMult)} Completed`, changePercent: -12.3, trend: "down" as const },
            averageRating: { value: 4.65, count: Math.round(1840 * baseMult) },
            averageSuccessRate: { value: 91.8 }
        },
        charts: {
            deliveriesByDeliverer: [
                { name: "Sofiane Benzine", deliveries: Math.round(345 * baseMult) },
                { name: "Yacine Mahdi", deliveries: Math.round(312 * baseMult) },
                { name: "Karim Louail", deliveries: Math.round(298 * baseMult) },
                { name: "Mohamed Sahnoun", deliveries: Math.round(275 * baseMult) },
                { name: "Riad Touati", deliveries: Math.round(260 * baseMult) },
                { name: "Merzak Belkaid", deliveries: Math.round(245 * baseMult) }
            ],
            successRateByDeliverer: [
                { name: "Sofiane Benzine", successRate: 99.1 },
                { name: "Yacine Mahdi", successRate: 96.5 },
                { name: "Merzak Belkaid", successRate: 95.8 },
                { name: "Riad Touati", successRate: 94.2 },
                { name: "Karim Louail", successRate: 92.5 },
                { name: "Mohamed Sahnoun", successRate: 90.1 }
            ],
            ratingDistribution: [
                { rating: 5, count: Math.round(720 * baseMult) },
                { rating: 4, count: Math.round(450 * baseMult) },
                { rating: 3, count: Math.round(120 * baseMult) },
                { rating: 2, count: Math.round(35 * baseMult) },
                { rating: 1, count: Math.round(15 * baseMult) }
            ]
        }
    };

    const delivererLeaderboard: IDelivererLeaderboardEntry[] = [
        { delivererId: "d-1", name: "Sofiane Benzine", deliveries: Math.round(345 * baseMult), delivered: Math.round(342 * baseMult), returned: Math.round(3 * baseMult), successRate: 99.1, rating: 4.95, rank: 1 },
        { delivererId: "d-2", name: "Yacine Mahdi", deliveries: Math.round(312 * baseMult), delivered: Math.round(301 * baseMult), returned: Math.round(11 * baseMult), successRate: 96.5, rating: 4.88, rank: 2 },
        { delivererId: "d-3", name: "Merzak Belkaid", deliveries: Math.round(245 * baseMult), delivered: Math.round(235 * baseMult), returned: Math.round(10 * baseMult), successRate: 95.8, rating: 4.82, rank: 3 },
        { delivererId: "d-4", name: "Riad Touati", deliveries: Math.round(260 * baseMult), delivered: Math.round(245 * baseMult), returned: Math.round(15 * baseMult), successRate: 94.2, rating: 4.75, rank: 4 },
        { delivererId: "d-5", name: "Karim Louail", deliveries: Math.round(298 * baseMult), delivered: Math.round(275 * baseMult), returned: Math.round(23 * baseMult), successRate: 92.5, rating: 4.68, rank: 5 },
        { delivererId: "d-6", name: "Mohamed Sahnoun", deliveries: Math.round(275 * baseMult), delivered: Math.round(248 * baseMult), returned: Math.round(27 * baseMult), successRate: 90.1, rating: 4.55, rank: 6 },
        { delivererId: "d-7", name: "Tarek Ould", deliveries: Math.round(210 * baseMult), delivered: Math.round(188 * baseMult), returned: Math.round(22 * baseMult), successRate: 89.5, rating: 4.52, rank: 7 },
        { delivererId: "d-8", name: "Fares Slimani", deliveries: Math.round(190 * baseMult), delivered: Math.round(169 * baseMult), returned: Math.round(21 * baseMult), successRate: 88.9, rating: 4.48, rank: 8 },
        { delivererId: "d-9", name: "Abdelkader B.", deliveries: Math.round(180 * baseMult), delivered: Math.round(158 * baseMult), returned: Math.round(22 * baseMult), successRate: 87.7, rating: 4.35, rank: 9 },
        { delivererId: "d-10", name: "Amine Kadi", deliveries: Math.round(150 * baseMult), delivered: Math.round(110 * baseMult), returned: Math.round(40 * baseMult), successRate: 73.3, rating: 3.82, rank: 10 }
    ];

    const productivityAnalytics = {
        deliveriesPerDay: range === "7d" ? [
            { date: "Day 1", deliveries: 220 },
            { date: "Day 2", deliveries: 245 },
            { date: "Day 3", deliveries: 290 },
            { date: "Day 4", deliveries: 270 },
            { date: "Day 5", deliveries: 315 },
            { date: "Day 6", deliveries: 360 },
            { date: "Day 7", deliveries: 340 }
        ] : range === "12m" ? [
            { date: "Jul", deliveries: 6200 },
            { date: "Aug", deliveries: 6450 },
            { date: "Sep", deliveries: 7900 },
            { date: "Oct", deliveries: 8700 },
            { date: "Nov", deliveries: 9150 },
            { date: "Dec", deliveries: 10600 },
            { date: "Jan", deliveries: 8300 },
            { date: "Feb", deliveries: 8850 },
            { date: "Mar", deliveries: 9100 },
            { date: "Apr", deliveries: 9950 },
            { date: "May", deliveries: 10400 },
            { date: "Jun", deliveries: 11400 }
        ] : [
            { date: "Wk 1", deliveries: 2200 },
            { date: "Wk 2", deliveries: 2450 },
            { date: "Wk 3", deliveries: 2900 },
            { date: "Wk 4", deliveries: 2700 },
            { date: "Wk 5", deliveries: 3150 },
            { date: "Wk 6", deliveries: 3600 }
        ],
        deliveriesPerDeliverer: [
            { name: "Algiers Main", averageDeliveries: Math.round(150 * baseMult) },
            { name: "Oran West", averageDeliveries: Math.round(135 * baseMult) },
            { name: "Annaba Port", averageDeliveries: Math.round(112 * baseMult) },
            { name: "Constantine East", averageDeliveries: Math.round(98 * baseMult) },
            { name: "Setif Branch", averageDeliveries: Math.round(75 * baseMult) }
        ],
        revenuePerDeliverer: [
            { name: "Algiers Main", averageRevenue: Math.round(142000 * baseMult), averageRevenueFormatted: `${Math.round(142000 * baseMult).toLocaleString()} DA` },
            { name: "Oran West", averageRevenue: Math.round(130000 * baseMult), averageRevenueFormatted: `${Math.round(130000 * baseMult).toLocaleString()} DA` },
            { name: "Annaba Port", averageRevenue: Math.round(105000 * baseMult), averageRevenueFormatted: `${Math.round(105000 * baseMult).toLocaleString()} DA` },
            { name: "Constantine East", averageRevenue: Math.round(91000 * baseMult), averageRevenueFormatted: `${Math.round(91000 * baseMult).toLocaleString()} DA` },
            { name: "Setif Branch", averageRevenue: Math.round(68000 * baseMult), averageRevenueFormatted: `${Math.round(68000 * baseMult).toLocaleString()} DA` }
        ]
    };

    const qualityMetrics = {
        returnRateByBranch: [
            { name: "Setif Branch", rate: 18.5 },
            { name: "Constantine East", rate: 12.4 },
            { name: "Annaba Port", rate: 5.4 },
            { name: "Algiers Main", rate: 2.3 },
            { name: "Oran West", rate: 1.8 }
        ],
        cancellationRateByBranch: [
            { name: "Setif Branch", rate: 11.2 },
            { name: "Constantine East", rate: 8.7 },
            { name: "Annaba Port", rate: 4.8 },
            { name: "Algiers Main", rate: 3.1 },
            { name: "Oran West", rate: 1.5 }
        ],
        complaintRateByBranch: [
            { name: "Setif Branch", rate: 7.8 },
            { name: "Annaba Port", rate: 4.2 },
            { name: "Constantine East", rate: 3.9 },
            { name: "Algiers Main", rate: 1.2 },
            { name: "Oran West", rate: 0.8 }
        ]
    };

    return {
        success: true,
        companyId: "dz-logistics-id",
        range,
        branchPerformance,
        branchRankings,
        delivererPerformance,
        delivererLeaderboard,
        productivityAnalytics,
        qualityMetrics,
        performanceInsights: insights,
        meta: {
            generatedAt: new Date().toISOString(),
            range,
            companyId: "dz-logistics-id",
            timeline: {
                start: "2026-05-10",
                end: "2026-06-09",
                bucketFormat: "YYYY-MM-DD"
            }
        }
    };
};

// ─── Loading Skeleton ──────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div
            className={`animate-pulse rounded-2xl ${className}`}
            style={{ background: "rgba(255,255,255,0.05)" }}
        />
    );
}

function LoadingState() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-56" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-72" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
            </div>
        </div>
    );
}

// ─── Error State ───────────────────────────────────────────────────────────────
function ErrorState({ error, onRetry, onUseDemo }: { error: string; onRetry: () => void; onUseDemo: () => void }) {
    return (
        <div className="flex min-h-96 items-center justify-center rounded-3xl border border-white/10 bg-background-alt px-6 py-10">
            <div className="max-w-lg text-center space-y-5">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white">Performance metrics unavailable</h2>
                    <p className="mt-2 text-sm text-slate-400">{error}</p>
                </div>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
                    >
                        <RefreshCw size={14} /> Retry Request
                    </button>
                    <button
                        onClick={onUseDemo}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/35 px-4 py-2 text-sm font-medium text-amber-400 transition hover:bg-amber-500/20"
                    >
                        <BarChart3 size={14} /> Open in Demo Mode
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
    label: string;
    value: string | number;
    sub?: string;
    color?: string;
    colorDim?: string;
    icon: React.ReactNode;
    trend?: { value: number; label: string };
}

function KpiCard({ label, value, sub, color = C.amber, colorDim = C.amberDim, icon, trend }: KpiCardProps) {
    return (
        <div
            className="relative flex flex-col gap-3 rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:border-white/15"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{label}</span>
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: colorDim, color }}
                >
                    {icon}
                </div>
            </div>
            <div>
                <div className="text-[24px] font-bold text-white leading-none tracking-tight">{value}</div>
                {sub && <div className="text-[12px] text-slate-500 mt-2 font-medium">{sub}</div>}
            </div>
            {trend && (
                <div className="flex items-center gap-1.5 mt-2">
                    <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                            background: trend.value >= 0 ? C.greenDim : C.redDim,
                            color: trend.value >= 0 ? C.green : C.red,
                        }}
                    >
                        {trend.value >= 0 ? "+" : ""}{trend.value}%
                    </span>
                    <span className="text-[11px] text-slate-600 font-medium">{trend.label}</span>
                </div>
            )}
            {/* Subtle glow strip */}
            <div
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${color}35, transparent)` }}
            />
        </div>
    );
}

// ─── Chart Card ───────────────────────────────────────────────────────────────
function ChartCard({
    title,
    subtitle,
    children,
    className = "",
    action
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
    action?: React.ReactNode;
}) {
    return (
        <div
            className={`rounded-2xl p-5 flex flex-col gap-4 ${className}`}
            style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-sm font-semibold text-white tracking-wide">{title}</h3>
                    {subtitle && <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>}
                </div>
                {action}
            </div>
            <div className="flex-1">{children}</div>
        </div>
    );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div
            className="rounded-xl px-3 py-2 text-[12px] shadow-2xl border"
            style={{ background: "#111827", borderColor: C.border }}
        >
            <p className="text-slate-400 mb-1 font-semibold">{label}</p>
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2 mt-0.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-slate-300 capitalize">{p.name}:</span>
                    <span className="text-white font-bold">
                        {typeof p.value === "number" ? p.value.toLocaleString("en-US") : p.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ManagerPerformanceDashboard({ companyId }: { companyId?: string }) {
    const [range, setRange] = useState<ManagerDashboardRange>("30d");
    const [data, setData] = useState<IManagerPerformanceResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDemoMode, setIsDemoMode] = useState(false);

    // Table Sorting States
    const [sortField, setSortField] = useState<keyof IBranchRanking>("rank");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const load = useCallback(async (selectedRange: ManagerDashboardRange, forceDemo = false, silent = false) => {
        if (silent) setRefreshing(true);
        else setLoading(true);
        setError(null);

        if (forceDemo || isDemoMode) {
            // Wait brief moment to simulate network load
            setTimeout(() => {
                setData(generateMockData(selectedRange));
                setLoading(false);
                setRefreshing(false);
            }, 300);
            return;
        }

        try {
            const response = await getManagerPerformance(selectedRange, companyId);
            setData(response);
            console.log("Fetched performance dashboard data:", response);
        } catch (err: any) {
            const parsedError = parseApiError(err);
            console.warn("Failed to fetch backend performance dashboard, loading demo data fallback", parsedError);
            // Instead of blocking user, we fall back to Demo Mode with a warning log
            setData(generateMockData(selectedRange));
            setIsDemoMode(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [companyId, isDemoMode]);

    useEffect(() => {
        void load(range);
    }, [range, load]);

    // Handle Branch table sorting
    const handleSort = (field: keyof IBranchRanking) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("desc"); // default to desc for metrics
        }
    };

    const sortedBranches = useMemo(() => {
        if (!data?.branchRankings) return [];
        return [...data.branchRankings].sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];
            if (typeof valA === "number" && typeof valB === "number") {
                return sortOrder === "asc" ? valA - valB : valB - valA;
            }
            return sortOrder === "asc"
                ? String(valA).localeCompare(String(valB))
                : String(valB).localeCompare(String(valA));
        });
    }, [data?.branchRankings, sortField, sortOrder]);

    const SortIcon = ({ field }: { field: keyof IBranchRanking }) => {
        if (sortField !== field) return <ArrowUpDown size={12} className="text-slate-600 ml-1 shrink-0" />;
        return sortOrder === "asc"
            ? <ChevronUp size={12} className="text-amber-400 ml-1 shrink-0" />
            : <ChevronDown size={12} className="text-amber-400 ml-1 shrink-0" />;
    };

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-background-surface p-6 md:p-8">
                <LoadingState />
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="min-h-screen bg-background-surface p-6 md:p-8">
                <ErrorState
                    error={error}
                    onRetry={() => void load(range, false, false)}
                    onUseDemo={() => {
                        setIsDemoMode(true);
                        void load(range, true, false);
                    }}
                />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="h-full min-h-screen overflow-y-auto" style={{ background: C.surface }}>
            <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-8">

                {/* ── Header ────────────────────────────────────────────────────── */}
                <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between border-b border-white/5 pb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-400/80">DzDz Delivery Management</p>
                            {isDemoMode && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    Demo Mode
                                </span>
                            )}
                        </div>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Performance Dashboard</h1>
                        <p className="mt-1 max-w-2xl text-xs text-slate-500 font-medium">
                            Evaluate branch productivity, delivery staff success rates, quality metrics, and performance bottlenecks.
                        </p>
                        <p className="mt-1 text-[11px] text-slate-600 font-medium">
                            Updated {new Date(data.meta.generatedAt).toLocaleTimeString()} · {RANGE_LABELS[range]}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Range Selector */}
                        <div className="flex rounded-xl border border-white/8 bg-background-alt p-1">
                            {(["7d", "30d", "90d", "12m"] as ManagerDashboardRange[]).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRange(r)}
                                    className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                                    style={range === r ? { background: C.amberDim, color: C.amber } : { color: C.slate }}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        {/* Reset Demo Mode Trigger if applicable */}
                        {isDemoMode && (
                            <button
                                onClick={() => {
                                    setIsDemoMode(false);
                                    void load(range, false, false);
                                }}
                                className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
                            >
                                Connect Backend API
                            </button>
                        )}

                        {/* Refresh Button */}
                        <button
                            onClick={() => void load(range, false, true)}
                            disabled={refreshing}
                            className="rounded-xl border border-white/8 bg-background-alt p-2.5 text-slate-400 hover:text-white transition disabled:opacity-60 shrink-0"
                            title="Refresh Data"
                        >
                            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                        </button>
                    </div>
                </header>

                {/* ── Insights Section ─────────────────────────────────────────── */}
                <section className="space-y-4">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <Award size={14} className="text-amber-400" /> Operational Performance Insights
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {data.performanceInsights.map((insight) => {
                            const isPositive = insight.type === "positive";
                            const isNegative = insight.type === "negative";
                            return (
                                <div
                                    key={insight.id}
                                    className="rounded-xl p-4 flex flex-col justify-between border transition-all duration-300 hover:border-white/10"
                                    style={{
                                        background: C.card,
                                        borderColor: isPositive
                                            ? "rgba(52,211,153,0.12)"
                                            : isNegative
                                                ? "rgba(248,113,113,0.12)"
                                                : C.border
                                    }}
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{insight.title}</span>
                                            {isPositive ? (
                                                <TrendingUp size={14} className="text-green-400 shrink-0" />
                                            ) : isNegative ? (
                                                <TrendingDown size={14} className="text-red-400 shrink-0" />
                                            ) : (
                                                <HelpCircle size={14} className="text-slate-400 shrink-0" />
                                            )}
                                        </div>
                                        <h4 className="mt-3 text-sm font-semibold text-white truncate">{insight.metricName}</h4>
                                        <p className="mt-1 text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-3">
                                            {insight.description}
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] text-slate-600 font-semibold uppercase">Metric</span>
                                        <span
                                            className="text-xs font-bold"
                                            style={{ color: isPositive ? C.green : isNegative ? C.red : C.amber }}
                                        >
                                            {insight.metricValue}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── Branch Performance Section ────────────────────────────────── */}
                <section className="space-y-4">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <BarChart3 size={14} className="text-amber-400" /> Branch Operational Performance
                    </h2>

                    {/* KPIs */}
                    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                        <KpiCard
                            label="Best Performing Branch"
                            value={data.branchPerformance.kpis.bestPerformingBranch.name}
                            sub={String(data.branchPerformance.kpis.bestPerformingBranch.value)}
                            color={C.green}
                            colorDim={C.greenDim}
                            icon={<Award size={16} />}
                        />
                        <KpiCard
                            label="Worst Performing Branch"
                            value={data.branchPerformance.kpis.worstPerformingBranch.name}
                            sub={String(data.branchPerformance.kpis.worstPerformingBranch.value)}
                            color={C.red}
                            colorDim={C.redDim}
                            icon={<ShieldAlert size={16} />}
                        />
                        <KpiCard
                            label="Highest Revenue Branch"
                            value={data.branchPerformance.kpis.highestRevenueBranch.name}
                            sub={String(data.branchPerformance.kpis.highestRevenueBranch.value)}
                            color={C.amber}
                            colorDim={C.amberDim}
                            icon={<TrendingUp size={16} />}
                        />
                        <KpiCard
                            label="Highest Success Rate"
                            value={data.branchPerformance.kpis.highestSuccessRateBranch.name}
                            sub={String(data.branchPerformance.kpis.highestSuccessRateBranch.value)}
                            color={C.blue}
                            colorDim={C.blueDim}
                            icon={<CheckCircle2 size={16} />}
                        />
                    </div>

                    {/* Charts */}
                    <div className="grid gap-4 lg:grid-cols-3">
                        <ChartCard title="Revenue by Branch" subtitle="Total revenue generated by branch location">
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart layout="vertical" data={data.branchPerformance.charts.revenueByBranch} margin={{ left: -10, right: 10 }}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                                    <Bar dataKey="revenue" name="Revenue" fill={C.amber} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="Deliveries by Branch" subtitle="Number of dispatch packages by branch">
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart layout="vertical" data={data.branchPerformance.charts.deliveriesByBranch} margin={{ left: -10, right: 10 }}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                                    <Bar dataKey="deliveries" name="Deliveries" fill={C.purple} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="Success Rate by Branch" subtitle="Success rate comparison (%)">
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart layout="vertical" data={data.branchPerformance.charts.successRateByBranch} margin={{ left: -10, right: 10 }}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
                                    <XAxis type="number" domain={[0, 100]} tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                                    <Bar dataKey="successRate" name="Success Rate" fill={C.green} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                </section>

                {/* ── Branch Rankings Table ─────────────────────────────────────── */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Branch Leaderboard & Rankings</h2>
                        <span className="text-[10px] text-slate-500 font-semibold">Click headers to sort</span>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-white/5" style={{ background: C.card }}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[13px] border-collapse">
                                <thead>
                                    <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: `1px solid ${C.border}` }}>
                                        <th
                                            onClick={() => handleSort("rank")}
                                            className="text-left px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-white/5 select-none"
                                        >
                                            <div className="flex items-center">Rank <SortIcon field="rank" /></div>
                                        </th>
                                        <th
                                            onClick={() => handleSort("name")}
                                            className="text-left px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-white/5 select-none"
                                        >
                                            <div className="flex items-center">Branch <SortIcon field="name" /></div>
                                        </th>
                                        <th
                                            onClick={() => handleSort("revenue")}
                                            className="text-right px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-white/5 select-none"
                                        >
                                            <div className="flex items-center justify-end">Revenue <SortIcon field="revenue" /></div>
                                        </th>
                                        <th
                                            onClick={() => handleSort("packages")}
                                            className="text-right px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-white/5 select-none"
                                        >
                                            <div className="flex items-center justify-end">Packages <SortIcon field="packages" /></div>
                                        </th>
                                        <th
                                            onClick={() => handleSort("successRate")}
                                            className="text-right px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-white/5 select-none"
                                        >
                                            <div className="flex items-center justify-end">Success Rate <SortIcon field="successRate" /></div>
                                        </th>
                                        <th
                                            onClick={() => handleSort("returnRate")}
                                            className="text-right px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-white/5 select-none"
                                        >
                                            <div className="flex items-center justify-end">Return Rate <SortIcon field="returnRate" /></div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedBranches.map((b, i) => (
                                        <tr
                                            key={b.branchId}
                                            className="transition-colors hover:bg-white/[0.02] border-b border-white/5 last:border-none"
                                        >
                                            <td className="px-5 py-3.5 font-bold text-slate-400">
                                                {b.rank === 1 ? (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">
                                                        {b.rank}
                                                    </span>
                                                ) : b.rank === 2 ? (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-300/10 text-slate-300 border border-slate-300/20 text-xs">
                                                        {b.rank}
                                                    </span>
                                                ) : (
                                                    <span className="pl-2">{b.rank}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 font-semibold text-white">{b.name}</td>
                                            <td className="px-5 py-3.5 text-right font-medium text-amber-400">{b.revenueFormatted}</td>
                                            <td className="px-5 py-3.5 text-right text-slate-300 font-medium">{b.packages.toLocaleString()}</td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="font-semibold text-green-400">{b.successRate.toFixed(1)}%</span>
                                                    <div className="w-16 h-1 rounded-full bg-white/5 hidden sm:block overflow-hidden">
                                                        <div className="h-full bg-green-400 rounded-full" style={{ width: `${b.successRate}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-semibold text-rose-400">{b.returnRate.toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* ── Deliverer Performance Section ─────────────────────────────── */}
                <section className="space-y-4">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <Users size={14} className="text-amber-400" /> Deliverer Performance Evaluation
                    </h2>

                    {/* KPIs */}
                    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                        <KpiCard
                            label="Top Deliverer"
                            value={data.delivererPerformance.kpis.topDeliverer.name}
                            sub={String(data.delivererPerformance.kpis.topDeliverer.value)}
                            color={C.green}
                            colorDim={C.greenDim}
                            icon={<Award size={16} />}
                        />
                        <KpiCard
                            label="Lowest Performer"
                            value={data.delivererPerformance.kpis.lowestPerformer.name}
                            sub={String(data.delivererPerformance.kpis.lowestPerformer.value)}
                            color={C.red}
                            colorDim={C.redDim}
                            icon={<AlertTriangle size={16} />}
                        />
                        <KpiCard
                            label="Average Rating"
                            value={`${data.delivererPerformance.kpis.averageRating.value.toFixed(2)} / 5.0`}
                            sub={`${data.delivererPerformance.kpis.averageRating.count.toLocaleString()} customer reviews`}
                            color={C.amber}
                            colorDim={C.amberDim}
                            icon={<Star size={16} />}
                        />
                        <KpiCard
                            label="Avg Delivery Success Rate"
                            value={`${data.delivererPerformance.kpis.averageSuccessRate.value.toFixed(1)}%`}
                            sub="Across all drivers"
                            color={C.blue}
                            colorDim={C.blueDim}
                            icon={<CheckCircle2 size={16} />}
                        />
                    </div>

                    {/* Charts */}
                    <div className="grid gap-4 lg:grid-cols-3">
                        <ChartCard title="Deliveries by Deliverer" subtitle="Total dispatch assignments completed">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={data.delivererPerformance.charts.deliveriesByDeliverer} margin={{ left: -20, right: 10 }}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: C.slate, fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="deliveries" name="Deliveries" fill={C.blue} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="Success Rate by Deliverer" subtitle="Successful deliveries out of total (%)">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={data.delivererPerformance.charts.successRateByDeliverer} margin={{ left: -20, right: 10 }}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: C.slate, fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[70, 100]} tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="successRate" name="Success Rate" fill={C.green} radius={[4, 4, 0, 0]}>
                                        {data.delivererPerformance.charts.successRateByDeliverer.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.successRate >= 95 ? C.green : entry.successRate >= 90 ? C.blue : C.red} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="Rating Distribution" subtitle="Deliverer ratings distribution (count)">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={data.delivererPerformance.charts.ratingDistribution} margin={{ left: -20, right: 10 }}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                                    <XAxis dataKey="rating" tickFormatter={(v) => `${v} Star`} tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="count" name="Reviews" fill={C.amber} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                </section>

                {/* ── Deliverer Leaderboard ─────────────────────────────────────── */}
                <section className="space-y-4">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Top 10 Deliverers Leaderboard</h2>
                    <div className="rounded-2xl overflow-hidden border border-white/5" style={{ background: C.card }}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[13px] border-collapse">
                                <thead>
                                    <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: `1px solid ${C.border}` }}>
                                        <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-20">Rank</th>
                                        <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name</th>
                                        <th className="text-right px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32">Total Deliveries</th>
                                        <th className="text-right px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32">Delivered</th>
                                        <th className="text-right px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32">Returned</th>
                                        <th className="text-right px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32">Success Rate</th>
                                        <th className="text-right px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32">Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.delivererLeaderboard.slice(0, 10).map((d) => (
                                        <tr
                                            key={d.delivererId}
                                            className="transition-colors hover:bg-white/[0.02] border-b border-white/5 last:border-none"
                                        >
                                            <td className="px-5 py-3.5 font-bold text-slate-400">
                                                {d.rank === 1 ? (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-extrabold">
                                                        🥇
                                                    </span>
                                                ) : d.rank === 2 ? (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-300/10 text-slate-300 border border-slate-300/20 text-xs font-extrabold">
                                                        🥈
                                                    </span>
                                                ) : d.rank === 3 ? (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-orange-400/10 text-orange-400 border border-orange-400/20 text-xs font-extrabold">
                                                        🥉
                                                    </span>
                                                ) : (
                                                    <span className="pl-2">{d.rank}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 font-semibold text-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-300">
                                                        {d.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                                                    </div>
                                                    <span>{d.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-medium text-slate-300">{d.deliveries.toLocaleString()}</td>
                                            <td className="px-5 py-3.5 text-right font-semibold text-green-400">{d.delivered.toLocaleString()}</td>
                                            <td className="px-5 py-3.5 text-right font-semibold text-rose-400">{d.returned.toLocaleString()}</td>
                                            <td className="px-5 py-3.5 text-right">
                                                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${d.successRate >= 95 ? "bg-green-500/10 text-green-400" :
                                                    d.successRate >= 90 ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"
                                                    }`}>
                                                    {d.successRate.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-semibold">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Star size={12} className="fill-amber-400 text-amber-400" />
                                                    <span className="text-white">{d.rating.toFixed(2)}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* ── Productivity Analysis Section ─────────────────────────────── */}
                <section className="space-y-4">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <TrendingUp size={14} className="text-amber-400" /> Operational Productivity Analysis
                    </h2>
                    <div className="grid gap-4 lg:grid-cols-3">
                        <ChartCard title="Deliveries per Day" subtitle="Daily output distribution over time">
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={data.productivityAnalytics.deliveriesPerDay} margin={{ left: -20, right: 5 }}>
                                    <defs>
                                        <linearGradient id="deliveriesFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={C.blue} stopOpacity={0.25} />
                                            <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Area type="monotone" dataKey="deliveries" name="Deliveries" stroke={C.blue} fill="url(#deliveriesFill)" strokeWidth={2} dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="Average Deliveries per Deliverer" subtitle="Completed deliveries count by branch">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={data.productivityAnalytics.deliveriesPerDeliverer} margin={{ left: -20, right: 5 }}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: C.slate, fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="averageDeliveries" name="Avg Deliveries" fill={C.purple} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="Average Revenue Generated per Deliverer" subtitle="Branch average worker contribution (DA)">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={data.productivityAnalytics.revenuePerDeliverer} margin={{ left: -25, right: 5 }}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: C.slate, fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: C.slate, fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="averageRevenue" name="Avg Revenue" fill={C.green} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                </section>

                {/* ── Quality Metrics Section ───────────────────────────────────── */}
                <section className="space-y-4">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <ShieldAlert size={14} className="text-amber-400" /> Quality Metrics & Failure Identification
                    </h2>
                    <div className="grid gap-4 lg:grid-cols-3">
                        <ChartCard title="Return Rate by Branch" subtitle="High rate signals address or client issues (%)">
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart layout="vertical" data={data.qualityMetrics.returnRateByBranch} margin={{ left: -10, right: 10 }}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                                    <Bar dataKey="rate" name="Return Rate" fill={C.orange} radius={[0, 4, 4, 0]}>
                                        {data.qualityMetrics.returnRateByBranch.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.rate >= 10 ? C.red : C.orange} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="mt-2 text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                                <AlertTriangle size={12} className="text-red-400" /> Red highlights return rates exceeding 10%
                            </div>
                        </ChartCard>

                        <ChartCard title="Cancellation Rate by Branch" subtitle="Packages cancelled post-pickup (%)">
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart layout="vertical" data={data.qualityMetrics.cancellationRateByBranch} margin={{ left: -10, right: 10 }}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                                    <Bar dataKey="rate" name="Cancellation Rate" fill={C.purple} radius={[0, 4, 4, 0]}>
                                        {data.qualityMetrics.cancellationRateByBranch.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.rate >= 8 ? C.red : C.purple} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="mt-2 text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                                <AlertTriangle size={12} className="text-red-400" /> Red highlights cancellation rates exceeding 8%
                            </div>
                        </ChartCard>

                        <ChartCard title="Complaint Rate by Branch" subtitle="Customer reports/disputes filed (%)">
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart layout="vertical" data={data.qualityMetrics.complaintRateByBranch} margin={{ left: -10, right: 10 }}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                                    <Bar dataKey="rate" name="Complaint Rate" fill={C.blue} radius={[0, 4, 4, 0]}>
                                        {data.qualityMetrics.complaintRateByBranch.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.rate >= 4 ? C.red : C.blue} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="mt-2 text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                                <AlertTriangle size={12} className="text-red-400" /> Red highlights complaint rates exceeding 4%
                            </div>
                        </ChartCard>
                    </div>
                </section>
            </div>
        </div>
    );
}
