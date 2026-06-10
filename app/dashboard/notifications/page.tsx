"use client";

import React, { useState, useEffect, useCallback, useRef, JSX } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { NOTIF_COLORS, PRIORITY_COLORS, timeAgo } from "@/lib/notificationUtils";
import { INotification, NotificationType, PriorityType } from "@/types/notification";

// ─── Filter config ────────────────────────────────────────────────────────────

type FilterTab = "all" | "unread" | "packages" | "payments" | "system";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "packages", label: "Packages" },
    { key: "payments", label: "Payments" },
    { key: "system", label: "System" },
];

const PACKAGE_TYPES: NotificationType[] = [
    "package_created", "package_status_update", "package_claimed",
    "package_rejected", "package_cancelled", "package_assigned",
    "package_issue", "package_issue_resolved",
];

const PAYMENT_TYPES: NotificationType[] = [
    "payment_confirmation", "payment_failed",
];

const SYSTEM_TYPES: NotificationType[] = [
    "system_update", "manifest_sealed", "manifest_arrived",
    "manifest_discrepancy", "account_created", "account_blocked",
    "account_unblocked", "general",
];

function filterNotifications(
    notifications: INotification[],
    tab: FilterTab,
    search: string,
): INotification[] {
    let result = [...notifications];

    if (tab === "unread") result = result.filter(n => !n.is_read);
    if (tab === "packages") result = result.filter(n => PACKAGE_TYPES.includes(n.notification_type));
    if (tab === "payments") result = result.filter(n => PAYMENT_TYPES.includes(n.notification_type));
    if (tab === "system") result = result.filter(n => SYSTEM_TYPES.includes(n.notification_type));

    if (search.trim()) {
        const q = search.toLowerCase();
        result = result.filter(
            n => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q),
        );
    }

    return result;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const NOTIF_ICONS: Record<string, JSX.Element> = {
    package: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    payment: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    account: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    system: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    manifest: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                stroke="currentColor" strokeWidth="1.5" />
            <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    alert: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
};

function getIcon(type: NotificationType): JSX.Element {
    if (type.startsWith("package")) return NOTIF_ICONS.package;
    if (type.startsWith("payment")) return NOTIF_ICONS.payment;
    if (type.startsWith("account")) return NOTIF_ICONS.account;
    if (type.startsWith("manifest")) return NOTIF_ICONS.manifest;
    if (type === "system_update") return NOTIF_ICONS.system;
    return NOTIF_ICONS.alert;
}

// ─── Priority badge ───────────────────────────────────────────────────────────

const PRIORITY_LABELS: Record<PriorityType, string> = {
    low: "Low",
    normal: "Normal",
    high: "High",
};

const PRIORITY_STYLES: Record<PriorityType, React.CSSProperties> = {
    low: { background: "rgba(148,163,184,0.1)", color: "#94a3b8" },
    normal: { background: "rgba(167,139,250,0.1)", color: "#a78bfa" },
    high: { background: "rgba(249,115,22,0.15)", color: "#f97316" },
};

// ─── Notification card ────────────────────────────────────────────────────────

interface NotifCardProps {
    notification: INotification;
    onMarkRead: (id: string) => void;
    isNew?: boolean;
}

function NotifCard({ notification: n, onMarkRead, isNew }: NotifCardProps) {
    const color = NOTIF_COLORS[n.notification_type] ?? "#94a3b8";
    const icon = getIcon(n.notification_type);

    return (
        <div
            onClick={() => !n.is_read && onMarkRead(n._id)}
            className="group relative flex gap-4 px-5 py-4 border-b border-white/4 last:border-0 transition-all duration-200 cursor-pointer"
            style={{
                background: n.is_read
                    ? "transparent"
                    : "rgba(251,191,36,0.02)",
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background =
                    n.is_read ? "rgba(255,255,255,0.02)" : "rgba(251,191,36,0.04)";
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background =
                    n.is_read ? "transparent" : "rgba(251,191,36,0.02)";
            }}
        >
            {/* Left accent bar */}
            {!n.is_read && (
                <div
                    className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                    style={{ background: color }}
                />
            )}

            {/* Icon circle */}
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{
                    background: `${color}18`,
                    color,
                    border: `1px solid ${color}25`,
                }}
            >
                {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                    <span
                        className="text-[13.5px] leading-snug font-medium"
                        style={{ color: n.is_read ? "#64748b" : "#e2e8f0" }}
                    >
                        {n.title}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                        {n.priority === "high" && (
                            <span
                                className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                                style={PRIORITY_STYLES.high}
                            >
                                {PRIORITY_LABELS.high}
                            </span>
                        )}
                        <span className="text-[11px]" style={{ color: "#374151" }}>
                            {timeAgo(n.createdAt)}
                        </span>
                        {!n.is_read && (
                            <div
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ background: color }}
                            />
                        )}
                    </div>
                </div>
                <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: "#475569" }}>
                    {n.message}
                </p>

                {/* Reference type tag */}
                {n.reference_type && (
                    <span
                        className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-md"
                        style={{ background: "rgba(255,255,255,0.04)", color: "#374151", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                        {n.reference_type}
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: FilterTab }) {
    const messages: Record<FilterTab, { title: string; sub: string }> = {
        all: { title: "You're all caught up", sub: "New notifications will appear here." },
        unread: { title: "Nothing unread", sub: "All notifications have been read." },
        packages: { title: "No package notifications", sub: "Package events will show up here." },
        payments: { title: "No payment notifications", sub: "Payment updates will show up here." },
        system: { title: "No system notifications", sub: "System alerts will appear here." },
    };
    const { title, sub } = messages[tab];
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.12)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ color: "#fbbf24" }}>
                    <path d="M15 17H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M10.7 7a2.7 2.7 0 115.4 0v3.2l1.2 2.4a1 1 0 01-.9 1.4H6.6a1 1 0 01-.9-1.4L7 10.2V7z"
                        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
            </div>
            <div className="text-center">
                <p className="text-[14px] font-medium text-slate-300">{title}</p>
                <p className="text-[12px] text-slate-600 mt-1">{sub}</p>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
    const {
        notifications,
        unreadCount,
        loading,
        hasMore,
        fetchNotifications,
        markAsRead,
        markAllRead,
        loadMore,
    } = useNotifications();

    const [tab, setTab] = useState<FilterTab>("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchNotifications(1);
    }, [fetchNotifications]);

    const filtered = filterNotifications(notifications, tab, search);

    const tabCount = (key: FilterTab): number | null => {
        if (key === "unread") return unreadCount || null;
        return null;
    };

    return (
        <div className="min-h-screen px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto">

            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-[22px] font-semibold text-white tracking-tight">Notifications</h1>
                    <p className="text-[13px] text-slate-500 mt-0.5">
                        {unreadCount > 0
                            ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                            : "All caught up"}
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                        style={{
                            border: "1px solid rgba(251,191,36,0.2)",
                            background: "rgba(251,191,36,0.06)",
                            color: "#fbbf24",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(251,191,36,0.12)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(251,191,36,0.06)")}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Mark all read
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: "#374151" }}>
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                    type="text"
                    placeholder="Search notifications…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg text-[13px] transition-all outline-none"
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        color: "#e2e8f0",
                    }}
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: "#374151" }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 mb-4 p-1 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                {FILTER_TABS.map(t => {
                    const active = tab === t.key;
                    const count = tabCount(t.key);
                    return (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                            style={active ? {
                                background: "rgba(255,255,255,0.07)",
                                color: "#f1f5f9",
                                border: "1px solid rgba(255,255,255,0.09)",
                            } : {
                                color: "#475569",
                                border: "1px solid transparent",
                            }}
                        >
                            {t.label}
                            {count != null && (
                                <span
                                    className="text-[9px] font-bold px-1.5 py-px rounded-full"
                                    style={{ background: "#fbbf24", color: "#030712" }}
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Notification list */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.06)", background: "#0a0d14" }}
            >
                {loading && notifications.length === 0 ? (
                    <div className="flex flex-col gap-3 p-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-4 animate-pulse">
                                <div className="w-9 h-9 rounded-xl shrink-0"
                                    style={{ background: "rgba(255,255,255,0.05)" }} />
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-3 rounded-full w-3/4"
                                        style={{ background: "rgba(255,255,255,0.05)" }} />
                                    <div className="h-2.5 rounded-full w-full"
                                        style={{ background: "rgba(255,255,255,0.03)" }} />
                                    <div className="h-2.5 rounded-full w-1/2"
                                        style={{ background: "rgba(255,255,255,0.03)" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState tab={tab} />
                ) : (
                    <>
                        {filtered.map(n => (
                            <NotifCard
                                key={n._id}
                                notification={n}
                                onMarkRead={markAsRead}
                            />
                        ))}

                        {hasMore && (
                            <div className="px-5 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                                <button
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="w-full py-2 rounded-lg text-[12px] font-medium transition-all"
                                    style={{
                                        color: loading ? "#374151" : "#94a3b8",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                        background: "rgba(255,255,255,0.02)",
                                    }}
                                >
                                    {loading ? "Loading…" : "Load more"}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer count */}
            {filtered.length > 0 && (
                <p className="text-center text-[11px] mt-4" style={{ color: "#1f2937" }}>
                    {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
                    {tab !== "all" ? ` in ${tab}` : ""}
                </p>
            )}
        </div>
    );
}