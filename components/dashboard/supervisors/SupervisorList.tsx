"use client";

import { SkeletonList } from "@/components/commons/Skeleton";
import EmptyState from "@/components/commons/EmptyState";
import { ShieldCheck } from "lucide-react";
import SupervisorRow, { ISupervisorListItem } from "./SupervisorRow";

interface SupervisorListProps {
  supervisors: ISupervisorListItem[];
  loading?: boolean;
  onAddClick?: () => void;
  onViewDetail?: (id: string) => void;
  onToggleStatus?: (supervisor: ISupervisorListItem) => void;
}

const tableStyle: React.CSSProperties = {
  background: "#060a10",
  height: "100%",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: 14,
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
};

export default function SupervisorList({
  supervisors,
  loading,
  onAddClick,
  onViewDetail,
  onToggleStatus,
}: SupervisorListProps) {
  if (loading) return <div style={tableStyle}><SkeletonList rows={5} /></div>;

  if (supervisors.length === 0) {
    return (
      <div className="flex justify-center items-center" style={tableStyle}>
        <EmptyState
          title="No Supervisors yet"
          description="Add your first shift supervisor and assign them to a branch."
          icon={ShieldCheck}
          actionLabel="+ Add Supervisor"
          tone="warning"
          onAction={onAddClick}
        />
      </div>
    );
  }

  return (
    <div style={tableStyle}>
      <div
        className="hidden md:grid grid-cols-[180px_1fr_140px_120px_auto] gap-4 px-5 py-2.5 border-b border-white/5"
        style={{ background: "rgba(255,255,255,0.015)" }}
      >
        {["Staff", "Contact", "Branch", "Status", ""].map((h, i) => (
          <div key={i} className="text-[9.5px] uppercase tracking-[0.14em] text-slate-800 font-semibold">
            {h}
          </div>
        ))}
      </div>
      {supervisors.map((s, idx) => (
        <SupervisorRow
          key={s.id}
          supervisor={s}
          isLast={idx === supervisors.length - 1}
          onViewDetail={onViewDetail ? () => onViewDetail(s.id) : undefined}
          onToggleStatus={onToggleStatus ? () => onToggleStatus(s) : undefined}
        />
      ))}
    </div>
  );
}
