import { IStaffResponse } from "@/types/staff";
import { Eye, Phone, Power } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import RoleBadge from "@/components/commons/RoleBadge";



export const ROLE_META: Record<string, { color: string; bg: string; border: string }> = {
    Driver: { color: "#22d3ee", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.22)" },
    TruckDriver: { color: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.22)" },
    LeadDriver: { color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.22)" },
    Sorter: { color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.22)" },
    Receptionist: { color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.22)" },
    InventoryAuditor: { color: "#fb7185", bg: "rgba(251,113,133,0.08)", border: "rgba(251,113,133,0.22)" },
    ShiftSupervisor: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.22)" },
    SecurityOfficer: { color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.22)" },
};

export const FALLBACK_META = { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)" };



export function getRoleMeta(role: string) { return ROLE_META[role] ?? FALLBACK_META; }
export function getRoleLabel(role: string) { return role.replace(/([A-Z])/g, " $1").trim(); }
export function getInitials(name: string) {
    return name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");
}

const StaffRow = ({
    staff,
    isLast,
    onViewDetail,
    onToggleStatus,  // renamed from onDelete
}: {
    staff: IStaffResponse;
    isLast: boolean;
    onViewDetail?: () => void;
    onToggleStatus?: () => void;  // renamed from onDelete
}) => {
    const isActive = staff.isActive !== false;
    const m = getRoleMeta(staff.role);

    return (
        <div
            className={`
                group grid grid-cols-[1fr_auto] md:grid-cols-[180px_1fr_120px_auto]
                gap-4 px-5 py-4 items-center transition-all duration-150
                hover:bg-white/2.5
                ${!isActive ? "bg-red-500/2" : ""}
                ${!isLast ? "border-b border-white/4" : ""}
            `}
        >
            {/* Name + role badge */}
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0 transition-transform duration-150 group-hover:scale-[1.06]"
                    style={{ background: m.bg, border: `1px solid ${m.border}`, color: m.color }}
                >
                    {getInitials(staff.fullName)}
                </div>
                <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-slate-100 truncate leading-tight">
                        {staff.fullName}
                    </div>
                    <div className="mt-1">
                        <RoleBadge role={staff.role} />
                    </div>
                </div>
            </div>

            {/* Contact: phone + email */}
            <div className="hidden md:flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                    <svg className="shrink-0 opacity-40" width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 14.92z"
                            stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {(staff as any).phoneNumber ? (
                        <span className="text-[12.5px] font-medium text-slate-300 truncate">
                            {(staff as any).phoneNumber}
                        </span>
                    ) : (
                        <span className="text-[11px] text-slate-600 italic">No phone</span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                    <svg className="shrink-0 opacity-40" width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#64748b" strokeWidth="1.5" />
                        <polyline points="22,6 12,13 2,6" stroke="#64748b" strokeWidth="1.5" />
                    </svg>
                    <span className="text-[11.5px] text-slate-500 truncate">{staff.email}</span>
                </div>
            </div>

            {/* Status - now more prominent */}
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

            {/* Actions - updated: Power icon for toggle */}
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
                {(staff as any).phoneNumber && (
                    <ActionBtn
                        href={`tel:${(staff as any).phoneNumber}`}
                        title={`Call ${(staff as any).phoneNumber}`}
                        variant="sky"
                        revealOnHover
                    >
                        <Phone size={13} />
                    </ActionBtn>
                )}
                {onToggleStatus && (
                    <ActionBtn
                        onClick={onToggleStatus}
                        title={isActive ? "Deactivate staff" : "Activate staff"}
                        variant={isActive ? "red" : "emerald"}
                        revealOnHover
                    >
                        <Power size={13} />
                    </ActionBtn>
                )}
            </div>
        </div >
    );
}

export default StaffRow;