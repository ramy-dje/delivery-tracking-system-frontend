"use client";
import { CircleX, Eye, Phone, Printer, Repeat, TrendingUp, MapPin } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import { IPackage } from "@/types/shipment";
import { StatusBadge } from "./StatusBadge";
import { handlePrint } from "@/utils/printHelper";
import { Role, ROLES } from "@/lib/roles";
import Link from "next/link";

const SWAPPABLE_STATUSES = new Set([
    'pending',
    'at_destination_branch',
    'failed_delivery',
]);

// Supervisor: only pending
// Freelancer (MERCHANT role): pending, accepted, at_origin_branch — mirrors backend FREELANCER_CANCELLABLE_STATUSES
const SUPERVISOR_CANCELLABLE_STATUSES = new Set(['pending']);
const FREELANCER_CANCELLABLE_STATUSES = new Set(['pending', 'accepted', 'at_origin_branch']);

interface ShipmentRowProps {
    shipment: IPackage;
    userRole: Role | undefined;
    onCancelClick?: () => void;
    onSwaplClick?: () => void;
    isLast: boolean;
    onViewDetail?: () => void;
    setSelectedShipment: (shipment: IPackage | null) => void;
    // batch print
    selected?: boolean;
    onSelect?: (id: string, checked: boolean) => void;
}

export default function ShipmentRow({
    shipment,
    userRole,
    onCancelClick,
    onSwaplClick,
    isLast,
    onViewDetail,
    setSelectedShipment,
    selected = false,
    onSelect,
}: ShipmentRowProps) {
    const isAlert = [
        'failed_delivery',
        'failed_delivery_attempt',
        'cancelled',
        'lost',
        'damaged',
    ].includes(shipment.status);

    const canSwap = onSwaplClick && SWAPPABLE_STATUSES.has(shipment.status);
    const cancellableSet = userRole === ROLES.MERCHANT
        ? FREELANCER_CANCELLABLE_STATUSES
        : SUPERVISOR_CANCELLABLE_STATUSES;
    const canCancel = onCancelClick && cancellableSet.has(shipment.status);

    return (
        <div
            className={`
                group grid grid-cols-[auto_1fr_auto] md:grid-cols-[32px_240px_1fr_180px_150px_150px]
                gap-4 px-5 py-4 items-center transition-all duration-150
                hover:bg-white/2.5
                ${selected ? "bg-amber-500/5" : ""}
                ${isAlert ? "bg-red-500/2" : ""}
                ${!isLast ? "border-b border-white/4" : ""}
            `}
        >
            {/* Checkbox */}
            {onSelect && (
                <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) => onSelect(shipment._id, e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-amber-400 cursor-pointer"
                        aria-label={`Select shipment ${shipment.trackingNumber}`}
                    />
                </div>
            )}

            {/* Tracking Code */}
            <div className="flex items-center gap-2 min-w-0">
                <Link
                    href={`/dashboard/shipments/${shipment._id}`}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0 transition-transform duration-150 group-hover:scale-[1.06] ${isAlert ? "bg-red-500/20" : "bg-blue-500/20"
                        }`}
                >
                    <TrendingUp size={14} className={isAlert ? "text-red-400" : "text-blue-400"} />
                </Link>
                <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-slate-100 truncate leading-tight">
                        {shipment.trackingNumber}
                    </div>
                    <div className="mt-1">
                        <span className={`text-[11px] font-medium ${isAlert ? "text-red-400" : "text-slate-500"}`}>
                            {shipment.destination.recipientName}
                        </span>
                    </div>
                </div>
            </div>

            {/* Customer Info */}
            <div className="hidden md:flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    <a
                        href={`tel:${shipment.destination.recipientPhone}`}
                        className="text-sm font-medium text-slate-300 truncate hover:text-cyan-400 transition-colors"
                    >
                        {shipment.destination.recipientPhone}
                    </a>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[11px] text-slate-500">
                        Total Price: {shipment.totalPrice.toFixed(2)} DA
                    </span>
                </div>
            </div>

            {/* Status */}
            <div className="flex justify-center">
                <StatusBadge status={shipment.status} />
            </div>

            {/* Delivery Info */}
            <div className="hidden md:flex flex-col items-center justify-center gap-1">
                <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium"
                    style={{ backgroundColor: "rgba(96,165,250,0.12)", color: "#60a5fa" }}
                >
                    {shipment.deliveryType.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-slate-500 truncate text-center max-w-[120px]">
                    <MapPin className="inline w-3 h-3 mr-1" />
                    {shipment.destination.city}, {shipment.destination.state}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-150">

                {/* PRINT SINGLE */}
                <ActionBtn
                    title="Print label"
                    variant="sky"
                    onClick={() => handlePrint(shipment)}
                    revealOnHover
                >
                    <Printer size={13} />
                </ActionBtn>

                {/* CANCEL — only for Pending */}
                {canCancel && userRole === ROLES.MERCHANT && (
                    <ActionBtn
                        title="Cancel Shipment"
                        variant="red"
                        onClick={() => {
                            setSelectedShipment(shipment);
                            onCancelClick!();
                        }}
                        revealOnHover
                    >
                        <CircleX size={13} />
                    </ActionBtn>
                )}

                {/* VIEW DETAIL */}
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