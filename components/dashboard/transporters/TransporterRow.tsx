import { Eye, Pencil, Phone, Power } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import RoleBadge from "@/components/commons/RoleBadge";
import { getInitials, getRoleMeta } from "../staffs/SatffRow";
import { ITransporterResponse } from "@/types/transporter";

const TransporterRow = ({
  transporter,
  isLast,
  onViewDetail,
  onEdit,
  onToggleStatus,
}: {
  transporter: ITransporterResponse;
  isLast: boolean;
  onViewDetail?: () => void;
  onEdit?: () => void;
  onToggleStatus?: () => void;
}) => {
  const isActive = transporter.isActive !== false;
  const m = getRoleMeta(transporter.role);

  return (
    <div
      className={`
        group grid grid-cols-[1fr_auto] md:grid-cols-[180px_1fr_100px_120px_auto]
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
          {getInitials(transporter.fullName)}
        </div>
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-slate-100 truncate leading-tight">
            {transporter.fullName}
          </div>
          <div className="mt-1">
            <RoleBadge role={transporter.role} />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="hidden md:flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <svg className="shrink-0 opacity-40" width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#64748b" strokeWidth="1.5" />
            <polyline points="22,6 12,13 2,6" stroke="#64748b" strokeWidth="1.5" />
          </svg>
          <span className="text-[11.5px] text-slate-500 truncate">{transporter.email}</span>
        </div>
        {transporter.phone && (
          <div className="flex items-center gap-1.5 min-w-0" title={transporter.phone}>
            <Phone size={13} className="text-slate-500 shrink-0" />
            <span className="text-[12.5px] font-medium text-slate-300 truncate">{transporter.phone}</span>
          </div>
        )}
      </div>

      {/* Online indicator */}
      <div className="hidden md:flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            background: transporter.isOnline ? "#22d3ee" : "#334155",
            boxShadow: transporter.isOnline ? "0 0 8px rgba(34,211,238,0.6)" : "none",
          }}
        />
        <span className={`text-[11px] font-medium ${transporter.isOnline ? "text-cyan-400" : "text-slate-600"}`}>
          {transporter.isOnline ? "Online" : "Offline"}
        </span>
      </div>

      {/* Active status */}
      <div className="hidden md:flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${isActive ? "animate-pulse" : ""}`}
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
        {onEdit && (
          <ActionBtn title="Edit transporter" variant="amber" onClick={onEdit} revealOnHover>
            <Pencil size={13} className="text-amber-400" />
          </ActionBtn>
        )}
        {transporter.phone && (
          <ActionBtn href={`tel:${transporter.phone}`} title="Call" variant="sky" revealOnHover>
            <Phone size={13} strokeWidth={2.5} />
          </ActionBtn>
        )}
        {onToggleStatus && (
          <ActionBtn
            onClick={onToggleStatus}
            title={isActive ? "Block transporter" : "Unblock transporter"}
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

export default TransporterRow;
