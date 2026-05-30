"use client";

import { IManagerResponse } from "@/types/manager";
import { Eye, Phone, Trash2, User } from "lucide-react";
import EmptyState from "@/components/commons/EmptyState";
import { SkeletonList } from "@/components/commons/Skeleton";
import ActionBtn from "@/components/commons/ActionButton";

// ─── Constants ────────────────────────────────────────────────────────────

const AMBER = "#fbbf24";
const AMBER_BG = "rgba(251,191,36,0.09)";
const AMBER_BD = "rgba(251,191,36,0.22)";

function getInitials(name: string) {
    return name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");
}
// ─── Row ─────────────────────────────────────────────────────────────────

function ManagerRow({
    manager,
    isLast,
    onDelete,
    onViewDetail,
}: {
    manager: IManagerResponse;
    isLast: boolean;
    onDelete: () => void;
    onViewDetail?: () => void;
}) {
    return (
        <div
            className={`
                group grid grid-cols-[1fr_auto] md:grid-cols-[1fr_300px_200px_120px_120px]
                gap-4 px-5 py-3.5 items-center transition-all duration-150
                hover:bg-white/[0.018]
                ${!isLast ? "border-b border-white/4" : ""}
            `}
        >
            {/* ── Name ────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold shrink-0 transition-transform duration-150 group-hover:scale-[1.06]"
                    style={{ background: AMBER_BG, border: `1px solid ${AMBER_BD}`, color: AMBER }}
                >
                    {getInitials(manager.fullName)}
                </div>
                <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold text-slate-100 truncate leading-tight">
                        {manager.fullName}
                    </div>
                </div>
            </div>

            {/* ── Contact: phone + email ───────────────────────────────── */}
            <div className="hidden md:flex flex-col gap-1 min-w-0">
                {/* Phone */}
                <div className="flex items-center gap-1.5 min-w-0">
                    <svg className="shrink-0 opacity-40" width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 14.92z"
                            stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {manager.phoneNumber ? (
                        <span className="text-[12.5px] font-semibold text-slate-300 truncate">
                            {manager.phoneNumber}
                        </span>
                    ) : (
                        <span className="text-[11px] text-slate-800 italic">No phone</span>
                    )}
                </div>
                {/* Email */}
                <div className="flex items-center gap-1.5 min-w-0">
                    <svg className="shrink-0 opacity-40" width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                            stroke="#64748b" strokeWidth="1.5" />
                        <polyline points="22,6 12,13 2,6" stroke="#64748b" strokeWidth="1.5" />
                    </svg>
                    <span className="text-[11px] text-slate-600 truncate">{manager.email}</span>
                </div>
            </div>

            {/* ── Node ────────────────────────────────────────────────── */}
            <div className="hidden md:flex items-center min-w-0">
                {manager.logisticsNodeName ? (
                    <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg min-w-0 max-w-full"
                        style={{
                            background: "rgba(251,191,36,0.07)",
                            border: "1px solid rgba(251,191,36,0.18)",
                        }}
                    >
                        <svg className="shrink-0" width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                                stroke={AMBER} strokeWidth="1.6" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[12px] font-semibold truncate" style={{ color: AMBER }}>
                            {manager.logisticsNodeName}
                        </span>
                    </div>
                ) : (
                    <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold italic"
                        style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.05)",
                            color: "#334155",
                        }}
                    >
                        Unassigned
                    </span>
                )}
            </div>

            {/* Status dot */}
            <div className="hidden md:flex items-center gap-1.5">
                <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                        background: manager.isActive ? "#34d399" : "#475569",
                        boxShadow: manager.isActive ? "0 0 5px rgba(52,211,153,0.5)" : "none",
                    }}
                />
                <span className="text-[11px]" style={{ color: manager.isActive ? "#34d399" : "#475569" }}>
                    {manager.isActive ? "Active" : "Inactive"}
                </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 opacity-35 group-hover:opacity-100 transition-opacity duration-150">
                {onViewDetail && (

                    <ActionBtn revealOnHover onClick={onViewDetail} title="View Details" variant="slate">
                        <Eye size={13} />
                    </ActionBtn>
                )}
                {manager.phoneNumber && (


                    <ActionBtn
                        href={`tel:${manager.phoneNumber}`}
                        title={`Call ${manager.phoneNumber}`}
                        variant="sky"
                        revealOnHover
                    >
                        <Phone size={13} />
                    </ActionBtn>
                )}
                <ActionBtn revealOnHover onClick={onDelete} title="Remove manager" variant="red">
                    <Trash2 size={13} />
                </ActionBtn>
            </div>

        </div>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────

interface ManagerListProps {
    managers: IManagerResponse[];
    loading?: boolean;
    onDelete: (m: IManagerResponse) => void;
    onAddClick?: () => void;
    onViewDetail?: (managerId: string) => void;
}

// ─── Export ───────────────────────────────────────────────────────────────

export default function ManagerList({
    managers,
    loading,
    onDelete,
    onAddClick,
    onViewDetail,
}: ManagerListProps) {
    const tableStyle: React.CSSProperties = {
        background: "#060a10",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
    };

    if (loading) return <div style={tableStyle}><SkeletonList rows={5} /></div>;

    if (managers.length === 0) {
        return (
            <div style={tableStyle}>
                <EmptyState
                    title="No managers yet"
                    description="Add your first manager and assign them to a logistics node."
                    icon={User}
                    actionLabel="+ Add Manager"
                    tone="warning"
                    onAction={onAddClick}
                />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto" style={tableStyle}>
            {/* Column headers */}
            <div
                className="hidden md:grid grid-cols-[1fr_300px_200px_120px_120px] gap-4 px-5 py-2.5 border-b border-white/5"
                style={{ background: "rgba(255,255,255,0.015)" }}
            >
                {["Manager", "Contact", "Node", "Status", "Actions"].map((h, i) => (
                    <div key={i} className="text-[9.5px] uppercase tracking-[0.14em] text-slate-800 font-semibold">
                        {h}
                    </div>
                ))}
            </div>

            {managers.map((m, idx) => (
                <ManagerRow
                    key={m.id}
                    manager={m}
                    isLast={idx === managers.length - 1}
                    onDelete={() => onDelete(m)}
                    onViewDetail={onViewDetail ? () => onViewDetail(m.id) : undefined}
                />
            ))}
        </div>
    );
}