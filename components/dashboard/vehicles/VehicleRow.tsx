"use client";

import { Eye } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import { IVehicleResponse, VehicleType, VehicleStatus } from "@/types/vehicle";

const TYPE_META: Record<VehicleType, { label: string; color: string; bg: string; border: string }> = {
    large_truck: { label: "Large Truck", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" },
    small_truck: { label: "Small Truck", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" },
    van: { label: "Van", color: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.2)" },
    motorcycle: { label: "Motorcycle", color: "#f472b6", bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.2)" },
    car: { label: "Car", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)" },
};

const STATUS_META: Record<VehicleStatus, { label: string; color: string }> = {
    available: { label: "Available", color: "#34d399" },
    in_use: { label: "In Use", color: "#60a5fa" },
    maintenance: { label: "Maintenance", color: "#fbbf24" },
    out_of_service: { label: "Out of Service", color: "#f87171" },
    retired: { label: "Retired", color: "#94a3b8" },
};

function VehicleTypeIcon({ type }: { type: VehicleType }) {
    if (type === "large_truck" || type === "small_truck" || type === "van") {
        return (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
        );
    }
    if (type === "motorcycle") {
        return (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="5" cy="17" r="3" /><circle cx="19" cy="17" r="3" /><path d="M12 17V7l-4 5h6" />
            </svg>
        );
    }
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-3" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
        </svg>
    );
}

const VehicleRow = ({
    vehicle,
    isLast,
    onViewDetail,
}: {
    vehicle: IVehicleResponse;
    isLast: boolean;
    onViewDetail?: () => void;
}) => {
    const m = TYPE_META[vehicle.type] || TYPE_META["van"];
    const displayName = [vehicle.brand, vehicle.modelName, vehicle.year].filter(Boolean).join(" ") || "Unknown Model";
    const statusMeta = STATUS_META[vehicle.status] || STATUS_META["available"];

    return (
        <div
            className={`
                group grid grid-cols-[1fr_auto] md:grid-cols-[180px_1fr_150px_150px_80px]
                gap-4 px-5 py-4 items-center transition-all duration-150
                hover:bg-white/2.5
                ${!isLast ? "border-b border-white/4" : ""}
            `}
        >
            {/* License Plate + Type badge */}
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold shrink-0 transition-transform duration-150 group-hover:scale-[1.06]"
                    style={{ background: m.bg, border: `1px solid ${m.border}`, color: m.color }}
                >
                    <VehicleTypeIcon type={vehicle.type} />
                </div>
                <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-slate-100 truncate leading-tight font-mono">
                        {vehicle.registrationNumber}
                    </div>
                    <div className="mt-1">
                        <span
                            className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide"
                            style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}
                        >
                            {m.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Brand & Model */}
            <div className="hidden md:flex flex-col gap-1 min-w-0">
                <span className="text-[13px] font-medium text-slate-200 truncate">{displayName}</span>
                <span className="text-[11px] text-slate-500">{vehicle.color || "No color specified"}</span>
            </div>

            {/* Capacity */}
            <div className="hidden md:flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                    <svg className="opacity-40 shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /><path d="M16 3v4M8 3v4M16 17v4M8 17v4" /></svg>
                    <span className="text-[12px] text-slate-300">{vehicle.maxWeight.toLocaleString()} kg</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <svg className="opacity-40 shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>
                    <span className="text-[12px] text-slate-400">{vehicle.maxVolume} m³</span>
                </div>
            </div>

            {/* Status & Features */}
            <div className="hidden md:flex flex-col gap-1.5 items-start">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: statusMeta.color, boxShadow: `0 0 8px ${statusMeta.color}80` }} />
                    <span className="text-[12px] font-medium" style={{ color: statusMeta.color }}>{statusMeta.label}</span>
                </div>
                {vehicle.supportsFragile && (
                    <div className="flex items-center gap-1.5 opacity-80">
                        <svg className="w-3 h-3 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 22h20L12 2z" /></svg>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-sky-400">Fragile Ok</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-150">
                {onViewDetail && (
                    <ActionBtn revealOnHover title="View details" variant="emerald" onClick={onViewDetail}>
                        <Eye size={13} />
                    </ActionBtn>
                )}
            </div>
        </div>
    );
};

export default VehicleRow;