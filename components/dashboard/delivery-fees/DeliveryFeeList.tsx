"use client";

import { SkeletonList } from "@/components/commons/Skeleton";
import { IDeliveryFeeSummary } from "@/types/deliveryFee";
import DeliveryFeeRow from "./DeliveryFeeRow";
import EmptyState from "@/components/commons/EmptyState";
import { Truck } from "lucide-react";

interface DeliveryFeeListProps {
    fees: IDeliveryFeeSummary[];
    loading?: boolean;
    onViewDetail?: (feeId: string) => void;
    onEdit?: (fee: IDeliveryFeeSummary) => void;
    onToggleStatus?: (fee: IDeliveryFeeSummary) => void;
    onAddClick?: () => void;
}

export default function DeliveryFeeList({
    fees,
    loading,
    onAddClick,
    onViewDetail,
    onEdit,
    onToggleStatus,
}: DeliveryFeeListProps) {
    const tableStyle: React.CSSProperties = {
        background: "#060a10",
        height: "100%",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
    };

    if (loading) return <div style={tableStyle}><SkeletonList rows={5} /></div>;

    if (fees.length === 0) {
        return (
            <div className="flex justify-center items-center" style={tableStyle}>
                <EmptyState
                    title="No Delivery Fees yet"
                    description="Define your first delivery fee by selecting origin/destination wilayas and fee details."
                    icon={Truck}
                    actionLabel="+ Add Delivery Fee"
                    tone="warning"
                    onAction={onAddClick}
                />
            </div>
        );
    }

    return (
        <div style={tableStyle}>
            <div
                className="hidden md:grid grid-cols-[200px_1fr_130px_120px_140px] gap-4 px-5 py-2.5 border-b border-white/5"
                style={{ background: "rgba(255,255,255,0.015)" }}
            >
                {["Route", "Pricing", "Weight", "Status", "Actions"].map((h, i) => (
                    <div key={i} className={`text-[9.5px] uppercase tracking-[0.14em] text-slate-800 font-semibold ${i === 4 ? "text-center" : "text-start"} `}>
                        {h}
                    </div>
                ))}
            </div>
            {fees.map((fee, idx) => (
                <DeliveryFeeRow
                    key={fee.id}
                    fee={fee}
                    isLast={idx === fees.length - 1}
                    onViewDetail={onViewDetail ? () => onViewDetail(fee.id) : undefined}
                    onEdit={onEdit ? () => onEdit(fee) : undefined}
                    onToggleStatus={onToggleStatus ? () => onToggleStatus(fee) : undefined}
                />
            ))}
        </div>
    );
}