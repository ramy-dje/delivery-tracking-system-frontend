"use client";
import { Eye, Phone, Printer, TrendingUp } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import { IShipmentSummary, ShipmentStatus, ShipmentOrigin } from "@/types/shipment";
import { StatusBadge } from "./StatusBadge";
import { handlePrint } from "@/utils/printHelper";

interface ShipmentRowProps {
    shipment: IShipmentSummary;
    isLast: boolean;
    onViewDetail?: () => void;
}

export default function ShipmentRow({
    shipment,
    isLast,
    onViewDetail,
}: ShipmentRowProps) {
    const isAlert = [ShipmentStatus.DeliveryFailed, ShipmentStatus.Refused, ShipmentStatus.Cancelled].includes(shipment.status);
    return (
        <div
            className={`
        group grid grid-cols-[1fr_auto] md:grid-cols-[240px_1fr_180px_150px_100px]
        gap-4 px-5 py-4 items-center transition-all duration-150
        hover:bg-white/2.5
        ${isAlert ? "bg-red-500/2" : ""}
        ${!isLast ? "border-b border-white/4" : ""}
    `}
        >
            {/* Tracking Code */}
            <div className="flex items-center gap-2 min-w-0">
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0 transition-transform duration-150 group-hover:scale-[1.06] ${isAlert ? "bg-red-500/20" : "bg-blue-500/20"}`}
                >
                    <TrendingUp size={14} className={isAlert ? "text-red-400" : "text-blue-400"} />
                </div>
                <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-slate-100 truncate leading-tight">
                        {shipment.trackingCode}
                    </div>
                    <div className="mt-1">
                        <span className={`text-[11px] font-medium ${isAlert ? "text-red-400" : "text-slate-500"}`}>
                            {shipment.customer.fullName}
                        </span>
                    </div>
                </div>
            </div>

            {/* Customer Info */}
            <div className="hidden md:flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    <a
                        href={`tel:${shipment.customer.phoneNumber}`}
                        className="
            text-sm font-medium text-slate-300 truncate
            hover:text-cyan-400 transition-colors
        "
                    >
                        {shipment.customer.phoneNumber}
                    </a>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[11px] text-slate-500">COD: {shipment.codAmount.toFixed(2)} DA</span>
                </div>
            </div>

            {/* Status */}
            <div className="flex justify-center">
                <StatusBadge status={shipment.status} />
            </div>

            {/* Attempts & RTO */}
            <div className="hidden md:flex items-center justify-center gap-2">

                {/* Attempts */}
                {shipment.deliveryAttempts > 0 && (
                    <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                            backgroundColor: "rgba(251,191,36,0.12)",
                            color: "#fbbf24",
                        }}
                    >

                        {shipment.deliveryAttempts} Attempt{shipment.deliveryAttempts > 1 ? "s" : ""}
                    </span>
                )}

                {/* RTO */}
                {shipment.isRto && (
                    <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                            backgroundColor: "rgba(251,113,133,0.12)",
                            color: "#fb7185",
                        }}
                    >
                        RTO
                    </span>
                )}

                {/* Clean shipment */}
                {shipment.deliveryAttempts === 0 && !shipment.isRto && (
                    <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                            backgroundColor: "rgba(52,211,153,0.12)",
                            color: "#34d399",
                        }}
                    >
                        Smooth
                    </span>
                )}
            </div>

            {/* Actions */}
            {/* Actions */}
            <div className="flex items-center justify-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-150">

                {/* PRINT */}
                <ActionBtn
                    title="Print label"
                    variant="sky"
                    onClick={() => handlePrint(shipment)}
                    revealOnHover
                >
                    <Printer size={13} />
                </ActionBtn>

                {/* VIEW */}
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
