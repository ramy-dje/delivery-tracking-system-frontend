import { Eye, Pencil, Phone, Power } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import RoleBadge from "@/components/commons/RoleBadge";
import { getInitials, getRoleMeta } from "../staffs/SatffRow";
import { IDelivererResponse } from "@/types/driver";

const DriverRow = ({
    driver,
    isLast,
    onViewDetail,
    onEdit,
    onToggleStatus,
}: {
    driver: IDelivererResponse;
    isLast: boolean;
    onViewDetail?: () => void;
    onEdit?: () => void;
    onToggleStatus?: () => void;
}) => {
    const isActive = driver.isActive;
    const m = getRoleMeta(driver.userId?.role || "driver");
    const fullName = `${driver.userId?.firstName || ""} ${driver.userId?.lastName || ""}`.trim();
    const phoneNumber = driver.userId?.phone;

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
                    {getInitials(fullName)}
                </div>
                <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-slate-100 truncate leading-tight">
                        {fullName}
                    </div>
                    <div className="mt-1 flex gap-2 items-center">
                        <RoleBadge role={driver.userId?.role as any || "driver"} />
                        {driver.availabilityStatus !== 'available' && (
                            <span className="text-[10px] uppercase text-slate-400">
                                {driver.availabilityStatus.replace('_', ' ')}
                            </span>
                        )}
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
                    {phoneNumber ? (
                        <span className="text-[12.5px] font-medium text-slate-300 truncate">
                            {phoneNumber}
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
                    <span className="text-[11.5px] text-slate-500 truncate">{driver.userId?.email}</span>
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
                {onEdit && (
                    <ActionBtn title="Edit deliverer" variant="amber" onClick={onEdit} revealOnHover>
                        <Pencil size={13} className="text-amber-400" />
                    </ActionBtn>
                )}
                {phoneNumber && (
                    <ActionBtn
                        href={`tel:${phoneNumber}`}
                        title={`Call ${phoneNumber}`}
                        variant="sky"
                        revealOnHover
                    >
                        <Phone size={13} />
                    </ActionBtn>
                )}
                {onToggleStatus && (
                    <ActionBtn
                        onClick={onToggleStatus}
                        title={isActive ? "Deactivate driver" : "Activate driver"}
                        variant={isActive ? "red" : "emerald"}
                        revealOnHover
                    >
                        <Power size={13} className={isActive ? "text-rose-400" : "text-emerald-400"} />
                    </ActionBtn>
                )}
            </div>
        </div >
    );
}

export default DriverRow;