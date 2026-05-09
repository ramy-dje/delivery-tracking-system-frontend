import { Eye, Phone, Power } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import RoleBadge from "@/components/commons/RoleBadge";
import { getInitials, getRoleMeta } from "../staffs/SatffRow";
import { IDriverResponse } from "@/types/driver";


const DriverRow = ({
    driver,
    isLast,
    onViewDetail,
    onToggleStatus,
}: {
    driver: IDriverResponse;
    isLast: boolean;
    onViewDetail?: () => void;
    onToggleStatus?: () => void;
}) => {
    const isActive = driver.isActive !== false;
    const m = getRoleMeta(driver.role);

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
                    {getInitials(driver.fullName)}
                </div>
                <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-slate-100 truncate leading-tight">
                        {driver.fullName}
                    </div>
                    <div className="mt-1">
                        <RoleBadge role={driver.role} />
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
                    {driver?.phoneNumber ? (
                        <span className="text-[12.5px] font-medium text-slate-300 truncate">
                            {(driver as any).phoneNumber}
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
                    <span className="text-[11.5px] text-slate-500 truncate">{driver.email}</span>
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
                {driver.phoneNumber && (
                    <ActionBtn
                        href={`tel:${driver.phoneNumber}`}
                        title={`Call ${driver.phoneNumber}`}
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
                        <Power size={13} className={isActive ? "text-rose-400" : "text-emerald-400"} />
                    </ActionBtn>
                )}
            </div>
        </div >
    );
}

export default DriverRow;