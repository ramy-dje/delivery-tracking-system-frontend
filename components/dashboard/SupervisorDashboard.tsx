"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar,
} from "recharts";
import userStore from "@/stores/userStore";
import { listDrivers } from "@/services/DriverService";
import { listTransporters } from "@/services/TransporterService";
import { listFreelancers } from "@/services/FreelancerService";
import { getCompanyVehicles } from "@/services/VehicleService";
import { ISupervisorResponse } from "@/types/supervisor";

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
    teal: "#2dd4bf",
    tealDim: "rgba(45,212,191,0.12)",
    slate: "#475569",
    surface: "#0a0d14",
    card: "#0d1117",
    border: "rgba(255,255,255,0.07)",
    borderHi: "rgba(255,255,255,0.12)",
};

const PIE_COLORS = [C.green, C.amber, C.red, C.blue, C.purple, C.orange];

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface DashboardData {
    drivers: {
        total: number;
        active: number;
        blocked: number;
        available: number;
        busy: number;
        offline: number;
        list: any[];
    };
    transporters: {
        total: number;
        active: number;
        blocked: number;
        online: number;
        list: any[];
    };
    vehicles: {
        total: number;
        active: number;
        inactive: number;
        assigned: number;
        unassigned: number;
        byType: { name: string; value: number }[];
        list: any[];
    };
    freelancers: {
        total: number;
        active: number;
        blocked: number;
        list: any[];
    };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div
            className={`animate-pulse rounded-lg ${className}`}
            style={{ background: "rgba(255,255,255,0.05)" }}
        />
    );
}

interface KpiCardProps {
    label: string;
    value: string | number;
    sub?: string;
    color?: string;
    colorDim?: string;
    icon: React.ReactNode;
    badge?: { label: string; color: string; dim: string };
}

function KpiCard({ label, value, sub, color = C.amber, colorDim = C.amberDim, icon, badge }: KpiCardProps) {
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
                <div className="text-[28px] font-semibold text-white leading-none tracking-tight">{value}</div>
                {sub && <div className="text-[12px] text-slate-500 mt-1">{sub}</div>}
            </div>
            {badge && (
                <div className="flex items-center gap-1.5 mt-auto">
                    <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: badge.dim, color: badge.color }}
                    >
                        {badge.label}
                    </span>
                </div>
            )}
            <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }}
            />
        </div>
    );
}

function ChartCard({ title, subtitle, children, className = "" }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`rounded-2xl p-5 flex flex-col gap-4 ${className}`}
            style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
            <div>
                <span className="text-[14px] font-semibold text-slate-200">{title}</span>
                {subtitle && <p className="text-[12px] text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            {children}
        </div>
    );
}

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

function StatusDot({ color }: { color: string }) {
    return (
        <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
    );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icons = {
    Driver: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    Transporter: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    Vehicle: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v7a2 2 0 01-2 2h-2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="9" cy="17" r="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    Freelancer: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M22 11l-3 3-1.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Shipment: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Branch: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" />
            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="1.5" />
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

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
    return (
        <div className="min-h-screen p-6 space-y-6" style={{ background: C.surface }}>
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-8 w-32" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Skeleton className="h-64 lg:col-span-2" />
                <Skeleton className="h-64" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Skeleton className="h-72" />
                <Skeleton className="h-72" />
            </div>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SupervisorDashboard() {
    const { associated } = userStore();
    const supervisor = associated as ISupervisorResponse | null;

    // Extract branch and company info from the associated supervisor object
    const branchId = typeof supervisor?.branchId === "object"
        ? (supervisor.branchId as any)?._id
        : supervisor?.branchId;
    const branchName = typeof supervisor?.branchId === "object"
        ? (supervisor.branchId as any)?.name
        : undefined;
    const companyId = supervisor?.companyId;

    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (isRefresh = false) => {
        if (!branchId || !companyId) {
            setError("Branch or company information not available.");
            setLoading(false);
            return;
        }

        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const [driversRes, transportersRes, freelancersRes, vehiclesRes] = await Promise.allSettled([
                listDrivers(branchId),
                listTransporters(companyId),
                listFreelancers(branchId),
                getCompanyVehicles(companyId),
            ]);

            // ── Drivers ────────────────────────────────────────────────────────
            const driverList: any[] = driversRes.status === "fulfilled" ? (driversRes.value?.data ?? []) : [];
            const drivers = {
                total: driverList.length,
                active: driverList.filter((d) => d.isActive !== false).length,
                blocked: driverList.filter((d) => d.isActive === false).length,
                available: driverList.filter((d) => d.availabilityStatus === "available").length,
                busy: driverList.filter((d) => d.availabilityStatus === "busy").length,
                offline: driverList.filter((d) => !d.availabilityStatus || d.availabilityStatus === "offline").length,
                list: driverList.slice(0, 5),
            };

            // ── Transporters ───────────────────────────────────────────────────
            const transporterList: any[] = transportersRes.status === "fulfilled" ? (transportersRes.value?.data ?? []) : [];
            const transporters = {
                total: transporterList.length,
                active: transporterList.filter((t) => t.isActive !== false).length,
                blocked: transporterList.filter((t) => t.isActive === false).length,
                online: transporterList.filter((t) => t.isOnline).length,
                list: transporterList.slice(0, 5),
            };

            // ── Freelancers ────────────────────────────────────────────────────
            const freelancerList: any[] = freelancersRes.status === "fulfilled" ? (freelancersRes.value?.data ?? []) : [];
            const freelancers = {
                total: freelancerList.length,
                active: freelancerList.filter((f) => f.isActive !== false).length,
                blocked: freelancerList.filter((f) => f.isActive === false).length,
                list: freelancerList.slice(0, 5),
            };

            // ── Vehicles ───────────────────────────────────────────────────────
            const rawVehicles = vehiclesRes.status === "fulfilled" ? vehiclesRes.value : null;
            const vehicleList: any[] = (rawVehicles as any)?.vehicles ?? (rawVehicles as any)?.data ?? [];
            const vehicleTypeMap: Record<string, number> = {};
            vehicleList.forEach((v: any) => {
                const type = v.type || v.vehicleType || "Other";
                vehicleTypeMap[type] = (vehicleTypeMap[type] ?? 0) + 1;
            });
            const vehicles = {
                total: vehicleList.length,
                active: vehicleList.filter((v) => v.isActive !== false).length,
                inactive: vehicleList.filter((v) => v.isActive === false).length,
                assigned: vehicleList.filter((v) => v.assignedTransporterId || v.isAssigned).length,
                unassigned: vehicleList.filter((v) => !v.assignedTransporterId && !v.isAssigned).length,
                byType: Object.entries(vehicleTypeMap).map(([name, value]) => ({ name, value })),
                list: vehicleList.slice(0, 5),
            };

            setData({ drivers, transporters, vehicles, freelancers });
        } catch (e: any) {
            setError(e?.message ?? "Failed to load dashboard data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [branchId, companyId]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <LoadingSkeleton />;

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
                        onClick={() => load(true)}
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

    const { drivers, transporters, vehicles, freelancers } = data;

    // ── Chart data ──────────────────────────────────────────────────────────────

    const driverStatusData = [
        { name: "Available", value: drivers.available, color: C.green },
        { name: "Busy", value: drivers.busy, color: C.amber },
        { name: "Offline", value: drivers.offline, color: C.slate },
        { name: "Blocked", value: drivers.blocked, color: C.red },
    ].filter(d => d.value > 0);

    const transporterStatusData = [
        { name: "Online", value: transporters.online, color: C.green },
        { name: "Offline", value: transporters.active - transporters.online, color: C.amber },
        { name: "Blocked", value: transporters.blocked, color: C.red },
    ].filter(d => d.value > 0);

    const staffOverviewData = [
        { name: "Drivers", total: drivers.total, active: drivers.active, blocked: drivers.blocked },
        { name: "Transporters", total: transporters.total, active: transporters.active, blocked: transporters.blocked },
        { name: "Freelancers", total: freelancers.total, active: freelancers.active, blocked: freelancers.blocked },
    ];

    const vehicleAssignmentData = [
        { name: "Assigned", value: vehicles.assigned, color: C.green },
        { name: "Unassigned", value: vehicles.unassigned, color: C.amber },
        { name: "Inactive", value: vehicles.inactive, color: C.red },
    ].filter(d => d.value > 0);

    const totalStaff = drivers.total + transporters.total + freelancers.total;
    const activeStaff = drivers.active + transporters.active + freelancers.active;

    return (
        <div className="min-h-screen overflow-y-auto" style={{ background: C.surface }}>
            <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">

                {/* ── Header ────────────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[20px] font-semibold text-white tracking-tight">
                            Supervisor Dashboard
                        </h1>
                        <p className="text-[13px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px]"
                                style={{ background: C.amberDim, color: C.amber, border: `1px solid ${C.amber}30` }}
                            >
                                <Icons.Branch />
                                {branchName ?? "Your Branch"}
                            </span>
                            · Branch operational overview
                        </p>
                    </div>

                    <button
                        onClick={() => load(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all self-start"
                        style={{
                            background: C.card,
                            border: `1px solid ${C.border}`,
                            color: "#475569",
                        }}
                    >
                        <div className={refreshing ? "animate-spin" : ""}><Icons.Refresh /></div>
                        {refreshing ? "Refreshing…" : "Refresh"}
                    </button>
                </div>

                {/* ── KPI Row ────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        label="Total Drivers"
                        value={drivers.total}
                        sub={`${drivers.active} active · ${drivers.blocked} blocked`}
                        color={C.blue}
                        colorDim={C.blueDim}
                        icon={<Icons.Driver />}
                        badge={drivers.available > 0
                            ? { label: `${drivers.available} available`, color: C.green, dim: C.greenDim }
                            : undefined
                        }
                    />
                    <KpiCard
                        label="Transporters"
                        value={transporters.total}
                        sub={`${transporters.online} online now`}
                        color={C.purple}
                        colorDim={C.purDim}
                        icon={<Icons.Transporter />}
                        badge={transporters.active > 0
                            ? { label: `${transporters.active} active`, color: C.green, dim: C.greenDim }
                            : undefined
                        }
                    />
                    <KpiCard
                        label="Vehicles"
                        value={vehicles.total}
                        sub={`${vehicles.assigned} assigned · ${vehicles.active} active`}
                        color={C.orange}
                        colorDim={C.orgDim}
                        icon={<Icons.Vehicle />}
                        badge={vehicles.unassigned > 0
                            ? { label: `${vehicles.unassigned} available`, color: C.amber, dim: C.amberDim }
                            : undefined
                        }
                    />
                    <KpiCard
                        label="Freelancers"
                        value={freelancers.total}
                        sub={`${freelancers.active} active · ${freelancers.blocked} blocked`}
                        color={C.teal}
                        colorDim={C.tealDim}
                        icon={<Icons.Freelancer />}
                    />
                </div>

                {/* ── Active Staff Banner ────────────────────────────────────────── */}
                <div
                    className="rounded-2xl px-6 py-4 flex items-center justify-between flex-wrap gap-4"
                    style={{
                        background: `linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(96,165,250,0.06) 100%)`,
                        border: `1px solid ${C.amberDim}`,
                    }}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: C.amberDim, color: C.amber }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" />
                                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-semibold text-[16px]">
                                {activeStaff} <span className="text-slate-400 font-normal text-[14px]">of</span> {totalStaff} staff active
                            </p>
                            <p className="text-slate-500 text-[12px]">Across drivers, transporters and freelancers</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {[
                            { label: "Drivers", active: drivers.active, total: drivers.total, color: C.blue },
                            { label: "Transporters", active: transporters.active, total: transporters.total, color: C.purple },
                            { label: "Freelancers", active: freelancers.active, total: freelancers.total, color: C.teal },
                        ].map(({ label, active, total, color }) => {
                            const pct = total > 0 ? Math.round((active / total) * 100) : 0;
                            return (
                                <div key={label} className="text-center hidden md:block">
                                    <div className="text-[22px] font-semibold" style={{ color }}>{pct}%</div>
                                    <div className="text-[11px] text-slate-500">{label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Charts Row 1 ──────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Staff overview bar chart */}
                    <ChartCard
                        title="Staff Overview"
                        subtitle="Active vs blocked per category"
                        className="lg:col-span-2"
                    >
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart
                                data={staffOverviewData}
                                margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
                                barSize={22}
                                barGap={4}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                <Legend
                                    iconType="circle" iconSize={7}
                                    formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{v}</span>}
                                />
                                <Bar dataKey="total" name="Total" fill={`${C.blue}60`} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="active" name="Active" fill={C.green} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="blocked" name="Blocked" fill={C.red} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Driver availability pie */}
                    <ChartCard title="Driver Availability" subtitle="Current status breakdown">
                        {driverStatusData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={160}>
                                    <PieChart>
                                        <Pie
                                            data={driverStatusData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%" cy="50%"
                                            innerRadius={45} outerRadius={70}
                                            paddingAngle={3}
                                        >
                                            {driverStatusData.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ background: "#111827", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12 }}
                                            itemStyle={{ color: "#cbd5e1" }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-col gap-2">
                                    {driverStatusData.map((d) => (
                                        <div key={d.name} className="flex items-center gap-2">
                                            <StatusDot color={d.color} />
                                            <span className="text-[12px] text-slate-400 flex-1">{d.name}</span>
                                            <span className="text-[12px] font-semibold text-white">{d.value}</span>
                                            <span className="text-[11px] text-slate-600 w-9 text-right">
                                                {drivers.total > 0 ? `${Math.round((d.value / drivers.total) * 100)}%` : "–"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-32 text-slate-600 text-[13px]">No drivers found</div>
                        )}
                    </ChartCard>
                </div>

                {/* ── Charts Row 2 ──────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Vehicle assignment donut */}
                    <ChartCard title="Vehicle Fleet Status" subtitle="Assignment & availability breakdown">
                        <div className="flex items-center gap-6">
                            <div className="flex-shrink-0">
                                <ResponsiveContainer width={160} height={160}>
                                    <PieChart>
                                        <Pie
                                            data={vehicleAssignmentData.length > 0 ? vehicleAssignmentData : [{ name: "No vehicles", value: 1, color: C.slate }]}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%" cy="50%"
                                            innerRadius={42} outerRadius={68}
                                            paddingAngle={3}
                                            startAngle={90}
                                            endAngle={-270}
                                        >
                                            {(vehicleAssignmentData.length > 0 ? vehicleAssignmentData : [{ name: "No vehicles", value: 1, color: C.slate }]).map((entry, i) => (
                                                <Cell key={i} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ background: "#111827", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12 }}
                                            itemStyle={{ color: "#cbd5e1" }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="text-center mb-2">
                                    <div className="text-[32px] font-bold text-white leading-none">{vehicles.total}</div>
                                    <div className="text-[12px] text-slate-500">Total Vehicles</div>
                                </div>
                                {vehicleAssignmentData.map((v) => (
                                    <div key={v.name} className="flex items-center gap-2">
                                        <StatusDot color={v.color} />
                                        <span className="text-[13px] text-slate-400 flex-1">{v.name}</span>
                                        <span
                                            className="text-[12px] font-semibold px-2 py-0.5 rounded-full"
                                            style={{ background: `${v.color}20`, color: v.color }}
                                        >
                                            {v.value}
                                        </span>
                                    </div>
                                ))}
                                {vehicles.byType.length > 0 && (
                                    <div className="pt-2 border-t" style={{ borderColor: C.border }}>
                                        <p className="text-[11px] text-slate-600 mb-1.5 uppercase tracking-wider">By Type</p>
                                        {vehicles.byType.slice(0, 3).map((t, i) => (
                                            <div key={t.name} className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 rounded-sm" style={{ background: PIE_COLORS[i] }} />
                                                <span className="text-[12px] text-slate-400 flex-1 truncate capitalize">{t.name}</span>
                                                <span className="text-[12px] text-white font-medium">{t.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </ChartCard>

                    {/* Transporter status */}
                    <ChartCard title="Transporter Status" subtitle="Online / offline / blocked breakdown">
                        {transporterStatusData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={160}>
                                    <PieChart>
                                        <Pie
                                            data={transporterStatusData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%" cy="50%"
                                            innerRadius={45} outerRadius={70}
                                            paddingAngle={3}
                                        >
                                            {transporterStatusData.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ background: "#111827", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12 }}
                                            itemStyle={{ color: "#cbd5e1" }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-col gap-2.5">
                                    {transporterStatusData.map((t) => {
                                        const pct = transporters.total > 0 ? Math.round((t.value / transporters.total) * 100) : 0;
                                        return (
                                            <div key={t.name} className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <StatusDot color={t.color} />
                                                    <span className="text-[12px] text-slate-400 flex-1">{t.name}</span>
                                                    <span className="text-[12px] font-semibold text-white">{t.value}</span>
                                                    <span className="text-[11px] text-slate-600 w-9 text-right">{pct}%</span>
                                                </div>
                                                <div className="h-1 rounded-full ml-4" style={{ background: "rgba(255,255,255,0.07)" }}>
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{ width: `${pct}%`, background: t.color }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-40 text-slate-600 text-[13px]">No transporter data</div>
                        )}
                    </ChartCard>
                </div>

                {/* ── People Lists Row ──────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Recent Drivers */}
                    <ChartCard title="Recent Drivers" subtitle={`${drivers.total} total drivers`}>
                        {drivers.list.length > 0 ? (
                            <div className="space-y-2.5">
                                {drivers.list.map((d: any, i: number) => {
                                    const name = d.fullName ?? `${d.userId?.firstName ?? ""} ${d.userId?.lastName ?? ""}`.trim() ?? "—";
                                    const isActive = d.isActive !== false;
                                    const status = d.availabilityStatus ?? (isActive ? "active" : "blocked");
                                    const statusColor = status === "available" ? C.green : status === "busy" ? C.amber : isActive ? C.slate : C.red;
                                    return (
                                        <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: C.border }}>
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                                                style={{ background: C.blueDim, color: C.blue }}
                                            >
                                                {name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "D"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[13px] text-white font-medium truncate">{name || "—"}</div>
                                                <div className="text-[11px] text-slate-500 truncate">{d.email ?? d.userId?.email ?? "—"}</div>
                                            </div>
                                            <span
                                                className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize shrink-0"
                                                style={{ background: `${statusColor}20`, color: statusColor }}
                                            >
                                                {status}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-24 text-slate-600 text-[13px]">No drivers</div>
                        )}
                    </ChartCard>

                    {/* Recent Transporters */}
                    <ChartCard title="Recent Transporters" subtitle={`${transporters.total} total transporters`}>
                        {transporters.list.length > 0 ? (
                            <div className="space-y-2.5">
                                {transporters.list.map((t: any, i: number) => {
                                    const name = t.fullName ?? "—";
                                    const isOnline = t.isOnline;
                                    const isActive = t.isActive !== false;
                                    const statusColor = isOnline ? C.green : isActive ? C.amber : C.red;
                                    const statusLabel = isOnline ? "online" : isActive ? "offline" : "blocked";
                                    return (
                                        <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: C.border }}>
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                                                style={{ background: C.purDim, color: C.purple }}
                                            >
                                                {name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "T"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[13px] text-white font-medium truncate">{name}</div>
                                                <div className="text-[11px] text-slate-500 truncate">{t.email ?? "—"}</div>
                                            </div>
                                            <span
                                                className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize shrink-0"
                                                style={{ background: `${statusColor}20`, color: statusColor }}
                                            >
                                                {statusLabel}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-24 text-slate-600 text-[13px]">No transporters</div>
                        )}
                    </ChartCard>

                    {/* Recent Freelancers */}
                    <ChartCard title="Recent Freelancers" subtitle={`${freelancers.total} total freelancers`}>
                        {freelancers.list.length > 0 ? (
                            <div className="space-y-2.5">
                                {freelancers.list.map((f: any, i: number) => {
                                    const uid = f.userId;
                                    const name = typeof uid === "object"
                                        ? `${uid?.firstName ?? ""} ${uid?.lastName ?? ""}`.trim()
                                        : f.fullName ?? "—";
                                    const isActive = f.isActive !== false;
                                    const statusColor = isActive ? C.teal : C.red;
                                    return (
                                        <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: C.border }}>
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                                                style={{ background: C.tealDim, color: C.teal }}
                                            >
                                                {name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "F"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[13px] text-white font-medium truncate">{name || "—"}</div>
                                                <div className="text-[11px] text-slate-500 truncate">{(typeof uid === "object" ? uid?.email : f.email) ?? "—"}</div>
                                            </div>
                                            <span
                                                className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize shrink-0"
                                                style={{ background: `${statusColor}20`, color: statusColor }}
                                            >
                                                {isActive ? "active" : "blocked"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-24 text-slate-600 text-[13px]">No freelancers</div>
                        )}
                    </ChartCard>
                </div>

                {/* ── Vehicle list ──────────────────────────────────────────────── */}
                {vehicles.list.length > 0 && (
                    <ChartCard title="Fleet — Recent Vehicles" subtitle={`${vehicles.total} vehicles registered`}>
                        <div
                            className="rounded-xl overflow-hidden"
                            style={{ border: `1px solid ${C.border}` }}
                        >
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${C.border}` }}>
                                        {["Vehicle", "Type", "Plate", "Status", "Assignment"].map((h) => (
                                            <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody style={{ background: C.card }}>
                                    {vehicles.list.map((v: any, i: number) => {
                                        const isActive = v.isActive !== false;
                                        const isAssigned = !!(v.assignedTransporterId || v.isAssigned);
                                        return (
                                            <tr
                                                key={i}
                                                style={{ borderBottom: i < vehicles.list.length - 1 ? `1px solid ${C.border}` : "none" }}
                                                className="transition-colors hover:bg-white/[0.01]"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                                            style={{ background: C.orgDim, color: C.orange }}
                                                        >
                                                            <Icons.Vehicle />
                                                        </div>
                                                        <span className="text-white font-medium truncate max-w-[100px]">
                                                            {v.brand ?? v.make ?? "Vehicle"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-400 capitalize">{v.type ?? v.vehicleType ?? "—"}</td>
                                                <td className="px-4 py-3 font-mono text-slate-300">{v.licensePlate ?? v.plate ?? "—"}</td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                                        style={isActive
                                                            ? { background: C.greenDim, color: C.green }
                                                            : { background: "rgba(100,116,139,0.15)", color: "#64748b" }
                                                        }
                                                    >
                                                        {isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                                        style={isAssigned
                                                            ? { background: C.amberDim, color: C.amber }
                                                            : { background: C.greenDim, color: C.green }
                                                        }
                                                    >
                                                        {isAssigned ? "Assigned" : "Free"}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </ChartCard>
                )}

            </div>
        </div>
    );
}
