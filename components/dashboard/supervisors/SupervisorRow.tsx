import { Eye, Phone, Power } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import RoleBadge from "@/components/commons/RoleBadge";
import { getInitials, getRoleMeta } from "../staffs/SatffRow";

export interface ISupervisorListItem {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  branchName?: string;
}

const SupervisorRow = ({
  supervisor,
  isLast,
  onViewDetail,
  onToggleStatus,
}: {
  supervisor: ISupervisorListItem;
  isLast: boolean;
  onViewDetail?: () => void;
  onToggleStatus?: () => void;
}) => {
  const isActive = supervisor.isActive !== false;
  const m = getRoleMeta(supervisor.role);

  return (
    <div
      className={`
        group grid grid-cols-[1fr_auto] md:grid-cols-[180px_1fr_140px_120px_auto]
        gap-4 px-5 py-4 items-center transition-all duration-150
        hover:bg-white/[0.025]
        ${!isActive ? "bg-red-500/[0.02]" : ""}
        ${!isLast ? "border-b border-white/[0.04]" : ""}
      `}
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0 transition-transform duration-150 group-hover:scale-[1.06]"
          style={{ background: m.bg, border: `1px solid ${m.border}`, color: m.color }}
        >
          {getInitials(supervisor.fullName)}
        </div>
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-slate-100 truncate leading-tight">
            {supervisor.fullName}
          </div>
          <div className="mt-1">
            <RoleBadge role={supervisor.role} />
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="hidden md:flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <svg className="shrink-0 opacity-40" width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#64748b" strokeWidth="1.5" />
            <polyline points="22,6 12,13 2,6" stroke="#64748b" strokeWidth="1.5" />
          </svg>
          <span className="text-[11.5px] text-slate-500 truncate">{supervisor.email}</span>
        </div>
        {supervisor.phoneNumber && (
          <div className="flex items-center gap-1.5 min-w-0">
            <svg className="shrink-0 opacity-40" width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 14.92z"
                stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-[12.5px] font-medium text-slate-300 truncate">{supervisor.phoneNumber}</span>
          </div>
        )}
      </div>

      {/* Branch */}
      <div className="hidden md:block min-w-0">
        {supervisor.branchName ? (
          <span className="text-[12px] text-slate-400 truncate">{supervisor.branchName}</span>
        ) : (
          <span className="text-[11px] text-slate-700 italic">No branch</span>
        )}
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
          {isActive ? "Active" : "Blocked"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-150">
        {onViewDetail && (
          <ActionBtn title="View details" variant="emerald" onClick={onViewDetail} revealOnHover>
            <Eye size={13} />
          </ActionBtn>
        )}
        {supervisor.phoneNumber && (
          <ActionBtn href={`tel:${supervisor.phoneNumber}`} title="Call" variant="sky" revealOnHover>
            <Phone size={13} />
          </ActionBtn>
        )}
        {onToggleStatus && (
          <ActionBtn
            onClick={onToggleStatus}
            title={isActive ? "Block supervisor" : "Unblock supervisor"}
            variant={isActive ? "red" : "emerald"}
            revealOnHover
          >
            <Power size={13} className={isActive ? "text-rose-400" : "text-emerald-400"} />
          </ActionBtn>
        )}
      </div>
    </div>
  );
};

export default SupervisorRow;
