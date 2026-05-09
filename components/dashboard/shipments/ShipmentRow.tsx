"use client";

import { Eye, TrendingUp, AlertCircle } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import { IShipmentSummary, ShipmentStatus, ShipmentOrigin } from "@/types/shipment";

interface ShipmentRowProps {
    shipment: IShipmentSummary;
    isLast: boolean;
    onViewDetail?: () => void;
}

// ── Helper to get status badge color ──────────────────────────────────────
function getStatusColor(status: ShipmentStatus): { bg: string; text: string; dot: string } {
    const statusMap: Record<ShipmentStatus, { bg: string; text: string; dot: string }> = {
        [ShipmentStatus.Pending]: { bg: "bg-slate-500/10", text: "text-slate-300", dot: "bg-slate-400" },
        [ShipmentStatus.PickupRequested]: { bg: "bg-blue-500/10", text: "text-blue-300", dot: "bg-blue-400" },
        [ShipmentStatus.DroppedOffAtBranch]: { bg: "bg-purple-500/10", text: "text-purple-300", dot: "bg-purple-400" },
        [ShipmentStatus.Collected]: { bg: "bg-indigo-500/10", text: "text-indigo-300", dot: "bg-indigo-400" },
        [ShipmentStatus.ReceivedAtHub]: { bg: "bg-cyan-500/10", text: "text-cyan-300", dot: "bg-cyan-400" },
        [ShipmentStatus.ReadyForTransfer]: { bg: "bg-amber-500/10", text: "text-amber-300", dot: "bg-amber-400" },
        [ShipmentStatus.InTransit]: { bg: "bg-orange-500/10", text: "text-orange-300", dot: "bg-orange-400" },
        [ShipmentStatus.ReceivedAtDestinationHub]: { bg: "bg-lime-500/10", text: "text-lime-300", dot: "bg-lime-400" },
        [ShipmentStatus.ReadyForDelivery]: { bg: "bg-teal-500/10", text: "text-teal-300", dot: "bg-teal-400" },
        [ShipmentStatus.OutForDelivery]: { bg: "bg-cyan-500/10", text: "text-cyan-300", dot: "bg-cyan-400" },
        [ShipmentStatus.Delivered]: { bg: "bg-emerald-500/10", text: "text-emerald-300", dot: "bg-emerald-400" },
        [ShipmentStatus.DeliveryFailed]: { bg: "bg-red-500/10", text: "text-red-300", dot: "bg-red-400" },
        [ShipmentStatus.Refused]: { bg: "bg-rose-500/10", text: "text-rose-300", dot: "bg-rose-400" },
        [ShipmentStatus.PendingSwap]: { bg: "bg-yellow-500/10", text: "text-yellow-300", dot: "bg-yellow-400" },
        [ShipmentStatus.RtoPreparing]: { bg: "bg-red-500/10", text: "text-red-300", dot: "bg-red-400" },
        [ShipmentStatus.InTransitReturn]: { bg: "bg-orange-500/10", text: "text-orange-300", dot: "bg-orange-400" },
        [ShipmentStatus.ReturnedToMerchant]: { bg: "bg-slate-500/10", text: "text-slate-300", dot: "bg-slate-400" },
        [ShipmentStatus.Cancelled]: { bg: "bg-gray-500/10", text: "text-gray-300", dot: "bg-gray-400" },
    };
    return statusMap[status] || { bg: "bg-slate-500/10", text: "text-slate-300", dot: "bg-slate-400" };
}

function getStatusLabel(status: ShipmentStatus): string {
    const labels: Record<ShipmentStatus, string> = {
        [ShipmentStatus.Pending]: "Pending",
        [ShipmentStatus.PickupRequested]: "Pickup Requested",
        [ShipmentStatus.DroppedOffAtBranch]: "At Branch",
        [ShipmentStatus.Collected]: "Collected",
        [ShipmentStatus.ReceivedAtHub]: "At Hub",
        [ShipmentStatus.ReadyForTransfer]: "Ready Transfer",
        [ShipmentStatus.InTransit]: "In Transit",
        [ShipmentStatus.ReceivedAtDestinationHub]: "At Dest. Hub",
        [ShipmentStatus.ReadyForDelivery]: "Ready Delivery",
        [ShipmentStatus.OutForDelivery]: "Out for Delivery",
        [ShipmentStatus.Delivered]: "Delivered",
        [ShipmentStatus.DeliveryFailed]: "Failed",
        [ShipmentStatus.Refused]: "Refused",
        [ShipmentStatus.PendingSwap]: "Pending Swap",
        [ShipmentStatus.RtoPreparing]: "RTO Preparing",
        [ShipmentStatus.InTransitReturn]: "In Transit (Return)",
        [ShipmentStatus.ReturnedToMerchant]: "Returned",
        [ShipmentStatus.Cancelled]: "Cancelled",
    };
    return labels[status] || "Unknown";
}

function getOriginLabel(origin: ShipmentOrigin): string {
    return origin === ShipmentOrigin.PickupRequested ? "Pickup" : "Walk-in";
}

export default function ShipmentRow({
    shipment,
    isLast,
    onViewDetail,
}: ShipmentRowProps) {
    const statusColor = getStatusColor(shipment.status);
    const isAlert = [ShipmentStatus.DeliveryFailed, ShipmentStatus.Refused, ShipmentStatus.Cancelled].includes(
        shipment.status
    );

    return (
        <div
            className={`
                group grid grid-cols-[1fr_auto] md:grid-cols-[140px_1fr_120px_100px_auto]
                gap-4 px-5 py-4 items-center transition-all duration-150
                hover:bg-white/2.5
                ${isAlert ? "bg-red-500/5" : ""}
                ${!isLast ? "border-b border-white/4" : ""}
            `}
        >
            {/* Tracking Code */}
            <div className="flex items-center gap-2 min-w-0">
                <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 transition-transform duration-150 group-hover:scale-[1.06] ${isAlert ? "bg-red-500/20" : "bg-blue-500/20"
                        }`}
                >
                    <TrendingUp size={14} className={isAlert ? "text-red-400" : "text-blue-400"} />
                </div>
                <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-slate-100 truncate leading-tight">
                        {shipment.trackingCode}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                        {shipment.customer.fullName}
                    </div>
                </div>
            </div>

            {/* Customer Info - Hidden on mobile */}
            <div className="hidden md:flex flex-col gap-1 min-w-0">
                <div className="text-[12px] font-medium text-slate-300">{shipment.customer.phoneNumber}</div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500">{getOriginLabel(shipment.origin)}</span>
                    <span className="text-[11px] text-slate-600">•</span>
                    <span className="text-[11px] text-slate-500">COD: {shipment.codAmount.toFixed(2)} DA</span>
                </div>
            </div>

            {/* Status Badge */}
            <div className="hidden md:flex items-center gap-2 justify-center">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusColor.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusColor.dot}`} />
                    <span className={`text-[11px] font-medium ${statusColor.text}`}>
                        {getStatusLabel(shipment.status)}
                    </span>
                </div>
            </div>

            {/* Attempts & RTO - Hidden on mobile */}
            <div className="hidden md:flex items-center justify-center">
                {shipment.deliveryAttempts > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10">
                        <AlertCircle size={12} className="text-orange-400" />
                        <span className="text-[11px] text-orange-300">
                            {shipment.deliveryAttempts} attempt{shipment.deliveryAttempts > 1 ? "s" : ""}
                        </span>
                    </div>
                )}
                {shipment.isRto && (
                    <div className="ml-1.5 text-[11px] font-medium px-2 py-1 rounded-lg bg-amber-500/10 text-amber-300">
                        RTO
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-150">
                {onViewDetail && (
                    <ActionBtn
                        title="View details"
                        variant="emerald"
                        onClick={onViewDetail}
                        revealOnHover
                    >
                        <Eye size={13} />
                    </ActionBtn>
                )}
            </div>
        </div>
    );
}
