"use client";

import { ReactNode } from "react";
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Cell, Legend, PieChart, Pie,
} from "recharts";

/* ── MOCK DATA ── */

const revenueTrend = [
    { day: "Mon", revenue: 4200 }, { day: "Tue", revenue: 6800 },
    { day: "Wed", revenue: 5500 }, { day: "Thu", revenue: 8900 },
    { day: "Fri", revenue: 12300 }, { day: "Sat", revenue: 10400 },
    { day: "Sun", revenue: 7600 },
];

const branchPerformance = [
    { branch: "Constantine-SMK", orders: 320, revenue: 14200 },
    { branch: "Setif-North", orders: 410, revenue: 19800 },
    { branch: "Oran", orders: 215, revenue: 9400 },
    { branch: "Alger-Koba", orders: 178, revenue: 7600 },
    { branch: "Adrar", orders: 295, revenue: 12100 },
];

const regionOrders = [
    { region: "North", orders: 730 },
    { region: "East", orders: 593 },
    { region: "West", orders: 510 },
    { region: "Centre", orders: 478 },
    { region: "South", orders: 295 },
];

const revenueSplit = [
    { name: "Alger-Koba", value: 22600 },
    { name: "Constantine-SMK", value: 14200 },
    { name: "Oran", value: 13400 },
    { name: "Setif-North", value: 10800 },
    { name: "Adrar", value: 7100 },
];

const PALETTE = ["#fbbf24", "#22d3ee", "#a78bfa", "#34d399", "#f97316"];

const tip = {
    contentStyle: {
        background: "#0d1117",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "8px",
        fontSize: "12px",
        color: "#e5e7eb",
    },
};

function KpiCard({ label, value, color, sub }: { label: string, value: string, color: string, sub?: string }) {
    return (
        <div className="p-4 rounded-xl bg-background-surface border border-white/10 flex flex-col gap-1">
            <div className="text-xs text-slate-500">{label}</div>
            <div className="text-2xl font-bold text-white">{value}</div>
            {sub && <div className="text-[11px] text-slate-500">{sub}</div>}
            <div className="h-0.5 w-full mt-1 rounded-full" style={{ background: color }} />
        </div>
    );
}

function Card({ children, className = "" }: { children: ReactNode, className?: string }) {
    return (
        <div className={`p-4 rounded-xl bg-background-surface border border-white/10 ${className}`}>
            {children}
        </div>
    );
}

function SectionTitle({ emoji, children }: { emoji?: string, children: ReactNode }) {
    return (
        <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
            {emoji && <span>{emoji}</span>}
            {children}
        </h2>
    );
}


export default function OwnerDashboard() {
    return (
        <div className="space-y-3">

            {/* TOP KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <KpiCard label="Total Revenue Today" value="55,700 DA" color="#fbbf24" />
                <KpiCard label="Monthly Revenue" value="318k DA" color="#fbbf24" />
                <KpiCard label="Active Branches" value="5 / 6" color="#22d3ee" />
                <KpiCard label="Total Orders Today" value="1,418" color="#a78bfa" />
                <KpiCard label="Avg Order Value" value="44.9 DA" color="#34d399" />
            </div>

            {/* REVENUE TREND + SPLIT */}
            <section className="space-y-3">
                <SectionTitle emoji="💰">Revenue Analytics</SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
                    <Card>
                        <p className="text-white text-sm font-semibold mb-3">Revenue — Last 7 Days (DA)</p>
                        <ResponsiveContainer width="100%" height={230}>
                            <AreaChart data={revenueTrend}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k DA`} />
                                <Tooltip {...tip} formatter={v => [`${v.toLocaleString()} DA`, "Revenue"]} />
                                <Area type="monotone" dataKey="revenue" stroke="#fbbf24" strokeWidth={2} fill="url(#revGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card className="flex flex-col">
                        <p className="text-white text-sm font-semibold mb-3">Revenue Split by Branch</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart >
                                <Pie data={revenueSplit} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                    {revenueSplit.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                                </Pie>
                                <Tooltip {...tip} formatter={v => [`${v.toLocaleString()} DA`, "Revenue"]} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", color: "#9ca3af" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            </section>

            {/* BRANCH PERFORMANCE */}
            <section className="space-y-3">
                <SectionTitle emoji="🏢">Branch Performance</SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                        <p className="text-white text-sm font-semibold mb-3">Orders per Branch</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={branchPerformance}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="branch" stroke="#6b7280" tick={{ fontSize: 10 }} />
                                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                                <Tooltip {...tip} />
                                <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                                    {branchPerformance.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card>
                        <p className="text-white text-sm font-semibold mb-3">Orders by Region</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={regionOrders} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                                <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 11 }} />
                                <YAxis dataKey="region" type="category" stroke="#6b7280" tick={{ fontSize: 11 }} width={55} />
                                <Tooltip {...tip} />
                                <Bar dataKey="orders" radius={[0, 6, 6, 0]}>
                                    {regionOrders.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            </section>

        </div>
    );
}