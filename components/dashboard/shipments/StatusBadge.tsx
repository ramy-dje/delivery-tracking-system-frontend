"use client";

import { useMemo } from "react";
import { PackageStatus, STATUS_LABEL, STATUS_COLOR } from "@/types/shipment";
import { GlassStatCardProps } from "@/components/commons/GlassStatCard";

// ── Type-safe helpers ──────────────────────────────────────────────────────

export const getStatusLabel = (status: PackageStatus): string => {
    return STATUS_LABEL[status] ?? "Unknown";
};

export const getAccentColor = (status: PackageStatus): GlassStatCardProps["accentColor"] => {
    switch (status) {
        case "delivered":
        case "out_for_delivery":
            return "emerald";
        case "pending":
        case "cashier_claimed":
        case "accepted":
        case "on_hold":
            return "amber";
        case "failed_delivery":
        case "failed_delivery_attempt":
        case "returned":
        case "cancelled":
        case "lost":
        case "damaged":
            return "rose";
        case "at_origin_branch":
        case "manifested":
        case "in_transit_to_branch":
        case "at_destination_branch":
        case "rescheduled":
            return "violet";
        default:
            return "cyan";
    }
};

// ── Reusable StatusBadge Component ─────────────────────────────────────────

export interface StatusBadgeProps {
    status: PackageStatus;
    variant?: "badge" | "text" | "chip";
    showDot?: boolean;
    className?: string;
}

export function StatusBadge({
    status,
    variant = "badge",
    showDot = true,
    className = ""
}: StatusBadgeProps) {
    const config = useMemo(() => STATUS_COLOR[status] ?? STATUS_COLOR['pending'], [status]);
    const label = useMemo(() => getStatusLabel(status), [status]);

    const baseClasses = "inline-flex items-center gap-1.5 text-sm font-medium";

    const variantClasses = {
        badge: `px-2.5 py-1 rounded-full`,
        text: ``,
        chip: `px-3 py-1.5 rounded-lg border`,
    };

    const style = variant !== "text"
        ? {
            backgroundColor: variant === "badge" ? config.bg : "transparent",
            color: config.text,
            borderColor: variant === "chip" ? config.dot : undefined,
        }
        : { color: config.text };

    return (
        <span className={`${baseClasses} ${variantClasses[variant]} ${className}`} style={style}>
            {showDot && variant !== "text" && (
                <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: config.dot }}
                    aria-hidden="true"
                />
            )}
            {label}
        </span>
    );
}