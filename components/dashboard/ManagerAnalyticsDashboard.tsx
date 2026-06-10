"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getManagerAnalytics,
} from "@/services/DashboardService";
import {
  IManagerAnalyticsResponse,
  ManagerAnalyticsRange,
  TrendDirection,
} from "@/types/manager-analytics";
import { parseApiError } from "@/utils/apiErrorHandler";

const C = {
  amber: "#fbbf24",
  amberDim: "rgba(251,191,36,0.14)",
  green: "#34d399",
  greenDim: "rgba(52,211,153,0.14)",
  red: "#f87171",
  redDim: "rgba(248,113,113,0.14)",
  blue: "#60a5fa",
  blueDim: "rgba(96,165,250,0.14)",
  purple: "#a78bfa",
  purpleDim: "rgba(167,139,250,0.14)",
  orange: "#fb923c",
  orangeDim: "rgba(251,146,60,0.14)",
  slate: "#94a3b8",
  surface: "#0a0d14",
  card: "#0d1117",
  border: "rgba(255,255,255,0.08)",
  borderHi: "rgba(255,255,255,0.12)",
};

const RANGE_LABELS: Record<ManagerAnalyticsRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
};

const PIE_COLORS = [C.blue, C.green, C.amber, C.orange, C.red, C.purple, "#22c55e"];

function fmtNumber(value: number): string {
  return value.toLocaleString("en-US");
}

function fmtCurrency(value: number): string {
  return `${fmtNumber(value)} DA`;
}

function fmtDuration(value: number): string {
  if (!Number.isFinite(value)) return "0 min";
  if (value < 60) return `${value.toFixed(1)} min`;
  const hours = value / 60;
  return `${hours.toFixed(1)} h`;
}

function trendClass(direction: TrendDirection): string {
  if (direction === "up") return "text-emerald-400";
  if (direction === "down") return "text-rose-400";
  return "text-slate-500";
}

function trendBadge(direction: TrendDirection): { bg: string; color: string; label: string } {
  if (direction === "up") return { bg: C.greenDim, color: C.green, label: "Up" };
  if (direction === "down") return { bg: C.redDim, color: C.red, label: "Down" };
  return { bg: "rgba(148,163,184,0.14)", color: C.slate, label: "Flat" };
}

function timeAgo(value?: string): string {
  if (!value) return "just now";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl ${className}`} style={{ background: "rgba(255,255,255,0.05)" }} />;
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-56" />
          <SkeletonBlock className="h-4 w-72" />
        </div>
        <SkeletonBlock className="h-10 w-72" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonBlock className="h-80" />
        <SkeletonBlock className="h-80" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonBlock className="h-72" />
        <SkeletonBlock className="h-72" />
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-90 items-center justify-center rounded-3xl border border-white/10 bg-background-alt px-6 py-10">
      <div className="max-w-lg text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h18.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Unable to load analytics</h2>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
        </div>
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-background-elevated px-3 py-2.5 text-[12px] shadow-xl">
      <p className="mb-1.5 font-medium text-slate-400">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="capitalize text-slate-300">{entry.name}:</span>
          <span className="font-medium text-white">{typeof entry.value === "number" ? entry.value.toLocaleString("en-US") : entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-white/8 bg-background-alt p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  title,
  metric,
  color,
  dim,
}: {
  title: string;
  metric: {
    currentValue: number;
    previousValue: number;
    changePercent: number;
    direction: TrendDirection;
  };
  color: string;
  dim: string;
}) {
  const badge = trendBadge(metric.direction);

  return (
    <div className="rounded-3xl border border-white/8 bg-background-alt p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
          <div className="mt-3 text-[28px] font-semibold tracking-tight text-white">
            {fmtCurrency(metric.currentValue)}
          </div>
        </div>
        <div className="rounded-2xl px-3 py-2 text-xs font-semibold" style={{ background: dim, color }}>
          {metric.direction === "up" ? "+" : metric.direction === "down" ? "-" : ""}{Math.abs(metric.changePercent).toFixed(1)}%
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>Previous: {fmtCurrency(metric.previousValue)}</span>
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1" style={{ background: badge.bg, color: badge.color }}>
          {badge.label}
        </span>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.abs(metric.changePercent))}%`, background: color }} />
      </div>
    </div>
  );
}

export default function ManagerAnalyticsDashboard({ companyId }: { companyId?: string }) {
  const [range, setRange] = useState<ManagerAnalyticsRange>("30d");
  const [data, setData] = useState<IManagerAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (selectedRange: ManagerAnalyticsRange, silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      const response = await getManagerAnalytics(selectedRange, companyId);
      setData(response);
    } catch (err: any) {
      const error = parseApiError(err);
      console.log("Failed to load manager analytics:", error);
      setError(error.message || "Failed to load analytics.");
    } finally {
      silent ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    void load(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, companyId]);

  const packageLifecyclePie = useMemo(() => {
    return data?.packageLifecycleAnalytics.stages ?? [];
  }, [data]);

  const growthCards = data
    ? [
      { label: "Revenue Growth", metric: data.growthAnalytics.revenueGrowth, color: C.amber, dim: C.amberDim },
      { label: "Package Growth", metric: data.growthAnalytics.packageGrowth, color: C.blue, dim: C.blueDim },
      { label: "Delivery Growth", metric: data.growthAnalytics.deliveryGrowth, color: C.green, dim: C.greenDim },
    ]
    : [];

  const latestOperationalPoint = data?.operationalAnalytics.deliverySuccessRateTrend.at(-1);
  const revenueTrend = data?.revenueAnalytics.revenueOverTime ?? [];
  const lifecycleTrend = data?.packageLifecycleAnalytics.trend ?? [];

  if (loading && !data) {
    return <LoadingState />;
  }

  if (error && !data) {
    return <ErrorState error={error} onRetry={() => void load(range, true)} />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen space-y-8 bg-background-surface px-2 py-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-400/80">Manager Analytics</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Business Intelligence</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Historical growth, operational trends, and financial analysis for delivery performance.
            </p>
            <p className="mt-2 text-xs text-slate-600">
              Updated {timeAgo(data.meta.generatedAt)} · {RANGE_LABELS[range]}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-2xl border border-white/8 bg-background-alt p-1">
              {(["7d", "30d", "90d", "12m"] as ManagerAnalyticsRange[]).map((value) => (
                <button
                  key={value}
                  onClick={() => setRange(value)}
                  className="rounded-xl px-3 py-2 text-xs font-medium transition"
                  style={range === value ? { background: C.amberDim, color: C.amber } : { color: C.slate }}
                >
                  {value}
                </button>
              ))}
            </div>

            <button
              onClick={() => void load(range, true)}
              disabled={refreshing}
              className="rounded-2xl border border-white/8 bg-background-alt px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-white/12 hover:text-white disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {growthCards.map((card) => (
            <MetricCard key={card.label} title={card.label} metric={card.metric} color={card.color} dim={card.dim} />
          ))}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Revenue Trends</h2>
            <p className="mt-1 text-sm text-slate-500">Revenue over time and growth dynamics.</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Revenue over time" subtitle="Current period revenue with prior-period comparison">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.amber} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={C.amber} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke={C.amber} fill="url(#revenueFill)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="previousRevenue" name="Previous" stroke={C.blue} strokeWidth={1.8} dot={false} strokeDasharray="5 4" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Revenue growth trend" subtitle="Period-over-period growth by bucket">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.revenueAnalytics.revenueGrowthTrend}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="growthPercent" name="Growth %" stroke={C.green} strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-slate-500">
                <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
                  <div className="text-slate-400">Daily revenue</div>
                  <div className="mt-1 text-sm font-semibold text-white">{fmtCurrency(data.revenueAnalytics.metrics.dailyRevenue)}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
                  <div className="text-slate-400">Weekly revenue</div>
                  <div className="mt-1 text-sm font-semibold text-white">{fmtCurrency(data.revenueAnalytics.metrics.weeklyRevenue)}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
                  <div className="text-slate-400">Monthly revenue</div>
                  <div className="mt-1 text-sm font-semibold text-white">{fmtCurrency(data.revenueAnalytics.metrics.monthlyRevenue)}</div>
                </div>
              </div>
            </ChartCard>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Operational Analytics</h2>
            <p className="mt-1 text-sm text-slate-500">Service quality, returns, cancellations, and delivery time trends.</p>
          </div>

          {latestOperationalPoint && (
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-3xl border border-white/8 bg-background-alt p-4">
                <div className="text-xs text-slate-500">Success rate</div>
                <div className="mt-2 text-2xl font-semibold text-white">{latestOperationalPoint.successRate.toFixed(1)}%</div>
                <div className="mt-1 text-xs text-slate-500">Best {data.operationalAnalytics.deliverySuccessRate.bestValue.toFixed(1)}% · Worst {data.operationalAnalytics.deliverySuccessRate.worstValue.toFixed(1)}%</div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-background-alt p-4">
                <div className="text-xs text-slate-500">Return rate</div>
                <div className="mt-2 text-2xl font-semibold text-white">{latestOperationalPoint.returnRate.toFixed(1)}%</div>
                <div className="mt-1 text-xs text-slate-500">Best {data.operationalAnalytics.returnRate.bestValue.toFixed(1)}% · Worst {data.operationalAnalytics.returnRate.worstValue.toFixed(1)}%</div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-background-alt p-4">
                <div className="text-xs text-slate-500">Cancellation rate</div>
                <div className="mt-2 text-2xl font-semibold text-white">{latestOperationalPoint.cancellationRate.toFixed(1)}%</div>
                <div className="mt-1 text-xs text-slate-500">Best {data.operationalAnalytics.cancellationRate.bestValue.toFixed(1)}% · Worst {data.operationalAnalytics.cancellationRate.worstValue.toFixed(1)}%</div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-background-alt p-4">
                <div className="text-xs text-slate-500">Avg delivery time</div>
                <div className="mt-2 text-2xl font-semibold text-white">{fmtDuration(latestOperationalPoint.averageDeliveryTime)}</div>
                <div className="mt-1 text-xs text-slate-500">Best {fmtDuration(data.operationalAnalytics.averageDeliveryTime.bestValue)} · Worst {fmtDuration(data.operationalAnalytics.averageDeliveryTime.worstValue)}</div>
              </div>
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Delivery success rate trend">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.operationalAnalytics.deliverySuccessRateTrend}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="successRate" name="Success" stroke={C.green} strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Return rate trend">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.operationalAnalytics.deliverySuccessRateTrend}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="returnRate" name="Return" stroke={C.orange} strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Cancellation rate trend">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.operationalAnalytics.deliverySuccessRateTrend}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="cancellationRate" name="Cancellation" stroke={C.red} strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Average delivery time trend">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.operationalAnalytics.deliverySuccessRateTrend}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="averageDeliveryTime" name="Avg time" stroke={C.blue} strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Financial Analytics</h2>
            <p className="mt-1 text-sm text-slate-500">Cash collection dynamics, outstanding amounts, and revenue vs collections.</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Cash collection trend">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.financialAnalytics.cashCollectionTrend}>
                  <defs>
                    <linearGradient id="cashFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.green} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="cashCollected" name="Cash collected" stroke={C.green} fill="url(#cashFill)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Outstanding amount trend">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.financialAnalytics.outstandingAmountTrend}>
                  <defs>
                    <linearGradient id="outstandingFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.red} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="outstandingAmount" name="Outstanding" stroke={C.red} fill="url(#outstandingFill)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Revenue vs collections" subtitle="Compare collected revenue against cash collection and outstanding balances">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={data.financialAnalytics.revenueVsCollections}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend formatter={(value) => <span className="text-xs text-slate-400">{value}</span>} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke={C.amber} fill={C.amberDim} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="collectedCash" name="Collections" stroke={C.green} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="outstandingAmount" name="Outstanding" stroke={C.red} strokeWidth={2} dot={false} strokeDasharray="5 4" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Package Lifecycle Analytics</h2>
            <p className="mt-1 text-sm text-slate-500">How packages move through the system over time.</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
            <ChartCard title="Lifecycle distribution" subtitle="Counts and percentages by stage">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={packageLifecyclePie} dataKey="count" nameKey="label" innerRadius={70} outerRadius={100} paddingAngle={4}>
                    {packageLifecyclePie.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                {packageLifecyclePie.map((stage, index) => (
                  <div key={stage.key} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }} />
                    <span className="flex-1 text-slate-400">{stage.label}</span>
                    <span className="font-medium text-slate-200">{fmtNumber(stage.count)}</span>
                    <span className="w-12 text-right text-slate-600">{stage.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Lifecycle trend over time" subtitle="Created through cancelled by bucket">
              <ResponsiveContainer width="100%" height={360}>
                <AreaChart data={lifecycleTrend}>
                  <defs>
                    <linearGradient id="lifeCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.purple} stopOpacity={0.28} />
                      <stop offset="95%" stopColor={C.purple} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="lifeDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.green} stopOpacity={0.28} />
                      <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend formatter={(value) => <span className="text-xs text-slate-400">{value}</span>} />
                  <Area type="monotone" dataKey="created" name="Created" stroke={C.purple} fill="url(#lifeCreated)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="inTransit" name="In transit" stroke={C.blue} fill="rgba(96,165,250,0.12)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="delivered" name="Delivered" stroke={C.green} fill="url(#lifeDelivered)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="returned" name="Returned" stroke={C.orange} strokeWidth={1.8} dot={false} />
                  <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke={C.red} strokeWidth={1.8} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Activity Heatmaps</h2>
            <p className="mt-1 text-sm text-slate-500">Peak operational windows by weekday and hour.</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Packages by weekday" subtitle="Where demand concentrates during the week">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.activityAnalytics.weekdayHeatmap}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Packages" radius={[10, 10, 0, 0]}>
                    {data.activityAnalytics.weekdayHeatmap.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Packages by hour" subtitle="Identify peak dispatch and delivery hours">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.activityAnalytics.hourHeatmap}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fill: C.slate, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Packages" radius={[10, 10, 0, 0]}>
                    {data.activityAnalytics.hourHeatmap.map((_, index) => (
                      <Cell key={index} fill={index % 3 === 0 ? C.blue : index % 3 === 1 ? C.green : C.amber} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </section>

        <section>
          <div className="rounded-3xl border border-white/8 bg-background-alt p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Range snapshot</h3>
                <p className="mt-1 text-xs text-slate-500">{RANGE_LABELS[range]} · {data.meta.currentPeriod.start.slice(0, 10)} to {data.meta.currentPeriod.end.slice(0, 10)}</p>
              </div>
              <div className="text-xs text-slate-500">
                Company: <span className="text-slate-200">{data.companyId}</span>
              </div>
            </div>
          </div>
        </section>

        {error && data && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}