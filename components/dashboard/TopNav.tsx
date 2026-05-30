"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import userStore from "@/stores/userStore";
import { ROLES, ROLE_ROUTES } from "@/lib/roles";

const MOBILE_ROUTES = [
    { path: "/dashboard", label: "Overview", allowed: ROLE_ROUTES["/dashboard"] },
    { path: "/dashboard/operations", label: "Operations", allowed: ROLE_ROUTES["/dashboard/operations"] },
    { path: "/dashboard/management", label: "Management", allowed: ROLE_ROUTES["/dashboard/management"] },
    { path: "/dashboard/branches", label: "Branches", allowed: [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER] },
    { path: "/dashboard/owner/branches", label: "Branch Managers", allowed: [ROLES.OWNER] },
    { path: "/dashboard/overview", label: "Overview", allowed: [ROLES.ADMIN, ROLES.OWNER, ROLES.MANAGER] },
    { path: "/dashboard/supervisors", label: "Supervisors", allowed: [ROLES.MANAGER, ROLES.OWNER, ROLES.ADMIN] },
    { path: "/dashboard/transporters", label: "Transporters", allowed: [ROLES.MANAGER, ROLES.OWNER, ROLES.ADMIN] },
    { path: "/dashboard/freelancers", label: "Freelancers", allowed: [ROLES.MANAGER, ROLES.OWNER, ROLES.ADMIN, ROLES.SUPERVISOR] },
    { path: "/dashboard/routes", label: "Routes", allowed: [ROLES.MANAGER, ROLES.OWNER, ROLES.ADMIN, ROLES.RECEPTIONIST] },
    { path: "/dashboard/company", label: "Company", allowed: [ROLES.MANAGER, ROLES.OWNER, ROLES.ADMIN] },
    { path: "/dashboard/inventory", label: "Inventory", allowed: ROLE_ROUTES["/dashboard/operations"] },
    { path: "/dashboard/management/users", label: "Users", allowed: [ROLES.ADMIN, ROLES.OWNER] },
];

export default function TopNav() {
    const { user, logout } = userStore();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const pathname = usePathname();
    const role = user?.role;

    const allowedRoutes = MOBILE_ROUTES.filter(
        (r) => !r.allowed || r.allowed.includes(role as any)
    );

    // Derive current page label
    const currentRoute = MOBILE_ROUTES.find(
        (r) => pathname === r.path || pathname?.startsWith(r.path + "/")
    );

    const initials = user?.fullName
        ?.split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() ?? "?";

    return (
        <>
            <header className="border relative z-40 border-white/10 rounded-lg bg-[#06090f]/90 backdrop-blur-md w-full">
                <div className="flex items-center justify-between px-5 h-14">

                    {/* Left: mobile menu + breadcrumb */}
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden p-1.5 rounded-lg border border-white/8 text-slate-400 hover:text-amber-400 hover:border-amber-500/20 transition-all"
                            onClick={() => setMobileOpen((v) => !v)}
                            aria-label="Toggle menu"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                {mobileOpen
                                    ? <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    : <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                }
                            </svg>
                        </button>

                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-600 hidden md:inline">Dashboard</span>
                            {currentRoute && (
                                <>
                                    <svg className="hidden md:block" width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 18l6-6-6-6" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    <span className="text-slate-300 font-medium">{currentRoute.label}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2">

                        {/* Search trigger (desktop) */}
                        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.07] bg-white/2 text-slate-500 hover:border-white/12 hover:text-slate-400 transition-all text-xs">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span>Search</span>
                            <kbd className="border border-white/8 rounded px-1 py-px font-mono text-[10px] text-slate-600">⌘K</kbd>
                        </button>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setNotifOpen((v) => !v)}
                                className="relative p-2 rounded-lg border border-white/[0.07] bg-white/2 text-slate-400 hover:text-white hover:border-white/12 transition-all"
                                aria-label="Notifications"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                    <path d="M15 17H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M10.7 7a2.7 2.7 0 115.4 0v3.2l1.2 2.4a1 1 0 01-.9 1.4H6.6a1 1 0 01-.9-1.4L7 10.2V7z"
                                        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                </svg>
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-[#06090f]"
                                    style={{ background: "#fbbf24", color: "#030712" }}>
                                    3
                                </span>
                            </button>

                            {/* Notif dropdown */}
                            {notifOpen && (
                                <div className="absolute right-0 top-10 w-72 rounded-xl border border-white/8 bg-[#0d1117] shadow-2xl z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between">
                                        <span className="text-[13px] font-semibold text-white">Notifications</span>
                                        <span className="text-[11px] text-amber-400 cursor-pointer hover:text-amber-300">Mark all read</span>
                                    </div>
                                    {[
                                        { title: "Shipment delayed", sub: "Route MI→RM · 2h ago", dot: "#f97316" },
                                        { title: "New user registered", sub: "Marco Bellini · 4h ago", dot: "#a78bfa" },
                                        { title: "Inventory audit done", sub: "Hub Milan-North · 6h ago", dot: "#22d3ee" },
                                    ].map((n, i) => (
                                        <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-white/3 cursor-pointer border-b border-white/4 last:border-0 transition-colors">
                                            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.dot }} />
                                            <div>
                                                <div className="text-[13px] text-slate-200">{n.title}</div>
                                                <div className="text-[11px] text-slate-500 mt-0.5">{n.sub}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* User avatar + name (desktop) */}
                        <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-white/[0.07] ml-1">
                            <div className="text-right">
                                <div className="text-[13px] font-medium text-slate-200 leading-none">{user?.fullName ?? "Guest"}</div>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{role}</div>
                            </div>
                            <div className="w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-bold text-amber-400 shrink-0"
                                style={{ borderColor: "rgba(251,191,36,0.3)", background: "rgba(251,191,36,0.08)" }}>
                                {initials}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-40 flex">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="relative w-72 max-w-[85vw] bg-[#0a0c12] border-r border-white/[0.07] flex flex-col h-full z-10">
                        {/* Header */}
                        <div className="px-5 py-5 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)" }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                                            stroke="#030712" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="font-display font-bold text-[15px] text-white">NEXUS</span>
                            </div>
                            <button onClick={() => setMobileOpen(false)} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        {/* User */}
                        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full border flex items-center justify-center text-[12px] font-bold text-amber-400"
                                style={{ borderColor: "rgba(251,191,36,0.3)", background: "rgba(251,191,36,0.08)" }}>
                                {initials}
                            </div>
                            <div>
                                <div className="text-[14px] font-medium text-white">{user?.fullName ?? "Guest"}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{role}</div>
                            </div>
                        </div>

                        {/* Links */}
                        <nav className="flex-1 px-3 py-3 flex flex-col gap-1 overflow-y-auto">
                            {allowedRoutes.map((r) => {
                                const isActive = pathname === r.path || pathname?.startsWith(r.path + "/");
                                return (
                                    <Link
                                        key={r.path}
                                        href={r.path}
                                        onClick={() => setMobileOpen(false)}
                                        className={`
                                            flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all
                                            ${isActive
                                                ? "text-amber-300"
                                                : "text-slate-400 hover:text-slate-200"
                                            }
                                        `}
                                        style={isActive ? {
                                            background: "rgba(251,191,36,0.07)",
                                            border: "1px solid rgba(251,191,36,0.13)",
                                        } : {
                                            border: "1px solid transparent",
                                        }}
                                    >
                                        <div className={`w-1 h-4 rounded-full shrink-0 ${isActive ? "bg-amber-400" : "bg-transparent"}`} />
                                        {r.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Sign out */}
                        <div className="px-3 py-4 border-t border-white/5">
                            <button
                                onClick={() => logout()}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-slate-500 hover:text-amber-300 hover:bg-amber-500/5 transition-all border border-transparent hover:border-amber-500/10"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M16 17l5-5-5-5M21 12H9M13 19H6a2 2 0 01-2-2V7a2 2 0 012-2h7"
                                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}