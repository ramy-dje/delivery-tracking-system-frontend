import { NotificationType, PriorityType } from "@/types/notification";

export const NOTIF_COLORS: Record<NotificationType, string> = {
    account_created: "#22d3ee",
    account_blocked: "#f97316",
    account_unblocked: "#22d3ee",
    package_created: "#a78bfa",
    package_status_update: "#a78bfa",
    package_claimed: "#22d3ee",
    package_rejected: "#ef4444",
    package_cancelled: "#ef4444",
    package_assigned: "#a78bfa",
    package_issue: "#f97316",
    package_issue_resolved: "#22d3ee",
    manifest_sealed: "#fbbf24",
    manifest_arrived: "#22d3ee",
    manifest_discrepancy: "#f97316",
    payment_confirmation: "#4ade80",
    payment_failed: "#ef4444",
    system_update: "#fbbf24",
    general: "#94a3b8",
};

export const PRIORITY_COLORS: Record<PriorityType, string> = {
    low: "#94a3b8",
    normal: "#a78bfa",
    high: "#f97316",
};

export function timeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60_000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}