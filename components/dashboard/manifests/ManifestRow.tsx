import { Eye, ArrowRight, Package } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import { IManifest, ManifestStatus } from "@/types/manifest";

// ── Status meta ────────────────────────────────────────────────────────────

type StatusMeta = {
    label: string;
    color: string;
    bg: string;
    border: string;
    dot: string;
    pulse: boolean;
};

export function getStatusMeta(status: ManifestStatus): StatusMeta {
    switch (status) {
        case "open":
            return { label: "Open", color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)", dot: "#60a5fa", pulse: false };
        case "sealed":
            return { label: "Sealed", color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)", dot: "#a78bfa", pulse: false };
        case "loaded":
            return { label: "Loaded", color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)", dot: "#fbbf24", pulse: false };
        case "in_transit":
            return { label: "In Transit", color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)", dot: "#34d399", pulse: true };
        case "arrived":
            return { label: "Arrived", color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)", dot: "#34d399", pulse: false };
        case "unloading":
            return { label: "Unloading", color: "#fb923c", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.2)", dot: "#fb923c", pulse: true };
        case "closed":
            return { label: "Closed", color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)", dot: "#64748b", pulse: false };
        case "discrepancy":
            return { label: "Discrepancy", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)", dot: "#f87171", pulse: true };
        case "cancelled":
            return { label: "Cancelled", color: "#64748b", bg: "rgba(100,116,139,0.06)", border: "rgba(100,116,139,0.15)", dot: "#475569", pulse: false };
        default:
            return { label: status, color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)", dot: "#94a3b8", pulse: false };
    }
}

function getManifestInitials(code: string): string {
    // e.g. "MNF-2024-0042" → "MF"
    const parts = code?.replace(/[^A-Z0-9]/gi, " ").trim().split(/\s+/);
    return parts?.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "MF";
}

// ── Component ──────────────────────────────────────────────────────────────

const ManifestRow = ({
    manifest,
    isLast,
    onView,
}: {
    manifest: IManifest;
    isLast: boolean;
    onView?: () => void;
}) => {
    const m = getStatusMeta(manifest.status);
    console.log("ManifestRow manifest:", manifest);

    const originName = manifest.originBranch.name ?? "Origin";

    const destName = manifest.destinationBranch.name ?? "Destination";

    const createdDate = manifest.createdAt
        ? new Date(manifest.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
        : "—";

    return (
        <div
            className={`
                group grid grid-cols-[1fr_auto] md:grid-cols-[160px_1fr_130px_120px_auto]
                gap-4 px-5 py-4 items-center transition-all duration-150
                hover:bg-white/2.5
                ${manifest.status === "cancelled" ? "opacity-60" : ""}
                ${!isLast ? "border-b border-white/4" : ""}
            `}
        >
            {/* Code + date */}
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0 transition-transform duration-150 group-hover:scale-[1.06]"
                    style={{
                        background: m.bg,
                        border: `1px solid ${m.border}`,
                        color: m.color,
                    }}
                >
                    {getManifestInitials(manifest.manifestCode)}
                </div>
                <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-slate-100 truncate leading-tight font-mono">
                        {manifest.manifestCode}
                    </div>
                    <div className="text-[10.5px] text-slate-600 mt-0.5">{createdDate}</div>
                </div>
            </div>

            {/* Route */}
            <div className="hidden md:flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[11px] text-slate-500 shrink-0">From</span>
                    <span className="text-[12px] font-medium text-slate-300 truncate">{originName}</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[11px] text-slate-500 shrink-0">To</span>
                    <span className="text-[12px] font-medium text-slate-300 truncate">{destName}</span>
                </div>
            </div>

            {/* Package count */}
            <div className="hidden md:flex items-center gap-2">
                <Package size={12} className="text-slate-600 shrink-0" />
                <span className="text-[12.5px] font-medium text-slate-400">
                    {manifest.packageCount ?? 0}{" "}
                    <span className="text-slate-600 text-[11px]">pkgs</span>
                </span>
                {manifest.totalDeclaredWeight > 0 && (
                    <span className="text-[10.5px] text-slate-700">
                        · {manifest.totalDeclaredWeight}kg
                    </span>
                )}
            </div>

            {/* Status badge */}
            <div className="hidden md:flex items-center gap-2">
                <span
                    className={`w-2 h-2 rounded-full shrink-0 ${m.pulse ? "animate-pulse" : ""}`}
                    style={{ background: m.dot, boxShadow: m.pulse ? `0 0 8px ${m.dot}99` : "none" }}
                />
                <span
                    className="text-[11.5px] font-medium px-2 py-0.5 rounded"
                    style={{ color: m.color, background: m.bg, border: `1px solid ${m.border}` }}
                >
                    {m.label}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-150">
                {onView && (
                    <ActionBtn
                        title="Open manifest"
                        variant="amber"
                        onClick={onView}
                        revealOnHover
                    >
                        <Eye size={13} />
                    </ActionBtn>
                )}
            </div>
        </div>
    );
};

export default ManifestRow;