"use client";

import { IBranchResponse } from "@/types/branch";
import { TYPE_META } from "./TypeMeta";
import TypeBadge from "./TypeBadge";
import { Edit, LocateIcon, Power } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import Link from "next/link";

// Status pill colours
const STATUS_STYLE: Record<
    string,
    { color: string; bg: string; border: string; dot: string }
> = {
    active: {
        color: "#22c55e",
        bg: "rgba(34,197,94,0.08)",
        border: "rgba(34,197,94,0.2)",
        dot: "#22c55e",
    },
    inactive: {
        color: "#94a3b8",
        bg: "rgba(148,163,184,0.06)",
        border: "rgba(148,163,184,0.15)",
        dot: "#475569",
    },
    maintenance: {
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.08)",
        border: "rgba(245,158,11,0.2)",
        dot: "#f59e0b",
    },
    pending: {
        color: "#818cf8",
        bg: "rgba(129,140,248,0.08)",
        border: "rgba(129,140,248,0.2)",
        dot: "#818cf8",
    },
};

function StatusPill({ status }: { status: string }) {
    const s = STATUS_STYLE[status] ?? STATUS_STYLE.inactive;
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold"
            style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
        >
            <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: s.dot }}
            />
            {status}
        </span>
    );
}

const BranchRow = ({
    branch,
    isLast,
    onEdit,
    onToggleBlock,
}: {
    branch: IBranchResponse;
    isLast: boolean;
    onEdit?: () => void;
    onToggleBlock?: () => void;
}) => {
    const m =
        TYPE_META[branch.branchType as keyof typeof TYPE_META] ??
        Object.values(TYPE_META)[1];

    // toggle-block only works on active/inactive — grey it out for maintenance/pending
    const canToggle = ["active", "inactive"].includes(branch.status);

    return (
        <div
            className={`
                group flex flex-col md:grid md:grid-cols-[1fr_270px_120px_120px_160px_auto]
                gap-3 md:gap-4 px-5 py-3.5 transition-all duration-150
                hover:bg-white/[0.018]
                ${!isLast ? "border-b border-white/4" : ""}
            `}
        >
            {/* Name */}
            <Link
                href={`/dashboard/branches/${branch._id ?? branch.id}`}
                className="flex items-center gap-3 min-w-0"
            >
                <div
                    className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[13px] font-bold transition-all duration-200 group-hover:scale-105"
                    style={{
                        background: m.bg,
                        color: m.text,
                        border: `1px solid ${m.border}`,
                    }}
                >
                    {m.icon}
                </div>
                <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold text-slate-100 truncate leading-tight">
                        {branch.name}
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono mt-0.5 truncate">
                        {branch.code}
                    </div>
                </div>
            </Link>

            {/* Location */}
            <div className="hidden md:flex items-center gap-1.5">
                <LocateIcon size={13} className="text-slate-700 shrink-0" />
                <span className="text-[12px] text-slate-500 truncate">
                    {branch.address?.state}
                    {branch.address?.city ? `, ${branch.address.city}` : ""}
                </span>
            </div>

            {/* Type */}
            <div className="hidden md:flex pl-5 items-center">
                <TypeBadge type={branch.branchType} />
            </div>



            {/* Status */}
            <div className="hidden md:flex pl-5 items-center">
                <StatusPill status={branch.status} />
            </div>

            {/* Created date */}
            <div className="hidden md:flex items-center pl-3 text-[11px] text-slate-600 tabular-nums">
                {new Date(branch.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 md:justify-end">
                <ActionBtn revealOnHover onClick={onEdit} title="Edit" variant="amber">
                    <Edit size={13} />
                </ActionBtn>
                <ActionBtn
                    revealOnHover
                    onClick={canToggle ? onToggleBlock : undefined}
                    title={
                        !canToggle
                            ? `Cannot toggle a branch in "${branch.status}" status`
                            : branch.status === "active"
                                ? "Deactivate"
                                : "Activate"
                    }
                    variant={branch.status === "active" ? "red" : "emerald"}
                    disabled={!canToggle}
                >
                    <Power size={13} />
                </ActionBtn>
            </div>
        </div>
    );
};

export default BranchRow;