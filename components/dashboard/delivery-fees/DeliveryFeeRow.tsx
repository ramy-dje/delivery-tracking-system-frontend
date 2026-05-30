import { IDeliveryFeeSummary, DeliveryType } from "@/types/deliveryFee";
import { Eye, Pencil, Power, Route } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";

// ── Delivery type meta ──────────────────────────────────────────────────────

export const DELIVERY_TYPE_META: Record<DeliveryType, { label: string; color: string; bg: string; border: string }> = {
    [DeliveryType.Home]: {
        label: "Home",
        color: "#fbbf24",
        bg: "rgba(251, 191, 36, 0.1)",
        border: "rgba(251, 191, 36, 0.3)",
    },
    [DeliveryType.StopDesk]: {
        label: "Stop Desk",
        color: "#38bdf8",
        bg: "rgba(56,189,248,0.08)",
        border: "rgba(56,189,248,0.22)",
    },
};

export const FALLBACK_META = {
    label: "Unknown",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.08)",
    border: "rgba(148,163,184,0.2)",
};

export function getDeliveryTypeMeta(type: any) {
    switch (type) {
        case "Home":
            return DELIVERY_TYPE_META[DeliveryType.Home];
        case "StopDesk":
            return DELIVERY_TYPE_META[DeliveryType.StopDesk];
        default:
            return FALLBACK_META;
    }
}

export function formatFee(amount: number) {
    return new Intl.NumberFormat("fr-DZ", { style: "currency", currency: "DZD", minimumFractionDigits: 0 }).format(amount);
}

// ── Component ───────────────────────────────────────────────────────────────

const DeliveryFeeRow = ({
    fee,
    isLast,
    onViewDetail,
    onEdit,
    onToggleStatus,
}: {
    fee: IDeliveryFeeSummary;
    isLast: boolean;
    onViewDetail?: () => void;
    onEdit?: () => void;
    onToggleStatus?: () => void;
}) => {
    const m = getDeliveryTypeMeta(fee.deliveryType);
    const isActive = fee.isActive !== false;

    return (
        <div
            className={`
                group grid grid-cols-[1fr_auto] md:grid-cols-[200px_1fr_130px_120px_140px]
                gap-4 px-5 py-4 items-center transition-all duration-150
                hover:bg-white/2.5
                ${!isActive ? "bg-red-500/2" : ""}
                ${!isLast ? "border-b border-white/4" : ""}
            `}
        >
            {/* Route: origin → destination */}
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-[1.06]"
                    style={{ background: m.bg, border: `1px solid ${m.border}` }}
                >
                    {/* Route icon */}
                    <Route size={16} color={m.color} />
                </div>
                <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold text-slate-100 truncate leading-tight">
                        {fee.originWilayaName}
                        <span className="mx-1.5 text-slate-700">→</span>
                        {fee.destinationWilayaName}
                    </div>
                    <div className="mt-1">
                        <span
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-semibold"
                            style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}
                        >
                            {m.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Fees breakdown */}
            <div className="hidden md:flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-1.5">
                    <svg className="shrink-0 opacity-40" width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#94a3b8" strokeWidth="1.5" />
                        <path d="M12 6v6l4 2" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="text-[12.5px] font-semibold text-amber-400">{formatFee(fee.baseFee)}</span>
                    <span className="text-[10.5px] text-slate-600">base</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <svg className="shrink-0 opacity-40" width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#94a3b8" strokeWidth="1.5" />
                    </svg>
                    <span className="text-[11.5px] text-slate-400">{formatFee(fee.extraKgFee)}<span className="text-slate-600 ml-0.5">/kg extra</span></span>
                </div>
            </div>

            {/* Weight included */}
            <div className="hidden md:flex flex-col gap-1 min-w-0">
                <span className="text-[12.5px] font-medium text-slate-300">
                    {fee.includedWeightKg} kg
                </span>
                <span className="text-[10.5px] text-slate-600">included</span>
            </div>

            {/* Status */}
            <div className="hidden md:flex items-center gap-2">
                <span
                    className={`w-2 h-2 rounded-full shrink-0 transition-all duration-200 ${isActive ? "animate-pulse" : ""}`}
                    style={{
                        background: isActive ? "#34d399" : "#64748b",
                        boxShadow: isActive ? "0 0 8px rgba(52,211,153,0.6)" : "none",
                    }}
                />
                <span className={`text-[12px] font-medium ${isActive ? "text-emerald-400" : "text-slate-500"}`}>
                    {isActive ? "Active" : "Inactive"}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-150">
                {onViewDetail && (
                    <ActionBtn title="View details" variant="emerald" onClick={onViewDetail} revealOnHover>
                        <Eye size={13} />
                    </ActionBtn>
                )}
                {onEdit && (
                    <ActionBtn title="Edit fee" variant="sky" onClick={onEdit} revealOnHover>
                        <Pencil size={13} />
                    </ActionBtn>
                )}
                {onToggleStatus && (
                    <ActionBtn
                        onClick={onToggleStatus}
                        title={isActive ? "Deactivate fee" : "Activate fee"}
                        variant={isActive ? "red" : "emerald"}
                        revealOnHover
                    >
                        <Power size={13} />
                    </ActionBtn>
                )}
            </div>
        </div>
    );
};

export default DeliveryFeeRow;