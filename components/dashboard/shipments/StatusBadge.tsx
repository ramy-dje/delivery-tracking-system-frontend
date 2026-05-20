"use client";

import { useMemo } from "react";
import { ShipmentStatus, STATUS_LABEL, STATUS_COLOR, FailureReason, FAILURE_REASON_LABEL } from "@/types/shipment";
import { GlassStatCardProps } from "@/components/commons/GlassStatCard";

// ── Type-safe helpers ──────────────────────────────────────────────────────

export const getStatusLabel = (status: ShipmentStatus): string => {
    return STATUS_LABEL[status] ?? "Unknown";
};

export const getAccentColor = (status: ShipmentStatus): GlassStatCardProps["accentColor"] => {
    switch (status) {
        case ShipmentStatus.Delivered:
        case ShipmentStatus.ReadyForDelivery:
        case ShipmentStatus.OutForDelivery:
            return "emerald";
        case ShipmentStatus.Pending:
        case ShipmentStatus.ReceivedAtBranch:
        case ShipmentStatus.PendingSwap:
            return "amber";
        case ShipmentStatus.DeliveryFailed:
        case ShipmentStatus.Refused:
        case ShipmentStatus.Cancelled:
        case ShipmentStatus.RtoPreparing:
        case ShipmentStatus.InTransitReturn:
            return "rose";
        case ShipmentStatus.InTransit:
        case ShipmentStatus.ReadyForTransfer:
        case ShipmentStatus.ReceivedAtHub:
        case ShipmentStatus.ReceivedAtDestinationHub:
            return "violet";
        default:
            return "cyan";
    }
};

export const getFailureReasonLabel = (reason: FailureReason): string => {
    return FAILURE_REASON_LABEL[reason] ?? "Unknown";
};

// ── Reusable StatusBadge Component ─────────────────────────────────────────

export interface StatusBadgeProps {
    status: ShipmentStatus;
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
    console.log("Rendering StatusBadge with status:", status);
    const config = useMemo(() => STATUS_COLOR[status] ?? STATUS_COLOR[ShipmentStatus.Pending], [status]);
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

// ── Reusable FailureReasonBadge Component ──────────────────────────────────

export interface FailureReasonBadgeProps {
    reason: FailureReason;
    variant?: "badge" | "text";
    className?: string;
}

export function FailureReasonBadge({
    reason,
    variant = "badge",
    className = ""
}: FailureReasonBadgeProps) {
    const label = useMemo(() => getFailureReasonLabel(reason), [reason]);

    // Map failure reasons to semantic colors
    const getColor = (r: FailureReason): { bg: string; text: string; dot: string } => {
        switch (r) {
            case FailureReason.AddressIssue:
            case FailureReason.CustomerUnavailable:
                return { bg: "rgba(251,191,36,0.12)", text: "#fbbf24", dot: "#fbbf24" };
            case FailureReason.WeatherDelay:
            case FailureReason.VehicleBreakdown:
                return { bg: "rgba(96,165,250,0.12)", text: "#60a5fa", dot: "#60a5fa" };
            case FailureReason.OneTimeFailure:
                return { bg: "rgba(148,163,184,0.12)", text: "#94a3b8", dot: "#94a3b8" };
            default:
                return { bg: "rgba(251,113,133,0.12)", text: "#fb7185", dot: "#fb7185" };
        }
    };

    const config = getColor(reason);
    const baseClasses = "inline-flex items-center gap-1.5 text-sm";
    const variantClasses = variant === "badge" ? "px-2.5 py-1 rounded-full" : "";

    return (
        <span
            className={`${baseClasses} ${variantClasses} ${className}`}
            style={variant === "badge" ? { backgroundColor: config.bg, color: config.text } : { color: config.text }}
        >
            {variant === "badge" && (
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