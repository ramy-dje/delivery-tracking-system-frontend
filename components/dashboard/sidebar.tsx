"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import userStore from "@/stores/userStore";
import { ROLES } from "@/lib/roles";
import { Award, Bell, Building2, DollarSign, Droplet, FileLineChartIcon, KeySquare, LayoutDashboard, Package, PenLine, Truck, User, UserCog } from "lucide-react";
import Image from "next/image";

const NAV_GROUPS = [
    {
        label: "Main",
        routes: [
            {
                path: "/dashboard/overview",
                label: "Overview",
                icon: (
                    <LayoutDashboard size={14} />
                ),
                allowed: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.MANAGER, ROLES.SORTER],
            },
            {
                path: "/dashboard/analytics",
                label: "Analytics",
                icon: (
                    <FileLineChartIcon size={14} />
                ),
                allowed: [ROLES.MANAGER],
            },
            {
                path: "/dashboard/performance",
                label: "Performance",
                icon: (
                    <Award size={14} />
                ),
                allowed: [ROLES.MANAGER],
            },
            {
                path: "/dashboard/branches",
                label: "Branches",
                icon: (
                    <Building2 size={14} />
                ),
                allowed: [ROLES.MANAGER],
            },
            {
                path: "/dashboard/supervisors",
                label: "Supervisors",
                icon: (
                    <UserCog size={14} />
                ),
                allowed: [ROLES.MANAGER],
            },
            {
                path: "/dashboard/drivers",
                label: "Drivers",
                icon: (
                    <UserCog size={14} />
                ),
                allowed: [ROLES.SUPERVISOR],
            },
            {
                path: "/dashboard/cashiers",
                label: "Cashiers",
                icon: (
                    <UserCog size={14} />
                ),
                allowed: [ROLES.SUPERVISOR],
            },
            {
                path: "/dashboard/loaders",
                label: "Loaders",
                icon: (
                    <Truck size={14} />
                ),
                allowed: [ROLES.SUPERVISOR],
            },
            {
                path: "/dashboard/vehicles",
                label: "Vehicles",
                icon: (
                    <KeySquare size={14} />
                ),
                allowed: [ROLES.SUPERVISOR],
            },
            {
                path: "/dashboard/branch-drop",
                label: "Branch Drops",
                icon: (
                    <Droplet size={14} />
                ),
                allowed: [ROLES.CASHIER],
            },
            {
                path: "/dashboard/delivery-fees",
                label: "Delivery Fees",
                icon: (
                    <DollarSign size={14} />
                ),
                allowed: [ROLES.MANAGER],
            },
            {
                path: "/dashboard/freelancers",
                label: "Freelancers",
                icon: (
                    <User size={14} />
                ),
                allowed: [ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.ADMIN, ROLES.CASHIER],
            },
            {
                path: "/dashboard/shipments",
                label: "Shipments",
                icon: (
                    <Package size={14} />
                ),
                allowed: [ROLES.MERCHANT, ROLES.SUPERVISOR, ROLES.CASHIER],
            },
            {
                path: "/dashboard/manifests",
                label: "Manifests",
                icon: (
                    <Truck size={14} />
                ),
                allowed: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.SORTER],
            },
            {
                path: "/dashboard/transporters",
                label: "Transporters",
                icon: (
                    <Truck size={14} />
                ),
                allowed: [ROLES.SUPERVISOR],
            },
            {
                path: "/dashboard/bulk-import",
                label: "Bulk Import",
                icon: (
                    <FileLineChartIcon size={14} />
                ),
                allowed: [ROLES.MERCHANT],
            },
            {
                path: "/dashboard/company",
                label: "Company",
                icon: (
                    <Building2 size={14} />
                ),
                allowed: [ROLES.MANAGER],
            },
            {
                path: "/dashboard/companies",
                label: "Companies",
                icon: (
                    <Building2 size={14} />
                ),
                allowed: [ROLES.ADMIN],
            },
        ],
    }, {
        label: "Settings",
        routes: [{
            path: "/dashboard/notifications",
            label: "Notifications",
            icon: (
                <Bell size={14} />
            ),
            allowed: [ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.CASHIER, ROLES.MERCHANT, ROLES.ADMIN, ROLES.SORTER],
        }, {
            path: "/dashboard/profile",
            label: "Profile",
            icon: (
                <User size={14} />
            ),
            allowed: [ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.CASHIER, ROLES.MERCHANT, ROLES.ADMIN, ROLES.SORTER],
        }],
    }];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = userStore();
    const role = user?.role ?? "";
    const [collapsed, setCollapsed] = useState(false);

    const imageUrl = user?.imageUrl?.url;

    const initials = (user?.firstName + " " + user?.lastName)
        ?.split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() ?? "?";

    return (
        <aside
            className={`
                hidden md:flex flex-col
                bg-background-surface
                rounded-lg
                transition-all duration-300 ease-in-out
                ${collapsed ? "w-16" : "w-55"}
                relative overflow-hidden shrink-0
            `}
        >
            {/* Ambient glow */}
            <div className="pointer-events-none absolute bottom-0 left-0 w-48 h-48 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)" }} />

            {/* Logo + collapse toggle */}
            <div className="flex items-center justify-between px-4 py-5 border-b border-white/5 shrink-0">
                {!collapsed && (
                    <div className="flex items-center gap-2.5">
                        <Link href="/" className="flex items-center gap-2 group">
                            <Image
                                src="/logo/logolight .png"
                                alt="FlashShip Logo"
                                width={150}
                                height={30}
                                className="object-contain"
                                priority
                            />
                        </Link>

                    </div>
                )}
                {collapsed && (
                    <div className="w-20 h-10 p-1 rounded-lg flex items-center justify-center mx-auto"
                        style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)" }}>
                        <Image
                            src="/logo/logolight .png"
                            alt="FlashShip Logo"
                            width={150}
                            height={30}
                            className="object-contain"
                            priority
                        />
                    </div>
                )}
                {!collapsed && (
                    <button
                        onClick={() => setCollapsed(true)}
                        className="p-1 rounded text-slate-600 hover:text-slate-400 transition-colors"
                        aria-label="Collapse sidebar"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                )}
                {collapsed && (
                    <button
                        onClick={() => setCollapsed(false)}
                        className="absolute right-0 top-5 p-1 rounded text-slate-600 hover:text-slate-400 transition-colors hidden"
                        aria-label="Expand sidebar"
                    />
                )}
            </div>

            {/* Expand button when collapsed */}
            {collapsed && (
                <button
                    onClick={() => setCollapsed(false)}
                    className="flex items-center justify-center py-3 text-slate-600 hover:text-amber-400 transition-colors border-b border-white/5"
                    aria-label="Expand sidebar"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>
            )}

            {/* User pill */}
            {!collapsed && (
                <div className="mx-3 my-3 px-3 py-2.5 rounded-xl border border-white/6 flex items-center gap-2.5"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    {imageUrl ? (
                        <div className="flex justify-center py-3 border-b border-white/5">
                            <img
                                src={imageUrl}
                                alt="User"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="flex justify-center py-3 border-b border-white/5">
                            <div
                                className="w-10 h-10 rounded-full border flex items-center justify-center text-[11px] font-semibold text-amber-400"
                                style={{
                                    borderColor: "rgba(251,191,36,0.3)",
                                    background: "rgba(251,191,36,0.08)",
                                }}
                            >
                                {initials}
                            </div>
                        </div>
                    )}
                    <div className="overflow-hidden">
                        <div className="text-[13px] font-medium text-slate-200 truncate">{user?.firstName + " " + user?.lastName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{role}</div>
                    </div>
                </div>
            )}
            {collapsed && (
                imageUrl ? (
                    <div className="flex justify-center py-3 border-b border-white/5">
                        <img
                            src={imageUrl}
                            alt="User"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="flex justify-center py-3 border-b border-white/5">
                        <div
                            className="w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-semibold text-amber-400"
                            style={{
                                borderColor: "rgba(251,191,36,0.3)",
                                background: "rgba(251,191,36,0.08)",
                            }}
                        >
                            {initials}
                        </div>
                    </div>
                )
            )}

            {/* Nav groups */}
            <nav className="flex-1 px-2 py-2 flex flex-col gap-1 overflow-y-auto">
                {NAV_GROUPS.map((group) => {
                    const visibleRoutes = group.routes.filter(
                        (r) => !r.allowed || r.allowed.includes(role as any)
                    );
                    if (visibleRoutes.length === 0) return null;

                    return (
                        <div key={group.label}>
                            {!collapsed && (
                                <div className="text-[9px] tracking-widest uppercase text-slate-700 font-semibold px-2 py-2 mt-1">
                                    {group.label}
                                </div>
                            )}
                            {collapsed && <div className="my-1 mx-2 border-t border-white/5" />}

                            {visibleRoutes.map((r) => {
                                const isActive = pathname === r.path || pathname?.startsWith(r.path + "/");
                                return (
                                    <Link
                                        key={r.path}
                                        href={r.path}
                                        aria-current={isActive ? "page" : undefined}
                                        title={collapsed ? r.label : undefined}
                                        className={`
                                            flex items-center gap-2.5 mb-1 rounded-lg transition-all duration-150
                                            ${collapsed ? "justify-center px-0 py-2.5" : "px-2.5 py-2"}
                                            ${isActive
                                                ? "text-amber-300"
                                                : "text-slate-500 hover:text-slate-300"
                                            }
                                        `}
                                        style={isActive ? {
                                            background: "rgba(251,191,36,0.07)",
                                            border: "1px solid rgba(251,191,36,0.13)",
                                        } : {
                                            border: "1px solid transparent",
                                        }}
                                    >
                                        {/* Active bar */}
                                        {!collapsed && (
                                            <div className={`w-0.5 h-4 rounded-full shrink-0 transition-all ${isActive ? "bg-amber-400" : "bg-transparent"}`} />
                                        )}
                                        <span className={`shrink-0 ${isActive ? "text-amber-400" : ""}`}>
                                            {r.icon}
                                        </span>
                                        {!collapsed && (
                                            <span className="text-[13px] font-medium">{r.label}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    );
                })}
            </nav>

            {/* Sign out */}
            <div className="p-3 border-t border-white/5">
                <button
                    onClick={() => {
                        logout();
                        router.push("/");
                    }}
                    title={collapsed ? "Sign out" : undefined}
                    className={`
                        w-full rounded-lg flex items-center gap-2 text-slate-600 hover:text-amber-300
                        transition-colors py-2 border border-transparent hover:border-amber-500/10
                        hover:bg-amber-500/5
                        ${collapsed ? "justify-center px-0" : "px-2.5"}
                    `}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M16 17l5-5-5-5M21 12H9M13 19H6a2 2 0 01-2-2V7a2 2 0 012-2h7"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {!collapsed && <span className="text-[12px] font-medium">Sign out</span>}
                </button>
            </div>
        </aside>
    );
}