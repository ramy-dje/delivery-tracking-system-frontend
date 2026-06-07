"use client";

import { ReactNode } from "react";
import userStore from "@/stores/userStore";
import {
    LineChart, Line, AreaChart, Area,
    XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

/* ── DATA ── */

const monthlyPackages = [
    { day: "01", packages: 120 },
    { day: "05", packages: 340 },
    { day: "10", packages: 280 },
    { day: "15", packages: 500 },
    { day: "20", packages: 420 },
    { day: "25", packages: 610 },
    { day: "30", packages: 750 },
];

const revenueData = [
    { week: "Week 1", revenue: 240 },
    { week: "Week 2", revenue: 139 },
    { week: "Week 3", revenue: 480 },
    { week: "Week 4", revenue: 351 },
];

const userDistribution = [
    { name: "Clients", value: 1204 },
    { name: "Drivers", value: 452 },
    { name: "Transporters", value: 130 },
];

/* ── THEME COLORS ── */

const COLORS = {
    primary: "var(--color-primary)",
    secondary: "var(--color-secondary)",
    success: "var(--color-success)",
    muted: "var(--color-text-muted)",
    border: "var(--color-border-default)",
    surface: "var(--color-background-surface)",
};

/* ── TOOLTIP STYLE ── */

const tip = {
    contentStyle: {
        background: "var(--color-background-alt)",
        border: "1px solid var(--color-border-default)",
        borderRadius: "10px",
        fontSize: "12px",
        color: "var(--color-text-primary)",
    },
};

/* ── UI COMPONENTS ── */

function Card({ children }: { children: ReactNode }) {
    return (
        <div className="p-4 rounded-xl border"
            style={{
                background: COLORS.surface,
                borderColor: COLORS.border,
            }}
        >
            {children}
        </div>
    );
}

function SectionTitle({ emoji, children }: { emoji?: string; children: ReactNode }) {
    return (
        <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
            {emoji && <span>{emoji}</span>}
            {children}
        </h2>
    );
}

/* ── MAIN ── */

export default function AdminDashboard() {
    return (
        <div className="space-y-4">

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="p-4 rounded-xl border"
                    style={{ background: COLORS.surface, borderColor: COLORS.border }}>
                    <p className="text-xs" style={{ color: COLORS.muted }}>Total Companies</p>
                    <p className="text-2xl text-white font-bold">34</p>
                    <div className="h-0.5 mt-2" style={{ background: COLORS.primary }} />
                </div>

                <div className="p-4 rounded-xl border"
                    style={{ background: COLORS.surface, borderColor: COLORS.border }}>
                    <p className="text-xs" style={{ color: COLORS.muted }}>Total Branches</p>
                    <p className="text-2xl text-white font-bold">89</p>
                    <div className="h-0.5 mt-2" style={{ background: COLORS.secondary }} />
                </div>

                <div className="p-4 rounded-xl border"
                    style={{ background: COLORS.surface, borderColor: COLORS.border }}>
                    <p className="text-xs" style={{ color: COLORS.muted }}>Active Drivers</p>
                    <p className="text-2xl text-white font-bold">452</p>
                    <div className="h-0.5 mt-2" style={{ background: COLORS.success }} />
                </div>

                <div className="p-4 rounded-xl border"
                    style={{ background: COLORS.surface, borderColor: COLORS.border }}>
                    <p className="text-xs" style={{ color: COLORS.muted }}>Registered Clients</p>
                    <p className="text-2xl text-white font-bold">1,204</p>
                    <div className="h-0.5 mt-2" style={{ background: COLORS.primary }} />
                </div>

                <div className="p-4 rounded-xl border"
                    style={{ background: COLORS.surface, borderColor: COLORS.border }}>
                    <p className="text-xs" style={{ color: COLORS.muted }}>Monthly Revenue</p>
                    <p className="text-2xl text-white font-bold">1.2M <span className="text-sm font-normal text-slate-400">DZD</span></p>
                    <div className="h-0.5 mt-2" style={{ background: COLORS.secondary }} />
                </div>
            </div>

            {/* PLATFORM METRICS */}
            <section>
                <SectionTitle emoji="📈">Platform Activity</SectionTitle>

                <div className="grid grid-cols-1 gap-4">
                    {/* AREA CHART */}
                    <Card>
                        <p className="text-white text-sm font-semibold mb-3">
                            Packages Delivered (Last 30 Days)
                        </p>

                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={monthlyPackages}>
                                <defs>
                                    <linearGradient id="colorPackages" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" stroke={COLORS.muted} tickLine={false} axisLine={false} />
                                <YAxis stroke={COLORS.muted} tickLine={false} axisLine={false} />

                                <Tooltip {...tip} />

                                <Area 
                                    type="monotone" 
                                    dataKey="packages" 
                                    stroke={COLORS.primary} 
                                    fillOpacity={1} 
                                    fill="url(#colorPackages)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 mt-4">
                    {/* BAR CHART */}
                    <Card>
                        <p className="text-white text-sm font-semibold mb-3">
                            Revenue (in Thousands DZD)
                        </p>

                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={revenueData}>
                                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="week" stroke={COLORS.muted} tickLine={false} axisLine={false} />
                                <YAxis stroke={COLORS.muted} tickLine={false} axisLine={false} />
                                <Tooltip {...tip} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />

                                <Bar dataKey="revenue" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* PIE CHART */}
                    <Card>
                        <p className="text-white text-sm font-semibold mb-3">
                            User Distribution
                        </p>

                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={userDistribution}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill={COLORS.primary} />
                                    <Cell fill={COLORS.secondary} />
                                    <Cell fill={COLORS.success} />
                                </Pie>

                                <Tooltip {...tip} />
                                <Legend wrapperStyle={{ color: COLORS.muted, fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            </section>

        </div>
    );
}
