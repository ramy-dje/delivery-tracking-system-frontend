"use client";

import { SkeletonList } from "@/components/commons/Skeleton";
import EmptyState from "@/components/commons/EmptyState";
import { Truck } from "lucide-react";
import TransporterRow from "./TransporterRow";
import { ITransporterResponse } from "@/types/transporter";

interface TransporterListProps {
  transporters: ITransporterResponse[];
  loading?: boolean;
  onAddClick?: () => void;
  onViewDetail?: (id: string) => void;
  onEdit?: (transporter: ITransporterResponse) => void;
  onToggleStatus?: (transporter: ITransporterResponse) => void;
}

const tableStyle: React.CSSProperties = {
  background: "#060a10",
  flex: 1,
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: 14,
  overflowY: "auto",
  boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
};

export default function TransporterList({
  transporters,
  loading,
  onAddClick,
  onViewDetail,
  onEdit,
  onToggleStatus,
}: TransporterListProps) {
  if (loading) return <div style={tableStyle}><SkeletonList rows={5} /></div>;

  if (transporters.length === 0) {
    return (
      <div className="flex justify-center items-center" style={tableStyle}>
        <EmptyState
          title="No Transporters yet"
          description="Add your first transporter to handle inter-branch routes."
          icon={Truck}
          actionLabel="+ Add Transporter"
          tone="warning"
          onAction={onAddClick}
        />
      </div>
    );
  }

  return (
    <div style={tableStyle}>
      <div
        className="hidden md:grid grid-cols-[180px_1fr_100px_120px_auto] gap-4 px-5 py-2.5 border-b border-white/5"
        style={{ background: "rgba(255,255,255,0.015)" }}
      >
        {["Staff", "Contact", "Online", "Status", ""].map((h, i) => (
          <div key={i} className="text-[9.5px] uppercase tracking-[0.14em] text-slate-800 font-semibold">
            {h}
          </div>
        ))}
      </div>
      {transporters.map((t, idx) => (
        <TransporterRow
          key={t.id}
          transporter={t}
          isLast={idx === transporters.length - 1}
          onViewDetail={onViewDetail ? () => onViewDetail(t.id) : undefined}
          onEdit={onEdit ? () => onEdit(t) : undefined}
          onToggleStatus={onToggleStatus ? () => onToggleStatus(t) : undefined}
        />
      ))}
    </div>
  );
}
