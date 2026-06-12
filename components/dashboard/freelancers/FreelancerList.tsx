"use client";

import { SkeletonList } from "@/components/commons/Skeleton";
import EmptyState from "@/components/commons/EmptyState";
import { UserCheck } from "lucide-react";
import FreelancerRow from "./FreelancerRow";
import { IFreelancerResponse } from "@/types/freelancer";

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
  height: "100%",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: 14,
  overflow: "hidden",
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

  return (
    <div style={tableStyle}>
      <div
        className="hidden md:grid grid-cols-[180px_1fr_120px_auto] gap-4 px-5 py-2.5 border-b border-white/5"
        style={{ background: "rgba(255,255,255,0.015)" }}
      >
        {["Staff", "Contact", "Status", ""].map((h, i) => (
          <div key={i} className="text-[9.5px] uppercase tracking-[0.14em] text-slate-800 font-semibold">
            {h}
          </div>
        ))}
      </div>
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
