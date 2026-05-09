"use client";

import React from "react";
import Link from "next/link";
import { ROLES } from "@/lib/roles";
import userStore from "@/stores/userStore";

const STATS = [
    {
        label: "Total Orders",
        value: "1,284",
        delta: "+12.4%",
        positive: true,
        accent: "#fbbf24",
    },
    {
        label: "Shipments",
        value: "847",
        delta: "+8.1%",
        positive: true,
        accent: "#22d3ee",
    },
    {
        label: "Active Branches",
        value: "12",
        delta: "of 14 total",
        positive: true,
        accent: "#a78bfa",
    },
    {
        label: "Open Alerts",
        value: "3",
        delta: "Needs attention",
        positive: false,
        accent: "#f97316",
    },
];

const ACTIVITY = [
    { label: "Order #8821 dispatched", sub: "Branch Milano-Sud · 2 min ago", dot: "#34d399" },
    { label: "Inventory audit completed", sub: "Hub Milan-North · 18 min ago", dot: "#22d3ee" },
    { label: "New user registered", sub: "Marco Bellini — SORTER · 1h ago", dot: "#a78bfa" },
    { label: "Shipment delayed — weather", sub: "Route MI→RM · 2h ago", dot: "#f97316" },
    { label: "Branch Torino opened", sub: "Silvia Greco — BRANCH_MANAGER · 3h ago", dot: "#fbbf24" },
];

const SHORTCUTS = [
    { href: "/dashboard/operations", label: "Operations", accent: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.18)" },
    { href: "/dashboard/management", label: "Management", accent: "#22d3ee", bg: "rgba(34,211,238,0.06)", border: "rgba(34,211,238,0.15)" },
    { href: "/dashboard/branches", label: "Branches", accent: "#a78bfa", bg: "rgba(167,139,250,0.06)", border: "rgba(167,139,250,0.15)" },
    { href: "/dashboard/inventory", label: "Inventory", accent: "#34d399", bg: "rgba(52,211,153,0.06)", border: "rgba(52,211,153,0.15)" },
];

export default function DashboardPage() {
    const { user } = userStore();
    const role = user?.role;

    const firstName = user?.fullName?.split(" ")[0] ?? "there";

    return (
        <div className="space-y-6">

            {/* Welcome header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-white tracking-tight">
                        Good morning, {firstName} 👋
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Here's what's happening across your operations today.
                    </p>
                </div>
                <div className="hidden sm:block text-right">
                    <div className="text-xs text-slate-600 font-mono">
                        {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {STATS.map((s) => (
                    <div
                        key={s.label}
                        className="relative rounded-xl overflow-hidden border border-white/6 bg-[#06090f] p-4"
                    >
                        {/* Accent top bar */}
                        <div
                            className="absolute top-0 left-0 right-0 h-0.5"
                            style={{ background: `linear-gradient(90deg, ${s.accent}, transparent)` }}
                        />
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-semibold">
                            {s.label}
                        </div>
                        <div className="font-display text-2xl font-extrabold text-white">
                            {s.value}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                            {s.positive && (
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="#34d399" strokeWidth="2.5" />
                                    <polyline points="17 6 23 6 23 12" stroke="#34d399" strokeWidth="2.5" />
                                </svg>
                            )}
                            <span className="text-[11px]" style={{ color: s.positive ? "#34d399" : s.accent }}>
                                {s.delta}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Two-col layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">

                {/* Activity feed */}
                <div className="rounded-xl border border-white/6 bg-[#06090f] overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                        <h2 className="font-display text-[14px] font-semibold text-white tracking-tight">
                            Recent Activity
                        </h2>
                        <button className="text-[12px] text-amber-400 hover:text-amber-300 transition-colors">
                            View all →
                        </button>
                    </div>
                    <div>
                        {ACTIVITY.map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 px-5 py-3.5 border-b border-white/4 last:border-0 hover:bg-white/1.5 transition-colors cursor-pointer"
                            >
                                <div
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ background: item.dot }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="text-[13px] text-slate-200 truncate">{item.label}</div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">{item.sub}</div>
                                </div>
                                <svg className="text-slate-700 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-4">

                    {/* Quick shortcuts */}
                    <div className="rounded-xl border border-white/6 bg-[#06090f] p-4">
                        <h3 className="font-display text-[13px] font-semibold text-white tracking-tight mb-3">
                            Quick Access
                        </h3>
                        <div className="flex flex-col gap-2">
                            {SHORTCUTS.map((s) => (
                                <Link
                                    key={s.href}
                                    href={s.href}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all"
                                    style={{
                                        background: s.bg,
                                        border: `1px solid ${s.border}`,
                                        color: s.accent,
                                    }}
                                >
                                    {s.label}
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Active roles */}
                    <div className="rounded-xl border border-white/6 bg-[#06090f] p-4">
                        <h3 className="font-display text-[13px] font-semibold text-white tracking-tight mb-3">
                            Active Roles
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {Object.values(ROLES).map((r) => (
                                <span
                                    key={r}
                                    className={`
                                        px-2 py-1 rounded-md text-[10px] font-mono tracking-wide border
                                        ${r === role
                                            ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
                                            : "border-white/[0.07] bg-white/3 text-slate-500"
                                        }
                                    `}
                                >
                                    {r}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}