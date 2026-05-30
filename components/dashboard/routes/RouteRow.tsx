import { Ban, ChevronRight, Package } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import { IRoute, RouteStatus } from "@/types/route";

const STATUS_META: Record<RouteStatus, { label: string; color: string; bg: string; dot: string }> = {
    pending:     { label: "Pending",    color: "#fbbf24", bg: "rgba(251,191,36,0.08)",   dot: "#fbbf24" },
    in_transit:  { label: "In Transit", color: "#22d3ee", bg: "rgba(34,211,238,0.08)",   dot: "#22d3ee" },
    completed:   { label: "Completed",  color: "#34d399", bg: "rgba(52,211,153,0.08)",   dot: "#34d399" },
    cancelled:   { label: "Cancelled",  color: "#64748b", bg: "rgba(100,116,139,0.08)",  dot: "#64748b" },
};

function fmt(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const RouteRow = ({
    route,
    isLast,
    onViewDetail,
    onToggleCancel,
}: {
    route: IRoute;
    isLast: boolean;
    onViewDetail?: () => void;
    onToggleCancel?: () => void;
}) => {
    const meta = STATUS_META[route.status] ?? STATUS_META.pending;
    const stopNames = route.stops.map((s) => s.branchName ?? s.branchId).join(" → ");

    return (
        <div
            className={`
                group grid grid-cols-[1fr_auto] md:grid-cols-[160px_1fr_120px_100px_auto]
                gap-4 px-5 py-4 items-center transition-all duration-150
                hover:bg-white/[0.025]
                ${route.status === "cancelled" ? "opacity-60" : ""}
                ${!isLast ? "border-b border-white/[0.04]" : ""}
            `}
        >
            {/* Status badge */}
            <div className="flex items-center gap-2 min-w-0">
                <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0"
                    style={{ background: meta.bg, color: meta.color }}
                >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />
                    {meta.label}
                </div>
            </div>

            {/* Route path */}
            <div className="hidden md:flex flex-col gap-1 min-w-0">
                {route.originBranchName && (
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[11px] font-mono text-slate-600 uppercase tracking-wider shrink-0">From</span>
                        <span className="text-[12.5px] text-slate-300 font-medium truncate">{route.originBranchName}</span>
                    </div>
                )}
                {stopNames && (
                    <div className="flex items-center gap-1.5 min-w-0">
                        <ChevronRight size={11} className="text-slate-700 shrink-0" />
                        <span className="text-[11.5px] text-slate-500 truncate">{stopNames}</span>
                    </div>
                )}
            </div>

            {/* Transporter */}
            <div className="hidden md:block min-w-0">
                {route.transporterName ? (
                    <span className="text-[12px] text-slate-400 truncate block">{route.transporterName}</span>
                ) : (
                    <span className="text-[11px] text-slate-700 italic">Unassigned</span>
                )}
            </div>

            {/* Package count + date */}
            <div className="hidden md:flex flex-col gap-1 min-w-0">
                {route.packageCount !== undefined && (
                    <div className="flex items-center gap-1.5">
                        <Package size={11} className="text-slate-600 shrink-0" />
                        <span className="text-[12px] text-slate-400">{route.packageCount} pkg{route.packageCount !== 1 ? "s" : ""}</span>
                    </div>
                )}
                <span className="text-[11px] text-slate-700">{fmt(route.createdAt)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-150">
                {onViewDetail && (
                    <ActionBtn title="View details" variant="emerald" onClick={onViewDetail} revealOnHover>
                        <ChevronRight size={13} />
                    </ActionBtn>
                )}
                {onToggleCancel && route.status !== "completed" && (
                    <ActionBtn
                        onClick={onToggleCancel}
                        title={route.status === "cancelled" ? "Restore route" : "Cancel route"}
                        variant={route.status === "cancelled" ? "emerald" : "red"}
                        revealOnHover
                    >
                        <Ban size={13} className={route.status === "cancelled" ? "text-emerald-400" : "text-rose-400"} />
                    </ActionBtn>
                )}
            </div>
        </div>
    );
};

export default RouteRow;
