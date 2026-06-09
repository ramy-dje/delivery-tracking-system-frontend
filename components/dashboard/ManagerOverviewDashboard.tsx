"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getManagerDashboardOverview } from "@/services/DashboardService";
import {
    IManagerDashboardOverviewResponse,
    IManagerDashboardActivity,
    IManagerDashboardAlert,
    IManagerDashboardBranchPerformance,
    IManagerDashboardTopDeliverer,
    ManagerDashboardRange,
} from "@/types/manager-dashboard";
import { parseApiError } from "@/utils/apiErrorHandler";

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
    slate: "#475569",
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

const PIE_COLORS = ["#34d399", "#fbbf24", "#f87171", "#60a5fa", "#a78bfa", "#fb923c"];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div
            className={`animate-pulse rounded-lg ${className}`}
            style={{ background: "rgba(255,255,255,0.05)" }}
        />
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
            className="relative flex flex-col gap-3 rounded-2xl p-4 overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
            <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">{label}</span>
                <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: colorDim, color }}
                >
                    {icon}
                </div>
            </div>
            <div>
                <div className="text-[26px] font-semibold text-white leading-none tracking-tight">{value}</div>
                {sub && <div className="text-[12px] text-slate-500 mt-1">{sub}</div>}
            </div>
            {trend && (
                <div className="flex items-center gap-1.5 mt-auto">
                    <span
                        className="text-[11px] font-medium px-1.5 py-0.5 rounded-md"
                        style={{
                            background: trend.value >= 0 ? C.greenDim : C.redDim,
                            color: trend.value >= 0 ? C.green : C.red,
                        }}
                    >
                        {trend.value >= 0 ? "+" : ""}{trend.value}%
                    </span>
                    <span className="text-[11px] text-slate-600">{trend.label}</span>
                </div>
            )}
            {/* Subtle glow strip */}
            <div
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }}
            />
        </div>
    );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-slate-300 uppercase tracking-widest">{title}</h2>
                {action}
            </div>
            {children}
        </div>
    );
}

// ─── Chart card ───────────────────────────────────────────────────────────────

function ChartCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`rounded-2xl p-5 flex flex-col gap-4 ${className}`}
            style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
            <span className="text-[13px] font-medium text-slate-300">{title}</span>
            {children}
        </div>
    );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div
            className="rounded-xl px-3 py-2.5 text-[12px]"
            style={{ background: "#111827", border: `1px solid ${C.border}` }}
        >
            <p className="text-slate-400 mb-1.5 font-medium">{label}</p>
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-slate-300 capitalize">{p.name}:</span>
                    <span className="text-white font-medium">{p.value}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Alerts panel ─────────────────────────────────────────────────────────────

const SEVERITY_STYLE: Record<string, { bg: string; border: string; color: string; dot: string }> = {
    critical: { bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.25)", color: C.red, dot: C.red },
    warning: { bg: "rgba(251,191,36,0.07)", border: "rgba(251,191,36,0.25)", color: C.amber, dot: C.amber },
    info: { bg: "rgba(96,165,250,0.07)", border: "rgba(96,165,250,0.25)", color: C.blue, dot: C.blue },
};

const SEVERITY_ICON: Record<string, React.ReactNode> = {
    critical: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    warning: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    info: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
};

function AlertsPanel({ alerts }: { alerts: IManagerDashboardAlert[] }) {
    const order = ["critical", "warning", "info"] as const;
    const sorted = [...alerts].sort(
        (a, b) => order.indexOf(a.severity) - order.indexOf(b.severity)
    );

    if (!sorted.length) return null;

    return (
        <div className="flex flex-col gap-2">
            {sorted.map((a) => {
                const s = SEVERITY_STYLE[a.severity] ?? SEVERITY_STYLE.info;
                return (
                    <div
                        key={a.key}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background: s.bg, border: `1px solid ${s.border}` }}
                    >
                        <div style={{ color: s.color }}>{SEVERITY_ICON[a.severity]}</div>
                        <span className="text-[13px] font-medium flex-1" style={{ color: s.color }}>{a.title}</span>
                        <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: s.border, color: s.color }}
                        >
                            {a.count}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Branch table ─────────────────────────────────────────────────────────────

function BranchTable({ branches }: { branches: IManagerDashboardBranchPerformance[] }) {
    const sorted = [...branches].sort((a, b) => b.revenue - a.revenue);
    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${C.border}` }}
        >
            <table className="w-full text-[13px]">
                <thead>
                    <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${C.border}` }}>
                        {["Branch", "Status", "Packages", "Delivered", "Revenue"].map((h) => (
                            <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody style={{ background: C.card }}>
                    {sorted.map((b, i) => {
                        const rate = b.totalPackages > 0 ? Math.round((b.deliveredPackages / b.totalPackages) * 100) : 0;
                        return (
                            <tr
                                key={b.branchId}
                                className="transition-colors"
                                style={{ borderBottom: i < sorted.length - 1 ? `1px solid ${C.border}` : "none" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                                            style={{ background: C.amberDim, color: C.amber }}
                                        >
                                            {b.code.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium leading-none">{b.name}</div>
                                            <div className="text-[11px] text-slate-600 mt-0.5">{b.code}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                        style={b.status === "active"
                                            ? { background: C.greenDim, color: C.green }
                                            : { background: "rgba(100,116,139,0.15)", color: "#64748b" }
                                        }
                                    >
                                        {b.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-300">{b.totalPackages.toLocaleString()}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-300">{b.deliveredPackages.toLocaleString()}</span>
                                        <div className="flex-1 h-1.5 rounded-full max-w-[60px]" style={{ background: "rgba(255,255,255,0.07)" }}>
                                            <div
                                                className="h-full rounded-full"
                                                style={{ width: `${rate}%`, background: rate >= 80 ? C.green : rate >= 60 ? C.amber : C.red }}
                                            />
                                        </div>
                                        <span className="text-[11px] text-slate-600">{rate}%</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium" style={{ color: C.amber }}>{b.revenueFormatted}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ─── Deliverer card ───────────────────────────────────────────────────────────

function DelivererCard({ d }: { d: IManagerDashboardTopDeliverer }) {
    const rate = d.totalDeliveries > 0 ? Math.round((d.delivered / d.totalDeliveries) * 100) : 0;
    const isAvailable = d.availabilityStatus === "available";

    return (
        <div
            className="flex flex-col gap-3 p-4 rounded-2xl"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                        style={{ background: C.purDim, color: C.purple }}
                    >
                        {d.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div>
                        <div className="text-[13px] font-medium text-white leading-none">{d.name}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill={C.amber}>
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <span className="text-[11px] text-slate-400">{d.rating.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
                <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={isAvailable
                        ? { background: C.greenDim, color: C.green }
                        : { background: "rgba(100,116,139,0.15)", color: "#64748b" }
                    }
                >
                    {d.availabilityStatus}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div className="h-full rounded-full" style={{ width: `${rate}%`, background: C.green }} />
                </div>
                <span className="text-[11px] text-slate-500 shrink-0">{d.delivered}/{d.totalDeliveries}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>{rate}% delivery rate</span>
                <span className="font-medium text-slate-400">{d.delivered} delivered</span>
            </div>
        </div>
    );
}

// ─── Activity feed ────────────────────────────────────────────────────────────

const ACTIVITY_COLORS: Record<string, { color: string; dim: string }> = {
    package: { color: C.purple, dim: C.purDim },
    manifest: { color: C.blue, dim: C.blueDim },
    payment: { color: C.green, dim: C.greenDim },
};

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
    package: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    manifest: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.5" />
            <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    payment: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
};

function timeAgo(ts: string): string {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

function ActivityFeed({ activities }: { activities: IManagerDashboardActivity[] }) {
    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
            {activities.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-slate-600 text-[13px]">No recent activity</div>
            ) : (
                activities.map((a, i) => {
                    const style = ACTIVITY_COLORS[a.kind] ?? ACTIVITY_COLORS.package;
                    return (
                        <div
                            key={i}
                            className="flex gap-3 px-4 py-3.5 relative"
                            style={{ borderBottom: i < activities.length - 1 ? `1px solid ${C.border}` : "none" }}
                        >
                            {/* Timeline connector */}
                            {i < activities.length - 1 && (
                                <div
                                    className="absolute left-[27px] top-[42px] bottom-0 w-px"
                                    style={{ background: C.border }}
                                />
                            )}

                            <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 z-10"
                                style={{ background: style.dim, color: style.color, border: `1px solid ${style.color}25` }}
                            >
                                {ACTIVITY_ICONS[a.kind]}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                    <span className="text-[13px] font-medium text-slate-200 leading-snug">{a.title}</span>
                                    <span className="text-[11px] text-slate-600 shrink-0">{timeAgo(a.timestamp)}</span>
                                </div>
                                <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{a.description}</p>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <span
                                        className="text-[10px] px-1.5 py-0.5 rounded-md font-medium capitalize"
                                        style={{ background: "rgba(255,255,255,0.04)", color: "#475569", border: `1px solid ${C.border}` }}
                                    >
                                        {a.kind}
                                    </span>
                                    <span
                                        className="text-[10px] px-1.5 py-0.5 rounded-md font-medium capitalize"
                                        style={{ background: style.dim, color: style.color }}
                                    >
                                        {a.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icons = {
    Revenue: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    Package: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Transit: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    Branch: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" />
            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    Deliverer: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    Cash: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 6v2M12 16v2M9 9h4.5a1.5 1.5 0 010 3h-3a1.5 1.5 0 000 3H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    Refresh: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M23 4v6h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 20v-6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
};

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function ManagerOverviewDashboard() {
    const [data, setData] = useState<IManagerDashboardOverviewResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [range, setRange] = useState<ManagerDashboardRange>("30d");
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (r: ManagerDashboardRange, isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        try {
            const res = await getManagerDashboardOverview(r);
            setData(res);
        } catch (e: any) {
            const error = parseApiError(e);
            setError(error.message ?? "Failed to load dashboard.");
            console.log("Error loading dashboard overview:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { load(range); }, [range, load]);

    // ─── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen overflow-y-scroll p-6 md:p-8" style={{ background: C.surface }}>
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-9 w-64" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28" />)}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <Skeleton className="h-64 lg:col-span-2" />
                        <Skeleton className="h-64" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Skeleton className="h-80" />
                        <Skeleton className="h-80" />
                    </div>
                </div>
            </div>
        );
    }

    // ─── Error ──────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: C.surface }}>
                <div
                    className="flex flex-col items-center gap-4 p-8 rounded-2xl text-center max-w-md"
                    style={{ background: C.card, border: `1px solid rgba(248,113,113,0.2)` }}
                >
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: C.redDim, color: C.red }}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-white font-medium">Dashboard unavailable</p>
                        <p className="text-slate-500 text-[13px] mt-1">{error}</p>
                    </div>
                    <button
                        onClick={() => load(range)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all"
                        style={{ background: C.redDim, color: C.red, border: `1px solid rgba(248,113,113,0.2)` }}
                    >
                        <Icons.Refresh /> Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { summary, deliveryPerformance, packageStatusBreakdown, branchPerformance,
        topDeliverers, recentActivity, alerts, financialOverview } = data;

    const criticalCount = alerts.filter(a => a.severity === "critical").length;

    return (
        <div className="h-full min-h-screen overflow-y-auto" style={{ background: C.surface }}>
            <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-8">

                {/* ── Header ────────────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[20px] font-semibold text-white tracking-tight">Overview</h1>
                        <p className="text-[13px] text-slate-500 mt-0.5">
                            {RANGE_LABELS[range as ManagerDashboardRange] ?? range}
                            {data.meta?.generatedAt && (
                                <> · Updated {timeAgo(data.meta.generatedAt)}</>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Range selector */}
                        <div
                            className="flex rounded-xl overflow-hidden"
                            style={{ border: `1px solid ${C.border}`, background: C.card }}
                        >
                            {(["7d", "30d", "90d", "12m"] as ManagerDashboardRange[]).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRange(r)}
                                    className="px-3 py-1.5 text-[12px] font-medium transition-all"
                                    style={r === range
                                        ? { background: C.amberDim, color: C.amber }
                                        : { color: "#475569" }
                                    }
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={() => load(range, true)}
                            disabled={refreshing}
                            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
                            style={{ background: C.card, border: `1px solid ${C.border}`, color: "#475569" }}
                        >
                            <div className={refreshing ? "animate-spin" : ""}><Icons.Refresh /></div>
                        </button>
                    </div>
                </div>

                {/* ── Critical alerts strip ──────────────────────────────────────── */}
                {criticalCount > 0 && (
                    <Section title={`${criticalCount} Critical alert${criticalCount > 1 ? "s" : ""}`}>
                        <AlertsPanel alerts={alerts.filter(a => a.severity === "critical")} />
                    </Section>
                )}

                {/* ── KPI row ────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <KpiCard
                        label="Revenue today"
                        value={summary.revenue.todayFormatted}
                        sub={`Month: ${summary.revenue.monthFormatted}`}
                        color={C.amber} colorDim={C.amberDim}
                        icon={<Icons.Revenue />}
                    />
                    <KpiCard
                        label="Collected cash"
                        value={summary.revenue.collectedCashFormatted}
                        sub={`Outstanding: ${summary.revenue.outstandingFormatted}`}
                        color={C.green} colorDim={C.greenDim}
                        icon={<Icons.Cash />}
                    />
                    <KpiCard
                        label="Packages today"
                        value={summary.packages.totalToday.toLocaleString()}
                        sub={`Month: ${summary.packages.totalThisMonth.toLocaleString()}`}
                        color={C.purple} colorDim={C.purDim}
                        icon={<Icons.Package />}
                    />
                    <KpiCard
                        label="In transit"
                        value={summary.operations.packagesInTransit.toLocaleString()}
                        sub={`Pending: ${summary.packages.pending}`}
                        color={C.blue} colorDim={C.blueDim}
                        icon={<Icons.Transit />}
                    />
                    <KpiCard
                        label="Active branches"
                        value={summary.operations.activeBranches}
                        color={C.orange} colorDim={C.orgDim}
                        icon={<Icons.Branch />}
                    />
                    <KpiCard
                        label="Active deliverers"
                        value={summary.operations.activeDeliverers}
                        sub={`Transporters: ${summary.operations.activeTransporters}`}
                        color={summary.operations.activeDeliverers > 0 ? C.green : C.red}
                        colorDim={summary.operations.activeDeliverers > 0 ? C.greenDim : C.redDim}
                        icon={<Icons.Deliverer />}
                    />
                </div>

                {/* ── Non-critical alerts ────────────────────────────────────────── */}
                {alerts.some(a => a.severity !== "critical") && (
                    <Section title="Alerts">
                        <AlertsPanel alerts={alerts.filter(a => a.severity !== "critical")} />
                    </Section>
                )}

                {/* ── Charts row 1: delivery performance + status pie ───────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <ChartCard title="Delivery performance" className="lg:col-span-2">
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={deliveryPerformance} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                                <defs>
                                    <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={C.green} stopOpacity={0.25} />
                                        <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={C.amber} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={C.amber} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={C.red} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Legend
                                    iconType="circle" iconSize={7}
                                    formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{v}</span>}
                                />
                                <Area type="monotone" dataKey="created" stroke={C.amber} fill="url(#ga)" strokeWidth={1.5} dot={false} name="created" />
                                <Area type="monotone" dataKey="delivered" stroke={C.green} fill="url(#gc)" strokeWidth={1.5} dot={false} name="delivered" />
                                <Area type="monotone" dataKey="returned" stroke={C.orange} fill="none" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="returned" />
                                <Area type="monotone" dataKey="cancelled" stroke={C.red} fill="url(#gr)" strokeWidth={1.5} dot={false} name="cancelled" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Package status">
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie
                                    data={packageStatusBreakdown}
                                    dataKey="count"
                                    nameKey="label"
                                    cx="50%" cy="50%"
                                    innerRadius={50} outerRadius={75}
                                    paddingAngle={3}
                                >
                                    {packageStatusBreakdown.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(v, n) => [v, n]}
                                    contentStyle={{ background: "#111827", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12 }}
                                    itemStyle={{ color: "#cbd5e1" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-col gap-1.5">
                            {packageStatusBreakdown.map((s, i) => (
                                <div key={s.key} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                    <span className="text-[12px] text-slate-400 flex-1 truncate">{s.label}</span>
                                    <span className="text-[12px] font-medium text-slate-300">{s.count.toLocaleString()}</span>
                                    <span className="text-[11px] text-slate-600 w-10 text-right">{s.percentage.toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </ChartCard>
                </div>

                {/* ── Charts row 2: revenue per branch bar ──────────────────────── */}
                <ChartCard title="Revenue per branch">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                            data={financialOverview.revenuePerBranch}
                            margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
                            barSize={28}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                                content={<ChartTooltip />}
                            />
                            <Bar dataKey="revenue" name="revenue" radius={[6, 6, 0, 0]}>
                                {financialOverview.revenuePerBranch.map((_, i) => (
                                    <Cell key={i} fill={i === 0 ? C.amber : `${C.amber}70`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* ── Branch table ──────────────────────────────────────────────── */}
                <Section title="Branch performance">
                    <BranchTable branches={branchPerformance} />
                </Section>

                {/* ── Bottom row: top deliverers + activity ─────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Section title="Top deliverers">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {topDeliverers.length === 0
                                ? <p className="text-slate-600 text-[13px] col-span-2">No deliverer data available.</p>
                                : topDeliverers.map(d => <DelivererCard key={d.delivererId} d={d} />)
                            }
                        </div>
                    </Section>

                    <Section title="Recent activity">
                        <ActivityFeed activities={recentActivity} />
                    </Section>
                </div>

            </div>
        </div>
    );
}