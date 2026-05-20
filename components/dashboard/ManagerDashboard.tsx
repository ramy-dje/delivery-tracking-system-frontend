"use client";

import { ReactNode } from "react";
import userStore from "@/stores/userStore";
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Cell, ScatterChart, Scatter,
    PieChart, Pie, Legend,
} from "recharts";

/* ── DATA ── */

const deliveryTimeTrend = [
    { day: "Mon", avg: 38 },
    { day: "Tue", avg: 42 },
    { day: "Wed", avg: 35 },
    { day: "Thu", avg: 29 },
    { day: "Fri", avg: 33 },
    { day: "Sat", avg: 47 },
    { day: "Sun", avg: 40 },
];

const driversData = [
    { name: "Ali", deliveries: 42, rating: 4.8 },
    { name: "Yacine", deliveries: 35, rating: 4.5 },
    { name: "Sara", deliveries: 28, rating: 4.9 },
    { name: "Omar", deliveries: 50, rating: 4.6 },
    { name: "Nadia", deliveries: 31, rating: 4.3 },
];

const onTimePie = [
    { name: "On Time", value: 78 },
    { name: "Late", value: 22 },
];

/* ── THEME COLORS (from your system) ── */

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

export default function ManagerDashboard() {
    const { user } = userStore();

    return (
        <div className="space-y-4">

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl border"
                    style={{ background: COLORS.surface, borderColor: COLORS.border }}>
                    <p className="text-xs" style={{ color: COLORS.muted }}>Active Drivers</p>
                    <p className="text-2xl text-white font-bold">5 / 6</p>
                    <div className="h-0.5 mt-2" style={{ background: COLORS.secondary }} />
                </div>

                <div className="p-4 rounded-xl border"
                    style={{ background: COLORS.surface, borderColor: COLORS.border }}>
                    <p className="text-xs" style={{ color: COLORS.muted }}>Avg Delivery Time</p>
                    <p className="text-2xl text-white font-bold">37 min</p>
                    <div className="h-0.5 mt-2" style={{ background: COLORS.primary }} />
                </div>

                <div className="p-4 rounded-xl border"
                    style={{ background: COLORS.surface, borderColor: COLORS.border }}>
                    <p className="text-xs" style={{ color: COLORS.muted }}>On-Time Rate</p>
                    <p className="text-2xl text-white font-bold">78%</p>
                    <div className="h-0.5 mt-2" style={{ background: COLORS.success }} />
                </div>

                <div className="p-4 rounded-xl border"
                    style={{ background: COLORS.surface, borderColor: COLORS.border }}>
                    <p className="text-xs" style={{ color: COLORS.muted }}>Vehicles</p>
                    <p className="text-2xl text-white font-bold">4 / 6</p>
                    <div className="h-0.5 mt-2" style={{ background: COLORS.primary }} />
                </div>
            </div>

            {/* DELIVERY PERFORMANCE */}
            <section>
                <SectionTitle emoji="🚚">Delivery Performance</SectionTitle>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">

                    {/* LINE CHART */}
                    <Card>
                        <p className="text-white text-sm font-semibold mb-3">
                            Avg Delivery Time (min)
                        </p>

                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={deliveryTimeTrend}>
                                <CartesianGrid stroke={COLORS.border} />
                                <XAxis dataKey="day" stroke={COLORS.muted} />
                                <YAxis stroke={COLORS.muted} />

                                <Tooltip {...tip} />

                                <Line
                                    type="monotone"
                                    dataKey="avg"
                                    stroke={COLORS.secondary}
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: COLORS.secondary }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* PIE CHART */}
                    <Card>
                        <p className="text-white text-sm font-semibold mb-3">
                            On-Time Rate
                        </p>

                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={onTimePie}
                                    innerRadius={55}
                                    outerRadius={80}
                                    dataKey="value"
                                >
                                    <Cell fill={COLORS.secondary} />
                                    <Cell fill={COLORS.primary} />
                                </Pie>

                                <Tooltip {...tip} />
                                <Legend wrapperStyle={{ color: COLORS.muted, fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>

                </div>
            </section>

            {/* DRIVERS */}
            <section>
                <SectionTitle emoji="👨‍✈️">Drivers Performance</SectionTitle>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* BAR */}
                    <Card>
                        <p className="text-white text-sm font-semibold mb-3">
                            Deliveries per Driver
                        </p>

                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={driversData}>
                                <CartesianGrid stroke={COLORS.border} />
                                <XAxis dataKey="name" stroke={COLORS.muted} />
                                <YAxis stroke={COLORS.muted} />
                                <Tooltip {...tip} />

                                <Bar dataKey="deliveries">
                                    {driversData.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={i % 2 === 0 ? COLORS.primary : COLORS.secondary}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* SCATTER */}
                    <Card>
                        <p className="text-white text-sm font-semibold mb-3">
                            Rating vs Deliveries
                        </p>

                        <ResponsiveContainer width="100%" height={210}>
                            <ScatterChart>
                                <CartesianGrid stroke={COLORS.border} />
                                <XAxis dataKey="deliveries" stroke={COLORS.muted} />
                                <YAxis dataKey="rating" domain={[4, 5]} stroke={COLORS.muted} />
                                <Tooltip {...tip} />

                                <Scatter data={driversData} fill={COLORS.primary} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </Card>

                </div>
            </section>

        </div>
    );
}