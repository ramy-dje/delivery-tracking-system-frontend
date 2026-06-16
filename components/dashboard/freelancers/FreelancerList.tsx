"use client";

import { SkeletonList } from "@/components/commons/Skeleton";
import EmptyState from "@/components/commons/EmptyState";
import { UserCheck } from "lucide-react";
import FreelancerRow from "./FreelancerRow";
import { IFreelancerResponse } from "@/types/freelancer";
import { getUserRole } from "@/hooks/useAuth";

interface FreelancerListProps {
  freelancers: IFreelancerResponse[];
  loading?: boolean;
  onAddClick?: () => void;
  onViewDetail?: (id: string) => void;
  onEdit?: (freelancer: IFreelancerResponse) => void;
  onToggleStatus?: (freelancer: IFreelancerResponse) => void;
}

const tableStyle: React.CSSProperties = {
  background: "#060a10",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: 14,
  boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
};

export default function FreelancerList({
  freelancers,
  loading,
  onAddClick,
  onViewDetail,
  onEdit,
  onToggleStatus,
}: FreelancerListProps) {

  const userRole = getUserRole();
  const isAdmin = userRole === "admin";
  if (loading) return <div style={tableStyle}><SkeletonList rows={5} /></div>;

  if (freelancers.length === 0) {
    return (
      <div className="flex justify-center items-center" style={tableStyle}>
        <EmptyState
          title="No Freelancers yet"
          description="Add your first freelancer delivery agent to this branch."
          icon={UserCheck}
          actionLabel="+ Add Freelancer"
          tone="warning"
          onAction={onAddClick}
        />
      </div>
    );
  }

  const ListHeader = isAdmin ? (
    <div className="hidden md:grid grid-cols-[1fr_340px_200px_120px_100px] gap-4 px-5 py-2.5 border-b border-white/5" style={{ background: "rgba(255,255,255,0.015)" }}>
      {["Staff", "Contact", "Company", "Status", "Actions"].map((h, i) => (
        <div key={i} className="text-[9.5px] uppercase tracking-[0.14em] text-slate-800 font-semibold">
          {h}
        </div>
      ))}
    </div>
  ) : (
    <div className="hidden md:grid grid-cols-[1fr_340px_120px_100px] gap-4 px-5 py-2.5 border-b border-white/5" style={{ background: "rgba(255,255,255,0.015)" }}>
      {["Staff", "Contact", "Status", "Actions"].map((h, i) => (
        <div key={i} className="text-[9.5px] uppercase tracking-[0.14em] text-slate-800 font-semibold">
          {h}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex-1 min-h-0 overflow-auto" style={tableStyle}>
      {ListHeader}
      {freelancers.map((f, idx) => (
        <FreelancerRow
          key={f._id}
          freelancer={f}
          isLast={idx === freelancers.length - 1}
          onViewDetail={onViewDetail ? () => onViewDetail(f._id) : undefined}
          onEdit={onEdit ? () => onEdit(f) : undefined}
          onToggleStatus={onToggleStatus ? () => onToggleStatus(f) : undefined}
        />
      ))}
    </div>
  );
}
