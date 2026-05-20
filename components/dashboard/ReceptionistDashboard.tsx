"use client";

import React, { ReactNode, useMemo } from "react";
import userStore from "@/stores/userStore";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";

/* ───────── TYPES ───────── */

type OrderStatus = "pending" | "in-transit" | "delivered" | "cancelled";

type Driver = {
    name: string;
    deliveries: number;
    shiftLoad: number; // 0–100
    active: boolean;
};

/* ───────── MOCK DATA ───────── */

const drivers: Driver[] = [
    { name: "Ali", deliveries: 42, shiftLoad: 35, active: true },
    { name: "Yacine", deliveries: 35, shiftLoad: 55, active: true },
    { name: "Sara", deliveries: 28, shiftLoad: 25, active: true },
    { name: "Omar", deliveries: 50, shiftLoad: 85, active: true },
    { name: "Nadia", deliveries: 31, shiftLoad: 70, active: true },
    { name: "Karim", deliveries: 44, shiftLoad: 60, active: true },
];

const hourlyOrders = [
    { hour: "07h", count: 4 },
    { hour: "08h", count: 9 },
    { hour: "09h", count: 14 },
    { hour: "10h", count: 11 },
];

/* ───────── UI HELPERS ───────── */

function Card({ children }: { children: ReactNode }) {
    return (
        <div className="p-4 rounded-xl bg-[#06090f] border border-white/10">
            {children}
        </div>
    );
}

/* ───────── HEATMAP LOGIC ───────── */

function getLoadColor(load: number) {
    if (load >= 75) return "#ef4444"; // red overload
    if (load >= 45) return "#fbbf24"; // warning
    return "#34d399"; // available
}

/* ───────── DRIVER HEATMAP ───────── */

function DriverHeatmap({ data }: { data: Driver[] }) {
    return (
        <Card>
            <h2 className="text-white font-semibold mb-3">
                🚚 Driver Availability Heatmap
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {data.map((d) => {
                    const color = getLoadColor(d.shiftLoad);

                    return (
                        <div
                            key={d.name}
                            className="p-3 rounded-lg border border-white/10 bg-white/5"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-white text-sm font-semibold">
                                    {d.name}
                                </p>

                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ background: color }}
                                />
                            </div>

                            <p className="text-xs text-slate-400">
                                Deliveries: {d.deliveries}
                            </p>

                            {/* heat bar */}
                            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                        width: `${d.shiftLoad}%`,
                                        background: color,
                                    }}
                                />
                            </div>

                            <p className="text-[10px] text-slate-500 mt-1">
                                Load: {d.shiftLoad}%
                            </p>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

/* ───────── MAIN DASHBOARD ───────── */

export default function OpsDashboardV2() {
    const { user } = userStore();
    const firstName = user?.fullName?.split(" ")[0] ?? "Ops";

    /* ── SMART OPS ANALYTICS ── */
    const analytics = useMemo(() => {
        const totalLoad = drivers.reduce((a, d) => a + d.shiftLoad, 0);
        const avgLoad = Math.round(totalLoad / drivers.length);

        const overloadedDrivers = drivers.filter(d => d.shiftLoad >= 75).length;

        const risk =
            avgLoad > 70 || overloadedDrivers > 1
                ? "HIGH"
                : avgLoad > 45
                    ? "MEDIUM"
                    : "LOW";

        return { avgLoad, overloadedDrivers, risk };
    }, []);

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-bold text-white">
                    Ops Control Center
                </h1>
                <p className="text-slate-500 text-sm">
                    Real-time logistics intelligence — {firstName}
                </p>
            </div>

            {/* KPI STRIP */}
            <div className="grid grid-cols-3 lg:grid-cols-3 gap-3">
                <Card>
                    <p className="text-xs text-slate-500">Avg Fleet Load</p>
                    <p className="text-xl text-white font-bold">{analytics.avgLoad}%</p>
                </Card>

                <Card>
                    <p className="text-xs text-slate-500">Overloaded Drivers</p>
                    <p className="text-xl text-red-400 font-bold">{analytics.overloadedDrivers}</p>
                </Card>

                <Card>
                    <p className="text-xs text-slate-500">System Risk</p>
                    <p className={`text-xl font-bold ${analytics.risk === "HIGH"
                            ? "text-red-400"
                            : analytics.risk === "MEDIUM"
                                ? "text-amber-400"
                                : "text-green-400"
                        }`}>
                        {analytics.risk}
                    </p>
                </Card>
            </div>

            {/* DRIVER HEATMAP (MAIN FEATURE) */}
            <DriverHeatmap data={drivers} />

            {/* FLOW CHART */}
            <Card>
                <h2 className="text-white font-semibold mb-3">
                    📊 Order Flow (Hourly Demand)
                </h2>

                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={hourlyOrders}>
                        <CartesianGrid stroke="#1f2937" />
                        <XAxis dataKey="hour" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Bar dataKey="count">
                            {hourlyOrders.map((_, i) => (
                                <Cell
                                    key={i}
                                    fill={i >= 2 ? "#fbbf24" : "#22d3ee"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Card>

        </div>
    );
}