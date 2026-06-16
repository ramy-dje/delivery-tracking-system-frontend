import { Eye, Phone, Power } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import { IFreelancerResponse } from "@/types/freelancer";
import RoleBadge from "@/components/commons/RoleBadge";
import { getUserRole } from "@/hooks/useAuth";
import { getRoleMeta } from "../staffs/SatffRow";

const FreelancerRow = ({
  freelancer,
  isLast,
  onViewDetail,
  onEdit,
  onToggleStatus,
}: {
  freelancer: IFreelancerResponse;
  isLast: boolean;
  onViewDetail?: () => void;
  onEdit?: () => void;
  onToggleStatus?: () => void;
}) => {
  const userRole = getUserRole();
  const isAdmin = userRole === "admin";

  const isActive = freelancer.status === "active";

  const roleBadge = getRoleMeta(freelancer.userId?.role || "");

  const initials =
    (freelancer?.userId?.firstName + " " + freelancer?.userId?.lastName)
      ?.split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";

  return (
    <div
      className={`
        group grid grid-cols-[1fr_auto]
        gap-4 px-5 py-4 items-center transition-all duration-150
        hover:bg-white/2.5
        ${!isActive ? "bg-red-500/2" : ""}
        ${!isLast ? "border-b border-white/4" : ""}
        ${isAdmin ? "md:grid-cols-[1fr_340px_200px_120px_100px]" : "md:grid-cols-[1fr_340px_120px_100px]"}
      `}
    >
      {/* ---------------- USER ---------------- */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0"
          style={{
            background: roleBadge.bg,
            border: `1px solid ${roleBadge.border}`,
            color: roleBadge.color,
          }}
        >
          {initials}
        </div>

        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-slate-100 truncate leading-tight">
            {freelancer.userId?.firstName} {freelancer.userId?.lastName}
          </div>

          <div className="mt-1">
            <RoleBadge role={freelancer.userId?.role} />
          </div>
        </div>
      </div>

      {/* ---------------- CONTACT ---------------- */}
      <div className="hidden md:flex flex-col gap-1.5 min-w-0">
        <span className="text-[11.5px] text-slate-500 truncate">
          {freelancer.userId?.email}
        </span>

        {freelancer.userId?.phone && (
          <span className="text-[12.5px] text-slate-300 truncate">
            {freelancer.userId.phone}
          </span>
        )}
      </div>

      {/* ---------------- COMPANY (ADMIN ONLY) ---------------- */}
      {isAdmin && <div className="hidden md:flex flex-col min-w-0">
        {freelancer.companyId ? (
          <>
            <span className="text-[11px] text-slate-500">Company</span>
            <span className="text-[12.5px] font-medium text-slate-200 truncate">
              {typeof freelancer.companyId === "object"
                ? freelancer.companyId.name
                : "Unknown"}
            </span>
          </>
        ) : (
          <span className="text-[11px] text-slate-600">
            {/* Branch context fallback */}
            {freelancer.defaultOriginBranchId?.name ?? "—"}
          </span>
        )}
      </div>}

      {/* ---------------- STATUS ---------------- */}
      <div className="hidden md:flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${isActive ? "animate-pulse" : ""
            }`}
          style={{
            background: isActive ? "#34d399" : "#64748b",
            boxShadow: isActive
              ? "0 0 8px rgba(52,211,153,0.6)"
              : "none",
          }}
        />
        <span
          className={`text-[12px] font-medium ${isActive ? "text-emerald-400" : "text-slate-500"
            }`}
        >
          {isActive ? "Active" : "Blocked"}
        </span>
      </div>

      {/* ---------------- ACTIONS ---------------- */}
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

        {freelancer.userId?.phone && (
          <ActionBtn
            href={`tel:${freelancer.userId.phone}`}
            title="Call"
            variant="sky"
            revealOnHover
          >
            <Phone size={13} />
          </ActionBtn>
        )}

        {!isAdmin && onToggleStatus && (
          <ActionBtn
            onClick={onToggleStatus}
            title={isActive ? "Block freelancer" : "Unblock freelancer"}
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

export default FreelancerRow;